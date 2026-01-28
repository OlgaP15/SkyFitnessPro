import { BASE_URL } from '../constants';
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

/**
 * Получить данные текущего пользователя
 * GET /api/fitness/users/me
 * Требует авторизации
 */
export const getMe = async (): Promise<User> => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Токен авторизации не найден');
  }

  const response = await fetch(`${BASE_URL}/api/fitness/users/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Ошибка получения данных пользователя');
  }

  return data;
};

export const authAPI = {
  registerUser,
  login,
  getMe,
};

export default authAPI;
