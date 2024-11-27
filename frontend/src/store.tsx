import { configureStore } from "@reduxjs/toolkit";
import betReducer from "./utils/betSlice";

export const store = configureStore({
  reducer: {
    bets: betReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;