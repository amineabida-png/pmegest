-- ═══════════════════════════════════════════════════════════════
-- MarocBiz ERP — Schéma complet SQLite
-- Conforme CGI Maroc, LF 2026, Code du Travail Loi 65-99
-- ═══════════════════════════════════════════════════════════════
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  company TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  plan TEXT DEFAULT 'starter',
  expires_at TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  last_login TEXT
);

CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  nom TEXT NOT NULL,
  forme_juridique TEXT DEFAULT 'SARL',
  ice TEXT DEFAULT '',
  if_num TEXT DEFAULT '',
  rc TEXT DEFAULT '',
  patente TEXT DEFAULT '',
  cnss_num TEXT DEFAULT '',
  adresse TEXT DEFAULT '',
  ville TEXT DEFAULT '',
  code_postal TEXT DEFAULT '',
  pays TEXT DEFAULT 'Maroc',
  tel TEXT DEFAULT '',
  email TEXT DEFAULT '',
  site_web TEXT DEFAULT '',
  capital REAL DEFAULT 0,
  activite TEXT DEFAULT '',
  tva_regime TEXT DEFAULT 'encaissement',
  devise TEXT DEFAULT 'MAD',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  company_id INTEGER,
  type TEXT DEFAULT 'entreprise',
  nom TEXT NOT NULL,
  prenom TEXT DEFAULT '',
  ice TEXT DEFAULT '',
  if_num TEXT DEFAULT '',
  rc TEXT DEFAULT '',
  adresse TEXT DEFAULT '',
  ville TEXT DEFAULT '',
  pays TEXT DEFAULT 'Maroc',
  tel TEXT DEFAULT '',
  email TEXT DEFAULT '',
  delai_paiement INTEGER DEFAULT 30,
  taux_remise REAL DEFAULT 0,
  solde REAL DEFAULT 0,
  notes TEXT DEFAULT '',
  actif INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fournisseurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  company_id INTEGER,
  nom TEXT NOT NULL,
  ice TEXT DEFAULT '',
  if_num TEXT DEFAULT '',
  rc TEXT DEFAULT '',
  adresse TEXT DEFAULT '',
  ville TEXT DEFAULT '',
  pays TEXT DEFAULT 'Maroc',
  tel TEXT DEFAULT '',
  email TEXT DEFAULT '',
  delai_paiement INTEGER DEFAULT 30,
  solde REAL DEFAULT 0,
  notes TEXT DEFAULT '',
  actif INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  company_id INTEGER,
  code TEXT NOT NULL,
  designation TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT DEFAULT 'produit',
  categorie TEXT DEFAULT '',
  unite TEXT DEFAULT 'piece',
  prix_vente_ht REAL DEFAULT 0,
  prix_achat_ht REAL DEFAULT 0,
  taux_tva REAL DEFAULT 20,
  stock_actuel REAL DEFAULT 0,
  stock_min REAL DEFAULT 0,
  depot TEXT DEFAULT 'principal',
  actif INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  account_id INTEGER NOT NULL,
  company_id INTEGER,
  type TEXT NOT NULL,
  statut TEXT DEFAULT 'brouillon',
  numero TEXT NOT NULL,
  date_doc TEXT NOT NULL,
  date_echeance TEXT DEFAULT '',
  client_id INTEGER,
  fournisseur_id INTEGER,
  ref_client TEXT DEFAULT '',
  taux_remise_global REAL DEFAULT 0,
  total_ht REAL DEFAULT 0,
  total_remise REAL DEFAULT 0,
  base_tva_7 REAL DEFAULT 0,
  base_tva_10 REAL DEFAULT 0,
  base_tva_14 REAL DEFAULT 0,
  base_tva_20 REAL DEFAULT 0,
  montant_tva_7 REAL DEFAULT 0,
  montant_tva_10 REAL DEFAULT 0,
  montant_tva_14 REAL DEFAULT 0,
  montant_tva_20 REAL DEFAULT 0,
  total_tva REAL DEFAULT 0,
  total_ttc REAL DEFAULT 0,
  montant_paye REAL DEFAULT 0,
  reste_payer REAL DEFAULT 0,
  mode_paiement TEXT DEFAULT 'virement',
  notes TEXT DEFAULT '',
  conditions TEXT DEFAULT 'Paiement à 30 jours. Tout retard de paiement entraîne des pénalités conformément à la loi.',
  doc_lie_id TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_lignes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id TEXT NOT NULL,
  account_id INTEGER NOT NULL,
  article_id INTEGER,
  code TEXT DEFAULT '',
  designation TEXT NOT NULL,
  quantite REAL DEFAULT 1,
  unite TEXT DEFAULT 'piece',
  prix_unitaire_ht REAL DEFAULT 0,
  taux_remise REAL DEFAULT 0,
  montant_remise REAL DEFAULT 0,
  montant_ht REAL DEFAULT 0,
  taux_tva REAL DEFAULT 20,
  montant_tva REAL DEFAULT 0,
  montant_ttc REAL DEFAULT 0,
  ordre INTEGER DEFAULT 0,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS paiements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  document_id TEXT,
  type TEXT DEFAULT 'encaissement',
  mode TEXT DEFAULT 'virement',
  montant REAL NOT NULL,
  date_paiement TEXT NOT NULL,
  reference TEXT DEFAULT '',
  banque TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  company_id INTEGER,
  matricule TEXT NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  cin TEXT DEFAULT '',
  cnss_num TEXT DEFAULT '',
  date_naissance TEXT DEFAULT '',
  nationalite TEXT DEFAULT 'Marocaine',
  adresse TEXT DEFAULT '',
  ville TEXT DEFAULT '',
  tel TEXT DEFAULT '',
  email TEXT DEFAULT '',
  poste TEXT NOT NULL,
  departement TEXT DEFAULT '',
  type_contrat TEXT DEFAULT 'CDI',
  date_embauche TEXT NOT NULL,
  date_fin_contrat TEXT DEFAULT '',
  salaire_base REAL NOT NULL,
  prime_transport REAL DEFAULT 0,
  prime_panier REAL DEFAULT 0,
  nb_personnes_charge INTEGER DEFAULT 0,
  rib TEXT DEFAULT '',
  banque TEXT DEFAULT '',
  statut TEXT DEFAULT 'actif',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bulletins (
  id TEXT PRIMARY KEY,
  account_id INTEGER NOT NULL,
  company_id INTEGER,
  employe_id INTEGER NOT NULL,
  periode_mois INTEGER NOT NULL,
  periode_annee INTEGER NOT NULL,
  salaire_base REAL NOT NULL,
  prime_anciennete REAL DEFAULT 0,
  taux_anciennete REAL DEFAULT 0,
  prime_transport REAL DEFAULT 0,
  prime_panier REAL DEFAULT 0,
  heures_sup_25 REAL DEFAULT 0,
  montant_hs_25 REAL DEFAULT 0,
  heures_sup_50 REAL DEFAULT 0,
  montant_hs_50 REAL DEFAULT 0,
  heures_sup_100 REAL DEFAULT 0,
  montant_hs_100 REAL DEFAULT 0,
  autres_primes REAL DEFAULT 0,
  total_brut REAL NOT NULL,
  salaire_brut_imposable REAL NOT NULL,
  cotisation_cnss REAL NOT NULL,
  cotisation_amo REAL NOT NULL,
  cotisation_ipe REAL NOT NULL,
  frais_professionnels REAL NOT NULL,
  rni_mensuel REAL NOT NULL,
  rni_annuel REAL NOT NULL,
  ir_brut_annuel REAL NOT NULL,
  deduction_famille REAL NOT NULL,
  ir_net_annuel REAL NOT NULL,
  ir_net_mensuel REAL NOT NULL,
  total_retenues REAL NOT NULL,
  net_a_payer REAL NOT NULL,
  cnss_patronale REAL DEFAULT 0,
  amo_patronale REAL DEFAULT 0,
  prestations_fam REAL DEFAULT 0,
  tfp REAL DEFAULT 0,
  total_charge_patronale REAL DEFAULT 0,
  cout_total_employeur REAL DEFAULT 0,
  statut TEXT DEFAULT 'brouillon',
  date_paiement TEXT DEFAULT '',
  mode_paiement TEXT DEFAULT 'virement',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (employe_id) REFERENCES employes(id)
);

CREATE TABLE IF NOT EXISTS conges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  employe_id INTEGER NOT NULL,
  type TEXT DEFAULT 'conge_annuel',
  date_debut TEXT NOT NULL,
  date_fin TEXT NOT NULL,
  nb_jours INTEGER NOT NULL,
  statut TEXT DEFAULT 'en_attente',
  motif TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stock_mouvements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  article_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  quantite REAL NOT NULL,
  prix_unitaire REAL DEFAULT 0,
  montant REAL DEFAULT 0,
  document_id TEXT DEFAULT '',
  depot TEXT DEFAULT 'principal',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sequences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  company_id INTEGER DEFAULT 0,
  type TEXT NOT NULL,
  annee INTEGER NOT NULL,
  derniere_valeur INTEGER DEFAULT 0,
  UNIQUE(account_id, company_id, type, annee)
);

CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  type TEXT DEFAULT 'info',
  titre TEXT NOT NULL,
  message TEXT DEFAULT '',
  module TEXT DEFAULT '',
  lu INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trial_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  societe TEXT NOT NULL,
  statut TEXT DEFAULT 'en_attente',
  created_at TEXT DEFAULT (datetime('now'))
);
