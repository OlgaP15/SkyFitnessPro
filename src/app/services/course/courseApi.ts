import axios from 'axios';
import { BASE_URL } from '../constants';
import {
  Course,
  Workout,
  ProgressResponse,
  ApiError,
} from '@/types/shared.Types';

const api = axios.create({
  baseURL: BASE_URL,
  transformRequest: [
    (data, headers) => {
      if (headers) {
        delete headers['Content-Type'];
      }
      if (typeof data === 'object') {
        return JSON.stringify(data);
      }
      return data;
    },
  ],
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.headers && config.headers['Content-Type']) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await api.get<Course[]>('/api/fitness/courses');
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiError;
      throw new Error(errorData.message || 'Ошибка получения курсов');
    }
    throw error;
  }
};

export const getCourseById = async (courseId: string): Promise<Course> => {
  try {
    const response = await api.get<Course>(
      `/api/fitness/courses/${courseId}`
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiError;
      throw new Error(errorData.message || 'Ошибка получения курса');
    }
    throw error;
  }
};

export const getCourseWorkouts = async (
  courseId: string
): Promise<Workout[]> => {
  try {
    const response = await api.get<Workout[]>(
      `/api/fitness/courses/${courseId}/workouts`
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiError;
      throw new Error(errorData.message || 'Ошибка получения тренировок');
    }
    throw error;
  }
};

export const getWorkoutById = async (workoutId: string): Promise<Workout> => {
  try {
    const response = await api.get<Workout>(
      `/api/fitness/workouts/${workoutId}`
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiError;
      throw new Error(errorData.message || 'Ошибка получения тренировки');
    }
    throw error;
  }
};

export const addUserCourse = async (courseId: string): Promise<ApiError> => {
  try {
    const response = await api.post<ApiError>(
      '/api/fitness/users/me/courses',
      { courseId }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiError;
      throw new Error(errorData.message || 'Ошибка добавления курса');
    }
    throw error;
  }
};

export const deleteUserCourse = async (
  courseId: string
): Promise<ApiError> => {
  try {
    const response = await api.delete<ApiError>(
      `/api/fitness/users/me/courses/${courseId}`
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiError;
      throw new Error(errorData.message || 'Ошибка удаления курса');
    }
    throw error;
  }
};

export const resetCourseProgress = async (
  courseId: string
): Promise<ApiError> => {
  try {
    const response = await api.patch<ApiError>(
      `/api/fitness/courses/${courseId}/reset`
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiError;
      throw new Error(errorData.message || 'Ошибка сброса прогресса');
    }
    throw error;
  }
};

export const getCourseProgress = async (
  courseId: string
): Promise<ProgressResponse> => {
  try {
    const response = await api.get<ProgressResponse>(
      `/api/fitness/users/me/progress?courseId=${courseId}`
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiError;
      throw new Error(errorData.message || 'Ошибка получения прогресса');
    }
    throw error;
  }
};

export const getWorkoutProgress = async (
  courseId: string,
  workoutId: string
): Promise<ProgressResponse> => {
  try {
    const response = await api.get<ProgressResponse>(
      `/api/fitness/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiError;
      throw new Error(
        errorData.message || 'Ошибка получения прогресса тренировки'
      );
    }
    throw error;
  }
};

export const saveWorkoutProgress = async (
  courseId: string,
  workoutId: string,
  progressData: number[]
): Promise<ApiError> => {
  try {
    const response = await api.patch<ApiError>(
      `/api/fitness/courses/${courseId}/workouts/${workoutId}`,
      { progressData }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiError;
      throw new Error(errorData.message || 'Ошибка сохранения прогресса');
    }
    throw error;
  }
};

export const resetWorkoutProgress = async (
  courseId: string,
  workoutId: string
): Promise<ApiError> => {
  try {
    const response = await api.patch<ApiError>(
      `/api/fitness/courses/${courseId}/workouts/${workoutId}/reset`
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiError;
      throw new Error(errorData.message || 'Ошибка сброса прогресса');
    }
    throw error;
  }
};

export const courseAPI = {
  getCourses,
  getCourseById,
  getCourseWorkouts,
  getWorkoutById,
  addUserCourse,
  deleteUserCourse,
  resetCourseProgress,
  getCourseProgress,
  getWorkoutProgress,
  saveWorkoutProgress,
  resetWorkoutProgress,
};

export default courseAPI;
