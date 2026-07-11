import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Lead from './models/Lead.js';

dotenv.config();

const seed = async (): Promise<void> => {
  await mongoose.connect(process.env.MONGODB_URI!);

  await Lead.deleteMany({});
  await User.deleteMany({});

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@gigflow.com',
    password: 'admin123',
    role: 'admin'
  });

  const sales = await User.create({
    name: 'Sales User',
    email: 'sales@gigflow.com',
    password: 'sales123',
    role: 'sales'
  });

  const sampleLeads = [
    { name: 'Rahul Sharma', email: 'rahul@example.com', status: 'Qualified' as const, source: 'Instagram' as const },
    { name: 'Priya Patel', email: 'priya@example.com', status: 'New' as const, source: 'Website' as const },
    { name: 'Amit Kumar', email: 'amit@example.com', status: 'Contacted' as const, source: 'Referral' as const },
    { name: 'Sneha Reddy', email: 'sneha@example.com', status: 'Lost' as const, source: 'Website' as const },
    { name: 'Vikram Singh', email: 'vikram@example.com', status: 'Qualified' as const, source: 'Referral' as const },
    { name: 'Ananya Iyer', email: 'ananya@example.com', status: 'New' as const, source: 'Instagram' as const },
    { name: 'Rohan Mehta', email: 'rohan@example.com', status: 'Contacted' as const, source: 'Website' as const },
    { name: 'Kavya Nair', email: 'kavya@example.com', status: 'Qualified' as const, source: 'Instagram' as const },
    { name: 'Arjun Das', email: 'arjun@example.com', status: 'New' as const, source: 'Referral' as const },
    { name: 'Meera Joshi', email: 'meera@example.com', status: 'Contacted' as const, source: 'Website' as const },
    { name: 'Rahul Verma', email: 'rahul.verma@example.com', status: 'New' as const, source: 'Instagram' as const },
    { name: 'Deepak Rao', email: 'deepak@example.com', status: 'Lost' as const, source: 'Referral' as const },
    { name: 'Nisha Gupta', email: 'nisha@example.com', status: 'Qualified' as const, source: 'Website' as const },
    { name: 'Karan Joshi', email: 'karan@example.com', status: 'New' as const, source: 'Instagram' as const },
    { name: 'Maya Desai', email: 'maya@example.com', status: 'Contacted' as const, source: 'Referral' as const },
    { name: 'Sameer Khan', email: 'sameer@example.com', status: 'Qualified' as const, source: 'Website' as const },
    { name: 'Isha Patel', email: 'isha@example.com', status: 'New' as const, source: 'Referral' as const },
    { name: 'Naveen Bhat', email: 'naveen@example.com', status: 'Contacted' as const, source: 'Instagram' as const },
    { name: 'Tara Mukherjee', email: 'tara@example.com', status: 'Lost' as const, source: 'Website' as const },
    { name: 'Devansh Shah', email: 'devansh@example.com', status: 'Qualified' as const, source: 'Referral' as const },
    { name: 'Anjali Rao', email: 'anjali@example.com', status: 'New' as const, source: 'Website' as const },
    { name: 'Kunal Malhotra', email: 'kunal@example.com', status: 'Contacted' as const, source: 'Instagram' as const },
    { name: 'Megha Kapoor', email: 'megha@example.com', status: 'Qualified' as const, source: 'Referral' as const }
  ];

  for (const lead of sampleLeads) {
    await Lead.create({ ...lead, createdBy: Math.random() > 0.5 ? admin._id : sales._id });
  }

  console.log('Seed completed with sample gigs');
  console.log('Admin: admin@gigflow.com (password admin123)');
  console.log('Sales: sales@gigflow.com (password sales123)');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
