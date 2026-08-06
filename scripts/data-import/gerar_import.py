# -*- coding: utf-8 -*-
import json
import re
import unicodedata

with open('/home/claude/resumos-clinicus/catalogo.json', encoding='utf-8') as f:
    catalogo = json.load(f)

DOMINIO = "https://clinicusmed.com.br"

def slugify(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    s = s.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = re.sub(r'-+', '-', s).strip('-')
    return s

def sql_escape(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def parse_arquivo(arquivo_str):
    """'Titulo1::path1.html | Titulo2::path2.html' -> [(titulo, path), ...]"""
    if not arquivo_str:
        return []
    itens = []
    for parte in arquivo_str.split(' | '):
        parte = parte.strip()
        if '::' not in parte:
            continue
        titulo, path = parte.split('::', 1)
        itens.append((titulo.strip(), path.strip()))
    return itens

rows = []
skipped_indisponivel = 0

for sem in catalogo['semestres']:
    sem_slug = sem['slug']
    for mat in sem['materias']:
        mat_nome = mat['nome']
        mat_codigo = mat['codigo']
        for etapa_nome in ['P1', 'P2', 'Final']:
            etapa = mat['etapas'].get(etapa_nome)
            if not etapa:
                continue
            if not etapa.get('disponivel'):
                skipped_indisponivel += 1
                continue

            # RESUMOS
            resumo = etapa.get('resumo', {})
            if resumo.get('disponivel') and resumo.get('arquivo'):
                preco = resumo.get('preco')
                itens = parse_arquivo(resumo['arquivo'])
                for i, (titulo, path) in enumerate(itens):
                    slug = slugify(f"{sem_slug}-{mat_codigo}-{etapa_nome}-resumo-{i}-{titulo}")[:200]
                    rows.append({
                        'tipo': 'resumo',
                        'titulo': titulo,
                        'disciplina': mat_nome,
                        'semestre': sem_slug,
                        'etapa': etapa_nome,
                        'slug': slug,
                        'file_url': f"{DOMINIO}/{path}",
                        'premium': True if (preco and preco > 0) else False,
                    })

            # SIMULADOS
            simulado = etapa.get('simulado', {})
            if simulado.get('disponivel') and simulado.get('arquivo'):
                preco = simulado.get('preco')
                itens = parse_arquivo(simulado['arquivo'])
                for i, (titulo, path) in enumerate(itens):
                    slug = slugify(f"{sem_slug}-{mat_codigo}-{etapa_nome}-simulado-{i}-{titulo}")[:200]
                    rows.append({
                        'tipo': 'simulado',
                        'titulo': titulo,
                        'disciplina': mat_nome,
                        'semestre': sem_slug,
                        'etapa': etapa_nome,
                        'slug': slug,
                        'file_url': f"{DOMINIO}/{path}",
                        'premium': True if (preco and preco > 0) else False,
                    })

print(f"Total de linhas a importar: {len(rows)}")
print(f"Etapas puladas (indisponiveis): {skipped_indisponivel}")

# checar slugs duplicados
slugs = [r['slug'] for r in rows]
dups = set([s for s in slugs if slugs.count(s) > 1])
print(f"Slugs duplicados: {len(dups)}")
if dups:
    for d in list(dups)[:5]:
        print("  ", d)

with open('/home/claude/migracao_saas/conteudos_import.json', 'w', encoding='utf-8') as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)
