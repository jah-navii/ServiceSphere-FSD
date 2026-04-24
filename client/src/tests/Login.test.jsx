import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from './testUtils';
import LoginForm from '../components/LoginForm/LoginForm';

// Mock assets that Vite handles but jsdom doesn't
vi.mock('../assets/logo.png', () => ({ default: 'logo.png' }));

// Mock the API client so we never hit the network
vi.mock('../utils/api', () => ({
  default: { post: vi.fn() },
}));

import apiClient from '../utils/api';

describe('LoginForm', () => {
  const defaultProps = {
    title: 'Login as a Seeker',
    apiEndpoint: '/api/auth/login/seeker',
    signupPath: '/signup/seeker',
    redirectPath: '/home',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form title', () => {
    renderWithProviders(<LoginForm {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /login as a seeker/i })).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    renderWithProviders(<LoginForm {...defaultProps} />);
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderWithProviders(<LoginForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows an error message when the API returns an error', async () => {
    apiClient.post.mockRejectedValueOnce(new Error('Invalid credentials'));

    const user = userEvent.setup();
    renderWithProviders(<LoginForm {...defaultProps} />);

    await user.type(screen.getByPlaceholderText(/enter your email/i), 'bad@test.com');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('calls apiClient.post with email and password on submit', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { token: 'tok', user: { role: 'seeker' } } });

    const user = userEvent.setup();
    renderWithProviders(<LoginForm {...defaultProps} />);

    await user.type(screen.getByPlaceholderText(/enter your email/i), 'seeker@test.com');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'pass1234');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login/seeker', {
      email: 'seeker@test.com',
      password: 'pass1234',
    });
  });
});
