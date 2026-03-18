'use client';

import { useState, useEffect } from 'react';

const CATEGORIES = [
  'Arroces', 'Sopas', 'Carnes', 'Pescados', 'Mariscos',
  'Postres', 'Vegetariana', 'Italiana', 'Mexicana', 'Asiática',
  'Aperitivos', 'Ensaladas', 'Legumbres', 'Desayunos', 'Panadería', 'Bebidas', 'Guisos', 'Huevos', 'Verduras'
];

export default function RecipeFormModal({ recipe, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [difficulty, setDifficulty] = useState('Fácil');
  const [category, setCategory] = useState('Carnes');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title || '');
      setDescription(recipe.description || '');
      setImageUrl(recipe.image_url || '');
      setPrepTime(recipe.prep_time || '');
      setDifficulty(recipe.difficulty || 'Fácil');
      setCategory(recipe.category || 'Carnes');
    }
  }, [recipe]);

  function handleKeyDown(e) {
    if (e.key === 'Escape') onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = {
      title,
      description,
      image_url: imageUrl,
      prep_time: parseInt(prepTime) || null,
      difficulty,
      category,
    };
    await onSave(formData, recipe?.id || null);
    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {recipe ? 'Editar Receta' : 'Crear Nueva Receta'}
          </h2>
          <button className="modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="recipe-title">Título de la receta *</label>
            <input
              id="recipe-title"
              type="text"
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Ej: Paella Valenciana"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="recipe-desc">Descripción</label>
            <textarea
              id="recipe-desc"
              className="form-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe brevemente tu receta..."
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="recipe-image">URL de la imagen</label>
            <input
              id="recipe-image"
              type="url"
              className="form-input"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.6rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="recipe-time">Tiempo (min)</label>
              <input
                id="recipe-time"
                type="number"
                className="form-input"
                value={prepTime}
                onChange={e => setPrepTime(e.target.value)}
                placeholder="30"
                min="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="recipe-diff">Dificultad</label>
              <select
                id="recipe-diff"
                className="form-select"
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
              >
                <option>Fácil</option>
                <option>Media</option>
                <option>Difícil</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="recipe-cat">Categoría</label>
              <select
                id="recipe-cat"
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : recipe ? 'Guardar cambios' : 'Crear receta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
