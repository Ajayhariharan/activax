// src/store/activitiesSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ActivityItem } from "../config";
import { loadActivities, saveActivities } from "../config";

export interface ActivitiesState {
  items: ActivityItem[];
}

const initialState: ActivitiesState = {
  items: loadActivities(),          
};

const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    setInitialActivities(state, action: PayloadAction<ActivityItem[]>) {
      state.items = action.payload;
      saveActivities(state.items);  
    },
    addActivity(
      state,
      action: PayloadAction<Omit<ActivityItem, "id" | "createdAt" | "updatedAt">>
    ) {
      const next: ActivityItem = {
        ...action.payload,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      state.items.unshift(next);
      saveActivities(state.items);   
    },
    updateActivity(
      state,
      action: PayloadAction<{ id: number; date?: string; text?: string }>
    ) {
      const idx = state.items.findIndex((it) => it.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = {
          ...state.items[idx],
          date: action.payload.date ?? state.items[idx].date,
          text: action.payload.text ?? state.items[idx].text,
          updatedAt: new Date().toISOString(),
        };
        saveActivities(state.items);
      }
    },
    removeActivity(state, action: PayloadAction<number>) {
      state.items = state.items.filter((it) => it.id !== action.payload);
      saveActivities(state.items);  
    },
  },
});

export const {
  setInitialActivities,
  addActivity,
  updateActivity,
  removeActivity,
} = activitiesSlice.actions;

export default activitiesSlice.reducer;
