import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Login from '@/app/auth/login/page';
import Register from '@/app/auth/register/page';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock SweetAlert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

describe('Authentication', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  // Login Tests
  describe('Login Page', () => {
    it('renders login form', () => {
      render(<Login />);
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it('handles successful login when button is clicked', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            token: 'fake-token',
            user: {
              id: '1',
              username: 'testuser',
              email: 'test@example.com',
              role: 'student',
            },
          }),
      };

      global.fetch = jest.fn().mockResolvedValueOnce(mockResponse as Response);
      render(<Login />);

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('fake-token');
      });
    });

    it('handles login failure', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      };

      global.fetch = jest.fn().mockResolvedValueOnce(mockResponse as Response);
      render(<Login />);

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'wrong@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
      });
    });
  });

  // Register Tests
  describe('Register Page', () => {
    it('renders register form', () => {
      render(<Register />);

      expect(
        screen.getByRole('textbox', { name: /username/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: /email address/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sign up/i })
      ).toBeInTheDocument();
    });

    it('handles successful registration when button is clicked', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            token: 'fake-token',
            user: {
              id: '1',
              username: 'newuser',
              email: 'new@example.com',
              role: 'student',
            },
          }),
      };

      global.fetch = jest.fn().mockResolvedValueOnce(mockResponse as Response);
      render(<Register />);

      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'newuser' },
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'new@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/register',
          expect.any(Object)
        );
      });
    });
  });
});
