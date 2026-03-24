// 📄 Fichier : js/history/history.ui.js
// 🎯 Rôle : Affichage de l'historique des séances

const HistoryUI = (() => {

  // ── Liste des séances ─────────────────────────────────────────
  function render() {
    const container = document.getElementById('history-content');
    const list = History.getAll();

    if (!list.length) {
      UI.empty(container, '📭 Aucune séance enregistrée.');
      return;
    }

    container.innerHTML = list.map(s => `
      <div class="card history-card" data-id="${s.id}">
        <div class="history-info">
          <h3>${s.activityName}</h3>
          <p>👥 ${s.groupName} — ${s.nbTeams} équipes</p>
          <p class="muted">📅 ${formatDate(s.date)}</p>
        </div>
        <div class="history-actions">
          <button class="btn btn-sm btn-secondary" data-action="view"   data-id="${s.id}">👁️</button>
          <button class="btn btn-sm btn-danger"    data-action="delete" data-id="${s.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      if (action === 'view')   renderDetail(id);
      if (action === 'delete') confirmDelete(id);
    });
  }

  // ── Détail d'une séance ───────────────────────────────────────
  function renderDetail(id) {
    const session   = History.getById(id);
    const container = document.getElementById('history-detail-content');
    if (!session) return;

    container.innerHTML = `
      <div class="session-meta card">
        <h3>${session.activityName}</h3>
        <p>👥 Groupe : <strong>${session.groupName}</strong></p>
        <p>📅 Date : <strong>${formatDate(session.date)}</strong></p>
        <p>🏷️ ${session.nbTeams} équipes — ${session.teams.reduce((a,t)=>a+t.members.length,0)} élèves</p>
      </div>
      <div class="teams-grid">
        ${session.teams.map(t => renderTeamCard(t)).join('')}
      </div>
    `;

    UI.showView('history-detail', true);
  }

  // ── Carte équipe (lecture seule) ──────────────────────────────
  function renderTeamCard(team) {
    return `
      <div class="team-card card">
        <div class="team-header">
          <h3>${team.name}</h3>
          <span class="team-score">Score moy. : ${team.avgScore}</span>
        </div>
        <ul class="team-members">
          ${team.members.map(m => `
            <li class="team-member">
              <span>${m.firstName} ${m.lastName}</span>
            </li>
          `).join('')}
        </ul>
        <div class="team-count">${team.members.length} élève(s)</div>
      </div>
    `;
  }

  // ── Confirmation suppression ──────────────────────────────────
  function confirmDelete(id) {
    UI.confirm('Supprimer cette séance de l\'historique ?', () => {
      History.remove(id);
      render();
      UI.toast('Séance supprimée', 'warning');
    });
  }

  // ── Format date lisible ───────────────────────────────────────
  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  return { render, renderDetail };
})();
