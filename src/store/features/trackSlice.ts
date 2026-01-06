import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TrackTypes {
  _id: string | number;
  name: string;
  author: string;
  release_date: string;
  genre: string[];
  duration_in_seconds: number;
  album: string;
  logo: string | null;
  track_file: string;
  starred_user: string[];
}

interface TrackState {
  tracks: TrackTypes[];
  loading: boolean;
  error: string | null;
}

const initialState: TrackState = {
  tracks: [],
  loading: false,
  error: null,
};

const trackSlice = createSlice({
  name: 'track',
  initialState,
  reducers: {
    setTracks(state, action: PayloadAction<TrackTypes[]>) {
      state.tracks = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setTracks, setLoading, setError } = trackSlice.actions;
export const trackSliceReducer = trackSlice.reducer;
