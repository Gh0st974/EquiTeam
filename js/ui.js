// 📄 Fichier : js/ui.js
// 🎯 Rôle : Helpers DOM globaux — navigation, toasts, modales, utilitaires

const UI = (() => {

  // ── Pile de navigation (historique des vues) ───────────────────
  const _history = [];

  // ── Navigation entre vues ──────────────────────────────────────
  function showView(viewId, pushHistory = false) {
    // Empile la vue courante si demandé
    if (pushHistory) {
      const current = document.querySelector('.view.active');
      if (current) {
        const currentId = current.id.replace('view-', '');
        _history.push(currentId);
      }
    }

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.add('active');

    // Bouton retour visible si historique non vide
    const btnBack = document.getElementById('btn-back');
    if (btnBack) btnBack.classList.toggle('hidden', _history.length === 0);

    // Nav active
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });
  }

  // ── Retour à la vue précédente ─────────────────────────────────
  function goBack() {
    if (_history.length === 0) return;
    const previous = _history.pop();

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${previous}`);
    if (target) target.classList.add('active');

    // Bouton retour visible si historique encore non vide
    const btnBack = document.getElementById('btn-back');
    if (btnBack) btnBack.classList.toggle('hidden', _history.length === 0);

    // Nav active
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === previous);
    });
  }

  // ── Toast ──────────────────────────────────────────────────────
  function toast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, CONFIG.TOAST_DURATION);
  }

  // ── Modale générique ───────────────────────────────────────────
  function openModal(htmlContent, onConfirm = null) {
    const overlay = document.getElementById('modal-overlay');
    const box     = document.getElementById('modal-box');
    box.innerHTML = htmlContent;
    overlay.classList.remove('hidden');

    // Bouton confirmer
    const btnConfirm = box.querySelector('.modal-confirm');
    if (btnConfirm && onConfirm) {
      btnConfirm.addEventListener('click', () => { onConfirm(); closeModal(); });
    }

    // Bouton annuler / fermer
    box.querySelectorAll('.modal-cancel, .modal-close').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });

    // Clic overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-box').innerHTML = '';
  }

  // ── Modale de confirmation simple ─────────────────────────────
  function confirm(message, onConfirm) {
    openModal(`
      <div class="modal-header"><h3>Confirmation</h3></div>
      <div class="modal-body"><p>${message}</p></div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel">Annuler</button>
        <button class="btn btn-danger modal-confirm">Confirmer</button>
      </div>
    `, onConfirm);
  }

  // ── Spinner de chargement ──────────────────────────────────────
  function spinner(container) {
    container.innerHTML = '<div class="spinner"></div>';
  }

  // ── Message vide ───────────────────────────────────────────────
  function empty(container, message = 'Aucune donnée') {
    container.innerHTML = `<div class="empty-state">${message}</div>`;
  }

  // ── Formatage date ─────────────────────────────────────────────
  function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  return {
    showView, goBack,                          // ← goBack ajouté
    toast, openModal, closeModal, confirm,
    spinner, empty, formatDate
  };
})();
