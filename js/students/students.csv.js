// 📄 Fichier : js/students/students.csv.js
// 🎯 Rôle : Parsing, validation et import d'un fichier CSV d'élèves

const StudentsCSV = (() => {

  // ── Parser le contenu CSV ──────────────────────────────────────
  function parse(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return { error: 'Fichier vide ou sans données' };

    // Détecter le séparateur (, ou ;)
    const sep = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(sep).map(h => h.trim().toLowerCase());

    const idxFirstname = headers.indexOf('prenom');
    const idxLastname  = headers.indexOf('nom');
    const idxGender    = headers.indexOf('genre');

    if (idxFirstname === -1 || idxLastname === -1) {
      return { error: 'Colonnes "prenom" et "nom" requises' };
    }

    const students = [];
    const errors   = [];

    lines.slice(1).forEach((line, i) => {
      if (!line.trim()) return; // ligne vide ignorée
      const cols = line.split(sep).map(c => c.trim());
      const fn   = cols[idxFirstname] || '';
      const ln   = cols[idxLastname]  || '';
      const gn   = idxGender !== -1 ? (cols[idxGender] || '') : '';

      if (!fn || !ln) {
        errors.push(`Ligne ${i + 2} ignorée : prénom ou nom manquant`);
        return;
      }

      students.push({ firstname: fn, lastname: ln.toUpperCase(), gender: gn.toUpperCase() });
    });

    return { students, errors };
  }

  // ── Modale d'import CSV ────────────────────────────────────────
  function showImportModal(groupId, onDone) {
    UI.openModal(`
      <div class="modal-header"><h3>📥 Importer des élèves (CSV)</h3></div>
      <div class="modal-body">
        <p class="hint">Format attendu : <code>prenom,nom,genre</code></p>
        <p class="hint">Séparateur : virgule <strong>,</strong> ou point-virgule <strong>;</strong></p>
        <label>Fichier CSV
          <input id="csv-file-input" type="file" accept=".csv" class="input" />
        </label>
        <div id="csv-preview" class="csv-preview hidden"></div>
        <div id="csv-mode" class="hidden">
          <p><strong>Mode d'import :</strong></p>
          <label><input type="radio" name="csv-mode" value="merge" checked /> Fusionner (ajouter sans écraser)</label>
          <label><input type="radio" name="csv-mode" value="replace" /> Remplacer la liste existante</label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel">Annuler</button>
        <button class="btn btn-primary modal-confirm" id="csv-confirm-btn" disabled>Importer</button>
      </div>
    `, null); // on gère le confirm manuellement

    // Rebind le confirm après ouverture
    let parsedStudents = [];

    document.getElementById('csv-file-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = parse(ev.target.result);
        if (result.error) {
          UI.toast(result.error, 'error');
          return;
        }
        parsedStudents = result.students;
        showPreview(result);
        document.getElementById('csv-confirm-btn').disabled = false;
      };
      reader.readAsText(file, 'UTF-8');
    });

    document.getElementById('csv-confirm-btn').addEventListener('click', () => {
      const mode = document.querySelector('input[name="csv-mode"]:checked')?.value || 'merge';
      applyImport(groupId, parsedStudents, mode, onDone);
      UI.closeModal();
    });
  }

  // ── Aperçu des élèves détectés ─────────────────────────────────
  function showPreview(result) {
    const preview = document.getElementById('csv-preview');
    const mode    = document.getElementById('csv-mode');
    preview.classList.remove('hidden');
    mode.classList.remove('hidden');

    let html = `<p>✅ <strong>${result.students.length}</strong> élève(s) détecté(s)</p>`;
    if (result.errors.length) {
      html += `<p class="text-warning">⚠️ ${result.errors.length} ligne(s) ignorée(s)</p>`;
      html += `<ul>${result.errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
    }
    html += `<div class="csv-preview-list">
      ${result.students.slice(0, 5).map(s =>
        `<span>${s.firstname} ${s.lastname} ${s.gender ? '('+s.gender+')' : ''}</span>`
      ).join('')}
      ${result.students.length > 5 ? `<span>...et ${result.students.length - 5} autres</span>` : ''}
    </div>`;
    preview.innerHTML = html;
  }

  // ── Appliquer l'import ─────────────────────────────────────────
  function applyImport(groupId, newStudents, mode, onDone) {
    const group = Groups.getById(groupId);
    if (!group) return;

    let added = 0, skipped = 0;

    if (mode === 'replace') {
      // Remplacer : on recrée la liste
      group.students = newStudents.map(s => ({
        id:        Storage.generateId('stu'),
        firstname: s.firstname,
        lastname:  s.lastname,
        gender:    s.gender,
        scores:    {},
        createdAt: new Date().toISOString()
      }));
      added = newStudents.length;
    } else {
      // Fusionner : anti-doublon
      newStudents.forEach(s => {
        const exists = group.students.some(
          ex => ex.firstname.toLowerCase() === s.firstname.toLowerCase() &&
                ex.lastname.toLowerCase()  === s.lastname.toLowerCase()
        );
        if (exists) { skipped++; return; }
        group.students.push({
          id:        Storage.generateId('stu'),
          firstname: s.firstname,
          lastname:  s.lastname,
          gender:    s.gender,
          scores:    {},
          createdAt: new Date().toISOString()
        });
        added++;
      });
    }

    Groups.saveStudents(groupId, group.students);
    UI.toast(`✅ ${added} ajouté(s)${skipped ? `, ${skipped} doublon(s) ignoré(s)` : ''}`);
    if (onDone) onDone();
  }

  return { showImportModal };
})();
