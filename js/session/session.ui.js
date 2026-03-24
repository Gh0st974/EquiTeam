// 📄 Fichier : js/session/session.ui.js
// 🎯 Rôle : Interface du formulaire de configuration d'une séance

const SessionUI = (() => {

  // ── Afficher le formulaire de configuration ───────────────────
  function renderForm() {
    const container  = document.getElementById('session-form-content');
    const groups     = Groups.getAll();
    const activities = Activities.getAll();

    if (!groups.length) {
      UI.empty(container, '⚠️ Créez d\'abord un groupe avant de lancer une séance.');
      return;
    }
    if (!activities.length) {
      UI.empty(container, '⚠️ Créez d\'abord une activité avant de lancer une séance.');
      return;
    }

    container.innerHTML = `
      <div class="session-form card">

        <div class="form-section">
          <label class="form-label">Groupe
            <select id="sess-group" class="input">
              ${groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
            </select>
          </label>
        </div>

        <div class="form-section">
          <label class="form-label">Activité
            <select id="sess-activity" class="input">
              ${activities.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
            </select>
          </label>
        </div>

        <div class="form-section">
          <label class="form-label">Nombre d'équipes
            <input id="sess-nb-teams" class="input" type="number" min="2" max="20" value="4" />
          </label>
        </div>

        <div class="form-section">
          <h3 class="form-subtitle">Élèves absents</h3>
          <div id="absent-list" class="absent-grid"></div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary btn-full" id="btn-generate">⚡ Générer les équipes</button>
        </div>

      </div>
    `;

    // Charger les élèves du groupe sélectionné
    loadAbsentList();
    document.getElementById('sess-group').addEventListener('change', loadAbsentList);

    // Générer
    document.getElementById('btn-generate').addEventListener('click', handleGenerate);
  }

  // ── Charger la liste des absents ──────────────────────────────
  function loadAbsentList() {
    const groupId   = document.getElementById('sess-group').value;
    const group     = Groups.getById(groupId);
    const container = document.getElementById('absent-list');

    if (!group || !group.students || !group.students.length) {
      container.innerHTML = '<p class="muted">Aucun élève dans ce groupe.</p>';
      return;
    }

    container.innerHTML = group.students.map(s => `
      <label class="absent-item">
        <input type="checkbox" class="absent-check" value="${s.id}" />
        ${s.firstName} ${s.lastName}
      </label>
    `).join('');
  }

  // ── Lancer la génération ──────────────────────────────────────
  function handleGenerate() {
    const groupId    = document.getElementById('sess-group').value;
    const activityId = document.getElementById('sess-activity').value;
    const nbTeams    = parseInt(document.getElementById('sess-nb-teams').value) || 4;
    const absentIds  = [...document.querySelectorAll('.absent-check:checked')]
      .map(el => el.value);

    const session = Session.start(groupId, activityId, nbTeams, absentIds);
    if (!session) { UI.toast('Erreur lors de la génération', 'error'); return; }
    if (!session.teams.length) { UI.toast('Pas assez d\'élèves présents', 'error'); return; }

    UI.showView('session-result', true);
    TeamsUI.render(session);
  }

  return { renderForm };
})();
