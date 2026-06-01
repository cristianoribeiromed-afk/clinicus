"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Microscope, X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/lib/hooks/use-auth";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Banco de imagens públicas (Wikimedia Commons - domínio público)
const DISCIPLINAS_PRATICAS = [
  {
    slug: "anatomia-1",
    name: "Anatomia I",
    cor: "#EF4444",
    descricao: "Lâminas e peças anatômicas — Semestre 1",
    laminas: [
      { id: 1, titulo: "Corte transversal da medula espinhal", descricao: "Visualização das colunas anterior, lateral e posterior da substância cinzenta", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Medulla_spinalis_-_tracts_-_English.svg/800px-Medulla_spinalis_-_tracts_-_English.svg.png" },
      { id: 2, titulo: "Esqueleto humano — vista anterior", descricao: "Identificação dos principais ossos do esqueleto axial e apendicular", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Human_skeleton_front_en.svg/400px-Human_skeleton_front_en.svg.png" },
      { id: 3, titulo: "Musculatura superficial anterior", descricao: "Principais músculos da face anterior do corpo humano", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Muscular_system_anterior_en.svg/400px-Muscular_system_anterior_en.svg.png" },
      { id: 4, titulo: "Anatomia do coração", descricao: "Câmaras cardíacas, válvulas e grandes vasos", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Heart_diagram-en.svg/600px-Heart_diagram-en.svg.png" },
    ],
  },
  {
    slug: "anatomia-2",
    name: "Anatomia II",
    cor: "#DC2626",
    descricao: "Lâminas e peças anatômicas — Semestre 2",
    laminas: [
      { id: 1, titulo: "Anatomia do encéfalo", descricao: "Lobos cerebrais, cerebelo e tronco encefálico", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Human_brain_longitudinal_fissure.png/600px-Human_brain_longitudinal_fissure.png" },
      { id: 2, titulo: "Sistema nervoso periférico", descricao: "Distribuição dos nervos espinhais e plexos nervosos", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Nervous_system_diagram.png/400px-Nervous_system_diagram.png" },
      { id: 3, titulo: "Anatomia do fígado e vias biliares", descricao: "Segmentos hepáticos e sistema biliar", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Digestive_system_diagram_en.svg/400px-Digestive_system_diagram_en.svg.png" },
      { id: 4, titulo: "Anatomia renal", descricao: "Estrutura interna do rim — córtex, medula e pelve renal", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Kidney_cross-section.svg/400px-Kidney_cross-section.svg.png" },
    ],
  },
  {
    slug: "histologia-1",
    name: "Histologia I",
    cor: "#F59E0B",
    descricao: "Lâminas histológicas — Semestre 1",
    laminas: [
      { id: 1, titulo: "Epitélio simples cúbico", descricao: "Túbulos renais — coloração HE — aumento 400x", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Simple_cuboidal_epithelium.jpg/600px-Simple_cuboidal_epithelium.jpg" },
      { id: 2, titulo: "Tecido conjuntivo frouxo", descricao: "Fibras colágenas e elásticas — coloração HE — aumento 200x", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Areolar_connective_tissue.jpg/600px-Areolar_connective_tissue.jpg" },
      { id: 3, titulo: "Tecido ósseo compacto", descricao: "Sistema harvesiano — osteônios — coloração HE — aumento 100x", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Compact_bone_-_haversian_system.jpg/600px-Compact_bone_-_haversian_system.jpg" },
      { id: 4, titulo: "Tecido muscular esquelético", descricao: "Fibras musculares estriadas — coloração HE — aumento 400x", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Skeletal_muscle_-_cross_section.jpg/600px-Skeletal_muscle_-_cross_section.jpg" },
    ],
  },
  {
    slug: "histologia-2",
    name: "Histologia II",
    cor: "#D97706",
    descricao: "Lâminas histológicas — Semestre 2",
    laminas: [
      { id: 1, titulo: "Tecido nervoso — neurônios", descricao: "Corpo celular e prolongamentos — coloração de Nissl — aumento 400x", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Blausen_0657_MultipolarNeuron.png/600px-Blausen_0657_MultipolarNeuron.png" },
      { id: 2, titulo: "Fígado — hepatócitos", descricao: "Lóbulos hepáticos e espaços porta — coloração HE — aumento 100x", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Liver_histology.jpg/600px-Liver_histology.jpg" },
      { id: 3, titulo: "Rim — glomérulo renal", descricao: "Corpúsculo renal de Malpighi — coloração HE — aumento 400x", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Renal_corpuscle.svg/400px-Renal_corpuscle.svg.png" },
      { id: 4, titulo: "Pulmão — alvéolos pulmonares", descricao: "Alvéolos e capilares — coloração HE — aumento 100x", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Lung_histology.jpg/600px-Lung_histology.jpg" },
    ],
  },
  {
    slug: "microbiologia-1",
    name: "Microbiologia I",
    cor: "#10B981",
    descricao: "Lâminas microbiológicas — Semestre 3",
    laminas: [
      { id: 1, titulo: "Coloração de Gram — bactérias Gram+", descricao: "Staphylococcus aureus — cocos em cachos — aumento 1000x", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Staphylococcus_aureus_MRSA.jpg/600px-Staphylococcus_aureus_MRSA.jpg" },
      { id: 2, titulo: "Coloração de Gram — bactérias Gram-", descricao: "Escherichia coli — bacilos Gram negativos — aumento 1000x", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/EscherichiaColi_NIAID.jpg/600px-EscherichiaColi_NIAID.jpg" },
      { id: 3, titulo: "Coloração de Ziehl-Neelsen", descricao: "Mycobacterium tuberculosis — BAAR — aumento 1000x", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/TB_Culture.jpg/600px-TB_Culture.jpg" },
      { id: 4, titulo: "Cultura bacteriana em ágar sangue", descricao: "Colônias beta-hemolíticas — Streptococcus pyogenes", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Streptococcal_hemolysis.jpg/600px-Streptococcal_hemolysis.jpg" },
    ],
  },
  {
    slug: "microbiologia-2",
    name: "Microbiologia II",
    cor: "#059669",
    descricao: "Lâminas microbiológicas — Semestre 4",
    laminas: [
      { id: 1, titulo: "Fungos — Candida albicans", descricao: "Hifas e pseudohifas — coloração PAS — aumento 400x", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Candida_albicans.jpg/600px-Candida_albicans.jpg" },
      { id: 2, titulo: "Parasitologia — Plasmodium", descricao: "Eritrócitos parasitados — esfregaço de sangue periférico — Giemsa", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Plasmodium_falciparum.jpg/600px-Plasmodium_falciparum.jpg" },
      { id: 3, titulo: "Vírus — efeito citopático", descricao: "Células infectadas em cultura — microscopia óptica", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Coronavirus_virions.jpg/600px-Coronavirus_virions.jpg" },
      { id: 4, titulo: "Antibiograma — disco-difusão", descricao: "Teste de sensibilidade antimicrobiana — método de Kirby-Bauer", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Antibiotic_sensitivity_and_resistance.jpg/600px-Antibiotic_sensitivity_and_resistance.jpg" },
    ],
  },
];

export default function PraticasPage() {
  useAuth(true);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(DISCIPLINAS_PRATICAS[0].slug);
  const [imagemAberta, setImagemAberta] = useState<number | null>(null);

  const disciplina = DISCIPLINAS_PRATICAS.find(d => d.slug === disciplinaSelecionada)!;
  const laminas = disciplina.laminas;

  const abrirImagem = (idx: number) => setImagemAberta(idx);
  const fecharImagem = () => setImagemAberta(null);
  const anterior = () => setImagemAberta(i => i !== null ? (i - 1 + laminas.length) % laminas.length : null);
  const proximo = () => setImagemAberta(i => i !== null ? (i + 1) % laminas.length : null);

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Microscope className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Aulas Práticas</h1>
              <p className="text-muted-foreground">Lâminas e peças anatômicas das disciplinas práticas</p>
            </div>
          </div>
        </motion.div>

        {/* Seletor de disciplina */}
        <div className="flex flex-wrap gap-2">
          {DISCIPLINAS_PRATICAS.map(d => (
            <button
              key={d.slug}
              onClick={() => setDisciplinaSelecionada(d.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                disciplinaSelecionada === d.slug
                  ? "text-white border-transparent"
                  : "text-muted-foreground border-border hover:border-primary/30"
              }`}
              style={disciplinaSelecionada === d.slug ? { backgroundColor: d.cor, borderColor: d.cor } : {}}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Galeria */}
        <motion.div
          key={disciplinaSelecionada}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground">{disciplina.descricao}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {laminas.map((lamina, idx) => (
              <motion.div
                key={lamina.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer rounded-xl border border-border overflow-hidden hover:border-primary/40 transition-all hover:shadow-lg"
                onClick={() => abrirImagem(idx)}
              >
                <div className="relative aspect-square overflow-hidden bg-card">
                  <img
                    src={lamina.url}
                    alt={lamina.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/400x400/1e293b/64748b?text=Imagem+não+disponível";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-3 bg-card">
                  <p className="font-medium text-sm">{lamina.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lamina.descricao}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {imagemAberta !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={fecharImagem}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              onClick={fecharImagem}
            >
              <X className="w-8 h-8" />
            </button>

            <button
              className="absolute left-4 text-white hover:text-gray-300 transition-colors"
              onClick={(e) => { e.stopPropagation(); anterior(); }}
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <motion.div
              key={imagemAberta}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="max-w-3xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={laminas[imagemAberta].url}
                alt={laminas[imagemAberta].titulo}
                className="w-full rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/800x600/1e293b/64748b?text=Imagem+não+disponível";
                }}
              />
              <div className="mt-4 text-center text-white">
                <p className="font-semibold text-lg">{laminas[imagemAberta].titulo}</p>
                <p className="text-gray-300 text-sm mt-1">{laminas[imagemAberta].descricao}</p>
                <p className="text-gray-500 text-xs mt-2">{imagemAberta + 1} / {laminas.length}</p>
              </div>
            </motion.div>

            <button
              className="absolute right-4 text-white hover:text-gray-300 transition-colors"
              onClick={(e) => { e.stopPropagation(); proximo(); }}
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
