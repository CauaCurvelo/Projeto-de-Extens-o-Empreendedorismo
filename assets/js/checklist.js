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

  renderChecklists(checklists, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const savedState = this.getState();

    container.innerHTML = checklists.map(chk => {
      const chkState = savedState[chk.id] || [];
      const total = chk.items.length;
      const checkedCount = chkState.filter(Boolean).length;
      const percent = Math.round((checkedCount / total) * 100);

      const itemsHtml = chk.items.map((item, idx) => {
        const isChecked = Boolean(chkState[idx]);
        return `
          <li class="checklist-item ${isChecked ? 'checked' : ''}" 
              data-chk-id="${chk.id}" 
              data-idx="${idx}"
              role="checkbox"
              aria-checked="${isChecked}"
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

    this.bindEvents(container, checklists);
  },

  bindEvents(container, checklists) {
    // Clique nos itens
    container.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.checklist-item');
      if (itemEl) {
        const chkId = itemEl.dataset.chkId;
        const idx = parseInt(itemEl.dataset.idx, 10);
        this.toggleItem(chkId, idx, itemEl, checklists);
        return;
      }

      const resetBtn = e.target.closest('.btn-reset-checklist');
      if (resetBtn) {
        const chkId = resetBtn.dataset.resetId;
        this.resetChecklist(chkId, checklists);
      }
    });

    // Acessibilidade via teclado (Enter / Space)
    container.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        const itemEl = e.target.closest('.checklist-item');
        if (itemEl) {
          e.preventDefault();
          const chkId = itemEl.dataset.chkId;
          const idx = parseInt(itemEl.dataset.idx, 10);
          this.toggleItem(chkId, idx, itemEl, checklists);
        }
      }
    });
  },

  toggleItem(chkId, idx, itemEl, checklists) {
    const state = this.getState();
    const chk = checklists.find(c => c.id === chkId);
    if (!chk) return;

    if (!state[chkId]) {
      state[chkId] = new Array(chk.items.length).fill(false);
    }

    state[chkId][idx] = !state[chkId][idx];
    this.saveState(state);

    const isChecked = state[chkId][idx];
    itemEl.classList.toggle('checked', isChecked);
    itemEl.setAttribute('aria-checked', isChecked);

    this.updateProgress(chkId, chk);
  },

  resetChecklist(chkId, checklists) {
    const chk = checklists.find(c => c.id === chkId);
    if (!chk) return;

    const state = this.getState();
    state[chkId] = new Array(chk.items.length).fill(false);
    this.saveState(state);

    const itemsContainer = document.getElementById(`items-${chkId}`);
    if (itemsContainer) {
      itemsContainer.querySelectorAll('.checklist-item').forEach(el => {
        el.classList.remove('checked');
        el.setAttribute('aria-checked', 'false');
      });
    }

    this.updateProgress(chkId, chk);
  },

  updateProgress(chkId, chk) {
    const state = this.getState();
    const chkState = state[chkId] || [];
    const total = chk.items.length;
    const checkedCount = chkState.filter(Boolean).length;
    const percent = Math.round((checkedCount / total) * 100);

    const percentEl = document.getElementById(`percent-${chkId}`);
    const barEl = document.getElementById(`bar-${chkId}`);

    if (percentEl) percentEl.textContent = `${checkedCount} de ${total} (${percent}%)`;
    if (barEl) barEl.style.width = `${percent}%`;
  }
};
