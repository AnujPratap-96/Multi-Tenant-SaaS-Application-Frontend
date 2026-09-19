// Shared domain + API types for the migrated feature modules.

export interface ApiError {
  response?: {
    status?: number;
    data?: { message?: string };
  };
  message?: string;
}

export interface ApiEnvelope<T = unknown> {
  data: T;
}

export interface Paginated<T = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string | null;
  email: string;
  avatarUrl?: string | null;
  jobTitle?: string | null;
  bio?: string | null;
  timezone?: string | null;
  locale?: string | null;
  role?: string | null;
  tenantJobTitle?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  plan?: string;
  settings?: Record<string, unknown>;
  isActive?: boolean;
  userRole?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  color?: string;
  key?: string;
  createdAt?: string;
  updatedAt?: string;
  members?: ProjectMember[];
  departments?: { departmentId: string; department?: { id: string; name: string } }[];
  [key: string]: unknown;
}

export interface ProjectMember {
  userId: string;
  role: string;
  user?: User;
  removedAt?: string | null;
}

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  managerId?: string | null;
  manager?: User | null;
  memberCount?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface DepartmentMember {
  userId: string;
  role: string;
  user?: User;
  createdAt?: string;
  [key: string]: unknown;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  initialDueDate?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  reopenedAt?: string | null;
  blockedReason?: string | null;
  cancelledReason?: string | null;
  estimatedMinutes?: number | null;
  taskTypeId?: string | null;
  assigneeId?: string | null;
  assignees?: { userId: string; user?: User; assignedById?: string | null; assignedAt?: string; removedAt?: string | null }[];
  departments?: { departmentId: string; department?: { id: string; name: string } }[];
  createdBy?: User | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface TaskComment {
  id: string;
  taskId: string;
  comment: string;
  parentId?: string | null;
  user?: User;
  editedAt?: string | null;
  mentions?: { userId: string; user?: User }[];
  replies?: TaskComment[];
  createdAt?: string;
}

export interface TaskActivity {
  id: string;
  taskId?: string;
  userId?: string;
  action: string;
  field?: string | null;
  type?: string;
  fromValue?: string | null;
  toValue?: string | null;
  reason?: string | null;
  createdAt?: string;
  actor?: User | null;
  user?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    avatarUrl?: string | null;
  } | null;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startedAt: string;
  endedAt?: string | null;
  durationMinutes?: number | null;
  description?: string | null;
  createdAt?: string;
}

export interface Notification {
  id: string;
  type: string;
  entityType?: string | null;
  entityId?: string | null;
  message: string;
  data?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  permissions?: string[];
  createdAt?: string;
}

export interface Member {
  id?: string;
  userId: string;
  role: string;
  status?: string;
  joinedAt?: string;
  user?: User;
  [key: string]: unknown;
}

export interface Invite {
  id: string;
  email: string;
  role?: string;
  status?: string;
  token?: string;
  expiresAt?: string;
  createdAt?: string;
}

export interface PermissionDefinition {
  id: string;
  key: string;
  description?: string;
}

export interface ProjectListResponse {
  projects: Project[];
  pagination: { page: number; totalPages: number; total: number };
  [key: string]: unknown;
}

export interface TaskListResponse {
  tasks: Task[];
  pagination: { page: number; totalPages: number; total: number };
  [key: string]: unknown;
}

export interface MembersResponse {
  members: Member[];
  total?: number;
  pagination?: { page: number; totalPages: number; total: number };
  [key: string]: unknown;
}

export interface InvitesResponse {
  invites: Invite[];
  total?: number;
  pagination?: { page: number; totalPages: number; total: number };
  [key: string]: unknown;
}

export type MutateVariables<T> = T;
