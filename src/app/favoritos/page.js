'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import RecipeCard from '@/components/RecipeCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FavoritosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [likesMap, setLikesMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  async function fetchFavorites() {
    setLoading(true);
    const { data: favsData } = await supabase
      .from('favorites')
      .select('recipes(*, profiles(full_name))')
      .eq('user_id', user.id);

    const favRecipes = (favsData || []).map(f => f.recipes).filter(Boolean);
    setRecipes(favRecipes);

    if (favRecipes.length > 0) {
      const ids = favRecipes.map(r => r.id);
      const { data: likesData } = await supabase.from('likes').select('recipe_id').in('recipe_id', ids);
      const map = {};
      (likesData || []).forEach(l => { map[l.recipe_id] = (map[l.recipe_id] || 0) + 1; });
      setLikesMap(map);
    }
    setLoading(false);
  }

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <section style={{ minHeight: 'calc(100vh - 12.8rem)', padding: '4rem 0', background: 'var(--color-bg)' }}>
      <div className="container">
        <h1 style={{ fontSize: '3.2rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '3.2rem' }}>
          ♥ Mis Recetas Favoritas
        </h1>

        {recipes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">♡</span>
            <p className="empty-state__title">Aún no tienes recetas favoritas</p>
            <p className="empty-state__desc">Guarda las recetas que más te gusten para encontrarlas aquí.</p>
            <Link href="/" className="btn-primary">Explorar recetas</Link>
          </div>
        ) : (
          <div className="recipes-grid">
            {recipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                likesCount={likesMap[recipe.id] || 0}
                isFavorited={true}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
