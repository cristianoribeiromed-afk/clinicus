// Lógica do carimbo (marca-d'água) — separada para poder ser testada fora do Supabase.
import { PDFDocument, StandardFonts, degrees, rgb } from "npm:pdf-lib@1.17.1";

/** Remove caracteres que a fonte padrão do PDF não consegue desenhar. */
export function textoSeguro(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\x20-\x7E]/g, "?").slice(0, 120);
}

export async function carimbar(pdf: Uint8Array, email: string, quando = new Date()): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdf, { ignoreEncryption: true, updateMetadata: false });
  const fonte = await doc.embedFont(StandardFonts.Helvetica);
  const quem = textoSeguro(email);
  const data = quando.toISOString().slice(0, 10).split("-").reverse().join("/");
  const rodape = `Licenciado para ${quem} em ${data} - ClinicusMed. Uso pessoal; proibida a distribuicao.`;

  for (const pagina of doc.getPages()) {
    const { width, height } = pagina.getSize();
    // Rodapé discreto em todas as páginas
    pagina.drawText(rodape, { x: 18, y: 10, size: 7, font: fonte, color: rgb(0.45, 0.45, 0.45), opacity: 0.75 });
    // Marca diagonal bem clara no meio da página (não atrapalha a leitura)
    const tamanho = Math.max(14, Math.min(30, width / 22));
    const larguraTexto = fonte.widthOfTextAtSize(quem, tamanho);
    pagina.drawText(quem, {
      x: width / 2 - (larguraTexto / 2) * Math.cos(Math.PI / 6),
      y: height / 2 - (larguraTexto / 2) * Math.sin(Math.PI / 6),
      size: tamanho,
      font: fonte,
      color: rgb(0.55, 0.55, 0.55),
      opacity: 0.1,
      rotate: degrees(30),
    });
  }
  doc.setProducer("ClinicusMed");
  doc.setKeywords([`licenciado:${quem}`]);
  return await doc.save();
}
