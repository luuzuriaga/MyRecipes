import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div>
            <div className="footer__logo">
              <span className="footer__logo-icon">✕</span>
              MisRecetas
            </div>
            <p className="footer__tagline">
              Tu destino número uno para explorar la mejor gastronomía del mundo. Cocina con amor, comparte con alegría.
            </p>
          </div>

          <div>
            <p className="footer__title">Comunidad</p>
            <ul className="footer__links">
              <li><Link href="/" className="footer__link">Recetas del mes</Link></li>
              <li><Link href="/" className="footer__link">Blog culinario</Link></li>
              <li><Link href="/" className="footer__link">Foro de ayuda</Link></li>
            </ul>
          </div>

          <div>
            <p className="footer__title">Legal</p>
            <ul className="footer__links">
              <li><Link href="/" className="footer__link">Privacidad</Link></li>
              <li><Link href="/" className="footer__link">Términos de servicio</Link></li>
              <li><Link href="/" className="footer__link">Cookies</Link></li>
              <li><Link href="/" className="footer__link">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <p className="footer__title">Suscríbete</p>
            <p className="footer__newsletter-text">Recibe las mejores recetas en tu email.</p>
            <input
              type="email"
              className="footer__newsletter-input"
              placeholder="Tu correo electrónico"
            />
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Unirse
            </button>
          </div>
        </div>

        <hr className="footer__divider" />
        <p className="footer__bottom">
          © 2024 MisRecetas App. Todos los derechos reservados. Hecho con sabor por amantes de la cocina.
        </p>
      </div>
    </footer>
  );
}
