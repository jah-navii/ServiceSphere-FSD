/**
 * Shared test utilities for client smoke tests.
 * Provides a render wrapper that includes Redux store + React Router.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/userSlice';
import bookingFormReducer from '../redux/bookingFormSlice';

/**
 * Build a fresh Redux store with optional preloaded state.
 */
export const buildStore = (preloadedState = {}) =>
  configureStore({
    reducer: { user: userReducer, bookingForm: bookingFormReducer },
    preloadedState,
  });

/**
 * Render a component wrapped in a Provider + MemoryRouter.
 *
 * @param {React.ReactElement} ui
 * @param {{ store?: object, initialEntries?: string[], preloadedState?: object }} options
 */
export const renderWithProviders = (
  ui,
  { store, initialEntries = ['/'], preloadedState = {} } = {}
) => {
  const testStore = store ?? buildStore(preloadedState);
  return {
    store: testStore,
    ...render(
      <Provider store={testStore}>
        <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
      </Provider>
    ),
  };
};
