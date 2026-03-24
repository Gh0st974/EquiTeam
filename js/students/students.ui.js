// 📄 Fichier : js/students/students.ui.js
// 🎯 Rôle : Affichage et interactions de la vue détail d'un groupe (élèves + notes)

const StudentsUI = (() => {

  let _currentGroupId   = null;
  let _currentActivityId = null;

  // ── Rendu principal de la vue détail ──────────────────────────
  function renderGroupDetail(groupId) {
    _currentGroupId = groupId;
    const group = Groups.getById(groupId);
    if (!group) return;

    const container = document.getElementById('group-detail-content');
    const activities = Activities.getAll();

    container.innerHTML = `
      <div class="view-header">
        <h2>${group.name}</h2>
        <span class="badge badge-${group.type}">${group.type === 'class' ? '🏫 Classe' : '🔀 Pool'}</span>
      </div>

      <!-- Actions élèves -->
      <div class="action-bar">
        <button class="btn btn-primary" id="btn-add-student">➕ Ajouter élève</button>
        <button class="btn btn-secondary" id="btn-import-csv">📥 Import CSV</button>
      </div>

      <!-- Sélecteur activité pour les notes -->
      ${activities.length ? `
        <div class="activity-selector">
          <label>Notes pour l'activité :
            <select id="activity-select" class="input">
              <option value="">-- Aucune --</option>
              ${activities.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
            </select>
          </label>
        </div>
      ` : ''}

      <!-- Liste élèves -->
      <div id="students-list"></div>
    `;

    renderStudentsList(group, null);
    bindDetailEvents(group, activities);
  }

  // ── Rendu de la liste des élèves ──────────────────────────────
  function renderStudentsList(group, activityId) {
    const container = document.getElementById('students-list');
    const students  = group.students;
    const activity  = activityId ? Activities.getById(activityId) : null;

    if (!students.length) {
      UI.empty(container, '😕 Aucun élève dans ce groupe.');
      return;
    }

    container.innerHTML = students.map(s => `
      <div class="student-card" data-id="${s.id}">
        <div class="student-info">
          <span class="student-gender">${s.gender === 'M' ? '👦' : s.gender === 'F' ? '👧' : '🧑'}</span>
          <span class="student-name">${s.firstname} ${s.lastname}</span>
        </div>
        ${activity ? renderScoreInputs(s, activity) : ''}
        <div class="student-actions">
          <button class="btn btn-sm btn-secondary" data-action="edit-student" data-id="${s.id}">✏️</button>
          <button class="btn btn-sm btn-danger"    data-action="delete-student" data-id="${s.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    if (activity) bindScoreEvents(group.id, activityId);
    bindStudentCardEvents(group.id);
  }

  // ── Inputs de scores selon le type de critère ─────────────────
  function renderScoreInputs(student, activity) {
    return `<div class="score-inputs">
      ${activity.criteria.map(c => {
        const val = student.scores?.[activity.id]?.[c.id] ?? '';
        if (c.type === CONFIG.CRITERIA_TYPES.NOTE) {
          return `<label class="score-label">${c.name}
            <input class="input input-score" type="number"
              min="${c.min}" max="${c.max}" value="${val}"
              data-student="${student.id}" data-criterion="${c.id}" data-activity="${activity.id}" />
          </label>`;
        }
        if (c.type === CONFIG.CRITERIA_TYPES.CATEGORY) {
          return `<label class="score-label">${c.name}
            <select class="input input-score"
              data-student="${student.id}" data-criterion="${c.id}" data-activity="${activity.id}">
              <option value="">--</option>
              ${c.values.map(v => `<option value="${v}" ${val===v?'selected':''}>${v}</option>`).join('')}
            </select>
          </label>`;
        }
        if (c.type === CONFIG.CRITERIA_TYPES.BOOLEAN) {
          return `<label class="score-label score-bool">
            <input class="input-check" type="checkbox"
              ${val === true ? 'checked' : ''}
              data-student="${student.id}" data-criterion="${c.id}" data-activity="${activity.id}" />
            ${c.name}
          </label>`;
        }
        return '';
      }).join('')}
    </div>`;
  }

  // ── Bind événements scores ─────────────────────────────────────
  function bindScoreEvents(groupId, activityId) {
    document.querySelectorAll('.input-score, .input-check').forEach(input => {
      input.addEventListener('change', (e) => {
        const { student, criterion, activity } = e.target.dataset;
        let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        if (e.target.type === 'number') value = parseFloat(value);
        Students.setScore(groupId, student, activity, criterion, value);
      });
    });
  }

  // ── Bind actions élèves (edit/delete) ─────────────────────────
  function bindStudentCardEvents(groupId) {
    document.getElementById('students-list').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      if (action === 'edit-student')   showEditStudentModal(groupId, id);
      if (action === 'delete-student') confirmDeleteStudent(groupId, id);
    });
  }

  // ── Bind événements principaux de la vue ──────────────────────
  function bindDetailEvents(group, activities) {
    document.getElementById('btn-add-student').addEventListener('click', () => {
      showAddStudentModal(group.id);
    });

    document.getElementById('btn-import-csv').addEventListener('click', () => {
      StudentsCSV.showImportModal(group.id, () => renderGroupDetail(group.id));
    });

    const sel = document.getElementById('activity-select');
    if (sel) {
      sel.addEventListener('change', (e) => {
        _currentActivityId = e.target.value || null;
        renderStudentsList(Groups.getById(group.id), _currentActivityId);
      });
    }
  }

  // ── Modale ajout élève ─────────────────────────────────────────
  function showAddStudentModal(groupId) {
    UI.openModal(`
      <div class="modal-header"><h3>Ajouter un élève</h3></div>
      <div class="modal-body">
        <label>Prénom <input id="s-firstname" class="input" type="text" /></label>
        <label>Nom    <input id="s-lastname"  class="input" type="text" /></label>
        <label>Genre
          <select id="s-gender" class="input">
            <option value="">--</option>
            <option value="M">👦 Masculin</option>
            <option value="F">👧 Féminin</option>
          </select>
        </label>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel">Annuler</button>
        <button class="btn btn-primary modal-confirm">Ajouter</button>
      </div>
    `, () => {
      const fn = document.getElementById('s-firstname').value.trim();
      const ln = document.getElementById('s-lastname').value.trim();
      const gn = document.getElementById('s-gender').value;
      if (!fn || !ln) { UI.toast('Prénom et nom requis', 'error'); return; }
      const result = Students.add(groupId, fn, ln, gn);
      if (result === 'duplicate') { UI.toast('Élève déjà existant', 'error'); return; }
      renderGroupDetail(groupId);
      UI.toast('Élève ajouté ✅');
    });
  }

  // ── Modale édition élève ───────────────────────────────────────
  function showEditStudentModal(groupId, studentId) {
    const group   = Groups.getById(groupId);
    const student = group.students.find(s => s.id === studentId);
    if (!student) return;
    UI.openModal(`
      <div class="modal-header"><h3>Modifier l'élève</h3></div>
      <div class="modal-body">
        <label>Prénom <input id="s-firstname" class="input" type="text" value="${student.firstname}" /></label>
        <label>Nom    <input id="s-lastname"  class="input" type="text" value="${student.lastname}" /></label>
        <label>Genre
          <select id="s-gender" class="input">
            <option value=""  ${!student.gender     ?'selected':''}>--</option>
            <option value="M" ${student.gender==='M'?'selected':''}>👦 Masculin</option>
            <option value="F" ${student.gender==='F'?'selected':''}>👧 Féminin</option>
          </select>
        </label>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel">Annuler</button>
        <button class="btn btn-primary modal-confirm">Sauvegarder</button>
      </div>
    `, () => {
      const fn = document.getElementById('s-firstname').value.trim();
      const ln = document.getElementById('s-lastname').value.trim();
      const gn = document.getElementById('s-gender').value;
      if (!fn || !ln) { UI.toast('Prénom et nom requis', 'error'); return; }
      Students.update(groupId, studentId, { firstname: fn, lastname: ln.toUpperCase(), gender: gn });
      renderGroupDetail(groupId);
      UI.toast('Élève modifié ✅');
    });
  }

  // ── Confirmation suppression élève ────────────────────────────
  function confirmDeleteStudent(groupId, studentId) {
    const group   = Groups.getById(groupId);
    const student = group.students.find(s => s.id === studentId);
    UI.confirm(`Supprimer ${student.firstname} ${student.lastname} ?`, () => {
      Students.remove(groupId, studentId);
      renderGroupDetail(groupId);
      UI.toast('Élève supprimé', 'warning');
    });
  }

  return { renderGroupDetail };
})();
