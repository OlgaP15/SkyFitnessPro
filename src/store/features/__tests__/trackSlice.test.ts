import {
  trackSliceReducer,
  setTracks,
  setLoading,
  setError,
} from '../courseSlice';
import { TrackTypes } from '../courseSlice';

describe('trackSlice', () => {
  const mockTrack: TrackTypes = {
    _id: 1,
    name: 'Тестовый трек',
    author: 'Тестовый артист',
    release_date: '2023-01-01',
    genre: ['Поп'],
    duration_in_seconds: 180,
    album: 'Тестовый альбом',
    logo: null,
    track_file: 'test.mp3',
    starred_user: [],
  };

  const mockTrack2: TrackTypes = {
    _id: 2,
    name: 'Тестовый трек 2',
    author: 'Тестовый артист 2',
    release_date: '2023-01-02',
    genre: ['Рок'],
    duration_in_seconds: 200,
    album: 'Тестовый альбом 2',
    logo: null,
    track_file: 'test2.mp3',
    starred_user: [],
  };

  it('должен возвращать начальное состояние', () => {
    const state = trackSliceReducer(undefined, { type: 'unknown' });
    expect(state.tracks).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('должен устанавливать треки', () => {
    const tracks = [mockTrack, mockTrack2];
    const state = trackSliceReducer(undefined, setTracks(tracks));
    expect(state.tracks).toEqual(tracks);
    expect(state.tracks).toHaveLength(2);
  });

  it('должен устанавливать состояние загрузки', () => {
    const state = trackSliceReducer(undefined, setLoading(true));
    expect(state.loading).toBe(true);
    
    const state2 = trackSliceReducer(state, setLoading(false));
    expect(state2.loading).toBe(false);
  });

  it('должен устанавливать ошибку', () => {
    const errorMessage = 'Ошибка загрузки треков';
    const state = trackSliceReducer(undefined, setError(errorMessage));
    expect(state.error).toBe(errorMessage);
  });

  it('должен очищать ошибку', () => {
    const initialState = {
      tracks: [],
      loading: false,
      error: 'Предыдущая ошибка',
    };
    const state = trackSliceReducer(initialState, setError(null));
    expect(state.error).toBeNull();
  });
});
