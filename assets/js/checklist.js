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

    const updateActiveIndex = () => {
      const trackScroll = track.scrollLeft;
      const cardWidth = cards[0].offsetWidth + 28;
      const activeIdx = Math.min(
        Math.max(0, Math.round(trackScroll / cardWidth)),
        cards.length - 1
      );

      // Atualiza dots
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, idx) => {
          dot.classList.toggle('active', idx === activeIdx);
        });
      }

      // Atualiza pílulas
      if (pillsContainer) {
        pillsContainer.querySelectorAll('.pill-tab').forEach((pill, idx) => {
          const isActive = idx === activeIdx;
          pill.classList.toggle('active', isActive);
          pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
          if (isActive) {
            pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        });
      }

      // Atualiza contador
      if (counterCurrent) {
        counterCurrent.textContent = String(activeIdx + 1).padStart(2, '0');
      }
    };

    track.removeEventListener('scroll', track._scrollHandler);
    track._scrollHandler = updateActiveIndex;
    track.addEventListener('scroll', updateActiveIndex, { passive: true });

    // Navegação Avançar (Loop)
    if (nextBtn && !nextBtn._bound) {
      nextBtn._bound = true;
      nextBtn.addEventListener('click', () => {
        const cardWidth = cards[0].offsetWidth + 28;
        const maxScroll = track.scrollWidth - track.clientWidth;
        
        // Se estiver no final, dá loop suave para o início
        if (track.scrollLeft >= maxScroll - 20) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      });
    }

    // Navegação Voltar (Loop)
    if (prevBtn && !prevBtn._bound) {
      prevBtn._bound = true;
      prevBtn.addEventListener('click', () => {
        const cardWidth = cards[0].offsetWidth + 28;
        const maxScroll = track.scrollWidth - track.clientWidth;

        // Se estiver no começo, dá loop suave para o final
        if (track.scrollLeft <= 20) {
          track.scrollTo({ left: maxScroll, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        }
      });
    }

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
  },

  scrollToIndex(index) {
    const track = document.getElementById('carousel-track');
    const container = document.getElementById('checklists-container');
    if (!track || !container) return;
    const cards = container.querySelectorAll('.checklist-card');
    if (cards[index]) {
      const cardWidth = cards[0].offsetWidth + 28;
      track.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
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
