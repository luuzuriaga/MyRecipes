'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [search, setSearch] = useState('');
  const router = useRouter();

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?buscar=${encodeURIComponent(search.trim())}`);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  return (
    <header className="navbar">
      <nav className="navbar__inner">
        <Link href="/" className="navbar__logo">
          <span className="navbar__logo-icon">✕</span>
          MisRecetas
        </Link>

        <div className="navbar__search">
          <form onSubmit={handleSearch}>
            <span className="navbar__search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar recetas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>
        </div>

        <div className="navbar__actions">
          <Link href="/favoritos" className="navbar__action-btn">
            <span>♡</span>
            <span>Favoritos</span>
          </Link>

          {user ? (
            <>
              <Link href="/mi-perfil" className="navbar__action-btn">
                <span>👤</span>
                <span>Perfil</span>
              </Link>
              <button className="navbar__btn-logout" onClick={handleSignOut}>
                ↩ Cerrar sesión
              </button>
            </>
          ) : (
            <Link href="/auth" className="navbar__btn-login">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
