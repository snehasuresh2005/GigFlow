import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Gig from './models/Gig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample data
const userNames = [
  'John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'David Wilson',
  'Jessica Martinez', 'Robert Taylor', 'Amanda Brown', 'James Anderson', 'Lisa Garcia',
  'William Lee', 'Michelle White', 'Christopher Harris', 'Ashley Martin', 'Daniel Thompson',
  'Jennifer Moore', 'Matthew Jackson', 'Nicole Lewis', 'Andrew Walker', 'Stephanie Hall',
  'Joshua Young', 'Lauren King', 'Ryan Wright', 'Megan Lopez', 'Kevin Hill',
  'Rachel Green', 'Brandon Adams', 'Samantha Baker', 'Justin Nelson', 'Brittany Carter'
];

const gigTitles = [
  'Website Redesign for E-commerce Store',
  'Mobile App UI/UX Design',
  'Logo Design and Branding Package',
  'WordPress Website Development',
  'Social Media Marketing Campaign',
  'SEO Optimization for Business Website',
  'Video Editing for YouTube Channel',
  'Content Writing for Blog',
  'Data Entry and Database Management',
  'Graphic Design for Marketing Materials',
  'Full Stack Web Application',
  'React Native Mobile App Development',
  'Python Script for Data Analysis',
  'Email Marketing Campaign Setup',
  '3D Modeling and Rendering',
  'Copywriting for Product Descriptions',
  'Photography for Product Catalog',
  'Translation Services (English to Spanish)',
  'Virtual Assistant Services',
  'Bookkeeping and Accounting',
  'Customer Support Chatbot Development',
  'Landing Page Design and Development',
  'Podcast Editing and Production',
  'Illustration for Children\'s Book',
  'API Integration Services',
  'Shopify Store Setup',
  'PowerPoint Presentation Design',
  'Resume Writing and Optimization',
  'Market Research and Analysis',
  'Technical Documentation Writing'
];

const gigDescriptions = [
  'Looking for an experienced web designer to redesign our e-commerce website. Need modern, responsive design with improved user experience and conversion optimization.',
  'Seeking a talented UI/UX designer to create beautiful and intuitive designs for our mobile application. Must have experience with iOS and Android design guidelines.',
  'Need a complete branding package including logo design, color scheme, typography, and brand guidelines. Looking for a creative and professional designer.',
  'Require a WordPress developer to build a custom website with specific functionality. Must be familiar with custom themes and plugin development.',
  'Looking for a social media expert to manage and grow our online presence across multiple platforms. Need content creation and engagement strategies.',
  'Seeking SEO specialist to improve our website\'s search engine rankings. Need keyword research, on-page optimization, and link building strategies.',
  'Need a video editor to edit and enhance our YouTube videos. Looking for someone skilled in Premiere Pro or Final Cut Pro with creative editing style.',
  'Require a content writer to create engaging blog posts for our website. Need SEO-friendly content that drives traffic and engagement.',
  'Looking for someone to handle data entry tasks and manage our database. Must be detail-oriented and proficient in Excel and database software.',
  'Need graphic designer to create marketing materials including flyers, brochures, and social media graphics. Must have strong design portfolio.',
  'Seeking full stack developer to build a web application from scratch. Need expertise in React, Node.js, and database design.',
  'Looking for React Native developer to build cross-platform mobile app. Must have experience with native modules and app store deployment.',
  'Need Python developer to create scripts for data analysis and automation. Must be familiar with pandas, numpy, and data visualization.',
  'Require email marketing specialist to set up and manage email campaigns. Need expertise in Mailchimp, automation, and A/B testing.',
  'Seeking 3D artist to create models and renderings for product visualization. Must be skilled in Blender, Maya, or 3ds Max.',
  'Looking for copywriter to write compelling product descriptions for our online store. Need SEO-optimized and conversion-focused copy.',
  'Need professional photographer to shoot product photos for our catalog. Must have experience with product photography and lighting.',
  'Require translator to translate documents from English to Spanish. Need accurate and professional translation services.',
  'Looking for virtual assistant to handle administrative tasks, email management, and scheduling. Must be organized and reliable.',
  'Seeking bookkeeper to manage our accounts and financial records. Need someone familiar with QuickBooks and accounting principles.',
  'Need developer to create a customer support chatbot using AI/ML. Must integrate with our existing systems and provide natural conversations.',
  'Looking for designer/developer to create a high-converting landing page. Need modern design with strong call-to-action and mobile responsiveness.',
  'Require podcast editor to edit and produce our weekly podcast episodes. Need audio editing, mixing, and mastering skills.',
  'Seeking illustrator to create artwork for children\'s book. Need colorful, engaging illustrations that match the story\'s tone.',
  'Looking for developer to integrate third-party APIs into our application. Must be familiar with REST APIs and authentication.',
  'Need Shopify expert to set up and customize our online store. Must be familiar with theme customization and app integration.',
  'Require designer to create professional PowerPoint presentations. Need engaging slides with good visual design and clear messaging.',
  'Looking for resume writer to optimize our resume for ATS systems and job applications. Need professional formatting and keyword optimization.',
  'Seeking market researcher to conduct analysis of our target market. Need competitor analysis, customer insights, and market trends.',
  'Require technical writer to create documentation for our software product. Need clear, comprehensive documentation for developers and users.'
];

const budgets = [
  500, 750, 1000, 1200, 1500, 2000, 2500, 3000, 3500, 4000,
  5000, 6000, 7500, 8000, 10000, 12000, 15000, 20000, 25000, 30000,
  500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gigflow');
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Gig.deleteMany({});
    console.log('Existing data cleared');

    // Create users
    console.log('Creating users...');
    const users = [];
    const credentials = [];

    for (let i = 0; i < userNames.length; i++) {
      const email = `user${i + 1}@gigflow.com`;
      const password = `password${i + 1}`;
      
      const user = await User.create({
        name: userNames[i],
        email: email,
        password: password
      });

      users.push(user);
      credentials.push({
        name: userNames[i],
        email: email,
        password: password,
        userId: user._id.toString()
      });

      console.log(`Created user: ${user.name} (${email})`);
    }

    // Create gigs
    console.log('\nCreating gigs...');
    const gigs = [];

    for (let i = 0; i < 30; i++) {
      const ownerIndex = i % users.length; // Distribute gigs among users
      const gig = await Gig.create({
        title: gigTitles[i],
        description: gigDescriptions[i],
        budget: budgets[i],
        ownerId: users[ownerIndex]._id,
        status: 'open'
      });

      gigs.push(gig);
      console.log(`Created gig: ${gig.title} (Budget: $${gig.budget})`);
    }

    // Create credentials document
    const credentialsDoc = {
      generatedAt: new Date().toISOString(),
      totalUsers: users.length,
      totalGigs: gigs.length,
      note: 'All users have password format: password1, password2, etc.',
      users: credentials.map(cred => ({
        name: cred.name,
        email: cred.email,
        password: cred.password,
        userId: cred.userId
      })),
      gigs: gigs.map(gig => ({
        title: gig.title,
        budget: `$${gig.budget}`,
        owner: userNames[gigs.indexOf(gig) % users.length],
        ownerEmail: credentials[gigs.indexOf(gig) % users.length].email,
        status: gig.status
      }))
    };

    // Save credentials to file
    const credentialsPath = path.join(__dirname, '..', 'SAMPLE_CREDENTIALS.md');
    let markdown = `# Sample User Credentials and Gigs\n\n`;
    markdown += `**Generated on:** ${new Date().toLocaleString()}\n\n`;
    markdown += `**Total Users:** ${users.length}\n`;
    markdown += `**Total Gigs:** ${gigs.length}\n\n`;
    markdown += `---\n\n`;
    markdown += `## User Credentials\n\n`;
    markdown += `All passwords follow the pattern: \`password1\`, \`password2\`, etc.\n\n`;
    markdown += `| # | Name | Email | Password | User ID |\n`;
    markdown += `|---|------|-------|----------|----------|\n`;
    
    credentials.forEach((cred, index) => {
      markdown += `| ${index + 1} | ${cred.name} | ${cred.email} | ${cred.password} | ${cred.userId} |\n`;
    });

    markdown += `\n---\n\n`;
    markdown += `## Sample Gigs\n\n`;
    markdown += `| # | Title | Budget | Owner | Owner Email | Status |\n`;
    markdown += `|---|-------|--------|-------|-------------|--------|\n`;
    
    gigs.forEach((gig, index) => {
      const ownerIndex = index % users.length;
      markdown += `| ${index + 1} | ${gig.title} | $${gig.budget} | ${userNames[ownerIndex]} | ${credentials[ownerIndex].email} | ${gig.status} |\n`;
    });

    markdown += `\n---\n\n`;
    markdown += `## Quick Login Examples\n\n`;
    markdown += `\`\`\`\n`;
    markdown += `User 1: user1@gigflow.com / password1\n`;
    markdown += `User 2: user2@gigflow.com / password2\n`;
    markdown += `User 3: user3@gigflow.com / password3\n`;
    markdown += `...\n`;
    markdown += `User 30: user30@gigflow.com / password30\n`;
    markdown += `\`\`\`\n`;

    fs.writeFileSync(credentialsPath, markdown, 'utf8');
    console.log(`\n✅ Credentials saved to: ${credentialsPath}`);

    // Also save JSON version
    const jsonPath = path.join(__dirname, '..', 'SAMPLE_CREDENTIALS.json');
    fs.writeFileSync(jsonPath, JSON.stringify(credentialsDoc, null, 2), 'utf8');
    console.log(`✅ JSON credentials saved to: ${jsonPath}`);

    console.log('\n✅ Database seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${gigs.length} gigs created`);
    console.log(`\n📝 Check SAMPLE_CREDENTIALS.md for all login details`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
