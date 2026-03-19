import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null as string | null,
  },
  reducers: {
    setCsrfToken: (state, action) => {
      state.token = action.payload;
    },
  },
});

export const { setCsrfToken } = authSlice.actions;
