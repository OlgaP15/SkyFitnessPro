import {
  courseSliceReducer,
  fetchCourses,
  fetchCourseById,
  setCourses,
  setCurrentCourse,
  setLoading,
  setError,
  clearError,
} from '../courseSlice';
import { Course } from '@/types/shared.Types';

jest.mock('@/app/services/course/courseApi', () => ({
  getCourses: jest.fn(),
  getCourseById: jest.fn(),
}));

describe('courseSlice', () => {
  const mockCourse: Course = {
    _id: 'course1',
    nameRU: 'Йога',
    nameEN: 'Yoga',
    description: 'Описание курса йоги',
    directions: ['Гибкость', 'Релаксация'],
    fitting: ['Для начинающих'],
    workouts: ['workout1', 'workout2'],
    difficulty: 'начальный',
    durationInDays: 20,
    dailyDurationInMinutes: {
      from: 10,
      to: 30,
    },
  };

  const mockCourse2: Course = {
    _id: 'course2',
    nameRU: 'Фитнес',
    nameEN: 'Fitness',
    description: 'Описание курса фитнеса',
    directions: ['Сила', 'Выносливость'],
    fitting: ['Для продвинутых'],
    workouts: ['workout3', 'workout4'],
    difficulty: 'продвинутый',
    durationInDays: 30,
    dailyDurationInMinutes: {
      from: 20,
      to: 45,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('должен возвращать начальное состояние', () => {
      const state = courseSliceReducer(undefined, { type: 'unknown' });
      expect(state.courses).toEqual([]);
      expect(state.currentCourse).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchCourses', () => {
    it('должен обрабатывать pending состояние', () => {
      const action = fetchCourses.pending('');
      const state = courseSliceReducer(undefined, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('должен обрабатывать fulfilled состояние', () => {
      const courses = [mockCourse, mockCourse2];
      const action = fetchCourses.fulfilled(courses, '');
      const state = courseSliceReducer(undefined, action);

      expect(state.loading).toBe(false);
      expect(state.courses).toEqual(courses);
      expect(state.courses).toHaveLength(2);
      expect(state.error).toBeNull();
    });

    it('должен обрабатывать rejected состояние', () => {
      const errorMessage = 'Ошибка загрузки курсов';
      const action = fetchCourses.rejected(
        new Error(errorMessage),
        '',
        undefined,
        errorMessage
      );
      const state = courseSliceReducer(undefined, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('fetchCourseById', () => {
    it('должен обрабатывать pending состояние', () => {
      const action = fetchCourseById.pending('', 'course1');
      const state = courseSliceReducer(undefined, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('должен обрабатывать fulfilled состояние', () => {
      const action = fetchCourseById.fulfilled(mockCourse, '', 'course1');
      const state = courseSliceReducer(undefined, action);

      expect(state.loading).toBe(false);
      expect(state.currentCourse).toEqual(mockCourse);
      expect(state.error).toBeNull();
    });

    it('должен обрабатывать rejected состояние', () => {
      const errorMessage = 'Ошибка загрузки курса';
      const action = fetchCourseById.rejected(
        new Error(errorMessage),
        '',
        'course1',
        errorMessage
      );
      const state = courseSliceReducer(undefined, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.currentCourse).toBeNull();
    });
  });

  describe('setCourses', () => {
    it('должен устанавливать курсы', () => {
      const courses = [mockCourse, mockCourse2];
      const state = courseSliceReducer(undefined, setCourses(courses));

      expect(state.courses).toEqual(courses);
      expect(state.courses).toHaveLength(2);
    });

    it('должен заменять существующие курсы', () => {
      const initialState = {
        courses: [mockCourse],
        currentCourse: null,
        loading: false,
        error: null,
      };

      const newCourses = [mockCourse2];
      const state = courseSliceReducer(initialState, setCourses(newCourses));

      expect(state.courses).toEqual(newCourses);
      expect(state.courses).toHaveLength(1);
    });
  });

  describe('setCurrentCourse', () => {
    it('должен устанавливать текущий курс', () => {
      const state = courseSliceReducer(undefined, setCurrentCourse(mockCourse));

      expect(state.currentCourse).toEqual(mockCourse);
    });

    it('должен очищать текущий курс при передаче null', () => {
      const initialState = {
        courses: [],
        currentCourse: mockCourse,
        loading: false,
        error: null,
      };

      const state = courseSliceReducer(initialState, setCurrentCourse(null));

      expect(state.currentCourse).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('должен устанавливать состояние загрузки в true', () => {
      const state = courseSliceReducer(undefined, setLoading(true));
      expect(state.loading).toBe(true);
    });

    it('должен устанавливать состояние загрузки в false', () => {
      const initialState = {
        courses: [],
        currentCourse: null,
        loading: true,
        error: null,
      };

      const state = courseSliceReducer(initialState, setLoading(false));
      expect(state.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('должен устанавливать ошибку', () => {
      const errorMessage = 'Ошибка загрузки курсов';
      const state = courseSliceReducer(undefined, setError(errorMessage));

      expect(state.error).toBe(errorMessage);
    });

    it('должен очищать ошибку при передаче null', () => {
      const initialState = {
        courses: [],
        currentCourse: null,
        loading: false,
        error: 'Предыдущая ошибка',
      };

      const state = courseSliceReducer(initialState, setError(null));
      expect(state.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('должен очищать ошибку', () => {
      const initialState = {
        courses: [],
        currentCourse: null,
        loading: false,
        error: 'Предыдущая ошибка',
      };

      const state = courseSliceReducer(initialState, clearError());
      expect(state.error).toBeNull();
    });
  });

  describe('интеграционные тесты', () => {
    it('должен корректно обрабатывать последовательность действий', () => {
      let state = courseSliceReducer(undefined, fetchCourses.pending(''));
      expect(state.loading).toBe(true);

      const courses = [mockCourse, mockCourse2];
      state = courseSliceReducer(state, fetchCourses.fulfilled(courses, ''));
      expect(state.loading).toBe(false);
      expect(state.courses).toEqual(courses);

      state = courseSliceReducer(state, fetchCourseById.pending('', 'course1'));
      expect(state.loading).toBe(true);

      state = courseSliceReducer(state, fetchCourseById.fulfilled(mockCourse, '', 'course1'));
      expect(state.loading).toBe(false);
      expect(state.currentCourse).toEqual(mockCourse);
    });

    it('должен корректно обрабатывать ошибки', () => {
      let state = courseSliceReducer(undefined, fetchCourses.pending(''));
      expect(state.loading).toBe(true);

      state = courseSliceReducer(
        state,
        fetchCourses.rejected(new Error('Ошибка сети'), '', undefined, 'Ошибка сети')
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Ошибка сети');

      state = courseSliceReducer(state, clearError());
      expect(state.error).toBeNull();
    });
  });
});
