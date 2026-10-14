import { useState } from 'react';
import { authService } from '../../services/auth.service.js';

function GoogleIcon() {
  return <svg aria-hidden="true" className="google-login-icon" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.24-.2-1.78H12v3.37h5.38a4.6 4.6 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.73-4.33 2.73-7.14Z" />
    <path fill="#34A853" d="M12 21.99c2.63 0 4.84-.87 6.45-2.35l-3.24-2.52c-.9.6-2.05.96-3.21.96-2.47 0-4.57-1.67-5.32-3.91H3.33v2.6A9.74 9.74 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.68 14.17A5.86 5.86 0 0 1 6.37 12c0-.75.13-1.48.31-2.17V7.23H3.33A9.74 9.74 0 0 0 2.26 12c0 1.57.38 3.05 1.07 4.77l3.35-2.6Z" />
    <path fill="#EA4335" d="M12 5.92c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 2.98 14.63 2 12 2a9.74 9.74 0 0 0-8.67 5.23l3.35 2.6C7.43 7.59 9.53 5.92 12 5.92Z" />
  </svg>;
}

export default function GoogleLoginButton({
  signIn = () => authService.googleLogin(),
  onSuccess,
  onError,
  theme = 'light',
  disabled = false,
  className = '',
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const response = await signIn();
      onSuccess?.(response);
    } catch (error) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }

  return <button
    type="button"
    className={`google-login-button google-login-button-${theme} ${className}`}
    onClick={handleClick}
    disabled={disabled || loading}
    aria-busy={loading}
  >
    <GoogleIcon />
    <span>{loading ? 'Đang kết nối với Google...' : 'Tiếp tục với Google'}</span>
  </button>;
}
