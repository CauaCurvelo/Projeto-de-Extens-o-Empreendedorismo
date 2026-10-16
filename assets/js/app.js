/**
 * app.js — Controlador central da aplicação
 * Carrega os dados de content.json, renderiza os módulos em 3 camadas com ícones SVG inline profissionais,
 * gerencia filtros rápidos por categoria, busca em tempo real, acordeons do FAQ e lista de fontes oficiais.
 */

let appData = null;
let currentCategory = 'all';

// Dicionário de Ícones SVG Inline Profissionais (Sem emojis)
const SVG_ICONS = {
  law: `<svg class="icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  practice: `<svg class="icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  prevent: `<svg class="icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  base: `<svg class="icon-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
  warning: `<svg class="icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  external: `<svg class="icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`
};

document.addEventListener('DOMContentLoaded', async () => {
  initThemeToggle();
  await loadContent();
  initNavigation();
  initSearchAndFilter();
  initFaqAccordion();
});

async function loadContent() {
  try {
    const response = await fetch('assets/data/content.json');
    if (!response.ok) throw new Error('Não foi possível carregar o arquivo content.json');
    appData = await response.json();

    renderModules(appData.modules);
    renderCategoryTabs(appData.modules);
    
    // Checklists e Rating
    if (window.ChecklistManager && appData.checklists) {
      ChecklistManager.renderChecklists(appData.checklists, 'checklists-container');
    }

    if (window.RatingManager) {
      RatingManager.init('rating-container');
    }

    renderFaqs(appData.faqs);
    renderWarningList(appData.whenToSeekProfessional);
    renderOfficialSources(appData.officialSources);

  } catch (error) {
    console.error('Erro ao inicializar o conteúdo:', error);
    const container = document.getElementById('modules-container');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: #fee2e2; border-radius: 12px; color: #991b1b;">
          <h3>Erro ao carregar as diretrizes.</h3>
          <p>Verifique se o arquivo content.json está na pasta assets/data/.</p>
        </div>
      `;
    }
  }
}

// Função auxiliar de normalização (remove acentos, pontuações e põe em minúsculo)
function normalizeText(str) {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Destaca os termos pesquisados mantendo o texto original legível
function highlightMatch(text, query) {
  if (!text || !query) return text;
  const terms = query
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 2);

  if (terms.length === 0) return text;

  // Cria regex combinando os termos com busca flexível
  const escapedTerms = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

  return text.replace(regex, '<mark class="search-match">$1</mark>');
}

function renderModules(modules, activeQuery = '') {
  const container = document.getElementById('modules-container');
  if (!container) return;

  if (modules.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: var(--text-light);">
        <div style="margin-bottom: 1rem; color: var(--color-accent); display: inline-flex;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </div>
        <p style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.5rem;">Nenhum tema encontrado para sua busca.</p>
        <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 480px; margin: 0 auto 1.5rem;">Tente pesquisar por termos mais gerais como <strong>"Pix"</strong>, <strong>"arrependimento"</strong>, <strong>"nota fiscal"</strong> ou <strong>"glúten"</strong>.</p>
        <button onclick="clearSearch()" style="background: var(--color-accent); color: #ffffff; border: none; padding: 0.6rem 1.4rem; border-radius: 9999px; cursor: pointer; font-weight: 600; font-size: 0.88rem; box-shadow: var(--shadow-sm);">
          Limpar busca e ver tudo
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = modules.map(mod => {
    const cardsHtml = mod.cards.map(card => `
      <article class="guide-card" id="${card.id}">
        <div class="card-top">
          <h3 class="card-title">${highlightMatch(card.title, activeQuery)}</h3>
        </div>

        <div class="card-layers">
          <!-- 1. O que a lei diz -->
          <div class="layer-item layer-law">
            <span class="layer-label">
              ${SVG_ICONS.law}
              1. O que a Lei diz
            </span>
            <p class="layer-text">${highlightMatch(card.layers.lei, activeQuery)}</p>
          </div>

          <!-- 2. O que isso significa na prática -->
          <div class="layer-item layer-practice">
            <span class="layer-label">
              ${SVG_ICONS.practice}
              2. O que isso significa na prática
            </span>
            <p class="layer-text">${highlightMatch(card.layers.pratica, activeQuery)}</p>
          </div>

          <!-- 3. Como evitar o problema -->
          <div class="layer-item layer-prevent">
            <span class="layer-label">
              ${SVG_ICONS.prevent}
              3. Como evitar o problema
            </span>
            <p class="layer-text">${highlightMatch(card.layers.comoEvitar, activeQuery)}</p>
          </div>
        </div>

        <div class="card-footer">
          <span class="base-legal">
            ${SVG_ICONS.base}
            ${highlightMatch(card.baseLegal, activeQuery)}
          </span>
        </div>
      </article>
    `).join('');

    return `
      <section class="module-block" id="${mod.id}" data-category="${mod.category}">
        <div class="module-header">
          <div class="module-title-group">
            <h2 class="module-title">${highlightMatch(mod.title, activeQuery)}</h2>
            <span class="module-badge">${mod.badge}</span>
          </div>
          <p class="module-summary">${highlightMatch(mod.summary, activeQuery)}</p>
        </div>

        <div class="cards-grid">
          ${cardsHtml}
        </div>
      </section>
    `;
  }).join('');
}

function renderCategoryTabs(modules) {
  const tabsContainer = document.getElementById('category-tabs');
  if (!tabsContainer) return;

  const categories = [
    { label: 'Todas as Áreas', id: 'all' },
    ...Array.from(new Set(modules.map(m => m.category))).map(cat => ({ label: cat, id: cat }))
  ];

  tabsContainer.innerHTML = categories.map((cat, idx) => `
    <button class="tab-btn ${idx === 0 ? 'active' : ''}" data-cat="${cat.id}">
      ${cat.label}
    </button>
  `).join('');

  tabsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;

    tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

    currentCategory = btn.dataset.cat;
    applyFilterAndSearch();
  });

  // Botões laterais do carrossel no desktop
  const scrollLeftBtn = document.getElementById('tabs-scroll-left');
  const scrollRightBtn = document.getElementById('tabs-scroll-right');

  const updateScrollButtons = () => {
    if (!scrollLeftBtn || !scrollRightBtn) return;
    const maxScroll = tabsContainer.scrollWidth - tabsContainer.clientWidth;
    scrollLeftBtn.disabled = tabsContainer.scrollLeft <= 5;
    scrollRightBtn.disabled = tabsContainer.scrollLeft >= maxScroll - 5;
  };

  if (scrollLeftBtn && scrollRightBtn) {
    scrollLeftBtn.addEventListener('click', () => {
      tabsContainer.scrollBy({ left: -240, behavior: 'smooth' });
    });
    scrollRightBtn.addEventListener('click', () => {
      tabsContainer.scrollBy({ left: 240, behavior: 'smooth' });
    });
    tabsContainer.addEventListener('scroll', updateScrollButtons);
    setTimeout(updateScrollButtons, 100);
  }
}

function initSearchAndFilter() {
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  const resetAllBtn = document.getElementById('search-reset-all');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (clearBtn) {
        clearBtn.style.display = searchInput.value ? 'flex' : 'none';
      }
      applyFilterAndSearch();
    });

    // Pressionar Escape limpa a pesquisa
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        clearSearch();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      clearBtn.style.display = 'none';
      applyFilterAndSearch();
    });
  }

  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', clearSearch);
  }

  // Chips de termos sugeridos
  const suggestionChips = document.querySelectorAll('.suggestion-chip');
  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.dataset.query;
      if (!searchInput) return;

      if (searchInput.value === query) {
        searchInput.value = '';
        chip.classList.remove('active');
        if (clearBtn) clearBtn.style.display = 'none';
      } else {
        searchInput.value = query;
        suggestionChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (clearBtn) clearBtn.style.display = 'flex';
      }
      searchInput.focus();
      applyFilterAndSearch();
    });
  });
}

function applyFilterAndSearch() {
  if (!appData || !appData.modules) return;

  const rawQuery = (document.getElementById('search-input')?.value || '').trim();
  const normalizedQuery = normalizeText(rawQuery);
  const searchTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  let totalCardsCount = 0;

  // Filtragem inteligente com normalização e suporte a múltiplos termos
  const filtered = appData.modules.map(mod => {
    const matchesCategory = currentCategory === 'all' || mod.category === currentCategory;
    if (!matchesCategory) return null;

    if (searchTerms.length === 0) {
      totalCardsCount += mod.cards.length;
      return mod;
    }

    // Busca ponderada em cada card
    const matchedCards = mod.cards.filter(card => {
      const fullText = normalizeText(`
        ${card.title} 
        ${card.layers.lei} 
        ${card.layers.pratica} 
        ${card.layers.comoEvitar} 
        ${card.baseLegal} 
        ${mod.title} 
        ${mod.summary} 
        ${mod.badge}
      `);

      // Todos os termos digitados devem estar presentes em qualquer parte do card
      return searchTerms.every(term => fullText.includes(term));
    });

    if (matchedCards.length > 0) {
      totalCardsCount += matchedCards.length;
      return { ...mod, cards: matchedCards };
    }

    return null;
  }).filter(Boolean);

  // Atualiza barra de status e contagem de resultados
  const resultsBar = document.getElementById('search-results-bar');
  const resultsCount = document.getElementById('search-results-count');

  if (resultsBar && resultsCount) {
    if (rawQuery || currentCategory !== 'all') {
      resultsBar.style.display = 'flex';
      const catLabel = currentCategory === 'all' ? 'em todas as áreas' : `na área "${currentCategory}"`;
      if (rawQuery) {
        resultsCount.innerHTML = `Encontrados <strong>${totalCardsCount}</strong> ${totalCardsCount === 1 ? 'item' : 'itens'} para "<strong>${rawQuery}</strong>" ${catLabel}.`;
      } else {
        resultsCount.innerHTML = `Mostrando <strong>${totalCardsCount}</strong> ${totalCardsCount === 1 ? 'diretriz' : 'diretrizes'} ${catLabel}.`;
      }
    } else {
      resultsBar.style.display = 'none';
    }
  }

  // Sincroniza estado visual dos chips de busca sugerida
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.query.toLowerCase() === rawQuery.toLowerCase());
  });

  renderModules(filtered, rawQuery);
}

window.clearSearch = function() {
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  if (searchInput) searchInput.value = '';
  if (clearBtn) clearBtn.style.display = 'none';
  currentCategory = 'all';

  const tabsContainer = document.getElementById('category-tabs');
  if (tabsContainer) {
    tabsContainer.querySelectorAll('.tab-btn').forEach((b, idx) => {
      b.classList.toggle('active', idx === 0);
    });
    tabsContainer.scrollTo({ left: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.suggestion-chip').forEach(c => c.classList.remove('active'));
  applyFilterAndSearch();
};

function renderFaqs(faqs) {
  const container = document.getElementById('faq-container');
  if (!container || !faqs) return;

  container.innerHTML = faqs.map((faq, idx) => `
    <div class="faq-item" id="faq-${idx}">
      <button class="faq-trigger" aria-expanded="false" aria-controls="faq-body-${idx}">
        <span class="faq-question">“${faq.q}”</span>
        <span class="faq-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </span>
      </button>
      <div class="faq-body" id="faq-body-${idx}">
        <div class="faq-answer">
          ${faq.a}
        </div>
      </div>
    </div>
  `).join('');
}

function initFaqAccordion() {
  const container = document.getElementById('faq-container');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const trigger = e.target.closest('.faq-trigger');
    if (!trigger) return;

    const item = trigger.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    container.querySelectorAll('.faq-item').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });
}

function renderWarningList(items) {
  const listEl = document.getElementById('warning-list');
  if (!listEl || !items) return;

  listEl.innerHTML = items.map(item => `
    <li>
      <span class="warning-bullet">${SVG_ICONS.warning}</span>
      <span>${item}</span>
    </li>
  `).join('');
}

function renderOfficialSources(sources) {
  const container = document.getElementById('official-sources-grid');
  if (!container || !sources) return;

  container.innerHTML = sources.map(src => `
    <a href="${src.url}" target="_blank" rel="noopener noreferrer" class="source-card">
      <div class="source-content">
        <h4 class="source-title">${src.title}</h4>
        <p class="source-desc">${src.desc}</p>
      </div>
      <span class="source-link-icon">${SVG_ICONS.external}</span>
    </a>
  `).join('');
}

function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.getElementById('mobile-toggle');
  const dropdown = document.getElementById('mobile-dropdown-menu');
  const backdrop = document.getElementById('dropdown-backdrop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  const openMenu = () => {
    dropdown?.classList.add('open');
    backdrop?.classList.add('active');
    toggleBtn?.classList.add('active');
    toggleBtn?.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    dropdown?.classList.remove('open');
    backdrop?.classList.remove('active');
    toggleBtn?.classList.remove('active');
    toggleBtn?.setAttribute('aria-expanded', 'false');
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdown?.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  if (dropdown) {
    dropdown.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // Fecha se pressionar a tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown?.classList.contains('open')) {
      closeMenu();
    }
  });

  // Fecha o menu se a tela for redimensionada para desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 769 && dropdown?.classList.contains('open')) {
      closeMenu();
    }
  });
}

/**
 * Sistema de Modo Escuro Ultra Fluido e Otimizado
 * Troca instantânea de variáveis CSS com transição suave nos elementos principais,
 * sem engasgos ou travamento de rasterização de tela cheia no mobile.
 */
let isThemeTransitioning = false;

function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const storedTheme = localStorage.getItem('unex_theme');
  
  // Define o tema inicial SEMPRE como claro por padrão (light)
  const currentTheme = storedTheme || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeColorMeta(currentTheme);

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isThemeTransitioning) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';

    // Coordenadas exatas do centro do botão na viewport
    const rect = toggleBtn.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);

    // Raio máximo até o canto mais distante da tela
    const maxDistX = Math.max(x, window.innerWidth - x);
    const maxDistY = Math.max(y, window.innerHeight - y);
    const endRadius = Math.ceil(Math.hypot(maxDistX, maxDistY));

    // Suporte à View Transition API nativa com revelação circular do novo tema
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      isThemeTransitioning = true;

      const transition = document.startViewTransition(() => {
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('unex_theme', nextTheme);
        updateThemeColorMeta(nextTheme);
      });

      transition.ready.then(() => {
        const animation = document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 380,
            easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );

        animation.onfinish = () => {
          isThemeTransitioning = false;
        };
      }).catch(() => {
        isThemeTransitioning = false;
      });
    } else {
      // Fallback para navegadores sem View Transition
      document.documentElement.classList.add('theme-switching');
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('unex_theme', nextTheme);
      updateThemeColorMeta(nextTheme);
      setTimeout(() => {
        document.documentElement.classList.remove('theme-switching');
      }, 280);
    }
  });
}

function updateThemeColorMeta(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#000000' : '#1d4ed8');
  }
}
