// Supabase Edge Function: carimbar-pdf
//
// Recebe um PDF do porteiro do ClinicusMed (Cloudflare Worker) e devolve o
// mesmo PDF com o e-mail do comprador estampado em todas as páginas.
//
// Segurança:
//  - Só aceita chamadas com o token de login (JWT) de um aluno, verificado
//    aqui mesmo com as chaves públicas do projeto (ES256 / JWKS).
//  - O e-mail estampado vem do PRÓPRIO token, nunca do corpo da requisição:
//    ninguém consegue gerar um PDF com o e-mail de outra pessoa.
//  - A decisão de QUEM pode baixar QUAL PDF continua no porteiro.
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";
import { carimbar } from "./carimbo.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const JWKS = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
const LIMITE_BYTES = 5 * 1024 * 1024;

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Método não permitido", { status: 405 });

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  let email: string;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${SUPABASE_URL}/auth/v1`,
      audience: "authenticated",
    });
    email = String(payload.email || "");
    if (!email.includes("@")) throw new Error("sem email");
  } catch (_) {
    return new Response("Não autorizado", { status: 401 });
  }

  const tamanho = Number(req.headers.get("content-length") || "0");
  if (tamanho > LIMITE_BYTES) return new Response("Arquivo grande demais", { status: 413 });
  const pdf = new Uint8Array(await req.arrayBuffer());
  if (pdf.length === 0 || pdf.length > LIMITE_BYTES) return new Response("Arquivo inválido", { status: 400 });
  if (String.fromCharCode(...pdf.slice(0, 5)) !== "%PDF-") return new Response("Não é um PDF", { status: 415 });

  try {
    const saida = await carimbar(pdf, email);
    return new Response(saida, {
      headers: { "content-type": "application/pdf", "cache-control": "private, no-store" },
    });
  } catch (e) {
    console.error("falha ao carimbar", e instanceof Error ? e.message : e);
    return new Response("Falha ao processar o PDF", { status: 500 });
  }
});
