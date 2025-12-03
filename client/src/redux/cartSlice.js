// src/redux/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // each item: { id, name, price, quantity, image? }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload; // { id, name, price, image?, quantity? }
      const existingItem = state.items.find((item) => item.id === newItem.id);

      if (existingItem) {
        // If item already in cart, increase quantity
        existingItem.quantity += newItem.quantity ? newItem.quantity : 1;
      } else {
        // Add new item with quantity (default 1)
        state.items.push({
          ...newItem,
          quantity: newItem.quantity ? newItem.quantity : 1,
        });
      }
    },

    incrementQuantity: (state, action) => {
      const id = action.payload; // item id
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.quantity += 1;
      }
    },

    decrementQuantity: (state, action) => {
      const id = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (!item) return;

      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        // if quantity becomes 0, remove item
        state.items = state.items.filter((i) => i.id !== id);
      }
    },

    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
