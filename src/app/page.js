'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import RecipeCard from '@/components/RecipeCard';

const CATEGORIES = [
  'Todas', 'Arroces', 'Sopas', 'Carnes', 'Pescados', 'Mariscos',
  'Postres', 'Vegetariana', 'Italiana', 'Mexicana', 'Asiática',
  'Aperitivos', 'Ensaladas', 'Legumbres', 'Desayunos', 'Panadería', 'Bebidas', 'Guisos', 'Huevos', 'Verduras'
];

const PER_PAGE = 8;

function HomePageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [likes, setLikes] = useState({});
  const [favorites, setFavorites] = useState({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('Todas');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const urlSearch = searchParams.get('buscar') || '';

  useEffect(() => {
    if (urlSearch) setSearch(urlSearch);
  }, [urlSearch]);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * PER_PAGE;
    const to = from + PER_PAGE - 1;

    let query = supabase
      .from('recipes')
      .select('*, profiles(full_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (category !== 'Todas') query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, count } = await query;
    setRecipes(data || []);
    setTotal(count || 0);

    // Get likes counts
    if (data && data.length > 0) {
      const ids = data.map(r => r.id);
      const { data: likesData } = await supabase
        .from('likes')
        .select('recipe_id')
        .in('recipe_id', ids);

      const likesMap = {};
      (likesData || []).forEach(l => {
        likesMap[l.recipe_id] = (likesMap[l.recipe_id] || 0) + 1;
      });
      setLikes(likesMap);

      // Get user's favorites
      if (user) {
        const { data: favsData } = await supabase
          .from('favorites')
          .select('recipe_id')
          .eq('user_id', user.id)
          .in('recipe_id', ids);
        const favsMap = {};
        (favsData || []).forEach(f => { favsMap[f.recipe_id] = true; });
        setFavorites(favsMap);
      }
    }

    setLoading(false);
  }, [page, category, search, user]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const totalPages = Math.ceil(total / PER_PAGE);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchRecipes();
  }

  function handleCategoryChange(cat) {
    setCategory(cat);
    setPage(1);
  }

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600"
          alt="Plato de comida"
          className="hero__img"
          loading="eager"
        />
        <div className="hero__bg" />
        <div className="hero__content">
          <h1 className="hero__title">
            Descubre tu próxima<br />
            <span>receta favorita</span>
          </h1>
          <div className="hero__search-box">
            <span>🔍</span>
            <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="¿Qué quieres cocinar hoy?"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="btn-primary">Buscar</button>
            </form>
          </div>
        </div>
      </section>

      {/* Category filters */}
      <div className="filters">
        <div className="filters__inner">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recipes grid */}
      <section className="recipes-section">
        <div className="container">
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : recipes.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state__icon">🍽️</span>
              <p className="empty-state__title">No se encontraron recetas</p>
              <p className="empty-state__desc">Prueba con otro término de búsqueda o categoría.</p>
            </div>
          ) : (
            <div className="recipes-grid">
              {recipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  likesCount={likes[recipe.id] || 0}
                  isFavorited={!!favorites[recipe.id]}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="pagination" aria-label="Navegación de páginas">
              <button
                className="pagination__btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && page > 3) {
                  pageNum = page - 2 + i;
                }
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    className={`pagination__btn ${page === pageNum ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && (
                <>
                  <span style={{ color: 'var(--color-gray-2)', fontSize: '1.4rem' }}>...</span>
                  <button
                    className={`pagination__btn ${page === totalPages ? 'active' : ''}`}
                    onClick={() => setPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                className="pagination__btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                ›
              </button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="loading-page"><div className="spinner" /></div>}>
      <HomePageContent />
    </Suspense>
  );
}
