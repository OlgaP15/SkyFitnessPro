import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore, TypedUseSelectorHook } from "react-redux";
import { trackSliceReducer } from "./features/trackSlice";
import { authSliceReducer } from "./features/authSlice";

export const makeStore = () => {
  return configureStore({
    reducer: combineReducers({
      tracks: trackSliceReducer,
      auth: authSliceReducer,
    }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore: () => AppStore = useStore;