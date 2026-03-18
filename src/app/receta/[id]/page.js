'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const router = useRouter();

  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [userFavorited, setUserFavorited] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (id) fetchAll();
  }, [id, user]);

  async function fetchAll() {
    setLoading(true);
    const [recipeRes, ingredientsRes, stepsRes, commentsRes, likesRes] = await Promise.all([
      supabase.from('recipes').select('*, profiles(id, full_name)').eq('id', id).single(),
      supabase.from('ingredients').select('*').eq('recipe_id', id),
      supabase.from('steps').select('*').eq('recipe_id', id).order('step_number'),
      supabase.from('comments').select('*, profiles(full_name)').eq('recipe_id', id).is('parent_id', null).order('created_at', { ascending: false }),
      supabase.from('likes').select('user_id').eq('recipe_id', id),
    ]);

    setRecipe(recipeRes.data);
    setIngredients(ingredientsRes.data || []);
    setSteps(stepsRes.data || []);
    setComments(commentsRes.data || []);
    setLikesCount(likesRes.data?.length || 0);

    if (user) {
      const liked = likesRes.data?.some(l => l.user_id === user.id);
      setUserLiked(!!liked);

      const { data: fav } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', id)
        .maybeSingle();
      setUserFavorited(!!fav);
    }
    setLoading(false);
  }

  function showNotification(msg, type = 'info') {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }

  async function handleLike() {
    if (!user) { router.push('/auth'); return; }
    if (userLiked) {
      await supabase.from('likes').delete().eq('user_id', user.id).eq('recipe_id', id);
      setUserLiked(false);
      setLikesCount(c => c - 1);
    } else {
      await supabase.from('likes').insert({ user_id: user.id, recipe_id: id });
      setUserLiked(true);
      setLikesCount(c => c + 1);
    }
  }

  async function handleFavorite() {
    if (!user) { router.push('/auth'); return; }
    if (userFavorited) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('recipe_id', id);
      setUserFavorited(false);
      showNotification('Receta eliminada de favoritos.', 'info');
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, recipe_id: id });
      setUserFavorited(true);
      showNotification('¡Receta guardada en favoritos!', 'success');
    }
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!user) { router.push('/auth'); return; }
    if (!newComment.trim()) return;

    const { data } = await supabase
      .from('comments')
      .insert({ content: newComment.trim(), user_id: user.id, recipe_id: id })
      .select('*, profiles(full_name)')
      .single();

    if (data) {
      setComments(prev => [data, ...prev]);
      setNewComment('');
      showNotification('Comentario publicado.', 'success');
    }
  }

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!recipe) return <div className="loading-page"><p>Receta no encontrada.</p></div>;

  const isAuthor = user && recipe.profiles?.id === user.id;

  return (
    <>
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`} role="status">
          {notification.msg}
        </div>
      )}

      {/* Hero */}
      <section className="recipe-hero">
        <img
          src={recipe.image_url || 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1600'}
          alt={recipe.title}
          className="recipe-hero__img"
        />
        <div className="recipe-hero__overlay" />
        <div className="recipe-hero__content container">
          <span className="recipe-hero__category-badge">{recipe.category || 'Receta'}</span>
          {recipe.prep_time && (
            <span className="recipe-hero__time-badge">⏱ {recipe.prep_time} min</span>
          )}
          <h1 className="recipe-hero__title">{recipe.title}</h1>
          <div className="recipe-hero__meta">
            <span className="recipe-hero__rating">★ {likesCount} votos</span>
            {recipe.profiles && (
              <span>
                | Por{' '}
                <Link
                  href={`/perfil/${recipe.profiles.id}`}
                  style={{ textDecoration: 'underline' }}
                >
                  {recipe.profiles.full_name}
                </Link>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Detail body */}
      <section className="recipe-detail">
        <div className="container">
          <div className="recipe-detail__inner">
            {/* Left column */}
            <div>
              {/* Author card */}
              {recipe.profiles && (
                <div className="recipe-author-card">
                  <div className="profile-card__avatar-placeholder" style={{ width: '5.6rem', height: '5.6rem', borderRadius: '50%', fontSize: '2rem' }}>
                    {recipe.profiles.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="recipe-author-card__label">Creado por</p>
                    <p className="recipe-author-card__name">{recipe.profiles.full_name}</p>
                    {recipe.description && (
                      <p className="recipe-author-card__bio">"{recipe.description}"</p>
                    )}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              <h2 className="recipe-section-title">Ingredientes</h2>
              <div className="ingredients-grid">
                {ingredients.map(ing => (
                  <label key={ing.id} className="ingredient-item">
                    <input type="checkbox" />
                    <span>
                      {ing.amount && `${ing.amount}${ing.unit ? ' ' + ing.unit : ''} `}{ing.name}
                    </span>
                  </label>
                ))}
              </div>

              {/* Steps */}
              <h2 className="recipe-section-title">Preparación</h2>
              <ol className="steps-list">
                {steps.map(step => (
                  <li key={step.id} className="step-item">
                    <span className="step-item__number">{step.step_number}</span>
                    <div className="step-item__content">
                      <p className="step-item__desc">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Comments */}
              <section className="comments-section">
                <h2 className="recipe-section-title">Comentarios</h2>

                {/* Comment form */}
                <div className="comment-form">
                  <p className="comment-form__label">Deja tu opinión</p>
                  <form onSubmit={handleCommentSubmit}>
                    <textarea
                      placeholder="¿Qué te pareció esta receta?"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      required
                    />
                    <div className="comment-form__footer">
                      {user ? (
                        <button type="submit" className="btn-primary">Publicar Comentario</button>
                      ) : (
                        <Link href="/auth" className="btn-primary">Inicia sesión para comentar</Link>
                      )}
                    </div>
                  </form>
                </div>

                {/* Comments list */}
                {comments.length === 0 ? (
                  <p style={{ color: 'var(--color-gray-1)', fontSize: '1.5rem' }}>Sé el primero en comentar esta receta.</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-item__avatar">
                        {comment.profiles?.full_name?.[0] || '?'}
                      </div>
                      <div className="comment-item__body">
                        <div className="comment-item__header">
                          <span className="comment-item__name">{comment.profiles?.full_name || 'Usuario'}</span>
                          {comment.user_id === recipe.profiles?.id && (
                            <span className="comment-item__author-badge">AUTOR</span>
                          )}
                          <span className="comment-item__date">
                            {new Date(comment.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <p className="comment-item__text">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </section>
            </div>

            {/* Right sidebar */}
            <aside className="recipe-sidebar">
              <div className="recipe-summary-card">
                <h3 className="recipe-summary-title">Resumen de Receta</h3>
                <ul className="recipe-summary-list">
                  {recipe.prep_time && (
                    <li className="recipe-summary-item">
                      <span className="recipe-summary-item__label">⏱ Tiempo</span>
                      <span className="recipe-summary-item__value">{recipe.prep_time} min</span>
                    </li>
                  )}
                  {recipe.difficulty && (
                    <li className="recipe-summary-item">
                      <span className="recipe-summary-item__label">📊 Dificultad</span>
                      <span className="recipe-summary-item__value highlight">{recipe.difficulty}</span>
                    </li>
                  )}
                  <li className="recipe-summary-item">
                    <span className="recipe-summary-item__label">👍 Votos</span>
                    <span className="recipe-summary-item__value">{likesCount}</span>
                  </li>
                  {recipe.category && (
                    <li className="recipe-summary-item">
                      <span className="recipe-summary-item__label">🍽️ Categoría</span>
                      <span className="recipe-summary-item__value">{recipe.category}</span>
                    </li>
                  )}
                </ul>
                <div className="recipe-sidebar-actions">
                  <button
                    className={userFavorited ? 'btn-primary' : 'btn-secondary'}
                    onClick={handleFavorite}
                  >
                    {userFavorited ? '♥ En Favoritos' : '♡ Guardar en Favoritos'}
                  </button>
                  <button
                    className={userLiked ? 'btn-primary' : 'btn-secondary'}
                    onClick={handleLike}
                  >
                    {userLiked ? '★ Votado' : '☆ Votar Receta'}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
