'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import RecipeFormModal from '@/components/RecipeFormModal';

export default function MyProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('recetas');
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [likesMap, setLikesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchMyData();
    }
  }, [user]);

  function showNotif(msg, type = 'success') {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }

  async function fetchMyData() {
    setLoading(true);
    const [recipesRes, favRes] = await Promise.all([
      supabase.from('recipes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('favorites').select('*, recipes(*, profiles(full_name))').eq('user_id', user.id),
    ]);
    const myRecipes = recipesRes.data || [];
    setRecipes(myRecipes);

    if (myRecipes.length > 0) {
      const ids = myRecipes.map(r => r.id);
      const { data: likesData } = await supabase.from('likes').select('recipe_id').in('recipe_id', ids);
      const map = {};
      (likesData || []).forEach(l => { map[l.recipe_id] = (map[l.recipe_id] || 0) + 1; });
      setLikesMap(map);
    }

    setFavorites((favRes.data || []).map(f => f.recipes).filter(Boolean));
    setLoading(false);
  }

  async function handleDelete(recipeId) {
    if (!window.confirm) {
      // DOM-based confirm alternative: just proceed
    }
    await supabase.from('recipes').delete().eq('id', recipeId).eq('user_id', user.id);
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
    showNotif('Receta eliminada correctamente.');
  }

  async function handleSaveRecipe(formData, recipeId) {
    if (recipeId) {
      // Update
      const { data } = await supabase.from('recipes').update(formData).eq('id', recipeId).select().single();
      if (data) {
        setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, ...data } : r));
        showNotif('Receta actualizada correctamente.');
      }
    } else {
      // Create
      const { data } = await supabase.from('recipes').insert({ ...formData, user_id: user.id }).select().single();
      if (data) {
        setRecipes(prev => [data, ...prev]);
        showNotif('¡Receta creada correctamente!');
      }
    }
    setShowModal(false);
    setEditingRecipe(null);
  }

  function totalLikes() {
    return Object.values(likesMap).reduce((a, b) => a + b, 0);
  }

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!user) return null;

  return (
    <div style={{ minHeight: 'calc(100vh - 12.8rem)', background: 'var(--color-bg)' }}>
      {notification && (
        <div className={`notification ${notification.type}`} role="status">{notification.msg}</div>
      )}

      {showModal && (
        <RecipeFormModal
          recipe={editingRecipe}
          onSave={handleSaveRecipe}
          onClose={() => { setShowModal(false); setEditingRecipe(null); }}
        />
      )}

      <div className="container profile-page">
        <div className="profile-page__inner">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-card__avatar-wrap">
                <div className="profile-card__avatar-placeholder">
                  {profile?.full_name?.[0] || user.email[0].toUpperCase()}
                </div>
              </div>
              <h1 className="profile-card__name">{profile?.full_name || 'Mi Perfil'}</h1>
              <p style={{ color: 'var(--color-gray-1)', fontSize: '1.4rem' }}>{user.email}</p>

              <div className="profile-card__stats">
                <div className="profile-stat">
                  <span className="profile-stat__value">{recipes.length}</span>
                  <span className="profile-stat__label">Recetas</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat__value">{favorites.length}</span>
                  <span className="profile-stat__label">Favoritos</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat__value">{totalLikes()}</span>
                  <span className="profile-stat__label">Votos</span>
                </div>
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { setEditingRecipe(null); setShowModal(true); }}
              >
                + Crear Nueva Receta
              </button>
            </div>
          </aside>

          {/* Content */}
          <div className="profile-content">
            <div className="profile-tabs">
              <button
                className={`profile-tab ${tab === 'recetas' ? 'active' : ''}`}
                onClick={() => setTab('recetas')}
              >
                🍽️ Mis Recetas
              </button>
              <button
                className={`profile-tab ${tab === 'favoritos' ? 'active' : ''}`}
                onClick={() => setTab('favoritos')}
              >
                ♥ Mis Favoritos
              </button>
            </div>

            {tab === 'recetas' ? (
              recipes.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state__icon">🍳</span>
                  <p className="empty-state__title">¿Tienes una nueva idea?</p>
                  <p className="empty-state__desc">Aún no has creado ninguna receta. ¡Anímate a compartir tu sazón!</p>
                  <button className="btn-primary" onClick={() => { setEditingRecipe(null); setShowModal(true); }}>
                    + Subir primera receta
                  </button>
                </div>
              ) : (
                <div className="profile-recipes-grid">
                  {recipes.map(recipe => (
                    <div key={recipe.id} className="profile-recipe-card">
                      <img
                        src={recipe.image_url || 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400'}
                        alt={recipe.title}
                        className="profile-recipe-card__image"
                      />
                      <div className="profile-recipe-card__body">
                        <h2 className="profile-recipe-card__title">{recipe.title}</h2>
                        <p className="profile-recipe-card__desc">{recipe.description}</p>
                        <div className="profile-recipe-card__footer">
                          <span className="profile-recipe-card__likes">
                            👍 {likesMap[recipe.id] || 0}
                          </span>
                          <div className="profile-recipe-card__actions">
                            <button
                              className="btn-secondary"
                              style={{ padding: '0.6rem 1.2rem', fontSize: '1.3rem' }}
                              onClick={() => { setEditingRecipe(recipe); setShowModal(true); }}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => handleDelete(recipe.id)}
                            >
                              🗑 Borrar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              favorites.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state__icon">♡</span>
                  <p className="empty-state__title">Aún no tienes favoritos</p>
                  <p className="empty-state__desc">Guarda las recetas que más te gusten para encontrarlas fácilmente.</p>
                  <Link href="/" className="btn-primary">Explorar recetas</Link>
                </div>
              ) : (
                <div className="profile-recipes-grid">
                  {favorites.map(recipe => (
                    <Link key={recipe.id} href={`/receta/${recipe.id}`} className="profile-recipe-card">
                      <img
                        src={recipe.image_url || 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400'}
                        alt={recipe.title}
                        className="profile-recipe-card__image"
                      />
                      <div className="profile-recipe-card__body">
                        <h2 className="profile-recipe-card__title">{recipe.title}</h2>
                        <p className="profile-recipe-card__desc">{recipe.description}</p>
                        <p style={{ fontSize: '1.3rem', color: 'var(--color-gray-1)' }}>
                          Por {recipe.profiles?.full_name || 'Anónimo'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
