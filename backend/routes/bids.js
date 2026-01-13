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
  const { bidId } = req.params;

  // Define the core hire logic to be reusable
  const executeHireOperation = async (session) => {
    // Helper for queries to attach session if waiting
    const withSession = (query) => session ? query.session(session) : query;

    // Step 1: Find the bid
    const bid = await withSession(Bid.findById(bidId));
    if (!bid) {
      return { error: true, status: 404, message: 'Bid not found' };
    }

    // Step 2: Find the gig
    const gig = await withSession(Gig.findById(bid.gigId));
    if (!gig) {
      return { error: true, status: 404, message: 'Gig not found' };
    }

    // Step 3: Verify ownership
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return { error: true, status: 403, message: 'Only the gig owner can hire freelancers' };
    }

    // Step 4: Check if freelancer already has 3 active gigs
    const activeGigsCount = await withSession(Bid.countDocuments({
      freelancerId: bid.freelancerId,
      status: 'hired'
    }));

    if (activeGigsCount >= 3) {
      return {
        error: true,
        status: 400,
        message: 'This freelancer already has 3 active gigs. They cannot be hired for more gigs simultaneously.'
      };
    }

    // Step 5: ATOMIC OPERATION - Update gig status ONLY if still 'open'
    const updatedGig = await withSession(Gig.findOneAndUpdate(
      {
        _id: gig._id,
        status: 'open'
      },
      {
        status: 'assigned',
        assignedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    ));

    if (!updatedGig) {
      return {
        error: true,
        status: 409,
        message: 'This gig has already been assigned to another freelancer. Please refresh the page.'
      };
    }

    // Step 6: ATOMIC OPERATION - Update bid status ONLY if still 'pending'
    const updatedBid = await withSession(Bid.findOneAndUpdate(
      {
        _id: bidId,
        status: 'pending',
        gigId: gig._id
      },
      { status: 'hired' },
      {
        new: true,
        runValidators: true
      }
    ));

    if (!updatedBid) {
      // Rollback gig update if we can't update bid (only matters if no transaction)
      // If transaction exists, it will abort automatically.
      // If no transaction, we manually try to revert gig status (best effort)
      if (!session) {
        await Gig.findByIdAndUpdate(gig._id, { status: 'open', $unset: { assignedAt: 1 } });
      }
      return {
        error: true,
        status: 409,
        message: 'This bid has already been processed. Please refresh the page.'
      };
    }

    // Step 7: Reject all other pending bids for this gig
    const rejectResult = await withSession(Bid.updateMany(
      {
        gigId: gig._id,
        _id: { $ne: bidId },
        status: 'pending'
      },
      {
        status: 'rejected',
        rejectedAt: new Date()
      }
    ));

    return {
      success: true,
      data: {
        bid: updatedBid,
        gig: updatedGig,
        rejectedCount: rejectResult.modifiedCount,
        freelancerId: bid.freelancerId,
        gigOwnerId: gig.ownerId,
        gigTitle: gig.title
      }
    };
  };

  // Main execution flow
  let session = null;
  try {
    // Try with transaction first
    session = await mongoose.startSession();
    session.startTransaction();

    const result = await executeHireOperation(session);

    if (result.error) {
      await session.abortTransaction();
      return res.status(result.status).json({ message: result.message });
    }

    await session.commitTransaction();

    // Continue nicely to notifications
    finalizeHire(req, res, result.data);

  } catch (error) {
    if (session) await session.abortTransaction();

    // Check for standalone MongoDB error (Transaction specific)
    const isTransactionError = error.code === 20 ||
      error.codeName === 'IllegalOperation' ||
      (error.message && error.message.includes('Transaction numbers are only allowed on a replica set member'));

    if (isTransactionError) {
      console.warn('⚠️ MongoDB Transaction failed (Standalone Mode). Falling back to non-transactional update.');

      try {
        // Retry without session
        const result = await executeHireOperation(null);

        if (result.error) {
          return res.status(result.status).json({ message: result.message });
        }

        finalizeHire(req, res, result.data);
      } catch (retryError) {
        console.error('Fallback hire error:', retryError);
        return res.status(500).json({ message: retryError.message });
      }
    } else {
      console.error('Hire error:', error);
      // Handle write conflict specially
      if (error.name === 'WriteConflict') {
        return res.status(409).json({
          message: 'A conflict occurred. Another user may have hired a freelancer for this gig. Please refresh and try again.'
        });
      }
      return res.status(500).json({ message: error.message });
    }
  } finally {
    if (session) session.endSession();
  }
});

// Helper to handle post-hire notifications (Socket & DB)
async function finalizeHire(req, res, data) {
  const { bid, gig, rejectedCount, freelancerId, gigOwnerId, gigTitle } = data;

  // Fetch populated bid for response
  const populatedBid = await Bid.findById(bid._id)
    .populate('freelancerId', 'name email')
    .populate('gigId', 'title');

  // Create notification
  try {
    await Notification.create({
      userId: freelancerId,
      type: 'hired',
      message: `Congratulations! You have been hired for "${gigTitle}"`,
      gigId: gig._id,
      bidId: bid._id
    });
  } catch (notifError) {
    console.error('Failed to create notification:', notifError);
  }

  // Socket.io updates
  const io = req.app.get('io');
  if (io) {
    const fId = freelancerId.toString();
    const freelancerRoom = `user:${fId}`;
    const ownerRoom = `user:${gigOwnerId.toString()}`;

    io.to(freelancerRoom).emit('bidHired', {
      bidId: bid._id,
      freelancerId: fId,
      gigId: gig._id.toString(),
      gigTitle: gigTitle,
      message: `You have been hired for "${gigTitle}"!`,
      timestamp: new Date().toISOString()
    });

    io.to(ownerRoom).emit('gigAssigned', {
      gigId: gig._id.toString(),
      gigTitle: gigTitle,
      freelancerName: populatedBid.freelancerId.name,
      message: `You have hired ${populatedBid.freelancerId.name} for "${gigTitle}"`
    });
  }

  res.json({
    message: 'Freelancer hired successfully',
    bid: populatedBid,
    rejectedBidsCount: rejectedCount
  });
}

export default router;
