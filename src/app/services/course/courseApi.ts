import { BASE_URL } from '../constants';
import {
  Course,
  Workout,
  ProgressResponse,
  ApiError,
} from '@/types/shared.Types';

/**
 * Вспомогательная функция для запросов с авторизацией
 */
async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === 'object' && data?.message
        ? data.message
        : `Ошибка запроса: ${response.status}`;
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return data as T;
}

/**
 * Получить все курсы
 * GET /api/fitness/courses
 */
export const getCourses = async (): Promise<Course[]> => {
  const response = await fetch(`${BASE_URL}/api/fitness/courses`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Ошибка получения курсов');
  }

  return data;
};

/**
 * Получить один курс по ID
 * GET /api/fitness/courses/[courseId]
 */
export const getCourseById = async (courseId: string): Promise<Course> => {
  const response = await fetch(`${BASE_URL}/api/fitness/courses/${courseId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Ошибка получения курса');
  }

  return data;
};

/**
 * Получить список тренировок курса
 * GET /api/fitness/courses/[courseId]/workouts
 * Требует авторизации
 */
export const getCourseWorkouts = async (
  courseId: string,
): Promise<Workout[]> => {
  return await fetchWithAuth<Workout[]>(
    `/api/fitness/courses/${courseId}/workouts`,
  );
};

/**
 * Получить данные по тренировке
 * GET /api/fitness/workouts/[workoutId]
 * Требует авторизации
 */
export const getWorkoutById = async (workoutId: string): Promise<Workout> => {
  return await fetchWithAuth<Workout>(`/api/fitness/workouts/${workoutId}`);
};

/**
 * Добавить курс для пользователя
 * POST /api/fitness/users/me/courses
 * Требует авторизации
 */
export const addUserCourse = async (courseId: string): Promise<ApiError> => {
  return await fetchWithAuth<ApiError>('/api/fitness/users/me/courses', {
    method: 'POST',
    body: JSON.stringify({ courseId }),
  });
};

/**
 * Удалить курс у пользователя
 * DELETE /api/fitness/users/me/courses/[courseId]
 * Требует авторизации
 */
export const deleteUserCourse = async (courseId: string): Promise<ApiError> => {
  return await fetchWithAuth<ApiError>(
    `/api/fitness/users/me/courses/${courseId}`,
    {
      method: 'DELETE',
    },
  );
};

/**
 * Удалить весь прогресс по курсу
 * PATCH /api/fitness/courses/[courseId]/reset
 * Требует авторизации
 */
export const resetCourseProgress = async (
  courseId: string,
): Promise<ApiError> => {
  return await fetchWithAuth<ApiError>(
    `/api/fitness/courses/${courseId}/reset`,
    {
      method: 'PATCH',
    },
  );
};

/**
 * Получить прогресс пользователя по всему курсу
 * GET /api/fitness/users/me/progress?courseId={courseId}
 * Требует авторизации
 */
export const getCourseProgress = async (
  courseId: string,
): Promise<ProgressResponse> => {
  return await fetchWithAuth<ProgressResponse>(
    `/api/fitness/users/me/progress?courseId=${courseId}`,
  );
};

/**
 * Получить прогресс пользователя по тренировке
 * GET /api/fitness/users/me/progress?courseId={courseId}&workoutId={workoutID}
 * Требует авторизации
 */
export const getWorkoutProgress = async (
  courseId: string,
  workoutId: string,
): Promise<ProgressResponse> => {
  return await fetchWithAuth<ProgressResponse>(
    `/api/fitness/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`,
  );
};

/**
 * Сохранить прогресс тренировки
 * PATCH /api/fitness/courses/[courseId]/workouts/[workoutId]
 * Требует авторизации
 */
export const saveWorkoutProgress = async (
  courseId: string,
  workoutId: string,
  progressData: number[],
): Promise<ApiError> => {
  return await fetchWithAuth<ApiError>(
    `/api/fitness/courses/${courseId}/workouts/${workoutId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ progressData }),
    },
  );
};

/**
 * Удалить весь прогресс по тренировке
 * PATCH /api/fitness/courses/[courseId]/workouts/[workoutId]/reset
 * Требует авторизации
 */
export const resetWorkoutProgress = async (
  courseId: string,
  workoutId: string,
): Promise<ApiError> => {
  return await fetchWithAuth<ApiError>(
    `/api/fitness/courses/${courseId}/workouts/${workoutId}/reset`,
    { method: 'PATCH' },
  );
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
