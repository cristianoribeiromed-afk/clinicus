import { DisciplineConfig, PlanConfig } from "@/types";

// Discipline configuration — Matriz Curricular Interamericana 2026
export const DISCIPLINAS: DisciplineConfig[] = [
  // PRIMEIRO SEMESTRE — Ciclo Básico
  { slug: "histologia", name: "Histologia", ciclo: "básico", semestre: 1, icon: "Microscope", color: "#F59E0B", description: "Estudo dos tecidos biológicos" },
  { slug: "historia-medicina", name: "História da Medicina", ciclo: "básico", semestre: 1, icon: "BookOpen", color: "#8B5CF6", description: "Evolução histórica da medicina" },
  { slug: "biologia", name: "Biologia", ciclo: "básico", semestre: 1, icon: "Leaf", color: "#10B981", description: "Fundamentos da biologia celular e molecular" },
  { slug: "lengua-castellana", name: "Língua Castelhana", ciclo: "básico", semestre: 1, icon: "Languages", color: "#6366F1", description: "Língua espanhola aplicada à medicina" },
  { slug: "embriologia", name: "Embriologia", ciclo: "básico", semestre: 1, icon: "Dna", color: "#EC4899", description: "Desenvolvimento embrionário humano" },
  { slug: "anatomia", name: "Anatomia I", ciclo: "básico", semestre: 1, icon: "Bone", color: "#EF4444", description: "Estudo da estrutura e organização do corpo humano" },

  // SEGUNDO SEMESTRE — Ciclo Básico
  { slug: "anatomia-2", name: "Anatomia II", ciclo: "básico", semestre: 2, icon: "Bone", color: "#DC2626", description: "Continuação do estudo anatômico" },
  { slug: "histologia-2", name: "Histologia II", ciclo: "básico", semestre: 2, icon: "Microscope", color: "#D97706", description: "Histologia aplicada aos sistemas orgânicos" },
  { slug: "metodologia-investigacion", name: "Metodologia da Investigação", ciclo: "básico", semestre: 2, icon: "Search", color: "#3B82F6", description: "Métodos científicos e pesquisa em saúde" },
  { slug: "bioestatistica", name: "Bioestatística", ciclo: "básico", semestre: 2, icon: "BarChart2", color: "#06B6D4", description: "Estatística aplicada à saúde" },
  { slug: "medicina-comunitaria", name: "Medicina Comunitária", ciclo: "básico", semestre: 2, icon: "Users", color: "#14B8A6", description: "Saúde pública e medicina comunitária" },
  { slug: "psicologia-salud", name: "Psicologia em Saúde", ciclo: "básico", semestre: 2, icon: "Brain", color: "#8B5CF6", description: "Aspectos psicológicos da prática médica" },
  { slug: "guarani", name: "Guarani", ciclo: "básico", semestre: 2, icon: "Languages", color: "#F97316", description: "Língua guarani aplicada à medicina" },

  // TERCEIRO SEMESTRE — Ciclo Básico
  { slug: "bioquimica", name: "Bioquímica I", ciclo: "básico", semestre: 3, icon: "FlaskConical", color: "#06B6D4", description: "Processos químicos nos seres vivos" },
  { slug: "biofisica", name: "Biofísica", ciclo: "básico", semestre: 3, icon: "Atom", color: "#6366F1", description: "Princípios físicos aplicados à biologia" },
  { slug: "fisiologia", name: "Fisiologia I", ciclo: "básico", semestre: 3, icon: "Activity", color: "#3B82F6", description: "Funcionamento dos sistemas orgânicos" },
  { slug: "imunologia", name: "Imunologia", ciclo: "básico", semestre: 3, icon: "Shield", color: "#14B8A6", description: "Sistema imunológico e suas funções" },
  { slug: "genetica", name: "Genética Humana", ciclo: "básico", semestre: 3, icon: "Dna", color: "#EC4899", description: "Hereditariedade e variação genética" },
  { slug: "microbiologia", name: "Microbiologia I", ciclo: "básico", semestre: 3, icon: "Microscope", color: "#10B981", description: "Estudo dos microrganismos" },
  { slug: "ingles", name: "Inglês Instrumental", ciclo: "básico", semestre: 3, icon: "Languages", color: "#6366F1", description: "Inglês aplicado à medicina" },

  // QUARTO SEMESTRE — Ciclo Básico
  { slug: "fisiologia-2", name: "Fisiologia II", ciclo: "básico", semestre: 4, icon: "Activity", color: "#2563EB", description: "Fisiologia dos sistemas orgânicos avançada" },
  { slug: "microbiologia-2", name: "Microbiologia II", ciclo: "básico", semestre: 4, icon: "Microscope", color: "#059669", description: "Microbiologia clínica" },
  { slug: "bioquimica-2", name: "Bioquímica II", ciclo: "básico", semestre: 4, icon: "FlaskConical", color: "#0891B2", description: "Bioquímica metabólica e clínica" },
  { slug: "bioetica", name: "Bioética", ciclo: "básico", semestre: 4, icon: "Scale", color: "#7C3AED", description: "Ética na prática médica" },
  { slug: "nutricao", name: "Nutrição", ciclo: "básico", semestre: 4, icon: "Apple", color: "#65A30D", description: "Nutrição e dietética clínica" },
  { slug: "epidemiologia", name: "Epidemiologia e Saúde Pública", ciclo: "básico", semestre: 4, icon: "Globe", color: "#0EA5E9", description: "Epidemiologia e saúde coletiva" },

  // QUINTO SEMESTRE — Pré-Clínico
  { slug: "anatomia-patologica", name: "Anatomia Patológica I", ciclo: "pré-clínico", semestre: 5, icon: "HeartPulse", color: "#EF4444", description: "Alterações morfológicas das doenças" },
  { slug: "fisiopatologia", name: "Fisiopatologia I", ciclo: "pré-clínico", semestre: 5, icon: "Activity", color: "#F59E0B", description: "Mecanismos fisiopatológicos das doenças" },
  { slug: "medicina-familiar", name: "Medicina da Família", ciclo: "pré-clínico", semestre: 5, icon: "Home", color: "#10B981", description: "Atenção primária e medicina familiar" },
  { slug: "farmacologia", name: "Farmacologia I", ciclo: "pré-clínico", semestre: 5, icon: "Pill", color: "#8B5CF6", description: "Princípios gerais de farmacologia" },
  { slug: "semiologia-1", name: "Semiologia Médica I", ciclo: "pré-clínico", semestre: 5, icon: "Stethoscope", color: "#3B82F6", description: "Propedêutica clínica e exame físico" },
  { slug: "gestao-saude", name: "Gestão em Saúde", ciclo: "pré-clínico", semestre: 5, icon: "ClipboardList", color: "#6366F1", description: "Administração e gestão em saúde" },

  // SEXTO SEMESTRE — Pré-Clínico
  { slug: "anatomia-patologica-2", name: "Anatomia Patológica II", ciclo: "pré-clínico", semestre: 6, icon: "HeartPulse", color: "#DC2626", description: "Patologia sistêmica" },
  { slug: "fisiopatologia-2", name: "Fisiopatologia II", ciclo: "pré-clínico", semestre: 6, icon: "Activity", color: "#D97706", description: "Fisiopatologia dos sistemas orgânicos" },
  { slug: "farmacologia-2", name: "Farmacologia II", ciclo: "pré-clínico", semestre: 6, icon: "Pill", color: "#7C3AED", description: "Farmacologia clínica e terapêutica" },
  { slug: "semiologia-2", name: "Semiologia Médica II", ciclo: "pré-clínico", semestre: 6, icon: "Stethoscope", color: "#2563EB", description: "Semiologia avançada por sistemas" },
  { slug: "primeiros-auxilios", name: "Primeiros Auxilios", ciclo: "pré-clínico", semestre: 6, icon: "FirstAid", color: "#EF4444", description: "Suporte básico de vida e primeiros socorros" },
  { slug: "imagenologia", name: "Imagenologia", ciclo: "pré-clínico", semestre: 6, icon: "Scan", color: "#0EA5E9", description: "Diagnóstico por imagem" },

  // SÉTIMO SEMESTRE — Clínico
  { slug: "neurologia", name: "Neurologia", ciclo: "clínico", semestre: 7, icon: "Brain", color: "#8B5CF6", description: "Doenças do sistema nervoso" },
  { slug: "oftalmologia", name: "Oftalmologia", ciclo: "clínico", semestre: 7, icon: "Eye", color: "#06B6D4", description: "Saúde ocular e doenças da visão" },
  { slug: "ortopedia", name: "Ortopedia e Traumatologia", ciclo: "clínico", semestre: 7, icon: "Bone", color: "#64748B", description: "Sistema musculoesquelético e trauma" },
  { slug: "toxicologia", name: "Toxicologia", ciclo: "clínico", semestre: 7, icon: "AlertTriangle", color: "#F97316", description: "Intoxicações e envenenamentos" },
  { slug: "dermatologia", name: "Dermatologia", ciclo: "clínico", semestre: 7, icon: "Smile", color: "#EC4899", description: "Doenças da pele e anexos" },
  { slug: "pneumologia", name: "Pneumologia", ciclo: "clínico", semestre: 7, icon: "Wind", color: "#3B82F6", description: "Doenças respiratórias" },
  { slug: "medicina-legal", name: "Medicina Legal", ciclo: "clínico", semestre: 7, icon: "Scale", color: "#374151", description: "Aspectos legais da medicina" },

  // OITAVO SEMESTRE — Clínico
  { slug: "medicina-interna-1", name: "Medicina Interna I", ciclo: "clínico", semestre: 8, icon: "Stethoscope", color: "#3B82F6", description: "Clínica médica — aparelho cardiovascular e respiratório" },
  { slug: "ginecologia", name: "Gineco-Obstetrícia I", ciclo: "clínico", semestre: 8, icon: "Baby", color: "#EC4899", description: "Saúde da mulher e obstetrícia" },
  { slug: "psiquiatria", name: "Psiquiatria", ciclo: "clínico", semestre: 8, icon: "Brain", color: "#7C3AED", description: "Saúde mental e transtornos psiquiátricos" },
  { slug: "cirurgia", name: "Cirurgia I", ciclo: "clínico", semestre: 8, icon: "Scissors", color: "#64748B", description: "Fundamentos de técnica cirúrgica" },
  { slug: "hematologia", name: "Hematologia e Hemoterapia", ciclo: "clínico", semestre: 8, icon: "Droplet", color: "#EF4444", description: "Doenças do sangue e transfusão" },

  // NONO SEMESTRE — Clínico
  { slug: "medicina-interna-2", name: "Medicina Interna II", ciclo: "clínico", semestre: 9, icon: "Stethoscope", color: "#2563EB", description: "Clínica médica — aparelho digestivo e renal" },
  { slug: "pediatria", name: "Pediatria I", ciclo: "clínico", semestre: 9, icon: "Baby", color: "#10B981", description: "Saúde da criança e do adolescente" },
  { slug: "cirurgia-2", name: "Cirurgia II", ciclo: "clínico", semestre: 9, icon: "Scissors", color: "#475569", description: "Cirurgia por sistemas" },
  { slug: "ginecologia-2", name: "Gineco-Obstetrícia II", ciclo: "clínico", semestre: 9, icon: "Baby", color: "#DB2777", description: "Obstetrícia e patologias ginecológicas" },
  { slug: "urologia", name: "Urologia", ciclo: "clínico", semestre: 9, icon: "Activity", color: "#0EA5E9", description: "Doenças do sistema urogenital" },
  { slug: "otorrinolaringologia", name: "Otorrinolaringologia", ciclo: "clínico", semestre: 9, icon: "Ear", color: "#F59E0B", description: "Doenças de ouvido, nariz e garganta" },

  // DÉCIMO SEMESTRE — Clínico
  { slug: "pediatria-2", name: "Pediatria II", ciclo: "clínico", semestre: 10, icon: "Baby", color: "#059669", description: "Pediatria clínica avançada" },
  { slug: "cirurgia-3", name: "Cirurgia III", ciclo: "clínico", semestre: 10, icon: "Scissors", color: "#334155", description: "Cirurgia avançada e especialidades" },
  { slug: "medicina-interna-3", name: "Medicina Interna III", ciclo: "clínico", semestre: 10, icon: "Stethoscope", color: "#1D4ED8", description: "Clínica médica — endocrinologia e reumatologia" },
  { slug: "oncologia", name: "Oncologia", ciclo: "clínico", semestre: 10, icon: "Target", color: "#DC2626", description: "Diagnóstico e tratamento do câncer" },
  { slug: "reabilitacao", name: "Reabilitação", ciclo: "clínico", semestre: 10, icon: "HeartHandshake", color: "#14B8A6", description: "Medicina física e reabilitação" },
];

// Plan configuration
export const PLANOS: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    price_display: "Grátis",
    interval: null,
    features: [
      "2 resumos por disciplina",
      "1 simulado demo (10 questões)",
      "Acesso básico ao dashboard",
      "Progresso de estudos",
    ],
  },
  {
    id: "monthly",
    name: "Mensal",
    price: 2990,
    price_display: "R$ 29,90",
    interval: "month",
    features: [
      "Todos os resumos",
      "Simulados ilimitados",
      "Todos os casos clínicos",
      "Gabarito comentado",
      "Estatísticas de desempenho",
      "Suporte por email",
    ],
  },
  {
    id: "annual",
    name: "Anual",
    price: 22900,
    price_display: "R$ 229,00",
    interval: "year",
    highlighted: true,
    discount: "Economize R$ 120",
    features: [
      "Tudo do plano mensal",
      "Desconto de 33% vs mensal",
      "Acesso antecipado a novos conteúdos",
      "Certificado de conclusão",
      "Badge exclusivo no perfil",
      "Suporte prioritário",
    ],
  },
];

// Simulated content counts
export const CONTENT_STATS = {
  Questões: 2847,
  resumos: 156,
  casos_clínicos: 89,
  taxa_aprovacao: 94,
};

// App configuration
export const APP_CONFIG = {
  name: "Clinicus",
  description: "Plataforma de Estudos para Medicina",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  support_email: "suporte@clinicus.com.br",
  social: {
    instagram: "https://instagram.com/clinicus",
    youtube: "https://youtube.com/@clinicus",
    linkedin: "https://linkedin.com/company/clinicus",
  },
};

// Mercado Pago configuration
export const MERCADO_PAGO_CONFIG = {
  plan_ids: {
    monthly: "CLINICUS_MONTHLY",
    annual: "CLINICUS_ANNUAL",
  },
  notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/mercadopago`,
};
