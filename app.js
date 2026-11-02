(() => {
  const STORAGE_KEYS = {
    STATE: 'lingoflow_state_v2',
    LEGACY_VAULT: 'lingoflow_vault',
    LEGACY_KEY: 'lingoflow_gemini_key',
    SESSION_KEY: 'lingoflow_session_gemini_key'
  };

  // MODELOS OBSOLETOS QUE DEVEM MIGRAR AUTOMATICAMENTE PARA O 3.8 FLASH
  const DEPRECATED_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  const DEFAULT_MODEL = 'gemini-3.8-flash';

  // CURRÍCULO DE LIÇÕES GUIADAS POR NÍVEL E IDIOMA
  const CURRICULUM = {
    en: {
      quiz: [
        {
          q: '1. Qual frase você usaria para pedir um café educadamente em inglês?',
          options: [
            { text: 'Não sei ainda / Quero aprender do zero', score: 0 },
            { text: 'I want coffee please.', score: 1 },
            { text: 'Could I have a coffee, please?', score: 2 },
            { text: "I'd like to get a flat white to go, please.", score: 3 }
          ]
        },
        {
          q: '2. Se alguém pergunta "What have you been up to lately?", o que significa?',
          options: [
            { text: 'Não consigo entender a frase', score: 0 },
            { text: 'Acho que pergunta onde eu moro ou trabalho', score: 1 },
            { text: 'Pergunta o que tenho feito ultimamente', score: 2 },
            { text: 'Sei responder usando Present Perfect Continuous naturalmente', score: 3 }
          ]
        },
        {
          q: '3. Como você se sente falando ou escrevendo em inglês hoje?',
          options: [
            { text: 'Conheço apenas palavras soltas (Hello, Thank you)', score: 0 },
            { text: 'Consigo montar frases simples no presente, mas travo no passado', score: 1 },
            { text: 'Consigo me virar em viagens e explicar minha rotina', score: 2 },
            { text: 'Converso sobre vários temas, quero lapidar naturalidade e fluência', score: 3 }
          ]
        }
      ],
      lessons: {
        A1: [
          {
            id: 'en_a1_1',
            title: 'Lição 1: Apresentação & Primeiras Frases',
            grammar: 'Verbo To Be (I am / You are) + De onde você é (I am from Brazil).',
            phrases: ['Hi! My name is...', 'I am from Brazil.', 'Nice to meet you!'],
            promptGoal: 'Teach the user how to introduce themselves in English, say where they live, and ask simple questions using "I am" and "Are you". Start by greeting them warmly and asking their name in English.'
          },
          {
            id: 'en_a1_2',
            title: 'Lição 2: Pedindo em um Café ou Restaurante',
            grammar: 'Uso de "I would like..." (Eu gostaria) em vez de "I want" para soar educado.',
            phrases: ['I would like a coffee, please.', 'How much is it?', 'Can I have the bill?'],
            promptGoal: 'Roleplay as a friendly barista. Help the user practice ordering food and drinks using "I would like..." and asking "How much is it?".'
          },
          {
            id: 'en_a1_3',
            title: 'Lição 3: Minha Rotina Diária',
            grammar: 'Simple Present para hábitos (I wake up, I work, I study, I go to the gym).',
            phrases: ['I wake up at 7 AM.', 'I work every day.', 'In the evening, I watch series.'],
            promptGoal: 'Help the user describe their daily routine in the Simple Present (waking up, working, exercising). Ask one simple question at a time.'
          }
        ],
        A2: [
          {
            id: 'en_a2_1',
            title: 'Lição 1: Contando o que fez ontem (Passado)',
            grammar: 'Simple Past com verbos regulares (-ed) e irregulares essenciais (went, ate, saw, did).',
            phrases: ['Yesterday I went to...', 'I cooked dinner.', 'What did you do last weekend?'],
            promptGoal: 'Practice the Simple Past in English. Ask the user what they did yesterday or last weekend, gently correcting past tense verbs (went, saw, worked).'
          },
          {
            id: 'en_a2_2',
            title: 'Lição 2: Check-in de Hotel e Direções na Viagem',
            grammar: 'Perguntas com "Where is...", "Is there a... near here?" e reservas.',
            phrases: ['I have a reservation under...', 'Is breakfast included?', 'How do I get to the beach?'],
            promptGoal: 'Roleplay as a hotel receptionist in an English-speaking country. Guide the user through check-in and asking for local directions.'
          }
        ],
        B1: [
          {
            id: 'en_b1_1',
            title: 'Lição 1: Experiências de Vida (Present Perfect)',
            grammar: 'Diferença entre "I went" (data fechada) e "I have been to" (experiência de vida).',
            phrases: ['I have visited...', 'Have you ever tried...?', 'I have worked here for 5 years.'],
            promptGoal: 'Help the user master Present Perfect vs Simple Past by discussing travel experiences and life achievements.'
          },
          {
            id: 'en_b1_2',
            title: 'Lição 2: Explicando Planos, Metas e Opiniões',
            grammar: 'Conectivos naturais (Actually, In my opinion, On the other hand) e futuro com Going to / Will.',
            phrases: ['In my opinion, the best way is...', 'I am planning to...', 'It depends on the situation.'],
            promptGoal: 'Engage the user in a structured discussion about their personal goals, fitness, or favorite series, encouraging connectors like "However" and "In my view".'
          }
        ],
        B2: [
          {
            id: 'en_b2_1',
            title: 'Lição 1: Phrasal Verbs Naturais do Cotidiano',
            grammar: 'Substituir verbos formais por Phrasal Verbs (figure out,ワーク out, bring up, put off).',
            phrases: ['I need to figure out how to...', 'Everything worked out well.', 'Do not put it off!'],
            promptGoal: 'Challenge the user to use everyday phrasal verbs (figure out, work out, end up, look forward to) in a lively conversation.'
          }
        ]
      }
    },
    fr: {
      quiz: [
        {
          q: '1. Como você cumprimenta e pede um croissant em uma padaria na França?',
          options: [
            { text: 'Ainda não sei falar francês (quero começar do zero)', score: 0 },
            { text: 'Bonjour, un croissant s’il vous plaît.', score: 1 },
            { text: 'Bonjour ! Je voudrais un croissant et un café, s’il vous plaît.', score: 2 },
            { text: 'Consigo conversar com o atendente sobre ingredientes e pagar sem dificuldade', score: 3 }
          ]
        },
        {
          q: '2. Você sabe usar o passado em francês (Passé Composé: "J’ai mangé", "Je suis allé")?',
          options: [
            { text: 'Nunca estudei isso', score: 0 },
            { text: 'Já vi, mas confundo quando usar avoir ou être', score: 1 },
            { text: 'Consigo contar o que fiz ontem razoavelmente bem', score: 2 },
            { text: 'Uso Passé Composé e Imparfait com naturalidade', score: 3 }
          ]
        },
        {
          q: '3. Qual seu nível atual de compreensão de francês falado?',
          options: [
            { text: 'Iniciante absoluto (A1)', score: 0 },
            { text: 'Entendo frases bem lentas e palavras parecidas com o português', score: 1 },
            { text: 'Entendo a ideia central de vídeos lentos ou podcasts como InnerFrench', score: 2 },
            { text: 'Compreendo conversas normais e quero destravar a fala avançada', score: 3 }
          ]
        }
      ],
      lessons: {
        A1: [
          {
            id: 'fr_a1_1',
            title: 'Lição 1: Saudações e Apresentação em Francês',
            grammar: 'Verbos Être (Je suis) e S’appeler (Je m’appelle) + Polidez básica (Bonjour, Merci).',
            phrases: ['Bonjour ! Je m’appelle...', 'Je suis brésilien(ne).', 'Enchanté(e) !'],
            promptGoal: 'Teach the user basic French greetings and self-introduction (Bonjour, Je m’appelle, Je suis brésilien). Start with a simple greeting in French.'
          },
          {
            id: 'fr_a1_2',
            title: 'Lição 2: No Bistrô / Boulangerie em Paris',
            grammar: 'Uso essencial de "Je voudrais..." (Eu gostaria) e artigos partitivos/definidos (un, une, le, la).',
            phrases: ['Bonjour, je voudrais un café.', 'L’addition, s’il vous plaît.', 'C’est combien ?'],
            promptGoal: 'Roleplay as a Parisian waiter. Guide the user in ordering coffee or food politely starting with "Bonjour, je voudrais...".'
          },
          {
            id: 'fr_a1_3',
            title: 'Lição 3: Rotina e Gostos Pessoais',
            grammar: 'Verbos regulares em -ER no presente (J’aime, Je travaille, J’habite, Je parle).',
            phrases: ['J’habite au Brésil.', 'J’aime cuisiner et voyager.', 'Je parle un peu français.'],
            promptGoal: 'Help the user talk about what they like (J’aime...) and their daily routine using regular -ER verbs in French.'
          }
        ],
        A2: [
          {
            id: 'fr_a2_1',
            title: 'Lição 1: Contando o Fim de Semana (Passé Composé)',
            grammar: 'Passé Composé com Avoir (J’ai mangé, J’ai vu) e Être para deslocamento (Je suis allé).',
            phrases: ['Hier, j’ai travaillé.', 'Ce week-end, je suis allé au restaurant.', 'C’était très bon !'],
            promptGoal: 'Practice the Passé Composé in French. Ask what the user did yesterday or last weekend and gently explain avoir vs être.'
          }
        ],
        B1: [
          {
            id: 'fr_b1_1',
            title: 'Lição 1: Expressando Opinião e Planos de Viagem',
            grammar: 'Estruturas de opinião (À mon avis, Je pense que) e pronomes essenciais (y, en).',
            phrases: ['À mon avis, c’est une bonne idée.', 'J’aimerais visiter la France.', 'J’y vais demain.'],
            promptGoal: 'Help the user express opinions and travel plans in B1 French, encouraging natural connectors.'
          }
        ],
        B2: [
          {
            id: 'fr_b2_1',
            title: 'Lição 1: Francês Cotidiano e Expressões Nativas',
            grammar: 'Estruturas do francês falado real (C’est pas mal, Du coup, Ça marche).',
            phrases: ['Du coup, on fait comment ?', 'Ça marche pour moi !', 'C’est vraiment sympa.'],
            promptGoal: 'Converse with the user using authentic modern spoken French expressions and idiomatic nuances.'
          }
        ]
      }
    },
    tr: {
      quiz: [
        {
          q: '1. Qual seu contato atual com o idioma Turco?',
          options: [
            { text: 'Zero! Quero aprender desde os primeiros cumprimentos', score: 0 },
            { text: 'Sei cumprimentos básicos (Merhaba, Teşekkür ederim, Evet/Hayır)', score: 1 },
            { text: 'Já entendo como funcionam alguns sufixos (-de/-da, -iyorum)', score: 2 },
            { text: 'Consigo formar frases completas e conversar sobre o cotidiano', score: 3 }
          ]
        },
        {
          q: '2. Se você vê a frase "Ben kahve istiyorum", o que ela significa?',
          options: [
            { text: 'Não faço ideia', score: 0 },
            { text: 'Sei que "kahve" é café, mas não sei o verbo', score: 1 },
            { text: 'Significa "Eu quero café" (ordem Sujeito-Objeto-Verbo)', score: 2 },
            { text: 'Entendo perfeitamente e sei conjugar no passado e futuro também', score: 3 }
          ]
        }
      ],
      lessons: {
        A1: [
          {
            id: 'tr_a1_1',
            title: 'Lição 1: Cumprimentos & Primeiras Frases em Turco',
            grammar: 'Saudações essenciais e apresentação simples (Benim adım... = Meu nome é...).',
            phrases: ['Merhaba! Nasılsınız?', 'Benim adım...', 'Teşekkür ederim! Memnun oldum.'],
            promptGoal: 'Teach the user their very first Turkish greetings (Merhaba, Nasılsın, İyiyim, Benim adım...). Keep it very welcoming and explain each word in Portuguese.'
          },
          {
            id: 'tr_a1_2',
            title: 'Lição 2: Ordem da Frase em Turco & Pedir Chá/Café',
            grammar: 'No turco o verbo vai no final (Sujeito + Objeto + Verbo: "Bir çay istiyorum" = Um chá eu quero).',
            phrases: ['Bir kahve istiyorum, lütfen.', 'Bir çay alabilir miyim?', 'Ne kadar? (Quanto custa?)'],
            promptGoal: 'Roleplay ordering Turkish tea (çay) or coffee (kahve). Explain the Subject-Object-Verb order simply.'
          },
          {
            id: 'tr_a1_3',
            title: 'Lição 3: Presente Contínuo (-iyor) e Harmonia Vocálica',
            grammar: 'Sufixo de presente (-iyorum = eu estou fazendo) ex: Geliyorum (Estou indo), Türkçe öğreniyorum (Estou aprendendo turco).',
            phrases: ['Ben Türkçe öğreniyorum.', 'Brezilya’da yaşıyorum.', 'Bugün çalışıyorum.'],
            promptGoal: 'Help the user build simple sentences with the Turkish present tense suffix (-iyorum) such as living in Brazil and learning Turkish.'
          }
        ],
        A2: [
          {
            id: 'tr_a2_1',
            title: 'Lição 1: Onde está? Sufixos de Lugar (-de / -da, -e / -a)',
            grammar: 'Harmonia vocálica para dizer "em" (evde = em casa, İstanbul’da = em Istambul) e "para" (eve = para casa).',
            phrases: ['Şimdi evdeyim.', 'Yarın işe gidiyorum.', 'Otel nerede?'],
            promptGoal: 'Practice Turkish locative (-de/-da) and dative (-e/-a) suffixes in daily situations.'
          }
        ],
        B1: [
          {
            id: 'tr_b1_1',
            title: 'Lição 1: Contando Experiências no Passado (-di / -dı)',
            grammar: 'Passado direto em turco (Gittim = eu fui, Yaptım = eu fiz, Gördüm = eu vi).',
            phrases: ['Dün çok çalıştım.', 'Geçen hafta güzel bir film izledim.', 'Sen ne yaptın?'],
            promptGoal: 'Practice the Turkish definite past tense (-di/-dı/-du/-dü) talking about yesterday and the weekend.'
          }
        ],
        B2: [
          {
            id: 'tr_b2_1',
            title: 'Lição 1: Conversação Fluida & Expressões Idiomáticas Turcas',
            grammar: 'Expressões culturais autênticas (Kolay gelsin, Afiyet olsun, Elinize sağlık).',
            phrases: ['Kolay gelsin!', 'Elinize sağlık, yemek harika olmuş.', 'Bence bu çok mantıklı.'],
            promptGoal: 'Practice natural B2 Turkish conversation incorporating authentic cultural idioms and complex suffixes.'
          }
        ]
      }
    }
  };

  const LANGUAGES = {
    en: {
      code: 'en',
      label: 'English',
      ptName: 'Inglês',
      bcp47: 'en-US',
      welcome: '👋 Olá! Escolha uma lição na aba "Lições" para praticar passo a passo, ou fale/digite livremente abaixo!',
      resources: [
        { title: 'Podcasts Naturais', desc: "6 Minute English (BBC), The Daily (NYT), Luke's English Podcast." },
        { title: 'Canais do YouTube', desc: 'Vox (ritmo jornalístico), Kurzgesagt (dicção nítida), Easy English.' },
        { title: 'Músicas & Letras', desc: 'Acompanhe letras no Genius.com ou LyricsTraining para treinar escuta.' }
      ]
    },
    fr: {
      code: 'fr',
      label: 'French',
      ptName: 'Francês',
      bcp47: 'fr-FR',
      welcome: '👋 Bonjour ! Escolha uma lição na aba "Lições" para treinar estruturas guiadas, ou converse abaixo em Francês!',
      resources: [
        { title: 'Podcasts Naturais', desc: 'InnerFrench (intermediário claro), Journal en français facile (RFI).' },
        { title: 'Canais do YouTube', desc: 'Easy French (conversas reais nas ruas com legendas), Piece of French.' },
        { title: 'Músicas Recomendadas', desc: 'Stromae, Angèle, Pomme, Indila (excelente articulação vocal).' }
      ]
    },
    tr: {
      code: 'tr',
      label: 'Turkish',
      ptName: 'Turco',
      bcp47: 'tr-TR',
      welcome: '👋 Merhaba! Escolha uma lição na aba "Lições" para aprender sufixos e frases turcas do zero, ou converse abaixo!',
      resources: [
        { title: 'Podcasts Naturais', desc: 'Turkish Coffee Podcast, Learn Turkish with Turkishaholic.' },
        { title: 'Canais do YouTube', desc: 'Easy Turkish (entrevistas de rua com legendas duplas), Turkishle.' },
        { title: 'Séries & Músicas', desc: 'Séries turcas com legenda em TR; músicas de Tarkan, Sezen Aksu e Mabel Matiz.' }
      ]
    }
  };

  const defaultState = {
    currentLang: 'en',
    scenario: 'adaptive_interview',
    selectedModel: DEFAULT_MODEL,
    rememberKeyPreference: true,
    levels: { en: 'A1', fr: 'A1', tr: 'A1' },
    completedLessons: [],
    activeLessonId: null,
    conversations: { en: [], fr: [], tr: [] },
    vault: [],
    studyDates: []
  };

  let appState = loadPersistedState();
  let isListening = false;
  let recognition = null;
  let quizStep = 0;
  let quizScore = 0;

  function loadPersistedState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.STATE) || 'null');
      const legacyVault = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEGACY_VAULT) || '[]');
      const merged = Object.assign({}, defaultState, saved || {});
      merged.conversations = Object.assign({ en: [], fr: [], tr: [] }, (saved && saved.conversations) || {});
      merged.levels = Object.assign({ en: 'A1', fr: 'A1', tr: 'A1' }, (saved && saved.levels) || {});
      if (!Array.isArray(merged.completedLessons)) merged.completedLessons = [];

      // Se estava salvo com gemini-2.5-flash antigo, atualiza automaticamente para gemini-3.8-flash
      if (!merged.selectedModel || DEPRECATED_MODELS.includes(merged.selectedModel)) {
        merged.selectedModel = DEFAULT_MODEL;
      }

      if (Array.isArray(legacyVault) && legacyVault.length > 0 && (!merged.vault || merged.vault.length === 0)) {
        merged.vault = legacyVault;
      }
      if (!LANGUAGES[merged.currentLang]) merged.currentLang = 'en';
      return merged;
    } catch (e) {
      return structuredClone(defaultState);
    }
  }

  function savePersistedState() {
    try {
      localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(appState));
      localStorage.setItem(STORAGE_KEYS.LEGACY_VAULT, JSON.stringify(appState.vault));
    } catch (e) {
      console.error('Falha ao salvar estado:', e);
    }
  }

  function getActiveApiKey() {
    return (
      sessionStorage.getItem(STORAGE_KEYS.SESSION_KEY) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_KEY) ||
      ''
    ).trim();
  }

  function setActiveApiKey(key, remember) {
    const cleanKey = (key || '').trim();
    appState.rememberKeyPreference = Boolean(remember);
    savePersistedState();

    if (!cleanKey) {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION_KEY);
      localStorage.removeItem(STORAGE_KEYS.LEGACY_KEY);
    } else if (remember) {
      localStorage.setItem(STORAGE_KEYS.LEGACY_KEY, cleanKey);
      sessionStorage.removeItem(STORAGE_KEYS.SESSION_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_KEY, cleanKey);
      localStorage.removeItem(STORAGE_KEYS.LEGACY_KEY);
    }
    updateKeyStatusIndicator();
  }

  function updateKeyStatusIndicator() {
    const dot = document.getElementById('key-status-dot');
    if (!dot) return;
    dot.className = getActiveApiKey()
      ? 'w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5'
      : 'w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5';
  }

  function markStudyToday() {
    const today = new Date().toISOString().slice(0, 10);
    if (!Array.isArray(appState.studyDates)) appState.studyDates = [];
    if (!appState.studyDates.includes(today)) {
      appState.studyDates.push(today);
      savePersistedState();
    }
    renderStudyBadge();
  }

  function renderStudyBadge() {
    const badge = document.getElementById('streak-badge');
    if (!badge) return;
    const totalDays = Array.isArray(appState.studyDates) ? appState.studyDates.length : 0;
    badge.innerHTML = '';
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-fire mr-1';
    badge.appendChild(icon);
    badge.appendChild(document.createTextNode(`${totalDays} ${totalDays === 1 ? 'dia estudado' : 'dias estudados'}`));
  }

  function setLanguage(lang) {
    if (!LANGUAGES[lang]) return;
    appState.currentLang = lang;
    savePersistedState();

    ['en', 'fr', 'tr'].forEach(code => {
      const btn = document.getElementById(`lang-${code}`);
      if (!btn) return;
      btn.className = code === lang
        ? 'px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition bg-emerald-500 text-slate-950'
        : 'px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition text-slate-400 hover:text-white';
    });

    renderLevelUI();
    renderLessonsList();
    renderConversationFeed();
    renderMediaResources();
    initSpeechRecognition();
  }

  function switchTab(tab) {
    ['lessons', 'conversation', 'media', 'vault'].forEach(t => {
      const sec = document.getElementById(`tab-${t}`);
      const btn = document.getElementById(`tab-btn-${t}`);
      if (sec) sec.classList.add('hidden');
      if (sec) sec.classList.remove('flex');
      if (btn) {
        btn.className = 'py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 text-[11px] sm:text-sm font-semibold flex items-center justify-center gap-1';
      }
    });

    const targetSec = document.getElementById(`tab-${tab}`);
    const activeBtn = document.getElementById(`tab-btn-${tab}`);
    if (targetSec) {
      targetSec.classList.remove('hidden');
      if (tab === 'lessons' || tab === 'conversation') targetSec.classList.add('flex');
    }
    if (activeBtn) {
      activeBtn.className = 'py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[11px] sm:text-sm font-semibold flex items-center justify-center gap-1';
    }

    if (tab === 'vault') renderVault();
    if (tab === 'lessons') renderLessonsList();
  }

  // NIVELAMENTO E LIÇÕES ESTRUTURADAS
  function renderLevelUI() {
    const lang = appState.currentLang;
    const lvl = appState.levels[lang] || 'A1';
    const levelNames = {
      A1: 'A1 • Iniciante',
      A2: 'A2 • Básico',
      B1: 'B1 • Intermediário',
      B2: 'B2 • Independente'
    };

    document.getElementById('current-level-badge').textContent = lvl;
    document.getElementById('lesson-lang-name').textContent = LANGUAGES[lang].ptName;
    document.getElementById('lesson-level-pill').textContent = levelNames[lvl] || lvl;
    document.getElementById('manual-level-select').value = lvl;
  }

  function startPlacementQuiz() {
    quizStep = 0;
    quizScore = 0;
    document.getElementById('quiz-container').classList.remove('hidden');
    renderQuizStep();
  }

  function renderQuizStep() {
    const lang = appState.currentLang;
    const questions = CURRICULUM[lang].quiz;
    const box = document.getElementById('quiz-question-box');
    box.innerHTML = '';

    if (quizStep >= questions.length) {
      const avg = quizScore / questions.length;
      let assigned = 'A1';
      if (avg >= 2.4) assigned = 'B2';
      else if (avg >= 1.6) assigned = 'B1';
      else if (avg >= 0.8) assigned = 'A2';

      appState.levels[lang] = assigned;
      savePersistedState();
      renderLevelUI();
      renderLessonsList();

      const doneDiv = document.createElement('div');
      doneDiv.className = 'p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 space-y-2';
      const title = document.createElement('div');
      title.className = 'font-bold text-sm text-emerald-400';
      title.textContent = `🎉 Diagnóstico Concluído: Seu nível inicial é ${assigned}!`;
      const desc = document.createElement('p');
      desc.textContent = 'Suas lições abaixo e a complexidade da IA já foram ajustadas automaticamente para este nível.';
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs';
      closeBtn.textContent = 'Ver Minhas Lições';
      closeBtn.addEventListener('click', () => {
        document.getElementById('quiz-container').classList.add('hidden');
      });

      doneDiv.appendChild(title);
      doneDiv.appendChild(desc);
      doneDiv.appendChild(closeBtn);
      box.appendChild(doneDiv);
      return;
    }

    const currentQ = questions[quizStep];
    const qTitle = document.createElement('p');
    qTitle.className = 'text-xs sm:text-sm font-semibold text-slate-200';
    qTitle.textContent = currentQ.q;
    box.appendChild(qTitle);

    const optsList = document.createElement('div');
    optsList.className = 'space-y-1.5 pt-1';

    currentQ.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => {
        quizScore += opt.score;
        quizStep++;
        renderQuizStep();
      });
      optsList.appendChild(btn);
    });

    box.appendChild(optsList);
  }

  function renderLessonsList() {
    const lang = appState.currentLang;
    const lvl = appState.levels[lang] || 'A1';
    const lessons = (CURRICULUM[lang]?.lessons?.[lvl]) || CURRICULUM[lang].lessons.A1;
    const container = document.getElementById('lessons-list');
    container.innerHTML = '';

    lessons.forEach(lesson => {
      const isDone = appState.completedLessons.includes(lesson.id);
      const card = document.createElement('div');
      card.className = isDone
        ? 'bg-slate-900/70 border border-emerald-500/40 p-4 rounded-2xl space-y-2.5'
        : 'bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2.5';

      const header = document.createElement('div');
      header.className = 'flex items-center justify-between gap-2';

      const title = document.createElement('h4');
      title.className = 'text-sm font-bold text-slate-100';
      title.textContent = lesson.title;

      const statusBadge = document.createElement('span');
      statusBadge.className = isDone
        ? 'text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold'
        : 'text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400';
      statusBadge.textContent = isDone ? '✓ Concluída' : `Nível ${lvl}`;

      header.appendChild(title);
      header.appendChild(statusBadge);

      const grammarBox = document.createElement('div');
      grammarBox.className = 'text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80';
      const gLabel = document.createElement('b');
      gLabel.className = 'text-amber-400';
      gLabel.textContent = '💡 Estrutura & Gramática: ';
      grammarBox.appendChild(gLabel);
      grammarBox.appendChild(document.createTextNode(lesson.grammar));

      const phrasesTitle = document.createElement('div');
      phrasesTitle.className = 'text-[11px] font-semibold text-slate-400 pt-1';
      phrasesTitle.textContent = 'Toque para ouvir as frases-chave antes de praticar:';

      const phrasesWrap = document.createElement('div');
      phrasesWrap.className = 'flex flex-wrap gap-1.5';

      lesson.phrases.forEach(phrase => {
        const pBtn = document.createElement('button');
        pBtn.type = 'button';
        pBtn.className = 'px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl text-xs flex items-center gap-1.5 transition';
        pBtn.innerHTML = '<i class="fa-solid fa-volume-high text-[10px]"></i> ';
        pBtn.appendChild(document.createTextNode(phrase));
        pBtn.addEventListener('click', () => speakText(phrase, lang));
        phrasesWrap.appendChild(pBtn);
      });

      const actionRow = document.createElement('div');
      actionRow.className = 'pt-1 flex justify-end';

      const startBtn = document.createElement('button');
      startBtn.type = 'button';
      startBtn.className = 'w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5';
      startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Praticar esta Lição com a IA';
      startBtn.addEventListener('click', () => startGuidedLesson(lesson));

      actionRow.appendChild(startBtn);

      card.appendChild(header);
      card.appendChild(grammarBox);
      card.appendChild(phrasesTitle);
      card.appendChild(phrasesWrap);
      card.appendChild(actionRow);
      container.appendChild(card);
    });
  }

  function findActiveLessonObj() {
    if (!appState.activeLessonId) return null;
    const lang = appState.currentLang;
    const allLevels = CURRICULUM[lang]?.lessons || {};
    for (const lvl of Object.keys(allLevels)) {
      const found = allLevels[lvl].find(l => l.id === appState.activeLessonId);
      if (found) return found;
    }
    return null;
  }

  function startGuidedLesson(lesson) {
    appState.activeLessonId = lesson.id;
    appState.scenario = 'lesson_practice';
    document.getElementById('scenario-select').value = 'lesson_practice';
    savePersistedState();

    updateActiveLessonBanner();
    switchTab('conversation');

    // Mensagem inicial do tutor guiando a lição escolhida
    const introMsg = `📚 Iniciando ${lesson.title}! Foco: ${lesson.grammar} Tente falar ou digitar uma das frases da lição (ex: "${lesson.phrases[0]}") para começarmos!`;
    appState.conversations[appState.currentLang].push({
      sender: 'assistant',
      text: introMsg,
      timestamp: Date.now()
    });
    savePersistedState();
    renderConversationFeed();
  }

  function updateActiveLessonBanner() {
    const banner = document.getElementById('active-lesson-banner');
    const textEl = document.getElementById('active-lesson-banner-text');
    const lesson = findActiveLessonObj();

    if (lesson && appState.scenario === 'lesson_practice') {
      banner.classList.remove('hidden');
      textEl.textContent = `🎯 Em aula: ${lesson.title}`;
    } else {
      banner.classList.add('hidden');
    }
  }

  // RENDERIZAÇÃO SEGURA DO CHAT
  function renderConversationFeed() {
    updateActiveLessonBanner();
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';

    const history = appState.conversations[appState.currentLang] || [];
    if (history.length === 0) {
      const welcomeCard = document.createElement('div');
      welcomeCard.className = 'bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-slate-300 text-xs sm:text-sm leading-relaxed';
      welcomeCard.textContent = LANGUAGES[appState.currentLang].welcome;
      container.appendChild(welcomeCard);
      return;
    }

    history.forEach(item => {
      appendMessageDOM(item.sender, item.text, item.correction, item.isError);
    });
    container.scrollTop = container.scrollHeight;
  }

  function appendMessageDOM(sender, text, correction = null, isError = false) {
    const container = document.getElementById('chat-messages');
    const wrapper = document.createElement('div');

    if (sender === 'user') {
      wrapper.className = 'flex justify-end';
      const bubble = document.createElement('div');
      bubble.className = 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-100 px-3.5 py-2 rounded-2xl rounded-tr-none max-w-[85%] text-xs sm:text-sm break-words';
      bubble.textContent = text;
      wrapper.appendChild(bubble);
    } else {
      wrapper.className = 'flex flex-col gap-1.5 max-w-[92%]';
      const bubble = document.createElement('div');
      bubble.className = isError
        ? 'bg-rose-950/50 border border-rose-700/50 p-3.5 rounded-2xl rounded-tl-none text-rose-200 text-xs sm:text-sm leading-relaxed space-y-2'
        : 'bg-slate-900 border border-slate-800 p-3.5 rounded-2xl rounded-tl-none text-slate-200 text-xs sm:text-sm leading-relaxed space-y-2';

      const topRow = document.createElement('div');
      topRow.className = 'flex items-start justify-between gap-2';

      const replyP = document.createElement('p');
      replyP.className = 'break-words flex-1';
      replyP.textContent = text;
      topRow.appendChild(replyP);

      if (!isError) {
        const listenBtn = document.createElement('button');
        listenBtn.type = 'button';
        listenBtn.className = 'p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl flex-shrink-0 text-xs';
        listenBtn.title = 'Ouvir resposta';
        listenBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        listenBtn.addEventListener('click', () => speakText(text, appState.currentLang));
        topRow.appendChild(listenBtn);
      }

      bubble.appendChild(topRow);

      if (correction && correction.has_error) {
        const corrBox = document.createElement('div');
        corrBox.className = 'bg-amber-950/40 border border-amber-600/30 rounded-xl p-2.5 text-xs text-amber-200 mt-1 space-y-1';

        const title = document.createElement('div');
        title.className = 'font-bold text-amber-400';
        title.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles mr-1"></i> Sugestão Natural:';

        const compareLine = document.createElement('div');
        const wrongSpan = document.createElement('span');
        wrongSpan.className = 'line-through text-slate-400';
        wrongSpan.textContent = correction.user_phrase || '';

        const arrowSpan = document.createElement('span');
        arrowSpan.textContent = ' ➔ ';

        const nativeSpan = document.createElement('span');
        nativeSpan.className = 'text-emerald-400 font-semibold';
        nativeSpan.textContent = correction.native_way || '';

        compareLine.appendChild(wrongSpan);
        compareLine.appendChild(arrowSpan);
        compareLine.appendChild(nativeSpan);

        const expDiv = document.createElement('div');
        expDiv.className = 'text-slate-300 text-[11px]';
        expDiv.textContent = correction.explanation_pt || '';

        corrBox.appendChild(title);
        corrBox.appendChild(compareLine);
        corrBox.appendChild(expDiv);
        bubble.appendChild(corrBox);
      }

      wrapper.appendChild(bubble);
    }

    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
  }

  // RECONHECIMENTO DE VOZ E TTS
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      recognition = null;
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = LANGUAGES[appState.currentLang].bcp47;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript.trim()) {
        handleUserMessage(transcript.trim());
      }
    };

    recognition.onerror = () => stopListeningState();
    recognition.onend = () => stopListeningState();
  }

  function toggleListening() {
    if (!getActiveApiKey()) {
      toggleConfig(true);
      alert('Insira sua chave gratuita do Gemini nas configurações antes de iniciar.');
      return;
    }

    if (!recognition) initSpeechRecognition();
    if (!recognition) {
      alert('Seu navegador atual não suporta transcrição de voz nativa. Use o campo de texto ou abra no Chrome.');
      return;
    }

    if (isListening) {
      recognition.stop();
      stopListeningState();
    } else {
      try {
        recognition.lang = LANGUAGES[appState.currentLang].bcp47;
        recognition.start();
        isListening = true;
        document.getElementById('mic-btn').classList.add('bg-rose-500', 'pulse-mic');
        document.getElementById('listening-indicator').classList.remove('hidden');
      } catch (err) {
        stopListeningState();
      }
    }
  }

  function stopListeningState() {
    isListening = false;
    const btn = document.getElementById('mic-btn');
    const ind = document.getElementById('listening-indicator');
    if (btn) btn.classList.remove('bg-rose-500', 'pulse-mic');
    if (ind) ind.classList.add('hidden');
  }

  function speakText(text, langCode) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = (LANGUAGES[langCode] || LANGUAGES.en).bcp47;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  // CHAMADA À API GEMINI COM AUTO-FALLBACK PARA MODELOS 3.8 / 3.6 / 3.5 GRATUITOS
  async function callGeminiWithFallback(apiKey, contents) {
    const preferred = appState.selectedModel || DEFAULT_MODEL;
    const candidates = Array.from(new Set([
      preferred,
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite'
    ]));

    let lastError = null;

    for (const modelName of candidates) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        const data = await response.json();
        if (response.ok) {
          if (appState.selectedModel !== modelName) {
            appState.selectedModel = modelName;
            savePersistedState();
          }
          return data;
        }

        const errMsg = data?.error?.message || `Erro HTTP ${response.status}`;
        lastError = new Error(errMsg);

        // Se o modelo não estiver disponível na conta (404) ou esgotou cota (429), tenta o próximo gratuito automaticamente
        if (response.status === 404 || response.status === 429 || errMsg.includes('no longer available')) {
          continue;
        } else {
          throw lastError;
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Falha ao conectar aos modelos Gemini.');
  }

  async function handleUserMessage(userText) {
    const cleanText = (userText || '').trim();
    if (!cleanText) return;

    const apiKey = getActiveApiKey();
    if (!apiKey) {
      toggleConfig(true);
      alert('Configure sua chave pessoal do Gemini primeiro.');
      return;
    }

    const lang = appState.currentLang;
    const langMeta = LANGUAGES[lang];
    const userLevel = appState.levels[lang] || 'A1';
    const scenario = appState.scenario;
    const activeLesson = findActiveLessonObj();

    appState.conversations[lang].push({
      sender: 'user',
      text: cleanText,
      timestamp: Date.now()
    });
    markStudyToday();
    savePersistedState();
    appendMessageDOM('user', cleanText);

    const recentTurns = appState.conversations[lang]
      .slice(-9, -1)
      .filter(m => !m.isError)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

    const lessonContext = (scenario === 'lesson_practice' && activeLesson)
      ? `ACTIVE GUIDED LESSON: "${activeLesson.title}". Target grammar: ${activeLesson.grammar}. Target phrases: ${activeLesson.phrases.join(' | ')}. Guide the user step by step: ${activeLesson.promptGoal}`
      : `Scenario: ${scenario}.`;

    const systemPrompt = `
You are an expert adaptive language tutor and friendly native ${langMeta.label} speaker.
User's current level in ${langMeta.label}: ${userLevel}.
${lessonContext}
Note: You receive the text transcription of what the user spoke or typed, so evaluate grammar, vocabulary, word choice, and natural phrasing.

INSTRUCTIONS:
- Match the user's ${userLevel} proficiency level. If ${userLevel} is A1, use very simple short sentences in ${langMeta.label} and add a short Portuguese hint in parentheses if needed.
- Keep your reply concise (1 to 3 sentences maximum) and end with a simple question to keep them practicing.
- Check if the user made any grammar, word choice, preposition, suffix, or phrasing mistake (for example, saying "press my English" instead of "practice my English").
- If there is an error, set has_error to true, quote the exact mistake in user_phrase, show the natural native phrasing in native_way, and explain why in 1 clear Portuguese sentence in explanation_pt.

Return ONLY valid JSON with this exact schema:
{
  "reply": "Your conversational response in ${langMeta.label}",
  "correction": {
    "has_error": true,
    "user_phrase": "exact user snippet with mistake",
    "native_way": "natural native version in ${langMeta.label}",
    "explanation_pt": "Explicação curta e direta em português sobre a correção."
  }
}`;

    try {
      const data = await callGeminiWithFallback(apiKey, [
        ...recentTurns,
        { role: 'user', parts: [{ text: systemPrompt }] }
      ]);

      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!rawText) throw new Error('Resposta vazia da IA.');

      const parsed = JSON.parse(rawText);
      const replyText = parsed.reply || '...';
      const correction = parsed.correction || { has_error: false };

      appState.conversations[lang].push({
        sender: 'assistant',
        text: replyText,
        correction: correction,
        timestamp: Date.now()
      });
      savePersistedState();

      appendMessageDOM('assistant', replyText, correction, false);
      speakText(replyText, lang);

      if (correction && correction.has_error && correction.native_way) {
        saveToVault(correction, lang);
      }
    } catch (err) {
      const friendlyError = `Não foi possível obter resposta (${err.message}). Verifique sua chave ou selecione outro modelo nas Configurações (⚙️).`;
      appState.conversations[lang].push({
        sender: 'assistant',
        text: friendlyError,
        isError: true,
        timestamp: Date.now()
      });
      savePersistedState();
      appendMessageDOM('assistant', friendlyError, null, true);
    }
  }

  async function fetchAvailableModels() {
    const apiKey = document.getElementById('api-key-input').value.trim() || getActiveApiKey();
    const statusEl = document.getElementById('model-status-msg');
    const selectEl = document.getElementById('model-select');

    if (!apiKey) {
      statusEl.textContent = 'Insira sua chave API no campo acima primeiro.';
      statusEl.className = 'text-[11px] text-rose-400';
      return;
    }

    statusEl.textContent = 'Consultando modelos disponíveis para sua chave...';
    statusEl.className = 'text-[11px] text-amber-400';

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Chave inválida');

      const models = (data.models || [])
        .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''))
        .filter(name => name.startsWith('gemini') && !name.includes('2.5'));

      if (models.length === 0) throw new Error('Nenhum modelo compatível retornado.');

      selectEl.innerHTML = '';
      models.forEach(modelId => {
        const opt = document.createElement('option');
        opt.value = modelId;
        opt.textContent = modelId;
        selectEl.appendChild(opt);
      });

      const preferred = models.find(m => m.includes('3.8-flash')) || models.find(m => m.includes('flash')) || models[0];
      appState.selectedModel = preferred;
      selectEl.value = preferred;
      savePersistedState();

      statusEl.textContent = `✅ Modelos atualizados! Selecionado: ${preferred}`;
      statusEl.className = 'text-[11px] text-emerald-400';
    } catch (err) {
      statusEl.textContent = `Erro ao consultar: ${err.message}`;
      statusEl.className = 'text-[11px] text-rose-400';
    }
  }

  // VAULT DE ERROS
  function saveToVault(corr, langCode) {
    appState.vault.unshift({
      id: Date.now(),
      lang: langCode,
      user: corr.user_phrase || '',
      native: corr.native_way || '',
      tip: corr.explanation_pt || '',
      date: new Date().toLocaleDateString('pt-BR')
    });
    savePersistedState();
    updateVaultCount();
  }

  function updateVaultCount() {
    const el = document.getElementById('vault-count');
    if (el) el.textContent = appState.vault.length;
  }

  function renderVault() {
    const list = document.getElementById('vault-list');
    const filter = document.getElementById('vault-filter-lang')?.value || 'all';
    list.innerHTML = '';

    const items = filter === 'all'
      ? appState.vault
      : appState.vault.filter(item => item.lang === filter);

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'text-center py-10 text-slate-500 text-xs';
      empty.textContent = 'Nenhuma revisão salva para este filtro ainda.';
      list.appendChild(empty);
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-2';

      const info = document.createElement('div');
      info.className = 'space-y-1 flex-1';

      const meta = document.createElement('div');
      meta.className = 'flex items-center gap-2';

      const langBadge = document.createElement('span');
      langBadge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-bold text-emerald-400';
      langBadge.textContent = (item.lang || 'en').toUpperCase();

      const dateSpan = document.createElement('span');
      dateSpan.className = 'text-[10px] text-slate-500';
      dateSpan.textContent = item.date || '';

      meta.appendChild(langBadge);
      meta.appendChild(dateSpan);

      const phrases = document.createElement('div');
      phrases.className = 'text-xs sm:text-sm break-words';

      const userSpan = document.createElement('span');
      userSpan.className = 'text-rose-400 line-through';
      userSpan.textContent = item.user;

      const arrow = document.createElement('span');
      arrow.textContent = ' ➔ ';

      const nativeSpan = document.createElement('span');
      nativeSpan.className = 'text-emerald-400 font-semibold';
      nativeSpan.textContent = item.native;

      phrases.appendChild(userSpan);
      phrases.appendChild(arrow);
      phrases.appendChild(nativeSpan);

      const tipDiv = document.createElement('div');
      tipDiv.className = 'text-[11px] text-slate-400';
      tipDiv.textContent = item.tip;

      info.appendChild(meta);
      info.appendChild(phrases);
      info.appendChild(tipDiv);

      const playBtn = document.createElement('button');
      playBtn.type = 'button';
      playBtn.className = 'p-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl flex-shrink-0';
      playBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      playBtn.addEventListener('click', () => speakText(item.native, item.lang || 'en'));

      card.appendChild(info);
      card.appendChild(playBtn);
      list.appendChild(card);
    });
  }

  function renderMediaResources() {
    const container = document.getElementById('media-resources');
    const label = document.getElementById('media-lang-label');
    const langMeta = LANGUAGES[appState.currentLang] || LANGUAGES.en;

    if (label) label.textContent = langMeta.code.toUpperCase();
    container.innerHTML = '';

    langMeta.resources.forEach(res => {
      const box = document.createElement('div');
      box.className = 'p-2.5 bg-slate-950 rounded-xl border border-slate-800';
      const b = document.createElement('b');
      b.className = 'text-emerald-400';
      b.textContent = `${res.title}: `;
      box.appendChild(b);
      box.appendChild(document.createTextNode(res.desc));
      container.appendChild(box);
    });
  }

  function exportBackup() {
    const backupPayload = {
      app: 'LingoFlow AI',
      version: 3,
      exportedAt: new Date().toISOString(),
      data: {
        currentLang: appState.currentLang,
        levels: appState.levels,
        completedLessons: appState.completedLessons,
        scenario: appState.scenario,
        selectedModel: appState.selectedModel,
        conversations: appState.conversations,
        vault: appState.vault,
        studyDates: appState.studyDates
      }
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingoflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const incoming = parsed.data || parsed;

        if (incoming.levels) Object.assign(appState.levels, incoming.levels);
        if (Array.isArray(incoming.completedLessons)) {
          appState.completedLessons = Array.from(new Set([...appState.completedLessons, ...incoming.completedLessons]));
        }
        if (incoming.conversations) {
          ['en', 'fr', 'tr'].forEach(code => {
            if (Array.isArray(incoming.conversations[code])) {
              appState.conversations[code] = incoming.conversations[code];
            }
          });
        }
        if (Array.isArray(incoming.vault)) {
          const existingIds = new Set(appState.vault.map(v => v.id));
          incoming.vault.forEach(item => {
            if (!existingIds.has(item.id)) appState.vault.push(item);
          });
        }
        if (Array.isArray(incoming.studyDates)) {
          appState.studyDates = Array.from(new Set([...appState.studyDates, ...incoming.studyDates]));
        }

        savePersistedState();
        updateVaultCount();
        renderStudyBadge();
        setLanguage(appState.currentLang);
        alert('Backup restaurado com sucesso!');
      } catch (err) {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  }

  function toggleConfig(forceOpen = null) {
    const modal = document.getElementById('config-modal');
    const shouldOpen = forceOpen !== null ? forceOpen : modal.classList.contains('hidden');
    if (shouldOpen) {
      modal.classList.remove('hidden');
      document.getElementById('api-key-input').value = getActiveApiKey();
      document.getElementById('remember-key-checkbox').checked = appState.rememberKeyPreference;
      document.getElementById('model-select').value = appState.selectedModel || DEFAULT_MODEL;
    } else {
      modal.classList.add('hidden');
    }
  }

  function registerPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-fr').addEventListener('click', () => setLanguage('fr'));
    document.getElementById('lang-tr').addEventListener('click', () => setLanguage('tr'));

    document.getElementById('tab-btn-lessons').addEventListener('click', () => switchTab('lessons'));
    document.getElementById('tab-btn-conversation').addEventListener('click', () => switchTab('conversation'));
    document.getElementById('tab-btn-media').addEventListener('click', () => switchTab('media'));
    document.getElementById('tab-btn-vault').addEventListener('click', () => switchTab('vault'));

    // Nivelamento e Lições
    document.getElementById('manual-level-select').addEventListener('change', (e) => {
      appState.levels[appState.currentLang] = e.target.value;
      savePersistedState();
      renderLevelUI();
      renderLessonsList();
    });
    document.getElementById('btn-start-quiz').addEventListener('click', startPlacementQuiz);
    document.getElementById('btn-close-quiz').addEventListener('click', () => {
      document.getElementById('quiz-container').classList.add('hidden');
    });
    document.getElementById('btn-finish-lesson').addEventListener('click', () => {
      if (appState.activeLessonId && !appState.completedLessons.includes(appState.activeLessonId)) {
        appState.completedLessons.push(appState.activeLessonId);
      }
      appState.activeLessonId = null;
      savePersistedState();
      updateActiveLessonBanner();
      renderLessonsList();
      switchTab('lessons');
    });

    // Cenário
    const scenarioSelect = document.getElementById('scenario-select');
    scenarioSelect.value = appState.scenario || 'adaptive_interview';
    scenarioSelect.addEventListener('change', (e) => {
      appState.scenario = e.target.value;
      savePersistedState();
      updateActiveLessonBanner();
    });

    // Voz e Texto
    document.getElementById('mic-btn').addEventListener('click', toggleListening);
    const textInput = document.getElementById('text-input');
    document.getElementById('btn-send-text').addEventListener('click', () => {
      handleUserMessage(textInput.value);
      textInput.value = '';
    });
    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleUserMessage(textInput.value);
        textInput.value = '';
      }
    });

    document.getElementById('btn-clear-chat').addEventListener('click', () => {
      if (confirm('Deseja limpar o histórico de conversa deste idioma?')) {
        appState.conversations[appState.currentLang] = [];
        savePersistedState();
        renderConversationFeed();
      }
    });

    document.getElementById('vault-filter-lang').addEventListener('change', renderVault);
    document.getElementById('btn-clear-vault').addEventListener('click', () => {
      if (confirm('Deseja apagar todos os cards de revisão salvos?')) {
        appState.vault = [];
        savePersistedState();
        updateVaultCount();
        renderVault();
      }
    });

    document.getElementById('btn-open-config').addEventListener('click', () => toggleConfig(true));
    document.getElementById('btn-close-config').addEventListener('click', () => toggleConfig(false));
    document.getElementById('btn-save-key').addEventListener('click', () => {
      const key = document.getElementById('api-key-input').value;
      const remember = document.getElementById('remember-key-checkbox').checked;
      setActiveApiKey(key, remember);
      appState.selectedModel = document.getElementById('model-select').value;
      savePersistedState();
      toggleConfig(false);
    });
    document.getElementById('btn-remove-key').addEventListener('click', () => {
      setActiveApiKey('', false);
      document.getElementById('api-key-input').value = '';
      alert('Chave removida! Seu progresso continua salvo.');
    });

    document.getElementById('btn-fetch-models').addEventListener('click', fetchAvailableModels);
    document.getElementById('model-select').addEventListener('change', (e) => {
      appState.selectedModel = e.target.value;
      savePersistedState();
    });

    document.getElementById('btn-export-backup').addEventListener('click', exportBackup);
    document.getElementById('input-import-backup').addEventListener('change', (e) => {
      importBackup(e.target.files[0]);
      e.target.value = '';
    });

    const updateOnlineStatus = () => {
      document.getElementById('offline-banner').classList.toggle('hidden', navigator.onLine);
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    updateKeyStatusIndicator();
    updateVaultCount();
    renderStudyBadge();
    setLanguage(appState.currentLang);
    registerPWA();
  });
})();
