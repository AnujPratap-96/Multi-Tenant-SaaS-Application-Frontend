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
  email: string;
  avatarUrl?: string | null;
  role?: string | null;
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
  [key: string]: unknown;
}

export interface ProjectMember {
  userId: string;
  role: string;
  user?: User;
  removedAt?: string | null;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  completedAt?: string | null;
  assigneeId?: string | null;
  assignees?: { userId: string; user?: User }[];
  createdBy?: User | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface TaskComment {
  id: string;
  taskId: string;
  comment: string;
  user?: User;
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
