/**
 * FlowDeck Centralized Message Constants (Client)
 * Strictly matches server/utils/messages.js for end-to-end consistency.
 */

export const MESSAGES = {
  AUTH: {
    REGISTER_SUCCESS: 'Account created. Welcome aboard!',
    EMAIL_ALREADY_REGISTERED: 'Email already registered',
    PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
    LOGIN_SUCCESS: (name) => `Welcome back, ${name}!`,
    DEFAULT_LOGIN_SUCCESS: 'Welcome back!',
    INVALID_CREDENTIALS: 'Invalid email or password',
    RATE_LIMIT_EXCEEDED: 'Too many attempts, try again in 15 minutes',
    LOGOUT_SUCCESS: 'Signed out safely',
    SESSION_EXPIRED: 'Session expired, please sign in again',
    UNAUTHORIZED: 'Authentication required. Please sign in.',
    USER_NOT_FOUND: 'User not found'
  },

  PROJECT: {
    CREATE_SUCCESS: 'Project created successfully',
    UPDATE_SUCCESS: 'Project updated successfully',
    DELETE_SUCCESS: 'Project deleted successfully',
    FETCH_SUCCESS: 'Project fetched successfully',
    LIST_SUCCESS: 'Projects retrieved successfully',
    NOT_FOUND: 'Project not found',
    NOT_MEMBER: 'Access denied: You are not a member of this project',
    ONLY_OWNER_ALLOWED: 'Only the owner can do this',
    CANNOT_REMOVE_OWNER: 'Project owner cannot be removed',
    STATS_SUCCESS: 'Project statistics calculated successfully'
  },

  MEMBER: {
    INVITE_SUCCESS: 'Member invited successfully',
    USER_NOT_FOUND: 'User not found with provided email',
    ALREADY_MEMBER: 'User is already a member of this project',
    CANNOT_INVITE_SELF: 'You are already the owner of this project',
    REMOVE_SUCCESS: 'Member removed from project'
  },

  TASK: {
    CREATE_SUCCESS: 'Task created successfully',
    UPDATE_SUCCESS: 'Task updated successfully',
    MOVE_SUCCESS: (status) => `Task moved to ${status}`,
    DEFAULT_MOVE_SUCCESS: 'Task status updated successfully',
    MOVE_FAILED: "Couldn't move task, change reverted",
    DELETE_SUCCESS: 'Task deleted successfully',
    NOT_FOUND: 'Task not found',
    UNAUTHORIZED: 'You do not have permission to modify this task',
    LIST_SUCCESS: 'Tasks retrieved successfully'
  },

  VALIDATION: {
    FAILED: 'Validation failed. Please correct the highlighted fields.',
    INVALID_ID: 'Invalid ID format provided'
  },

  SYSTEM: {
    SERVER_ERROR: "Can't reach the server. Check your connection.",
    INTERNAL_ERROR: 'An unexpected internal error occurred. Please try again.',
    NOT_FOUND: 'The requested resource was not found'
  },

  EMPTY_STATE: {
    NO_TASKS: 'No tasks yet. Create your first one.',
    NO_PROJECTS: 'No projects yet. Create your first project to get started.',
    NO_ACTIVITIES: 'No recent activity recorded yet.'
  }
};

export default MESSAGES;
