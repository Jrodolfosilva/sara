"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { PlusCircle, Menu, X } from "lucide-react";

export function Header() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = status === "authenticated" && session.user.role === "ADMIN";

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="logo" onClick={() => setMenuOpen(false)}>
          <Image src="/logo.png" alt="Busca Pebas" width={545} height={150} className="logo-img" priority />
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
          {isAdmin && (
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

        <button
          type="button"
          className="nav-menu-btn"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {menuOpen && (
        <div className="nav-mobile-menu">
          <Link href="/" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>
            Início
          </Link>
          <Link href="/busca" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>
            Buscar
          </Link>
          <Link href="/cadastro" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>
            Cadastre seu negócio
          </Link>
          {isAdmin && (
            <Link href="/admin" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}

          <div className="nav-mobile-actions">
            {status === "authenticated" ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="btn btn-outline"
              >
                Sair
              </button>
            ) : (
              <Link href="/login" className="btn btn-outline" onClick={() => setMenuOpen(false)}>
                Entrar
              </Link>
            )}
            <Link href="/cadastro" className="btn btn-accent" onClick={() => setMenuOpen(false)}>
              <PlusCircle size={18} /> Anunciar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
