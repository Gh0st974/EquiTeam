// 📄 Fichier : js/session/algo.js
// 🎯 Rôle : Algorithme de génération d'équipes équilibrées

const Algo = (() => {

  // ── Point d'entrée principal ───────────────────────────────────
  function generate(students, nbTeams, criteria) {
    if (!students.length || nbTeams < 2) return [];

    // Calculer le score normalisé de chaque élève
    const scored = students.map(s => ({
      ...s,
      _score: computeScore(s, criteria)
    }));

    // Trier par score décroissant
    scored.sort((a, b) => b._score - a._score);

    // Distribuer en serpentin pour équilibrer
    const teams = Array.from({ length: nbTeams }, (_, i) => ({
      id:       `team-${i + 1}`,
      name:     `Équipe ${i + 1}`,
      members:  [],
      avgScore: 0
    }));

    distributeSnake(scored, teams);
    teams.forEach(t => { t.avgScore = computeAvg(t.members); });

    return teams;
  }

  // ── Distribution en serpentin ──────────────────────────────────
  function distributeSnake(scored, teams) {
    const n = teams.length;
    let dir = 1;
    let idx = 0;

    scored.forEach((student, i) => {
      teams[idx].members.push(student);
      if (i % n === n - 1) dir *= -1;
      idx = Math.max(0, Math.min(n - 1, idx + dir));
    });
  }

  // ── Calculer le score composite d'un élève ────────────────────
  function computeScore(student, criteria) {
    if (!criteria || !criteria.length) return Math.random();

    let total  = 0;
    let weight = 0;

    criteria.forEach(c => {
      const val = student.ratings?.[c.id];
      if (val === undefined || val === null) return;

      const normalized = normalize(val, c);
      total  += normalized * (c.weight || 1);
      weight += (c.weight || 1);
    });

    return weight > 0 ? total / weight : Math.random();
  }

  // ── Normaliser une valeur entre 0 et 1 ────────────────────────
  function normalize(val, criterion) {
    if (criterion.type === CONFIG.CRITERIA_TYPES.NOTE) {
      const min = criterion.min ?? 1;
      const max = criterion.max ?? 5;
      return (parseFloat(val) - min) / (max - min) || 0;
    }
    if (criterion.type === CONFIG.CRITERIA_TYPES.BOOLEAN) {
      return val ? 1 : 0;
    }
    if (criterion.type === CONFIG.CRITERIA_TYPES.CATEGORY) {
      const values = criterion.values || [];
      const pos    = values.indexOf(val);
      return values.length > 1 ? pos / (values.length - 1) : 0.5;
    }
    return 0;
  }

  // ── Moyenne des scores d'une équipe ───────────────────────────
  function computeAvg(members) {
    if (!members.length) return 0;
    const sum = members.reduce((acc, m) => acc + (m._score || 0), 0);
    return Math.round((sum / members.length) * 100) / 100;
  }

  return { generate };
})();
