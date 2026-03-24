// 📄 Fichier : js/dashboard/dashboard.ui.js
// 🎯 Rôle : Affichage du tableau de bord (stats groupes, élèves, séances)

const DashboardUI = (() => {

  // ── Rendu principal du dashboard ──────────────────────────────
  function render() {
    const container = document.getElementById('dashboard-content');
    if (!container) return;

    const groups  = Groups.getAll();
    const history = History.getAll();
    const totalStudents = groups.reduce((sum, g) => {
      return sum + Students.getAll(g.id).length;
    }, 0);

    container.innerHTML = `
      <div class="dashboard-stats">

        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">${groups.length}</div>
          <div class="stat-label">Groupe${groups.length > 1 ? 's' : ''}</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🧑‍🎓</div>
          <div class="stat-value">${totalStudents}</div>
          <div class="stat-label">Élève${totalStudents > 1 ? 's' : ''}</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-value">${history.length}</div>
          <div class="stat-label">Séance${history.length > 1 ? 's' : ''}</div>
        </div>

      </div>

      ${_renderRecentSessions(history)}
    `;
  }

  // ── Bloc dernières séances ────────────────────────────────────
  function _renderRecentSessions(history) {
    if (history.length === 0) {
      return `<p class="empty-msg">Aucune séance enregistrée pour l'instant.<br>Lancez votre première séance ⚡</p>`;
    }

    // Les 3 dernières séances, les plus récentes en premier
    const recent = [...history]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    const items = recent.map(s => `
      <div class="recent-session-item">
        <div class="recent-session-info">
          <span class="recent-session-name">${s.groupName || '—'} · ${s.activityName || '—'}</span>
          <span class="recent-session-date">${_formatDate(s.date)}</span>
        </div>
        <span class="recent-session-teams">${s.teams ? s.teams.length : 0} équipes</span>
      </div>
    `).join('');

    return `
      <div class="dashboard-recent">
        <h3 class="section-title">Dernières séances</h3>
        <div class="recent-sessions-list">${items}</div>
      </div>
    `;
  }

  // ── Formater une date ISO en français ─────────────────────────
  function _formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  return { render };

})();
