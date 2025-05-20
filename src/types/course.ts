
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
  created_at: string;
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

// Parameters types for RPC functions
export type GetCourseModulesParams = {
  course_id_param: string;
}

export type GetUserProgressParams = {
  user_id_param: string;
  course_id_param: string;
}

export type UpdateUserProgressParams = {
  progress_id_param: string;
  completed_param: boolean;
}

export type CreateUserProgressParams = {
  user_id_param: string;
  module_id_param: string;
  completed_param: boolean;
}

// Define return types for RPC functions
export type GetCourseModulesResponse = Module[];
export type GetUserProgressResponse = UserProgress[];
export type UpdateUserProgressResponse = UserProgress;
export type CreateUserProgressResponse = UserProgress;
