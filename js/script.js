/* =====================================================================
   R-EVOLUTION PARTNERS — JAVASCRIPT PRINCIPAL
   Arquivo: js/script.js → todo o comportamento interativo do site.

   Escrito em JavaScript puro (vanilla), sem bibliotecas. Funciona
   abrindo o index.html com duplo clique (protocolo file://), por isso
   NÃO usa "import/export" (módulos ES), que são bloqueados nesse modo.

   Organização: cada parte do site é um "módulo" — uma função initXxx()
   que encontra seus elementos no HTML (pelos atributos data-*) e liga
   os eventos. Todas são chamadas na seção 18 (INICIALIZAÇÃO).

   ÍNDICE
   01. CONTATOS E CONFIGURAÇÕES GERAIS (WhatsApp, e-mail, tempos etc.)
   02. UTILITÁRIOS (atalhos, matemática, rafThrottle/debounce, foco, cores, telefone)
   03. CONTROLE DE ROLAGEM (travar/liberar e rolagem até um elemento)
   04. ABERTURA FUTURISTA (intro: partículas, R, nome, digitação, saída)
   05. CURSOR PERSONALIZADO
   06. EFEITOS DE ROLAGEM (header, barra de progresso, voltar ao topo)
   07. MENU MOBILE (hambúrguer, trap de foco, tecla Esc)
   08. ROLAGEM SUAVE PARA ÂNCORAS
   09. SCROLL SPY (destaque do link da seção visível)
   10. HERO: PARTÍCULAS INTERATIVAS E PARALLAX
   11. ANIMAÇÕES DE REVELAÇÃO AO ROLAR
   12. CARDS: SPOTLIGHT, TILT 3D E BOTÕES MAGNÉTICOS
   13. LINHA DO TEMPO DO PROCESSO
   14. FAQ (ACORDEÃO)
   15. LINKS DE CONTATO (WhatsApp, telefone e e-mail a partir de CONTATO)
   16. FORMULÁRIO DE CONTATO (validação, máscara, mensagem padrão e envio simulado)
   17. LINKS PROVISÓRIOS, AVISO (TOAST) E ANO DO RODAPÉ
   18. INICIALIZAÇÃO
   ===================================================================== */

/* IIFE (função que se executa sozinha): cria um "escopo privado".
   Assim nenhuma variável deste arquivo vaza para o escopo global e não
   há conflito com outros scripts. 'use strict' ativa um modo mais
   rigoroso do JavaScript, que acusa erros comuns. */
(function () {
  'use strict';

  /* ===================================================================
     01. CONTATOS E CONFIGURAÇÕES GERAIS
     =================================================================== */

  /* CONTATO — ÚNICO lugar para alterar os dados de contato do site.
     O módulo 15 usa estes valores para montar TODOS os links:
     - botões e links de WhatsApp → https://wa.me/NUMERO?text=MENSAGEM
     - telefone exibido           → tel:+NUMERO (liga direto no celular)
     - e-mail exibido             → mailto: com assunto e mensagem prontos
     - campo "Mensagem" do formulário já vem com a mensagem padrão.
     Também reescreve o texto exibido do telefone e do e-mail no HTML. */
  const CONTATO = {
    // WhatsApp/telefone: só números, com código do país (55) + DDD + número.
    // O site exibe automaticamente no formato (27) 99297-3770.
    whatsapp: '5527992973770',
    // E-mail de atendimento
    email: 'revolutionpartners26@gmail.com',
    // Mensagem que já vem escrita no WhatsApp, no e-mail e no formulário
    mensagemPadrao: 'Olá, gostaria de fazer um orçamento.',
    // Assunto usado no link de e-mail (mailto)
    assuntoEmail: 'Orçamento'
  };

  /* CONFIG — reúne números importantes num lugar só. Ajuste aqui para
     mudar tempos, quantidades e comportamentos sem caçar pelo código.
     Tempos em milissegundos (1000 ms = 1 segundo). */
  const CONFIG = {
    intro: {
      enabled: true,              // false = desliga a abertura
      playOncePerSession: false,  // true = abertura só na 1ª visita da aba (sessionStorage)
      // Momento (ms desde o início) em que cada etapa começa:
      timeline: {
        drawR: 600,       // o "R" começa a ser desenhado
        lightR: 1700,     // o "R" acende em neon (+ explosão de partículas)
        revealName: 1950, // "-EVOLUTION" nasce de dentro do R
        partners: 2750,   // "PARTNERS" aparece
        tagline: 3000     // começa a digitação da frase
      },
      typeSpeed: 15,        // ms por caractere digitado (81 caracteres ≈ 1,2 s)
      letterStagger: 45,    // atraso entre as letras de "-EVOLUTION" acenderem
      exitAt: 4550,         // quando a saída começa (barra chega a 100%)
      revealDelay: 350,     // atraso para o hero começar a entrar durante a saída
      exitDuration: 1050,   // duração da saída (precisa casar com o CSS: 0,3 s + 0,75 s)
      reducedDuration: 1200,// duração da versão com movimento reduzido
      fontTimeout: 1200,    // espera máxima pelas fontes antes de começar
      maxWait: 8000,        // espera máxima pelo carregamento completo da página
      failsafe: 10000,      // segurança: força a saída se algo travar
      particles: { desktop: 160, mobile: 70 } // quantidade de partículas da abertura
    },
    hero: {
      particlesDesktop: 90,  // partículas do fundo do hero no desktop
      particlesMobile: 38,   // no celular (menos = mais leve)
      speed: 0.32,           // velocidade máxima de deriva das partículas
      linkDistance: 130,     // distância (px) para desenhar linha entre partículas
      mouseRadius: 150,      // raio (px) em que o mouse empurra as partículas
      repelForce: 2.2,       // força do empurrão do mouse
      parallax: 18           // deslocamento máximo (px) das órbitas com o mouse
    },
    header: { scrolledAt: 40 },      // px rolados para o header ganhar fundo
    backToTop: { showAfter: 600 },   // px rolados para o botão "topo" aparecer
    // threshold 0 + margem inferior de -10%: o elemento anima assim que o
    // topo dele passa de 90% da altura da tela (funciona até para blocos
    // muito altos, como a linha do tempo no celular)
    reveal: { threshold: 0, rootMargin: '0px 0px -10% 0px' },
    tilt: { max: 7 },                // inclinação máxima (graus) dos cards
    magnetic: { strength: 0.25, max: 10 }, // força e limite (px) do botão magnético
    // simulatedDelay = "tempo de envio" simulado; messageMin = mínimo de caracteres da mensagem
    form: { simulatedDelay: 1600, messageMin: 20 },
    toastDuration: 3600,
    breakpoints: { mobile: 768, desktop: 1024 } // iguais aos do CSS (48em e 64em)
  };


  /* ===================================================================
     02. UTILITÁRIOS
     Funções pequenas e reutilizáveis usadas por vários módulos.
     =================================================================== */

  /* $ e $$ — atalhos para buscar elementos.
     Recebem: seletor CSS e (opcional) o elemento onde procurar.
     Retornam: $ → o primeiro elemento (ou null); $$ → um Array com todos. */
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  /* clamp — limita um valor entre um mínimo e um máximo.
     Ex.: clamp(150, 0, 100) → 100. */
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  /* lerp — interpolação linear: anda uma fração "t" do caminho de a até b.
     Usado para movimentos suaves (o anel do cursor "persegue" o mouse). */
  const lerp = (a, b, t) => a + (b - a) * t;

  /* Curvas de animação (easing). Recebem t de 0 a 1 e devolvem o
     progresso "curvado": começam/terminam devagar para parecer natural. */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* Preferências do usuário/dispositivo (media queries lidas pelo JS):
     - movimento reduzido (acessibilidade);
     - mouse de verdade (hover + ponteiro preciso) → desktop. */
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const prefersReducedMotion = () => motionQuery.matches;
  const hasFinePointer = () => finePointerQuery.matches;
  const isSmallScreen = () => window.innerWidth < CONFIG.breakpoints.mobile;

  /* debounce — espera o evento "parar" por "wait" ms antes de rodar "fn".
     Ideal para resize: só recalcula quando o usuário termina de redimensionar. */
  function debounce(fn, wait) {
    let timer = 0;
    return function (...args) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /* rafThrottle — o "throttle" do site: limita "fn" a uma execução por
     quadro de tela (requestAnimationFrame, ~60 vezes por segundo), sempre
     com os argumentos mais recentes. Usado em scroll e mousemove, que
     disparam centenas de vezes por segundo. */
  function rafThrottle(fn) {
    let frame = 0;
    let lastArgs = [];
    return function (...args) {
      lastArgs = args;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        fn.apply(this, lastArgs);
      });
    };
  }

  /* getCssVar — lê o valor de uma variável CSS do :root.
     Permite que o canvas use as MESMAS cores definidas no style.css. */
  function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /* toRgb — converte uma cor "#00e5ff", "#0ef" ou "rgb(0, 229, 255)" em
     {r, g, b}. O canvas precisa disso para montar cores com transparência.
     Recebe: a cor (texto) e uma cor reserva [r, g, b] se não conseguir ler. */
  function toRgb(color, fallback) {
    const value = (color || '').trim();
    let match = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (match) {
      let hex = match[1];
      if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
      const n = parseInt(hex, 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    match = value.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
    if (match) return { r: +match[1], g: +match[2], b: +match[3] };
    return { r: fallback[0], g: fallback[1], b: fallback[2] };
  }

  /* rgba — monta o texto de cor do canvas a partir de {r,g,b} e opacidade. */
  const rgba = (c, alpha) => `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;

  /* storage — leitura/gravação no sessionStorage protegida por try/catch
     (em modo privado ou com cookies bloqueados o acesso pode falhar). */
  const storage = {
    get(key) {
      try { return window.sessionStorage.getItem(key); } catch (error) { return null; }
    },
    set(key, value) {
      try { window.sessionStorage.setItem(key, value); } catch (error) { /* sem armazenamento: tudo bem */ }
    }
  };

  /* getFocusable — lista os elementos focáveis VISÍVEIS dentro de um
     container (links, botões, campos...). Usado pelo trap de foco. */
  function getFocusable(container) {
    const selector = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return $$(selector, container).filter((el) =>
      el.getClientRects().length > 0 &&
      getComputedStyle(el).visibility !== 'hidden' &&
      !el.closest('[inert], [hidden]')
    );
  }

  /* createFocusTrap — "prende" o foco do teclado dentro de um container
     (usado pelo menu mobile): ao apertar Tab no último item, volta ao primeiro, e
     Shift+Tab no primeiro vai ao último. Retorna { activate, deactivate }.
     activate(elemento) → liga o trap e foca o elemento indicado. */
  function createFocusTrap(container) {
    let active = false;

    function onKeydown(event) {
      if (!active || event.key !== 'Tab') return;
      const items = getFocusable(container);
      if (!items.length) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !container.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !container.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    }

    return {
      activate(initialFocus) {
        active = true;
        document.addEventListener('keydown', onKeydown);
        const target = initialFocus || getFocusable(container)[0];
        if (target) target.focus({ preventScroll: true });
      },
      deactivate() {
        active = false;
        document.removeEventListener('keydown', onKeydown);
      }
    };
  }

  /* onIntroEnd — executa "callback" quando a abertura terminar. Se ela já
     terminou (ou nem existe), executa na hora. Evita depender da ordem em
     que os módulos são iniciados. */
  function onIntroEnd(callback) {
    if (document.documentElement.classList.contains('is-loaded')) {
      callback();
    } else {
      document.addEventListener('intro:end', callback, { once: true });
    }
  }

  /* "Barramento" de rolagem: módulos que precisam reagir ao scroll se
     inscrevem aqui (onScrollFrame) e o módulo 06 chama todos de uma vez,
     no máximo uma vez por quadro. Um único listener de scroll = melhor
     desempenho do que vários espalhados. */
  const scrollSubscribers = new Set();
  const onScrollFrame = (fn) => scrollSubscribers.add(fn);

  /* onlyDigits — remove tudo que não é número. Ex.: "(27) 9929-..." → "279929..." */
  const onlyDigits = (value) => String(value).replace(/\D/g, '');

  /* formatPhoneBR — formata dígitos de telefone brasileiro (máx. 11):
     até 10 dígitos → fixo    (27) 3123-4567
     11 dígitos     → celular (27) 99297-3770
     Também formata números incompletos (usado pela máscara do formulário
     enquanto a pessoa digita). Recebe só dígitos; retorna o texto formatado. */
  function formatPhoneBR(digits) {
    const d = String(digits).slice(0, 11);
    if (!d.length) return '';
    if (d.length <= 2) return `(${d}`;
    const ddd = d.slice(0, 2);
    const rest = d.slice(2);
    if (d.length <= 6) return `(${ddd}) ${rest}`;
    if (d.length <= 10) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  }

  /* toNationalDigits — tira o código do país (55) de um número completo,
     deixando só DDD + número. Ex.: "5527992973770" → "27992973770". */
  function toNationalDigits(fullNumber) {
    const digits = onlyDigits(fullNumber);
    return digits.length > 11 && digits.startsWith('55') ? digits.slice(2) : digits;
  }


  /* ===================================================================
     03. CONTROLE DE ROLAGEM
     =================================================================== */

  /* scrollLock — trava/destrava a rolagem da página (usado pelo menu
     mobile). Usa um contador: se dois componentes travarem ao mesmo tempo
     (ex.: um modal adicionado no futuro), a rolagem só volta quando os
     DOIS liberarem. */
  const scrollLock = {
    count: 0,
    lock() {
      this.count += 1;
      document.documentElement.classList.add('is-scroll-locked');
    },
    unlock() {
      this.count = Math.max(0, this.count - 1);
      if (this.count === 0) document.documentElement.classList.remove('is-scroll-locked');
    }
  };

  /* getHeaderOffset — altura do header compacto (lida da variável CSS
     --header-h-compact) + 16px de respiro. Retorna um número em px. */
  function getHeaderOffset() {
    const value = parseFloat(getCssVar('--header-h-compact'));
    return (Number.isFinite(value) ? value : 66) + 16;
  }

  /* scrollToElement — rola suavemente até "target", descontando a altura
     do header fixo (senão o título da seção ficaria escondido atrás dele).
     Depois move o foco para o destino (acessibilidade: leitores de tela e
     teclado continuam a partir dali). */
  function scrollToElement(target, { focus = true } = {}) {
    const isTop = target.id === 'inicio';
    const top = isTop ? 0 : target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });

    if (focus) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true }); // preventScroll: não "pula" de novo
    }
  }


  /* ===================================================================
     04. ABERTURA FUTURISTA (INTRO)
     O que faz: controla toda a sequência da abertura com UMA linha do
     tempo baseada em requestAnimationFrame (rAF). A cada quadro (~16 ms):
       1. calcula o tempo decorrido;
       2. dispara as etapas cujo horário chegou (adiciona classes no HTML,
          e o CSS faz as animações);
       3. desenha as partículas no canvas;
       4. atualiza a digitação da frase e a barra de carregamento.
     Usar um único relógio mantém tudo sincronizado.
     Quando é chamada: na inicialização (seção 18).
     =================================================================== */

  /* splitLetters — quebra o texto de um elemento em <span>, um por letra,
     para animar cada letra separadamente. Retorna o Array de spans. */
  function splitLetters(element) {
    const text = element.textContent.trim();
    element.textContent = '';
    const fragment = document.createDocumentFragment(); // monta tudo fora da tela (mais rápido)
    const letters = Array.from(text).map((char) => {
      const span = document.createElement('span');
      span.className = 'intro__letter';
      span.textContent = char;
      fragment.append(span);
      return span;
    });
    element.append(fragment);
    return letters;
  }

  /* waitForFonts — espera as fontes da marca carregarem (para medir as
     letras com a fonte certa), mas no máximo "timeout" ms.
     Promise.race → vence quem terminar primeiro: fontes ou tempo limite. */
  function waitForFonts(timeout) {
    const limit = new Promise((resolve) => window.setTimeout(resolve, timeout));
    if (!document.fonts || !document.fonts.load) return limit;
    const fonts = Promise.all([
      document.fonts.load('700 1em Orbitron'),
      document.fonts.load('500 1em Sora')
    ]).catch(() => null);
    return Promise.race([fonts, limit]);
  }

  /* createIntroParticles — cria o sistema de partículas da abertura.
     Recebe: o <canvas>. Retorna: { render, burst, setTarget, destroy }.

     COMO FUNCIONA:
     - Fase "converge": cada partícula nasce num ponto aleatório ao redor
       da tela (coordenadas polares: ângulo + raio) e viaja em espiral até
       o centro do "R". O raio diminui com uma curva easeInOut e o ângulo
       gira um pouco ("swirl"), formando o redemoinho.
     - Fase "dust" (após burst): quando o R acende, as partículas explodem
       para fora com velocidade aleatória, desaceleram (atrito) e somem.
     - RASTRO: em vez de apagar o quadro inteiro, apagamos só 28% dele
       (globalCompositeOperation = 'destination-out'), então o desenho
       anterior fica como um rastro que vai sumindo. Depois desenhamos
       com 'lighter' (cores se SOMAM), o que gera o brilho de luz. */
  function createIntroParticles(canvas) {
    if (!canvas || !canvas.getContext) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const cfg = CONFIG.intro;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // telas retina, limitado a 2x por desempenho
    const colorR = toRgb(getCssVar('--color-brand-r'), [0, 229, 255]);
    const colorB = toRgb(getCssVar('--color-blue-400'), [79, 140, 255]);
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let width = 0;
    let height = 0;
    let particles = [];
    let ring = null;     // onda de choque (círculo que se expande)
    let lastElapsed = 0;

    /* Ajusta o tamanho real (em pixels físicos) do canvas à tela */
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // desenha em "px CSS" mesmo em telas retina
    }

    /* Cria as partículas com valores aleatórios */
    function create() {
      const count = isSmallScreen() ? cfg.particles.mobile : cfg.particles.desktop;
      const maxRadius = Math.hypot(width, height) * 0.6; // começam fora/na borda da tela
      particles = Array.from({ length: count }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: maxRadius * (0.45 + Math.random() * 0.55),
        swirl: (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.9), // sentido e força do giro
        delay: Math.random() * 400,               // saída escalonada
        duration: 1000 + Math.random() * 500,     // tempo da viagem até o centro
        size: 0.6 + Math.random() * 1.6,          // espessura do traço
        color: Math.random() < 0.35 ? colorR : colorB,
        mode: 'converge',
        x: 0, y: 0, px: null, py: null, vx: 0, vy: 0, alpha: 1
      }));
    }

    /* render — desenha um quadro. Recebe o tempo decorrido da abertura. */
    function render(elapsed) {
      lastElapsed = elapsed;

      // 1) "Apaga" 28% do quadro anterior → rastro luminoso
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      // 2) Atualiza e desenha cada partícula
      let arrived = 0;
      for (const p of particles) {
        if (p.mode === 'converge') {
          const t = clamp((elapsed - p.delay) / p.duration, 0, 1);
          const e = easeInOutCubic(t);
          const radius = p.radius * (1 - e);   // raio encolhe até 0 (centro)
          const angle = p.angle + p.swirl * e; // gira enquanto se aproxima
          p.x = target.x + Math.cos(angle) * radius;
          p.y = target.y + Math.sin(angle) * radius;
          p.alpha = t >= 1 ? 0 : 0.25 + 0.75 * e; // fica mais forte perto; some ao chegar
          if (t >= 1) arrived += 1;
        } else {
          // Poeira: anda, perde velocidade (atrito 1,5% por quadro) e esmaece
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.alpha *= 0.982;
        }

        // Traço da posição anterior até a atual (parece um risco de luz)
        if (p.px !== null && p.alpha > 0.01) {
          ctx.strokeStyle = rgba(p.color, p.alpha);
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        p.px = p.x;
        p.py = p.y;
      }

      // 3) Núcleo de luz que cresce conforme as partículas chegam ao centro
      if (!ring && arrived > 0) {
        const ratio = arrived / particles.length;
        const glow = ctx.createRadialGradient(target.x, target.y, 0, target.x, target.y, 30 + ratio * 70);
        glow.addColorStop(0, rgba(colorR, 0.12 * ratio));
        glow.addColorStop(1, rgba(colorR, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(target.x - 110, target.y - 110, 220, 220);
      }

      // 4) Onda de choque quando o R acende (círculo que cresce e some)
      if (ring) {
        const t = (elapsed - ring.start) / 900;
        if (t >= 1) {
          ring = null;
        } else {
          ctx.strokeStyle = rgba(colorR, (1 - t) * 0.7);
          ctx.lineWidth = 0.5 + 2 * (1 - t);
          ctx.beginPath();
          ctx.arc(target.x, target.y, easeOutCubic(t) * ring.max, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    /* burst — explode as partículas para fora (chamado quando o R acende) */
    function burst() {
      ring = { start: lastElapsed, max: Math.max(width, height) * 0.75 };
      for (const p of particles) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        p.mode = 'dust';
        p.x = target.x + (Math.random() - 0.5) * 24;
        p.y = target.y + (Math.random() - 0.5) * 24;
        p.px = p.x;
        p.py = p.y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.alpha = 0.9;
      }
    }

    /* setTarget — define o ponto de convergência (centro do R) */
    function setTarget(x, y) {
      target.x = x;
      target.y = y;
    }

    /* destroy — limpa o canvas e remove o listener de resize */
    function destroy() {
      window.removeEventListener('resize', onResize);
      ctx.clearRect(0, 0, width, height);
      particles = [];
    }

    const onResize = debounce(resize, 150);
    window.addEventListener('resize', onResize);
    resize();
    create();

    return { render, burst, setTarget, destroy };
  }

  /* initIntro — monta e executa a abertura completa. */
  function initIntro() {
    const root = document.documentElement;
    const intro = $('[data-intro]');
    const inertTargets = $$('[data-intro-inert]');
    const STORAGE_KEY = 'rev-intro-vista';

    /* revealSite — "libera" o site: adiciona .is-loaded (o CSS anima a
       entrada do header e do hero) e avisa os outros módulos (evento). */
    const revealSite = () => {
      if (root.classList.contains('is-loaded')) return;
      root.classList.add('is-loaded');
      document.dispatchEvent(new CustomEvent('intro:end'));
    };

    // Casos em que a abertura NÃO roda: removida do HTML, desativada no
    // CONFIG ou já exibida nesta sessão (se playOncePerSession = true).
    const skipEntirely = !intro || !CONFIG.intro.enabled ||
      (CONFIG.intro.playOncePerSession && storage.get(STORAGE_KEY));
    if (skipEntirely) {
      if (intro) intro.remove();
      root.classList.remove('is-intro-active');
      revealSite();
      return;
    }

    // Referências às peças da abertura (pelos atributos data-intro-*)
    const els = {
      canvas: $('[data-intro-canvas]', intro),
      name: $('[data-intro-name]', intro),
      r: $('[data-intro-r]', intro),
      rest: $('[data-intro-rest]', intro),
      ghost: $('[data-intro-ghost]', intro),
      typed: $('[data-intro-typed]', intro),
      bar: $('[data-intro-bar]', intro),
      percent: $('[data-intro-percent]', intro),
      status: $('[data-intro-status]', intro),
      skip: $('[data-intro-skip]', intro)
    };

    const reduced = prefersReducedMotion();
    const T = CONFIG.intro.timeline;
    // A frase vem do próprio HTML (cópia "ghost") → uma única fonte do texto
    const fullText = els.ghost.textContent.replace(/\s+/g, ' ').trim();
    const letters = splitLetters(els.rest);
    const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/[]{}#*+=';

    let rafId = 0;
    let startTime = 0;
    let exiting = false;
    let finished = false;
    let typing = false;
    let typingDone = false;
    let lastPercent = -1;
    let pageLoaded = document.readyState === 'complete';
    if (!pageLoaded) window.addEventListener('load', () => { pageLoaded = true; }, { once: true });

    // ---- Preparação: topo da página, rolagem travada, resto do site inerte ----
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; // o navegador não restaura a posição antiga
    window.scrollTo(0, 0);
    root.classList.add('is-intro-active');
    // inert: o conteúdo atrás da abertura não recebe foco nem cliques
    inertTargets.forEach((el) => el.setAttribute('inert', ''));

    const particles = reduced ? null : createIntroParticles(els.canvas);

    /* setStatus — troca o texto técnico acima da barra ("INICIALIZANDO"...) */
    const setStatus = (text) => { if (els.status) els.status.textContent = text; };

    /* setProgress — atualiza barra (scaleX) e porcentagem. Recebe 0 a 1. */
    function setProgress(progress) {
      els.bar.style.transform = `scaleX(${progress.toFixed(4)})`;
      const percent = Math.round(progress * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        els.percent.textContent = `${percent}%`;
        if (percent >= 100) setStatus('PRONTO');
      }
    }

    /* stackLettersOnR — calcula o ponto de partida do R e de cada letra.
       Ideia: o nome final está centralizado. Medimos (getBoundingClientRect)
       o centro da linha e o centro de cada peça; a diferença vira a
       variável --from-x. Assim, no início, o R e TODAS as letras ficam
       empilhados no centro da tela (as letras invisíveis, atrás do R).
       Quando .is-revealing é adicionada, todos voltam juntos para o
       lugar: o R desliza para a esquerda e as letras se "desenrolam" para
       a direita, como se saíssem de dentro dele. */
    function stackLettersOnR() {
      const nameRect = els.name.getBoundingClientRect();
      const centerX = nameRect.left + nameRect.width / 2;
      const rRect = els.r.getBoundingClientRect();
      const rCenterX = rRect.left + rRect.width / 2;

      els.r.style.setProperty('--from-x', `${(centerX - rCenterX).toFixed(2)}px`);
      letters.forEach((letter, index) => {
        const rect = letter.getBoundingClientRect();
        letter.style.setProperty('--from-x', `${(centerX - (rect.left + rect.width / 2)).toFixed(2)}px`);
        letter.style.setProperty('--delay', `${index * CONFIG.intro.letterStagger}ms`);
      });

      // As partículas convergem para onde o R estará: centro da linha do nome
      if (particles) particles.setTarget(centerX, rRect.top + rRect.height / 2);
    }

    /* renderTyping — efeito de digitação com "decodificação": o trecho já
       digitado aparece correto e os 2 próximos caracteres mostram símbolos
       aleatórios que mudam a cada quadro (glitch sutil).
       Recebe: ms desde o início da digitação. */
    function renderTyping(time) {
      const count = clamp(Math.floor(time / CONFIG.intro.typeSpeed), 0, fullText.length);
      if (count >= fullText.length) {
        els.typed.textContent = fullText;
        typingDone = true;
        intro.classList.add('is-typed'); // dispara o glitch final no CSS
        return;
      }
      let output = fullText.slice(0, count);
      for (let k = 0; k < 2 && count + k < fullText.length; k += 1) {
        const char = fullText[count + k];
        output += char === ' ' ? ' ' : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
      }
      els.typed.textContent = output;
    }

    /* Etapas da linha do tempo. "done" evita que uma etapa rode 2 vezes. */
    const steps = [
      { at: 0, run: () => intro.classList.add('is-playing') },
      { at: T.drawR, run: () => { intro.classList.add('is-drawing'); setStatus('CONSTRUINDO A MARCA'); } },
      { at: T.lightR, run: () => { intro.classList.add('is-lit'); if (particles) particles.burst(); } },
      { at: T.revealName, run: () => intro.classList.add('is-revealing') },
      { at: T.partners, run: () => intro.classList.add('is-partners') },
      { at: T.tagline, run: () => { intro.classList.add('is-typing'); typing = true; setStatus('CARREGANDO'); } }
    ];

    /* frame — o "coração" da abertura: roda a cada quadro de tela. */
    function frame(now) {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;

      steps.forEach((step) => {
        if (!step.done && elapsed >= step.at) {
          step.done = true;
          step.run();
        }
      });

      if (particles) particles.render(elapsed);
      if (typing && !typingDone) renderTyping(elapsed - T.tagline);

      // Barra de carregamento: curva easeOut (rápida no início, lenta no fim).
      // Se a página ainda não terminou de carregar, segura em 94%.
      let progress = clamp(elapsed / CONFIG.intro.exitAt, 0, 1);
      progress = 1 - Math.pow(1 - progress, 2.2);
      if (!pageLoaded) progress = Math.min(progress, 0.94);
      setProgress(progress);

      // Hora de sair? (tempo cumprido E página carregada — ou espera máxima)
      if (elapsed >= CONFIG.intro.exitAt && (pageLoaded || elapsed >= CONFIG.intro.maxWait)) {
        startExit();
        return;
      }
      rafId = window.requestAnimationFrame(frame);
    }

    /* startExit — inicia a saída: feixe de luz + cortinas abrindo (CSS).
       O site começa a entrar (revealSite) enquanto as cortinas se abrem. */
    function startExit() {
      if (exiting) return;
      exiting = true;
      window.cancelAnimationFrame(rafId);
      setProgress(1);
      intro.classList.add('is-exiting');
      window.setTimeout(revealSite, reduced ? 0 : CONFIG.intro.revealDelay);
      window.setTimeout(finish, reduced ? 500 : CONFIG.intro.exitDuration);
    }

    /* finish — remove a abertura do HTML e devolve a página ao usuário. */
    function finish() {
      if (finished) return;
      finished = true;
      if (particles) particles.destroy();
      const focusWasInside = intro.contains(document.activeElement);

      intro.remove(); // tira do DOM: libera memória e o canvas
      root.classList.remove('is-intro-active');
      inertTargets.forEach((el) => el.removeAttribute('inert'));
      document.removeEventListener('keydown', onKeydown);
      storage.set(STORAGE_KEY, '1');

      // Se o foco estava no botão "Pular", leva-o para o início do conteúdo
      if (focusWasInside) {
        const hero = $('#inicio');
        if (hero) hero.focus({ preventScroll: true });
      }

      // Se a URL tinha uma âncora (ex.: index.html#contato), vai até ela
      if (location.hash.length > 1) {
        let target = null;
        try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (error) { target = null; }
        if (target) scrollToElement(target);
      }
    }

    /* skip — botão "Pular intro" ou tecla Esc: mostra o estado final e sai */
    function skip() {
      if (exiting) return;
      intro.classList.add('is-playing', 'is-drawing', 'is-lit', 'is-revealing', 'is-partners', 'is-typing', 'is-typed');
      els.typed.textContent = fullText;
      typingDone = true;
      startExit();
    }

    function onKeydown(event) {
      if (event.key === 'Escape') skip();
    }

    els.skip.addEventListener('click', skip);
    document.addEventListener('keydown', onKeydown);

    // Segurança: se algo der errado, a abertura sai sozinha
    window.setTimeout(() => { if (!exiting) startExit(); }, CONFIG.intro.failsafe);

    // ---- Início: espera as fontes, mede as letras e liga o relógio ----
    waitForFonts(CONFIG.intro.fontTimeout).then(() => {
      if (exiting) return; // o usuário já pulou

      if (reduced) {
        // Movimento reduzido: tudo aparece pronto, sem partículas nem digitação
        intro.classList.add('is-reduced', 'is-playing', 'is-drawing', 'is-lit', 'is-revealing', 'is-partners', 'is-typed');
        els.typed.textContent = fullText;
        setProgress(1);
        window.setTimeout(startExit, CONFIG.intro.reducedDuration);
        return;
      }

      stackLettersOnR();
      rafId = window.requestAnimationFrame(frame);
    });
  }


  /* ===================================================================
     05. CURSOR PERSONALIZADO
     O que faz: o ponto segue o mouse instantaneamente e o anel segue com
     atraso suave (interpolação "lerp" a cada quadro). O anel cresce sobre
     links/botões, encolhe no clique e some sobre campos de texto.
     Só ativa em computadores com mouse e sem "movimento reduzido".
     =================================================================== */
  function initCursor() {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const cursor = $('[data-cursor]');
    const dot = $('[data-cursor-dot]');
    const ring = $('[data-cursor-ring]');
    if (!cursor || !dot || !ring) return;

    document.documentElement.classList.add('has-custom-cursor');

    const INTERACTIVE = 'a, button, label, select, summary, [role="button"], [data-cursor="hover"]';
    const TEXT_FIELDS = 'input:not([type="checkbox"]):not([type="radio"]), textarea';
    const mouse = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    const SMOOTHING = 0.2; // 0 a 1: quanto maior, mais rápido o anel alcança o mouse
    let rafId = 0;
    let visible = false;

    /* loop — move o anel 20% da distância até o mouse a cada quadro.
       Para sozinho quando o anel "chega" (economiza processamento). */
    function loop() {
      ringPos.x = lerp(ringPos.x, mouse.x, SMOOTHING);
      ringPos.y = lerp(ringPos.y, mouse.y, SMOOTHING);
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      const distance = Math.abs(ringPos.x - mouse.x) + Math.abs(ringPos.y - mouse.y);
      rafId = distance > 0.1 ? window.requestAnimationFrame(loop) : 0;
    }

    // mousemove (pointermove): atualiza a posição alvo
    window.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      if (!visible) {
        // 1º movimento: o anel "teleporta" para o mouse (sem vir do canto)
        visible = true;
        ringPos.x = mouse.x;
        ringPos.y = mouse.y;
        cursor.classList.remove('is-hidden');
      }
      if (!rafId) rafId = window.requestAnimationFrame(loop);
    }, { passive: true });

    // pointerover (delegação): detecta sobre o que o mouse está
    document.addEventListener('pointerover', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      cursor.classList.toggle('is-hover', Boolean(target.closest(INTERACTIVE)));
      cursor.classList.toggle('is-text', Boolean(target.closest(TEXT_FIELDS)));
    });

    // Clique: anel encolhe enquanto o botão está pressionado
    document.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    document.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

    // Mouse saiu da janela: esconde; voltou: mostra
    document.addEventListener('mouseout', (event) => {
      if (!event.relatedTarget) {
        cursor.classList.add('is-hidden');
        visible = false;
      }
    });
  }


  /* ===================================================================
     06. EFEITOS DE ROLAGEM (header, barra de progresso, voltar ao topo)
     O que faz: um ÚNICO listener de scroll (limitado a 1x por quadro)
     que atualiza o header, a barra de leitura, o botão de topo e avisa
     os módulos inscritos no barramento de rolagem.
     =================================================================== */
  function initScrollEffects() {
    const header = $('[data-header]');
    const bar = $('[data-scroll-progress]');
    const toTop = $('[data-back-to-top]');

    function update() {
      const y = window.scrollY || window.pageYOffset;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? clamp(y / max, 0, 1) : 0; // 0 = topo, 1 = fim

      if (header) header.classList.toggle('is-scrolled', y > CONFIG.header.scrolledAt);
      if (bar) bar.style.transform = `scaleX(${progress.toFixed(4)})`;
      if (toTop) {
        toTop.classList.toggle('is-visible', y > CONFIG.backToTop.showAfter);
        toTop.style.setProperty('--progress', progress.toFixed(4)); // anel de progresso (CSS)
      }
      scrollSubscribers.forEach((fn) => fn(y));
    }

    // scroll: dispara MUITAS vezes por segundo → rafThrottle limita a 1x por quadro.
    // passive: true avisa que não vamos cancelar a rolagem (deixa o scroll mais fluido).
    window.addEventListener('scroll', rafThrottle(update), { passive: true });
    // resize: recalcula quando o tamanho da janela muda (com debounce)
    window.addEventListener('resize', debounce(update, 150));
    update();
  }


  /* ===================================================================
     07. MENU MOBILE
     O que faz: abre/fecha o menu em tela cheia. Enquanto aberto:
     - trava a rolagem da página;
     - prende o foco do teclado dentro do header (logo, botão e links);
     - fecha com Esc, ao clicar num link ou ao aumentar a tela p/ desktop.
     =================================================================== */
  function initMobileMenu() {
    const header = $('[data-header]');
    const toggle = $('[data-menu-toggle]');
    const menu = $('[data-mobile-menu]');
    if (!header || !toggle || !menu) return;

    const trap = createFocusTrap(header);
    let isOpen = false;

    /* setOpen — abre (true) ou fecha (false) o menu.
       returnFocus: ao fechar com Esc, devolve o foco ao botão hambúrguer. */
    function setOpen(open, { returnFocus = false } = {}) {
      if (open === isOpen) return;
      isOpen = open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      menu.classList.toggle('is-open', open);
      header.classList.toggle('is-menu-open', open);

      if (open) {
        scrollLock.lock();
        trap.activate($('a', menu)); // foco no primeiro link do menu
      } else {
        scrollLock.unlock();
        trap.deactivate();
        if (returnFocus) toggle.focus();
      }
    }

    // click no hambúrguer: alterna
    toggle.addEventListener('click', () => setOpen(!isOpen));

    // click num link do menu (delegação): fecha. A rolagem até a seção é
    // feita pelo módulo 08 (o evento continua "subindo" até o document).
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    // tecla Esc: fecha e devolve o foco ao botão
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen) setOpen(false, { returnFocus: true });
    });

    // resize: se a tela virar desktop com o menu aberto, fecha
    window.addEventListener('resize', debounce(() => {
      if (isOpen && window.innerWidth >= CONFIG.breakpoints.desktop) setOpen(false);
    }, 150));
  }


  /* ===================================================================
     08. ROLAGEM SUAVE PARA ÂNCORAS
     O que faz: intercepta cliques em links "#secao" (delegação de evento:
     UM listener no document atende todos os links) e rola suavemente,
     compensando a altura do header fixo.
     =================================================================== */
  function initSmoothScroll() {
    document.addEventListener('click', (event) => {
      // Respeita cliques especiais (Ctrl/⌘ para nova aba etc.) e eventos já tratados
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const id = link.getAttribute('href').slice(1);
      if (!id) return; // href="#" = link provisório (tratado no módulo 17)
      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      scrollToElement(target);
      // Atualiza a URL (#secao) sem pular. try/catch: alguns navegadores
      // bloqueiam pushState quando o site é aberto via file://.
      try { history.pushState(null, '', `#${id}`); } catch (error) { /* ignora */ }
    });
  }


  /* ===================================================================
     09. SCROLL SPY
     O que faz: destaca no menu o link da seção que está no meio da tela.
     Como: um IntersectionObserver com rootMargin '-45% 0px -50% 0px' cria
     uma "faixa" fina no centro da janela; a seção que cruza essa faixa é
     a ativa. Também move o indicador luminoso do menu desktop.
     =================================================================== */
  function initScrollSpy() {
    const links = $$('[data-nav-link]');
    const sections = $$('main section[id]');
    const indicator = $('[data-nav-indicator]');
    const desktopList = $('[data-nav-list]');
    if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

    let currentId = null;

    /* moveIndicator — posiciona a linha luminosa sob o link ativo
       (offsetLeft/offsetWidth = posição e largura do link dentro do <nav>) */
    function moveIndicator() {
      if (!indicator || !desktopList) return;
      const active = $('.nav__link.is-active', desktopList);
      if (!active) {
        indicator.classList.remove('is-visible');
        return;
      }
      indicator.style.setProperty('--x', `${active.offsetLeft}px`);
      indicator.style.setProperty('--w', `${active.offsetWidth}px`);
      indicator.classList.add('is-visible');
    }

    /* setActive — marca os links da seção "id" (desktop e mobile).
       aria-current informa aos leitores de tela qual é o item atual.
       Seções fora do menu (ex.: Diferenciais) deixam nenhum link ativo. */
    function setActive(id) {
      if (id === currentId) return;
      currentId = id;
      links.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      moveIndicator();
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach((section) => observer.observe(section));

    // As fontes podem mudar a largura dos links: reposiciona após carregar
    window.addEventListener('resize', debounce(moveIndicator, 150));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);
  }


  /* ===================================================================
     10. HERO: PARTÍCULAS INTERATIVAS E PARALLAX
     O que faz: desenha no canvas uma "rede" de partículas que flutuam e
     se conectam por linhas quando estão próximas. O mouse empurra as
     partículas e cria linhas ciano até o cursor.
     Desempenho:
     - só anima quando o hero está visível (IntersectionObserver) E a aba
       está ativa (visibilitychange) E a abertura terminou;
     - menos partículas no celular;
     - movimento reduzido → desenha um único quadro estático.
     =================================================================== */
  function initHeroParticles() {
    const hero = $('#inicio');
    const canvas = $('[data-hero-canvas]');
    if (!hero || !canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cfg = CONFIG.hero;
    const colorB = toRgb(getCssVar('--color-blue-400'), [79, 140, 255]);
    const colorR = toRgb(getCssVar('--color-brand-r'), [0, 229, 255]);
    const parallaxLayer = $('[data-hero-parallax]');
    const mouse = { x: 0, y: 0, active: false };
    const reduced = prefersReducedMotion();

    let width = 0;
    let height = 0;
    let lastWidth = 0;
    let particles = [];
    let rafId = 0;
    let running = false;
    let inView = true;
    let introDone = false;

    /* createParticles — quantidade proporcional à área da tela */
    function createParticles() {
      const base = width < CONFIG.breakpoints.mobile ? cfg.particlesMobile : cfg.particlesDesktop;
      const density = clamp((width * height) / (1440 * 900), 0.45, 1.25);
      const count = Math.round(base * density);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * cfg.speed * 2,
        vy: (Math.random() - 0.5) * cfg.speed * 2,
        r: 0.8 + Math.random() * 1.6,
        cyan: Math.random() < 0.18 // ~18% das partículas na cor do R
      }));
    }

    /* resize — ajusta o canvas ao tamanho do hero. Só recria as
       partículas se a LARGURA mudou bastante (no celular, a barra de
       endereço muda só a altura ao rolar, e recriar causaria "pulos"). */
    function resize() {
      const rect = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!particles.length || Math.abs(width - lastWidth) > 60) {
        createParticles();
        lastWidth = width;
      }
      if (!running) draw();
    }

    /* update — move as partículas (física simples) */
    function update() {
      for (const p of particles) {
        // Repulsão: perto do mouse, a partícula é empurrada para longe,
        // com força maior quanto mais perto (1 - distância/raio).
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < cfg.mouseRadius && dist > 0.1) {
            const force = (1 - dist / cfg.mouseRadius) * cfg.repelForce;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }
        p.x += p.vx;
        p.y += p.vy;
        // "Quica" nas bordas
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = clamp(p.x, 0, width);
        p.y = clamp(p.y, 0, height);
      }
    }

    /* draw — desenha linhas (conexões) e pontos */
    function draw() {
      ctx.clearRect(0, 0, width, height);
      const maxDist = cfg.linkDistance;
      const maxDist2 = maxDist * maxDist; // comparar distâncias ao quadrado evita Math.sqrt (mais rápido)
      ctx.lineWidth = 0.7;

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        // Compara cada par uma única vez (j começa em i + 1)
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxDist2) {
            // Quanto mais perto, mais forte a linha
            ctx.strokeStyle = rgba(colorB, (1 - Math.sqrt(d2) / maxDist) * 0.32);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        // Linhas ciano até o mouse
        if (mouse.active) {
          const dist = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (dist < cfg.mouseRadius * 1.25) {
            ctx.strokeStyle = rgba(colorR, (1 - dist / (cfg.mouseRadius * 1.25)) * 0.45);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.fillStyle = p.cyan ? rgba(colorR, 0.9) : rgba(colorB, 0.75);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      update();
      draw();
      rafId = window.requestAnimationFrame(loop);
    }

    /* refresh — liga ou desliga a animação conforme as condições */
    function refresh() {
      const shouldRun = !reduced && introDone && inView && !document.hidden;
      if (shouldRun && !running) {
        running = true;
        rafId = window.requestAnimationFrame(loop);
      } else if (!shouldRun && running) {
        running = false;
        window.cancelAnimationFrame(rafId);
      }
    }

    // IntersectionObserver: pausa quando o hero sai da tela
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        refresh();
      }).observe(hero);
    }

    // visibilitychange: pausa quando o usuário troca de aba
    document.addEventListener('visibilitychange', refresh);

    // Mouse sobre o hero: partículas reagem + parallax das órbitas
    if (hasFinePointer()) {
      hero.addEventListener('pointermove', rafThrottle((event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
        mouse.active = true;
        if (parallaxLayer && !reduced) {
          // Posição normalizada de -1 a 1 em relação ao centro do hero.
          // O sinal negativo faz as órbitas irem para o lado OPOSTO (profundidade).
          const nx = (mouse.x / rect.width) * 2 - 1;
          const ny = (mouse.y / rect.height) * 2 - 1;
          parallaxLayer.style.setProperty('--px', `${(-nx * cfg.parallax).toFixed(1)}px`);
          parallaxLayer.style.setProperty('--py', `${(-ny * cfg.parallax).toFixed(1)}px`);
        }
      }));
      hero.addEventListener('pointerleave', () => {
        mouse.active = false;
        if (parallaxLayer) {
          parallaxLayer.style.setProperty('--px', '0px');
          parallaxLayer.style.setProperty('--py', '0px');
        }
      });
    }

    window.addEventListener('resize', debounce(resize, 200));
    resize();

    onIntroEnd(() => {
      introDone = true;
      refresh();
    });
  }


  /* ===================================================================
     11. ANIMAÇÕES DE REVELAÇÃO AO ROLAR
     O que faz: elementos com data-reveal ficam invisíveis (CSS) até
     entrarem na tela; então recebem .is-revealed e animam.
     - data-reveal-delay="200" → atraso individual (ms);
     - data-reveal-stagger="90" no PAI → os filhos com data-reveal
       entram em cascata (0ms, 90ms, 180ms...).
     IntersectionObserver é nativo e eficiente: o navegador avisa quando o
     elemento cruza a área visível (sem calcular nada no scroll).
     =================================================================== */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;

    // Atraso em cascata para grupos
    $$('[data-reveal-stagger]').forEach((group) => {
      const step = parseInt(group.dataset.revealStagger, 10) || 100;
      $$('[data-reveal]', group).forEach((el, index) => {
        el.style.setProperty('--reveal-delay', `${index * step}ms`);
      });
    });

    // Atraso individual
    $$('[data-reveal-delay]').forEach((el) => {
      el.style.setProperty('--reveal-delay', `${parseInt(el.dataset.revealDelay, 10) || 0}ms`);
    });

    // Sem suporte ou com movimento reduzido: mostra tudo de uma vez
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target); // anima só uma vez
      });
    }, { threshold: CONFIG.reveal.threshold, rootMargin: CONFIG.reveal.rootMargin });

    items.forEach((el) => observer.observe(el));
  }


  /* ===================================================================
     12. CARDS: SPOTLIGHT, TILT 3D E BOTÕES MAGNÉTICOS
     Só em dispositivos com mouse (em touch não existe "hover").
     - Spotlight: grava a posição do mouse dentro do card nas variáveis
       CSS --mx/--my (o CSS desenha a luz nessa posição).
     - Tilt: converte a posição do mouse (0 a 1) em ângulos de rotação
       --rx/--ry de até ±CONFIG.tilt.max graus.
     - Magnético: o botão se desloca uma fração da distância até o mouse.
     =================================================================== */
  function initCardEffects() {
    if (!hasFinePointer()) return;
    const reduced = prefersReducedMotion();

    // ---- Spotlight ----
    $$('[data-spotlight]').forEach((card) => {
      card.addEventListener('pointermove', rafThrottle((event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${(event.clientX - rect.left).toFixed(1)}px`);
        card.style.setProperty('--my', `${(event.clientY - rect.top).toFixed(1)}px`);
      }));
    });

    if (reduced) return; // sem tilt e sem magnetismo com movimento reduzido

    // ---- Tilt 3D ----
    $$('[data-tilt]').forEach((card) => {
      const max = parseFloat(card.dataset.tiltMax) || CONFIG.tilt.max;
      let rect = null;

      // pointerenter: guarda o tamanho/posição do card UMA vez (medir a
      // cada movimento daria resultados "tortos", pois o card já está inclinado)
      card.addEventListener('pointerenter', () => {
        rect = card.getBoundingClientRect();
        card.classList.add('is-tilting');
      });

      card.addEventListener('pointermove', rafThrottle((event) => {
        if (!rect) return;
        const px = clamp((event.clientX - rect.left) / rect.width, 0, 1);  // 0 = esquerda, 1 = direita
        const py = clamp((event.clientY - rect.top) / rect.height, 0, 1);  // 0 = topo, 1 = base
        card.style.setProperty('--ry', `${((px - 0.5) * max * 2).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${((0.5 - py) * max * 2).toFixed(2)}deg`);
      }));

      // pointerleave: volta suavemente à posição reta
      card.addEventListener('pointerleave', () => {
        rect = null;
        card.classList.remove('is-tilting');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });

    // ---- Botões magnéticos ----
    const { strength, max } = CONFIG.magnetic;
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (event) => {
        const rect = el.getBoundingClientRect();
        const x = clamp((event.clientX - (rect.left + rect.width / 2)) * strength, -max, max);
        const y = clamp((event.clientY - (rect.top + rect.height / 2)) * strength, -max, max);
        el.style.setProperty('--magnet-x', `${x.toFixed(1)}px`);
        el.style.setProperty('--magnet-y', `${y.toFixed(1)}px`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--magnet-x', '0px');
        el.style.setProperty('--magnet-y', '0px');
      });
    });
  }


  /* ===================================================================
     13. LINHA DO TEMPO DO PROCESSO
     O que faz: preenche a linha de luz conforme a rolagem e acende cada
     etapa quando a luz passa por ela.
     Cálculo: existe uma "linha de leitura" imaginária a 60% da altura da
     janela. progresso = (linha de leitura − topo da timeline) / altura.
     Só calcula enquanto a seção está perto da tela (IntersectionObserver).
     =================================================================== */
  function initTimeline() {
    const timeline = $('[data-timeline]');
    if (!timeline) return;
    const progressEl = $('[data-timeline-progress]', timeline);
    const steps = $$('[data-timeline-step]', timeline);
    const dots = steps.map((step) => $('.timeline__dot', step));
    const READING_LINE = 0.6; // 60% da altura da janela (ajuste para acender antes/depois)
    let nearView = true;

    function update() {
      if (!nearView) return;
      const trigger = window.innerHeight * READING_LINE;

      // 1º LÊ todas as medidas, 2º ESCREVE as mudanças: evita que o
      // navegador recalcule o layout várias vezes (layout thrashing).
      const rect = timeline.getBoundingClientRect();
      const dotPositions = dots.map((dot) => {
        const r = dot.getBoundingClientRect();
        return r.top + r.height / 2;
      });

      const progress = clamp((trigger - rect.top) / rect.height, 0, 1);
      progressEl.style.transform = `scaleY(${progress.toFixed(4)})`;
      steps.forEach((step, index) => {
        step.classList.toggle('is-active', dotPositions[index] <= trigger);
      });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        nearView = entry.isIntersecting;
        if (nearView) update();
      }, { rootMargin: '25% 0px 25% 0px' }).observe(timeline);
    }

    onScrollFrame(update);
    window.addEventListener('resize', debounce(update, 150));
    update();
  }


  /* ===================================================================
     14. FAQ (ACORDEÃO)
     O que faz: abre/fecha respostas (classe .is-open + aria-expanded).
     Com data-accordion-single, abrir uma pergunta fecha as outras.
     Teclado (padrão WAI-ARIA): ↑/↓ alternam entre perguntas, Home/End vão
     para a primeira/última.
     =================================================================== */
  function initAccordion() {
    $$('[data-accordion]').forEach((accordion) => {
      const single = accordion.hasAttribute('data-accordion-single');
      const triggers = $$('.accordion__trigger', accordion);

      function setItem(item, open) {
        item.classList.toggle('is-open', open);
        $('.accordion__trigger', item).setAttribute('aria-expanded', String(open));
      }

      // click (delegação no acordeão inteiro)
      accordion.addEventListener('click', (event) => {
        const trigger = event.target.closest('.accordion__trigger');
        if (!trigger) return;
        const item = trigger.closest('.accordion__item');
        const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
        if (single && willOpen) {
          $$('.accordion__item.is-open', accordion).forEach((other) => {
            if (other !== item) setItem(other, false);
          });
        }
        setItem(item, willOpen);
      });

      // keydown: navegação por setas entre as perguntas
      accordion.addEventListener('keydown', (event) => {
        const current = triggers.indexOf(document.activeElement);
        if (current === -1) return;
        let next = null;
        if (event.key === 'ArrowDown') next = (current + 1) % triggers.length;
        if (event.key === 'ArrowUp') next = (current - 1 + triggers.length) % triggers.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = triggers.length - 1;
        if (next !== null) {
          event.preventDefault();
          triggers[next].focus();
        }
      });
    });
  }


  /* ===================================================================
     15. LINKS DE CONTATO (WhatsApp, telefone e e-mail)
     O que faz: monta os links a partir da constante CONTATO (seção 01) e
     aplica em todos os elementos marcados no HTML:
     - data-contact-link="whatsapp" → https://wa.me/NUMERO?text=MENSAGEM
       (abre em nova aba, com target="_blank" e rel="noopener noreferrer");
     - data-contact-link="phone"    → tel:+NUMERO;
     - data-contact-link="email"    → mailto:EMAIL?subject=ASSUNTO&body=MENSAGEM;
     - data-contact-text="phone"/"email" → também troca o TEXTO exibido.
     encodeURIComponent converte acentos, espaços e vírgulas para o formato
     seguro de URL (ex.: "Olá, " vira "Ol%C3%A1%2C%20"). Sem isso, a mensagem
     chegaria cortada ou com caracteres estranhos no WhatsApp/e-mail.
     Quando é chamada: na inicialização (seção 18).
     =================================================================== */

  /* buildContactLinks — gera os três links. Retorna { whatsapp, phone, email }. */
  function buildContactLinks() {
    const number = onlyDigits(CONTATO.whatsapp);
    const message = encodeURIComponent(CONTATO.mensagemPadrao);
    const subject = encodeURIComponent(CONTATO.assuntoEmail);
    return {
      whatsapp: `https://wa.me/${number}?text=${message}`,
      phone: `tel:+${number}`,
      email: `mailto:${CONTATO.email}?subject=${subject}&body=${message}`
    };
  }

  function initContactLinks() {
    const links = buildContactLinks();
    // Textos exibidos: telefone formatado (27) 99297-3770 e o e-mail
    const texts = {
      phone: formatPhoneBR(toNationalDigits(CONTATO.whatsapp)),
      email: CONTATO.email
    };

    $$('[data-contact-link]').forEach((el) => {
      const type = el.dataset.contactLink;
      if (!links[type]) return;
      el.setAttribute('href', links[type]);
      if (type === 'whatsapp') {
        el.setAttribute('target', '_blank');             // nova aba
        el.setAttribute('rel', 'noopener noreferrer');   // segurança da nova aba
      }
    });

    $$('[data-contact-text]').forEach((el) => {
      const type = el.dataset.contactText;
      if (!texts[type]) return;
      if (type === 'email' && texts.email.includes('@')) {
        // E-mail: "usuario@" + <wbr> + "dominio". O <wbr> é um ponto de
        // quebra opcional: em telas estreitas a linha quebra logo após o @.
        const [user, domain] = texts.email.split('@');
        el.replaceChildren(`${user}@`, document.createElement('wbr'), domain);
      } else {
        el.textContent = texts[type];
      }
    });
  }


  /* ===================================================================
     16. FORMULÁRIO DE CONTATO
     O que faz:
     - MENSAGEM PADRÃO: o campo "Mensagem" já vem preenchido com
       CONTATO.mensagemPadrao (o cliente pode editar à vontade).
     - VALIDAÇÃO EM TEMPO REAL: cada campo tem uma regra (RULES). O erro
       só aparece depois que a pessoa digitou algo e saiu do campo (ou
       tentou enviar); a partir daí, revalida a cada tecla.
     - MÁSCARA DE TELEFONE brasileira: (27) 3123-4567 ou (27) 99297-3770,
       mantendo o cursor no lugar certo enquanto a pessoa digita.
     - ENVIO SIMULADO: nada é enviado. Mostra "enviando..." e depois a
       mensagem de sucesso. (Ver comentário "INTEGRAÇÃO REAL" abaixo.)
     =================================================================== */
  function initContactForm() {
    const form = $('[data-form]');
    if (!form) return;

    const success = $('[data-form-success]');
    const feedback = $('[data-form-feedback]', form);
    const submitButton = $('button[type="submit"]', form);
    const submitLabel = submitButton ? $('.btn__label', submitButton) : null;
    const phone = form.elements.telefone;
    const message = form.elements.mensagem;
    const counter = $('[data-char-counter]', form);

    // DDDs válidos no Brasil (lista oficial da Anatel)
    const VALID_DDD = new Set([
      11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28,
      31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49,
      51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69,
      71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89,
      91, 92, 93, 94, 95, 96, 97, 98, 99
    ]);

    /* RULES — uma função por campo (pelo atributo name).
       Recebe o valor (e o elemento) e retorna a mensagem de erro, ou ''
       (texto vazio) quando está tudo certo. */
    const RULES = {
      nome(value) {
        const v = value.trim();
        if (!v) return 'Informe seu nome.';
        if (v.length < 3) return 'O nome precisa ter pelo menos 3 letras.';
        if (!/^[\p{L}\s'’.-]+$/u.test(v)) return 'Use apenas letras no nome.'; // \p{L} = qualquer letra, inclusive acentuada
        return '';
      },
      email(value) {
        const v = value.trim();
        if (!v) return 'Informe seu e-mail.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Digite um e-mail válido, como nome@empresa.com.br.';
        return '';
      },
      telefone(value) {
        const digits = onlyDigits(value);
        if (!digits) return 'Informe seu telefone com DDD.';
        if (digits.length < 10) return 'Telefone incompleto: digite o DDD e o número.';
        if (!VALID_DDD.has(Number(digits.slice(0, 2)))) return 'DDD inválido. Confira os dois primeiros números.';
        if (digits.length === 11 && digits[2] !== '9') return 'Celular com 11 dígitos deve começar com 9 após o DDD.';
        return '';
      },
      empresa(value) {
        return value.trim().length > 80 ? 'Use no máximo 80 caracteres.' : '';
      },
      assunto(value) {
        return value ? '' : 'Selecione um assunto.';
      },
      mensagem(value) {
        const v = value.trim();
        const min = CONFIG.form.messageMin;
        if (!v) return 'Escreva sua mensagem.';
        if (v.length < min) return `Escreva pelo menos ${min} caracteres (faltam ${min - v.length}).`;
        return '';
      },
      consentimento(value, field) {
        return field.checked ? '' : 'É preciso concordar para que possamos responder.';
      }
    };

    /* setFieldState — pinta o campo como válido/inválido e escreve o erro.
       aria-invalid avisa o leitor de tela que o valor está incorreto. */
    function setFieldState(field, error) {
      const wrapper = field.closest('[data-field]');
      const errorEl = document.getElementById(`${field.id}-error`);
      const filled = field.type === 'checkbox' ? field.checked : field.value.trim() !== '';
      if (wrapper) {
        wrapper.classList.toggle('is-invalid', Boolean(error));
        wrapper.classList.toggle('is-valid', !error && filled);
      }
      field.setAttribute('aria-invalid', String(Boolean(error)));
      if (errorEl) errorEl.textContent = error;
    }

    /* validateField — aplica a regra do campo. Retorna true se válido. */
    function validateField(field) {
      const rule = RULES[field.name];
      if (!rule) return true;
      const error = rule(field.value, field);
      setFieldState(field, error);
      return !error;
    }

    /* maskPhone — aplica a máscara (formatPhoneBR, seção 02) preservando
       a posição do cursor. Passo a passo: conta quantos DÍGITOS existem
       antes do cursor, reformata o texto e recoloca o cursor logo depois
       do mesmo número de dígitos (os símbolos ( ) - não contam). */
    function maskPhone() {
      const caret = phone.selectionStart == null ? phone.value.length : phone.selectionStart;
      const digitsBeforeCaret = onlyDigits(phone.value.slice(0, caret)).length;
      const formatted = formatPhoneBR(onlyDigits(phone.value));
      phone.value = formatted;

      let position = 0;
      let seen = 0;
      while (position < formatted.length && seen < digitsBeforeCaret) {
        if (/\d/.test(formatted[position])) seen += 1;
        position += 1;
      }
      if (document.activeElement === phone) phone.setSelectionRange(position, position);
    }

    /* Backspace logo após um símbolo da máscara (ex.: depois de ") "):
       sem este tratamento o símbolo voltaria sempre e a pessoa ficaria
       "presa". Aqui apagamos o DÍGITO anterior ao símbolo. */
    if (phone) {
      phone.addEventListener('keydown', (event) => {
        if (event.key !== 'Backspace' || phone.selectionStart !== phone.selectionEnd) return;
        const pos = phone.selectionStart;
        if (pos === 0 || /\d/.test(phone.value[pos - 1])) return;
        event.preventDefault();
        let p = pos - 1;
        while (p > 0 && /\D/.test(phone.value[p - 1])) p -= 1; // pula os símbolos
        if (p === 0) return;
        phone.value = phone.value.slice(0, p - 1) + phone.value.slice(pos);
        phone.setSelectionRange(p - 1, p - 1);
        maskPhone();
        if (phone.dataset.touched === 'true') validateField(phone);
      });
    }

    /* updateCounter — contador de caracteres da mensagem (ex.: 120/1000) */
    function updateCounter() {
      if (!counter || !message) return;
      const max = parseInt(message.getAttribute('maxlength'), 10) || 1000;
      const length = message.value.length;
      counter.textContent = `${length}/${max}`;
      counter.classList.toggle('is-near-limit', length > max * 0.9);
    }

    // input: dispara a cada tecla digitada
    form.addEventListener('input', (event) => {
      const field = event.target;
      if (field === phone) maskPhone();
      if (field === message) updateCounter();
      field.dataset.dirty = 'true'; // a pessoa já digitou algo
      if (field.dataset.touched === 'true') validateField(field);
    });

    // focusout: ao sair de um campo em que a pessoa digitou, valida
    form.addEventListener('focusout', (event) => {
      const field = event.target;
      if (!RULES[field.name] || field.dataset.dirty !== 'true') return;
      field.dataset.touched = 'true';
      validateField(field);
    });

    // change: select e checkbox validam na hora da escolha
    form.addEventListener('change', (event) => {
      const field = event.target;
      if (field.tagName === 'SELECT' || field.type === 'checkbox') {
        field.dataset.touched = 'true';
        validateField(field);
      }
    });

    /* setLoading — estado "enviando" do botão.
       aria-busy informa o leitor de tela que algo está em andamento. */
    function setLoading(loading) {
      if (!submitButton) return;
      submitButton.disabled = loading;
      submitButton.classList.toggle('is-loading', loading);
      submitButton.setAttribute('aria-busy', String(loading));
      if (submitLabel) submitLabel.textContent = loading ? 'Enviando...' : 'Enviar mensagem';
    }

    /* resetForm — limpa campos, estados e marcações */
    function resetForm() {
      form.reset();
      $$('[data-field]', form).forEach((wrapper) => wrapper.classList.remove('is-valid', 'is-invalid'));
      Array.from(form.elements).forEach((field) => {
        delete field.dataset.touched;
        delete field.dataset.dirty;
        if (RULES[field.name]) field.removeAttribute('aria-invalid');
        const errorEl = field.id ? document.getElementById(`${field.id}-error`) : null;
        if (errorEl) errorEl.textContent = '';
      });
      if (feedback) feedback.textContent = '';
      updateCounter();
    }

    // submit: valida tudo; se ok, simula o envio
    form.addEventListener('submit', (event) => {
      event.preventDefault(); // impede o envio real / recarregar a página

      const fields = Array.from(form.elements).filter((field) => RULES[field.name]);
      let firstInvalid = null;
      fields.forEach((field) => {
        field.dataset.touched = 'true';
        field.dataset.dirty = 'true';
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        if (feedback) feedback.textContent = 'Revise os campos destacados para continuar.';
        firstInvalid.focus(); // leva a pessoa direto ao primeiro erro
        return;
      }

      if (feedback) feedback.textContent = '';
      setLoading(true);

      /* INTEGRAÇÃO REAL (futuro): troque o setTimeout abaixo por um envio,
         por exemplo: fetch('URL-DO-SEU-BACKEND', { method: 'POST',
         body: new FormData(form) }).then(...). Hoje é só uma simulação. */
      window.setTimeout(() => {
        setLoading(false);
        resetForm();
        form.hidden = true;
        if (success) {
          success.hidden = false;
          success.focus(); // anuncia o sucesso para leitores de tela
        }
      }, CONFIG.form.simulatedDelay);
    });

    // "Enviar outra mensagem": volta ao formulário
    const resetButton = $('[data-form-reset]');
    if (resetButton && success) {
      resetButton.addEventListener('click', () => {
        success.hidden = true;
        form.hidden = false;
        const firstField = form.elements.nome;
        if (firstField) firstField.focus();
      });
    }

    /* MENSAGEM PADRÃO: defaultValue é o valor "de fábrica" do campo.
       Definindo-o a partir de CONTATO, a mensagem aparece ao carregar a
       página e volta sozinha quando o formulário é limpo (form.reset()). */
    if (message) message.defaultValue = CONTATO.mensagemPadrao;

    updateCounter();
  }


  /* ===================================================================
     17. LINKS PROVISÓRIOS, AVISO (TOAST) E ANO DO RODAPÉ
     =================================================================== */

  /* showToast — mostra uma mensagem curta que some sozinha.
     Recebe: o texto. A região tem aria-live, então é lida por leitores de tela. */
  let toastTimer = 0;
  function showToast(text) {
    const toast = $('[data-toast]');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), CONFIG.toastDuration);
  }

  /* initPlaceholderLinks — links com href="#" (redes sociais e Política
     de Privacidade) ainda não têm endereço real. Em vez de pular para o
     topo, mostram um aviso. Ao colocar o link verdadeiro, o aviso deixa de
     aparecer automaticamente. */
  function initPlaceholderLinks() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href="#"]');
      if (!link) return;
      event.preventDefault();
      const name = link.dataset.placeholderLink || 'Este link';
      showToast(`${name}: link provisório. Substitua pelo endereço real no HTML.`);
    });
  }

  /* initFooterYear — escreve o ano atual no copyright (nunca desatualiza) */
  function initFooterYear() {
    const year = String(new Date().getFullYear());
    $$('[data-current-year]').forEach((el) => { el.textContent = year; });
  }


  /* ===================================================================
     18. INICIALIZAÇÃO
     O que faz: liga todos os módulos. safeInit protege cada um com
     try/catch: se um módulo falhar, os outros continuam funcionando.
     A abertura é iniciada por último porque, quando ela termina, avisa
     os outros módulos (evento "intro:end"), que já precisam existir.
     =================================================================== */
  function safeInit(name, fn) {
    try {
      fn();
    } catch (error) {
      console.warn(`[R-Evolution] O módulo "${name}" não pôde ser iniciado:`, error);
    }
  }

  function init() {
    // Avisa o script inline do <head> que o JavaScript carregou
    window.REV_APP_READY = true;

    safeInit('ano do rodapé', initFooterYear);
    safeInit('links de contato', initContactLinks);
    safeInit('links provisórios', initPlaceholderLinks);
    safeInit('cursor', initCursor);
    safeInit('efeitos de rolagem', initScrollEffects);
    safeInit('menu mobile', initMobileMenu);
    safeInit('rolagem suave', initSmoothScroll);
    safeInit('scroll spy', initScrollSpy);
    safeInit('partículas do hero', initHeroParticles);
    safeInit('revelação ao rolar', initReveal);
    safeInit('efeitos dos cards', initCardEffects);
    safeInit('linha do tempo', initTimeline);
    safeInit('FAQ', initAccordion);
    safeInit('formulário', initContactForm);
    safeInit('abertura', initIntro);
  }

  // O script usa "defer", então o HTML já está pronto. A verificação abaixo
  // é uma garantia extra caso o atributo seja removido no futuro.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
