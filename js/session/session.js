// 📄 Fichier : js/session/session.js
// 🎯 Rôle : Logique métier de la gestion des séances

const Session = (() => {

  // ── État courant de la séance en cours ────────────────────────
  let current = null;

  // ── Démarrer une nouvelle séance ──────────────────────────────
  function start(groupId, activityId, nbTeams, absentIds = []) {
    const group    = Groups.getById(groupId);
    const activity = Activities.getById(activityId);
    if (!group || !activity) return null;

    const presentStudents = group.students.filter(
      s => !absentIds.includes(s.id)
    );

    const teams = Algo.generate(presentStudents, nbTeams, activity.criteria);

    current = {
      id:         Storage.uid(),
      date:       new Date().toISOString(),
      groupId,
      groupName:  group.name,
      activityId,
      activityName: activity.name,
      nbTeams,
      absentIds,
      teams
    };

    return current;
  }

  // ── Régénérer les équipes (mêmes paramètres) ──────────────────
  function regenerate() {
    if (!current) return null;
    return start(
      current.groupId,
      current.activityId,
      current.nbTeams,
      current.absentIds
    );
  }

  // ── Sauvegarder la séance dans l'historique ───────────────────
  function save() {
    if (!current) return false;
    History.add(current);
    current = null;
    return true;
  }

  // ── Annuler la séance en cours ────────────────────────────────
  function cancel() {
    current = null;
  }

  // ── Lire la séance courante ───────────────────────────────────
  function getCurrent() {
    return current;
  }

  return { start, regenerate, save, cancel, getCurrent };
})();
