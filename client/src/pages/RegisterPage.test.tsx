import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../tests/helpers/render';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../tests/helpers/msw/server';
import { resetAllStores } from '../../tests/helpers/store';
import RegisterPage from './RegisterPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const USERNAME_PLACEHOLDER = 'johndoe';
const PASSWORD_PLACEHOLDER = 'Min. 6 characters';
const CONFIRM_PASSWORD_PLACEHOLDER = 'Repeat password';

beforeEach(() => {
  resetAllStores();
  vi.clearAllMocks();
});

describe('RegisterPage', () => {
  it('renders username + password fields and no email field', () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText(USERNAME_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(CONFIRM_PASSWORD_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('your@email.com')).toBeNull();
  });

  it('shows mismatch error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(USERNAME_PLACEHOLDER), 'testuser');
    await user.type(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER), 'password1');
    await user.type(screen.getByPlaceholderText(CONFIRM_PASSWORD_PLACEHOLDER), 'password2');
    await user.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(screen.getByText(/do not match/i)).toBeInTheDocument();
    });
  });

  it('shows length error when password is too short', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(USERNAME_PLACEHOLDER), 'testuser');
    await user.type(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER), 'short');
    await user.type(screen.getByPlaceholderText(CONFIRM_PASSWORD_PLACEHOLDER), 'short');
    await user.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 8/i)).toBeInTheDocument();
    });
  });

  it('navigates to /dashboard after successful registration', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(USERNAME_PLACEHOLDER), 'testuser');
    await user.type(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER), 'password123');
    await user.type(screen.getByPlaceholderText(CONFIRM_PASSWORD_PLACEHOLDER), 'password123');
    await user.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows API error message', async () => {
    server.use(
      http.post('/api/auth/register', () => HttpResponse.json({ error: 'Invite required' }, { status: 403 })),
    );

    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(USERNAME_PLACEHOLDER), 'testuser');
    await user.type(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER), 'password123');
    await user.type(screen.getByPlaceholderText(CONFIRM_PASSWORD_PLACEHOLDER), 'password123');
    await user.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(screen.getByText('Invite required')).toBeInTheDocument();
    });
  });

  it('toggles password visibility for both password fields', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const passwordInput = screen.getByPlaceholderText(PASSWORD_PLACEHOLDER);
    const confirmInput = screen.getByPlaceholderText(CONFIRM_PASSWORD_PLACEHOLDER);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: '' });
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmInput).toHaveAttribute('type', 'text');
  });
});
