"use client";

import Link from "next/link";
import { Stethoscope, Instagram, Youtube, Linkedin } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">
                {APP_CONFIG.name}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Plataforma completa de estudos para estudantes de medicina.
              Resumos organizados, simulados com gabarito e casos clínicos
              comentados.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href={APP_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-card hover:bg-card/80 transition-colors"
              >
                <Instagram className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
              <a
                href={APP_CONFIG.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-card hover:bg-card/80 transition-colors"
              >
                <Youtube className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
              <a
                href={APP_CONFIG.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-card hover:bg-card/80 transition-colors"
              >
                <Linkedin className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Produto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/simulados"
                  className="hover:text-foreground transition-colors"
                >
                  Simulados
                </Link>
              </li>
              <li>
                <Link
                  href="/resumos"
                  className="hover:text-foreground transition-colors"
                >
                  Resumos
                </Link>
              </li>
              <li>
                <Link
                  href="/casos"
                  className="hover:text-foreground transition-colors"
                >
                  Casos clínicos
                </Link>
              </li>
              <li>
                <Link
                  href="/planos"
                  className="hover:text-foreground transition-colors"
                >
                  Planos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href={`mailto:${APP_CONFIG.support_email}`}
                  className="hover:text-foreground transition-colors"
                >
                  Contato
                </a>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/termos"
                  className="hover:text-foreground transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="hover:text-foreground transition-colors"
                >
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. Todos os
            direitos reservados.
          </p>
          <p className="mt-2">Desenvolvido por Cristiano Ribeiro da Silva</p>
        </div>
      </div>
    </footer>
  );
}
