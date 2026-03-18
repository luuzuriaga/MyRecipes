# 🍽️ MisRecetas

🌐 **Demo en vivo:** [https://myrecipes-iota.vercel.app](https://myrecipes-iota.vercel.app)

Aplicación web de recetas construida con **Next.js** y **Supabase**. Permite explorar, buscar y compartir recetas de cocina.

## ✨ Funcionalidades

### Parte pública
- 📋 Listado de recetas paginado con filtros por categoría
- 🔍 Buscador de recetas
- 📄 Detalle de receta: ingredientes, pasos y tiempo de preparación
- 👤 Perfil público de cada autor con sus recetas

### Parte privada (requiere login)
- 🔐 Login y registro de usuarios
- ➕ Crear, editar y borrar tus propias recetas
- ♥ Guardar recetas como favoritas
- ⭐ Votar recetas (un voto por usuario)
- 💬 Comentar recetas

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| [Next.js 16](https://nextjs.org/) | Framework React con App Router |
| [Supabase](https://supabase.com/) | Backend: Auth, PostgreSQL y RLS |
| CSS3 nativo | Estilos (sin frameworks CSS) |
| JavaScript | Lógica del cliente |

## 🚀 Instalar y ejecutar

### Prerrequisitos
- Node.js 18+
- Una cuenta en [Supabase](https://supabase.com/)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/luuzuriaga/MyRecipes.git
cd MyRecipes

# Instalar dependencias
npm install
```

### Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

### Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build de producción

```bash
npm run build
npm start
```

## 🗄️ Esquema de base de datos

```
profiles      → Perfil de cada usuario (vinculado a auth.users)
recipes       → Recetas con título, descripción, imagen, tiempo y dificultad
ingredients   → Ingredientes de cada receta
steps         → Pasos de preparación de cada receta
comments      → Comentarios en recetas
likes         → Votos (un voto por usuario por receta)
favorites     → Recetas favoritas de cada usuario
```

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── page.js              # Página principal
│   ├── layout.js            # Layout raíz con Navbar y Footer
│   ├── globals.css          # Estilos globales
│   ├── auth/page.js         # Login y registro
│   ├── receta/[id]/page.js  # Detalle de receta
│   ├── mi-perfil/page.js    # Perfil del usuario autenticado
│   ├── perfil/[id]/page.js  # Perfil público de otro usuario
│   └── favoritos/page.js    # Recetas favoritas
├── components/
│   ├── Navbar.js
│   ├── Footer.js
│   ├── RecipeCard.js
│   └── RecipeFormModal.js
├── context/
│   └── AuthContext.js       # Contexto de autenticación global
└── lib/
    └── supabase.js          # Cliente de Supabase
```

## 👤 Usuarios de prueba (seed)

| Email | Contraseña |
|---|---|
| `maria@recetas.es` | `Password123!` |
| `carlos@recetas.es` | `Password123!` |
| `ana@recetas.es` | `Password123!` |

---

Hecho con ❤️ para amantes de la cocina!
