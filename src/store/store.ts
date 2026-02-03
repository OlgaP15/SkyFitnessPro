import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore, TypedUseSelectorHook } from "react-redux";
import { courseSliceReducer } from "./features/courseSlice";
import { authSliceReducer } from "./features/authSlice";

export const makeStore = () => {
  return configureStore({
    reducer: combineReducers({
      course: courseSliceReducer,
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