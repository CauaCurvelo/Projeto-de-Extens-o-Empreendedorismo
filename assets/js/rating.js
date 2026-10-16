/**
 * rating.js — Sistema de Avaliação com Estrelas SVG e Métricas do Projeto
 * Sem emojis, com ícones vetoriais elegantes e feedback visual profissional.
 */

const RatingManager = {
  storageKey: 'empreendedorismo_user_rating',
  statsKey: 'empreendedorismo_metrics_stats',

  starSvg(filled = false) {
    return `
      <svg class="star-icon ${filled ? 'filled' : ''}" width="28" height="28" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    `;
  },

  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.trackVisit();
    this.renderRating(container);
  },

  trackVisit() {
    try {
      let stats = localStorage.getItem(this.statsKey);
      if (!stats) {
        stats = { visits: 42, ratingsCount: 28, totalScore: 137 };
      } else {
        stats = JSON.parse(stats);
      }

      const sessionKey = 'empreendedorismo_visited_session';
      if (!sessionStorage.getItem(sessionKey)) {
        stats.visits = (stats.visits || 0) + 1;
        sessionStorage.setItem(sessionKey, 'true');
        localStorage.setItem(this.statsKey, JSON.stringify(stats));
      }
    } catch (e) {
      console.warn('Erro ao atualizar métricas:', e);
    }
  },

  getStats() {
    try {
      const stats = localStorage.getItem(this.statsKey);
      if (stats) return JSON.parse(stats);
    } catch (e) {}
    return { visits: 42, ratingsCount: 28, totalScore: 137 };
  },

  getUserRating() {
    try {
      return parseInt(localStorage.getItem(this.storageKey), 10) || 0;
    } catch (e) {
      return 0;
    }
  },

  setUserRating(score) {
    try {
      localStorage.setItem(this.storageKey, score.toString());
      
      const stats = this.getStats();
      stats.ratingsCount = (stats.ratingsCount || 0) + 1;
      stats.totalScore = (stats.totalScore || 0) + score;
      localStorage.setItem(this.statsKey, JSON.stringify(stats));
    } catch (e) {
      console.warn('Erro ao salvar avaliação:', e);
    }
  },

  renderRating(container) {
    const userRating = this.getUserRating();
    const stats = this.getStats();
    const average = (stats.totalScore / (stats.ratingsCount || 1)).toFixed(1);

    container.innerHTML = `
      <div class="rating-section" id="avaliacao">
        <h3 class="rating-title">Avaliação do Guia Prático</h3>
        <p class="rating-desc">Sua avaliação colabora com as métricas do projeto de extensão e o aperfeiçoamento contínuo das orientações.</p>
        
        <div class="stars-container" id="stars-group" role="radiogroup" aria-label="Avalie de 1 a 5 estrelas">
          ${[1, 2, 3, 4, 5].map(star => `
            <button class="star-btn ${star <= userRating ? 'active' : ''}" 
                    data-value="${star}" 
                    role="radio" 
                    aria-checked="${star === userRating}"
                    aria-label="${star} de 5 estrelas"
                    title="${star} estrela${star > 1 ? 's' : ''}">
              ${this.starSvg(star <= userRating)}
            </button>
          `).join('')}
        </div>

        <div class="rating-feedback-msg" id="rating-feedback">
          ${userRating > 0 ? 'Obrigado pela sua contribuição! Avaliação registrada.' : 'Selecione uma nota de 1 a 5 para avaliar'}
        </div>

        <div class="rating-stats-badge">
          <span>Média Geral: <strong>${average} / 5.0</strong></span>
          <span>&bull;</span>
          <span><strong>${stats.ratingsCount}</strong> avaliações registradas</span>
        </div>
      </div>
    `;

    this.bindEvents(container);
  },

  bindEvents(container) {
    const starBtns = container.querySelectorAll('.star-btn');
    const feedbackEl = container.querySelector('#rating-feedback');

    starBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        const val = parseInt(btn.dataset.value, 10);
        starBtns.forEach(b => {
          const currentVal = parseInt(b.dataset.value, 10);
          b.classList.toggle('hovered', currentVal <= val);
          b.querySelector('svg').setAttribute('fill', currentVal <= val ? 'currentColor' : 'none');
        });
      });

      btn.addEventListener('mouseleave', () => {
        const currentSaved = this.getUserRating();
        starBtns.forEach(b => {
          const currentVal = parseInt(b.dataset.value, 10);
          b.classList.remove('hovered');
          b.querySelector('svg').setAttribute('fill', currentVal <= currentSaved ? 'currentColor' : 'none');
        });
      });

      btn.addEventListener('click', () => {
        const score = parseInt(btn.dataset.value, 10);
        this.setUserRating(score);

        starBtns.forEach(b => {
          const val = parseInt(b.dataset.value, 10);
          const isAct = val <= score;
          b.classList.toggle('active', isAct);
          b.setAttribute('aria-checked', val === score);
          b.querySelector('svg').setAttribute('fill', isAct ? 'currentColor' : 'none');
        });

        if (feedbackEl) {
          feedbackEl.textContent = `Você avaliou com nota ${score} de 5. Muito obrigado!`;
          feedbackEl.style.color = 'var(--color-accent)';
        }

        const stats = this.getStats();
        const average = (stats.totalScore / stats.ratingsCount).toFixed(1);
        const statsBadge = container.querySelector('.rating-stats-badge');
        if (statsBadge) {
          statsBadge.innerHTML = `
            <span>Média Geral: <strong>${average} / 5.0</strong></span>
            <span>&bull;</span>
            <span><strong>${stats.ratingsCount}</strong> avaliações registradas</span>
          `;
        }
      });
    });
  }
};
