// 📄 Fichier : js/groups/groups.ui.js
// 🎯 Rôle : Affichage et interactions de la vue Groupes

const GroupsUI = (() => {

  // ── Rendu de la liste des groupes ─────────────────────────────
  function render() {
    const container = document.getElementById('groups-content');
    const groups = Groups.getAll();

    if (!groups.length) {
      UI.empty(container, '😕 Aucun groupe. Créez-en un !');
      return;
    }

    container.innerHTML = groups.map(g => `
      <div class="card group-card" data-id="${g.id}">
        <div class="card-info">
          <span class="group-type-badge badge-${g.type}">
            ${g.type === 'class' ? '🏫 Classe' : '🔀 Pool libre'}
          </span>
          <h3>${g.name}</h3>
          <p>${g.students.length} élève(s)</p>
        </div>
        <div class="card-actions">
          <button class="btn btn-sm btn-secondary" data-action="edit" data-id="${g.id}">✏️</button>
          <button class="btn btn-sm btn-danger"    data-action="delete" data-id="${g.id}">🗑️</button>
          <button class="btn btn-sm btn-primary"   data-action="open" data-id="${g.id}">Ouvrir →</button>
        </div>
      </div>
    `).join('');

    bindListEvents(container);
  }

  // ── Événements liste ───────────────────────────────────────────
  function bindListEvents(container) {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;

      if (action === 'open')   openDetail(id);
      if (action === 'edit')   showEditModal(id);
      if (action === 'delete') confirmDelete(id);
    });
  }

  // ── Modale création groupe ─────────────────────────────────────
  function showCreateModal() {
    UI.openModal(`
      <div class="modal-header"><h3>Nouveau groupe</h3></div>
      <div class="modal-body">
        <label>Nom du groupe
          <input id="modal-group-name" class="input" type="text" placeholder="Ex: 3ème B" />
        </label>
        <label>Type
          <select id="modal-group-type" class="input">
            <option value="class">🏫 Classe</option>
            <option value="free">🔀 Pool libre</option>
          </select>
        </label>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel">Annuler</button>
        <button class="btn btn-primary modal-confirm">Créer</button>
      </div>
    `, () => {
      const name = document.getElementById('modal-group-name').value.trim();
      const type = document.getElementById('modal-group-type').value;
      if (!name) { UI.toast('Nom requis', 'error'); return; }
      Groups.create(name, type);
      render();
      UI.toast('Groupe créé ✅');
    });
  }

  // ── Modale édition groupe ──────────────────────────────────────
  function showEditModal(id) {
    const g = Groups.getById(id);
    if (!g) return;
    UI.openModal(`
      <div class="modal-header"><h3>Modifier le groupe</h3></div>
      <div class="modal-body">
        <label>Nom
          <input id="modal-group-name" class="input" type="text" value="${g.name}" />
        </label>
        <label>Type
          <select id="modal-group-type" class="input">
            <option value="class"  ${g.type==='class' ?'selected':''}>🏫 Classe</option>
            <option value="free"   ${g.type==='free'  ?'selected':''}>🔀 Pool libre</option>
          </select>
        </label>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel">Annuler</button>
        <button class="btn btn-primary modal-confirm">Sauvegarder</button>
      </div>
    `, () => {
      const name = document.getElementById('modal-group-name').value.trim();
      const type = document.getElementById('modal-group-type').value;
      if (!name) { UI.toast('Nom requis', 'error'); return; }
      Groups.update(id, { name, type });
      render();
      UI.toast('Groupe modifié ✅');
    });
  }

  // ── Confirmation suppression ───────────────────────────────────
  function confirmDelete(id) {
    const g = Groups.getById(id);
    UI.confirm(`Supprimer le groupe "${g.name}" ?`, () => {
      Groups.remove(id);
      render();
      UI.toast('Groupe supprimé', 'warning');
    });
  }

  // ── Ouverture détail groupe ────────────────────────────────────
  function openDetail(id) {
    StudentsUI.renderGroupDetail(id);
    UI.showView('group-detail', true);
  }

  return { render, showCreateModal, openDetail };
})();
