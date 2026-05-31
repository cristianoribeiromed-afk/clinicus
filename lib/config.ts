import { DisciplineConfig, PlanConfig } from "@/types";

// Discipline configuration
export const DISCIPLINAS: DisciplineConfig[] = [
  // Ciclo Básico
  {
    slug: "anatomia",
    name: "Anatomia",
    ciclo: "básico",
    icon: "Bone",
    color: "#EF4444",
    description: "Estudo da estrutura e organização do corpo humano",
  },
  {
    slug: "histologia",
    name: "Histologia",
    ciclo: "básico",
    icon: "Microscope",
    color: "#F59E0B",
    description: "Estudo dos tecidos biológicos",
  },
  {
    slug: "embriologia",
    name: "Embriologia",
    ciclo: "básico",
    icon: "Dna",
    color: "#8B5CF6",
    description: "Desenvolvimento embrionário humano",
  },
  {
    slug: "bioquimica",
    name: "Bioquímica",
    ciclo: "básico",
    icon: "FlaskConical",
    color: "#06B6D4",
    description: "Processos químicos nos seres vivos",
  },
  {
    slug: "fisiologia",
    name: "Fisiologia",
    ciclo: "básico",
    icon: "Activity",
    color: "#3B82F6",
    description: "Funcionamento dos sistemas orgânicos",
  },
  {
    slug: "biofisica",
    name: "Biofísica",
    ciclo: "básico",
    icon: "Atom",
    color: "#6366F1",
    description: "Princípios físicos aplicados à biologia",
  },
  {
    slug: "genetica",
    name: "Genética",
    ciclo: "básico",
    icon: "Dna",
    color: "#EC4899",
    description: "Hereditariedade e variação genética",
  },
  {
    slug: "microbiologia",
    name: "Microbiologia",
    ciclo: "básico",
    icon: "Bacterium",
    color: "#10B981",
    description: "Estudo dos microrganismos",
  },
  {
    slug: "imunologia",
    name: "Imunologia",
    ciclo: "básico",
    icon: "Shield",
    color: "#14B8A6",
    description: "Sistema imunológico e suas funções",
  },
  {
    slug: "parasitologia",
    name: "Parasitologia",
    ciclo: "básico",
    icon: "Bug",
    color: "#F97316",
    description: "Parasitas e doenças parasitárias",
  },
  {
    slug: "patologia",
    name: "Patologia",
    ciclo: "básico",
    icon: "HeartPulse",
    color: "#DC2626",
    description: "Estudo das doenças e suas causas",
  },
  // Ciclo Clínico
  {
    slug: "clinica-médica",
    name: "Clínica Médica",
    ciclo: "clínico",
    icon: "Stethoscope",
    color: "#3B82F6",
    description: "Medicina interna geral",
  },
  {
    slug: "cardiologia",
    name: "Cardiologia",
    ciclo: "clínico",
    icon: "Heart",
    color: "#EF4444",
    description: "Sistema cardiovascular",
  },
  {
    slug: "pneumologia",
    name: "Pneumologia",
    ciclo: "clínico",
    icon: "Wind",
    color: "#06B6D4",
    description: "Sistema respiratório",
  },
  {
    slug: "neurologia",
    name: "Neurologia",
    ciclo: "clínico",
    icon: "Brain",
    color: "#8B5CF6",
    description: "Sistema nervoso",
  },
  {
    slug: "pediatria",
    name: "Pediatria",
    ciclo: "clínico",
    icon: "Baby",
    color: "#F59E0B",
    description: "Medicina pediátrica",
  },
  {
    slug: "ginecologia",
    name: "Ginecologia",
    ciclo: "clínico",
    icon: "HeartPulse",
    color: "#EC4899",
    description: "Saúde da mulher",
  },
  {
    slug: "cirurgia",
    name: "Cirurgia",
    ciclo: "clínico",
    icon: "Scissors",
    color: "#64748B",
    description: "Procedimentos cirúrgicos",
  },
  {
    slug: "emergencias",
    name: "Emergências",
    ciclo: "clínico",
    icon: "Siren",
    color: "#DC2626",
    description: "Medicina de urgência e emergência",
  },
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
    price: 4990,
    price_display: "R$ 49,90",
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
    price: 39900,
    price_display: "R$ 399,00",
    interval: "year",
    highlighted: true,
    discount: "Economize R$ 200",
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
