import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAdminAuth();

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const fromPath = location.state?.from || '/admin';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      setIsSubmitting(true);
      await login(credentials);
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-white/10 bg-[#1a1a1a] p-8 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold/80">Secure Access</p>
          <h1 className="text-3xl font-display text-gold mt-2">Admin Login</h1>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            required
            value={credentials.username}
            onChange={(event) => setCredentials((prev) => ({ ...prev, username: event.target.value }))}
            className="w-full bg-[#111111] border border-white/20 px-3 py-2 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={credentials.password}
            onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
            className="w-full bg-[#111111] border border-white/20 px-3 py-2 outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gold text-[#111111] py-3 text-sm uppercase tracking-wider font-semibold disabled:opacity-60"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <Link to="/" className="block text-sm text-white/70 hover:text-gold transition-colors text-center">
          Back to Store
        </Link>
      </div>
    </div>
  );
}
