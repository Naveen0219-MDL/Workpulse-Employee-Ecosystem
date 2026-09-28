import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Attendance } from './models/Attendance.js';
import { Task } from './models/Task.js';
import { Query } from './models/Query.js';
import { getWeekDateRange, formatDateKey } from './utils/performanceCalculator.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/employee_ecosystem';
    console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Attendance.deleteMany({}),
      Task.deleteMany({}),
      Query.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    // 1. Admin
    const admin = await User.create({
      name: 'Sarah Connor',
      username: 'admin',
      email: 'admin@workpulse.com',
      password: 'admin123',
      role: 'admin',
      department: 'Executive Operations',
      designation: 'VP of Workforce & Operations',
      weeklyTargetHours: 40,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });

    // 2. Manager
    const manager = await User.create({
      name: 'Marcus Vance',
      username: 'manager',
      email: 'manager@workpulse.com',
      password: 'manager123',
      role: 'manager',
      department: 'Engineering',
      designation: 'Engineering Lead & Project Manager',
      weeklyTargetHours: 40,
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    });

    // 3. Employees
    const alex = await User.create({
      name: 'Alex Rivera',
      username: 'alex',
      email: 'alex@workpulse.com',
      password: 'alex123',
      role: 'employee',
      department: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      weeklyTargetHours: 40,
      managerId: manager._id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const priya = await User.create({
      name: 'Priya Sharma',
      username: 'priya',
      email: 'priya@workpulse.com',
      password: 'priya123',
      role: 'employee',
      department: 'Product & Design',
      designation: 'UI/UX & Frontend Specialist',
      weeklyTargetHours: 40,
      managerId: manager._id,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    });

    const david = await User.create({
      name: 'David Kim',
      username: 'david',
      email: 'david@workpulse.com',
      password: 'david123',
      role: 'employee',
      department: 'Cloud Infrastructure',
      designation: 'DevOps & Site Reliability Engineer',
      weeklyTargetHours: 40,
      managerId: manager._id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    const elena = await User.create({
      name: 'Elena Rostova',
      username: 'elena',
      email: 'elena@workpulse.com',
      password: 'elena123',
      role: 'employee',
      department: 'Quality Assurance',
      designation: 'Automation QA Lead',
      weeklyTargetHours: 40,
      managerId: manager._id,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    });

    console.log('[Seed] Generating weekly attendance history...');
    const { startOfWeek } = getWeekDateRange();
    const employees = [alex, priya, david, elena];

    // Seed attendance for Monday through yesterday / today
    const attendanceRecords = [];
    const today = new Date();
    const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0 for Mon ... 6 for Sun

    for (let dayOffset = 0; dayOffset <= Math.min(4, currentDayIndex); dayOffset++) {
      const shiftDate = new Date(startOfWeek);
      shiftDate.setDate(startOfWeek.getDate() + dayOffset);
      const dateStr = formatDateKey(shiftDate);

      for (const emp of employees) {
        // Vary hours slightly per employee
        let hoursWorked = 7.5 + (Math.sin(emp.name.length + dayOffset) * 1.5);
        if (emp.name === 'Alex Rivera') hoursWorked = 8.5; // Alex does slightly more
        if (emp.name === 'David Kim') hoursWorked = 7.0;

        const durationMinutes = Math.round(hoursWorked * 60);
        const punchIn = new Date(shiftDate);
        punchIn.setHours(9, 15, 0);

        const punchOut = new Date(punchIn);
        punchOut.setMinutes(punchIn.getMinutes() + durationMinutes);

        // If it's today, keep Alex clocked in currently!
        const isToday = dateStr === formatDateKey(today);
        if (isToday && emp.name === 'Alex Rivera') {
          const livePunchIn = new Date();
          livePunchIn.setHours(livePunchIn.getHours() - 3, livePunchIn.getMinutes() - 25);
          attendanceRecords.push({
            user: emp._id,
            date: dateStr,
            punchIn: livePunchIn,
            punchOut: null,
            durationMinutes: 0,
            status: 'active',
            companyDomain: 'workpulse.com',
            notes: 'Current sprint core development session',
            location: 'Office Desk 4B',
          });
        } else {
          attendanceRecords.push({
            user: emp._id,
            companyDomain: 'workpulse.com',
            date: dateStr,
            punchIn,
            punchOut,
            durationMinutes,
            status: 'completed',
            notes: 'Standard working shift',
            location: 'Office / Remote',
          });
        }
      }
    }

    await Attendance.insertMany(attendanceRecords);

    console.log('[Seed] Creating realistic tasks with progress logs...');
    const now = new Date();
    const futureDate = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d;
    };

    const tasks = [
      // Alex Rivera Tasks
      {
        title: 'Architect GraphQL / REST Gateway for Realtime Tracking',
        description: 'Design the microservices endpoint schema, response formats, and optimize query latency for punch in/out events.',
        assignedTo: alex._id,
        assignedBy: manager._id,
        priority: 'urgent',
        status: 'in_progress',
        progressPercentage: 75,
        estimatedHours: 16,
        loggedHours: 12,
        deadline: futureDate(2),
        progressLogs: [
          {
            updatedBy: manager._id,
            percent: 0,
            note: 'Task allocated by Marcus Vance',
            timestamp: new Date(Date.now() - 4 * 86400000),
          },
          {
            updatedBy: alex._id,
            percent: 40,
            note: 'Drafted OpenAPI schema and middleware hooks',
            timestamp: new Date(Date.now() - 2 * 86400000),
          },
          {
            updatedBy: alex._id,
            percent: 75,
            note: 'Implemented JWT validation and route guards. Starting tests.',
            timestamp: new Date(Date.now() - 1 * 86400000),
          },
        ],
      },
      {
        title: 'Implement Database Sharding & Indexing Strategy',
        description: 'Optimize MongoDB compound indices on attendance logs and task progress collections to guarantee sub-10ms queries.',
        assignedTo: alex._id,
        assignedBy: manager._id,
        priority: 'high',
        status: 'completed',
        progressPercentage: 100,
        estimatedHours: 10,
        loggedHours: 9,
        deadline: futureDate(-1),
        completedAt: new Date(Date.now() - 1 * 86400000),
        progressLogs: [
          {
            updatedBy: alex._id,
            percent: 100,
            note: 'Created compound index on (user, date) and verified explain plans.',
            timestamp: new Date(Date.now() - 1 * 86400000),
          },
        ],
      },
      // Priya Sharma Tasks
      {
        title: 'Build Executive Analytics Dashboard & Performance Gauges',
        description: 'Design and code responsive glassmorphic cards, weekly work hours bar charts, and KPI progress rings.',
        assignedTo: priya._id,
        assignedBy: manager._id,
        priority: 'high',
        status: 'in_progress',
        progressPercentage: 85,
        estimatedHours: 20,
        loggedHours: 16,
        deadline: futureDate(3),
        progressLogs: [
          {
            updatedBy: priya._id,
            percent: 50,
            note: 'Completed design tokens and responsive CSS Grid layout',
            timestamp: new Date(Date.now() - 2 * 86400000),
          },
          {
            updatedBy: priya._id,
            percent: 85,
            note: 'Integrated live timer widget and attendance modal transitions',
            timestamp: new Date(Date.now() - 12 * 3600000),
          },
        ],
      },
      {
        title: 'Accessibility Audit & Contrast Optimization (WCAG 2.1 AA)',
        description: 'Inspect color ratios, keyboard focus rings, and ARIA labels across modals and tables.',
        assignedTo: priya._id,
        assignedBy: manager._id,
        priority: 'medium',
        status: 'todo',
        progressPercentage: 10,
        estimatedHours: 8,
        loggedHours: 1,
        deadline: futureDate(5),
        progressLogs: [
          {
            updatedBy: priya._id,
            percent: 10,
            note: 'Ran automated axe-core audit. 4 minor items flagged.',
            timestamp: new Date(),
          },
        ],
      },
      // David Kim Tasks
      {
        title: 'Configure Kubernetes HPA & Staging CI/CD Pipeline',
        description: 'Set up Horizontal Pod Autoscaling based on CPU/Memory thresholds and automate zero-downtime rolling deploys.',
        assignedTo: david._id,
        assignedBy: manager._id,
        priority: 'urgent',
        status: 'in_review',
        progressPercentage: 90,
        estimatedHours: 14,
        loggedHours: 13,
        deadline: futureDate(1),
        progressLogs: [
          {
            updatedBy: david._id,
            percent: 90,
            note: 'Pipeline yaml configured and tested on dev cluster. Requesting peer review.',
            timestamp: new Date(),
          },
        ],
      },
      // Elena Rostova Tasks
      {
        title: 'End-to-End Cypress Suite for Punch-In / Punch-Out Flow',
        description: 'Cover clock-in, active timer persistence across reloads, punch-out calculations, and edge cases like session timeouts.',
        assignedTo: elena._id,
        assignedBy: manager._id,
        priority: 'medium',
        status: 'completed',
        progressPercentage: 100,
        estimatedHours: 12,
        loggedHours: 11,
        deadline: futureDate(-2),
        completedAt: new Date(Date.now() - 2 * 86400000),
        progressLogs: [
          {
            updatedBy: elena._id,
            percent: 100,
            note: 'All 14 integration test specs passing green in CI.',
            timestamp: new Date(Date.now() - 2 * 86400000),
          },
        ],
      },
    ];

    await Task.insertMany(tasks.map((t) => ({ ...t, companyDomain: 'workpulse.com' })));

    console.log('[Seed] Creating sample employee queries & blocker tickets...');
    const queries = [
      {
        title: 'Need Redis staging cluster credentials for pub/sub testing',
        description: 'I am testing the realtime event broadcast between the backend and front-end punch clocks. Need access to the staging Redis host.',
        category: 'task_blocker',
        priority: 'high',
        status: 'open',
        raisedBy: alex._id,
        assignedTo: manager._id,
        responses: [
          {
            sender: alex._id,
            message: 'Currently blocked on testing the pub/sub connection. Please provide the staging env secrets.',
            createdAt: new Date(Date.now() - 6 * 3600000),
          },
        ],
      },
      {
        title: 'Figma component tokens discrepancy in dark mode palette',
        description: 'The secondary border tokens in the design spec show #334155 but the tokens file exports #1e293b. Please confirm which is preferred.',
        category: 'technical',
        priority: 'medium',
        status: 'in_review',
        raisedBy: priya._id,
        assignedTo: manager._id,
        responses: [
          {
            sender: priya._id,
            message: 'Query opened with reference screenshot.',
            createdAt: new Date(Date.now() - 24 * 3600000),
          },
          {
            sender: manager._id,
            message: 'Please use #334155 for subtle borders so it passes contrast on dark slate backgrounds. I have synced with the UI designer.',
            createdAt: new Date(Date.now() - 18 * 3600000),
          },
        ],
      },
      {
        title: 'Annual health insurance & tax deduction inquiry for Q3',
        description: 'Could HR please verify the insurance premium deduction reflected in my August payroll slip?',
        category: 'hr_payroll',
        priority: 'low',
        status: 'resolved',
        raisedBy: david._id,
        assignedTo: admin._id,
        resolvedAt: new Date(Date.now() - 12 * 3600000),
        responses: [
          {
            sender: david._id,
            message: 'Sent email and raising this ticket as requested.',
            createdAt: new Date(Date.now() - 48 * 3600000),
          },
          {
            sender: admin._id,
            message: 'Verified with finance team. The updated premium was adjusted as per your policy upgrade. Revised breakdown sent to your email.',
            createdAt: new Date(Date.now() - 12 * 3600000),
          },
        ],
      },
    ];

    await Query.insertMany(queries.map((q) => ({ ...q, companyDomain: 'workpulse.com' })));

    console.log('[Seed] Database seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('Login Credentials:');
    console.log('👑 Admin:   admin@workpulse.com   / admin123');
    console.log('👔 Manager: manager@workpulse.com / manager123');
    console.log('💻 Employee (Alex):  alex@workpulse.com   / alex123');
    console.log('🎨 Employee (Priya): priya@workpulse.com  / priya123');
    console.log('☁️ Employee (David): david@workpulse.com  / david123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
