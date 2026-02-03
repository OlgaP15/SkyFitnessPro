import { BASE_URL } from '../constants';
import { getAuthToken, setAuthToken } from '@/app/services/authToken';
import { User, LoginResponse, RegisterResponse } from '@/types/shared.Types';

/**
 * Регистрация нового пользователя
 * POST /api/fitness/auth/register
 */
export const registerUser = async (
  email: string,
  password: string,
): Promise<RegisterResponse> => {
  const response = await fetch(`${BASE_URL}/api/fitness/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Ошибка регистрации');
  }

  return data;
};

/**
 * Авторизация пользователя
 * POST /api/fitness/auth/login
 */
export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  if (!email || !email.trim()) {
    throw new Error('Email обязателен для входа');
  }
  if (!password || !password.trim()) {
    throw new Error('Пароль обязателен для входа');
  }

  const response = await fetch(`${BASE_URL}/api/fitness/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Ошибка входа');
  }

  return data;
};

/** Ошибка с кодом ответа API */
export type AuthApiError = Error & { status?: number };

/**
 * Получить данные текущего пользователя
 * GET /api/fitness/users/me
 * Требует авторизации
 */
export const getMe = async (): Promise<User> => {
  const token = getAuthToken();

  if (!token) {
    const err = new Error('Токен авторизации не найден') as AuthApiError;
    err.status = 401;
    throw err;
  }

  const response = await fetch(`${BASE_URL}/api/fitness/users/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(
      data?.message || 'Ошибка получения данных пользователя',
    ) as AuthApiError;
    err.status = response.status;
    if (response.status === 401 || response.status === 400) {
      setAuthToken(null);
    }
    throw err;
  }

  return data;
};

export const authAPI = {
  registerUser,
  login,
  getMe,
};

export default authAPI;
