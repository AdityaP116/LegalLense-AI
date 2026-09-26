import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import * as AuthContext from '@/contexts/AuthContext';
import * as ReactRouter from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('Login Component', () => {
  const mockSignInWithGoogle = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (AuthContext.useAuth as any).mockReturnValue({
      signInWithGoogle: mockSignInWithGoogle,
      user: null,
    });
    (ReactRouter.useNavigate as any).mockReturnValue(mockNavigate);
  });

  it('renders login page correctly', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByText(/Sign in to LegalLens/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    mockSignInWithGoogle.mockResolvedValueOnce(undefined);
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const loginButton = screen.getByRole('button', { name: /Continue with Google/i });
    fireEvent.click(loginButton);

    expect(loginButton).toBeDisabled();
    expect(screen.getByText(/Signing in.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles login error', async () => {
    mockSignInWithGoogle.mockRejectedValueOnce(new Error('Auth failed'));
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const loginButton = screen.getByRole('button', { name: /Continue with Google/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Auth failed')).toBeInTheDocument();
    });
    expect(loginButton).not.toBeDisabled();
  });
});
