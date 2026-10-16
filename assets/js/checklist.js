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
  document.addEventListener('DOMContentLoaded', () => ChecklistManager.initStatic());
} else {
  ChecklistManager.initStatic();
}
