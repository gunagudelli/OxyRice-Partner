// // redux/slices/authSlice.js
// import { createSlice } from '@reduxjs/toolkit';

// const authSlice = createSlice({
//   name: 'auth',
//   initialState: {
//     accessToken: null,
//   },
//   reducers: {
//     setAccessToken: (state, action) => {
//       state.accessToken = action.payload;
//     },
//     clearAccessToken: (state) => {
//       state.accessToken = null;
//     },
//   },
// });

// export const { setAccessToken, clearAccessToken } = authSlice.actions;
// export default authSlice.reducer;

// redux/slices/authSlice.js (maybe named counterSlice.js in your case)
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'counter', // ← this is your current slice name
  initialState: {
    accessToken: null,
    userId: null,
    primaryType: null,
    name: null,
    // add other fields if needed
  },
  reducers: {
    setUserData: (state, action) => {
      const data = action.payload;
      state.accessToken = data.accessToken;
      state.userId = data.userId;
      state.primaryType = data.primaryType;
      state.name = data.name;
    },
    clearUserData: (state) => {
      state.accessToken = null;
      state.userId = null;
      state.primaryType = null;
      state.name = null;
    },
  },
});

export const { setUserData, clearUserData } = authSlice.actions;
export default authSlice.reducer;
