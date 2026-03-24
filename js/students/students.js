// 📄 Fichier : js/students/students.js
// 🎯 Rôle : Logique métier des élèves — CRUD élèves et notes

const Students = (() => {

  // ── Récupérer tous les élèves d'un groupe ─────────────────────
  // Alias de getByGroup — requis par l'interface standard du module
  function getAll(groupId) {
    const group = Groups.getById(groupId);
    return group ? group.students : [];
  }

  // ── Récupérer un élève par son ID ─────────────────────────────
  function getById(groupId, studentId) {
    const group = Groups.getById(groupId);
    if (!group) return null;
    return group.students.find(s => s.id === studentId) || null;
  }

  // ── Ajouter un élève à un groupe ──────────────────────────────
  function add(groupId, firstname, lastname, gender = '') {
    const group = Groups.getById(groupId);
    if (!group) return null;

    // Anti-doublon prénom + nom
    const exists = group.students.some(
      s => s.firstname.toLowerCase() === firstname.toLowerCase() &&
           s.lastname.toLowerCase()  === lastname.toLowerCase()
    );
    if (exists) return 'duplicate';

    const student = {
      id:        Storage.generateId('stu'),
      firstname: firstname.trim(),
      lastname:  lastname.trim().toUpperCase(),
      gender:    gender || '',
      scores:    {},
      createdAt: new Date().toISOString()
    };

    group.students.push(student);
    Groups.saveStudents(groupId, group.students);
    return student;
  }

  // ── Mettre à jour un élève ────────────────────────────────────
  function update(groupId, studentId, fields) {
    const group = Groups.getById(groupId);
    if (!group) return null;
    const idx = group.students.findIndex(s => s.id === studentId);
    if (idx === -1) return null;
    group.students[idx] = { ...group.students[idx], ...fields };
    Groups.saveStudents(groupId, group.students);
    return group.students[idx];
  }

  // ── Supprimer un élève ────────────────────────────────────────
  function remove(groupId, studentId) {
    const group = Groups.getById(groupId);
    if (!group) return;
    group.students = group.students.filter(s => s.id !== studentId);
    Groups.saveStudents(groupId, group.students);
  }

  // ── Enregistrer les notes d'un élève pour une activité ────────
  // saveRatings(groupId, studentId, { activityId, criterionId, value })
  // ou saveRatings(groupId, studentId, ratingsMap) selon usage appelant
  function saveRatings(groupId, studentId, ratings) {
    const group = Groups.getById(groupId);
    if (!group) return null;
    const idx = group.students.findIndex(s => s.id === studentId);
    if (idx === -1) return null;

    // ratings = { activityId: { criterionId: value, ... }, ... }
    group.students[idx].scores = {
      ...group.students[idx].scores,
      ...ratings
    };
    Groups.saveStudents(groupId, group.students);
    return group.students[idx];
  }

  // ── Enregistrer un score unique (critère individuel) ──────────
  function setScore(groupId, studentId, activityId, criterionId, value) {
    const group = Groups.getById(groupId);
    if (!group) return;
    const student = group.students.find(s => s.id === studentId);
    if (!student) return;

    if (!student.scores[activityId]) student.scores[activityId] = {};
    student.scores[activityId][criterionId] = value;

    Groups.saveStudents(groupId, group.students);
  }

  // ── Alias rétrocompatibilité ───────────────────────────────────
  function getByGroup(groupId) { return getAll(groupId); }

  return {
    getAll,       // ← ajouté
    getById,      // ← ajouté
    add,
    update,
    remove,
    saveRatings,  // ← ajouté
    setScore,
    getByGroup
  };
})();
