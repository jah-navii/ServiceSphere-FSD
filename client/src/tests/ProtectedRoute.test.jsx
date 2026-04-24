import React from 'react';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from './testUtils';
import ProtectedRoute from '../components/ProtectedRoute';

// ProtectedRoute uses Navigate which needs a Router — renderWithProviders provides MemoryRouter.

describe('ProtectedRoute', () => {
  const ChildComponent = () => <div>Protected Content</div>;

  it('redirects unauthenticated users to the login page', () => {
    // Store state: not authenticated
    renderWithProviders(
      <ProtectedRoute redirectTo="/login/seeker" allowedRoles={['seeker']}>
        <ChildComponent />
      </ProtectedRoute>,
      {
        preloadedState: {
          user: { isAuthenticated: false, currentUser: null, loading: false, error: null },
        },
      }
    );

    // Children should NOT be rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated with the correct role', () => {
    renderWithProviders(
      <ProtectedRoute redirectTo="/login/seeker" allowedRoles={['seeker']}>
        <ChildComponent />
      </ProtectedRoute>,
      {
        preloadedState: {
          user: {
            isAuthenticated: true,
            currentUser: { role: 'seeker', _id: 'u1', name: 'Test Seeker' },
            loading: false,
            error: null,
          },
        },
      }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('blocks a user whose role does not match allowedRoles', () => {
    renderWithProviders(
      <ProtectedRoute redirectTo="/login/seeker" allowedRoles={['seeker']}>
        <ChildComponent />
      </ProtectedRoute>,
      {
        preloadedState: {
          user: {
            isAuthenticated: true,
            currentUser: { role: 'helper', _id: 'u2', name: 'A Helper' },
            loading: false,
            error: null,
          },
        },
      }
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when allowedRoles is empty (any authenticated user is allowed)', () => {
    renderWithProviders(
      <ProtectedRoute allowedRoles={[]}>
        <ChildComponent />
      </ProtectedRoute>,
      {
        preloadedState: {
          user: {
            isAuthenticated: true,
            currentUser: { role: 'seeker', _id: 'u3' },
            loading: false,
            error: null,
          },
        },
      }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
