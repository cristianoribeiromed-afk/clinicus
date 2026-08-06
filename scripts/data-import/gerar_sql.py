# -*- coding: utf-8 -*-
import json

with open('conteudos_import.json', encoding='utf-8') as f:
    rows = json.load(f)

def sql_str(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def sql_bool(b):
    return 'true' if b else 'false'

def ciclo_por_semestre(sem_slug):
    num = int(sem_slug.split('-')[1])
    return 'básico' if num <= 5 else 'clínico'

linhas_sql = []
for r in rows:
    ciclo = ciclo_por_semestre(r['semestre'])
    descricao = f"{r['disciplina']} — {r['etapa']}"
    linhas_sql.append(
        "  (" +
        f"{sql_str(r['tipo'])}, {sql_str(r['titulo'])}, {sql_str(r['disciplina'])}, " +
        f"{sql_str(ciclo)}, {sql_str(descricao)}, {sql_bool(r['premium'])}, " +
        f"{sql_str(r['file_url'])}, {sql_str(r['semestre'])}, {sql_str(r['etapa'])}, {sql_str(r['slug'])}" +
        ")"
    )

# quebra em lotes de 50 pra nao gerar um INSERT gigante demais de uma vez
LOTE = 50
lotes = [linhas_sql[i:i+LOTE] for i in range(0, len(linhas_sql), LOTE)]

with open('/home/claude/migracao_saas/import_conteudos.sql', 'w', encoding='utf-8') as f:
    f.write("-- Importacao do catalogo ClinicusMed pra tabela conteudos\n")
    f.write(f"-- Gerado a partir do catalogo.json real -- {len(rows)} itens, em {len(lotes)} lotes de ate {LOTE}\n")
    f.write("-- ciclo: semestre 1-5 = 'básico', semestre 6-10 = 'clínico' (ASSUNCAO -- confirmar se bate com a divisao real)\n\n")
    for idx, lote in enumerate(lotes):
        f.write(f"-- Lote {idx+1}/{len(lotes)}\n")
        f.write("INSERT INTO public.conteudos (tipo, titulo, disciplina, ciclo, descricao, premium, file_url, semestre, etapa, slug)\nVALUES\n")
        f.write(",\n".join(lote))
        f.write("\nON CONFLICT (slug) DO UPDATE SET\n")
        f.write("  titulo = EXCLUDED.titulo,\n")
        f.write("  disciplina = EXCLUDED.disciplina,\n")
        f.write("  ciclo = EXCLUDED.ciclo,\n")
        f.write("  descricao = EXCLUDED.descricao,\n")
        f.write("  premium = EXCLUDED.premium,\n")
        f.write("  file_url = EXCLUDED.file_url,\n")
        f.write("  semestre = EXCLUDED.semestre,\n")
        f.write("  etapa = EXCLUDED.etapa,\n")
        f.write("  updated_at = NOW();\n\n")

print("Arquivo gerado:", len(lotes), "lotes")
