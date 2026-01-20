import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Course } from '@/types/shared.Types';
import { getCourses, getCourseById } from '@/app/services/course/courseApi';

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,
};

export const fetchCourses = createAsyncThunk<
  Course[],
  void,
  { rejectValue: string }
>('course/fetchCourses', async (_, { rejectWithValue }) => {
  try {
    const courses = await getCourses();
    return courses;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Ошибка загрузки курсов');
    return rejectWithValue(err.message);
  }
});

export const fetchCourseById = createAsyncThunk<
  Course,
  string,
  { rejectValue: string }
>('course/fetchCourseById', async (courseId, { rejectWithValue }) => {
  try {
    const course = await getCourseById(courseId);
    return course;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Ошибка загрузки курса');
    return rejectWithValue(err.message);
  }
});

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setCourses(state, action: PayloadAction<Course[]>) {
      state.courses = action.payload;
    },
    setCurrentCourse(state, action: PayloadAction<Course | null>) {
      state.currentCourse = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.loading = false;
        state.courses = action.payload;
        state.error = null;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Ошибка загрузки курсов';
      })
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action: PayloadAction<Course>) => {
        state.loading = false;
        state.currentCourse = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Ошибка загрузки курса';
      });
  },
});

export const { setCourses, setCurrentCourse, setLoading, setError, clearError } =
  courseSlice.actions;
export const courseSliceReducer = courseSlice.reducer;
