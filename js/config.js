// 📄 Fichier : js/config.js
// 🎯 Rôle : Constantes et paramètres globaux de l'application

const CONFIG = {
  APP_NAME: 'ÉquiTeam',
  VERSION: '1.0.0',

  // Clés localStorage
  STORAGE_KEYS: {
    GROUPS:     'equiteam_groups',
    ACTIVITIES: 'equiteam_activities',
    SESSIONS:   'equiteam_sessions',
    HISTORY:    'equiteam_history'       // ← AJOUT
  },

  // Types de critères disponibles
  CRITERIA_TYPES: {
    NOTE:     'note',
    CATEGORY: 'category',
    BOOLEAN:  'boolean'
  },

  // Types de groupes
  GROUP_TYPES: {
    CLASS: 'class',
    FREE:  'free'
  },

  // Nombre max d'options proposées par l'algo
  ALGO_MAX_OPTIONS: 3,

  // Nombre min/max d'élèves par équipe
  TEAM_MIN_PLAYERS: 2,
  TEAM_MAX_PLAYERS: 20,

  // Toast durée d'affichage (ms)
  TOAST_DURATION: 3000
};
