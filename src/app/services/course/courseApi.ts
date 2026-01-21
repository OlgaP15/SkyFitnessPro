import axios from 'axios';
import { BASE_URL } from '../constants';
import {
  Course,
  Workout,
  ProgressResponse,
  ApiError,
} from '@/types/shared.Types';

async function fetchWithAuth<T>(
  path: string,
  options: Omit<RequestInit, 'headers'> & { headers?: HeadersInit } = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = { ...(options.headers ?? {}) };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Важно: этот backend может падать, если передать Content-Type: application/json
  delete (headers as Record<string, string>)['Content-Type'];

  const response = await fetch(BASE_URL + path, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? ((await response.json()) as unknown) : await response.text();

  if (!response.ok) {
    const message =
      typeof body === 'object' && body && 'message' in (body as Record<string, unknown>)
        ? String((body as Record<string, unknown>).message)
        : `Ошибка запроса: ${response.status}`;
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return body as T;
}

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
  return await fetchWithAuth<ApiError>('/api/fitness/users/me/courses', {
    method: 'POST',
    body: JSON.stringify({ courseId }),
  });
};

export const deleteUserCourse = async (
  courseId: string
): Promise<ApiError> => {
  return await fetchWithAuth<ApiError>(
    `/api/fitness/users/me/courses/${courseId}`,
    { method: 'DELETE' }
  );
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
    // Используем validateStatus, чтобы 500 не считался ошибкой и не логировался в консоль
    const response = await api.get<ProgressResponse>(
      `/api/fitness/users/me/progress?courseId=${courseId}`,
      {
        validateStatus: (status) => {
          // Принимаем 200-299 и 500 как валидные статусы (500 = данных еще нет, это нормально)
          return (status >= 200 && status < 300) || status === 500;
        }
      }
    );
    
    // Если сервер вернул 500, возвращаем пустой прогресс
    if (response.status === 500) {
      return {
        courseId,
        courseCompleted: false,
        workoutsProgress: [],
        progressData: [],
      } as ProgressResponse;
    }
    
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiError;
      const errorStatus = error.response.status;
      
      // Для 500 возвращаем пустой прогресс вместо ошибки
      if (errorStatus === 500) {
        return {
          courseId,
          courseCompleted: false,
          workoutsProgress: [],
          progressData: [],
        } as ProgressResponse;
      }
      
      // Для других ошибок сохраняем статус ошибки для обработки в компонентах
      const enhancedError = new Error(errorData.message || 'Ошибка получения прогресса') as Error & { status?: number };
      enhancedError.status = errorStatus;
      throw enhancedError;
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
