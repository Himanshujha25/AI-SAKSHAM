import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import { errMsg } from '../../lib/utils';
import { Button, Card, Input, Label } from '../../components/ui/primitives';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(errMsg(err, 'Login failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-semibold">SentinelAI Login</h1>
        <p className="mb-4 mt-1 text-sm text-slate-500">Security analyst workspace</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Password</Label><Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
        </form>
        <p className="mt-4 text-sm text-slate-500">No account? <Link to="/auth/register" className="underline">Register</Link></p>
      </Card>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(errMsg(err, 'Registration failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-semibold">Create analyst account</h1>
        <p className="mb-4 mt-1 text-sm text-slate-500">JWT-protected · role ANALYST by default</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Password</Label><Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button disabled={busy}>{busy ? 'Creating…' : 'Register'}</Button>
        </form>
        <p className="mt-4 text-sm text-slate-500">Have an account? <Link to="/auth/login" className="underline">Sign in</Link></p>
      </Card>
    </div>
  );
}
