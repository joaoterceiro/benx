import "server-only";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { logger } from "@/lib/logger";

// Conteúdo legal editável no admin (Política de Privacidade e Termos de Uso),
// armazenado na tabela key-value `configuracoes`.
export interface LegalConfig {
  politica: string; // HTML
  termos: string; // HTML
  cookiesTexto: string; // texto curto do banner de cookies
}

// Modelo alinhado à LGPD (Lei 13.709/2018). Os dados de contato do Encarregado
// e CNPJ devem ser revisados pelo jurídico antes de produção.
const POLITICA_PADRAO = `
<p><em>Última atualização: 06 de junho de 2026.</em></p>

<h3>1. Quem somos (Controlador)</h3>
<p>Esta Política de Privacidade descreve como a <strong>Benx Incorporadora</strong> ("Benx", "nós") trata os dados pessoais coletados por meio deste site, na condição de <strong>controladora</strong>, nos termos da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais, "LGPD"). Para qualquer assunto relacionado a dados pessoais, contate nosso Encarregado (DPO) pelo e-mail <a href="mailto:dpo@benx.com.br">dpo@benx.com.br</a>.</p>

<h3>2. Dados que coletamos</h3>
<p>Coletamos: (a) <strong>dados fornecidos por você</strong> em formulários de contato e interesse (nome, e-mail, telefone e mensagem); (b) <strong>dados de navegação</strong> coletados automaticamente por cookies e tecnologias similares (endereço IP, identificadores de dispositivo, páginas visitadas e data/hora de acesso).</p>

<h3>3. Finalidades e bases legais do tratamento</h3>
<p>Tratamos seus dados para as seguintes finalidades, com as respectivas bases legais (arts. 7º e 11 da LGPD):</p>
<ul>
<li><strong>Responder a contatos e oferecer empreendimentos</strong> de seu interesse — base: execução de procedimentos preliminares a contrato e legítimo interesse;</li>
<li><strong>Envio de comunicações de marketing</strong> — base: consentimento, revogável a qualquer momento;</li>
<li><strong>Cookies analíticos e de marketing</strong> — base: consentimento;</li>
<li><strong>Cumprimento de obrigações legais e regulatórias</strong> e exercício regular de direitos — base: obrigação legal e legítimo interesse.</li>
</ul>

<h3>4. Cookies</h3>
<p>Utilizamos cookies <strong>necessários</strong> (essenciais ao funcionamento do site), <strong>analíticos</strong> (medição de audiência) e de <strong>marketing</strong> (personalização e anúncios). Os cookies não essenciais só são ativados mediante o seu consentimento, que pode ser concedido, recusado ou alterado a qualquer momento pelo banner ou pelo link "Gerenciar cookies" no rodapé.</p>

<h3>5. Compartilhamento de dados</h3>
<p>Podemos compartilhar dados com prestadores de serviço (hospedagem, e-mail, CRM e análise) que atuam como operadores em nosso nome, com parceiros comerciais para viabilizar seu atendimento, e com autoridades quando exigido por lei. Eventuais transferências internacionais observarão as salvaguardas da LGPD.</p>

<h3>6. Retenção e eliminação</h3>
<p>Mantemos os dados pelo tempo necessário às finalidades informadas ou conforme exigido por lei. Encerrado o tratamento, os dados são eliminados ou anonimizados, ressalvadas as hipóteses do art. 16 da LGPD.</p>

<h3>7. Seus direitos como titular</h3>
<p>Nos termos do art. 18 da LGPD, você pode, a qualquer momento: confirmar a existência de tratamento; acessar seus dados; corrigir dados incompletos, inexatos ou desatualizados; solicitar anonimização, bloqueio ou eliminação; solicitar portabilidade; obter informação sobre compartilhamento; e revogar o consentimento. Para exercer seus direitos, escreva para <a href="mailto:dpo@benx.com.br">dpo@benx.com.br</a>.</p>

<h3>8. Segurança</h3>
<p>Adotamos medidas técnicas e administrativas para proteger os dados pessoais contra acessos não autorizados e situações acidentais ou ilícitas de destruição, perda, alteração ou difusão.</p>

<h3>9. Alterações</h3>
<p>Esta política poderá ser atualizada. A versão vigente estará sempre disponível nesta página, com indicação da data de atualização.</p>
`.trim();

const TERMOS_PADRAO = `
<p><em>Última atualização: 06 de junho de 2026.</em></p>

<h3>1. Aceitação</h3>
<p>Ao acessar e navegar pelo website da Benx, o usuário declara estar ciente e de acordo com os presentes Termos de Uso e com a Política de Privacidade.</p>

<h3>2. Caráter informativo</h3>
<p>O conteúdo deste site tem caráter meramente informativo e não constitui oferta, proposta comercial ou garantia de disponibilidade dos empreendimentos apresentados. Imagens, perspectivas, plantas e metragens são ilustrativas e podem sofrer alterações sem aviso prévio. Valores, condições de pagamento e disponibilidade de unidades devem ser confirmados junto à central de vendas.</p>

<h3>3. Propriedade intelectual</h3>
<p>É vedada a reprodução, total ou parcial, de textos, imagens, marcas e demais materiais deste site sem autorização prévia e expressa da Benx.</p>

<h3>4. Responsabilidades</h3>
<p>A Benx não se responsabiliza pelo conteúdo de sites de terceiros eventualmente acessíveis por links, nem pelo uso inadequado das informações disponibilizadas neste website.</p>

<h3>5. Legislação aplicável</h3>
<p>Estes Termos são regidos pela legislação brasileira, elegendo-se o foro da Comarca de São Paulo/SP para dirimir eventuais controvérsias.</p>
`.trim();

const COOKIES_PADRAO =
  "Utilizamos cookies para melhorar sua experiência de navegação, personalizar conteúdo e analisar nosso tráfego. Ao continuar navegando, você concorda com a nossa Política de Privacidade.";

export async function lerLegal(): Promise<LegalConfig> {
  let map: Record<string, string> = {};
  try {
    const rows = await db.select().from(configuracoes);
    map = Object.fromEntries(rows.map((r) => [r.chave, r.valor ?? ""]));
  } catch (err) {
    logger.warn({ err, action: "ler_legal" }, "usando textos legais padrão (tabela ausente ou erro de banco)");
  }
  return {
    politica: (map["politica_privacidade"] || "").trim() || POLITICA_PADRAO,
    termos: (map["termos_uso"] || "").trim() || TERMOS_PADRAO,
    cookiesTexto: (map["cookies_texto"] || "").trim() || COOKIES_PADRAO,
  };
}
