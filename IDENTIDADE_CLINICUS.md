# Identidade Clinicus — Princípio Norteador da Plataforma

**Regra única, acima de qualquer outra decisão técnica:**
> A Clinicus é o produto. O template SaaS (Next.js/Supabase) é só a base técnica.
> Toda decisão de UX, navegação, nomenclatura e organização nasce de
> "como isso já funciona no ClinicusMed" — nunca de "o que o template trouxe pronto".

## O que NUNCA muda (conteúdo acadêmico consolidado)
- Guias de Estudo, Flashcards (SM-2 real), Banco de Questões comentado, Atlas
- A metodologia inteira (XP, níveis, Treino Sob Pressão, Modo Foco, Padrão Clinicus de Ensino)
- As 300+ páginas HTML existentes — servidas via `file_url`, nunca reescritas em React

## O que deve seguir a lógica da Clinicus, não a do template
- **Navegação**: Semestre → Matéria → Etapa (P1/P2/Final) — não "ciclo básico/clínico" solto
- **Nomenclatura**: usar os termos que o aluno já reconhece (Jornada, Guia de Estudo,
  Continuar de Onde Parei) — não termos genéricos de SaaS ("Dashboard", "Resumos" sem contexto)
- **Estrutura de conteúdo**: Resumo + Flashcards + Banco de Questões + Quiz vivem
  JUNTOS dentro de um capítulo (como já é no HTML) — não como categorias separadas
  e soltas ("Resumos", "Simulados", "Casos Clínicos" como se fossem produtos diferentes)

## O que fazer quando o template SaaS oferece algo que não existe no ClinicusMed
Perguntar: "isso faz parte da experiência que quero oferecer ao aluno de Medicina?"
- Se sim → adaptar pra linguagem/lógica da Clinicus antes de usar
- Se não → remover. Não adaptar à força só porque já está pronto.

## Como usar esse documento
Antes de construir qualquer tela nova na plataforma unificada, ler isso primeiro.
Nenhuma decisão de produto deve vir do template por padrão.
