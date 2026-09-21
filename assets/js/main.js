// GS Digital - Core High-Tech Interaction System

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initCalculator();
  initPortfolio();
  initNavigation();
  initContactForm();
});

/* -------------------------------------------------------------
 * 1. Lightweight Cyber Particle Canvas (Pixel-Perfect Precision)
 * ----------------------------------------------------------- */
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2); // Suporte para telas Retina / High-DPI
    width = rect.width;
    height = rect.height;

    // Buffer interno exatamente proporcional à área renderizada em CSS
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  resizeCanvas();

  const particles = [];
  const particleCount = Math.min(Math.floor(window.innerWidth / 32), 36);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 1.8 + 1,
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  let mouse = { x: -1000, y: -1000 };

  function updateMouse(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    // Mapeamento exato de coordenadas relativas ao elemento Canvas
    mouse.x = clientX - rect.left;
    mouse.y = clientY - rect.top;
  }

  window.addEventListener('mousemove', (e) => {
    updateMouse(e.clientX, e.clientY);
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  }, { passive: true });

  window.addEventListener('resize', () => {
    resizeCanvas();
    // Mantém as partículas dentro dos novos limites de largura/altura
    for (let i = 0; i < particles.length; i++) {
      if (particles[i].x > width) particles[i].x = Math.random() * width;
      if (particles[i].y > height) particles[i].y = Math.random() * height;
    }
  });

  function render() {
    if (document.hidden) return;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Render particles & connections
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f0ff';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Link nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - dist / 110) * 0.18})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Link to mouse com alinhamento milimétrico na ponta do cursor
      if (mouse.x >= 0 && mouse.y >= 0) {
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 140) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - mdist / 140) * 0.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    ctx.restore();
    requestAnimationFrame(render);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestAnimationFrame(render);
  });

  render();
}

/* -------------------------------------------------------------
 * 2. Interactive Budget Simulator (Synced with Admin Panel)
 * ----------------------------------------------------------- */
function initCalculator() {
  const projectCards = document.querySelectorAll('[data-calc-project]');
  const maintenanceCheckbox = document.getElementById('calc-maintenance-toggle');
  const urgencyCards = document.querySelectorAll('[data-calc-urgency]');
  
  const summaryProjectName = document.getElementById('summary-project-name');
  const summaryProjectPrice = document.getElementById('summary-project-price');
  const summaryMaintenanceRow = document.getElementById('summary-maintenance-row');
  const summaryMaintenancePrice = document.getElementById('summary-maintenance-price');
  const summaryTotalValue = document.getElementById('summary-total-value');
  const btnSendWhatsApp = document.getElementById('btn-send-calc-whatsapp');

  const maintenancePrice = 189;

  let currentProject = {
    name: projectCards[0] ? projectCards[0].getAttribute('data-calc-name') : 'Landing Page de Alta Conversão',
    price: projectCards[0] ? parseInt(projectCards[0].getAttribute('data-calc-price'), 10) : 1290
  };

  let maintenanceActive = true;
  let urgencyMultiplier = 1;

  // Project selector
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      projectCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentProject.name = card.getAttribute('data-calc-name');
      currentProject.price = parseInt(card.getAttribute('data-calc-price'), 10);
      updateSummary();
    });
  });

  // Urgency selector
  urgencyCards.forEach(card => {
    card.addEventListener('click', () => {
      urgencyCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      urgencyMultiplier = parseFloat(card.getAttribute('data-calc-multiplier'));
      updateSummary();
    });
  });

  // Maintenance Toggle
  if (maintenanceCheckbox) {
    maintenanceCheckbox.addEventListener('change', (e) => {
      maintenanceActive = e.target.checked;
      updateSummary();
    });
  }

  function updateSummary() {
    const calculatedProjectPrice = Math.round(currentProject.price * urgencyMultiplier);
    
    if (summaryProjectName) summaryProjectName.textContent = currentProject.name;
    if (summaryProjectPrice) summaryProjectPrice.textContent = `R$ ${calculatedProjectPrice.toLocaleString('pt-BR')}`;

    if (summaryMaintenanceRow) {
      if (maintenanceActive) {
        summaryMaintenanceRow.style.display = 'flex';
        if (summaryMaintenancePrice) {
          summaryMaintenancePrice.textContent = `+ R$ ${maintenancePrice.toLocaleString('pt-BR')} /mês`;
        }
      } else {
        summaryMaintenanceRow.style.display = 'none';
      }
    }

    if (summaryTotalValue) {
      let totalText = `R$ ${calculatedProjectPrice.toLocaleString('pt-BR')}`;
      if (maintenanceActive) {
        totalText += ` <span style="font-size: 1.1rem; font-weight: 500; color: #94a3b8;">(+ R$ ${maintenancePrice}/mês)</span>`;
      }
      summaryTotalValue.innerHTML = totalText;
    }

    // Update WhatsApp link and track the conversion when analytics is configured.
    if (btnSendWhatsApp) {
      const msg = `Olá GS Digital! Fiz uma simulação de projeto no site:%0A%0A` +
        `🚀 *Projeto:* ${currentProject.name}%0A` +
        `💰 *Investimento estimado:* R$ ${calculatedProjectPrice.toLocaleString('pt-BR')}%0A` +
        `🛡️ *Manutenção Preventiva:* ${maintenanceActive ? 'Sim (R$ ' + maintenancePrice + '/mês)' : 'Não inclusa'}%0A%0A` +
        `Gostaria de formalizar uma proposta e dar início!`;
      btnSendWhatsApp.href = `https://wa.me/5511968799692?text=${msg}`;

      btnSendWhatsApp.onclick = () => trackEvent('generate_lead', {
        channel: 'whatsapp',
        source: 'simulator',
        service: currentProject.name,
        value: calculatedProjectPrice,
        currency: 'BRL'
      });
    }
  }

  // Initial calculation
  updateSummary();
}

/* -------------------------------------------------------------
 * 3. Portfolio Filtering & Interactive Details Modal
 * ----------------------------------------------------------- */
const portfolioData = {
  ecommerce: {
    title: 'NOCTURNAL® — Loja Virtual & Streetwear',
    category: 'E-commerce & Lojas Virtuais',
    desc: 'Loja virtual de alta performance para marca de moda urbana e streetwear. Arquitetura headless ultrarrápida, gaveta lateral de carrinho com atualização de frete e cupom em tempo real, e simulação completa de checkout com geração de QR Code Pix e cópia de chave.',
    metrics: ['Carrinho reativo', 'Checkout Pix demonstrativo', 'Layout responsivo'],
    image: 'assets/images/cover_ecommerce.jpg',
    stack: 'HTML5 Moderno, Vanilla JS Reativo, Otimização WebP, Gateway Pix',
    liveUrl: 'demos/ecommerce/index.html'
  },
  advocacia: {
    title: 'Valente & Prado — Sociedade de Advogados',
    category: 'Profissionais Liberais / Direito Corporativo',
    desc: 'Site institucional corporativo de prestígio para banca jurídica especializada em Direito Tributário, Societário e Fusões & Aquisições (M&A). Inclui apresentação de sócios mestres pela USP/PUC, formulário de diagnóstico sob sigilo e atendimento prioritário.',
    metrics: ['Hierarquia editorial', 'Formulário de triagem', 'Estrutura semântica'],
    image: 'assets/images/cover_advocacia.jpg',
    stack: 'Design Editorial Luxo, Tipografia Cinzel, Formulário de Triagem, Alta Performance',
    liveUrl: 'demos/advocacia/index.html'
  },
  arquitetura: {
    title: 'Studio Arkhé — Arquitetura Sensorial & Interiores',
    category: 'Profissionais Liberais / Arquitetura & Design',
    desc: 'Site contemporâneo de arquitetura com estética editorial, grid de obras de alto padrão e uma calculadora interativa exclusiva que estima honorários e investimento de obra com base na metragem quadrada e padrão de acabamento.',
    metrics: ['Calculadora Dinâmica por m²', 'Galeria Imersiva de Obras', 'Estética Minimalista Internacional'],
    image: 'assets/images/cover_arquitetura.jpg',
    stack: 'CSS Grid Assimétrico, Slider Dinâmico em JS, Design Biofílico Acolhedor',
    liveUrl: 'demos/arquitetura/index.html'
  },
  psicologia: {
    title: 'Dra. Helena Vaz — Psicologia Clínica & Terapia Online',
    category: 'Profissionais Liberais / Saúde Mental',
    desc: 'Ambiente digital acolhedor e humanizado para psicoterapia individual e online regulamentada pelo CFP. Conta com sistema de agendamento de sessões, guia completo sobre emissão de recibos para reembolso em convênios e acordeon de dúvidas frequentes.',
    metrics: ['Agendamento Humanizado', 'Conformidade Resolução CFP', 'Alta Conversão para WhatsApp'],
    image: 'assets/images/cover_psicologia.jpg',
    stack: 'Paleta Suave Sage & Terracota, Acordeon FAQ Interativo, Integração WhatsApp API',
    liveUrl: 'demos/psicologia/index.html'
  },
  imobiliaria: {
    title: 'Horizon Ocean Residences — Empreendimento Frente Mar',
    category: 'Landing Pages / Lançamento Imobiliário',
    desc: 'Landing page de altíssima conversão para lançamento imobiliário de alto padrão no litoral. Conta com seletor interativo de plantas (168 a 420m² duplex), tour visual do condomínio, simulador de fluxo de pagamento na obra e captura automática de leads.',
    metrics: ['Captação de leads', 'Simulador demonstrativo', 'Apresentação interativa de plantas'],
    image: 'assets/images/cover_imobiliaria.jpg',
    stack: 'Arquitetura de Alta Conversão, Simulador Financeiro JS, Plantas Dinâmicas',
    liveUrl: 'demos/imobiliaria/index.html'
  },
  nutricao: {
    title: 'Lucas Meneses — Nutrição Esportiva & Performance',
    category: 'Landing Pages & Profissionais / Saúde & Fitness',
    desc: 'Landing page atlética de alta energia para consultoria nutricional esportiva. Apresenta calculadora em tempo real de Taxa Metabólica Basal (TMB) e meta de ingestão de água, tabela comparativa de planos e histórico de evolução física de clientes.',
    metrics: ['Calculadora TMB Integrada', 'Tabela de Planos e Vagas VIP', 'Visual Volt Neon de Alto Impacto'],
    image: 'assets/images/cover_nutricao.jpg',
    stack: 'Fórmula Harris-Benedict em JS, UI Volt Neon & Dark Carbon, Seletor de Planos',
    liveUrl: 'demos/nutricao/index.html'
  }
};

function initPortfolio() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      cards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Modal handlers
  const modalBackdrop = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const detailButtons = document.querySelectorAll('[data-project-id]');

  if (modalBackdrop && modalClose) {
    detailButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const pid = btn.getAttribute('data-project-id');
        openProjectModal(pid);
      });
    });

    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  function openProjectModal(id) {
    const data = portfolioData[id];
    if (!data) return;

    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-category').textContent = data.category;
    document.getElementById('modal-desc').textContent = data.desc;
    const modalImage = document.getElementById('modal-img');
    modalImage.src = data.image.replace(/\.jpg$/i, '.webp');
    document.getElementById('modal-stack').textContent = data.stack;

    const liveLinkBtn = document.getElementById('modal-live-demo-link');
    if (liveLinkBtn && data.liveUrl) {
      liveLinkBtn.href = data.liveUrl;
    }

    const metricsContainer = document.getElementById('modal-metrics');
    metricsContainer.innerHTML = '';
    data.metrics.forEach(m => {
      const span = document.createElement('span');
      span.className = 'portfolio-tag';
      span.textContent = m;
      metricsContainer.appendChild(span);
    });

    modalBackdrop.classList.add('active');
    modalBackdrop.removeAttribute('inert');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    modalBackdrop.classList.remove('active');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    modalBackdrop.setAttribute('inert', '');
    document.body.style.overflow = '';
  }
}

/* -------------------------------------------------------------
 * 4. Header & Navigation
 * ----------------------------------------------------------- */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.addEventListener('click', () => {
      const isVisible = navMenu.style.display === 'flex';
      navMenu.style.display = isVisible ? 'none' : 'flex';
      mobileToggle.setAttribute('aria-expanded', String(!isVisible));
      navMenu.style.flexDirection = 'column';
      navMenu.style.position = 'absolute';
      navMenu.style.top = '70px';
      navMenu.style.left = '20px';
      navMenu.style.right = '20px';
      navMenu.style.background = 'rgba(10, 16, 26, 0.98)';
      navMenu.style.border = '1px solid rgba(0, 240, 255, 0.3)';
      navMenu.style.borderRadius = '16px';
      navMenu.style.padding = '20px';
    });

    navLinks.forEach(link => link.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 768px)').matches) {
        navMenu.style.display = 'none';
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    }));
  }

  window.addEventListener('scroll', () => {
    // Header shadow
    if (window.scrollY > 50) {
      header.style.top = '10px';
    } else {
      header.style.top = '18px';
    }

    // ScrollSpy
    let current = '';
    sections.forEach(sec => {
      const sectionTop = sec.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* -------------------------------------------------------------
 * 5. Contact Form with Instant Feedback
 * ----------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value;
    const service = document.getElementById('contact-service').value;
    const message = document.getElementById('contact-message').value;

    const whatsappText = `Olá GS Digital! Meu nome é ${encodeURIComponent(name)}.%0A%0A` +
      `Estou interessado em: *${encodeURIComponent(service)}*.%0A%0A` +
      `Mensagem: ${encodeURIComponent(message)}`;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = `<span>Enviando para o WhatsApp...</span> ✦`;
    submitBtn.style.opacity = '0.8';

    setTimeout(() => {
      trackEvent('generate_lead', {
        channel: 'whatsapp',
        source: 'contact_form',
        service
      });
      window.open(`https://wa.me/5511968799692?text=${whatsappText}`, '_blank');
      submitBtn.innerHTML = `<span>Conversa aberta no WhatsApp</span> ✓`;
      submitBtn.style.background = '#10b981';
      form.reset();

      setTimeout(() => {
        submitBtn.innerHTML = `<span>Iniciar Conversa</span> <span class="btn-icon-right">→</span>`;
        submitBtn.style.background = '';
        submitBtn.style.opacity = '1';
      }, 4000);
    }, 600);
  });
}

function trackEvent(name, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}
