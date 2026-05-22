const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'PMEGEST_ERP_2026_SECRET';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'frontend/public')));

const db = new Database(path.join(DATA_DIR, 'pmegest.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');


// Add new columns if they don't exist (migration)
try { db.exec("ALTER TABLE employes ADD COLUMN indemnite_transport REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE employes ADD COLUMN indemnite_repas REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE employes ADD COLUMN nationalite TEXT DEFAULT 'Marocaine'"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN nb_jours_travailles REAL DEFAULT 26"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN heures_sup_25 REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN heures_sup_50 REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN prime_anciennete REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN taux_anciennete REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN autres_primes REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN indemnite_transport REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN ipe_salarie REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN frais_pro REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN taux_frais_pro REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN rni_mensuel REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN ir_brut REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN deduction_famille REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN cnss_patronal REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN amo_patronal REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN af_patronal REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN tfp_patronal REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE bulletins ADD COLUMN charge_patronale_total REAL DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE accounts ADD COLUMN company_logo TEXT DEFAULT ''"); } catch(e) {}
try { db.exec("ALTER TABLE accounts ADD COLUMN company_cachet TEXT DEFAULT ''"); } catch(e) {}
try { db.exec("ALTER TABLE accounts ADD COLUMN company_cnss TEXT DEFAULT ''"); } catch(e) {}
try { db.exec("ALTER TABLE accounts ADD COLUMN company_rib TEXT DEFAULT ''"); } catch(e) {}
try { db.exec("ALTER TABLE accounts ADD COLUMN company_banque TEXT DEFAULT ''"); } catch(e) {}
try { db.exec("ALTER TABLE accounts ADD COLUMN company_capital TEXT DEFAULT ''"); } catch(e) {}
try { db.exec("ALTER TABLE accounts ADD COLUMN company_forme_juridique TEXT DEFAULT ''"); } catch(e) {}


db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
    role TEXT DEFAULT 'client', company_name TEXT DEFAULT '',
    company_ice TEXT DEFAULT '', company_if TEXT DEFAULT '',
    company_rc TEXT DEFAULT '', company_patente TEXT DEFAULT '',
    company_cnss TEXT DEFAULT '', company_address TEXT DEFAULT '',
    company_city TEXT DEFAULT '', company_phone TEXT DEFAULT '',
    company_email TEXT DEFAULT '', company_logo TEXT DEFAULT '',
    company_cachet TEXT DEFAULT '', company_rib TEXT DEFAULT '',
    company_banque TEXT DEFAULT '', company_capital TEXT DEFAULT '',
    company_forme_juridique TEXT DEFAULT '',
    plan TEXT DEFAULT 'starter', expires_at TEXT,
    status TEXT DEFAULT 'active', created_at TEXT DEFAULT (datetime('now')), last_login TEXT
  );
  CREATE TABLE IF NOT EXISTS trial_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT, prenom TEXT, phone TEXT, email TEXT UNIQUE,
    societe TEXT, secteur TEXT, status TEXT DEFAULT 'en_attente',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL,
    type TEXT NOT NULL, raison_sociale TEXT NOT NULL,
    ice TEXT DEFAULT '', if_fiscal TEXT DEFAULT '', rc TEXT DEFAULT '',
    patente TEXT DEFAULT '', cnss TEXT DEFAULT '',
    adresse TEXT DEFAULT '', ville TEXT DEFAULT '', code_postal TEXT DEFAULT '',
    pays TEXT DEFAULT 'Maroc', tel TEXT DEFAULT '', fax TEXT DEFAULT '',
    email TEXT DEFAULT '', site_web TEXT DEFAULT '',
    contact_nom TEXT DEFAULT '', contact_tel TEXT DEFAULT '',
    regime_tva TEXT DEFAULT 'assujetti', plafond_credit REAL DEFAULT 0,
    solde REAL DEFAULT 0, delai_paiement INTEGER DEFAULT 30,
    notes TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL,
    code TEXT NOT NULL, designation TEXT NOT NULL, description TEXT DEFAULT '',
    type TEXT DEFAULT 'produit', categorie TEXT DEFAULT '', unite TEXT DEFAULT 'U',
    prix_achat REAL DEFAULT 0, prix_vente_ht REAL DEFAULT 0, taux_tva REAL DEFAULT 20,
    stock_actuel REAL DEFAULT 0, stock_min REAL DEFAULT 0, stock_max REAL DEFAULT 0,
    depot TEXT DEFAULT 'Principal', actif INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL,
    type TEXT NOT NULL, numero TEXT NOT NULL, date_doc TEXT NOT NULL,
    date_echeance TEXT, tiers_id INTEGER, tiers_nom TEXT DEFAULT '',
    tiers_ice TEXT DEFAULT '', tiers_if TEXT DEFAULT '', tiers_rc TEXT DEFAULT '',
    tiers_adresse TEXT DEFAULT '', tiers_ville TEXT DEFAULT '', tiers_tel TEXT DEFAULT '',
    statut TEXT DEFAULT 'brouillon', taux_remise_global REAL DEFAULT 0,
    total_ht REAL DEFAULT 0, total_tva REAL DEFAULT 0, total_ttc REAL DEFAULT 0,
    montant_paye REAL DEFAULT 0, mode_paiement TEXT DEFAULT 'virement',
    banque TEXT DEFAULT '', ref_externe TEXT DEFAULT '',
    objet TEXT DEFAULT '', conditions TEXT DEFAULT '', notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
  CREATE TABLE IF NOT EXISTS document_lignes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, document_id INTEGER NOT NULL,
    article_id INTEGER, designation TEXT NOT NULL, description TEXT DEFAULT '',
    unite TEXT DEFAULT 'U', quantite REAL DEFAULT 1,
    prix_unit_ht REAL DEFAULT 0, taux_remise REAL DEFAULT 0,
    taux_tva REAL DEFAULT 20, montant_ht REAL DEFAULT 0,
    montant_tva REAL DEFAULT 0, montant_ttc REAL DEFAULT 0, ordre INTEGER DEFAULT 0,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS numerotation (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL,
    type TEXT NOT NULL, annee INTEGER NOT NULL, dernier_numero INTEGER DEFAULT 0,
    prefixe TEXT DEFAULT '', UNIQUE(account_id,type,annee)
  );
  CREATE TABLE IF NOT EXISTS employes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL,
    matricule TEXT NOT NULL, nom TEXT NOT NULL, prenom TEXT NOT NULL,
    cin TEXT DEFAULT '', cnss_num TEXT DEFAULT '', cimr_num TEXT DEFAULT '',
    date_naissance TEXT DEFAULT '', lieu_naissance TEXT DEFAULT '',
    date_embauche TEXT NOT NULL, date_fin TEXT DEFAULT '',
    type_contrat TEXT DEFAULT 'CDI', poste TEXT DEFAULT '',
    departement TEXT DEFAULT '', niveau TEXT DEFAULT '',
    salaire_base REAL DEFAULT 0, nb_enfants INTEGER DEFAULT 0,
    conjoint INTEGER DEFAULT 0, situation_familiale TEXT DEFAULT 'celibataire',
    rib TEXT DEFAULT '', banque TEXT DEFAULT '',
    mode_paiement TEXT DEFAULT 'virement',
    adresse TEXT DEFAULT '', ville TEXT DEFAULT '',
    tel TEXT DEFAULT '', email TEXT DEFAULT '',
    statut TEXT DEFAULT 'actif', notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
  CREATE TABLE IF NOT EXISTS bulletins (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL,
    employe_id INTEGER NOT NULL, mois INTEGER NOT NULL, annee INTEGER NOT NULL,
    salaire_base REAL DEFAULT 0, nb_jours_travailles REAL DEFAULT 26,
    nb_jours_absence REAL DEFAULT 0, nb_heures_sup_25 REAL DEFAULT 0,
    nb_heures_sup_50 REAL DEFAULT 0, nb_heures_sup_100 REAL DEFAULT 0,
    prime_anciennete REAL DEFAULT 0, taux_anciennete REAL DEFAULT 0,
    annees_anciennete INTEGER DEFAULT 0,
    heures_sup_25_montant REAL DEFAULT 0, heures_sup_50_montant REAL DEFAULT 0,
    heures_sup_100_montant REAL DEFAULT 0, taux_horaire REAL DEFAULT 0,
    avantages_nature REAL DEFAULT 0, indemnite_transport REAL DEFAULT 0,
    indemnite_repas REAL DEFAULT 0, autres_primes REAL DEFAULT 0,
    salaire_brut REAL DEFAULT 0,
    cnss_base REAL DEFAULT 0, cnss_taux REAL DEFAULT 0.0448, cnss_salarie REAL DEFAULT 0,
    amo_base REAL DEFAULT 0, amo_taux REAL DEFAULT 0.0226, amo_salarie REAL DEFAULT 0,
    ipe_salarie REAL DEFAULT 0, total_cotisations REAL DEFAULT 0,
    rni_mensuel REAL DEFAULT 0, frais_pro REAL DEFAULT 0, taux_frais_pro REAL DEFAULT 0,
    base_ir REAL DEFAULT 0, ir_brut REAL DEFAULT 0,
    nb_personnes_charge INTEGER DEFAULT 0, deduction_famille REAL DEFAULT 0,
    ir_net REAL DEFAULT 0, total_retenues REAL DEFAULT 0,
    avances REAL DEFAULT 0, salaire_net REAL DEFAULT 0,
    cnss_patronal REAL DEFAULT 0, amo_patronal REAL DEFAULT 0,
    af_patronal REAL DEFAULT 0, tfp_patronal REAL DEFAULT 0,
    charge_patronale_total REAL DEFAULT 0,
    statut TEXT DEFAULT 'brouillon',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (employe_id) REFERENCES employes(id)
  );
  CREATE TABLE IF NOT EXISTS conges (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL,
    employe_id INTEGER NOT NULL, type TEXT DEFAULT 'annuel',
    date_debut TEXT NOT NULL, date_fin TEXT NOT NULL, nb_jours REAL DEFAULT 0,
    statut TEXT DEFAULT 'en_attente', motif TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
  CREATE TABLE IF NOT EXISTS tresorerie (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL,
    compte TEXT NOT NULL, type TEXT NOT NULL, date_op TEXT NOT NULL,
    libelle TEXT NOT NULL, montant REAL NOT NULL, reference TEXT DEFAULT '',
    tiers_id INTEGER, categorie TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
  CREATE TABLE IF NOT EXISTS stock_mouvements (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL, type TEXT NOT NULL,
    quantite REAL NOT NULL, stock_avant REAL DEFAULT 0, stock_apres REAL DEFAULT 0,
    reference TEXT DEFAULT '', motif TEXT DEFAULT '', depot TEXT DEFAULT 'Principal',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
  CREATE TABLE IF NOT EXISTS crm_prospects (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL,
    nom TEXT NOT NULL, societe TEXT DEFAULT '', tel TEXT DEFAULT '',
    email TEXT DEFAULT '', secteur TEXT DEFAULT '', valeur_estimee REAL DEFAULT 0,
    statut TEXT DEFAULT 'nouveau', probabilite INTEGER DEFAULT 20,
    date_relance TEXT, source TEXT DEFAULT '', notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
  CREATE TABLE IF NOT EXISTS alertes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL,
    type TEXT DEFAULT 'info', titre TEXT NOT NULL, message TEXT DEFAULT '',
    lu INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
  CREATE TABLE IF NOT EXISTS depenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL,
    date_dep TEXT NOT NULL, categorie TEXT NOT NULL, libelle TEXT NOT NULL,
    montant_ht REAL DEFAULT 0, taux_tva REAL DEFAULT 20, montant_ttc REAL DEFAULT 0,
    fournisseur TEXT DEFAULT '', reference TEXT DEFAULT '',
    mode_paiement TEXT DEFAULT 'virement', notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
  CREATE TABLE IF NOT EXISTS bon_commande_achat (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL,
    numero TEXT NOT NULL, date_doc TEXT NOT NULL, date_livraison TEXT,
    tiers_id INTEGER, tiers_nom TEXT DEFAULT '', statut TEXT DEFAULT 'en_attente',
    total_ht REAL DEFAULT 0, total_tva REAL DEFAULT 0, total_ttc REAL DEFAULT 0,
    notes TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
  CREATE TABLE IF NOT EXISTS maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER NOT NULL,
    type_bien TEXT DEFAULT 'vehicule', bien TEXT NOT NULL,
    type_maintenance TEXT DEFAULT 'preventive', date_maintenance TEXT NOT NULL,
    date_prochaine TEXT, description TEXT DEFAULT '',
    cout REAL DEFAULT 0, prestataire TEXT DEFAULT '',
    statut TEXT DEFAULT 'planifie', notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
`);

// RESET DB if requested
if (process.env.RESET_DB === 'true') {
  const tables = ['trial_requests','tiers','articles','documents','document_lignes','numerotation','employes','bulletins','conges','tresorerie','alertes','crm_prospects','mouvements_stock','ecritures','parametres'];
  tables.forEach(t => { try { db.prepare('DELETE FROM '+t).run(); } catch(e){} });
  console.log('🗑️ DB reset - all data cleared');
}

// SUPER ADMIN
if (!db.prepare("SELECT id FROM accounts WHERE role='super'").get()) {
  db.prepare("INSERT INTO accounts (name,email,password,role,company_name,plan,expires_at) VALUES (?,?,?,'super','PMEGest.ma','enterprise','2099-12-31')")
    .run('Super Admin','admin@pmegest.ma',bcrypt.hashSync('PMEGest2026@Admin',10));
}

// CONSTANTES LEGALES 2026
const L = {
  CNSS_SAL:0.0448, CNSS_PLAFOND:6000, CNSS_MAX:268.80,
  CNSS_PAT:0.0898, AF_PAT:0.0640, TFP_PAT:0.016,
  AMO_SAL:0.0226, AMO_PAT:0.0411, IPE_SAL:0.0019, IPE_PLAFOND:6000, IPE_MAX:11.40,
  FP_TAUX_BAS:0.35, FP_PLAFOND_BAS:2500, FP_SEUIL:6500,
  FP_TAUX_HAUT:0.25, FP_PLAFOND_HAUT:2916.00,
  // Bareme IR MENSUEL DGI (Art.73 CGI)
  IR_MENSUEL:[
    {min:0,      max:3333.33, taux:0,    ded:0},
    {min:3333.34,max:5000,    taux:0.10, ded:333.33},
    {min:5000.01,max:6666.67, taux:0.20, ded:833.33},
    {min:6666.68,max:8333.33, taux:0.30, ded:1499.99},
    {min:8333.34,max:15000,   taux:0.34, ded:1833.33},
    {min:15000.01,max:Infinity,taux:0.37,ded:2283.33}
  ],
  DEDfamille_mensuel:50, // 50 MAD/mois/personne (600/12)
  SMIG:3422, SMIG_HORAIRE:17.92,
  HS_25:1.25, HS_50:1.50, HS_100:2.00,
  ANCIENNETE:[
    {min:0,max:2,taux:0},{min:2,max:5,taux:0.05},
    {min:5,max:12,taux:0.10},{min:12,max:20,taux:0.15},
    {min:20,max:25,taux:0.20},{min:25,max:Infinity,taux:0.25}
  ],
  TVA:{normal:20,r14:14,r10:10,r7:7,zero:0},
  JOURS_FERIES:['01-01','01-11','05-01','07-30','08-14','08-20','08-21','11-06','11-18']
};

// MOTEUR PAIE LF 2026
function calculerBulletin(d) {
  const sb = d.salaire_base || 0;
  const th = Math.round(sb / 191.33 * 100) / 100;
  const annees = Math.floor((Date.now()-new Date(d.date_embauche||Date.now()))/(365.25*86400000));
  const anc = L.ANCIENNETE.find(t=>annees>=t.min&&annees<t.max)||L.ANCIENNETE[0];
  const panc = Math.round(sb*anc.taux*100)/100;
  const hs25_m = Math.round(th*(d.nb_heures_sup_25||0)*L.HS_25*100)/100;
  const hs50_m = Math.round(th*(d.nb_heures_sup_50||0)*L.HS_50*100)/100;
  const hs100_m = Math.round(th*(d.nb_heures_sup_100||0)*L.HS_100*100)/100;
  const brut = Math.round((sb+panc+hs25_m+hs50_m+hs100_m+(d.autres_primes||0)+(d.indemnite_transport||0)+(d.indemnite_repas||0)+(d.avantages_nature||0))*100)/100;
  // CNSS (plafonné 6000 MAD)
  const cnss_base = Math.min(brut, L.CNSS_PLAFOND);
  const cnss = Math.round(Math.min(cnss_base*L.CNSS_SAL, L.CNSS_MAX)*100)/100;
  // AMO (sans plafond)
  const amo = Math.round(brut*L.AMO_SAL*100)/100;
  // IPE (plafonné 6000 MAD - info seulement, non deduit du net)
  const ipe = Math.round(Math.min(Math.min(brut,L.IPE_PLAFOND)*L.IPE_SAL, L.IPE_MAX)*100)/100;
  const total_cot = Math.round((cnss+amo+ipe)*100)/100;
  // RNI = Brut - CNSS - AMO (IPE non deduit pour calcul IR)
  const rni_m = Math.round(Math.max(0,brut-cnss-amo)*100)/100;
  // Frais pro
  const taux_fp = rni_m<=L.FP_SEUIL ? L.FP_TAUX_BAS : L.FP_TAUX_HAUT;
  const plaf_fp = rni_m<=L.FP_SEUIL ? L.FP_PLAFOND_BAS : L.FP_PLAFOND_HAUT;
  const fp = Math.round(Math.min(rni_m*taux_fp, plaf_fp)*100)/100;
  // Base IR
  const base_ir = Math.round(Math.max(0,rni_m-fp)*100)/100;
  // IR brut bareme mensuel DGI
  const tr = L.IR_MENSUEL.find(t=>base_ir>=t.min&&base_ir<=t.max)||L.IR_MENSUEL[0];
  const ir_brut = tr.taux>0 ? Math.round((base_ir*tr.taux-tr.ded)*100)/100 : 0;
  // Deduction famille: 50 MAD/mois/personne
  const nb_pers = Math.min((d.conjoint?1:0)+Math.min(d.nb_enfants||0,6),7);
  const ded_fam = Math.round(nb_pers*L.DEDfamille_mensuel*100)/100;
  const ir_net = Math.round(Math.max(0,ir_brut-ded_fam)*100)/100;
  // Net = Brut - CNSS - AMO - IR (IPE non deduit du net a payer)
  const avances = d.avances || 0;
  const net = Math.round((brut-cnss-amo-ir_net-avances)*100)/100;
  const total_ret = Math.round((cnss+amo+ipe+ir_net)*100)/100;
  // Charges patronales
  const cnss_p = Math.round(Math.min(brut,L.CNSS_PLAFOND)*L.CNSS_PAT*100)/100;
  const amo_p = Math.round(brut*L.AMO_PAT*100)/100;
  const af_p = Math.round(brut*L.AF_PAT*100)/100;
  const tfp_p = Math.round(brut*L.TFP_PAT*100)/100;
  const cp = Math.round((cnss_p+amo_p+af_p+tfp_p)*100)/100;
  return {
    salaire_base:sb, taux_horaire:th,
    prime_anciennete:panc, taux_anciennete:anc.taux, annees_anciennete:annees,
    nb_heures_sup_25:d.nb_heures_sup_25||0, heures_sup_25_montant:hs25_m,
    nb_heures_sup_50:d.nb_heures_sup_50||0, heures_sup_50_montant:hs50_m,
    nb_heures_sup_100:d.nb_heures_sup_100||0, heures_sup_100_montant:hs100_m,
    avantages_nature:d.avantages_nature||0, indemnite_transport:d.indemnite_transport||0,
    indemnite_repas:d.indemnite_repas||0, autres_primes:d.autres_primes||0,
    salaire_brut:brut,
    cnss_base, cnss_taux:L.CNSS_SAL, cnss_salarie:cnss,
    amo_base:brut, amo_taux:L.AMO_SAL, amo_salarie:amo,
    ipe_salarie:ipe, total_cotisations:total_cot,
    rni_mensuel:rni_m, frais_pro:fp, taux_frais_pro:taux_fp,
    base_ir, ir_brut, nb_personnes_charge:nb_pers,
    deduction_famille:ded_fam, ir_net, total_retenues:total_ret,
    avances, salaire_net:net,
    cnss_patronal:cnss_p, amo_patronal:amo_p, af_patronal:af_p, tfp_patronal:tfp_p,
    charge_patronale_total:cp, cout_employeur:Math.round((brut+cp)*100)/100,
    smig_2026:L.SMIG
  };
}

function nextNumero(aid, type) {
  const y=new Date().getFullYear();
  const pfx={facture:'FA',devis:'DEV',bon_commande:'BC',bon_livraison:'BL',avoir:'AV',proforma:'PF',facture_achat:'ACH'}[type]||'DOC';
  db.prepare('INSERT OR IGNORE INTO numerotation (account_id,type,annee,dernier_numero,prefixe) VALUES (?,?,?,0,?)').run(aid,type,y,pfx);
  const r=db.prepare('UPDATE numerotation SET dernier_numero=dernier_numero+1 WHERE account_id=? AND type=? AND annee=? RETURNING dernier_numero,prefixe').get(aid,type,y);
  return r.prefixe+'-'+y+'-'+String(r.dernier_numero).padStart(4,'0');
}

function auth(req,res,next){
  const token=req.headers.authorization?.split(' ')[1];
  if(!token)return res.status(401).json({error:'Token manquant'});
  try{
    const dec=jwt.verify(token,JWT_SECRET);
    const acc=db.prepare('SELECT * FROM accounts WHERE id=?').get(dec.id);
    if(!acc||acc.status!=='active')return res.status(401).json({error:'Compte inactif'});
    if(acc.role!=='super'&&acc.plan!=='enterprise'&&acc.expires_at&&new Date(acc.expires_at)<new Date())
      return res.status(403).json({error:'Licence expiree',expired:true});
    req.account=acc;next();
  }catch(e){res.status(401).json({error:'Token invalide'});}
}
function superOnly(req,res,next){if(req.account.role!=='super')return res.status(403).json({error:'Acces refuse'});next();}

// ── AUTH ──────────────────────────────────────────────────────
app.post('/api/auth/login',(req,res)=>{
  const{email,password}=req.body;
  if(!email||!password)return res.status(400).json({error:'Email et mot de passe requis'});
  const acc=db.prepare('SELECT * FROM accounts WHERE email=?').get(email.toLowerCase().trim());
  if(!acc||!bcrypt.compareSync(password,acc.password))return res.status(401).json({error:'Email ou mot de passe incorrect'});
  if(acc.status!=='active')return res.status(403).json({error:'Compte suspendu'});
  if(acc.role!=='super'&&acc.plan!=='enterprise'&&acc.expires_at&&new Date(acc.expires_at)<new Date())
    return res.status(403).json({error:'Licence expiree',expired:true});
  db.prepare("UPDATE accounts SET last_login=datetime('now') WHERE id=?").run(acc.id);
  const token=jwt.sign({id:acc.id,role:acc.role},JWT_SECRET,{expiresIn:'30d'});
  const{password:_,...a}=acc;
  res.json({token,account:a,legal:L});
});
app.get('/api/auth/me',auth,(req,res)=>{const{password:_,...a}=req.account;res.json({account:a,legal:L});});
app.put('/api/auth/profile',auth,(req,res)=>{
  const d=req.body;
  const fields=['company_name','company_ice','company_if','company_rc','company_patente','company_cnss',
    'company_address','company_city','company_phone','company_email','company_logo','company_cachet',
    'company_rib','company_banque','company_capital','company_forme_juridique'];
  const sets=fields.map(f=>f+'=?').join(',');
  const vals=fields.map(f=>d[f]||'');
  db.prepare('UPDATE accounts SET '+sets+' WHERE id=?').run(...vals,req.account.id);
  res.json({success:true});
});

app.post('/api/trial',(req,res)=>{
  const{nom,prenom,phone,email,societe,secteur}=req.body;
  if(!nom||!prenom||!phone||!email||!societe)return res.status(400).json({error:'Tous les champs requis'});
  try{db.prepare('INSERT INTO trial_requests (nom,prenom,phone,email,societe,secteur) VALUES (?,?,?,?,?,?)').run(nom,prenom,phone,email.toLowerCase(),societe,secteur||'');res.json({success:true});}
  catch(e){res.status(400).json({error:'Email deja enregistre'});}
});

// ── TIERS ─────────────────────────────────────────────────────
app.get('/api/tiers',auth,(req,res)=>{
  const{type}=req.query;
  let q='SELECT * FROM tiers WHERE account_id=?';const p=[req.account.id];
  if(type){q+=' AND (type=? OR type="les_deux")';p.push(type);}
  q+=' ORDER BY raison_sociale';res.json(db.prepare(q).all(...p));
});
app.post('/api/tiers',auth,(req,res)=>{
  const d=req.body;if(!d.raison_sociale||!d.type)return res.status(400).json({error:'Raison sociale et type requis'});
  const r=db.prepare('INSERT INTO tiers (account_id,type,raison_sociale,ice,if_fiscal,rc,patente,cnss,adresse,ville,code_postal,pays,tel,fax,email,site_web,contact_nom,contact_tel,regime_tva,plafond_credit,delai_paiement,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(req.account.id,d.type,d.raison_sociale,d.ice||'',d.if_fiscal||'',d.rc||'',d.patente||'',d.cnss||'',d.adresse||'',d.ville||'',d.code_postal||'',d.pays||'Maroc',d.tel||'',d.fax||'',d.email||'',d.site_web||'',d.contact_nom||'',d.contact_tel||'',d.regime_tva||'assujetti',d.plafond_credit||0,d.delai_paiement||30,d.notes||'');
  res.json({success:true,id:r.lastInsertRowid});
});
app.put('/api/tiers/:id',auth,(req,res)=>{
  const d=req.body;
  db.prepare('UPDATE tiers SET type=?,raison_sociale=?,ice=?,if_fiscal=?,rc=?,patente=?,cnss=?,adresse=?,ville=?,code_postal=?,tel=?,fax=?,email=?,contact_nom=?,regime_tva=?,plafond_credit=?,delai_paiement=?,notes=? WHERE id=? AND account_id=?')
    .run(d.type,d.raison_sociale,d.ice||'',d.if_fiscal||'',d.rc||'',d.patente||'',d.cnss||'',d.adresse||'',d.ville||'',d.code_postal||'',d.tel||'',d.fax||'',d.email||'',d.contact_nom||'',d.regime_tva||'assujetti',d.plafond_credit||0,d.delai_paiement||30,d.notes||'',req.params.id,req.account.id);
  res.json({success:true});
});
app.delete('/api/tiers/:id',auth,(req,res)=>{db.prepare('DELETE FROM tiers WHERE id=? AND account_id=?').run(req.params.id,req.account.id);res.json({success:true});});

// ── ARTICLES ──────────────────────────────────────────────────
app.get('/api/articles',auth,(req,res)=>res.json(db.prepare('SELECT * FROM articles WHERE account_id=? AND actif=1 ORDER BY designation').all(req.account.id)));
app.post('/api/articles',auth,(req,res)=>{
  const d=req.body;if(!d.designation||!d.code)return res.status(400).json({error:'Code et designation requis'});
  const r=db.prepare('INSERT INTO articles (account_id,code,designation,description,type,categorie,unite,prix_achat,prix_vente_ht,taux_tva,stock_actuel,stock_min,stock_max,depot) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(req.account.id,d.code,d.designation,d.description||'',d.type||'produit',d.categorie||'',d.unite||'U',d.prix_achat||0,d.prix_vente_ht||0,d.taux_tva||20,d.stock_actuel||0,d.stock_min||0,d.stock_max||0,d.depot||'Principal');
  res.json({success:true,id:r.lastInsertRowid});
});
app.put('/api/articles/:id',auth,(req,res)=>{
  const d=req.body;
  db.prepare('UPDATE articles SET code=?,designation=?,description=?,type=?,categorie=?,unite=?,prix_achat=?,prix_vente_ht=?,taux_tva=?,stock_actuel=?,stock_min=?,stock_max=? WHERE id=? AND account_id=?')
    .run(d.code,d.designation,d.description||'',d.type||'produit',d.categorie||'',d.unite||'U',d.prix_achat||0,d.prix_vente_ht||0,d.taux_tva||20,d.stock_actuel||0,d.stock_min||0,d.stock_max||0,req.params.id,req.account.id);
  res.json({success:true});
});
app.delete('/api/articles/:id',auth,(req,res)=>{db.prepare('UPDATE articles SET actif=0 WHERE id=? AND account_id=?').run(req.params.id,req.account.id);res.json({success:true});});

// ── DOCUMENTS ─────────────────────────────────────────────────
app.get('/api/documents',auth,(req,res)=>{
  const{type}=req.query;let q='SELECT * FROM documents WHERE account_id=?';const p=[req.account.id];
  if(type){q+=' AND type=?';p.push(type);}q+=' ORDER BY date_doc DESC,id DESC';
  res.json(db.prepare(q).all(...p));
});
app.get('/api/documents/:id',auth,(req,res)=>{
  const doc=db.prepare('SELECT * FROM documents WHERE id=? AND account_id=?').get(req.params.id,req.account.id);
  if(!doc)return res.status(404).json({error:'Non trouve'});
  res.json({...doc,lignes:db.prepare('SELECT * FROM document_lignes WHERE document_id=? ORDER BY ordre').all(doc.id)});
});
app.post('/api/documents',auth,(req,res)=>{
  const d=req.body;if(!d.type||!d.date_doc)return res.status(400).json({error:'Type et date requis'});
  const numero=d.numero||nextNumero(req.account.id,d.type);
  if(db.prepare('SELECT id FROM documents WHERE account_id=? AND type=? AND numero=?').get(req.account.id,d.type,numero))
    return res.status(400).json({error:'Numero deja existant'});
  const lignes=d.lignes||[];let ht=0,tva=0;
  const tx=db.transaction(()=>{
    const r=db.prepare('INSERT INTO documents (account_id,type,numero,date_doc,date_echeance,tiers_id,tiers_nom,tiers_ice,tiers_if,tiers_rc,tiers_adresse,tiers_ville,tiers_tel,statut,total_ht,total_tva,total_ttc,mode_paiement,banque,ref_externe,objet,conditions,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0,?,?,?,?,?,?)')
      .run(req.account.id,d.type,numero,d.date_doc,d.date_echeance||null,d.tiers_id||null,d.tiers_nom||'',d.tiers_ice||'',d.tiers_if||'',d.tiers_rc||'',d.tiers_adresse||'',d.tiers_ville||'',d.tiers_tel||'',d.statut||'brouillon',d.mode_paiement||'virement',d.banque||'',d.ref_externe||'',d.objet||'',d.conditions||'',d.notes||'');
    const did=r.lastInsertRowid;
    lignes.forEach((l,i)=>{
      const h=Math.round((l.quantite||1)*(l.prix_unit_ht||0)*(1-(l.taux_remise||0)/100)*100)/100;
      const tv=Math.round(h*(l.taux_tva||20)/100*100)/100;
      ht+=h;tva+=tv;
      db.prepare('INSERT INTO document_lignes (document_id,article_id,designation,description,unite,quantite,prix_unit_ht,taux_remise,taux_tva,montant_ht,montant_tva,montant_ttc,ordre) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
        .run(did,l.article_id||null,l.designation,l.description||'',l.unite||'U',l.quantite||1,l.prix_unit_ht||0,l.taux_remise||0,l.taux_tva||20,h,tv,h+tv,i);
    });
    ht=Math.round(ht*100)/100;tva=Math.round(tva*100)/100;
    db.prepare('UPDATE documents SET total_ht=?,total_tva=?,total_ttc=? WHERE id=?').run(ht,tva,Math.round((ht+tva)*100)/100,did);
    return{id:did,numero,total_ht:ht,total_tva:tva,total_ttc:Math.round((ht+tva)*100)/100};
  });
  res.json({success:true,...tx()});
});
app.put('/api/documents/:id',auth,(req,res)=>{
  const d=req.body;
  const doc=db.prepare('SELECT * FROM documents WHERE id=? AND account_id=?').get(req.params.id,req.account.id);
  if(!doc)return res.status(404).json({error:'Non trouve'});
  if(doc.statut==='valide'&&d.statut!=='valide'&&req.account.role!=='super')return res.status(400).json({error:'Document valide'});
  db.prepare('UPDATE documents SET statut=?,date_echeance=?,tiers_id=?,tiers_nom=?,tiers_ice=?,tiers_if=?,tiers_adresse=?,tiers_ville=?,mode_paiement=?,banque=?,objet=?,conditions=?,notes=?,montant_paye=? WHERE id=? AND account_id=?')
    .run(d.statut||doc.statut,d.date_echeance||doc.date_echeance,d.tiers_id||doc.tiers_id,d.tiers_nom||doc.tiers_nom,d.tiers_ice||doc.tiers_ice,d.tiers_if||doc.tiers_if,d.tiers_adresse||doc.tiers_adresse,d.tiers_ville||doc.tiers_ville,d.mode_paiement||doc.mode_paiement,d.banque||doc.banque,d.objet||doc.objet,d.conditions||doc.conditions,d.notes||doc.notes,d.montant_paye!==undefined?d.montant_paye:doc.montant_paye,req.params.id,req.account.id);
  res.json({success:true});
});
app.delete('/api/documents/:id',auth,(req,res)=>{
  const doc=db.prepare('SELECT statut FROM documents WHERE id=? AND account_id=?').get(req.params.id,req.account.id);
  if(doc?.statut==='valide')return res.status(400).json({error:'Document valide'});
  db.prepare('DELETE FROM documents WHERE id=? AND account_id=?').run(req.params.id,req.account.id);
  res.json({success:true});
});

// ── EMPLOYES ──────────────────────────────────────────────────
app.get('/api/employes',auth,(req,res)=>res.json(db.prepare("SELECT * FROM employes WHERE account_id=? AND statut!='archive' ORDER BY nom,prenom").all(req.account.id)));
app.post('/api/employes',auth,(req,res)=>{
  const d=req.body;
  if(!d.nom||!d.prenom||!d.date_embauche)return res.status(400).json({error:'Nom, prenom et date embauche requis'});
  if(d.salaire_base<L.SMIG)return res.status(400).json({error:'Salaire inferieur au SMIG 2026 ('+L.SMIG+' MAD)'});
  const count=db.prepare('SELECT COUNT(*) as c FROM employes WHERE account_id=?').get(req.account.id).c;
  const mat=d.matricule||('EMP-'+String(count+1).padStart(4,'0'));
  const r=db.prepare('INSERT INTO employes (account_id,matricule,nom,prenom,cin,cnss_num,date_naissance,date_embauche,type_contrat,poste,departement,salaire_base,nb_enfants,conjoint,situation_familiale,rib,banque,mode_paiement,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(req.account.id,mat,d.nom,d.prenom,d.cin||'',d.cnss_num||'',d.date_naissance||'',d.date_embauche,d.type_contrat||'CDI',d.poste||'',d.departement||'',d.salaire_base||0,d.nb_enfants||0,d.conjoint?1:0,d.situation_familiale||'celibataire',d.rib||'',d.banque||'',d.mode_paiement||'virement',d.notes||'');
  res.json({success:true,id:r.lastInsertRowid,matricule:mat});
});
app.put('/api/employes/:id',auth,(req,res)=>{
  const d=req.body;
  if(d.salaire_base&&d.salaire_base<L.SMIG)return res.status(400).json({error:'Salaire inferieur au SMIG 2026 ('+L.SMIG+' MAD)'});
  db.prepare('UPDATE employes SET nom=?,prenom=?,cin=?,cnss_num=?,date_naissance=?,date_embauche=?,type_contrat=?,poste=?,departement=?,salaire_base=?,nb_enfants=?,conjoint=?,situation_familiale=?,rib=?,banque=?,mode_paiement=?,statut=?,notes=? WHERE id=? AND account_id=?')
    .run(d.nom,d.prenom,d.cin||'',d.cnss_num||'',d.date_naissance||'',d.date_embauche||'',d.type_contrat||'CDI',d.poste||'',d.departement||'',d.salaire_base||0,d.nb_enfants||0,d.conjoint?1:0,d.situation_familiale||'celibataire',d.rib||'',d.banque||'',d.mode_paiement||'virement',d.statut||'actif',d.notes||'',req.params.id,req.account.id);
  res.json({success:true});
});
app.delete('/api/employes/:id',auth,(req,res)=>{db.prepare("UPDATE employes SET statut='archive' WHERE id=? AND account_id=?").run(req.params.id,req.account.id);res.json({success:true});});

// ── PAIE ──────────────────────────────────────────────────────
app.post('/api/paie/simuler',auth,(req,res)=>{
  const emp=req.body.employe_id?db.prepare('SELECT * FROM employes WHERE id=? AND account_id=?').get(req.body.employe_id,req.account.id):null;
  const data={...req.body};
  if(emp){
    if(!data.salaire_base)data.salaire_base=emp.salaire_base;
    if(data.nb_enfants===undefined)data.nb_enfants=emp.nb_enfants;
    if(data.conjoint===undefined)data.conjoint=emp.conjoint;
    if(!data.date_embauche)data.date_embauche=emp.date_embauche;
  }
  res.json(calculerBulletin(data));
});
app.get('/api/bulletins',auth,(req,res)=>{
  const{mois,annee,employe_id}=req.query;
  let q='SELECT b.*,e.nom,e.prenom,e.matricule,e.poste,e.cnss_num,e.rib,e.banque,e.mode_paiement,e.cin FROM bulletins b JOIN employes e ON b.employe_id=e.id WHERE b.account_id=?';
  const p=[req.account.id];
  if(mois){q+=' AND b.mois=?';p.push(mois);}
  if(annee){q+=' AND b.annee=?';p.push(annee);}
  if(employe_id){q+=' AND b.employe_id=?';p.push(employe_id);}
  q+=' ORDER BY b.annee DESC,b.mois DESC';
  res.json(db.prepare(q).all(...p));
});
app.post('/api/bulletins',auth,(req,res)=>{
  const d=req.body;
  if(!d.employe_id||!d.mois||!d.annee)return res.status(400).json({error:'Employe, mois et annee requis'});
  const emp=db.prepare('SELECT * FROM employes WHERE id=? AND account_id=?').get(d.employe_id,req.account.id);
  if(!emp)return res.status(404).json({error:'Employe non trouve'});
  if(db.prepare('SELECT id FROM bulletins WHERE account_id=? AND employe_id=? AND mois=? AND annee=?').get(req.account.id,d.employe_id,d.mois,d.annee))
    return res.status(400).json({error:'Bulletin deja existant pour cette periode'});
  const calc=calculerBulletin({
    salaire_base:d.salaire_base||emp.salaire_base,
    heures_sup_25:d.heures_sup_25||0,
    heures_sup_50:d.heures_sup_50||0,
    autres_primes:d.autres_primes||0,
    indemnite_transport:emp.indemnite_transport||0,
    nb_enfants:d.nb_enfants!==undefined?d.nb_enfants:emp.nb_enfants,
    conjoint:d.conjoint!==undefined?d.conjoint:emp.conjoint,
    date_embauche:emp.date_embauche
  });
  try {
    const r=db.prepare(`INSERT INTO bulletins 
      (account_id,employe_id,mois,annee,salaire_base,nb_jours_travailles,
       heures_sup_25,heures_sup_50,prime_anciennete,taux_anciennete,autres_primes,
       indemnite_transport,salaire_brut,cnss_salarie,amo_salarie,ipe_salarie,
       frais_pro,taux_frais_pro,rni_mensuel,ir_brut,deduction_famille,ir_net,
       total_retenues,salaire_net,cnss_patronal,amo_patronal,af_patronal,
       tfp_patronal,charge_patronale_total,statut)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'brouillon')`)
    .run(
      req.account.id,d.employe_id,d.mois,d.annee,
      calc.salaire_base,d.nb_jours_travailles||26,
      d.heures_sup_25||0,d.heures_sup_50||0,
      calc.prime_anciennete,calc.taux_anciennete,
      d.autres_primes||0,calc.indemnite_transport||0,
      calc.salaire_brut,calc.cnss_salarie,calc.amo_salarie,calc.ipe_salarie,
      calc.frais_pro,calc.taux_frais_pro,calc.rni_mensuel,
      calc.ir_brut,calc.deduction_famille,calc.ir_net,
      calc.total_retenues,calc.salaire_net,
      calc.cnss_patronal,calc.amo_patronal,calc.af_patronal,calc.tfp_patronal,
      calc.charge_patronale_total
    );
    res.json({success:true,id:r.lastInsertRowid,calcul:calc});
  } catch(e) {
    console.error('Bulletin INSERT error:',e.message);
    res.status(500).json({error:'Erreur creation bulletin: '+e.message});
  }
});

app.put('/api/bulletins/:id/valider',auth,(req,res)=>{db.prepare("UPDATE bulletins SET statut='valide' WHERE id=? AND account_id=?").run(req.params.id,req.account.id);res.json({success:true});});
app.delete('/api/bulletins/:id',auth,(req,res)=>{
  const b=db.prepare('SELECT statut FROM bulletins WHERE id=? AND account_id=?').get(req.params.id,req.account.id);
  if(b?.statut==='valide')return res.status(400).json({error:'Bulletin valide'});
  db.prepare('DELETE FROM bulletins WHERE id=? AND account_id=?').run(req.params.id,req.account.id);
  res.json({success:true});
});
app.get('/api/paie/bordereau-cnss',auth,(req,res)=>{
  const{mois,annee}=req.query;
  const buls=db.prepare("SELECT b.*,e.nom,e.prenom,e.matricule,e.cnss_num FROM bulletins b JOIN employes e ON b.employe_id=e.id WHERE b.account_id=? AND b.mois=? AND b.annee=? AND b.statut='valide'").all(req.account.id,mois,annee);
  const t={nb:buls.length,brut:0,cnss_s:0,cnss_p:0,amo_s:0,amo_p:0,af:0,tfp:0};
  buls.forEach(b=>{t.brut+=b.salaire_brut;t.cnss_s+=b.cnss_salarie;t.cnss_p+=b.cnss_patronal;t.amo_s+=b.amo_salarie;t.amo_p+=b.amo_patronal;t.af+=b.af_patronal;t.tfp+=b.tfp_patronal;});
  Object.keys(t).forEach(k=>{if(k!=='nb')t[k]=Math.round(t[k]*100)/100;});
  t.total=Math.round((t.cnss_s+t.cnss_p+t.amo_s+t.amo_p+t.af+t.tfp)*100)/100;
  t.date_limite=annee+'-'+String(parseInt(mois)+1).padStart(2,'0')+'-10';
  res.json({mois,annee,bulletins:buls,totaux:t});
});

// ── CONGES ────────────────────────────────────────────────────
app.get('/api/conges',auth,(req,res)=>res.json(db.prepare('SELECT c.*,e.nom,e.prenom,e.matricule FROM conges c JOIN employes e ON c.employe_id=e.id WHERE c.account_id=? ORDER BY c.date_debut DESC').all(req.account.id)));
app.post('/api/conges',auth,(req,res)=>{
  const d=req.body;
  const r=db.prepare('INSERT INTO conges (account_id,employe_id,type,date_debut,date_fin,nb_jours,motif) VALUES (?,?,?,?,?,?,?)').run(req.account.id,d.employe_id,d.type||'annuel',d.date_debut,d.date_fin,d.nb_jours||0,d.motif||'');
  res.json({success:true,id:r.lastInsertRowid});
});
app.put('/api/conges/:id',auth,(req,res)=>{db.prepare('UPDATE conges SET statut=? WHERE id=? AND account_id=?').run(req.body.statut||'approuve',req.params.id,req.account.id);res.json({success:true});});

// ── TRESORERIE ────────────────────────────────────────────────
app.get('/api/tresorerie',auth,(req,res)=>res.json(db.prepare('SELECT * FROM tresorerie WHERE account_id=? ORDER BY date_op DESC').all(req.account.id)));
app.post('/api/tresorerie',auth,(req,res)=>{
  const d=req.body;
  const r=db.prepare('INSERT INTO tresorerie (account_id,compte,type,date_op,libelle,montant,reference,tiers_id,categorie) VALUES (?,?,?,?,?,?,?,?,?)').run(req.account.id,d.compte||'Caisse',d.type,d.date_op,d.libelle,d.montant,d.reference||'',d.tiers_id||null,d.categorie||'');
  res.json({success:true,id:r.lastInsertRowid});
});
app.delete('/api/tresorerie/:id',auth,(req,res)=>{db.prepare('DELETE FROM tresorerie WHERE id=? AND account_id=?').run(req.params.id,req.account.id);res.json({success:true});});

// ── STOCK MOUVEMENTS ──────────────────────────────────────────
app.get('/api/stock/mouvements',auth,(req,res)=>res.json(db.prepare('SELECT sm.*,a.designation,a.code FROM stock_mouvements sm JOIN articles a ON sm.article_id=a.id WHERE sm.account_id=? ORDER BY sm.created_at DESC').all(req.account.id)));
app.post('/api/stock/mouvement',auth,(req,res)=>{
  const d=req.body;
  const art=db.prepare('SELECT stock_actuel FROM articles WHERE id=? AND account_id=?').get(d.article_id,req.account.id);
  if(!art)return res.status(404).json({error:'Article non trouve'});
  const avant=art.stock_actuel;
  const apres=d.type==='entree'?avant+d.quantite:avant-d.quantite;
  db.prepare('UPDATE articles SET stock_actuel=? WHERE id=?').run(apres,d.article_id);
  const r=db.prepare('INSERT INTO stock_mouvements (account_id,article_id,type,quantite,stock_avant,stock_apres,reference,motif) VALUES (?,?,?,?,?,?,?,?)').run(req.account.id,d.article_id,d.type,d.quantite,avant,apres,d.reference||'',d.motif||'');
  res.json({success:true,id:r.lastInsertRowid,stock_apres:apres});
});

// ── DEPENSES ──────────────────────────────────────────────────
app.get('/api/depenses',auth,(req,res)=>res.json(db.prepare('SELECT * FROM depenses WHERE account_id=? ORDER BY date_dep DESC').all(req.account.id)));
app.post('/api/depenses',auth,(req,res)=>{
  const d=req.body;
  const ttc=Math.round(d.montant_ht*(1+(d.taux_tva||20)/100)*100)/100;
  const r=db.prepare('INSERT INTO depenses (account_id,date_dep,categorie,libelle,montant_ht,taux_tva,montant_ttc,fournisseur,reference,mode_paiement,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(req.account.id,d.date_dep,d.categorie,d.libelle,d.montant_ht||0,d.taux_tva||20,ttc,d.fournisseur||'',d.reference||'',d.mode_paiement||'virement',d.notes||'');
  res.json({success:true,id:r.lastInsertRowid});
});
app.delete('/api/depenses/:id',auth,(req,res)=>{db.prepare('DELETE FROM depenses WHERE id=? AND account_id=?').run(req.params.id,req.account.id);res.json({success:true});});

// ── CRM ───────────────────────────────────────────────────────
app.get('/api/crm',auth,(req,res)=>res.json(db.prepare('SELECT * FROM crm_prospects WHERE account_id=? ORDER BY created_at DESC').all(req.account.id)));
app.post('/api/crm',auth,(req,res)=>{
  const d=req.body;
  const r=db.prepare('INSERT INTO crm_prospects (account_id,nom,societe,tel,email,secteur,valeur_estimee,statut,probabilite,date_relance,source,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(req.account.id,d.nom,d.societe||'',d.tel||'',d.email||'',d.secteur||'',d.valeur_estimee||0,d.statut||'nouveau',d.probabilite||20,d.date_relance||null,d.source||'',d.notes||'');
  res.json({success:true,id:r.lastInsertRowid});
});
app.put('/api/crm/:id',auth,(req,res)=>{
  const d=req.body;
  db.prepare('UPDATE crm_prospects SET nom=?,societe=?,tel=?,email=?,secteur=?,valeur_estimee=?,statut=?,probabilite=?,date_relance=?,source=?,notes=? WHERE id=? AND account_id=?').run(d.nom,d.societe||'',d.tel||'',d.email||'',d.secteur||'',d.valeur_estimee||0,d.statut||'nouveau',d.probabilite||20,d.date_relance||null,d.source||'',d.notes||'',req.params.id,req.account.id);
  res.json({success:true});
});
app.delete('/api/crm/:id',auth,(req,res)=>{db.prepare('DELETE FROM crm_prospects WHERE id=? AND account_id=?').run(req.params.id,req.account.id);res.json({success:true});});

// ── MAINTENANCE ───────────────────────────────────────────────
app.get('/api/maintenance',auth,(req,res)=>res.json(db.prepare('SELECT * FROM maintenance WHERE account_id=? ORDER BY date_maintenance DESC').all(req.account.id)));
app.post('/api/maintenance',auth,(req,res)=>{
  const d=req.body;
  const r=db.prepare('INSERT INTO maintenance (account_id,type_bien,bien,type_maintenance,date_maintenance,date_prochaine,description,cout,prestataire,statut,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(req.account.id,d.type_bien||'vehicule',d.bien,d.type_maintenance||'preventive',d.date_maintenance,d.date_prochaine||null,d.description||'',d.cout||0,d.prestataire||'',d.statut||'planifie',d.notes||'');
  res.json({success:true,id:r.lastInsertRowid});
});
app.delete('/api/maintenance/:id',auth,(req,res)=>{db.prepare('DELETE FROM maintenance WHERE id=? AND account_id=?').run(req.params.id,req.account.id);res.json({success:true});});

// ── ALERTES ───────────────────────────────────────────────────
app.get('/api/alertes',auth,(req,res)=>res.json(db.prepare('SELECT * FROM alertes WHERE account_id=? ORDER BY id DESC').all(req.account.id)));
app.put('/api/alertes/:id/lu',auth,(req,res)=>{db.prepare('UPDATE alertes SET lu=1 WHERE id=? AND account_id=?').run(req.params.id,req.account.id);res.json({success:true});});
app.put('/api/alertes/all/lu',auth,(req,res)=>{db.prepare('UPDATE alertes SET lu=1 WHERE account_id=?').run(req.account.id);res.json({success:true});});

// ── DASHBOARD ─────────────────────────────────────────────────
app.get('/api/dashboard',auth,(req,res)=>{
  const aid=req.account.id;
  const now=new Date();const m=now.getMonth()+1;const y=now.getFullYear();
  const ym=y+'-'+String(m).padStart(2,'0');
  const ca_m=db.prepare("SELECT COALESCE(SUM(total_ttc),0) as v FROM documents WHERE account_id=? AND type='facture' AND statut='valide' AND strftime('%Y-%m',date_doc)=?").get(aid,ym).v;
  const ca_y=db.prepare("SELECT COALESCE(SUM(total_ttc),0) as v FROM documents WHERE account_id=? AND type='facture' AND statut='valide' AND strftime('%Y',date_doc)=?").get(aid,String(y)).v;
  const impaye=db.prepare("SELECT COALESCE(SUM(total_ttc-montant_paye),0) as v FROM documents WHERE account_id=? AND type='facture' AND statut='valide' AND montant_paye<total_ttc").get(aid).v;
  const nb_clients=db.prepare("SELECT COUNT(*) as c FROM tiers WHERE account_id=? AND (type='client' OR type='les_deux')").get(aid).c;
  const nb_emp=db.prepare("SELECT COUNT(*) as c FROM employes WHERE account_id=? AND statut='actif'").get(aid).c;
  const masse=db.prepare("SELECT COALESCE(SUM(salaire_brut),0) as v FROM bulletins WHERE account_id=? AND mois=? AND annee=? AND statut='valide'").get(aid,m,y).v;
  const stock_alerte=db.prepare('SELECT COUNT(*) as c FROM articles WHERE account_id=? AND stock_actuel<=stock_min AND stock_min>0').get(aid).c;
  const alertes_nr=db.prepare('SELECT COUNT(*) as c FROM alertes WHERE account_id=? AND lu=0').get(aid).c;
  const devis_ec=db.prepare("SELECT COUNT(*) as c FROM documents WHERE account_id=? AND type='devis' AND statut='envoye'").get(aid).c;
  const total_depenses_m=db.prepare("SELECT COALESCE(SUM(montant_ttc),0) as v FROM depenses WHERE account_id=? AND strftime('%Y-%m',date_dep)=?").get(aid,ym).v;
  const ca_mois=[];
  for(let i=11;i>=0;i--){
    const d=new Date(y,m-1-i,1);
    const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    const v=db.prepare("SELECT COALESCE(SUM(total_ttc),0) as v FROM documents WHERE account_id=? AND type='facture' AND statut='valide' AND strftime('%Y-%m',date_doc)=?").get(aid,k).v;
    ca_mois.push({mois:k,ca:Math.round(v*100)/100});
  }
  res.json({
    ca_mois:Math.round(ca_m*100)/100,ca_annee:Math.round(ca_y*100)/100,
    impaye:Math.round(impaye*100)/100,nb_clients,nb_employes:nb_emp,
    masse_salariale:Math.round(masse*100)/100,stock_alerte,
    alertes_non_lues:alertes_nr,devis_en_cours:devis_ec,
    total_depenses_mois:Math.round(total_depenses_m*100)/100,
    ca_par_mois:ca_mois,smig:L.SMIG,
    echeance_cnss:y+'-'+String(m+1).padStart(2,'0')+'-10',
    echeance_ir:y+'-'+String(m+1).padStart(2,'0')+'-20'
  });
});

// ── SUPER ADMIN ───────────────────────────────────────────────
app.get('/api/admin/accounts',auth,superOnly,(req,res)=>res.json(db.prepare("SELECT id,name,email,role,company_name,plan,expires_at,status,created_at,last_login FROM accounts ORDER BY created_at DESC").all()));
app.post('/api/admin/accounts',auth,superOnly,(req,res)=>{
  const{name,email,password,company_name,plan}=req.body;
  if(!name||!email||!password)return res.status(400).json({error:'Nom, email et MDP requis'});
  const hash=bcrypt.hashSync(password,10);
  const days=plan==='enterprise'?36500:plan==='pro'?365:plan==='starter'?30:2;
  const exp=new Date();exp.setDate(exp.getDate()+days);
  const r=db.prepare("INSERT INTO accounts (name,email,password,role,company_name,plan,expires_at) VALUES (?,?,?,'client',?,?,?)").run(name,email.toLowerCase(),hash,company_name||'',plan||'starter',exp.toISOString().split('T')[0]);
  res.json({success:true,id:r.lastInsertRowid});
});
app.put('/api/admin/accounts/:id',auth,superOnly,(req,res)=>{
  const{name,plan,status,newPassword}=req.body;
  const acc=db.prepare('SELECT * FROM accounts WHERE id=?').get(req.params.id);
  if(!acc)return res.status(404).json({error:'Non trouve'});
  let exp=acc.expires_at;
  if(plan&&plan!==acc.plan){const days=plan==='enterprise'?36500:plan==='pro'?365:plan==='starter'?30:2;const d=new Date();d.setDate(d.getDate()+days);exp=d.toISOString().split('T')[0];}
  let pwd=acc.password;if(newPassword)pwd=bcrypt.hashSync(newPassword,10);
  db.prepare('UPDATE accounts SET name=?,plan=?,expires_at=?,status=?,password=? WHERE id=?').run(name||acc.name,plan||acc.plan,exp,status||acc.status,pwd,req.params.id);
  res.json({success:true});
});
app.delete('/api/admin/accounts/:id',auth,superOnly,(req,res)=>{
  if(req.account.id==req.params.id)return res.status(400).json({error:'Impossible'});
  db.prepare('DELETE FROM accounts WHERE id=?').run(req.params.id);
  res.json({success:true});
});
app.get('/api/admin/trials',auth,superOnly,(req,res)=>res.json(db.prepare('SELECT * FROM trial_requests ORDER BY created_at DESC').all()));
app.get('/api/legal',(req,res)=>res.json(L));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'frontend/public/index.html')));

app.listen(PORT,'0.0.0.0',()=>{
  console.log('PMEGest.ma ERP port '+PORT);
  console.log('Super Admin: admin@pmegest.ma / PMEGest2026@Admin');
  console.log('SMIG 2026: '+L.SMIG+' MAD | CNSS: '+(L.CNSS_SAL*100)+'% | AMO: '+(L.AMO_SAL*100)+'%');
});
