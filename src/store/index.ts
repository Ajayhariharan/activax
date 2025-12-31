// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./usersSlice";
import activitiesReducer from "./activitiesSlice";
import { saveUsers, saveActivities} from "../config";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    activities: activitiesReducer,   // ✅ must be here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// persist users and activities to localStorage on change
let prevUsers: RootState["users"]["users"] | undefined;
let prevActivities: RootState["activities"]["items"] | undefined;

store.subscribe(() => {
  const state = store.getState();

  const users = state.users.users;
  if (users !== prevUsers) {
    saveUsers(users);
    prevUsers = users;
  }

  const activities = state.activities.items;
if (activities !== prevActivities) {
  saveActivities(activities);       // ✅ uses same key as loadActivities
  prevActivities = activities;
}
});
