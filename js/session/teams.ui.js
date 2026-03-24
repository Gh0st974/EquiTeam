// 📄 Fichier : js/session/teams.ui.js
// 🎯 Rôle : Affichage des équipes générées et actions post-génération

const TeamsUI = (() => {

  // ── Afficher les équipes ───────────────────────────────────────
  function render(session) {
    const container = document.getElementById('session-result-content');

    container.innerHTML = `
      <div class="session-meta card">
        <p>📅 Séance : <strong>${session.groupName}</strong> — <strong>${session.activityName}</strong></p>
        <p>👥 ${session.teams.reduce((a,t) => a + t.members.length, 0)} élèves répartis en ${session.nbTeams} équipes</p>
        ${session.absentIds.length ? `<p class="muted">Absents : ${session.absentIds.length}</p>` : ''}
      </div>

      <div class="teams-grid">
        ${session.teams.map(t => renderTeamCard(t)).join('')}
      </div>

      <div class="session-actions">
        <button class="btn btn-secondary" id="btn-regenerate">🔄 Régénérer</button>
        <button class="btn btn-primary"   id="btn-save-session">💾 Sauvegarder</button>
        <button class="btn btn-danger"    id="btn-cancel-session">✖ Annuler</button>
      </div>
    `;

    bindActions();
  }

  // ── Carte d'une équipe ────────────────────────────────────────
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
              <span class="member-score">${Math.round(m._score * 100)}%</span>
            </li>
          `).join('')}
        </ul>
        <div class="team-count">${team.members.length} élève(s)</div>
      </div>
    `;
  }

  // ── Bind des boutons d'action ─────────────────────────────────
  function bindActions() {
    document.getElementById('btn-regenerate').addEventListener('click', () => {
      const session = Session.regenerate();
      if (session) { render(session); UI.toast('Équipes régénérées 🔄'); }
    });

    document.getElementById('btn-save-session').addEventListener('click', () => {
      Session.save();
      UI.toast('Séance sauvegardée ✅');
      UI.showView('dashboard');
      DashboardUI.render();
    });

    document.getElementById('btn-cancel-session').addEventListener('click', () => {
      UI.confirm('Annuler cette séance sans sauvegarder ?', () => {
        Session.cancel();
        UI.showView('dashboard');
      });
    });
  }

  return { render };
})();
