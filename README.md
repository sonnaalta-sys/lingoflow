<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LingoFlow AI - Imersão & Conversação</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .pulse-mic {
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans select-none">

  <!-- Topbar -->
  <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50 p-4">
    <div class="max-w-4xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-brain text-emerald-400 text-2xl"></i>
        <h1 class="text-xl font-bold tracking-tight">LingoFlow <span class="text-emerald-400">AI</span></h1>
      </div>

      <!-- Seletor de Idioma -->
      <div class="flex items-center gap-2">
        <div class="bg-slate-800 p-1 rounded-xl flex">
          <button id="lang-en" onclick="setLanguage('en')" class="px-3 py-1.5 rounded-lg text-sm font-semibold transition bg-emerald-500 text-slate-950">
            🇺🇸 EN
          </button>
          <button id="lang-fr" onclick="setLanguage('fr')" class="px-3 py-1.5 rounded-lg text-sm font-semibold transition text-slate-400 hover:text-white">
            🇫🇷 FR
          </button>
        </div>
        <button onclick="toggleConfig()" class="text-slate-400 hover:text-white p-2" title="Configurações">
          <i class="fa-solid fa-gear"></i>
        </button>
      </div>
    </div>
  </header>

  <!-- Modal de Chave de API -->
  <div id="config-modal" class="hidden fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
    <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl">
      <h3 class="text-lg font-bold mb-2">Chave de API do Gemini</h3>
      <p class="text-sm text-slate-400 mb-4">
        Cole abaixo a chave gratuita gerada no <b>Google AI Studio</b> (aistudio.google.com). Ela fica guardada com segurança no seu próprio aparelho.
      </p>
      <input type="password" id="api-key-input" placeholder="Cole sua chave AI Studio aqui..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:border-emerald-500 text-white">
      <div class="flex justify-end gap-2">
        <button onclick="toggleConfig()" class="px-4 py-2 rounded-xl text-slate-400 text-sm">Fechar</button>
        <button onclick="saveApiKey()" class="px-4 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-xl text-sm">Salvar</button>
      </div>
    </div>
  </div>

  <!-- Navegação de Abas -->
  <nav class="max-w-4xl mx-auto w-full px-4 pt-3 flex gap-2">
    <button onclick="switchTab('conversation')" id="tab-btn-conversation" class="flex-1 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5">
      <i class="fa-solid fa-microphone"></i> Conversa
    </button>
    <button onclick="switchTab('media')" id="tab-btn-media" class="flex-1 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5">
      <i class="fa-solid fa-film"></i> Imersão
    </button>
    <button onclick="switchTab('vault')" id="tab-btn-vault" class="flex-1 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5">
      <i class="fa-solid fa-layer-group"></i> Vault (<span id="vault-count">0</span>)
    </button>
  </nav>

  <!-- Conteúdo Principal -->
  <main class="max-w-4xl mx-auto w-full flex-1 p-4 flex flex-col justify-between">

    <!-- ABA 1: CONVERSAÇÃO -->
    <section id="tab-conversation" class="flex-1 flex flex-col gap-3">
      <!-- Cenário Ativo -->
      <div class="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
        <div class="flex items-center gap-2 overflow-hidden">
          <span class="text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg whitespace-nowrap">Cenário:</span>
          <select id="scenario-select" class="bg-transparent text-xs sm:text-sm font-medium focus:outline-none cursor-pointer truncate">
            <option value="adaptive_interview" class="bg-slate-900">Nivelamento & Bate-papo Adaptativo</option>
            <option value="cafe" class="bg-slate-900">Pedir algo em uma cafeteria / bistrô</option>
            <option value="travel" class="bg-slate-900">Aeroporto e Imigração</option>
            <option value="media_discuss" class="bg-slate-900">Debater um filme ou música</option>
          </select>
        </div>
        <button onclick="clearChat()" class="text-xs text-slate-400 hover:text-rose-400 whitespace-nowrap ml-2" title="Reiniciar conversa">
          <i class="fa-solid fa-rotate-right"></i> Limpar
        </button>
      </div>

      <!-- Feed de Conversa e Correção -->
      <div id="chat-messages" class="flex-1 overflow-y-auto space-y-3 max-h-[55vh] pr-1">
        <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-slate-300 text-xs sm:text-sm leading-relaxed">
          👋 Olá! Selecione seu idioma acima e toque no microfone para falar. A IA avalia seu nível de vocabulário e pronúncia, ajusta a complexidade automaticamente e traz correções gramaticais pontuais.
        </div>
      </div>

      <!-- Controle de Áudio -->
      <div class="pt-3 flex flex-col items-center gap-2 border-t border-slate-800/80">
        <div id="listening-indicator" class="text-xs text-rose-400 font-semibold tracking-wider uppercase hidden">
          <i class="fa-solid fa-circle text-[8px] animate-ping mr-1"></i> Ouvindo você...
        </div>

        <div class="flex items-center gap-4">
          <button id="mic-btn" onclick="toggleListening()" class="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center text-2xl shadow-lg transition">
            <i class="fa-solid fa-microphone"></i>
          </button>
        </div>
        <p class="text-[11px] text-slate-500 text-center">Toque para começar a falar, toque novamente para enviar</p>
      </div>
    </section>

    <!-- ABA 2: IMERSÃO EM MÍDIA -->
    <section id="tab-media" class="hidden flex-1 space-y-4">
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <h2 class="text-base font-bold mb-1 flex items-center gap-2">
          <i class="fa-solid fa-lightbulb text-amber-400"></i> Metodologia dos 3 Passos Diários
        </h2>
        <p class="text-xs text-slate-400 mb-3">
          Prática ativa com filmes, séries e vídeos para treinar o ouvido:
        </p>

        <div class="grid grid-cols-1 gap-2.5">
          <div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Passo 1 • Input Compreensível</span>
            <h4 class="font-semibold text-xs mt-0.5">Legenda no Idioma Original</h4>
            <p class="text-xs text-slate-400 mt-1">Nunca assista com legenda em português. Coloque em inglês ou francês. Se não entender tudo, mantenha o foco no contexto geral.</p>
          </div>
          <div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span class="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Passo 2 • Técnica do Shadowing</span>
            <h4 class="font-semibold text-xs mt-0.5">Repita como um Eco (3 min)</h4>
            <p class="text-xs text-slate-400 mt-1">Pause uma frase dita no vídeo ou música e repita logo em seguida tentando copiar o ritmo, pausas e entonação do falante.</p>
          </div>
          <div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Passo 3 • Produção Ativa</span>
            <h4 class="font-semibold text-xs mt-0.5">Gravação de Resumo</h4>
            <p class="text-xs text-slate-400 mt-1">Abra a aba Conversa no cenário "Debater um filme ou música" e mande um áudio de 30 segundos contando o que achou.</p>
          </div>
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <h3 class="text-sm font-bold mb-2 flex items-center gap-2">
          <i class="fa-brands fa-youtube text-red-500"></i> Fontes Recomendadas:
        </h3>
        <div id="media-resources" class="space-y-2 text-xs text-slate-300">
          <!-- Preenchido via JS conforme idioma -->
        </div>
      </div>
    </section>

    <!-- ABA 3: VAULT DE ERROS -->
    <section id="tab-vault" class="hidden flex-1 space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold">Banco de Memória</h2>
          <p class="text-xs text-slate-400">Erros identificados e explicações gramaticais diretas.</p>
        </div>
        <button onclick="clearVault()" class="text-xs text-rose-400 hover:underline">Limpar</button>
      </div>

      <div id="vault-list" class="space-y-2.5 overflow-y-auto max-h-[60vh] pr-1">
        <div class="text-center py-10 text-slate-500 text-xs">
          Nenhum erro registrado ainda. Suas correções ao falar aparecerão aqui automaticamente!
        </div>
      </div>
    </section>

  </main>

  <script>
    // ESTADO DO APP
    let currentLang = 'en';
    let isListening = false;
    let recognition = null;
    let apiKey = localStorage.getItem('lingoflow_gemini_key') || '';
    let chatHistory = [];
    let vaultItems = JSON.parse(localStorage.getItem('lingoflow_vault') || '[]');

    function updateVaultCount() {
      document.getElementById('vault-count').textContent = vaultItems.length;
    }
    updateVaultCount();

    function setLanguage(lang) {
      currentLang = lang;
      const btnEn = document.getElementById('lang-en');
      const btnFr = document.getElementById('lang-fr');

      if (lang === 'en') {
        btnEn.className = "px-3 py-1.5 rounded-lg text-sm font-semibold transition bg-emerald-500 text-slate-950";
        btnFr.className = "px-3 py-1.5 rounded-lg text-sm font-semibold transition text-slate-400 hover:text-white";
      } else {
        btnFr.className = "px-3 py-1.5 rounded-lg text-sm font-semibold transition bg-emerald-500 text-slate-950";
        btnEn.className = "px-3 py-1.5 rounded-lg text-sm font-semibold transition text-slate-400 hover:text-white";
      }

      renderMediaResources();
      initSpeechRecognition();
    }

    function switchTab(tab) {
      ['conversation', 'media', 'vault'].forEach(t => {
        document.getElementById(`tab-${t}`).classList.add('hidden');
        const btn = document.getElementById(`tab-btn-${t}`);
        btn.className = "flex-1 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5";
      });

      document.getElementById(`tab-${tab}`).classList.remove('hidden');
      const activeBtn = document.getElementById(`tab-btn-${tab}`);
      activeBtn.className = "flex-1 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5";

      if (tab === 'vault') renderVault();
    }

    function initSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Navegador sem suporte a reconhecimento nativo de voz. Recomendado abrir pelo Google Chrome.");
        return;
      }

      recognition = new SpeechRecognition();
      recognition.lang = currentLang === 'en' ? 'en-US' : 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserSpeech(transcript);
      };

      recognition.onerror = (e) => {
        console.error("Speech error:", e);
        stopListeningState();
      };

      recognition.onend = () => {
        stopListeningState();
      };
    }

    function toggleListening() {
      if (!recognition) initSpeechRecognition();
      if (!apiKey) {
        toggleConfig();
        alert("Configure sua chave gratuita do Gemini antes de começar a falar.");
        return;
      }

      if (isListening) {
        recognition.stop();
        stopListeningState();
      } else {
        recognition.lang = currentLang === 'en' ? 'en-US' : 'fr-FR';
        recognition.start();
        isListening = true;
        document.getElementById('mic-btn').classList.add('bg-rose-500', 'pulse-mic');
        document.getElementById('listening-indicator').classList.remove('hidden');
      }
    }

    function stopListeningState() {
      isListening = false;
      document.getElementById('mic-btn').classList.remove('bg-rose-500', 'pulse-mic');
      document.getElementById('listening-indicator').classList.add('hidden');
    }

    function speakText(text, lang) {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-US' : 'fr-FR';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }

    async function handleUserSpeech(userText) {
      appendMessage('user', userText);

      const scenario = document.getElementById('scenario-select').value;
      const targetLangName = currentLang === 'en' ? 'English' : 'French';

      const systemInstruction = `
You are an expert adaptive language tutor and friendly native ${targetLangName} speaker.
Scenario: ${scenario}.

ADAPTIVE LEVEL SYSTEM:
- Analyze user input: "${userText}".
- Assess vocabulary range, grammatical structure, and fluency.
- Adapt your response level dynamically (A1, A2, B1, B2). Keep responses to 1-3 sentences maximum.
- If the user uses basic words or struggles, lower complexity and use simpler sentence structures.
- If the user shows higher proficiency, naturally introduce idiomatic native phrases.

GRAMMAR & CORRECTION:
- Identify if there is an unnatural phrasing, wrong preposition, tense mismatch, or syntax mistake.
- If an error exists, explain the precise grammar rule simply in Portuguese in 'explanation_pt'.

Return ONLY valid JSON matching this structure:
{
  "reply": "Your conversational response in ${targetLangName}",
  "correction": {
    "has_error": true/false,
    "user_phrase": "part with error",
    "native_way": "how a native says it naturally in ${targetLangName}",
    "explanation_pt": "Regra gramatical clara em 1 frase em português explicando o porquê da mudança."
  }
}
`;

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              ...chatHistory,
              { role: 'user', parts: [{ text: systemInstruction }] }
            ],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        const data = await response.json();
        const jsonText = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(jsonText);

        chatHistory.push({ role: 'user', parts: [{ text: userText }] });
        chatHistory.push({ role: 'model', parts: [{ text: result.reply }] });

        appendMessage('assistant', result.reply, result.correction);
        speakText(result.reply, currentLang);

        if (result.correction && result.correction.has_error) {
          saveToVault(result.correction);
        }

      } catch (err) {
        console.error(err);
        appendMessage('assistant', 'Erro na conexão ou na chave de API. Verifique a configuração.');
      }
    }

    function appendMessage(sender, text, correction = null) {
      const container = document.getElementById('chat-messages');
      const div = document.createElement('div');

      if (sender === 'user') {
        div.className = "flex justify-end";
        div.innerHTML = `
          <div class="bg-emerald-600/30 border border-emerald-500/40 text-emerald-100 px-3.5 py-2 rounded-2xl rounded-tr-none max-w-[85%] text-xs sm:text-sm">
            ${text}
          </div>
        `;
      } else {
        div.className = "flex flex-col gap-1.5 max-w-[90%]";
        let correctionHtml = '';

        if (correction && correction.has_error) {
          correctionHtml = `
            <div class="bg-amber-950/40 border border-amber-600/30 rounded-xl p-2.5 text-xs text-amber-200 mt-1">
              <div class="font-bold text-amber-400 mb-0.5"><i class="fa-solid fa-sparkles"></i> Sugestão Nativa:</div>
              <div><span class="line-through text-slate-400">${correction.user_phrase}</span> ➔ <span class="text-emerald-400 font-semibold">${correction.native_way}</span></div>
              <div class="text-slate-300 mt-1 text-[11px]">${correction.explanation_pt}</div>
            </div>
          `;
        }

        div.innerHTML = `
          <div class="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl rounded-tl-none text-slate-200 text-xs sm:text-sm leading-relaxed">
            ${text}
            ${correctionHtml}
          </div>
        `;
      }

      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }

    function saveToVault(corr) {
      vaultItems.unshift({
        id: Date.now(),
        lang: currentLang,
        user: corr.user_phrase,
        native: corr.native_way,
        tip: corr.explanation_pt,
        date: new Date().toLocaleDateString('pt-BR')
      });
      localStorage.setItem('lingoflow_vault', JSON.stringify(vaultItems));
      updateVaultCount();
    }

    function renderVault() {
      const list = document.getElementById('vault-list');
      if (vaultItems.length === 0) {
        list.innerHTML = `<div class="text-center py-10 text-slate-500 text-xs">Nenhum erro registrado ainda. Suas correções ao falar aparecerão aqui automaticamente!</div>`;
        return;
      }

      list.innerHTML = vaultItems.map(item => `
        <div class="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-2">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-bold">${item.lang.toUpperCase()}</span>
              <span class="text-[10px] text-slate-500">${item.date}</span>
            </div>
            <div class="text-xs sm:text-sm">
              <span class="text-rose-400 line-through">${item.user}</span> ➔ 
              <span class="text-emerald-400 font-semibold">${item.native}</span>
            </div>
            <div class="text-[11px] text-slate-400">${item.tip}</div>
          </div>
          <button onclick="speakText('${item.native.replace(/'/g, "\\'")}', '${item.lang}')" class="p-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl flex-shrink-0" title="Ouvir Pronúncia">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        </div>
      `).join('');
    }

    function clearVault() {
      if (confirm("Deseja apagar todos os cards de revisão?")) {
        vaultItems = [];
        localStorage.removeItem('lingoflow_vault');
        updateVaultCount();
        renderVault();
      }
    }

    function clearChat() {
      chatHistory = [];
      document.getElementById('chat-messages').innerHTML = `
        <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-slate-300 text-xs sm:text-sm leading-relaxed">
          Conversa reiniciada. Toque no microfone para começar uma nova interação!
        </div>
      `;
    }

    function renderMediaResources() {
      const container = document.getElementById('media-resources');
      if (currentLang === 'en') {
        container.innerHTML = `
          <div class="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <b class="text-emerald-400">Podcasts Naturais:</b> 6 Minute English (BBC), The Daily (NYT), Luke's English Podcast.
          </div>
          <div class="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <b class="text-emerald-400">Canais do YouTube:</b> Vox (entonação e ritmo), Kurzgesagt (inglês claro).
          </div>
          <div class="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <b class="text-emerald-400">Músicas & Letras:</b> Genius.com para acompanhar letras e gírias.
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <b class="text-emerald-400">Podcasts Naturais:</b> InnerFrench (ritmo intermediário ideal), Journal en français facile.
          </div>
          <div class="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <b class="text-emerald-400">Canais do YouTube:</b> Easy French (conversas reais com legendas), Cyprien.
          </div>
          <div class="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <b class="text-emerald-400">Músicas recomendadas:</b> Stromae, Angèle, Videoclub.
          </div>
        `;
      }
    }

    function toggleConfig() {
      const modal = document.getElementById('config-modal');
      modal.classList.toggle('hidden');
      if (!modal.classList.contains('hidden')) {
        document.getElementById('api-key-input').value = apiKey;
      }
    }

    function saveApiKey() {
      apiKey = document.getElementById('api-key-input').value.trim();
      localStorage.setItem('lingoflow_gemini_key', apiKey);
      toggleConfig();
      alert("Chave salva com sucesso!");
    }

    window.onload = () => {
      setLanguage('en');
      initSpeechRecognition();
    };
  </script>
</body>
</html>
