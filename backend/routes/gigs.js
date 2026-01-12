import express from 'express';
import { body, validationResult } from 'express-validator';
import Gig from '../models/Gig.js';
import Bid from '../models/Bid.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all open gigs (with search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const query = { status: 'open' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new gig
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('budget').isFloat({ min: 0 }).withMessage('Budget must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user has reached the maximum limit of 3 gigs
    const userGigsCount = await Gig.countDocuments({ ownerId: req.user._id });
    if (userGigsCount >= 3) {
      return res.status(400).json({ 
        message: 'You have reached the maximum limit of 3 gigs. Please delete an existing gig before creating a new one.' 
      });
    }

    const { title, description, budget } = req.body;

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user._id
    });

    const populatedGig = await Gig.findById(gig._id).populate('ownerId', 'name email');

    res.status(201).json(populatedGig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's own gigs (requires authentication)
router.get('/my-gigs', protect, async (req, res) => {
  try {
    const gigs = await Gig.find({ ownerId: req.user._id })
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's active gigs (all gigs where user has submitted bids)
router.get('/my-active-gigs', protect, async (req, res) => {
  try {
    // Find all bids by the user (hired, pending, rejected)
    const userBids = await Bid.find({
      freelancerId: req.user._id
    })
      .populate('gigId')
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    // Extract gigs from bids with bid information
    const gigs = userBids.map(bid => ({
      ...bid.gigId.toObject(),
      bid: {
        _id: bid._id,
        message: bid.message,
        price: bid.price,
        status: bid.status,
        createdAt: bid.createdAt,
        rejectedAt: bid.rejectedAt
      }
    }));

    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single gig
router.get('/:id', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('ownerId', 'name email');
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    res.json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
