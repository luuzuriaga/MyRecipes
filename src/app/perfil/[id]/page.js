'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function PublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [likesMap, setLikesMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  async function fetchProfile() {
    setLoading(true);
    const [profileRes, recipesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('recipes').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    ]);
    setProfile(profileRes.data);
    const recipeList = recipesRes.data || [];
    setRecipes(recipeList);

    if (recipeList.length > 0) {
      const ids = recipeList.map(r => r.id);
      const { data: likesData } = await supabase.from('likes').select('recipe_id').in('recipe_id', ids);
      const map = {};
      (likesData || []).forEach(l => { map[l.recipe_id] = (map[l.recipe_id] || 0) + 1; });
      setLikesMap(map);
    }
    setLoading(false);
  }

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!profile) return <div className="loading-page"><p>Perfil no encontrado.</p></div>;

  const totalLikes = Object.values(likesMap).reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: 'calc(100vh - 12.8rem)', background: 'var(--color-bg)' }}>
      <div className="container profile-page">
        <div className="profile-page__inner">
          <aside className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-card__avatar-wrap">
                <div className="profile-card__avatar-placeholder">
                  {profile.full_name?.[0] || '?'}
                </div>
              </div>
              <h1 className="profile-card__name">{profile.full_name}</h1>

              <div className="profile-card__stats">
                <div className="profile-stat">
                  <span className="profile-stat__value">{recipes.length}</span>
                  <span className="profile-stat__label">Recetas</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat__value">{totalLikes}</span>
                  <span className="profile-stat__label">Votos</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="profile-content">
            <div className="profile-tabs">
              <button className="profile-tab active">🍽️ Recetas de {profile.full_name}</button>
            </div>

            {recipes.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state__icon">🍳</span>
                <p className="empty-state__title">Este chef aún no ha publicado recetas</p>
              </div>
            ) : (
              <div className="profile-recipes-grid">
                {recipes.map(recipe => (
                  <Link key={recipe.id} href={`/receta/${recipe.id}`} className="profile-recipe-card">
                    <img
                      src={recipe.image_url || 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400'}
                      alt={recipe.title}
                      className="profile-recipe-card__image"
                    />
                    <div className="profile-recipe-card__body">
                      <h2 className="profile-recipe-card__title">{recipe.title}</h2>
                      <p className="profile-recipe-card__desc">{recipe.description}</p>
                      <div className="profile-recipe-card__footer">
                        <span className="profile-recipe-card__likes">👍 {likesMap[recipe.id] || 0}</span>
                        {recipe.prep_time && (
                          <span style={{ fontSize: '1.3rem', color: 'var(--color-gray-1)' }}>
                            ⏱ {recipe.prep_time} min
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
