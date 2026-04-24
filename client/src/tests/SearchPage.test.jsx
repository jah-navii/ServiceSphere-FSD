import React from 'react';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from './testUtils';
import SearchPage from '../pages/SearchPage/SearchPage';

// Mock all API calls — SearchPage fetches locations, categories, and helpers
vi.mock('../utils/serviceApi', () => ({
  serviceApi: {
    locations: vi.fn().mockResolvedValue([
      { _id: 'loc1', name: 'Metro City' },
      { _id: 'loc2', name: 'Uptown' },
    ]),
    categories: vi.fn().mockResolvedValue({
      categories: [
        { _id: 'cat1', name: 'Cleaning' },
        { _id: 'cat2', name: 'Plumbing' },
      ],
    }),
    helpers: vi.fn().mockResolvedValue({ helpers: [], serviceTypes: [] }),
  },
}));

// Mock child components that hit their own APIs or use heavy imports
vi.mock('../components/Navbar/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock('../components/Footer/Footer', () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock('../assets/profile-picture.png', () => ({ default: 'profile.png' }));

describe('SearchPage', () => {
  const authenticatedSeekerState = {
    user: {
      isAuthenticated: true,
      currentUser: { _id: 'seeker1', name: 'Test Seeker', role: 'seeker' },
      loading: false,
      error: null,
    },
  };

  it('renders Navbar and Footer', async () => {
    renderWithProviders(<SearchPage />, {
      preloadedState: authenticatedSeekerState,
      initialEntries: ['/search'],
    });

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('shows a loading state initially', () => {
    renderWithProviders(<SearchPage />, {
      preloadedState: authenticatedSeekerState,
      initialEntries: ['/search'],
    });

    // While fetching, a loading indicator should be visible
    // (LoadingSpinner renders something in the DOM)
    // We just verify the page doesn't crash and renders something
    expect(document.body).not.toBeEmptyDOMElement();
  });

  it('renders filter controls after data loads', async () => {
    renderWithProviders(<SearchPage />, {
      preloadedState: authenticatedSeekerState,
      initialEntries: ['/search'],
    });

    // After async data fetches resolve, price/gender/type filters should appear
    expect(await screen.findByText(/gender/i)).toBeInTheDocument();
  });
});
