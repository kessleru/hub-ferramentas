import { Cabecalho } from "@/components/Cabecalho";
import { GradeFerramentas } from "@/components/GradeFerramentas";

/**
 * Página principal do hub: cabeçalho e catálogo.
 *
 * Server Component. O catálogo vai no HTML da resposta (§14) — com o
 * JavaScript desligado, os cards aparecem e os links funcionam.
 */
export default function Pagina() {
  return (
    <>
      <Cabecalho />

      <main className="mx-auto w-full max-w-280 flex-1 px-6 sm:px-8">
        <section aria-labelledby="titulo-catalogo" className="pt-10 pb-12">
          {/*
            §5.2 — o desenho da página não tem título acima dos cards: o
            cabeçalho já diz "Ferramentas" a dois centímetros dali, e repetir
            empurra o catálogo para baixo sem informar nada. O `h1` continua
            existindo para leitor de tela e para a estrutura do documento.
          */}
          <h1 id="titulo-catalogo" className="sr-only">
            Ferramentas
          </h1>

          <GradeFerramentas />
        </section>
      </main>
    </>
  );
}
