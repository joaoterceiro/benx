import Link from "next/link";
import { Reveal } from "@/components/public/reveal";
import { ArquitetosCarrossel } from "@/components/public/vertente/arquitetos-carrossel";
import { lerArquitetosResolvidos } from "@/lib/mentes";

const COL = "mx-auto w-full max-w-site px-6";
const NAVY = "#0A2A66";

// Categoria (disciplina) derivada do texto "Projetista de X do empreendimento ...".
function categoriaDe(projeto: string): string {
  const m = projeto.match(/Projetista de\s+(.+?)\s+do empreendimento/i);
  return (m?.[1] ?? "").trim();
}
// Resumo curto da bio (primeira frase) para o hover.
function resumoBio(descricao: string): string {
  const limpo = descricao.replace(/\s+/g, " ").trim();
  const ponto = limpo.indexOf(". ");
  const frase = ponto > 40 ? limpo.slice(0, ponto + 1) : limpo;
  return frase.length > 160 ? `${frase.slice(0, 157).trimEnd()}…` : frase;
}

// Seção institucional: Parque Global.
export function ParqueGlobalSecao() {
  return (
    <section className={`${COL} pb-20`}>
      <Reveal className="grid items-center gap-12 lg:grid-cols-2">
        <div className="max-w-lg">
          <h2 className="text-[32px] font-light leading-tight tracking-tight sm:text-[44px] lg:text-[50px]" style={{ color: NAVY }}>Parque Global</h2>
          <p className="mt-6 text-[15px] leading-[1.9] text-black/70 sm:text-[16px]">
            Assinado pelo Bueno Netto, que celebra 50 anos de excelência no mercado imobiliário, o
            Parque Global reúne ícones mundiais em arquitetura, saúde, hospitalidade e cultura em um só
            lugar. Parcerias com o Hospital Albert Einstein, o Vibra tailored by Emiliano e um centro
            cultural internacional transformam o projeto em referência de qualidade de vida e bem-estar
            na América Latina. Com um shopping a céu aberto integrado à natureza, o Parque Global é um
            convite a uma vida urbana fluida, eficiente e inspiradora.
          </p>
          <Link href="https://parqueglobal.com.br/" target="_blank" rel="noopener noreferrer" className="mt-7 inline-block px-7 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg" style={{ background: NAVY }}>
            saiba mais
          </Link>
        </div>
        <div className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/parque-global.png" alt="Parque Global" className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-[1.04]" />
        </div>
      </Reveal>
    </section>
  );
}

// Seção institucional: Arquitetos que inspiram (vitrine premium em carrossel,
// dinâmica via admin, CTA /mentes-criativas).
export async function ArquitetosSecao() {
  const arquitetos = await lerArquitetosResolvidos();
  if (arquitetos.length === 0) return null;

  const itens = arquitetos.map((a) => ({
    nome: a.nome,
    categoria: categoriaDe(a.projeto),
    bio: resumoBio(a.descricao),
    foto: a.foto,
  }));

  return (
    <section className="bg-[#f7f8fa]">
      <Reveal className={`${COL} pt-20 pb-14`}>
        <ArquitetosCarrossel itens={itens} />
      </Reveal>
    </section>
  );
}
