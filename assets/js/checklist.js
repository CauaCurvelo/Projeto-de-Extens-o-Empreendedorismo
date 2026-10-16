/**
 * checklist.js — Gerenciamento interativo de Checklists com persistência no LocalStorage
 */

const ChecklistManager = {
  storageKey: 'empreendedorismo_checklists_state',

  getState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.warn('Erro ao ler localStorage de checklists:', e);
      return {};
    }
  },

  saveState(state) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (e) {
      console.warn('Erro ao salvar localStorage de checklists:', e);
    }
  },

  // Atualiza um card específico (contagem de itens marcados e barra de progresso)
  updateCardProgress(card) {
    if (!card) return;
    const chkId = card.id ? card.id.replace('card-', '') : null;
    const items = card.querySelectorAll('.checklist-item');
    const checked = card.querySelectorAll('.checklist-item.checked');
    const total = items.length;
    const count = checked.length;
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;

    const percentEl = chkId ? document.getElementById(`percent-${chkId}`) : card.querySelector('[id^="percent-"]');
    const barEl = chkId ? document.getElementById(`bar-${chkId}`) : card.querySelector('[id^="bar-"]');

    if (percentEl) percentEl.textContent = `${count} de ${total} (${percent}%)`;
    if (barEl) barEl.style.width = `${percent}%`;
  },

  // Alterna o estado de um item clicado
  toggleItemEl(itemEl) {
    if (!itemEl) return;
    const chkId = itemEl.dataset.chkId;
    const idx = parseInt(itemEl.dataset.idx, 10);
    const card = itemEl.closest('.checklist-card');

    const state = this.getState();
    if (!state[chkId]) state[chkId] = [];

    // Inverte estado
    state[chkId][idx] = !state[chkId][idx];
    this.saveState(state);

    const isChecked = Boolean(state[chkId][idx]);
    itemEl.classList.toggle('checked', isChecked);
    itemEl.setAttribute('aria-checked', isChecked ? 'true' : 'false');

    if (card) {
      this.updateCardProgress(card);
    }
  },

  // Reseta um checklist inteiro
  resetChecklist(chkId, card) {
    const state = this.getState();
    delete state[chkId];
    this.saveState(state);

    if (card) {
      card.querySelectorAll('.checklist-item').forEach(el => {
        el.classList.remove('checked');
        el.setAttribute('aria-checked', 'false');
      });
      this.updateCardProgress(card);
    }
  },

  // Hidrata os itens já presentes no HTML ou recém-renderizados
  hydrateContainer(container) {
    if (!container) return;
    const savedState = this.getState();

    Object.keys(savedState).forEach(chkId => {
      const items = savedState[chkId];
      if (Array.isArray(items)) {
        items.forEach((checked, idx) => {
          if (checked) {
            const itemEl = container.querySelector(`.checklist-item[data-chk-id="${chkId}"][data-idx="${idx}"]`);
            if (itemEl) {
              itemEl.classList.add('checked');
              itemEl.setAttribute('aria-checked', 'true');
            }
          }
        });
      }
    });

    container.querySelectorAll('.checklist-card').forEach(card => {
      this.updateCardProgress(card);
    });
  },

  // Inicializa checklists estáticos
  initStatic() {
    const container = document.getElementById('checklists-container');
    if (container) {
      this.hydrateContainer(container);
    }
  },

  // Renderiza dinamicamente se chamado via content.json ou aba interna
  renderChecklists(checklists, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Se já existem cards no container estático e são os mesmos, apenas hidrata para não piscar
    if (container.querySelectorAll('.checklist-card').length > 0 && containerId === 'checklists-container') {
      this.hydrateContainer(container);
      return;
    }

    const savedState = this.getState();

    container.innerHTML = checklists.map(chk => {
      const chkState = savedState[chk.id] || [];
      const total = chk.items.length;
      const checkedCount = chkState.filter(Boolean).length;
      const percent = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

      const itemsHtml = chk.items.map((item, idx) => {
        const isChecked = Boolean(chkState[idx]);
        return `
          <li class="checklist-item ${isChecked ? 'checked' : ''}" 
              data-chk-id="${chk.id}" 
              data-idx="${idx}"
              role="checkbox"
              aria-checked="${isChecked ? 'true' : 'false'}"
              tabindex="0">
            <div class="custom-checkbox">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span>${item}</span>
          </li>
        `;
      }).join('');

      return `
        <div class="checklist-card" id="card-${chk.id}">
          <div class="checklist-header">
            <h3>${chk.title}</h3>
            <p>${chk.desc}</p>
          </div>

          <div class="progress-container">
            <div class="progress-info">
              <span>Progresso</span>
              <span id="percent-${chk.id}">${checkedCount} de ${total} (${percent}%)</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" id="bar-${chk.id}" style="width: ${percent}%;"></div>
            </div>
          </div>

          <ul class="checklist-items" id="items-${chk.id}">
            ${itemsHtml}
          </ul>

          <div class="checklist-actions">
            <button class="btn-reset-checklist" data-reset-id="${chk.id}">Limpar checklist</button>
          </div>
        </div>
      `;
    }).join('');

    this.hydrateContainer(container);
    this.initCarousel();
  },

  // Inicializador do Carrossel com navegação em loop contínuo, pílulas e contador
  initCarousel() {
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const sidePrevBtn = document.getElementById('carousel-side-prev');
    const sideNextBtn = document.getElementById('carousel-side-next');
    const dotsContainer = document.getElementById('carousel-dots');
    const pillsContainer = document.getElementById('carousel-pills');
    const counterCurrent = document.getElementById('counter-current');
    const container = document.getElementById('checklists-container');

    if (!track || !container) return;

    const cards = container.querySelectorAll('.checklist-card');
    if (cards.length === 0) return;

    // Gera os pontinhos indicadores inferiores
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      cards.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Ir para o checklist ${idx + 1}`);
        dot.addEventListener('click', () => {
          this.scrollToIndex(idx);
        });
        dotsContainer.appendChild(dot);
      });
    }

    // Configura cliques nas pílulas superiores
    if (pillsContainer) {
      const pills = pillsContainer.querySelectorAll('.pill-tab');
      pills.forEach((pill, idx) => {
        if (!pill._bound) {
          pill._bound = true;
          pill.addEventListener('click', () => {
            this.scrollToIndex(idx);
          });
        }
      });
    }

    // Calcula qual card está mais próximo do centro geométrico do trilho
    const updateActiveIndex = () => {
      const trackRect = track.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;

      let closestIdx = 0;
      let minDistance = Infinity;

      cards.forEach((card, idx) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(trackCenter - cardCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });

      // Aplica classe de destaque is-active (meio nítido, lados apagados)
      cards.forEach((card, idx) => {
        card.classList.toggle('is-active', idx === closestIdx);
      });

      // Atualiza dots
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, idx) => {
          dot.classList.toggle('active', idx === closestIdx);
        });
      }

      // Atualiza pílulas superiores
      if (pillsContainer) {
        pillsContainer.querySelectorAll('.pill-tab').forEach((pill, idx) => {
          const isActive = idx === closestIdx;
          pill.classList.toggle('active', isActive);
          pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
          if (isActive) {
            pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        });
      }

      // Atualiza contador
      if (counterCurrent) {
        counterCurrent.textContent = String(closestIdx + 1).padStart(2, '0');
      }

      this._currentIndex = closestIdx;
    };

    track.removeEventListener('scroll', track._scrollHandler);
    track._scrollHandler = updateActiveIndex;
    track.addEventListener('scroll', updateActiveIndex, { passive: true });

    // Funções de Avançar e Voltar com Loop Infinito
    const goNext = () => {
      const current = this._currentIndex || 0;
      const nextIdx = (current + 1) % cards.length;
      this.scrollToIndex(nextIdx);
    };

    const goPrev = () => {
      const current = this._currentIndex || 0;
      const prevIdx = (current - 1 + cards.length) % cards.length;
      this.scrollToIndex(prevIdx);
    };

    // Vincula botões superiores e laterais
    [nextBtn, sideNextBtn].forEach(btn => {
      if (btn && !btn._bound) {
        btn._bound = true;
        btn.addEventListener('click', goNext);
      }
    });

    [prevBtn, sidePrevBtn].forEach(btn => {
      if (btn && !btn._bound) {
        btn._bound = true;
        btn.addEventListener('click', goPrev);
      }
    });

    // Clique direto no card lateral traz ele para o meio
    cards.forEach((card, idx) => {
      if (!card._clickBound) {
        card._clickBound = true;
        card.addEventListener('click', (e) => {
          if (e.target.closest('.checklist-item') || e.target.closest('.btn-reset-checklist')) return;
          if (!card.classList.contains('is-active')) {
            this.scrollToIndex(idx);
          }
        });
      }
    });

    // Suporte a arrasto fluído no desktop
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    track.addEventListener('mousedown', (e) => {
      if (e.target.closest('.checklist-item') || e.target.closest('.btn-reset-checklist')) return;
      isDown = true;
      track.style.cursor = 'grabbing';
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      isDown = false;
      track.style.cursor = '';
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
      track.style.cursor = '';
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });

    // Executa uma vez no início para marcar o primeiro card ativo
    updateActiveIndex();
  },

  scrollToIndex(index) {
    const track = document.getElementById('carousel-track');
    const container = document.getElementById('checklists-container');
    if (!track || !container) return;
    const cards = container.querySelectorAll('.checklist-card');
    if (cards[index]) {
      const card = cards[index];
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const targetScroll = cardCenter - track.clientWidth / 2;
      track.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
    }
  }
};

// Listener global para cliques em qualquer checklist (seja no container principal ou na aba)
document.addEventListener('click', (e) => {
  const itemEl = e.target.closest('.checklist-item');
  if (itemEl) {
    ChecklistManager.toggleItemEl(itemEl);
    return;
  }

  const resetBtn = e.target.closest('.btn-reset-checklist');
  if (resetBtn) {
    const chkId = resetBtn.dataset.resetId;
    const card = resetBtn.closest('.checklist-card');
    ChecklistManager.resetChecklist(chkId, card);
  }
});

// Acessibilidade via teclado (Enter / Barra de espaço)
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    const itemEl = e.target.closest('.checklist-item');
    if (itemEl) {
      e.preventDefault();
      ChecklistManager.toggleItemEl(itemEl);
    }
  }
});

window.ChecklistManager = ChecklistManager;

// Auto-inicializa checklists assim que o documento carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ChecklistManager.initStatic();
    ChecklistManager.initCarousel();
  });
} else {
  ChecklistManager.initStatic();
  ChecklistManager.initCarousel();
}
