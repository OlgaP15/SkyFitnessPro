export interface User {
  email: string;
  selectedCourses: string[];
}

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  message: string;
}

export interface Course {
  _id: string;
  nameRU: string;
  nameEN: string;
  description: string;
  directions: string[];
  fitting: string[];
  workouts: string[];
  difficulty?: string;
  durationInDays?: number;
  dailyDurationInMinutes?: {
    from: number;
    to: number;
  };
}

export interface Workout {
  _id: string;
  name: string;
  video: string;
  exercises: Exercise[];
}

export interface Exercise {
  name: string;
  quantity: number;
  _id: string;
}

export interface CourseProgress {
  courseId: string;
  courseCompleted: boolean;
  workoutsProgress: WorkoutProgress[];
}

export interface WorkoutProgress {
  workoutId: string;
  workoutCompleted: boolean;
  progressData: number[];
}

export interface ProgressResponse {
  workoutId?: string;
  courseId?: string;
  workoutCompleted?: boolean;
  courseCompleted?: boolean;
  progressData: number[];
  workoutsProgress?: WorkoutProgress[];
}

export interface ApiError {
  message: string;
}
