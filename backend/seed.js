const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Case = require('./models/Case');
const Hearing = require('./models/Hearing');
const Adjournment = require('./models/Adjournment');
const LawyerAvailability = require('./models/LawyerAvailability');
const Notification = require('./models/Notification');
const { calculatePriorityScore } = require('./utils/priorityScorer');

// Load environment variables
dotenv.config();

const seedData = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const connString = process.env.MONGODB_URI;
      if (!connString) {
        console.error('Error: MONGODB_URI is required to run seeding.');
        if (shouldExit) process.exit(1);
        return;
      }
      await mongoose.connect(connString);
      console.log('Connected to database for seeding...');
    }

    // 1. Clear existing database
    await User.deleteMany({});
    await Case.deleteMany({});
    await Hearing.deleteMany({});
    await Adjournment.deleteMany({});
    await LawyerAvailability.deleteMany({});
    await Notification.deleteMany({});
    console.log('Database cleared.');

    // 2. Create Users
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@nyaayflow.gov',
      password: 'admin123',
      role: 'Admin',
      phone: '+1 (555) 019-2831',
      status: 'Active'
    });

    const clerk = await User.create({
      name: 'Chief Clerk Rajesh',
      email: 'clerk@nyaayflow.gov',
      password: 'clerk123',
      role: 'Clerk',
      phone: '+1 (555) 021-3948',
      status: 'Active'
    });

    const judge1 = await User.create({
      name: 'Honorable Judge Shalini Sen',
      email: 'judge@nyaayflow.gov',
      password: 'judge123',
      role: 'Judge',
      phone: '+1 (555) 022-4950',
      status: 'Active'
    });

    const judge2 = await User.create({
      name: 'Honorable Judge Anthony Gonsalves',
      email: 'judge2@nyaayflow.gov',
      password: 'judge123',
      role: 'Judge',
      phone: '+1 (555) 022-7777',
      status: 'Active'
    });

    const lawyer1 = await User.create({
      name: 'Advocate Harish Salve',
      email: 'lawyer@nyaayflow.gov',
      password: 'lawyer123',
      role: 'Lawyer',
      phone: '+1 (555) 023-5819',
      status: 'Active'
    });

    const lawyer2 = await User.create({
      name: 'Advocate Vrinda Grover',
      email: 'lawyer2@nyaayflow.gov',
      password: 'lawyer123',
      role: 'Lawyer',
      phone: '+1 (555) 023-9999',
      status: 'Active'
    });

    console.log('Users seeded.');

    // 3. Create Cases
    // Define dates for backlog cases (e.g. 6 years ago, 3 years ago)
    const sixYearsAgo = new Date();
    sixYearsAgo.setFullYear(sixYearsAgo.getFullYear() - 6);

    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    // Case 1: Criminal + Backlog (>5 yrs) + Women Safety. Priority should be extremely high.
    const case1Data = {
      caseNumber: 'CR-2020-0891',
      title: 'State of Maharashtra vs. Rakesh Sharma & Ors',
      caseType: 'Criminal',
      plaintiff: 'State of Maharashtra',
      defendant: 'Rakesh Sharma',
      judgeId: judge1._id,
      lawyerId: lawyer1._id,
      court: 'Metropolitan Magistrate Court 4',
      filingDate: sixYearsAgo,
      isWomenSafety: true,
      isSeniorCitizen: false,
      isChildRelated: false,
      adjournmentCount: 6 // More than 5 adjournments (+15)
    };
    case1Data.priorityScore = calculatePriorityScore(case1Data);
    const case1 = await Case.create(case1Data);

    // Case 2: Civil + Senior Citizen
    const case2Data = {
      caseNumber: 'CV-2023-0102',
      title: 'Suresh Mehta vs. LIC India Corp',
      caseType: 'Civil',
      plaintiff: 'Suresh Mehta',
      defendant: 'LIC India Corp',
      judgeId: judge1._id,
      lawyerId: lawyer2._id,
      court: 'Civil Judge Court Junior Division',
      filingDate: threeYearsAgo,
      isWomenSafety: false,
      isSeniorCitizen: true,
      isChildRelated: false,
      adjournmentCount: 2
    };
    case2Data.priorityScore = calculatePriorityScore(case2Data);
    const case2 = await Case.create(case2Data);

    // Case 3: Criminal + Child Related (New)
    const case3Data = {
      caseNumber: 'CR-2026-1102',
      title: 'State vs. Kailash Satyarthi Foundation',
      caseType: 'Criminal',
      plaintiff: 'State',
      defendant: 'Nitin Kumar',
      judgeId: judge2._id,
      lawyerId: lawyer1._id,
      court: 'District POCSO Court 2',
      filingDate: tenDaysAgo,
      isWomenSafety: false,
      isSeniorCitizen: false,
      isChildRelated: true,
      adjournmentCount: 0
    };
    case3Data.priorityScore = calculatePriorityScore(case3Data);
    const case3 = await Case.create(case3Data);

    // Case 4: Closed Case (Disposed)
    const case4Data = {
      caseNumber: 'CV-2022-0941',
      title: 'Aman Builders vs. Municipal Corp Mumbai',
      caseType: 'Civil',
      plaintiff: 'Aman Builders',
      defendant: 'Municipal Corp Mumbai',
      judgeId: judge2._id,
      lawyerId: lawyer2._id,
      court: 'High Court Commercial Division',
      filingDate: threeYearsAgo,
      isWomenSafety: false,
      isSeniorCitizen: false,
      isChildRelated: false,
      adjournmentCount: 1,
      status: 'Closed'
    };
    case4Data.priorityScore = calculatePriorityScore(case4Data);
    const case4 = await Case.create(case4Data);

    console.log('Cases seeded.');

    // 4. Create Hearings
    const today = new Date();
    
    // Hearing today for Case 1 (Judge 1, Lawyer 1)
    const hearing1 = await Hearing.create({
      caseId: case1._id,
      judgeId: judge1._id,
      date: today,
      time: '10:30 AM',
      status: 'Scheduled',
      remarks: ''
    });

    // Update case 1 next hearing
    case1.nextHearing = today;
    case1.status = 'Scheduled';
    await case1.save();

    // Hearing tomorrow for Case 2 (Judge 1, Lawyer 2)
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const hearing2 = await Hearing.create({
      caseId: case2._id,
      judgeId: judge1._id,
      date: tomorrow,
      time: '11:30 AM',
      status: 'Scheduled',
      remarks: ''
    });

    case2.nextHearing = tomorrow;
    case2.status = 'Scheduled';
    await case2.save();

    // Past conducted hearing for Case 4
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    await Hearing.create({
      caseId: case4._id,
      judgeId: judge2._id,
      date: lastWeek,
      time: '02:00 PM',
      status: 'Conducted',
      remarks: 'Settlement finalized. Case closed.'
    });

    console.log('Hearings seeded.');

    // 5. Create Adjournment requests
    await Adjournment.create({
      caseId: case2._id,
      reason: 'Assigned counsel is unavailable due to medical emergency',
      date: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), // request for 15 days later
      requestedBy: lawyer2._id,
      status: 'Pending'
    });

    console.log('Adjournments seeded.');

    // 6. Create Lawyer Availability
    // Mark lawyer 1 unavailable for next Monday
    const nextMonday = new Date();
    nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
    nextMonday.setHours(0,0,0,0);

    await LawyerAvailability.create({
      lawyerId: lawyer1._id,
      date: nextMonday,
      available: false,
      reason: 'Attending High Court hearing in another state'
    });

    console.log('Lawyer availabilities seeded.');

    // 7. Create Notifications
    await Notification.create({
      userId: lawyer1._id,
      title: 'Priority Notice: High Backlog Case',
      message: 'Case CR-2020-0891 has been flagged with an extremely high backlog score (+115). Scheduled for immediate priority hearing.',
      status: 'Unread'
    });

    await Notification.create({
      userId: judge1._id,
      title: 'New Backlog Assigned',
      message: 'Case CR-2020-0891 has been queued to your roster due to high priority score.',
      status: 'Unread'
    });

    console.log('Notifications seeded.');
    console.log('Seeding completed successfully!');
    if (shouldExit) {
      process.exit(0);
    }
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    if (shouldExit) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
