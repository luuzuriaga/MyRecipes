'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function RecipeCard({ recipe, likesCount, isFavorited: initialFavorited }) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(initialFavorited);

  async function handleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    if (favorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipe.id);
      setFavorited(false);
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, recipe_id: recipe.id });
      setFavorited(true);
    }
  }

  return (
    <Link href={`/receta/${recipe.id}`} className="recipe-card">
      <div className="recipe-card__image-wrap">
        <img
          src={recipe.image_url || 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800'}
          alt={recipe.title}
          className="recipe-card__image"
          loading="lazy"
        />
        {recipe.prep_time && (
          <span className="recipe-card__time-badge">
            ⏱ {recipe.prep_time} min
          </span>
        )}
        <button
          className={`recipe-card__favorite-btn ${favorited ? 'active' : ''}`}
          onClick={handleFavorite}
          aria-label={favorited ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          {favorited ? '♥' : '♡'}
        </button>
      </div>
      <div className="recipe-card__body">
        <h3 className="recipe-card__title">{recipe.title}</h3>
        <p className="recipe-card__author">
          👤 Por {recipe.profiles?.full_name || 'Anónimo'}
        </p>
        <div className="recipe-card__footer">
          <span className="recipe-card__likes">
            ★ {likesCount || 0}
          </span>
          <span className="recipe-card__arrow">→</span>
        </div>
      </div>
    </Link>
  );
}
