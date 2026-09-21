"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Play,
  Users,
  FileText,
  Brain,
  Heart,
  Clock,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { PlanCard } from "@/components/ui/plan-card";
import { StatCard } from "@/components/ui/stats-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PLANOS } from "@/lib/config";
import { useDisciplinasReais } from "@/lib/hooks/use-disciplinas";
import { useDisciplinasVitrine } from "@/lib/hooks/use-disciplinas-vitrine";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function LandingPage() {
  const { semestres: semestresReais } = useDisciplinasReais();
  const disciplinasReais = semestresReais.flatMap((s) => s.disciplinas);

  // Números reais, calculados a partir do mesmo dado que a Disciplinas do
  // app usa -- nada fixo no código. Enquanto carrega, os StatCards mostram
  // 0 por um instante (mais honesto que herdar um número velho); não há
  // "taxa de aprovação" nem "questões disponíveis" porque não existe
  // rastreamento de resultado nem banco de questões avulso hoje -- ver
  // LEGACY-AUDIT.md. Mostrar isso seria inventar.
  const { disciplinas: disciplinasVitrine } = useDisciplinasVitrine();
  const totais = disciplinasVitrine.reduce(
    (acc, d) => ({
      resumos: acc.resumos + d.totalResumos,
      casos: acc.casos + d.totalCasos,
      simulados: acc.simulados + d.totalSimulados,
    }),
    { resumos: 0, casos: 0, simulados: 0 },
  );

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative flex items-center justify-center overflow-hidden pt-40 pb-24 px-4 sm:px-6 lg:px-8">
          {/* Um único brilho verde suave atrás do título -- não dois blobs
              competindo entre si, mesmo padrão do ClinicusMed
              (css/components.css, .cx-hero::before). */}
          <div
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary/[0.14] blur-[120px] pointer-events-none"
            aria-hidden
          />

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-7"
            >
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold uppercase tracking-wider text-primary-light">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Feito para estudantes de Medicina
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="font-display font-semibold text-5xl md:text-6xl lg:text-7xl leading-[1.1] max-w-3xl mx-auto"
              >
                Sua graduação em Medicina,{" "}
                <em className="not-italic italic bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
                  organizada
                </em>{" "}
                em um só lugar
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="max-w-xl mx-auto text-lg text-muted-foreground"
              >
                Resumos organizados, simulados com gabarito e casos clínicos
                comentados. Ciclo básico e ciclo clínico, do jeito que sua
                graduação realmente acontece.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2"
              >
                <Link href="/login">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-secondary to-[#F0C56A] text-secondary-foreground hover:opacity-90 gap-2 px-8 shadow-glow-secondary font-semibold rounded-full"
                  >
                    Começar grátis
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/simulados/demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-border-strong bg-transparent hover:bg-white/[0.06] hover:border-primary-light gap-2 rounded-full"
                  >
                    <Play className="w-5 h-5" />
                    Ver simulado demo
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <Users className="w-4 h-4" />
                <span>
                  Conteúdo real de{" "}
                  <strong className="text-foreground">
                    {disciplinasReais.length} disciplinas
                  </strong>{" "}
                  já disponível
                </span>
              </motion.div>
            </motion.div>

            {/* Mockup flutuante do produto -- não é ilustração genérica de
                banco de imagem, é o próprio Clinicus (sidebar, cards),
                com os números reais já calculados acima. Mesmo padrão do
                ClinicusMed (.cx-mockup, animação de flutuar 6s). */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-16 max-w-3xl mx-auto"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-lg overflow-hidden bg-card border border-border-strong shadow-card-hover text-left"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex min-h-[280px]">
                  <div className="hidden sm:flex w-40 flex-shrink-0 flex-col gap-1 border-r border-border bg-surface-2 p-3">
                    {["Início", "Disciplinas", "Simulados", "Casos clínicos"].map(
                      (item, i) => (
                        <div
                          key={item}
                          className={cn(
                            "px-2.5 py-2 rounded-md text-xs",
                            i === 1
                              ? "bg-primary/10 text-primary-light font-semibold"
                              : "text-muted-foreground",
                          )}
                        >
                          {item}
                        </div>
                      ),
                    )}
                  </div>
                  <div className="flex-1 p-6 space-y-4">
                    <h4 className="font-display text-2xl text-foreground">
                      Ciclo Básico · Ciclo Clínico
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-md border border-border bg-white/[0.02] p-3">
                        <span className="block text-[11px] text-muted-foreground mb-1">
                          Resumos
                        </span>
                        <span className="font-display text-2xl text-foreground">
                          {totais.resumos}
                        </span>
                        <div className="h-1.5 rounded-full bg-surface-2 mt-2 overflow-hidden">
                          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-primary-light" />
                        </div>
                      </div>
                      <div className="rounded-md border border-border bg-white/[0.02] p-3">
                        <span className="block text-[11px] text-muted-foreground mb-1">
                          Casos clínicos
                        </span>
                        <span className="font-display text-2xl text-foreground">
                          {totais.casos}
                        </span>
                        <div className="h-1.5 rounded-full bg-surface-2 mt-2 overflow-hidden">
                          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary to-primary-light" />
                        </div>
                      </div>
                      <div className="rounded-md border border-border bg-white/[0.02] p-3">
                        <span className="block text-[11px] text-muted-foreground mb-1">
                          Simulados
                        </span>
                        <span className="font-display text-2xl text-foreground">
                          {totais.simulados}
                        </span>
                        <div className="h-1.5 rounded-full bg-surface-2 mt-2 overflow-hidden">
                          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-primary-light" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
            >
              <StatCard
                value={disciplinasReais.length}
                label="Disciplinas cadastradas"
                icon={<Stethoscope className="w-8 h-8" />}
              />
              <StatCard
                value={totais.resumos}
                label="Resumos disponíveis"
                icon={<FileText className="w-8 h-8" />}
              />
              <StatCard
                value={totais.casos}
                label="Casos clínicos"
                icon={<Heart className="w-8 h-8" />}
              />
              <StatCard
                value={totais.simulados}
                label="Simulados"
                icon={<Brain className="w-8 h-8" />}
              />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="funcionalidades" className="py-20 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Recursos Completos para seu Estudo
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-muted-foreground max-w-2xl mx-auto"
              >
                Tudo o que você precisa para se preparar para provas e concurso
                em uma unica plataforma.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: Brain,
                  title: "Simulados Interativos",
                  desc: "Questões comentadas com feedback instantâneo e estatisticas de desempenho",
                },
                {
                  icon: FileText,
                  title: "Resumos Organizados",
                  desc: "Conteudo selecionado por disciplina, atualizado e revisado por especialistas",
                },
                {
                  icon: Heart,
                  title: "Casos clínicos",
                  desc: "Vinheta, exames e discussoes clinicas para integrar teoria e prática",
                },
                {
                  icon: Clock,
                  title: "Cronômetro Inteligente",
                  desc: "Simulados com tempo real por questao para preparar para a realidade das provas",
                },
                {
                  icon: BarChart3,
                  title: "Progresso Visual",
                  desc: "Acompanhe sua evolucao em cada disciplina e identifique pontos de melhoria",
                },
                {
                  icon: Stethoscope,
                  title: "Ciclo básico e clínico",
                  desc: "Cobertura completa desde anatomia ate emergencias médicas",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-glow"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Disciplinas Section */}
        <section id="disciplinas" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Todas as Disciplinas
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-muted-foreground max-w-2xl mx-auto"
              >
                Cobertura completa do curso de medicina, desde o ciclo básico
                ate o ciclo clínico.
              </motion.p>
            </motion.div>

            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-6 text-center md:text-left">
                Disciplinas disponíveis
              </h3>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {disciplinasReais.map((disc) => (
                  <Link
                    key={`${disc.semestre}-${disc.disciplina}`}
                    href={`/resumos?disciplina=${encodeURIComponent(disc.disciplina)}`}
                    className="bg-card rounded-xl border border-border p-4 hover:border-primary/40 transition-colors block"
                  >
                    <p className="font-semibold truncate">{disc.disciplina}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {disc.semestre.replace("semestre-", "")}º semestre
                    </p>
                  </Link>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section id="planos" className="py-20 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Escolha seu Plano
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-muted-foreground max-w-2xl mx-auto"
              >
                Comece gratis ou desbloqueie todos os recursos com uma
                assinatura premium.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-center"
            >
              {PLANOS.map((plan) => (
                <motion.div key={plan.id} variants={fadeInUp}>
                  <PlanCard
                    plan={plan}
                    onSelect={() => {
                      window.location.href =
                        plan.id === "free"
                          ? "/login"
                          : `/checkout?plan=${plan.id}`;
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-card/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Perguntas Frequentes
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Accordion type="single" collapsible className="space-y-4">
                {[
                  {
                    q: "O plano free e realmente gratis?",
                    a: "Sim! O plano free e gratis para sempre e inclui 2 resumos por disciplina e 1 simulado demo.",
                  },
                  {
                    q: "Posso cancelar minha assinatura a qualquer momento?",
                    a: "Sim, você pode cancelar quando quiser. O acesso continua ate o fim do periodo pago.",
                  },
                  {
                    q: "Como funciona o pagamento?",
                    a: "Aceitamos PIX e cartao de credito via Mercado Pago, com seguranca total.",
                  },
                  {
                    q: "Os conteúdos são atualizados?",
                    a: "Sim, nosso time atualiza constantemente os materiais com as ultimas diretrizes.",
                  },
                  {
                    q: "Como acessar os conteúdos premium?",
                    a: "Apos a aprovacao do pagamento (instantâneo no PIX), seu acesso e liberado imediatamente.",
                  },
                  {
                    q: "Posso acessar pelo celular?",
                    a: "Sim! A plataforma e responsiva e funciona perfeitamente em qualquer dispositivo.",
                  },
                ].map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-card border border-border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left font-medium hover:text-primary">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold"
              >
                Pronto para comecar?
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                Junte-se a milhares de estudantes que ja estao estudando mais
                inteligente.
              </motion.p>
              <motion.div variants={fadeInUp}>
                <Link href="/login">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white gap-2 px-8"
                  >
                    Comecar Agora - 7 Dias Gratis
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
