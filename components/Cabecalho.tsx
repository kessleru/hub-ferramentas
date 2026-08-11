import Image from "next/image";

/**
 * Cabeçalho do hub: marca, divisor, título e linha de apoio.
 *
 * Server Component: não tem estado nem evento.
 */
export function Cabecalho() {
  return (
    <header className="sticky p-2 top-0 z-10 h-14 border-b border-cinza-200 bg-white/90 backdrop-blur-sm">
      {/* §5.2 — largura máxima de 1120px, a mesma do catálogo abaixo. */}
      <div className="mx-auto flex h-full max-w-280 items-center gap-5 px-6 sm:px-8">
        <Image
          src="/marca.svg"
          alt=""
          width={32}
          height={32}
          priority
          className="size-8"
        />

        <div aria-hidden className="h-9 w-px bg-cinza-200" />

        <div className="min-w-0">
          <p className="truncate text-base font-medium leading-snug text-cinza-900">
            Ferramentas
          </p>
          <p className="mt-0.5 hidden truncate text-[13px] leading-snug text-cinza-500 sm:block">
            Conjunto de ferramentas utilitárias internas
          </p>
        </div>
      </div>
    </header>
  );
}
