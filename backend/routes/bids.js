import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Submit a bid
router.post('/', protect, [
  body('gigId').notEmpty().withMessage('Gig ID is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { gigId, message, price } = req.body;

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Gig is no longer open for bidding' });
    }

    // Check if user is the owner
    if (gig.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot bid on your own gig' });
    }

    // Check if user already bid on this gig
    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user._id
    });

    if (existingBid) {
      return res.status(400).json({ message: 'You have already bid on this gig' });
    }

    // Check if user has reached the maximum limit of 3 bids
    const userBidsCount = await Bid.countDocuments({ freelancerId: req.user._id });
    if (userBidsCount >= 3) {
      return res.status(400).json({ 
        message: 'You have reached the maximum limit of 3 bids. You cannot submit more bids.' 
      });
    }

    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message,
      price
    });

    const populatedBid = await Bid.findById(bid._id)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title');

    // Emit real-time notification to gig owner via Socket.io
    const io = req.app.get('io');
    if (io) {
      // Get gig owner ID
      const gig = await Gig.findById(gigId).select('ownerId title');
      if (gig) {
        io.emit('newBid', {
          gigId: gigId.toString(),
          ownerId: gig.ownerId.toString(),
          bid: {
            _id: populatedBid._id,
            freelancerId: {
              _id: populatedBid.freelancerId._id,
              name: populatedBid.freelancerId.name,
              email: populatedBid.freelancerId.email
            },
            message: populatedBid.message,
            price: populatedBid.price,
            status: populatedBid.status,
            createdAt: populatedBid.createdAt
          },
          gigTitle: gig.title,
          message: `New bid received for "${gig.title}" from ${populatedBid.freelancerId.name}`
        });
      }
    }

    res.status(201).json(populatedBid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all bids for a specific gig (Owner only)
router.get('/:gigId', protect, async (req, res) => {
  try {
    const { gigId } = req.params;

    // Check if gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if user is the owner
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the gig owner can view bids' });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Hire a freelancer - Atomic operation with race condition prevention
 * 
 * This endpoint uses MongoDB transactions combined with atomic findOneAndUpdate operations
 * to prevent race conditions when multiple users try to hire freelancers simultaneously.
 * 
 * Race Condition Prevention Strategy:
 * 1. All operations are wrapped in a MongoDB transaction for atomicity
 * 2. Critical updates use findOneAndUpdate with conditions that check current state
 * 3. If two requests arrive simultaneously:
 *    - First request: Finds gig.status='open', updates to 'assigned' ✓
 *    - Second request: Finds gig.status='assigned' (already changed), update fails ✓
 * 4. Returns 409 Conflict if another transaction already processed the hire
 * 
 * This ensures only ONE hire succeeds even if multiple admins click "Hire" simultaneously.
 */
router.patch('/:bidId/hire', protect, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { bidId } = req.params;

    // Start transaction
    session.startTransaction();

    // Step 1: Find the bid WITHIN transaction and lock it
    const bid = await Bid.findById(bidId).session(session);
    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Step 2: Find the gig WITHIN transaction and lock it
    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Step 3: Verify ownership
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Only the gig owner can hire freelancers' });
    }

    // Step 4: Check if freelancer already has 3 active gigs (within transaction)
    const activeGigsCount = await Bid.countDocuments({
      freelancerId: bid.freelancerId,
      status: 'hired'
    }).session(session);

    if (activeGigsCount >= 3) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'This freelancer already has 3 active gigs. They cannot be hired for more gigs simultaneously.' 
      });
    }

    // Step 5: ATOMIC OPERATION - Update gig status ONLY if still 'open'
    // This is the critical atomic check that prevents race conditions
    const updatedGig = await Gig.findOneAndUpdate(
      {
        _id: gig._id,
        status: 'open'  // Only update if status is still 'open'
      },
      { 
        status: 'assigned',
        assignedAt: new Date()  // Track when it was assigned
      },
      { 
        session,
        new: true,  // Return updated document
        runValidators: true
      }
    );

    // If gig wasn't updated, it means another transaction already changed it
    if (!updatedGig) {
      await session.abortTransaction();
      return res.status(409).json({ 
        message: 'This gig has already been assigned to another freelancer. Please refresh the page.' 
      });
    }

    // Step 6: ATOMIC OPERATION - Update bid status ONLY if still 'pending'
    // This ensures we don't hire a bid that was already processed
    const updatedBid = await Bid.findOneAndUpdate(
      {
        _id: bidId,
        status: 'pending',  // Only update if status is still 'pending'
        gigId: gig._id      // Ensure bid belongs to this gig
      },
      { status: 'hired' },
      {
        session,
        new: true,
        runValidators: true
      }
    );

    // If bid wasn't updated, it means another transaction already processed it
    if (!updatedBid) {
      await session.abortTransaction();
      return res.status(409).json({ 
        message: 'This bid has already been processed. Please refresh the page.' 
      });
    }

    // Step 7: Reject all other pending bids for this gig (atomic operation)
    const rejectResult = await Bid.updateMany(
      {
        gigId: gig._id,
        _id: { $ne: bidId },
        status: 'pending'  // Only reject pending bids
      },
      { 
        status: 'rejected',
        rejectedAt: new Date()
      },
      { 
        session 
      }
    );

    // Commit all changes atomically
    await session.commitTransaction();

    // Step 8: After successful transaction, fetch populated data (outside transaction)
    const populatedBid = await Bid.findById(bidId)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title');

    // Step 9: Create notification (outside transaction for better performance)
    try {
      await Notification.create({
        userId: bid.freelancerId,
        type: 'hired',
        message: `Congratulations! You have been hired for "${gig.title}"`,
        gigId: gig._id,
        bidId: bid._id
      });
    } catch (notifError) {
      // Log error but don't fail the request
      console.error('Failed to create notification:', notifError);
    }

    // Step 10: Emit real-time notification via Socket.io to specific freelancer
    const io = req.app.get('io');
    if (io) {
      const freelancerId = bid.freelancerId.toString();
      const freelancerRoom = `user:${freelancerId}`;
      
      // Emit to the specific freelancer's room with the exact message format requested
      io.to(freelancerRoom).emit('bidHired', {
        bidId: bid._id,
        freelancerId: freelancerId,
        gigId: gig._id.toString(),
        gigTitle: gig.title,
        message: `You have been hired for "${gig.title}"!`, // Exact format: "You have been hired for [Project Name]!"
        timestamp: new Date().toISOString()
      });
      
      console.log(`Notification sent to freelancer ${freelancerId} in room ${freelancerRoom}`);
    }

    res.json({
      message: 'Freelancer hired successfully',
      bid: populatedBid,
      rejectedBidsCount: rejectResult.modifiedCount
    });
  } catch (error) {
    // Abort transaction on any error
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    
    // Handle specific MongoDB errors
    if (error.name === 'WriteConflict') {
      return res.status(409).json({ 
        message: 'A conflict occurred. Another user may have hired a freelancer for this gig. Please refresh and try again.' 
      });
    }
    
    console.error('Hire error:', error);
    res.status(500).json({ 
      message: error.message || 'An error occurred while hiring the freelancer' 
    });
  } finally {
    // Always end the session
    await session.endSession();
  }
});

export default router;
