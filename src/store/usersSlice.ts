// src/store/usersSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { UserItem } from "../config";
import { saveUsers } from "../config";


export interface UsersState {
  users: UserItem[];
  currentUser: UserItem | null;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // called once from App to seed from DEFAULT_ADMINS/localStorage
    setInitialUsers(state, action: PayloadAction<UserItem[]>) {
      state.users = action.payload;
    },
    addUser(state, action: PayloadAction<UserItem>) {
  state.users.unshift(action.payload);
  saveUsers(state.users);
},
    updateUser(state, action: PayloadAction<UserItem>) {
  state.users = state.users.map((u) =>
    u.id === action.payload.id ? action.payload : u
  );

  // ✅ also update currentUser if same
  if (state.currentUser?.id === action.payload.id) {
    state.currentUser = action.payload;
  }

  saveUsers(state.users); // ✅ persist
},

   removeUser(state, action: PayloadAction<number>) {
  state.users = state.users.filter((u) => u.id !== action.payload);
  saveUsers(state.users);
},
    login(state, action: PayloadAction<UserItem>) {
      state.currentUser = action.payload;
    },
    logout(state) {
      state.currentUser = null;
    },
  },
});

export const {
  setInitialUsers,
  addUser,
  updateUser,
  removeUser,
  login,
  logout,
} = usersSlice.actions;

export default usersSlice.reducer;
