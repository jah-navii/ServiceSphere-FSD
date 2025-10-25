// src/features/bookingFormSlice.js
import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  customerName: '',
  date: '',
  time: '',
  address: '',
  bookings: [], // store confirmed bookings here
};

const bookingFormSlice = createSlice({
  name: 'bookingForm',
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { name, value } = action.payload;
      state[name] = value;
    },
    clearForm: (state) => {
      state.customerName = '';
      state.date = '';
      state.time = '';
      state.address = '';
    },
    addBooking: (state, action) => {
      state.bookings.push({
        id: nanoid(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        status: 'Pending',
      });
    },
  },
});

export const { updateField, clearForm, addBooking } = bookingFormSlice.actions;
export default bookingFormSlice.reducer;
