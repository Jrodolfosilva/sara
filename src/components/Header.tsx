"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Compass, PlusCircle } from "lucide-react";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="logo">
          <div className="logo-icon">
            <Compass size={20} />
          </div>
          BUSCA <span>Pebas</span>
        </Link>

        <ul className="nav-links">
          <li>
            <Link href="/" className="nav-link">
              Início
            </Link>
          </li>
          <li>
            <Link href="/busca" className="nav-link">
              Buscar
            </Link>
          </li>
          <li>
            <Link href="/cadastro" className="nav-link">
              Cadastre seu negócio
            </Link>
          </li>
          {status === "authenticated" && session.user.role === "ADMIN" && (
            <li>
              <Link href="/admin" className="nav-link">
                Admin
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-actions">
          {status === "authenticated" ? (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-outline">
              Sair
            </button>
          ) : (
            <Link href="/login" className="btn btn-outline">
              Entrar
            </Link>
          )}
          <Link href="/cadastro" className="btn btn-accent">
            <PlusCircle size={18} /> Anunciar
          </Link>
        </div>
      </div>
    </header>
  );
}
