import { configureStore } from '@reduxjs/toolkit';
import bookingFormReducer from './bookingFormSlice'; // adjust path


export const store = configureStore({
  reducer: {
    bookingForm: bookingFormReducer,
  },
});
