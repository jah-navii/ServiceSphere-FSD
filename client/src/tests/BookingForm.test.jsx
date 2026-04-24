import React from 'react';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from './testUtils';
import BookingForm from '../pages/BookingForm/BookingForm';

// Mock heavy assets and context dependencies
vi.mock('../assets/logo.png', () => ({ default: 'logo.png' }));
vi.mock('../assets/profile-picture.png', () => ({ default: 'profile.png' }));
vi.mock('../utils/bookingApi', () => ({ bookingApi: { create: vi.fn() } }));
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

// Mock Navbar and Footer to keep tests focused on the form
vi.mock('../components/Navbar/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock('../components/Footer/Footer', () => ({ default: () => <footer data-testid="footer" /> }));

describe('BookingForm', () => {
  const authenticatedState = {
    user: {
      isAuthenticated: true,
      currentUser: { _id: 'seeker1', name: 'Test Seeker', role: 'seeker' },
      loading: false,
      error: null,
    },
    bookingForm: {
      customerName: '',
      date: '',
      time: '',
      address: '',
      status: 'idle',
    },
  };

  it('renders the Navbar and Footer', () => {
    renderWithProviders(<BookingForm />, {
      preloadedState: authenticatedState,
      initialEntries: [
        {
          pathname: '/booking',
          state: { helperId: 'h1', helperName: 'John', serviceName: 'Cleaning', price: 500 },
        },
      ],
    });

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('redirects to /search when accessed without location state (no service selected)', () => {
    // When BookingForm is rendered without location.state (direct URL access),
    // it should redirect rather than show the form
    renderWithProviders(<BookingForm />, {
      preloadedState: authenticatedState,
      initialEntries: ['/booking'],
    });

    // The form heading should not appear — user is redirected
    expect(screen.queryByRole('heading', { name: /book/i })).not.toBeInTheDocument();
  });
});
