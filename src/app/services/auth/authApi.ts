import axios from 'axios';
import { BASE_URL } from '../constants';
import { User, LoginResponse, RegisterResponse } from '@/types/shared.Types';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const registerUser = async (
  email: string,
  password: string
): Promise<RegisterResponse> => {
  try {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(BASE_URL + '/api/fitness/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Ошибка регистрации' }));
      throw new Error(errorData.message || 'Ошибка регистрации');
    }

    return await response.json();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Ошибка регистрации');
  }
};

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  if (!email || !email.trim()) {
    throw new Error('Email обязателен для входа');
  }
  if (!password || !password.trim()) {
    throw new Error('Пароль обязателен для входа');
  }

  try {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(BASE_URL + '/api/fitness/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Ошибка входа' }));
      const message = errorData.message || 'Ошибка входа';
      
      if (response.status === 404) {
        throw new Error(message || 'Пользователь с таким email не найден');
      }
      throw new Error(message || `Ошибка сервера: ${response.status}`);
    }

    return await response.json();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Ошибка входа');
  }
};

export const getMe = async (): Promise<User> => {
  try {
    const response = await api.get<User>(`/api/fitness/users/me?t=${Date.now()}`);
    console.log('getMe response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data;
      const message =
        typeof errorData === 'object' && errorData !== null
          ? errorData.message || JSON.stringify(errorData)
          : typeof errorData === 'string'
            ? errorData
            : 'Ошибка получения данных пользователя';
      throw new Error(message);
    } else if (axios.isAxiosError(error) && error.request) {
      throw new Error('Нет ответа от сервера. Проверьте подключение к интернету.');
    } else {
      throw error instanceof Error
        ? error
        : new Error('Ошибка получения данных пользователя');
    }
  }
};

export const authAPI = {
  registerUser,
  login,
  getMe,
};

export default authAPI;
