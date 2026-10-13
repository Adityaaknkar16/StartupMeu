const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { connectDB, disconnectDB } = require('../config/db');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing FlowDeck data...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Activity.deleteMany({})
    ]);

    console.log('[Seed] Creating demo team users...');
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Password123!', salt);

    const users = await User.create([
      {
        name: 'Alex Rivera',
        email: 'alex@flowdeck.dev',
        passwordHash: demoPasswordHash,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Maya Chen',
        email: 'maya@flowdeck.dev',
        passwordHash: demoPasswordHash,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Liam Patel',
        email: 'liam@flowdeck.dev',
        passwordHash: demoPasswordHash,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Jordan Taylor',
        email: 'jordan@flowdeck.dev',
        passwordHash: demoPasswordHash,
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80'
      }
    ]);

    const [alex, maya, liam, jordan] = users;

    console.log('[Seed] Creating flagship project...');
    const project = await Project.create({
      name: 'FlowDeck 1.0 Launch',
      description:
        'Next-generation team task orchestration system with real-time Kanban boards, dynamic glassmorphism UI, and deep productivity analytics.',
      owner: alex._id,
      members: [
        { user: alex._id, role: 'owner', joinedAt: new Date(Date.now() - 14 * 86400000) },
        { user: maya._id, role: 'member', joinedAt: new Date(Date.now() - 12 * 86400000) },
        { user: liam._id, role: 'member', joinedAt: new Date(Date.now() - 10 * 86400000) },
        { user: jordan._id, role: 'member', joinedAt: new Date(Date.now() - 8 * 86400000) }
      ]
    });

    console.log('[Seed] Creating secondary demo project...');
    const secondaryProject = await Project.create({
      name: 'Mobile App Redesign',
      description: 'iOS and Android app overhaul with native gestures and offline sync.',
      owner: alex._id,
      members: [
        { user: alex._id, role: 'owner', joinedAt: new Date() },
        { user: liam._id, role: 'member', joinedAt: new Date() }
      ]
    });

    console.log('[Seed] Generating 18+ rich task items...');
    const now = Date.now();
    const dayMs = 86400000;

    const taskDefinitions = [
      // 1-5: TO DO
      {
        title: 'Set up Redis caching for board aggregation queries',
        description: 'Cache GET /projects/:id/stats and board columns with a 60-second TTL to improve throughput under high load.',
        status: 'todo',
        priority: 'high',
        assignee: maya._id,
        dueDate: new Date(now + 6 * dayMs),
        order: 0,
        createdBy: alex._id
      },
      {
        title: 'Implement OAuth2 with Google & GitHub',
        description: 'Add social sign-in alongside traditional email and bcrypt authentication.',
        status: 'todo',
        priority: 'medium',
        assignee: null,
        dueDate: new Date(now + 9 * dayMs),
        order: 1,
        createdBy: alex._id
      },
      {
        title: 'Write end-to-end Playwright test suite',
        description: 'Simulate full user journeys: registration, board drag-and-drop, theme toggle, and keyboard shortcuts.',
        status: 'todo',
        priority: 'medium',
        assignee: jordan._id,
        dueDate: new Date(now + 12 * dayMs),
        order: 2,
        createdBy: maya._id
      },
      {
        title: 'Configure automated backup cron for MongoDB Atlas',
        description: 'Set up daily snapshots and point-in-time recovery for disaster recovery readiness.',
        status: 'todo',
        priority: 'low',
        assignee: null,
        dueDate: new Date(now + 15 * dayMs),
        order: 3,
        createdBy: alex._id
      },
      {
        title: 'Conduct WCAG 2.1 AA keyboard navigation accessibility audit',
        description: 'Ensure focus rings, ARIA roles, and screen-reader announcements work across all interactive modal dialogs.',
        status: 'todo',
        priority: 'low',
        assignee: liam._id,
        dueDate: new Date(now + 18 * dayMs),
        order: 4,
        createdBy: alex._id
      },

      // 6-11: IN PROGRESS
      {
        title: 'Build responsive Kanban drag-and-drop board',
        description: 'Support seamless card reordering, multi-column dragging, and instant optimistic updates with error rollback.',
        status: 'in-progress',
        priority: 'high',
        assignee: maya._id,
        dueDate: new Date(now + 2 * dayMs),
        order: 0,
        subtasks: [
          { title: 'Setup DragDropContext', completed: true },
          { title: 'Add optimistic rollback', completed: true },
          { title: 'Mobile swipeable columns', completed: false }
        ],
        createdBy: alex._id
      },
      {
        title: 'Design Glassmorphic UI theme tokens with dark/light mode',
        description: 'Create frosted glass backdrop filters, gradient borders, and persistent localStorage theme switching.',
        status: 'in-progress',
        priority: 'high',
        assignee: liam._id,
        dueDate: new Date(now + 3 * dayMs),
        order: 1,
        subtasks: [
          { title: 'Dark mode tokens', completed: true },
          { title: 'Light mode tokens', completed: true },
          { title: 'System preference sync', completed: false }
        ],
        createdBy: liam._id
      },
      {
        title: 'Implement Command Palette (Ctrl+K) quick launcher',
        description: 'Provide rapid fuzzy search to jump between projects, spawn new tasks, and toggle system preferences.',
        status: 'in-progress',
        priority: 'medium',
        assignee: maya._id,
        dueDate: new Date(now + 4 * dayMs),
        order: 2,
        createdBy: alex._id
      },
      {
        title: 'Create Live Activity Timeline with user avatars',
        description: 'Display chronological event feed for task creations, status moves, and member invitations in sidebar.',
        status: 'in-progress',
        priority: 'medium',
        assignee: liam._id,
        dueDate: new Date(now + 5 * dayMs),
        order: 3,
        createdBy: alex._id
      },
      {
        title: 'Audit and tune MongoDB compound indexes',
        description: 'Ensure {project: 1, status: 1, order: 1} and text indexes maintain single-digit millisecond query performance.',
        status: 'in-progress',
        priority: 'high',
        assignee: alex._id,
        dueDate: new Date(now - 2 * dayMs), // OVERDUE for stats breakdown testing!
        order: 4,
        createdBy: alex._id
      },
      {
        title: 'Build Recharts analytics dashboard with completion progress ring',
        description: 'Show task distribution by status, priority breakdown, and overdue indicator badge.',
        status: 'in-progress',
        priority: 'high',
        assignee: maya._id,
        dueDate: new Date(now - 1 * dayMs), // OVERDUE for stats breakdown testing!
        order: 5,
        createdBy: alex._id
      },

      // 12-18: DONE
      {
        title: 'Initialize MERN repository architecture',
        description: 'Structured server into controllers, services, models, middleware, and setup client Vite scaffold.',
        status: 'done',
        priority: 'high',
        assignee: alex._id,
        dueDate: new Date(now - 10 * dayMs),
        order: 0,
        createdBy: alex._id
      },
      {
        title: 'Define centralized message constants and response envelopes',
        description: 'All success and failure responses unified under {success, message, data/errors} contract.',
        status: 'done',
        priority: 'high',
        assignee: alex._id,
        dueDate: new Date(now - 9 * dayMs),
        order: 1,
        createdBy: alex._id
      },
      {
        title: 'Implement JWT authentication and bcrypt password hashing',
        description: 'Standard Bearer token authorization with 7-day expiration and /api/auth/me session check.',
        status: 'done',
        priority: 'high',
        assignee: maya._id,
        dueDate: new Date(now - 8 * dayMs),
        order: 2,
        createdBy: alex._id
      },
      {
        title: 'Configure Zod request validation and field error formatting',
        description: 'Strict validation across auth, project creation, member invites, and task mutations.',
        status: 'done',
        priority: 'medium',
        assignee: maya._id,
        dueDate: new Date(now - 7 * dayMs),
        order: 3,
        createdBy: alex._id
      },
      {
        title: 'Implement project access control and owner authorizations',
        description: 'Only members can read/mutate tasks; only owner can delete projects or invite team members.',
        status: 'done',
        priority: 'high',
        assignee: alex._id,
        dueDate: new Date(now - 6 * dayMs),
        order: 4,
        createdBy: alex._id
      },
      {
        title: 'Build MongoDB aggregation pipeline for project metrics',
        description: 'High-speed $facet pipeline returning status distribution, overdue count, and completion rate.',
        status: 'done',
        priority: 'medium',
        assignee: alex._id,
        dueDate: new Date(now - 5 * dayMs),
        order: 5,
        createdBy: alex._id
      },
      {
        title: 'Draft API specification and endpoint documentation',
        description: 'Complete documentation of all routes, query params, schemas, and status codes.',
        status: 'done',
        priority: 'low',
        assignee: liam._id,
        dueDate: new Date(now - 4 * dayMs),
        order: 6,
        createdBy: liam._id
      }
    ];

    const tasks = await Task.insertMany(
      taskDefinitions.map((t) => ({ ...t, project: project._id }))
    );

    console.log(`[Seed] Seeded ${tasks.length} tasks in "${project.name}"`);

    // Add 2 tasks to secondary project as well
    await Task.insertMany([
      {
        title: 'Figma mockups for iOS gesture navigation',
        description: 'Design swipe-to-archive and pinch-to-zoom timeline view.',
        status: 'in-progress',
        priority: 'high',
        assignee: liam._id,
        dueDate: new Date(now + 7 * dayMs),
        order: 0,
        createdBy: alex._id,
        project: secondaryProject._id
      },
      {
        title: 'Review Apple Human Interface Guidelines for widgets',
        description: 'Prepare interactive Lock Screen widgets for task counters.',
        status: 'todo',
        priority: 'medium',
        assignee: alex._id,
        dueDate: new Date(now + 14 * dayMs),
        order: 1,
        createdBy: alex._id,
        project: secondaryProject._id
      }
    ]);

    console.log('[Seed] Generating initial activity timeline entries...');
    await Activity.insertMany([
      {
        project: project._id,
        user: alex._id,
        action: 'created_project',
        taskTitle: '',
        details: { projectName: project.name },
        createdAt: new Date(now - 14 * dayMs)
      },
      {
        project: project._id,
        user: alex._id,
        action: 'invited_member',
        taskTitle: '',
        details: { invitedUser: maya.name, role: 'member' },
        createdAt: new Date(now - 12 * dayMs)
      },
      {
        project: project._id,
        user: alex._id,
        action: 'invited_member',
        taskTitle: '',
        details: { invitedUser: liam.name, role: 'member' },
        createdAt: new Date(now - 10 * dayMs)
      },
      {
        project: project._id,
        user: maya._id,
        action: 'created_task',
        taskTitle: 'Build responsive Kanban drag-and-drop board',
        details: { status: 'in-progress', priority: 'high' },
        createdAt: new Date(now - 3 * dayMs)
      },
      {
        project: project._id,
        user: liam._id,
        action: 'moved_task',
        taskTitle: 'Design Glassmorphic UI theme tokens with dark/light mode',
        details: { from: 'todo', to: 'in-progress' },
        createdAt: new Date(now - 1 * dayMs)
      },
      {
        project: project._id,
        user: alex._id,
        action: 'moved_task',
        taskTitle: 'Build MongoDB aggregation pipeline for project metrics',
        details: { from: 'in-progress', to: 'done' },
        createdAt: new Date(now - 4 * 3600000)
      }
    ]);

    console.log('\n=============================================================');
    console.log('✅ FlowDeck Database Seed Completed Successfully!');
    console.log('=============================================================');
    console.log('Demo Credentials (All users share password: Password123!)');
    console.log('1. Owner:     alex@flowdeck.dev     (Alex Rivera)');
    console.log('2. Developer: maya@flowdeck.dev     (Maya Chen)');
    console.log('3. Designer:  liam@flowdeck.dev     (Liam Patel)');
    console.log('4. QA:        jordan@flowdeck.dev   (Jordan Taylor)');
    console.log(`Primary Project: "${project.name}" (ID: ${project._id})`);
    console.log(`Total Tasks Seeded: ${tasks.length + 2}`);
    console.log('=============================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Database seeding failed:', error);
    await disconnectDB();
    process.exit(1);
  }
};

seedData();
