'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AuthPage() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError('Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.');
    } else {
      router.push('/');
    }
    setLoading(false);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    if (error) {
      setError('No se pudo crear la cuenta. ' + error.message);
    } else {
      setSuccess('¡Cuenta creada! Revisa tu correo para confirmar tu email antes de iniciar sesión.');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page" style={{ minHeight: 'calc(100vh - 6.4rem)' }}>
      <main className="auth-main">
        <div className="auth-card">
          {/* Left image panel */}
          <div className="auth-card__side-image">
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
              alt="Chef cocinando"
            />
            <div className="auth-card__side-overlay">
              <span className="auth-card__side-quote">"</span>
              <h2 className="auth-card__side-title">Únete a la mayor comunidad de cocineros.</h2>
              <p className="auth-card__side-desc">
                Descubre miles de recetas, comparte tus creaciones y conecta con apasionados de la gastronomía mundial.
              </p>
            </div>
          </div>

          {/* Right form panel */}
          <div className="auth-card__form">
            <div className="auth-tabs">
              <button
                className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
                onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
              >
                Iniciar Sesión
              </button>
              <button
                className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
                onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
              >
                Crear Cuenta
              </button>
            </div>

            {error && <div className="auth-form__error" role="alert">{error}</div>}
            {success && <div className="auth-form__success" role="status">{success}</div>}

            {tab === 'login' ? (
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="auth-form__group">
                  <label htmlFor="email-login" className="auth-form__label">Correo electrónico</label>
                  <div className="auth-form__input-wrap">
                    <span className="auth-form__input-icon">✉</span>
                    <input
                      id="email-login"
                      type="email"
                      className="auth-form__input"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-form__group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label htmlFor="password-login" className="auth-form__label">Contraseña</label>
                    <a href="#" className="auth-form__forgot">¿Olvidé mi contraseña?</a>
                  </div>
                  <div className="auth-form__input-wrap">
                    <span className="auth-form__input-icon">🔒</span>
                    <input
                      id="password-login"
                      type="password"
                      className="auth-form__input"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-form__submit" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleRegister}>
                <div className="auth-form__group">
                  <label htmlFor="fullname" className="auth-form__label">Nombre completo</label>
                  <div className="auth-form__input-wrap">
                    <span className="auth-form__input-icon">👤</span>
                    <input
                      id="fullname"
                      type="text"
                      className="auth-form__input"
                      placeholder="Tu nombre"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-form__group">
                  <label htmlFor="email-register" className="auth-form__label">Correo electrónico</label>
                  <div className="auth-form__input-wrap">
                    <span className="auth-form__input-icon">✉</span>
                    <input
                      id="email-register"
                      type="email"
                      className="auth-form__input"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-form__group">
                  <label htmlFor="password-register" className="auth-form__label">Contraseña</label>
                  <div className="auth-form__input-wrap">
                    <span className="auth-form__input-icon">🔒</span>
                    <input
                      id="password-register"
                      type="password"
                      className="auth-form__input"
                      placeholder="Al menos 6 caracteres"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button type="submit" className="auth-form__submit" disabled={loading}>
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>

                <p style={{ fontSize: '1.3rem', color: 'var(--color-gray-1)', textAlign: 'center' }}>
                  Al continuar, aceptas nuestros{' '}
                  <a href="#" style={{ color: 'var(--color-primary)' }}>Términos de Servicio</a>{' '}
                  y{' '}
                  <a href="#" style={{ color: 'var(--color-primary)' }}>Política de Privacidad</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
