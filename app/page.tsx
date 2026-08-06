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
  ChevronDown,
  ArrowRight,
  Star,
  Quote,
} from "lucide-react";
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
import { PLANOS, CONTENT_STATS } from "@/lib/config";
import { useDisciplinasReais } from "@/lib/hooks/use-disciplinas";

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

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-dark">
            <div className="absolute inset-0 bg-gradient-hero opacity-50" />
            <motion.div
              animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/20 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-secondary/20 blur-3xl"
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                  <Stethoscope className="w-4 h-4" />
                  Plataforma #1 para estudantes de medicina
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              >
                <span className="text-gradient">Clinicus</span>
                <br />
                <span className="text-foreground">
                  Estude mais inteligente,
                </span>
                <br />
                <span className="text-foreground">passe mais rápido</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground"
              >
                Resumos organizados, simulados com gabarito e casos clínicos
                comentados. Tudo que você precisa em um só lugar.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link href="/login">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white gap-2 px-8"
                  >
                    Comecar Gratis
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/simulados/demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-border bg-card/50 hover:bg-card gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Ver Simulado Demo
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>
                    Mais de <strong className="text-foreground">2.500</strong>{" "}
                    estudantes já utilizam
                  </span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center gap-2 text-muted-foreground"
              >
                <span className="text-xs">Explore mais</span>
                <ChevronDown className="w-5 h-5" />
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
                value={CONTENT_STATS.Questões}
                label="Questões Disponiveis"
                icon={<Brain className="w-8 h-8" />}
              />
              <StatCard
                value={CONTENT_STATS.resumos}
                label="Resumos por Disciplina"
                icon={<FileText className="w-8 h-8" />}
              />
              <StatCard
                value={CONTENT_STATS.casos_clínicos}
                label="Casos clínicos"
                icon={<Heart className="w-8 h-8" />}
              />
              <StatCard
                value={CONTENT_STATS.taxa_aprovacao}
                suffix="%"
                label="Taxa de Aprovacao"
                icon={<BarChart3 className="w-8 h-8" />}
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
                  <div
                    key={`${disc.semestre}-${disc.disciplina}`}
                    className="bg-card rounded-xl border border-border p-4"
                  >
                    <p className="font-semibold truncate">{disc.disciplina}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {disc.semestre.replace("semestre-", "")}º semestre
                    </p>
                  </div>
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

        {/* Testimonials Section */}
        <section className="py-20 bg-background">
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
                O que dizem nossos alunos
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  name: "Maria Clara",
                  semester: "4 semestre",
                  text: "Os simulados me ajudaram a identificar meus pontos fracos. Passei em todas as provas do semestre!",
                  rating: 5,
                },
                {
                  name: "Joao Pedro",
                  semester: "8 semestre",
                  text: "Os casos clínicos são muito bem elaborados. Estou me preparando melhor para o internato.",
                  rating: 5,
                },
                {
                  name: "Ana Beatriz",
                  semester: "6 semestre",
                  text: "Organizacao incrivel dos resumos. Economizei muito tempo de estudo. Recomendo demais!",
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  <p className="text-sm text-muted-foreground mb-6">
                    {testimonial.text}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary" />
                    <div>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.semester}
                      </p>
                    </div>
                  </div>
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
