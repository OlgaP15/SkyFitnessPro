import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { registerUser, login, getMe } from '@/app/services/auth/authApi';
import { setAuthToken } from '@/app/services/authToken';
import { clearPendingCourses } from '@/app/services/pendingCourses';
import { User, LoginResponse } from '@/types/shared.Types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuth: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuth: false,
};

export const register = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/register', async ({ email, password }, { rejectWithValue }) => {
  try {
    await registerUser(email, password);
    const loginResponse: LoginResponse = await login(email, password);
    setAuthToken(loginResponse.token);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('token', loginResponse.token);
    }
    const userData = await getMe();

    return {
      user: userData,
      token: loginResponse.token,
    };
  } catch (error: unknown) {
    const err =
      error instanceof Error ? error : new Error('Ошибка регистрации');
    return rejectWithValue(err.message || 'Ошибка регистрации');
  }
});

export const loginAction = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const loginResponse: LoginResponse = await login(email, password);
    setAuthToken(loginResponse.token);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('token', loginResponse.token);
    }
    const userData = await getMe();

    return {
      user: userData,
      token: loginResponse.token,
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Ошибка входа');
    return rejectWithValue(err.message || 'Ошибка входа');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      setAuthToken(null);
      clearPendingCourses();
      if (typeof window !== 'undefined') sessionStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuth = false;
      state.error = null;
    },
    restoreSession: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        state.token = action.payload;
        state.isAuth = true;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      const newUser = { ...action.payload };
      const serverCourses = newUser.selectedCourses || [];
      const localCourses = state.user?.selectedCourses ?? [];
      newUser.selectedCourses = Array.from(
        new Set([...localCourses, ...serverCourses]),
      );
      state.user = newUser;
    },
    addCourseToUser: (state, action: PayloadAction<string>) => {
      if (state.user) {
        if (!state.user.selectedCourses) state.user.selectedCourses = [];
        if (!state.user.selectedCourses.includes(action.payload)) {
          state.user.selectedCourses = [
            ...state.user.selectedCourses,
            action.payload,
          ];
        }
      }
    },
    removeCourseFromUser: (state, action: PayloadAction<string>) => {
      if (state.user?.selectedCourses) {
        state.user.selectedCourses = state.user.selectedCourses.filter(
          (id) => id !== action.payload,
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        register.fulfilled,
        (state, action: PayloadAction<{ user: User; token: string }>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuth = true;
          state.error = null;
        },
      )
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Ошибка регистрации';
        state.isAuth = false;
      })
      .addCase(loginAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginAction.fulfilled,
        (state, action: PayloadAction<{ user: User; token: string }>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuth = true;
          state.error = null;
        },
      )
      .addCase(loginAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Ошибка входа';
        state.isAuth = false;
      });
  },
});

export const {
  logout,
  restoreSession,
  clearError,
  setUser,
  addCourseToUser,
  removeCourseFromUser,
} = authSlice.actions;
export const authSliceReducer = authSlice.reducer;
