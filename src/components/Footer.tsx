import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo">
              <Image src="/logo.png" alt="Busca Pebas" width={545} height={150} className="logo-img" />
            </Link>
            <p>
              O maior guia de serviços, comércio, turismo e profissionais de Parauapebas.
              Conectando pessoas a soluções locais.
            </p>
          </div>

          <div className="footer-column">
            <h5>Navegação</h5>
            <ul className="footer-links">
              <li><Link href="/">Início</Link></li>
              <li><Link href="/busca">Buscar Serviços</Link></li>
              <li><Link href="/cadastro">Cadastre seu negócio</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h5>Categorias</h5>
            <ul className="footer-links">
              <li><Link href="/busca">Serviços</Link></li>
              <li><Link href="/busca">Saúde & Bem-Estar</Link></li>
              <li><Link href="/busca">Turismo</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h5>Contato</h5>
            <ul className="footer-links">
              <li><a href="mailto:buscapeba@gmail.com">buscapeba@gmail.com</a></li>
              <li><a href="https://wa.me/5594992462747" target="_blank" rel="noopener noreferrer">WhatsApp: (94) 99246-2747</a></li>
              <li><Link href="/login">Entrar</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Busca Pebas. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
