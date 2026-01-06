import {
  trackSliceReducer,
  setCurrentTrack,
  setIsPlay,
  setCurrentPlaylist,
  toggleFavorite,
  loadFavoriteTracks,
} from '../trackSlice';
import { TrackTypes } from '@/SharedTypes/sharedTypes';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('trackSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

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
    expect(state.currentTrack).toBeNull();
    expect(state.isPlay).toBe(false);
    expect(state.favoriteTracks).toEqual([]);
    expect(state.favoriteTracksIds).toEqual([]);
  });

  it('должен устанавливать текущий трек', () => {
    const state = trackSliceReducer(undefined, setCurrentTrack(mockTrack));
    expect(state.currentTrack).toEqual(mockTrack);
  });

  it('должен устанавливать состояние воспроизведения', () => {
    const state = trackSliceReducer(undefined, setIsPlay(true));
    expect(state.isPlay).toBe(true);
  });

  it('должен устанавливать текущий плейлист', () => {
    const tracks = [mockTrack, mockTrack2];
    const state = trackSliceReducer(undefined, setCurrentPlaylist(tracks));
    expect(state.currentPlaylist).toEqual(tracks);
  });

  it('должен добавлять трек в избранное', () => {
    const state = trackSliceReducer(undefined, toggleFavorite(mockTrack));

    expect(state.favoriteTracks).toContainEqual(mockTrack);
    expect(state.favoriteTracksIds).toContain('1');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'favoriteTracks',
      JSON.stringify([mockTrack]),
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'favoriteTracksIds',
      JSON.stringify(['1']),
    );
  });

  it('должен удалять трек из избранного', () => {
    const initialState = {
      currentTrack: null,
      isPlay: false,
      currentPlaylist: [],
      shuffle: false,
      repeat: false,
      shuffledPlaylist: [],
      currentIndex: -1,
      allTracks: [],
      fetchError: null,
      fetchIsLoading: false,
      favoriteTracks: [mockTrack],
      favoriteTracksIds: ['1'],
      filteredFavoriteTracks: [],
      favoriteLoading: false,
    };

    const state = trackSliceReducer(initialState, toggleFavorite(mockTrack));

    expect(state.favoriteTracks).not.toContainEqual(mockTrack);
    expect(state.favoriteTracksIds).not.toContain('1');
  });

  it('должен загружать избранные треки из localStorage', () => {
    const favoriteTracks = [mockTrack];
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'favoriteTracks') return JSON.stringify(favoriteTracks);
      if (key === 'favoriteTracksIds') return JSON.stringify(['1']);
      return null;
    });

    const state = trackSliceReducer(undefined, loadFavoriteTracks());

    expect(state.favoriteTracks).toEqual(favoriteTracks);
    expect(state.favoriteTracksIds).toEqual(['1']);
  });
});
