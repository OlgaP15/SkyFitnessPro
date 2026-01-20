import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { registerUser, login, getMe } from '@/app/services/auth/authApi';
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
>(
  'auth/register',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      await registerUser(email, password);
      const loginResponse: LoginResponse = await login(email, password);
      
      localStorage.setItem('token', loginResponse.token);
      
      const userData = await getMe();
      
      localStorage.setItem('user', JSON.stringify(userData));

      return {
        user: userData,
        token: loginResponse.token,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Ошибка регистрации');
      return rejectWithValue(err.message || 'Ошибка регистрации');
    }
  },
);

export const loginAction = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const loginResponse: LoginResponse = await login(email, password);
    
    localStorage.setItem('token', loginResponse.token);
    
    const userData = await getMe();
    
    localStorage.setItem('user', JSON.stringify(userData));

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
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuth = false;
      state.error = null;
    },
    restoreSession: (state) => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      if (savedUser && savedToken) {
        try {
          const parsed: User = JSON.parse(savedUser);
          state.user = parsed;
          state.token = savedToken;
          state.isAuth = true;
        } catch {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
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

export const { logout, restoreSession, clearError, setUser } =
  authSlice.actions;
export const authSliceReducer = authSlice.reducer;
