import { supabase } from "../lib/supabase-server";
import type { Content, Questao } from "@/types";

// Realistic médical content data
const RESUMO_FISIOLOGIA_CARDIACA_1 = {
  id: "resumo-1",
  tipo: "resumo" as const,
  titulo: "Potencial de Acao Cardiaco - Propriedades Eletricas",
  disciplina: "fisiologia",
  ciclo: "básico" as const,
  descricao:
    "Revisão completa sobre o potencial de acao cardiaco, incluindo fases, canais ionicos envolvidos e diferencas entre celulas de marcapasso e cardiomiocitos.",
  premium: false,
  tags: ["fisiologia", "cardiologia", "eletrofisiologia", "potencial de acao"],
  conteudo_html: `
    <h1>Potencial de Acao Cardiaco</h1>
    <h2>Introducao</h2>
    <p>O potencial de acao cardiaco e a variacao do potencial de membrana que ocorre nas celulas cardiacas durante cada ciclo cardiaco. Diferente dos neuronios, o potencial de acao cardiaco possui uma fase de plateau caracteristica que garante a contracao sustentada necessaria para eiecao sanguinea.</p>

    <h2>Fases do Potencial de Acao</h2>
    <h3>Fase 0 - Despolarizacao Rapida</h3>
    <p>Caracterizada pela abertura dos canais de sodio voltagem-dependentes. O potencial de membrana rapidamente se torna positivo (+30mV). Duracao: aproximadamente 1-2ms.</p>

    <h3>Fase 1 - Repolarizacao Inicial</h3>
    <p>Ocorre fechamento dos canais de Na+ e abertura transitatoria de canais de K+. Pequena diminuicao do potencial.</p>

    <h3>Fase 2 - Plateau</h3>
    <p>Fase caracteristica do musculo cardiaco, devido ao equilibrio entre influxo de Ca2+ (L-type) e efluxo de K+. Esta fase garante o periodo refratario absoluto prolongado, prevenindo tetanizacao. Duracao: 200-300ms.</p>

    <h3>Fase 3 - Repolarizacao Rapida</h3>
    <p>Fechamento dos canais de Ca2+ e abertura dos canais de K+ retificadores. O potencial retorna ao nivel de repouso (-90mV).</p>

    <h3>Fase 4 - Potencial de Repouso</h3>
    <p>Membrana permanece em repouso ate proximo estimulo. Alta permeabilidade ao K+, mantendo o potencial em -90mV.</p>

    <h2>Diferencas entre Celulas Cardiacas</h2>
    <h3>Cardiomiocitos Contracteis</h3>
    <ul>
      <li>Fase 4 estavel (-90mV)</li>
      <li>Nao possuem despolarizacao diastolica</li>
      <li>Bastante dependentes de Ca2+ para contracao</li>
    </ul>

    <h3>Celulas de Marcapasso (Nodo SA e AV)</h3>
    <ul>
      <li>Potencial de repouso menos negativo (-60mV)</li>
      <li>Fase 4 com despolarizacao diastolica lenta (funny current - If)</li>
      <li>Fase 0 mais lenta (dependente de Ca2+, nao de Na+)</li>
      <li>Acao autonomica: simpatico aumenta a frequencia; parassimpatico diminui</li>
    </ul>

    <h2>Importancia Clinica</h2>
    <p>O entendimento do potencial de acao cardiaco e fundamental para compreender:</p>
    <ul>
      <li>Acao de farmacos antiarritmicos (bloqueadores de canais)</li>
      <li>Patogenese das arritmias cardiacas</li>
      <li>Funcao do marca-passo artificial</li>
      <li>Eletrocardiograma (ECG)</li>
    </ul>

    <h2>Pontos-Chave para Provas</h2>
    <ol>
      <li>O plateau (fase 2) e exclusivo das celulas cardiacas e impede tetanizacao</li>
      <li> celulas de marcapasso possuem fase 4 com despolarizacao espontanea</li>
      <li>A fase 0 dos cardiomiocitos depende de Na+; nas celulas de marcapasso, depende de Ca2+</li>
      <li>O periodo refratario absoluto vai da fase 0 ate a fase 3</li>
    </ol>
  `,
  visualizacoes: 1250,
};

const RESUMO_FISIOLOGIA_CARDIACA_2 = {
  id: "resumo-2",
  tipo: "resumo" as const,
  titulo: "Ciclo Cardiaco - Eventos Mecanicos",
  disciplina: "fisiologia",
  ciclo: "básico" as const,
  descricao:
    "Sequencia completa dos eventos mecanicos do ciclo cardiaco: sistole atrial, sistole ventricular, diastole isovolumetrica e enchimento ventricular.",
  premium: true,
  tags: ["fisiologia", "cardiologia", "hemodinamica", "ciclo cardiaco"],
  conteudo_html: `
    <h1>Ciclo Cardiaco</h1>
    <p>O ciclo cardiaco compreende um conjunto de eventos que ocorrem desde o inicio de um batimento cardiaco ate o inicio do proximo. Duracao normal: 0.8 segundos (frequencia de 75 bpm).</p>
    <h2>Divisoes do Ciclo Cardiaco</h2>
    <h3>1. Sistole Atrial (0,1s)</h3>
    <p>Contraindo-se, os atrios impulsionam sangue para os ventriculos, completando seu enchimento (aproximadamente 20-30% do volume final). Onda P no ECG.</p>
    <h3>2. Sistole Ventricular (0,3s)</h3>
    <ul>
      <li>Fase de contracao isovolumetrica: Todas valvulas fechadas, pressão sobe sem variacao de volume</li>
      <li>Ejecao: Valvulas semilunares abrem, sangue e eietado para aorta e artia pulmonar</li>
    </ul>
    <h3>3. Diastole Ventricular (0,4s)</h3>
    <ul>
      <li>Relaxamento isovolumetrico: Todas valvulas fechadas, pressão cai</li>
      <li>Enchimento rápido: Valvulas AV abrem,enchimento passivo veloz</li>
      <li>Enchimento lento (diastase): Enchimento mais lento</li>
    </ul>
    <h2>Sons Cardiacos</h2>
    <p><strong>B1 (LUB):</strong> Fechamento das valvulas mitral e tricuspidia</p>
    <p><strong>B2 (DUB):</strong> Fechamento das valvulas aortica e pulmonar</p>
    <p><strong>B3:</strong> Enchimento ventricular rápido (patologicoAdulto)</p>
    <p><strong>B4:</strong> Contracao atrial forca (estenose mitral, hipertrofia ventricular)</p>
  `,
  visualizacoes: 980,
};

const Questões_MICROBIOLOGIA: Questao[] = [
  {
    id: "q1",
    enunciado:
      "Um paciente de 25 anos apresenta uretrite purulenta apos contato sexual desprotegido. A cultura em agar Thayer-Martin revela diplococos gram-negativos oxidase-positivos. Qual e o agente etiologico mais provavel?",
    alternativas: [
      "Chlamydia trachomatis",
      "Neisseria gonorrhoeae",
      "Treponema pallidum",
      "Haemophilus ducreyi",
    ],
    gabarito: 1,
    explicacao:
      "Neisseria gonorrhoeae e um diplococo gram-negativo que cresce em agar Thayer-Martin (contem vancomicina, colistina, nistatina e trimetoprima). A oxidase positiva e caracteristica do genero Neisseria. A uretrite purulenta e manifestacao classica da gonorreia.",
    dificuldade: "medio",
  },
  {
    id: "q2",
    enunciado:
      "Uma gestante de 32 semanas apresenta ruptura prematura das membranas. A microbiologia identifica bacilo gram-negativo, beta-hemolitico, com teste de CAMP positivo. Qual o agente e a profilaxia indicada?",
    alternativas: [
      "Escherichia coli - Ceftriaxona intraparto",
      "Streptococcus agalactiae (GBS) - Penicilina G intraparto",
      "Listeria monocytogenes - Ampicilina + Gentamicina",
      "Klebsiella pneumoniae - Cefazolina",
    ],
    gabarito: 1,
    explicacao:
      "O teste de CAMP e caracteristico do Streptococcus agalactiae (GBS), que e beta-hemolitico. A colonizacao materna por GBS indica necessidade de profilaxia intraparto com Penicilina G (ou ampicilina) para prevenir infeccao neonatal grave.",
    dificuldade: "dificil",
  },
  {
    id: "q3",
    enunciado:
      "Paciente com historia de viagem a area rural apresenta febre alta, cefaleia intensa e exantema petequial. O diagnostico de Rickettsia rickettsii e suspeitado. Qual e o vetor transmissor deste agente?",
    alternativas: [
      "Mosquito Aedes aegypti",
      "Carrapato do genero Dermacentor",
      "Pulga Xenopsylla cheopis",
      "Piolho Pediculus humanus",
    ],
    gabarito: 1,
    explicacao:
      "Rickettsia rickettsii, agente da Febre das Montanhas Rochosas, e transmitida por carrapatos do genero Dermacentor. A doenca caracteriza-se por febre, cefaleia e exantema que comeca em pulsos e maos antes de disseminar.",
    dificuldade: "medio",
  },
  {
    id: "q4",
    enunciado:
      "Um paciente de 45 anos, alcoolatra cronico, apresenta pneumonia приобретida na comunidade. A cultura de escarro mostra diplococos gram-positivos sensiveis a optoquina. Qual o agente e o fator de virulencia principal?",
    alternativas: [
      "Staphylococcus aureus - Proteina A",
      "Streptococcus pneumoniae - Capsula polissacaridica",
      "Streptococcus pyogenes - M proteina",
      "Enterococcus faecalis - Gelatinase",
    ],
    gabarito: 1,
    explicacao:
      "Streptococcus pneumoniae e um diplococo gram-positivo, sensivel a optoquina (diferencia de outros estreptococos viridans). A capsula polissacaridica e seu principal fator de virulencia, evitando a fagocitose. Alcoolismo cronico e fator de risco importante.",
    dificuldade: "facil",
  },
  {
    id: "q5",
    enunciado:
      "Um laboratorio identifica uma bacteria com as seguintes caracteristicas: bacilo gram-negativo, nao fermentador de lactose, oxidase positiva, mobilidade em agar SIM, crescimento a 42C. Qual e o agente mais provavel?",
    alternativas: [
      "Escherichia coli",
      "Pseudomonas aeruginosa",
      "Salmonella typhi",
      "Proteus mirabilis",
    ],
    gabarito: 1,
    explicacao:
      "Pseudomonas aeruginosa possui estas caracteristicas: Nao fermentador (nao fermenta lactose), oxidase positiva, mobilidade presente, crescimento a 42C (importante para diferenciar de outras Pseudomonas). E. coli fermenta lactose e e oxidase negativa.",
    dificuldade: "medio",
  },
];

const SIMULADO_MICROBIOLOGIA_1 = {
  id: "simulado-micro-1",
  tipo: "simulado" as const,
  titulo: "Microbiologia Clinica - Bacterias Gram-Negativas",
  disciplina: "microbiologia",
  ciclo: "básico" as const,
  descricao:
    "Simulado com Questões sobre bacterias gram-negativas de importancia médica: Enterobacterias, Nisserias, Pseudomonas e outras.",
  premium: false,
  tags: ["microbiologia", "bacterias", "gram-negativas", "diagnostico"],
  Questões: Questões_MICROBIOLOGIA.slice(0, 3),
  tempo_por_questao: 90,
  visualizacoes: 890,
};

const SIMULADO_MICROBIOLOGIA_2 = {
  id: "simulado-micro-2",
  tipo: "simulado" as const,
  titulo: "Microbiologia Avancada - Diagnostico Laboratorial",
  disciplina: "microbiologia",
  ciclo: "básico" as const,
  descricao:
    "Simulado completo com 5 Questões sobre diagnostico laboratorial de infeccoes bacterianas, incluindo testes bioquimicos e metodologias de identificacao.",
  premium: true,
  tags: ["microbiologia", "diagnostico", "laboratorio", "testes bioquimicos"],
  Questões: Questões_MICROBIOLOGIA,
  tempo_por_questao: 90,
  visualizacoes: 1560,
};

const CASO_clínico_CARDIOLOGIA_1 = {
  id: "caso-cardio-1",
  tipo: "caso_clinico" as const,
  titulo: "Homem de 55 anos com dor toracica opressiva",
  disciplina: "cardiologia",
  ciclo: "clínico" as const,
  descricao:
    "Caso clínico sobre abordagem inicial de sindrome coronariana aguda com supradesnivelamento do segmento ST.",
  premium: false,
  tags: ["cardiologia", "emergencias", "iam", "ecg"],
  vinheta: `
Paciente masculino, 55 anos, hipertenso, tabagista (30 anos-maco), diabeticos tipo 2 em uso de metformina.
Chega ao PS relatando dor toracica retroesternal opressiva, irradiada para membro superior esquerdo e mandibula,
iniciada ha 2 horas em repouso. Negica dispneia. PA: 160/100 mmHg; FC: 98 bpm; SatO2: 96% ar ambiente.
  `,
  exames: [
    {
      nome: "ECG",
      resultado: "Supradesnivelamento ST em V1-V4 (derivacoes anteriores)",
      interpretacao: "Padrao compativel com IAMCSST de parede anterior",
    },
    {
      nome: "Troponina I",
      resultado: "Elevada (12,5 ng/mL - VR < 0,04)",
      interpretacao: "Confirmacao de lesão miocardica",
    },
    {
      nome: "Creatinina",
      resultado: "1,2 mg/dL",
      interpretacao: "Funcao renal preservada",
    },
  ],
  Questões: [
    {
      id: "cq1",
      enunciado:
        "Qual e o tratamento imediato indicado para este paciente (fase hospitalar)?",
      alternativas: [
        "Bolus de AAS 300mg + Clopidogrel 600mg + Heparina + Encaminhar hemodinamica para ICP primaria",
        "Iniciar trombolise com Alteplase e monitorar por 24h",
        "Beta-bloqueador EV imediato + Nitrato EV + Internacao em UTI",
        "Encaminhar para cirurgia de revascularizacao miocardica de emergencia",
      ],
      gabarito: 0,
      explicacao:
        "A ICP primaria (angioplastia) e o tratamento de escolha para IAMCSST quando disponivel em ate 120min do contato medico. O esquema de antiagregacao (AAS + P2Y12) associado a anticoagulacao deve ser iniciado imediatamente. Trombolite e indicada quando ICP nao esta disponivel em tempo adequado.",
      dificuldade: "dificil",
    },
  ],
  visualizacoes: 1200,
};

const CASO_clínico_CARDIOLOGIA_2 = {
  id: "caso-cardio-2",
  tipo: "caso_clinico" as const,
  titulo: "Mulher de 28 anos com dispneia progressiva e edema de MMII",
  disciplina: "cardiologia",
  ciclo: "clínico" as const,
  descricao:
    "Caso clínico abordando diagnostico diferencial de doen valvar reumatica em paciente jovem.",
  premium: true,
  tags: ["cardiologia", "valvopatias", "estrange mitral", "febre reumatica"],
  vinheta: `
Paciente feminina, 28 anos, procedente de area rural do Nordeste brasileiro. Quadro de dispneia
progressiva a esforcos ha 6 meses, piorando para ortopnea nos ultimos 2 meses. Refere historia de
"febre com dores nas articulacoes" na adolescencia. Ao exame: B3 auscultada, sopro diastolico
rumoroso em foco mitral, estalido de abertura. Edema de MMII bilateral.
  `,
  exames: [
    {
      nome: "Ecocardiograma",
      resultado:
        'Valva mitral com movimentacao em "hockey stick", area valvar de 0,9 cm2, gradiente medio de 18 mmHg. AE aumentado (52 mm)',
      interpretacao: "Estenose mitral severa de origem reumatica",
    },
    {
      nome: "ECG",
      resultado:
        "Ritmo atrial fibrilatorio, CV: 110 bpm, sobrecarga atrial esquerda",
      interpretacao: "FA conducao comum em estenose mitral cronica",
    },
  ],
  Questões: [
    {
      id: "cq2",
      enunciado:
        "Qual e a conduta terapeutica mais apropriada para esta paciente?",
      alternativas: [
        "Tratamento clínico com diureticos e betabloqueador, retorno ambulatorial",
        "Valvotomia mitral percutanea (comissurotomia com balao)",
        "Cirurgia de substituicao valvar imediata",
        "Anticoagulacao ambulatorial com retorno em 6 meses",
      ],
      gabarito: 1,
      explicacao:
        "A valvotomia mitral percutanea e indicada quando a valva tem morfologia favoravel (plieg score ate 8-10) e a paciente e sintomatica. A paciente reune criterios (estenos severa, sintomatica, idade jovem). A cirurgia de substituicao fica como alternativa para valvas muito calcificadas ou insuficiencia mitral associada.",
      dificuldade: "dificil",
    },
  ],
  visualizacoes: 980,
};

async function seedDatabase() {
  console.log("Starting database seed...");

  // Clear existing content (optional - remove in production)
  // await supabase.from('conteudos').delete().neq('id', 'dummy');

  // Insert resumos
  const resumosInsert = [
    {
      ...RESUMO_FISIOLOGIA_CARDIACA_1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      ...RESUMO_FISIOLOGIA_CARDIACA_2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const { error: resumoError } = await supabase
    .from("conteudos")
    .upsert(resumosInsert, { onConflict: "id" });
  if (resumoError) console.error("Error inserting resumos:", resumoError);
  else console.log("Resumos inserted successfully");

  // Insert simulados
  const simuladosInsert = [
    {
      ...SIMULADO_MICROBIOLOGIA_1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      ...SIMULADO_MICROBIOLOGIA_2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const { error: simuladoError } = await supabase
    .from("conteudos")
    .upsert(simuladosInsert, { onConflict: "id" });
  if (simuladoError) console.error("Error inserting simulados:", simuladoError);
  else console.log("Simulados inserted successfully");

  // Insert casos clínicos
  const casosInsert = [
    {
      ...CASO_clínico_CARDIOLOGIA_1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      ...CASO_clínico_CARDIOLOGIA_2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const { error: casoError } = await supabase
    .from("conteudos")
    .upsert(casosInsert, { onConflict: "id" });
  if (casoError) console.error("Error inserting casos clínicos:", casoError);
  else console.log("Casos clínicos inserted successfully");

  console.log("Database seed completed!");
}

seedDatabase().catch(console.error);
