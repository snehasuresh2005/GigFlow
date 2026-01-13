import mongoose from 'mongoose';
import User from './models/User.js';
import Gig from './models/Gig.js';
import Bid from './models/Bid.js';
import dotenv from 'dotenv';


dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the freelancer user
        const freelancer = await User.findOne({ email: 'freelancer@test.com' });
        if (!freelancer) {
            console.log('Freelancer not found. Run reproduction script first.');
            return;
        }

        // We will reuse the actual route logic but running it manually against DB
        // Or we can construct a query identical to the route

        console.log('Testing query for user:', freelancer._id);

        const userBids = await Bid.find({
            freelancerId: freelancer._id
        })
            .populate({
                path: 'gigId',
                populate: {
                    path: 'ownerId',
                    select: 'name email'
                }
            })
            .populate('freelancerId', 'name email')
            .sort({ createdAt: -1 });

        if (userBids.length === 0) {
            console.log('No bids found for this user.');
        } else {
            const firstBid = userBids[0];
            console.log('Found Bid for Gig:', firstBid.gigId.title);

            if (firstBid.gigId.ownerId && firstBid.gigId.ownerId.name) {
                console.log('SUCCESS: Owner Name found:', firstBid.gigId.ownerId.name);
            } else {
                console.error('FAILURE: Owner Name NOT found in populated data.');
                console.log('OwnerId value:', firstBid.gigId.ownerId);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
