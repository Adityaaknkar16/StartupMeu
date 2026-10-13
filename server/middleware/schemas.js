const { z } = require('zod');
const MESSAGES = require('../utils/messages');

// Helper to check valid MongoDB ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const zObjectId = z
  .string()
  .refine((val) => objectIdRegex.test(val), {
    message: 'Invalid ObjectId format'
  });

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name cannot exceed 50 characters' }),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: MESSAGES.AUTH.PASSWORD_MIN_LENGTH })
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, { message: 'Password is required' })
});

const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .trim()
    .min(2, { message: 'Project name must be at least 2 characters' })
    .max(100, { message: 'Project name cannot exceed 100 characters' }),
  description: z
    .string()
    .trim()
    .max(500, { message: 'Description cannot exceed 500 characters' })
    .optional()
    .default('')
});

const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Project name must be at least 2 characters' })
    .max(100, { message: 'Project name cannot exceed 100 characters' })
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, { message: 'Description cannot exceed 500 characters' })
    .optional()
});

const inviteMemberSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email({ message: 'Please provide a valid email address' })
    .toLowerCase(),
  role: z.enum(['owner', 'member']).optional().default('member')
});

const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .trim()
    .min(1, { message: 'Task title cannot be empty' })
    .max(150, { message: 'Task title cannot exceed 150 characters' }),
  description: z
    .string()
    .trim()
    .max(2000, { message: 'Description cannot exceed 2000 characters' })
    .optional()
    .default(''),
  status: z
    .enum(['todo', 'in-progress', 'done'], {
      errorMap: () => ({ message: 'Status must be todo, in-progress, or done' })
    })
    .optional()
    .default('todo'),
  priority: z
    .enum(['low', 'medium', 'high'], {
      errorMap: () => ({ message: 'Priority must be low, medium, or high' })
    })
    .optional()
    .default('medium'),
  assignee: z
    .union([zObjectId, z.literal(''), z.null()])
    .optional()
    .transform((val) => (val === '' ? null : val)),
  dueDate: z
    .union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal(''), z.null()])
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
  order: z.number().int().nonnegative().optional().default(0),
  subtasks: z
    .array(
      z.object({
        title: z.string().trim().min(1, 'Subtask title cannot be empty'),
        completed: z.boolean().default(false)
      })
    )
    .optional()
    .default([])
});

const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Task title cannot be empty' })
    .max(150, { message: 'Task title cannot exceed 150 characters' })
    .optional(),
  description: z
    .string()
    .trim()
    .max(2000, { message: 'Description cannot exceed 2000 characters' })
    .optional(),
  status: z
    .enum(['todo', 'in-progress', 'done'], {
      errorMap: () => ({ message: 'Status must be todo, in-progress, or done' })
    })
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'], {
      errorMap: () => ({ message: 'Priority must be low, medium, or high' })
    })
    .optional(),
  assignee: z
    .union([zObjectId, z.literal(''), z.null()])
    .optional()
    .transform((val) => (val === '' ? null : val)),
  dueDate: z
    .union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal(''), z.null()])
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
  order: z.number().int().nonnegative().optional(),
  subtasks: z
    .array(
      z.object({
        title: z.string().trim().min(1, 'Subtask title cannot be empty'),
        completed: z.boolean().default(false)
      })
    )
    .optional()
});

const moveTaskSchema = z.object({
  status: z.enum(['todo', 'in-progress', 'done'], {
    errorMap: () => ({ message: 'Status must be todo, in-progress, or done' })
  }),
  order: z.number().int().nonnegative({ message: 'Order must be a non-negative integer' }).optional().default(0)
});

module.exports = {
  registerSchema,
  loginSchema,
  createProjectSchema,
  updateProjectSchema,
  inviteMemberSchema,
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  zObjectId
};
