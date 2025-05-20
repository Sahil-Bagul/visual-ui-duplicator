
export interface Module {
  id: string;
  title: string;
  content: string;
  module_order: number;
  course_id: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  module_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface CourseWithProgress {
  id: string;
  title: string;
  description: string;
  price: number;
  modules: Module[];
  totalModules: number;
  completedModules: number;
  progress: number;
}

// Custom types for our RPC function responses
export type GetCourseModulesResponse = Module[];
export type GetUserProgressResponse = UserProgress[];
export type UpdateUserProgressResponse = UserProgress;
export type CreateUserProgressResponse = UserProgress;
