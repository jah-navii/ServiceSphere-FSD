import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  customerName: "",
  date: "",
  time: "",
  address: "",
  status: "idle", // idle | loading | succeeded | failed
};

const bookingFormSlice = createSlice({
  name: "bookingForm",
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { name, value } = action.payload;
      state[name] = value;
    },
    clearForm: (state) => {
      return initialState;
    },
    // We can track submission status here if we used Thunks, 
    // but for now we will control loading in the UI component.
  },
});

export const { updateField, clearForm } = bookingFormSlice.actions;
export default bookingFormSlice.reducer;