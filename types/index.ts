// User types
export type PlanType = "free" | "monthly" | "annual";

export interface User {
  id: string;
  email: string;
  name: string;
  photo_url: string | null;
  role: "aluno" | "admin";
  plan: PlanType;
  plan_expires_at: string | null;
  created_at: string;
  last_login: string | null;
  favorites: string[];
  simulados_completed: string[];
  progress: Record<string, DisciplineProgress>;
  streak_days: number;
  last_study_date: string | null;
}

export interface DisciplineProgress {
  Questões_respondidas: number;
  acertos: number;
  ultimo_acesso: string | null;
}

// Content types
export type ContentType = "resumo" | "simulado" | "caso_clinico";
export type Difficulty = "facil" | "medio" | "dificil";
export type CycleType = "básico" | "clínico" | "pré-clínico";
// Valores realmente aceitos pela coluna `ciclo` da tabela conteudos no banco (sem acento).
export type ContentCycleType = "basico" | "clinico";

export interface Questao {
  id: string;
  enunciado: string;
  alternativas: string[];
  gabarito: number;
  explicacao: string;
  dificuldade: Difficulty;
}

export interface Content {
  id: string;
  tipo: ContentType;
  titulo: string;
  disciplina: string;
  ciclo: ContentCycleType;
  descricao: string;
  premium: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  visualizacoes: number;
  semestre?: string;
  etapa?: string;
  slug?: string;
  professor?: string;
  // For resumos
  conteudo_html?: string;
  file_url?: string;
  // For simulados
  questoes?: Questao[];
  tempo_por_questao?: number;
  // For casos clínicos
  vinheta?: string;
  exames?: ExameItem[];
}

export interface ExameItem {
  nome: string;
  resultado: string;
  interpretacao: string;
}

// Simulated exam results
export interface SimuladoResult {
  id: string;
  user_id: string;
  simulado_id: string;
  respostas: number[];
  acertos: number;
  total: number;
  tempo_total: number;
  completado_em: string;
}

// Payment types
export type PaymentStatus = "pending" | "approved" | "rejected" | "cancelled";
export type PaymentMethod = "pix" | "credit_card";

export interface Payment {
  id: string;
  user_id: string;
  plano: PlanType;
  valor: number;
  status: PaymentStatus;
  metodo_pagamento: PaymentMethod;
  mercado_pago_id: string;
  criado_em: string;
  aprovado_em: string | null;
}

// Discipline configuration
export interface DisciplineConfig {
  semestre?: number;
  slug: string;
  name: string;
  ciclo: CycleType;
  icon: string;
  color: string;
  description: string;
}

// Plan configuration
export interface PlanConfig {
  id: PlanType;
  name: string;
  price: number;
  price_display: string;
  interval: "month" | "year" | null;
  features: string[];
  highlighted?: boolean;
  discount?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CheckoutFormData {
  plano: PlanType;
}
