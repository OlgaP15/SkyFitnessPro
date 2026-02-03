import {
  authSliceReducer,
  register,
  loginAction,
  logout,
  restoreSession,
  clearError,
  setUser,
  addCourseToUser,
  removeCourseFromUser,
} from '../authSlice';
import { User } from '@/types/shared.Types';
import * as authApi from '@/app/services/auth/authApi';

jest.mock('@/app/services/auth/authApi', () => ({
  registerUser: jest.fn(),
  login: jest.fn(),
  getMe: jest.fn(),
}));

jest.mock('@/app/services/authToken', () => ({
  setAuthToken: jest.fn(),
}));

describe('authSlice', () => {
  const mockUser: User = {
    email: 'test@example.com',
    selectedCourses: [],
  };

  const mockToken = 'test-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('должен возвращать начальное состояние', () => {
      const state = authSliceReducer(undefined, { type: 'unknown' });
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isAuth).toBe(false);
    });
  });

  describe('register', () => {
    it('должен обрабатывать pending состояние', () => {
      const action = register.pending('', {
        email: 'test@example.com',
        password: 'password123',
      });
      const state = authSliceReducer(undefined, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('должен обрабатывать fulfilled состояние', async () => {
      (authApi.registerUser as jest.Mock).mockResolvedValue({});
      (authApi.login as jest.Mock).mockResolvedValue({ token: mockToken });
      (authApi.getMe as jest.Mock).mockResolvedValue(mockUser);

      const action = register.fulfilled(
        { user: mockUser, token: mockToken },
        '',
        { email: 'test@example.com', password: 'password123' },
      );
      const state = authSliceReducer(undefined, action);

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuth).toBe(true);
      expect(state.error).toBeNull();
    });

    it('должен обрабатывать rejected состояние', () => {
      const errorMessage = 'Ошибка регистрации';
      const action = register.rejected(
        new Error(errorMessage),
        '',
        { email: 'test@example.com', password: 'password123' },
        errorMessage,
      );
      const state = authSliceReducer(undefined, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.isAuth).toBe(false);
    });
  });

  describe('loginAction', () => {
    it('должен обрабатывать pending состояние', () => {
      const action = loginAction.pending('', {
        email: 'test@example.com',
        password: 'password123',
      });
      const state = authSliceReducer(undefined, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('должен обрабатывать fulfilled состояние', () => {
      (authApi.login as jest.Mock).mockResolvedValue({ token: mockToken });
      (authApi.getMe as jest.Mock).mockResolvedValue(mockUser);

      const action = loginAction.fulfilled(
        { user: mockUser, token: mockToken },
        '',
        { email: 'test@example.com', password: 'password123' },
      );
      const state = authSliceReducer(undefined, action);

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuth).toBe(true);
      expect(state.error).toBeNull();
    });

    it('должен обрабатывать rejected состояние', () => {
      const errorMessage = 'Ошибка входа';
      const action = loginAction.rejected(
        new Error(errorMessage),
        '',
        { email: 'test@example.com', password: 'password123' },
        errorMessage,
      );
      const state = authSliceReducer(undefined, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.isAuth).toBe(false);
    });
  });

  describe('logout', () => {
    it('должен очищать состояние', () => {
      const initialState = {
        user: mockUser,
        token: mockToken,
        loading: false,
        error: null,
        isAuth: true,
      };

      const state = authSliceReducer(initialState, logout());

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuth).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('restoreSession', () => {
    it('не изменяет состояние при вызове без токена', () => {
      const state = authSliceReducer(undefined, restoreSession());

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuth).toBe(false);
    });

    it('восстанавливает сессию по токену из sessionStorage', () => {
      const state = authSliceReducer(undefined, restoreSession(mockToken));

      expect(state.token).toBe(mockToken);
      expect(state.isAuth).toBe(true);
      expect(state.user).toBeNull();
    });
  });

  describe('clearError', () => {
    it('должен очищать ошибку', () => {
      const initialState = {
        user: null,
        token: null,
        loading: false,
        error: 'Предыдущая ошибка',
        isAuth: false,
      };

      const state = authSliceReducer(initialState, clearError());

      expect(state.error).toBeNull();
    });
  });

  describe('setUser', () => {
    it('должен устанавливать пользователя', () => {
      const newUser: User = {
        email: 'new@example.com',
        selectedCourses: ['course1'],
      };

      const state = authSliceReducer(undefined, setUser(newUser));

      expect(state.user).toEqual(newUser);
    });

    it('должен объединять локальные и серверные selectedCourses', () => {
      const initialState = {
        user: {
          email: 'test@example.com',
          selectedCourses: ['local-course1', 'local-course2'],
        },
        token: mockToken,
        loading: false,
        error: null,
        isAuth: true,
      };

      const serverUser: User = {
        email: 'test@example.com',
        selectedCourses: ['server-course1', 'local-course1'],
      };

      const state = authSliceReducer(initialState, setUser(serverUser));

      expect(state.user?.selectedCourses).toContain('local-course1');
      expect(state.user?.selectedCourses).toContain('local-course2');
      expect(state.user?.selectedCourses).toContain('server-course1');
      expect(state.user?.selectedCourses).toHaveLength(3);
    });
  });

  describe('addCourseToUser', () => {
    it('должен добавлять курс к пользователю', () => {
      const initialState = {
        user: {
          email: 'test@example.com',
          selectedCourses: ['course1'],
        },
        token: mockToken,
        loading: false,
        error: null,
        isAuth: true,
      };

      const state = authSliceReducer(initialState, addCourseToUser('course2'));

      expect(state.user?.selectedCourses).toContain('course1');
      expect(state.user?.selectedCourses).toContain('course2');
      expect(state.user?.selectedCourses).toHaveLength(2);
    });

    it('должен создавать selectedCourses если его нет', () => {
      const initialState = {
        user: {
          email: 'test@example.com',
          selectedCourses: undefined as unknown as string[],
        },
        token: mockToken,
        loading: false,
        error: null,
        isAuth: true,
      };

      const state = authSliceReducer(initialState, addCourseToUser('course1'));

      expect(state.user?.selectedCourses).toEqual(['course1']);
    });

    it('не должен добавлять дубликаты', () => {
      const initialState = {
        user: {
          email: 'test@example.com',
          selectedCourses: ['course1'],
        },
        token: mockToken,
        loading: false,
        error: null,
        isAuth: true,
      };

      const state = authSliceReducer(initialState, addCourseToUser('course1'));

      expect(state.user?.selectedCourses).toEqual(['course1']);
      expect(state.user?.selectedCourses).toHaveLength(1);
    });

    it('не должен делать ничего если пользователь не авторизован', () => {
      const initialState = {
        user: null,
        token: null,
        loading: false,
        error: null,
        isAuth: false,
      };

      const state = authSliceReducer(initialState, addCourseToUser('course1'));

      expect(state.user).toBeNull();
    });
  });

  describe('removeCourseFromUser', () => {
    it('должен удалять курс из selectedCourses', () => {
      const initialState = {
        user: {
          email: 'test@example.com',
          selectedCourses: ['course1', 'course2', 'course3'],
        },
        token: mockToken,
        loading: false,
        error: null,
        isAuth: true,
      };

      const state = authSliceReducer(
        initialState,
        removeCourseFromUser('course2'),
      );

      expect(state.user?.selectedCourses).toEqual(['course1', 'course3']);
      expect(state.user?.selectedCourses).not.toContain('course2');
    });

    it('не должен делать ничего если курс не найден', () => {
      const initialState = {
        user: {
          email: 'test@example.com',
          selectedCourses: ['course1', 'course2'],
        },
        token: mockToken,
        loading: false,
        error: null,
        isAuth: true,
      };

      const state = authSliceReducer(
        initialState,
        removeCourseFromUser('course3'),
      );

      expect(state.user?.selectedCourses).toEqual(['course1', 'course2']);
    });

    it('не должен делать ничего если пользователь не авторизован', () => {
      const initialState = {
        user: null,
        token: null,
        loading: false,
        error: null,
        isAuth: false,
      };

      const state = authSliceReducer(
        initialState,
        removeCourseFromUser('course1'),
      );

      expect(state.user).toBeNull();
    });
  });
});
