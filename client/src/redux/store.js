import { configureStore } from '@reduxjs/toolkit';
import bookingFormReducer from './bookingFormSlice'; // adjust path
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    bookingForm: bookingFormReducer,
  },
});
