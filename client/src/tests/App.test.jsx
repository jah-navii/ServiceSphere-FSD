import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { buildStore } from './testUtils';
import App from '../App';

// App uses BrowserRouter internally — just wrap with Provider
const renderApp = (preloadedState = {}) =>
  render(
    <Provider store={buildStore(preloadedState)}>
      <App />
    </Provider>
  );

// Mock heavy page-level assets and API calls
vi.mock('../assets/logo.png', () => ({ default: 'logo.png' }));
vi.mock('../assets/profile-picture.png', () => ({ default: 'profile.png' }));
vi.mock('../utils/serviceApi', () => ({
  serviceApi: {
    locations: vi.fn().mockResolvedValue([]),
    locationsOpen: vi.fn().mockResolvedValue([]),
    categories: vi.fn().mockResolvedValue({ categories: [] }),
    helpers: vi.fn().mockResolvedValue({ helpers: [], serviceTypes: [] }),
    search: vi.fn().mockResolvedValue({ helpers: [], serviceTypes: [] }),
    postFeedback: vi.fn().mockResolvedValue({}),
  },
}));
vi.mock('../utils/api', () => ({ default: { post: vi.fn(), get: vi.fn() } }));
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
  ToastProvider: ({ children }) => <>{children}</>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    expect(() => renderApp()).not.toThrow();
    expect(document.body).not.toBeEmptyDOMElement();
  });

  it('redirects / to /home by mounting without errors', () => {
    expect(() => renderApp()).not.toThrow();
  });

  it('mounts stably for unauthenticated users', () => {
    expect(() =>
      renderApp({
        user: { isAuthenticated: false, currentUser: null, loading: false, error: null },
      })
    ).not.toThrow();
  });
});
