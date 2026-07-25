import Link from "next/link";
import { Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo" style={{ color: "white" }}>
              <div className="logo-icon">
                <Compass size={20} />
              </div>
              BUSCA <span style={{ color: "var(--color-primary-cyan)" }}>Pebas</span>
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
              <li><a href="mailto:contato@buscapebas.com">contato@buscapebas.com</a></li>
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
