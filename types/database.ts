export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          photo_url: string | null;
          plan: "free" | "monthly" | "annual";
          plan_expires_at: string | null;
          created_at: string;
          last_login: string | null;
          favorites: string[];
          simulados_completed: string[];
          progress: Json;
          streak_days: number;
          last_study_date: string | null;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          photo_url?: string | null;
          plan?: "free" | "monthly" | "annual";
          plan_expires_at?: string | null;
          created_at?: string;
          last_login?: string | null;
          favorites?: string[];
          simulados_completed?: string[];
          progress?: Json;
          streak_days?: number;
          last_study_date?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          photo_url?: string | null;
          plan?: "free" | "monthly" | "annual";
          plan_expires_at?: string | null;
          last_login?: string | null;
          favorites?: string[];
          simulados_completed?: string[];
          progress?: Json;
          streak_days?: number;
          last_study_date?: string | null;
        };
      };
      conteúdos: {
        Row: {
          id: string;
          tipo: "resumo" | "simulado" | "caso_clinico";
          titulo: string;
          disciplina: string;
          ciclo: "basico" | "clinico";
          descricao: string;
          premium: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
          visualizacoes: number;
          conteudo_html: string | null;
          file_url: string | null;
          Questões: Json;
          tempo_por_questao: number;
          vinheta: string | null;
          exames: Json;
        };
        Insert: {
          id?: string;
          tipo: "resumo" | "simulado" | "caso_clinico";
          titulo: string;
          disciplina: string;
          ciclo: "basico" | "clinico";
          descricao: string;
          premium?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
          visualizacoes?: number;
          conteudo_html?: string | null;
          file_url?: string | null;
          questoes?: Json;
          tempo_por_questao?: number;
          vinheta?: string | null;
          exames?: Json;
        };
        Update: {
          tipo?: "resumo" | "simulado" | "caso_clinico";
          titulo?: string;
          disciplina?: string;
          ciclo?: "basico" | "clinico";
          descricao?: string;
          premium?: boolean;
          tags?: string[];
          updated_at?: string;
          visualizacoes?: number;
          conteudo_html?: string | null;
          file_url?: string | null;
          questoes?: Json;
          tempo_por_questao?: number;
          vinheta?: string | null;
          exames?: Json;
        };
      };
      simulado_results: {
        Row: {
          id: string;
          user_id: string;
          simulado_id: string;
          respostas: number[];
          acertos: number;
          total: number;
          tempo_total: number;
          completado_em: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          simulado_id: string;
          respostas: number[];
          acertos: number;
          total: number;
          tempo_total: number;
          completado_em?: string;
        };
        Update: {
          respostas?: number[];
          acertos?: number;
          total?: number;
          tempo_total?: number;
        };
      };
      pagamentos: {
        Row: {
          id: string;
          user_id: string;
          plano: "monthly" | "annual";
          valor: number;
          status: "pending" | "approved" | "rejected" | "cancelled";
          metodo_pagamento: "pix" | "credit_card" | null;
          mercado_pago_id: string | null;
          criado_em: string;
          aprovado_em: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          plano: "monthly" | "annual";
          valor: number;
          status?: "pending" | "approved" | "rejected" | "cancelled";
          metodo_pagamento?: "pix" | "credit_card" | null;
          mercado_pago_id?: string | null;
          criado_em?: string;
          aprovado_em?: string | null;
        };
        Update: {
          status?: "pending" | "approved" | "rejected" | "cancelled";
          metodo_pagamento?: "pix" | "credit_card" | null;
          mercado_pago_id?: string | null;
          aprovado_em?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      plan_type: "free" | "monthly" | "annual";
      content_type: "resumo" | "simulado" | "caso_clinico";
      cycle_type: "basico" | "clinico";
      payment_status: "pending" | "approved" | "rejected" | "cancelled";
      payment_method: "pix" | "credit_card";
    };
  };
}
