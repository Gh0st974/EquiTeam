// 📄 Fichier : js/activities/activities.ui.js
// 🎯 Rôle : Affichage et interactions de la vue Activités et détail critères

const ActivitiesUI = (() => {

  // ── Liste des activités ────────────────────────────────────────
  function render() {
    const container = document.getElementById('activities-content');
    const list = Activities.getAll();
    if (!list.length) { UI.empty(container, '😕 Aucune activité.'); return; }

    container.innerHTML = list.map(a => `
      <div class="card activity-card" data-id="${a.id}">
        <div class="card-info">
          <h3>${a.name}</h3>
          <p>${a.criteria.length} critère(s)</p>
        </div>
        <div class="card-actions">
          <button class="btn btn-sm btn-secondary" data-action="edit"   data-id="${a.id}">✏️</button>
          <button class="btn btn-sm btn-danger"    data-action="delete" data-id="${a.id}">🗑️</button>
          <button class="btn btn-sm btn-primary"   data-action="open"   data-id="${a.id}">Ouvrir →</button>
        </div>
      </div>
    `).join('');

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      if (action === 'open')   renderDetail(id);
      if (action === 'edit')   showEditModal(id);
      if (action === 'delete') confirmDelete(id);
    });
  }

  // ── Détail d'une activité (critères) ──────────────────────────
  function renderDetail(activityId) {
    const activity = Activities.getById(activityId);
    if (!activity) return;

    const container = document.getElementById('activity-detail-content');
    container.innerHTML = `
      <div class="view-header">
        <h2>${activity.name}</h2>
      </div>
      <div class="action-bar">
        <button class="btn btn-primary" id="btn-add-criterion">➕ Ajouter critère</button>
      </div>
      <div id="criteria-list">
        ${renderCriteria(activity)}
      </div>
    `;

    UI.showView('activity-detail', true);
    bindDetailEvents(activity);
  }

  // ── Rendu des critères ─────────────────────────────────────────
  function renderCriteria(activity) {
    if (!activity.criteria.length) {
      return '<div class="empty-state">Aucun critère défini.</div>';
    }
    return activity.criteria.map(c => `
      <div class="criterion-card">
        <div class="criterion-info">
          <span class="criterion-type criterion-type-${c.type}">${typeLabel(c.type)}</span>
          <strong>${c.name}</strong>
          ${c.type === CONFIG.CRITERIA_TYPES.NOTE     ? `<span>(${c.min}–${c.max})</span>` : ''}
          ${c.type === CONFIG.CRITERIA_TYPES.CATEGORY ? `<span>${(c.values||[]).join(', ')}</span>` : ''}
          <span class="criterion-weight">Poids : ${c.weight}</span>
        </div>
        <div class="criterion-actions">
          <button class="btn btn-sm btn-secondary" data-action="edit-crit" data-id="${c.id}">✏️</button>
          <button class="btn btn-sm btn-danger"    data-action="del-crit"  data-id="${c.id}">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  // ── Label lisible du type ──────────────────────────────────────
  function typeLabel(type) {
    if (type === CONFIG.CRITERIA_TYPES.NOTE)     return '🔢 Note';
    if (type === CONFIG.CRITERIA_TYPES.CATEGORY) return '🏷️ Catégorie';
    if (type === CONFIG.CRITERIA_TYPES.BOOLEAN)  return '✅ Booléen';
    return type;
  }

  // ── Bind événements vue détail ─────────────────────────────────
  function bindDetailEvents(activity) {
    document.getElementById('btn-add-criterion').addEventListener('click', () => {
      showCriterionModal(activity.id, null);
    });

    document.getElementById('criteria-list').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      if (action === 'edit-crit') showCriterionModal(activity.id, id);
      if (action === 'del-crit')  confirmDeleteCriterion(activity.id, id);
    });
  }

  // ── Modale critère (création / édition) ───────────────────────
  function showCriterionModal(activityId, criterionId) {
    const activity  = Activities.getById(activityId);
    const criterion = criterionId
      ? activity.criteria.find(c => c.id === criterionId)
      : null;
    const isEdit = !!criterion;

    UI.openModal(`
      <div class="modal-header">
        <h3>${isEdit ? 'Modifier' : 'Ajouter'} un critère</h3>
      </div>
      <div class="modal-body">
        <label>Nom du critère
          <input id="crit-name" class="input" type="text" value="${criterion?.name || ''}" />
        </label>
        <label>Type
          <select id="crit-type" class="input" ${isEdit ? 'disabled' : ''}>
            <option value="note"     ${criterion?.type==='note'     ?'selected':''}>🔢 Note</option>
            <option value="category" ${criterion?.type==='category' ?'selected':''}>🏷️ Catégorie</option>
            <option value="boolean"  ${criterion?.type==='boolean'  ?'selected':''}>✅ Booléen</option>
          </select>
        </label>
        <div id="crit-extra"></div>
        <label>Poids (importance)
          <input id="crit-weight" class="input" type="number"
            min="0.1" max="5" step="0.1" value="${criterion?.weight || 1}" />
        </label>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel">Annuler</button>
        <button class="btn btn-primary" id="crit-confirm-btn">Sauvegarder</button>
      </div>
    `, null);

    // Champs dynamiques selon le type
    const typeSelect = document.getElementById('crit-type');
    renderCriterionExtra(typeSelect.value, criterion);
    if (!isEdit) {
      typeSelect.addEventListener('change', () => {
        renderCriterionExtra(typeSelect.value, null);
      });
    }

    // Confirm géré manuellement (pour éviter fermeture auto sur erreur)
    document.getElementById('crit-confirm-btn').addEventListener('click', () => {
      const name   = document.getElementById('crit-name').value.trim();
      const type   = document.getElementById('crit-type').value;
      const weight = parseFloat(document.getElementById('crit-weight').value) || 1;

      if (!name) { UI.toast('Nom requis', 'error'); return; }

      const extra = collectExtra(type);
      const data  = { name, type, weight, ...extra };

      if (isEdit) {
        Activities.updateCriterion(activityId, criterionId, data);
        UI.toast('Critère modifié ✅');
      } else {
        Activities.addCriterion(activityId, data);
        UI.toast('Critère ajouté ✅');
      }

      UI.closeModal();
      renderDetail(activityId);
    });
  }

  // ── Champs supplémentaires selon le type ──────────────────────
  function renderCriterionExtra(type, criterion) {
    const extra = document.getElementById('crit-extra');
    if (type === CONFIG.CRITERIA_TYPES.NOTE) {
      extra.innerHTML = `
        <label>Min
          <input id="crit-min" class="input" type="number" value="${criterion?.min ?? 1}" />
        </label>
        <label>Max
          <input id="crit-max" class="input" type="number" value="${criterion?.max ?? 5}" />
        </label>
      `;
    } else if (type === CONFIG.CRITERIA_TYPES.CATEGORY) {
      extra.innerHTML = `
        <label>Valeurs (séparées par des virgules)
          <input id="crit-values" class="input" type="text"
            value="${(criterion?.values || []).join(', ')}"
            placeholder="Ex: Débutant, Intermédiaire, Expert" />
        </label>
      `;
    } else {
      extra.innerHTML = '';
    }
  }

  // ── Collecter les champs extra ─────────────────────────────────
  function collectExtra(type) {
    if (type === CONFIG.CRITERIA_TYPES.NOTE) {
      return {
        min: parseFloat(document.getElementById('crit-min').value) || 1,
        max: parseFloat(document.getElementById('crit-max').value) || 5
      };
    }
    if (type === CONFIG.CRITERIA_TYPES.CATEGORY) {
      const raw = document.getElementById('crit-values').value;
      return { values: raw.split(',').map(v => v.trim()).filter(Boolean) };
    }
    return {};
  }

  // ── Modale création activité ───────────────────────────────────
  function showCreateModal() {
    UI.openModal(`
      <div class="modal-header"><h3>Nouvelle activité</h3></div>
      <div class="modal-body">
        <label>Nom
          <input id="act-name" class="input" type="text" placeholder="Ex: Football" />
        </label>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel">Annuler</button>
        <button class="btn btn-primary modal-confirm">Créer</button>
      </div>
    `, () => {
      const name = document.getElementById('act-name').value.trim();
      if (!name) { UI.toast('Nom requis', 'error'); return; }
      Activities.create(name);
      render();
      UI.toast('Activité créée ✅');
    });
  }

  // ── Modale édition activité ────────────────────────────────────
  function showEditModal(id) {
    const activity = Activities.getById(id);
    if (!activity) return;
    UI.openModal(`
      <div class="modal-header"><h3>Modifier l'activité</h3></div>
      <div class="modal-body">
        <label>Nom
          <input id="act-name" class="input" type="text" value="${activity.name}" />
        </label>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel">Annuler</button>
        <button class="btn btn-primary modal-confirm">Sauvegarder</button>
      </div>
    `, () => {
      const name = document.getElementById('act-name').value.trim();
      if (!name) { UI.toast('Nom requis', 'error'); return; }
      Activities.update(id, { name });
      render();
      UI.toast('Activité modifiée ✅');
    });
  }

  // ── Confirmation suppression activité ──────────────────────────
  function confirmDelete(id) {
    const activity = Activities.getById(id);
    UI.confirm(`Supprimer l'activité "${activity.name}" ?`, () => {
      Activities.remove(id);
      render();
      UI.toast('Activité supprimée', 'warning');
    });
  }

  // ── Confirmation suppression critère ──────────────────────────
  function confirmDeleteCriterion(activityId, criterionId) {
    UI.confirm('Supprimer ce critère ?', () => {
      Activities.removeCriterion(activityId, criterionId);
      renderDetail(activityId);
      UI.toast('Critère supprimé', 'warning');
    });
  }

  return { render, renderDetail, showCreateModal };
})();
