"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { CardFerramenta } from "@/components/CardFerramenta";
import { CLASSES_DA_GRADE } from "@/components/GradeFerramentas";
import { Input } from "@/components/ui/input";
import { filtrar } from "@/lib/busca";
import type { Ferramenta } from "@/lib/ferramentas";
import { ehEntradaDeTexto } from "@/lib/keyboard";

/**
 * §5.4 — a grade com busca.
 *
 * Este é o **único** componente do catálogo que roda no navegador, e só existe
 * a partir de `MOSTRAR_BUSCA_A_PARTIR_DE` ferramentas ativas — quem decide isso
 * é o `GradeFerramentas`, que continua sendo Server Component. Antes disso o
 * campo é mobília: a pessoa lê as ferramentas mais rápido do que digita.
 */
export function GradeComBusca({ ferramentas }: { ferramentas: Ferramenta[] }) {
  const [termo, definirTermo] = useState("");
  const campo = useRef<HTMLInputElement>(null);

  const encontradas = useMemo(
    () => filtrar(ferramentas, termo),
    [ferramentas, termo],
  );

  // §5.5 — `/` foca a busca, desde que o foco não esteja num campo de texto.
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (
        evento.key !== "/" ||
        evento.ctrlKey ||
        evento.metaKey ||
        evento.altKey
      )
        return;
      if (ehEntradaDeTexto(evento.target)) return;

      evento.preventDefault();
      campo.current?.focus();
    }

    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, []);

  return (
    <div>
      <div className="relative mb-5 max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cinza-500"
          aria-hidden
        />
        <Input
          ref={campo}
          type="search"
          value={termo}
          onChange={(evento) => definirTermo(evento.target.value)}
          placeholder="Buscar ferramenta…  ( / )"
          aria-label="Buscar ferramenta"
          className="pl-9"
        />
      </div>

      {encontradas.length > 0 ? (
        <ul className={CLASSES_DA_GRADE}>
          {encontradas.map((ferramenta) => (
            <li key={ferramenta.id} className="flex">
              <CardFerramenta ferramenta={ferramenta} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-[10px] border border-cinza-200 bg-white p-6 text-sm text-cinza-500">
          Nenhuma ferramenta com «{termo}».
        </p>
      )}
    </div>
  );
}
