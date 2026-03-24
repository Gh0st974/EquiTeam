// 📄 Fichier : js/app.js
// 🎯 Rôle : Point d'entrée principal — initialisation et routage des vues

document.addEventListener('DOMContentLoaded', () => {

  // ── Enregistrement du Service Worker (PWA) ────────────────────
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .catch(err => console.warn('SW non enregistré :', err));
  }

  // ── Initialisation des vues ───────────────────────────────────
  DashboardUI.render();

  // ── Navigation principale ─────────────────────────────────────
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      UI.showView(view);
      renderView(view);
    });
  });

  // ── Bouton retour ─────────────────────────────────────────────
  document.getElementById('btn-back').addEventListener('click', () => {
    UI.goBack();
  });

  // ── Bouton nouvelle séance (dashboard) ───────────────────────
  document.getElementById('btn-new-session').addEventListener('click', () => {
    UI.showView('session-form', true);
    SessionUI.renderForm();
  });

  // ── Bouton nouveau groupe ─────────────────────────────────────
  document.getElementById('btn-new-group').addEventListener('click', () => {
    GroupsUI.showCreateModal();
  });

  // ── Bouton nouvelle activité ──────────────────────────────────
  document.getElementById('btn-new-activity').addEventListener('click', () => {
    ActivitiesUI.showCreateModal();
  });

  // ── Dispatcher de rendu par vue ───────────────────────────────
  function renderView(view) {
    switch (view) {
      case 'dashboard':  DashboardUI.render();   break;
      case 'groups':     GroupsUI.render();       break;
      case 'activities': ActivitiesUI.render();   break;
      case 'history':    HistoryUI.render();      break;
    }
  }

});
