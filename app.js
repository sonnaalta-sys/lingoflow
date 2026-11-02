(() => {
  // CHAVES DE ARMAZENAMENTO (Mantém compatibilidade com dados antigos sem apagá-los)
  const STORAGE_KEYS = {
    STATE: 'lingoflow_state_v2',
    LEGACY_VAULT: 'lingoflow_vault',
    LEGACY_KEY: 'lingoflow_gemini_key',
    SESSION_KEY: 'lingoflow_session_gemini_key'
  };

  const LANGUAGES = {
    en: {
      code: 'en',
      label: 'English',
      bcp47: 'en-US',
      welcome: '👋 Olá! Toque no microfone ou digite abaixo para praticar Inglês. O navegador transcreve sua fala e a IA adapta o nível da conversa, corrigindo gramática e vocabulário.',
      resources: [
        { title: 'Podcasts Naturais', desc: "6 Minute English (BBC), The Daily (NYT), Luke's English Podcast." },
        { title: 'Canais do YouTube', desc: 'Vox (ritmo jornalístico), Kurzgesagt (dicção nítida), Easy English.' },
        { title: 'Músicas & Letras', desc: 'Acompanhe letras no Genius.com ou LyricsTraining para treinar escuta.' }
      ]
    },
    fr: {
      code: 'fr',
      label: 'French',
      bcp47: 'fr-FR',
      welcome: '👋 Bonjour ! Toque no microfone ou digite abaixo para praticar Francês. Sua fala é transcrita para texto e a IA responde no seu nível com correções gramaticais em português.',
      resources: [
        { title: 'Podcasts Naturais', desc: 'InnerFrench (intermediário claro), Journal en français facile (RFI).' },
        { title: 'Canais do YouTube', desc: 'Easy French (conversas reais nas ruas com legendas), Piece of French.' },
        { title: 'Músicas Recomendadas', desc: 'Stromae, Angèle, Pomme, Indila (excelente articulação vocal).' }
      ]
    },
    tr: {
      code: 'tr',
      label: 'Turkish',
      bcp47: 'tr-TR',
      welcome: '👋 Merhaba! Toque no microfone ou digite abaixo para praticar Turco. A IA ajuda você a dominar a harmonia vocálica, sufixos e expressões reais do dia a dia.',
      resources: [
        { title: 'Podcasts Naturais', desc: 'Turkish Coffee Podcast, Learn Turkish with Turkishaholic.' },
        { title: 'Canais do YouTube', desc: 'Easy Turkish (entrevistas de rua com legendas duplas), Turkishle.' },
        { title: 'Séries & Músicas', desc: 'Séries turcas com legenda em TR; músicas de Tarkan, Sezen Aksu e Mabel Matiz.' }
      ]
    }
  };

  // ESTADO PADRÃO PERSISTENTE (Separado da chave de API)
  const defaultState = {
    currentLang: 'en',
    scenario: 'adaptive_interview',
    selectedModel: 'gemini-2.5-flash',
    rememberKeyPreference: true,
    conversations: {
      en: [],
      fr: [],
      tr: []
    },
    vault: [],
    studyDates: []
  };

  let appState = loadPersistedState();
  let isListening = false;
  let recognition = null;

  // CARREGAMENTO COM MIGRAÇÃO SEGURA DE DADOS ANTIGOS
  function loadPersistedState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.STATE) || 'null');
      const legacyVault = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEGACY_VAULT) || '[]');
      const merged = Object.assign({}, defaultState, saved || {});
      merged.conversations = Object.assign({ en: [], fr: [], tr: [] }, (saved && saved.conversations) || {});

      if (Array.isArray(legacyVault) && legacyVault.length > 0 && (!merged.vault || merged.vault.length === 0)) {
        merged.vault = legacyVault;
      }
      if (!LANGUAGES[merged.currentLang]) merged.currentLang = 'en';
      return merged;
    } catch (e) {
      console.warn('Erro ao restaurar estado, iniciando padrão:', e);
      return structuredClone(defaultState);
    }
  }

  function savePersistedState() {
    try {
      localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(appState));
      // Mantém espelho no legado para nunca perder revisões
      localStorage.setItem(STORAGE_KEYS.LEGACY_VAULT, JSON.stringify(appState.vault));
    } catch (e) {
      console.error('Falha ao salvar estado no armazenamento local:', e);
    }
  }

  // GESTÃO SEPARADA DA CHAVE DE API
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
    const hasKey = Boolean(getActiveApiKey());
    dot.className = hasKey
      ? 'w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5'
      : 'w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5';
  }

  // REGISTRO DE DIAS DE ESTUDO (PROGRESSO)
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

  // TROCA DE IDIOMA
  function setLanguage(lang) {
    if (!LANGUAGES[lang]) return;
    appState.currentLang = lang;
    savePersistedState();

    ['en', 'fr', 'tr'].forEach(code => {
      const btn = document.getElementById(`lang-${code}`);
      if (!btn) return;
      if (code === lang) {
        btn.className = 'px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition bg-emerald-500 text-slate-950';
      } else {
        btn.className = 'px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition text-slate-400 hover:text-white';
      }
    });

    renderConversationFeed();
    renderMediaResources();
    initSpeechRecognition();
  }

  // NAVEGAÇÃO DE ABAS
  function switchTab(tab) {
    ['conversation', 'media', 'vault'].forEach(t => {
      document.getElementById(`tab-${t}`).classList.add('hidden');
      const btn = document.getElementById(`tab-btn-${t}`);
      btn.className = 'flex-1 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5';
    });

    document.getElementById(`tab-${tab}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`tab-btn-${tab}`);
    activeBtn.className = 'flex-1 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5';

    if (tab === 'vault') renderVault();
  }

  // RENDERIZAÇÃO SEGURA DE MENSAGENS (SEM INNERHTML COM DADOS EXTERNOS)
  function renderConversationFeed() {
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

  // RECONHECIMENTO DE VOZ CORRIGIDO (results[0][0].transcript)
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

    recognition.onerror = (e) => {
      console.warn('Aviso no reconhecimento de voz:', e.error);
      stopListeningState();
    };

    recognition.onend = () => {
      stopListeningState();
    };
  }

  function toggleListening() {
    if (!getActiveApiKey()) {
      toggleConfig(true);
      alert('Insira sua chave gratuita do Gemini nas configurações antes de iniciar.');
      return;
    }

    if (!recognition) initSpeechRecognition();
    if (!recognition) {
      alert('Seu navegador atual não suporta transcrição de voz nativa. Use o campo de texto abaixo ou abra no Chrome.');
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
        console.error(err);
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

  // LEITURA EM VOZ ALTA (TTS) PARA EN, FR E TR
  function speakText(text, langCode) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = (LANGUAGES[langCode] || LANGUAGES.en).bcp47;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  // ENVIO DE MENSAGEM (VOZ TRANSCRITA OU TEXTO DIGITADO)
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
    const scenario = appState.scenario;

    // Salva mensagem do usuário no estado persistente
    appState.conversations[lang].push({
      sender: 'user',
      text: cleanText,
      timestamp: Date.now()
    });
    markStudyToday();
    savePersistedState();
    appendMessageDOM('user', cleanText);

    // Constrói contexto recente (últimas 10 mensagens deste idioma)
    const recentTurns = appState.conversations[lang]
      .slice(-11, -1)
      .filter(m => !m.isError)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

    const systemPrompt = `
You are an expert adaptive language tutor and friendly native ${langMeta.label} conversation partner.
Active scenario: ${scenario}.
Note: You receive the text transcription of what the user spoke or typed, so evaluate grammar, vocabulary, word choice, and phrasing (do not claim to hear acoustic pronunciation directly).

ADAPTIVE LEVEL SYSTEM:
- Analyze the user's message: "${cleanText}".
- Dynamically match their proficiency level (A1, A2, B1, B2, C1).
- Keep your reply in ${langMeta.label} natural, engaging, and concise (1 to 3 sentences maximum), ending with an open question to keep the conversation flowing.

GRAMMAR & PHRASING CORRECTION:
- Check if the user made any grammar, preposition, suffix, vowel harmony (for Turkish), gender agreement (for French), or unnatural phrasing error.
- If there is an error, set has_error to true, quote the exact part in user_phrase, provide the natural native way in native_way, and write a clear 1-sentence explanation in Portuguese in explanation_pt.

Return ONLY valid JSON with this exact schema:
{
  "reply": "Your conversational response in ${langMeta.label}",
  "correction": {
    "has_error": true,
    "user_phrase": "exact user snippet with mistake",
    "native_way": "natural native version in ${langMeta.label}",
    "explanation_pt": "Explicação curta e direta em português sobre a regra ou melhoria."
  }
}`;

    const modelName = appState.selectedModel || 'gemini-2.5-flash';

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            ...recentTurns,
            { role: 'user', parts: [{ text: systemPrompt }] }
          ],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const apiErrMsg = data?.error?.message || `Erro HTTP ${response.status}`;
        throw new Error(apiErrMsg);
      }

      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!rawText) throw new Error('A IA retornou uma resposta vazia.');

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
      console.error('Erro na chamada Gemini:', err);
      const friendlyError = `Não foi possível obter resposta (${err.message}). Verifique sua chave de API, sua conexão ou troque o modelo Gemini nas Configurações (⚙️).`;
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

  // CONSULTA DINÂMICA DE MODELOS GEMINI DISPONÍVEIS
  async function fetchAvailableModels() {
    const apiKey = document.getElementById('api-key-input').value.trim() || getActiveApiKey();
    const statusEl = document.getElementById('model-status-msg');
    const selectEl = document.getElementById('model-select');

    if (!apiKey) {
      statusEl.textContent = 'Insira sua chave API no campo acima primeiro.';
      statusEl.className = 'text-[11px] text-rose-400';
      return;
    }

    statusEl.textContent = 'Consultando modelos na sua conta...';
    statusEl.className = 'text-[11px] text-amber-400';

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Chave inválida');

      const models = (data.models || [])
        .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''))
        .filter(name => name.startsWith('gemini'));

      if (models.length === 0) throw new Error('Nenhum modelo compatível retornado.');

      selectEl.innerHTML = '';
      models.forEach(modelId => {
        const opt = document.createElement('option');
        opt.value = modelId;
        opt.textContent = modelId;
        selectEl.appendChild(opt);
      });

      if (models.includes(appState.selectedModel)) {
        selectEl.value = appState.selectedModel;
      } else {
        appState.selectedModel = models[0];
        selectEl.value = models[0];
        savePersistedState();
      }

      statusEl.textContent = `✅ ${models.length} modelos carregados com sucesso!`;
      statusEl.className = 'text-[11px] text-emerald-400';
    } catch (err) {
      statusEl.textContent = `Erro ao consultar: ${err.message}`;
      statusEl.className = 'text-[11px] text-rose-400';
    }
  }

  // VAULT DE ERROS (COM RENDERIZAÇÃO SEGURA E FILTRO)
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
      empty.textContent = 'Nenhuma revisão salva para este filtro ainda. Pratique na aba Conversa!';
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
      playBtn.title = 'Ouvir frase nativa';
      playBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      playBtn.addEventListener('click', () => speakText(item.native, item.lang || 'en'));

      card.appendChild(info);
      card.appendChild(playBtn);
      list.appendChild(card);
    });
  }

  // RECURSOS DE MÍDIA POR IDIOMA
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

  // EXPORTAÇÃO E IMPORTAÇÃO DE BACKUP (SEM CHAVE DE API)
  function exportBackup() {
    const backupPayload = {
      app: 'LingoFlow AI',
      version: 2,
      exportedAt: new Date().toISOString(),
      data: {
        currentLang: appState.currentLang,
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
        renderVault();
        alert('Backup restaurado com sucesso!');
      } catch (err) {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  }

  // MODAL DE CONFIGURAÇÕES
  function toggleConfig(forceOpen = null) {
    const modal = document.getElementById('config-modal');
    const shouldOpen = forceOpen !== null ? forceOpen : modal.classList.contains('hidden');
    if (shouldOpen) {
      modal.classList.remove('hidden');
      document.getElementById('api-key-input').value = getActiveApiKey();
      document.getElementById('remember-key-checkbox').checked = appState.rememberKeyPreference;
      document.getElementById('model-select').value = appState.selectedModel || 'gemini-2.5-flash';
    } else {
      modal.classList.add('hidden');
    }
  }

  // REGISTRO DO SERVICE WORKER (RELATIVO PARA FUNCIONAR EM /lingoflow/)
  function registerPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      }).catch(err => console.warn('SW não registrado:', err));
    }
  }

  // INICIALIZAÇÃO E EVENTOS
  window.addEventListener('DOMContentLoaded', () => {
    // Idiomas
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-fr').addEventListener('click', () => setLanguage('fr'));
    document.getElementById('lang-tr').addEventListener('click', () => setLanguage('tr'));

    // Abas
    document.getElementById('tab-btn-conversation').addEventListener('click', () => switchTab('conversation'));
    document.getElementById('tab-btn-media').addEventListener('click', () => switchTab('media'));
    document.getElementById('tab-btn-vault').addEventListener('click', () => switchTab('vault'));

    // Cenário
    const scenarioSelect = document.getElementById('scenario-select');
    scenarioSelect.value = appState.scenario || 'adaptive_interview';
    scenarioSelect.addEventListener('change', (e) => {
      appState.scenario = e.target.value;
      savePersistedState();
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

    // Limpar conversa do idioma atual
    document.getElementById('btn-clear-chat').addEventListener('click', () => {
      if (confirm(`Deseja limpar o histórico de conversa em ${LANGUAGES[appState.currentLang].label}? (Suas revisões no Vault serão mantidas)`)) {
        appState.conversations[appState.currentLang] = [];
        savePersistedState();
        renderConversationFeed();
      }
    });

    // Vault
    document.getElementById('vault-filter-lang').addEventListener('change', renderVault);
    document.getElementById('btn-clear-vault').addEventListener('click', () => {
      if (confirm('Deseja apagar todos os cards de revisão salvos?')) {
        appState.vault = [];
        savePersistedState();
        updateVaultCount();
        renderVault();
      }
    });

    // Configurações e Chave
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
      alert('Chave removida do aparelho! Seu progresso e revisões continuam salvos.');
    });

    document.getElementById('btn-fetch-models').addEventListener('click', fetchAvailableModels);
    document.getElementById('model-select').addEventListener('change', (e) => {
      appState.selectedModel = e.target.value;
      savePersistedState();
    });

    // Backup
    document.getElementById('btn-export-backup').addEventListener('click', exportBackup);
    document.getElementById('input-import-backup').addEventListener('change', (e) => {
      importBackup(e.target.files[0]);
      e.target.value = '';
    });

    // Monitoramento Offline/Online
    const updateOnlineStatus = () => {
      document.getElementById('offline-banner').classList.toggle('hidden', navigator.onLine);
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Restaura estado visual
    updateKeyStatusIndicator();
    updateVaultCount();
    renderStudyBadge();
    setLanguage(appState.currentLang);
    registerPWA();
  });
})();
