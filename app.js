import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { getDatabase, onValue, ref, set } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyA8usqh5zoUcxI_BaIlxzd2Glhg4WSSeqE',
  authDomain: 'statscov-e6db1.firebaseapp.com',
  databaseURL: 'https://statscov-e6db1-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'statscov-e6db1',
  storageBucket: 'statscov-e6db1.firebasestorage.app',
  messagingSenderId: '298231661904',
  appId: '1:298231661904:web:statscovpwa'
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const CACHE_KEY = 'stats-cov-root-cache-COV26';
const SESSION_ROLE_KEY = 'stats-cov-role-v2';

const state = {
  root: null,
  activeSeasonId: null,
  activeView: 'home',
  rankingMode: 'table',
  compoMode: 'field',
  activeMatchId: null,
  matchDetailMode: 'stats',
  resultsFilter: 'all',
  hasFirebaseError: false,
  lastUpdated: null,
  deferredInstallPrompt: null,
  authReady: false,
  userMode: null,
  bootCoachOpen: false,
  bootAccessRole: 'coach',
  coachCodeInput: '',
  coachCodeError: '',
  completeMatchStep: 'menu',
  coachSaving: false,
  coachPresenceEdits: null,
  coachYellowEdits: null,
  coachBlueEdits: null,
  coachYellowLines: null,
  coachBlueLines: null,
  coachSelectedLane: 'GB',
  presenceScrollTop: 0,
  editingMatchId: null,
  scoreYellowGoals: null,
  scoreYellowAssists: null,
  scoreBlueGoals: null,
  scoreBlueAssists: null,
  scoreYellowMvpId: '',
  scoreBlueMvpId: '',
  activePlayerId: null,
  playerPositionsEditId: null,
  playerPositionsDraft: [],
  playerPositionsSaving: false,
  coachYellowSlots: null,
  coachBlueSlots: null,
  adminElevenSlots: null,
  adminElevenBenchIds: null,
  adminElevenSelectedSlot: 'GB',
  scrollMemory: {},
  lastScoreAnchor: null,
  ballonOrIndex: 0,
  ballonOrPaused: false,
  ballonOrTimer: null,
};

const els = {
  topbar: document.getElementById('topbar'),
  headerLeft: document.getElementById('headerLeft'),
  headerHomeBtn: document.getElementById('headerHomeBtn'),
  seasonBtn: document.getElementById('seasonBtn'),
  bottomNav: document.querySelector('.bottom-nav'),
  seasonDialog: document.getElementById('seasonDialog'),
  seasonList: document.getElementById('seasonList'),
  playerDialog: document.getElementById('playerDialog'),
  playerDialogTitle: document.getElementById('playerDialogTitle'),
  playerDialogBody: document.getElementById('playerDialogBody'),
  matchDialog: document.getElementById('matchDialog'),
  matchDialogTitle: document.getElementById('matchDialogTitle'),
  matchDialogBody: document.getElementById('matchDialogBody'),
  firebaseBanner: document.getElementById('firebaseBanner'),
  viewMount: document.getElementById('viewMount'),
  loadingTemplate: document.getElementById('loadingTemplate'),
  errorTemplate: document.getElementById('errorTemplate'),
  featureDialog: document.getElementById('featureDialog'),
  featureDialogTitle: document.getElementById('featureDialogTitle'),
  featureDialogBody: document.getElementById('featureDialogBody'),
  installDialog: document.getElementById('installDialog'),
  installDialogBody: document.getElementById('installDialogBody'),
  actionDialog: document.getElementById('actionDialog'),
  actionDialogTitle: document.getElementById('actionDialogTitle'),
  actionDialogBody: document.getElementById('actionDialogBody'),
  actionDialogCancel: document.getElementById('actionDialogCancel'),
  actionDialogConfirm: document.getElementById('actionDialogConfirm'),
  actionDialogClose: document.getElementById('actionDialogClose'),
  backTopBtn: document.getElementById('backTopBtn')
};

const navButtons = [...document.querySelectorAll('.nav-btn')];
if (els.bottomNav) { els.bottomNav.addEventListener('click', (event) => { const btn = event.target.closest('.nav-btn'); if (!btn) return; setView(btn.dataset.view); }); }

const PLAYER_ROLE_MAP = {
  kamel: ['BU', 'AC', 'AD', 'AG'],
  youri: ['DD', 'DG', 'DC'],
  thomas: ['DD', 'AD', 'DG', 'AG'],
  antho: ['DC'],
  charles: ['DG', 'DD', 'DC'],
  yann: ['DC', 'DD', 'DG', 'MDC'],
  fabien: ['MC', 'MDC', 'MD', 'MOC'],
  mehdi: ['MC', 'MDC', 'MOC'],
  daniel: ['MDC', 'MC', 'MOC', 'DC'],
  christophe: ['AC', 'BU', 'GB'],
  pg: ['DC', 'DG', 'DD'],
  sofiane: ['BU', 'AC', 'MOC'],
  raphael: ['MDC', 'MC', 'MOC', 'DC'],
  baks: ['BU', 'AC', 'AD', 'AG'],
  ziane: ['MOC', 'MC', 'MDC'],
  bruno: ['DC', 'DD', 'DG'],
  matteo: ['DD', 'DG'],
  laurent: ['MD', 'MG', 'MC'],
  maxime: ['DG', 'MG', 'AG'],
  eric: ['DC', 'DD'],
  tayeb: ['MOC', 'MC', 'MDC'],
  jean_mi: ['AG', 'MG', 'GB'],
  arnaud: ['MD', 'AD', 'AG', 'GB'],
  farez: ['MOC', 'MDC', 'MC'],
  jimmy: ['MC', 'MDC', 'MG', 'MOC'],
  william: ['AD', 'MD'],
  igor: ['MOC', 'MC', 'MDC'],
  gregoire: ['MOC', 'MC', 'MDC'],
  regis: ['GB'],
  achour: ['MC', 'MOC', 'AD'],
  julien: ['MG', 'DG', 'AG']
};

const POSITION_OPTIONS = ['GB','DD','DC','DG','MDC','MC','MOC','MD','MG','AD','AC','AG','BU'];
const COMPO_POSITION_OPTIONS = ['AG','ACG','BU','ACD','AD','MoCG','MoC','MoCD','MG','MCG','MC','MCD','MD','MDCG','MDC','MDCD','DG','DCG','DC','DCD','DD','GB'];
const COMPO_POSITION_LABELS = { MOC: 'MoC', MoC: 'MoC', MoCG: 'MoCG', MoCD: 'MoCD' };
const COMPO_SLOT_TO_GENERIC = {
  GB: ['GB'],
  DG: ['DG', 'DD', 'DC'],
  DCG: ['DC'],
  DC: ['DC'],
  DCD: ['DC'],
  DD: ['DD', 'DG', 'DC'],
  MDCG: ['MDC', 'MC'],
  MDC: ['MDC', 'MC'],
  MDCD: ['MDC', 'MC'],
  MG: ['MG', 'MC', 'MOC', 'AG'],
  MCG: ['MC', 'MDC', 'MOC'],
  MC: ['MC', 'MDC', 'MOC'],
  MCD: ['MC', 'MDC', 'MOC'],
  MD: ['MD', 'MC', 'MOC', 'AD'],
  MoCG: ['MOC', 'MC', 'MDC', 'AC'],
  MoC: ['MOC', 'MC', 'MDC', 'AC'],
  MoCD: ['MOC', 'MC', 'MDC', 'AC'],
  AG: ['AG', 'AD', 'AC', 'BU'],
  ACG: ['AC', 'BU', 'AG', 'AD'],
  BU: ['BU', 'AC', 'AG', 'AD'],
  ACD: ['AC', 'BU', 'AG', 'AD'],
  AD: ['AD', 'AG', 'AC', 'BU']
};
const MODEL_FIELD_SIZE = { width: 1152, height: 2048 };
const POSITION_FIELD_COORDS = {
  AG: { x: 66, y: 250, w: 148, h: 212 },
  ACG: { x: 278, y: 252, w: 148, h: 212 },
  BU: { x: 502, y: 248, w: 148, h: 212 },
  ACD: { x: 726, y: 252, w: 148, h: 212 },
  AD: { x: 938, y: 250, w: 148, h: 212 },
  MoCG: { x: 282, y: 532, w: 148, h: 212 },
  MoC: { x: 502, y: 530, w: 148, h: 212 },
  MoCD: { x: 722, y: 532, w: 148, h: 212 },
  MG: { x: 60, y: 794, w: 148, h: 212 },
  MCG: { x: 276, y: 796, w: 148, h: 212 },
  MC: { x: 502, y: 794, w: 148, h: 212 },
  MCD: { x: 728, y: 796, w: 148, h: 212 },
  MD: { x: 944, y: 794, w: 148, h: 212 },
  MDCG: { x: 280, y: 1070, w: 148, h: 212 },
  MDC: { x: 502, y: 1068, w: 148, h: 212 },
  MDCD: { x: 724, y: 1070, w: 148, h: 212 },
  DG: { x: 60, y: 1362, w: 148, h: 212 },
  DCG: { x: 276, y: 1364, w: 148, h: 212 },
  DC: { x: 502, y: 1364, w: 148, h: 212 },
  DCD: { x: 728, y: 1364, w: 148, h: 212 },
  DD: { x: 944, y: 1362, w: 148, h: 212 },
  GB: { x: 502, y: 1710, w: 148, h: 212 }
};
function getAdjustedFieldCoords(position) {
  const coords = POSITION_FIELD_COORDS[position];
  if (!coords) return null;
  const scale = 1.25;
  const width = coords.w * scale;
  const height = coords.h * scale;
  const x = coords.x - (width - coords.w) / 2;
  let y = coords.y - (height - coords.h) / 2;
  if (position === 'GB') y += coords.h * 0.5;
  return { x, y, w: width, h: height };
}

function positionFieldPercent(position) {
  const coords = getAdjustedFieldCoords(position);
  if (!coords) return { left: 50, top: 50, width: 12, height: 10 };
  return {
    left: (coords.x / MODEL_FIELD_SIZE.width) * 100,
    top: (coords.y / MODEL_FIELD_SIZE.height) * 100,
    width: (coords.w / MODEL_FIELD_SIZE.width) * 100,
    height: (coords.h / MODEL_FIELD_SIZE.height) * 100,
    centerX: ((coords.x + coords.w / 2) / MODEL_FIELD_SIZE.width) * 100,
    centerY: ((coords.y + coords.h / 2) / MODEL_FIELD_SIZE.height) * 100
  };
}
const SHARE_TEMPLATE_FIELDS = {
  yellow: { x: 34, y: 114, width: 700, height: 880 },
  blue: { x: 802, y: 114, width: 700, height: 880 }
};
const ASSET_PATHS = {
  logo: 'logo-cov.webp',
  Terrain: 'Terrain.webp',
  ModelCompo: 'ModelCompo.png',
  ShareCompoTemplate: 'share-compo-template.webp',
  PlayerCardTemplate: 'PlayerCardTemplate.png',
  BallonOrCardTemplate: 'BallonOrCardTemplate.png',
  TrophyRoom: 'TrophyRoom.webp',
  TrophyRoomLayout: 'TrophyRoomShowcase.png',
  Boot_Player: 'MaillotDomicile.webp',
  Boot_Coach: 'MaillotExterier.webp',
  Boot_President: 'MaillotThird.webp',
  ChampionTrophy: 'ChampionTrophy.webp',
  GoldenBootTrophy: 'GoldenBootTrophy.webp',
  MVPTrophy: 'MVPTrophy.webp',
  PlaymakerTrophy: 'PlaymakerTrophy.webp',
  Champion_1: 'Champion_1.webp',
  Champion_2: 'Champion_2.webp',
  Scorer_1: 'Scorer_1.webp',
  Scorer_2: 'Scorer_2.webp',
  MVP_1: 'MVP_1.webp',
  MVP_2: 'MVP_2.webp',
  Playmaker_1: 'Playmaker_1.webp',
  Playmaker_2: 'Playmaker_2.webp',
  Avatar_B1: 'Avatar_B1.webp',
  Avatar_B2: 'Avatar_B2.webp',
  Avatar_J1: 'Avatar_J1.webp',
  Avatar_J2: 'Avatar_J2.webp',
  Avatar_N1: 'Avatar_N1.webp',
  Avatar_N2: 'Avatar_N2.webp',
  Avatar_BG1: 'Avatar_BG1.webp',
  Avatar_BG2: 'Avatar_BG2.webp',
  Avatar_G1: 'Avatar_G1.webp',
  Avatar_G2: 'Avatar_G2.webp',
  Avatar_JG1: 'Avatar_JG1.webp',
  Avatar_JG2: 'Avatar_JG2.webp',
  MVP_B1: 'MVP_B1.webp',
  MVP_B2: 'MVP_B2.webp',
  MVP_J1: 'MVP_J1.webp',
  MVP_J2: 'MVP_J2.webp',
};

function assetPath(name, fallback = '') {
  return ASSET_PATHS[name] || fallback;
}

function getPlayerPositions(player) {
  if (!player) return [];
  const raw = Array.isArray(player.preferredPositions) && player.preferredPositions.length
    ? player.preferredPositions
    : Array.isArray(player.positions) && player.positions.length
      ? player.positions
      : PLAYER_ROLE_MAP[player.playerId] || [];
  return [...new Set(raw.map((v) => String(v || '').trim()).filter(Boolean))];
}

function positionsText(player) {
  const positions = getPlayerPositions(player);
  return positions.length ? positions.join(' > ') : 'Aucun poste défini';
}

function compoPositionLabel(position) {
  return COMPO_POSITION_LABELS[position] || position;
}

function emptyDetailedSlots() {
  return Object.fromEntries(COMPO_POSITION_OPTIONS.map((position) => [position, '']));
}

function hasDetailedSlots(payload) {
  return !!(payload && typeof payload === 'object' && COMPO_POSITION_OPTIONS.some((position) => Object.prototype.hasOwnProperty.call(payload, position)));
}

function detailedSlotsFromIds(ids = []) {
  const slots = emptyDetailedSlots();
  const rows = arrangeTeamSimple(ids);
  const defenseMapByCount = { 0: [], 1: ['DC'], 2: ['DCG', 'DCD'], 3: ['DCG', 'DC', 'DCD'], 4: ['DG', 'DCG', 'DCD', 'DD'], 5: ['DG', 'DCG', 'DC', 'DCD', 'DD'] };
  const midfieldMapByCount = { 0: [], 1: ['MoC'], 2: ['MCG', 'MCD'], 3: ['MG', 'MC', 'MD'], 4: ['MG', 'MCG', 'MCD', 'MD'], 5: ['MDCG', 'MDC', 'MDCD', 'MoCG', 'MoC'] };
  const attackMapByCount = { 0: [], 1: ['BU'], 2: ['ACG', 'ACD'], 3: ['AG', 'BU', 'AD'], 4: ['AG', 'ACG', 'ACD', 'AD'], 5: ['AG', 'ACG', 'BU', 'ACD', 'AD'] };
  if (rows.goalkeeper[0]) slots.GB = rows.goalkeeper[0];
  (defenseMapByCount[rows.defense.length] || defenseMapByCount[5]).forEach((position, index) => { slots[position] = rows.defense[index] || ''; });
  (midfieldMapByCount[rows.midfield.length] || midfieldMapByCount[5]).forEach((position, index) => { slots[position] = rows.midfield[index] || ''; });
  const attackIds = rows.attack.concat(rows.extras || []);
  (attackMapByCount[attackIds.length] || attackMapByCount[5]).forEach((position, index) => { slots[position] = attackIds[index] || ''; });
  return slots;
}

function detailedSlotsFromLegacyLines(lines, fallbackIds = []) {
  if (hasDetailedSlots(lines)) return normalizeDetailedSlots(lines);
  const slots = emptyDetailedSlots();
  const legacy = lines && typeof lines === 'object' ? lines : {};
  const gk = [...(legacy.gb || [])];
  const def = [...(legacy.dc || [])];
  const mid = [...(legacy.mc || [])];
  const att = [...(legacy.bu || [])];

  if (!gk.length && !def.length && !mid.length && !att.length) return detailedSlotsFromIds(fallbackIds);

  if (gk[0]) slots.GB = gk[0];
  const defMap = { 0: [], 1: ['DC'], 2: ['DCG', 'DCD'], 3: ['DCG', 'DC', 'DCD'], 4: ['DG', 'DCG', 'DCD', 'DD'], 5: ['DG', 'DCG', 'DC', 'DCD', 'DD'] };
  const midMap = { 0: [], 1: ['MoC'], 2: ['MCG', 'MCD'], 3: ['MG', 'MC', 'MD'], 4: ['MG', 'MCG', 'MCD', 'MD'], 5: ['MDCG', 'MDC', 'MDCD', 'MoCG', 'MoC'] };
  const attMap = { 0: [], 1: ['BU'], 2: ['ACG', 'ACD'], 3: ['AG', 'BU', 'AD'], 4: ['AG', 'ACG', 'ACD', 'AD'], 5: ['AG', 'ACG', 'BU', 'ACD', 'AD'] };
  (defMap[def.length] || defMap[5]).forEach((position, index) => { slots[position] = def[index] || ''; });
  (midMap[mid.length] || midMap[5]).forEach((position, index) => { slots[position] = mid[index] || ''; });
  (attMap[att.length] || attMap[5]).forEach((position, index) => { slots[position] = att[index] || ''; });
  return slots;
}

function normalizeDetailedSlots(slots, fallbackLines = null, fallbackIds = []) {
  if (hasDetailedSlots(slots)) {
    const normalized = emptyDetailedSlots();
    COMPO_POSITION_OPTIONS.forEach((position) => {
      const raw = slots[position];
      normalized[position] = Array.isArray(raw) ? String(raw[0] || '').trim() : String(raw || '').trim();
    });
    if (!normalized.MoC && slots.MOC) {
      const raw = slots.MOC;
      normalized.MoC = Array.isArray(raw) ? String(raw[0] || '').trim() : String(raw || '').trim();
    }
    return normalized;
  }
  if (fallbackLines && typeof fallbackLines === 'object') return detailedSlotsFromLegacyLines(fallbackLines, fallbackIds);
  if (fallbackIds?.length) return detailedSlotsFromIds(fallbackIds);
  return emptyDetailedSlots();
}

function flattenDetailedSlots(slots) {
  return COMPO_POSITION_OPTIONS.map((position) => slots?.[position]).filter(Boolean);
}

function legacyLinesFromDetailedSlots(slots) {
  const normalized = normalizeDetailedSlots(slots);
  return {
    gb: [normalized.GB].filter(Boolean),
    dc: [normalized.DG, normalized.DCG, normalized.DC, normalized.DCD, normalized.DD].filter(Boolean),
    mc: [normalized.MDCG, normalized.MDC, normalized.MDCD, normalized.MG, normalized.MCG, normalized.MC, normalized.MCD, normalized.MD, normalized.MoCG, normalized.MoC, normalized.MoCD, normalized.MOC].filter(Boolean),
    bu: [normalized.AG, normalized.ACG, normalized.BU, normalized.ACD, normalized.AD].filter(Boolean),
  };
}

function playerCanPlaySlot(player, slot) {
  if (!player || !slot) return false;
  const allowed = COMPO_SLOT_TO_GENERIC[slot] || [];
  const positions = getPlayerPositions(player);
  return positions.some((position) => allowed.includes(position));
}

function playerTeamImpact(playerId) {
  const all = {
    yellowMatches: 0, blueMatches: 0,
    yellowWins: 0, blueWins: 0,
    yellowDraws: 0, blueDraws: 0,
    yellowLosses: 0, blueLosses: 0,
    yellowGoalsFor: 0, yellowGoalsAgainst: 0,
    blueGoalsFor: 0, blueGoalsAgainst: 0
  };
  for (const match of completedMatches()) {
    const yellowIds = Array.isArray(match.teamYellowPlayerIds) ? match.teamYellowPlayerIds : [];
    const blueIds = Array.isArray(match.teamBluePlayerIds) ? match.teamBluePlayerIds : [];
    const ys = Number(match.yellowScore || 0);
    const bs = Number(match.blueScore || 0);
    if (yellowIds.includes(playerId)) {
      all.yellowMatches += 1;
      all.yellowGoalsFor += ys;
      all.yellowGoalsAgainst += bs;
      if (ys > bs) all.yellowWins += 1;
      else if (ys < bs) all.yellowLosses += 1;
      else all.yellowDraws += 1;
    }
    if (blueIds.includes(playerId)) {
      all.blueMatches += 1;
      all.blueGoalsFor += bs;
      all.blueGoalsAgainst += ys;
      if (bs > ys) all.blueWins += 1;
      else if (bs < ys) all.blueLosses += 1;
      else all.blueDraws += 1;
    }
  }
  return all;
}

function cloneTemplate(template) {
  return template.content.cloneNode(true);
}

function cacheRoot(root) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(root));
  } catch {}
}

function loadCachedRoot() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function exportAdminData() {
  if (!isPresident()) return;
  const rootData = state.root || loadCachedRoot();
  if (!rootData) {
    await showAppAlert('Aucune donnée à exporter.', 'Export Excel');
    return;
  }
  const exportedAt = new Date().toISOString();
  const datePart = exportedAt.slice(0, 10);
  const filename = `cov-export-${datePart}.xlsx`;
  const blob = createExcelExportBlob(rootData, exportedAt);

  try {
    const file = new File([blob], filename, { type: XLSX_MIME });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: 'Export C.O.V', files: [file] });
      return;
    }
  } catch (error) {
    if (error?.name === 'AbortError') return;
    console.warn('Partage natif indisponible, téléchargement direct utilisé.', error);
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  await showAppAlert(`Export créé : ${filename}`, 'Export Excel');
}

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function excelXmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function excelSheetName(name, fallback = 'Feuille') {
  const clean = String(name || fallback).replace(/[\\/\?\*\[\]:]/g, ' ').trim() || fallback;
  return clean.slice(0, 31);
}

function excelColumnName(index) {
  let n = Number(index || 0) + 1;
  let out = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    out = String.fromCharCode(65 + r) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

function excelCellXml(value, rowIndex, colIndex, style = 4) {
  const ref = `${excelColumnName(colIndex)}${rowIndex}`;
  if (value === null || value === undefined || value === '') return `<c r="${ref}" s="${style}"/>`;
  if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${ref}" s="${style}"><v>${value}</v></c>`;
  if (typeof value === 'boolean') return `<c r="${ref}" s="${style}" t="b"><v>${value ? 1 : 0}</v></c>`;
  return `<c r="${ref}" s="${style}" t="inlineStr"><is><t>${excelXmlEscape(value)}</t></is></c>`;
}

function excelBuildWorksheetXml(sheet) {
  const columns = sheet.columns || [];
  const rows = sheet.rows || [];
  const colCount = Math.max(1, columns.length);
  const title = sheet.title || sheet.name || '';
  const subtitle = sheet.subtitle || '';
  const headerRow = 4;
  const dataStart = 5;
  const dataEnd = rows.length ? dataStart + rows.length - 1 : dataStart;
  const colXml = columns.map((col, idx) => `<col min="${idx + 1}" max="${idx + 1}" width="${Number(col.width || 14)}" customWidth="1"/>`).join('');
  const titleRow = `<row r="1" ht="28" customHeight="1">${excelCellXml(title, 1, 0, 1)}</row>`;
  const subtitleRow = `<row r="2" ht="21" customHeight="1">${excelCellXml(subtitle, 2, 0, 2)}</row>`;
  const headerCells = columns.map((col, idx) => excelCellXml(col.label || col.key || '', headerRow, idx, 3)).join('');
  const bodyRows = rows.map((row, rowIdx) => {
    const r = dataStart + rowIdx;
    const cells = columns.map((col, colIdx) => {
      const value = row[col.key];
      const style = col.type === 'number' ? 5 : col.type === 'decimal' ? 6 : col.type === 'percent' ? 7 : 4;
      return excelCellXml(value, r, colIdx, style);
    }).join('');
    return `<row r="${r}">${cells}</row>`;
  }).join('');
  const lastCol = excelColumnName(colCount - 1);
  const autoFilter = rows.length ? `<autoFilter ref="A${headerRow}:${lastCol}${dataEnd}"/>` : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <cols>${colXml}</cols>
  <sheetData>${titleRow}${subtitleRow}<row r="3"></row><row r="${headerRow}">${headerCells}</row>${bodyRows}</sheetData>
  ${autoFilter}
</worksheet>`;
}

function excelWorkbookXml(sheets) {
  const sheetNodes = sheets.map((sheet, idx) => `<sheet name="${excelXmlEscape(excelSheetName(sheet.name, `Feuille ${idx + 1}`))}" sheetId="${idx + 1}" r:id="rId${idx + 1}"/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>${sheetNodes}</sheets></workbook>`;
}

function excelWorkbookRelsXml(sheets) {
  const rels = sheets.map((sheet, idx) => `<Relationship Id="rId${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${idx + 1}.xml"/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
}

function excelContentTypesXml(sheets) {
  const sheetOverrides = sheets.map((sheet, idx) => `<Override PartName="/xl/worksheets/sheet${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>${sheetOverrides}</Types>`;
}

function excelStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="1"><numFmt numFmtId="164" formatCode="0.0%"/></numFmts>
  <fonts count="4"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="18"/><color rgb="FF111827"/><name val="Calibri"/></font><font><sz val="11"/><color rgb="FF6B7280"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>
  <fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF111827"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF3F4F6"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFD55C"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFE5E7EB"/></left><right style="thin"><color rgb="FFE5E7EB"/></right><top style="thin"><color rgb="FFE5E7EB"/></top><bottom style="thin"><color rgb="FFE5E7EB"/></bottom><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="8"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="right"/></xf><xf numFmtId="2" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function excelCoreXml(exportedAt) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>C.O.V Export</dc:title><dc:creator>C.O.V</dc:creator><cp:lastModifiedBy>C.O.V</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${excelXmlEscape(exportedAt)}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${excelXmlEscape(exportedAt)}</dcterms:modified></cp:coreProperties>`;
}

function excelAppXml(sheets) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>C.O.V</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>${sheets.length}</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="${sheets.length}" baseType="lpstr">${sheets.map((s) => `<vt:lpstr>${excelXmlEscape(excelSheetName(s.name))}</vt:lpstr>`).join('')}</vt:vector></TitlesOfParts><Company>C.O.V</Company></Properties>`;
}

function crc32(bytes) {
  if (!crc32.table) {
    crc32.table = Array.from({ length: 256 }, (_, n) => {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      return c >>> 0;
    });
  }
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) crc = crc32.table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const time = ((date.getHours() & 31) << 11) | ((date.getMinutes() & 63) << 5) | Math.floor(date.getSeconds() / 2);
  const year = Math.max(1980, date.getFullYear()) - 1980;
  const day = ((year & 127) << 9) | (((date.getMonth() + 1) & 15) << 5) | (date.getDate() & 31);
  return { time, day };
}

function uint16(value) { const out = new Uint8Array(2); new DataView(out.buffer).setUint16(0, value, true); return out; }
function uint32(value) { const out = new Uint8Array(4); new DataView(out.buffer).setUint32(0, value >>> 0, true); return out; }

function createZipBlob(entries) {
  const encoder = new TextEncoder();
  const now = dosDateTime(new Date());
  const parts = [];
  const central = [];
  let offset = 0;
  entries.forEach((entry) => {
    const nameBytes = encoder.encode(entry.name);
    const data = typeof entry.content === 'string' ? encoder.encode(entry.content) : entry.content;
    const crc = crc32(data);
    const local = [uint32(0x04034b50), uint16(20), uint16(0), uint16(0), uint16(now.time), uint16(now.day), uint32(crc), uint32(data.length), uint32(data.length), uint16(nameBytes.length), uint16(0), nameBytes, data];
    local.forEach((part) => { parts.push(part); offset += part.length; });
    central.push({ nameBytes, crc, size: data.length, offset: offset - local.reduce((sum, part) => sum + part.length, 0) });
  });
  const centralStart = offset;
  central.forEach((entry) => {
    const header = [uint32(0x02014b50), uint16(20), uint16(20), uint16(0), uint16(0), uint16(now.time), uint16(now.day), uint32(entry.crc), uint32(entry.size), uint32(entry.size), uint16(entry.nameBytes.length), uint16(0), uint16(0), uint16(0), uint16(0), uint32(0), uint32(entry.offset), entry.nameBytes];
    header.forEach((part) => { parts.push(part); offset += part.length; });
  });
  const centralSize = offset - centralStart;
  [uint32(0x06054b50), uint16(0), uint16(0), uint16(central.length), uint16(central.length), uint32(centralSize), uint32(centralStart), uint16(0)].forEach((part) => parts.push(part));
  return new Blob(parts, { type: XLSX_MIME });
}

function presentIdsForCompletedMatch(match) {
  const ids = new Set([...(match?.teamYellowPlayerIds || []), ...(match?.teamBluePlayerIds || [])]);
  (match?.presences || []).forEach((item) => { if (item?.present && item.playerId) ids.add(item.playerId); });
  const contribs = Array.isArray(match?.contributions) && match.contributions.length ? match.contributions : buildMatchContributions(match || {});
  contribs.forEach((row) => { if (Number(row.matchesPlayed || 0) > 0 && row.playerId) ids.add(row.playerId); });
  return ids;
}

function exportTableRows() {
  const seasonLabel = currentSeasonDisplay();
  const completed = completedMatches(matchesAscending());
  const aggregate = aggregatePlayersFromMatches(matches());
  const ranked = rankingPlayers(aggregate.length ? aggregate : players());
  const activePlayers = [...players()].filter((player) => !isPlayerArchived(player)).sort((a, b) => normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
  const playerName = (id) => playerById(id)?.displayName || id || '';
  const dateOf = (match) => match.dateLabel || match.dateIso || '';
  const presentIdsForMatch = presentIdsForCompletedMatch;
  const goalsText = (goals = [], key = 'scorerPlayerId') => goals.map((goal) => playerName(goal?.[key])).filter(Boolean).join(', ');
  const slotLine = (match, teamKey = 'yellow') => {
    const slots = sourceTeamSlots(match, teamKey);
    const detailed = COMPO_POSITION_OPTIONS
      .map((position) => slots[position] ? `${position}: ${playerName(slots[position])}` : '')
      .filter(Boolean)
      .join(' | ');
    if (detailed) return detailed;
    const ids = teamKey === 'blue' ? (match.teamBluePlayerIds || []) : (match.teamYellowPlayerIds || []);
    return ids.map(playerName).filter(Boolean).join(', ');
  };
  const rankedEligible = ranked.filter((player) => Number(player.matchesPlayed || 0) > 0 || Number(player.points || 0) > 0 || Number(player.goals || 0) || Number(player.assists || 0) || Number(player.mvps || 0));
  const rankingRows = rankedEligible.map((player) => {
    const overall = playerOverallRating(player.playerId);
    return {
      rang: Number(player.classement || 0), joueur: player.displayName, poste: getPlayerPositions(player).join(', '), j: Number(player.matchesPlayed || 0), pts: Number(player.points || 0), v: Number(player.wins || 0), n: Number(player.draws || 0), d: Number(player.losses || 0), bp: Number(player.goalsFor || 0), bc: Number(player.goalsAgainst || 0), diff: Number(player.goalDifference || 0), buts: Number(player.goals || 0), passes: Number(player.assists || 0), mvp: Number(player.mvps || 0), victoire: fmtPct(player.victoryRate), noteBase: Number(overall.base || 0), evolution: Number(overall.delta || 0), note: Number(overall.rating || 0)
    };
  });
  const presenceRows = completed.map((match) => {
    const present = presentIdsForMatch(match);
    const row = { date: dateOf(match) };
    activePlayers.forEach((player) => { row[player.playerId] = present.has(player.playerId) ? 'OUI' : 'NON'; });
    return row;
  });
  const compoRows = completed.map((match) => ({
    date: dateOf(match), jaune: slotLine(match, 'yellow'), bleu: slotLine(match, 'blue'), mvpJaune: playerName(match.yellowMvpPlayerId), mvpBleu: playerName(match.blueMvpPlayerId)
  }));
  const resultRows = completed.map((match) => ({
    date: dateOf(match), jaune: Number(match.yellowScore || 0), bleu: Number(match.blueScore || 0), resultat: Number(match.yellowScore || 0) > Number(match.blueScore || 0) ? 'Jaune' : Number(match.blueScore || 0) > Number(match.yellowScore || 0) ? 'Bleu' : 'Nul', buteursJaune: goalsText(match.yellowGoals || [], 'scorerPlayerId'), buteursBleu: goalsText(match.blueGoals || [], 'scorerPlayerId'), passeursJaune: goalsText(match.yellowGoals || [], 'assistPlayerId'), passeursBleu: goalsText(match.blueGoals || [], 'assistPlayerId')
  }));
  const metricRows = (metric, label) => rankedEligible
    .filter((player) => Number(player[metric] || 0) > 0 || Number(player.matchesPlayed || 0) > 0)
    .sort((a, b) => Number(b[metric] || 0) - Number(a[metric] || 0) || Number(a.classement || 999) - Number(b.classement || 999) || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)))
    .map((player, index) => ({ rang: index + 1, joueur: player.displayName, [label]: Number(player[metric] || 0), j: Number(player.matchesPlayed || 0), moyenne: (Number(player[metric] || 0) / Math.max(1, Number(player.matchesPlayed || 0))).toFixed(2), classement: Number(player.classement || 0) }));
  const ballonRows = [...ballonOrPlayers()]
    .sort((a, b) => Number(a.ballonOrRank || 999) - Number(b.ballonOrRank || 999))
    .map((player) => ({
      rang: Number(player.ballonOrRank || 0), joueur: player.displayName, score: Number(player.ballonOrScore || 0), classementGeneral: Number(player.classement || 0), j: Number(player.matchesPlayed || 0), pts: Number(player.points || 0), ba: Number(player.goals || 0) + Number(player.assists || 0), mvp: Number(player.mvps || 0)
    }));
  const totalGoals = completed.reduce((sum, match) => sum + Number(match.yellowScore || 0) + Number(match.blueScore || 0), 0);
  const avgPresence = completed.length ? Math.round(completed.reduce((sum, match) => sum + presentIdsForMatch(match).size, 0) / completed.length) : 0;
  const summaryRows = [
    { indicateur: 'Saison', valeur: seasonLabel },
    { indicateur: 'Journées clôturées', valeur: completed.length },
    { indicateur: 'Joueurs au classement', valeur: rankedEligible.length },
    { indicateur: 'Buts inscrits', valeur: totalGoals },
    { indicateur: 'Moyenne présents', valeur: avgPresence },
    ...seasonSummaryRows().map(([indicateur, valeur]) => ({ indicateur, valeur })),
    { indicateur: 'Règle Ballon d’Or', valeur: 'Score saison · égalité départagée au classement général' },
    { indicateur: 'Règle note générale', valeur: '30% /Journée + 70% /match harmonisé · note base ± évolution' },
  ];
  return {
    rankingRows,
    presenceRows,
    presenceColumns: [{ key: 'date', label: 'Date', width: 14 }, ...activePlayers.map((player) => ({ key: player.playerId, label: player.displayName, width: 14 }))],
    compoRows,
    resultRows,
    scorerRows: metricRows('goals', 'buts'),
    passerRows: metricRows('assists', 'passes'),
    mvpRows: metricRows('mvps', 'mvp'),
    ballonRows,
    summaryRows,
  };
}

function createExcelExportBlob(rootData, exportedAt) {
  const data = exportTableRows(rootData);
  const seasonLabel = currentSeasonDisplay();
  const subtitle = `Saison ${seasonLabel} · export ${new Date(exportedAt).toLocaleString('fr-FR')}`;
  const rankingColumns = [
    { key: 'rang', label: '#', width: 7, type: 'number' }, { key: 'joueur', label: 'Joueur', width: 22 }, { key: 'poste', label: 'Postes', width: 18 }, { key: 'j', label: 'J', width: 7, type: 'number' }, { key: 'pts', label: 'PTS', width: 8, type: 'number' }, { key: 'v', label: 'V', width: 6, type: 'number' }, { key: 'n', label: 'N', width: 6, type: 'number' }, { key: 'd', label: 'D', width: 6, type: 'number' }, { key: 'bp', label: 'BP', width: 8, type: 'number' }, { key: 'bc', label: 'BC', width: 8, type: 'number' }, { key: 'diff', label: 'Diff', width: 8, type: 'number' }, { key: 'buts', label: 'Buts', width: 8, type: 'number' }, { key: 'passes', label: 'Passes', width: 8, type: 'number' }, { key: 'mvp', label: 'MVP', width: 8, type: 'number' }, { key: 'victoire', label: '%V', width: 8 }, { key: 'noteBase', label: 'Base', width: 8, type: 'number' }, { key: 'evolution', label: '+/-', width: 8, type: 'number' }, { key: 'note', label: 'Note', width: 8, type: 'number' }
  ];
  const metricColumns = (key, label) => [
    { key: 'rang', label: '#', width: 7, type: 'number' }, { key: 'joueur', label: 'Joueur', width: 24 }, { key, label, width: 10, type: 'number' }, { key: 'j', label: 'J', width: 8, type: 'number' }, { key: 'moyenne', label: '/match', width: 10 }, { key: 'classement', label: 'Général', width: 10, type: 'number' }
  ];
  const sheets = [
    { name: 'Classement général', title: 'Classement général', subtitle, columns: rankingColumns, rows: data.rankingRows },
    { name: 'Présence', title: 'Présence', subtitle, columns: data.presenceColumns, rows: data.presenceRows },
    { name: 'Compo', title: 'Compo', subtitle, columns: [{ key: 'date', label: 'Date', width: 14 }, { key: 'jaune', label: 'Jaune', width: 80 }, { key: 'bleu', label: 'Bleu', width: 80 }, { key: 'mvpJaune', label: 'MVP jaune', width: 18 }, { key: 'mvpBleu', label: 'MVP bleu', width: 18 }], rows: data.compoRows },
    { name: 'Résultat', title: 'Résultat', subtitle, columns: [{ key: 'date', label: 'Date', width: 14 }, { key: 'jaune', label: 'Jaune', width: 10, type: 'number' }, { key: 'bleu', label: 'Bleu', width: 10, type: 'number' }, { key: 'resultat', label: 'Résultat', width: 12 }, { key: 'buteursJaune', label: 'Buteurs jaune', width: 44 }, { key: 'buteursBleu', label: 'Buteurs bleu', width: 44 }, { key: 'passeursJaune', label: 'Passeurs jaune', width: 44 }, { key: 'passeursBleu', label: 'Passeurs bleu', width: 44 }], rows: data.resultRows },
    { name: 'Classement buteurs', title: 'Classement buteurs', subtitle, columns: metricColumns('buts', 'Buts'), rows: data.scorerRows },
    { name: 'Classement passeurs', title: 'Classement passeurs', subtitle, columns: metricColumns('passes', 'Passes'), rows: data.passerRows },
    { name: 'Classement MVP', title: 'Classement MVP', subtitle, columns: metricColumns('mvp', 'MVP'), rows: data.mvpRows },
    { name: 'Classement Ballon d Or', title: 'Classement Ballon d’Or', subtitle, columns: [{ key: 'rang', label: '#', width: 7, type: 'number' }, { key: 'joueur', label: 'Joueur', width: 24 }, { key: 'score', label: 'Score', width: 10, type: 'number' }, { key: 'classementGeneral', label: 'Général', width: 10, type: 'number' }, { key: 'j', label: 'J', width: 8, type: 'number' }, { key: 'pts', label: 'PTS', width: 8, type: 'number' }, { key: 'ba', label: 'B+A', width: 8, type: 'number' }, { key: 'mvp', label: 'MVP', width: 8, type: 'number' }], rows: data.ballonRows },
    { name: 'Résumé saison', title: 'Résumé saison', subtitle, columns: [{ key: 'indicateur', label: 'Indicateur', width: 30 }, { key: 'valeur', label: 'Valeur', width: 60 }], rows: data.summaryRows },
  ];
  const entries = [
    { name: '[Content_Types].xml', content: excelContentTypesXml(sheets) },
    { name: '_rels/.rels', content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>' },
    { name: 'docProps/core.xml', content: excelCoreXml(exportedAt) },
    { name: 'docProps/app.xml', content: excelAppXml(sheets) },
    { name: 'xl/workbook.xml', content: excelWorkbookXml(sheets) },
    { name: 'xl/_rels/workbook.xml.rels', content: excelWorkbookRelsXml(sheets) },
    { name: 'xl/styles.xml', content: excelStylesXml() },
    ...sheets.map((sheet, idx) => ({ name: `xl/worksheets/sheet${idx + 1}.xml`, content: excelBuildWorksheetXml(sheet) })),
  ];
  return createZipBlob(entries);
}


async function persistWholeRoot(nextRoot) {
  state.root = nextRoot;
  cacheRoot(nextRoot);
  await set(ref(db, '/'), nextRoot);
}

function seasonDisplayToId(displayName = '') {
  const value = String(displayName || '').trim();
  if (!value) return '';
  const clean = value.replace(/\s+/g, '').replace(/-/g, '_').replace(/\//g, '_').replace(/[^0-9A-Za-z_]/g, '').toLowerCase();
  return clean.startsWith('saison_') ? clean : `saison_${clean}`;
}

function createDefaultPlayer(displayName, avatarFamily = '1', preferredPositions = ['MC']) {
  const trimmed = String(displayName || '').trim();
  const normalized = normalizeString(trimmed).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return {
    playerId: normalized || `player_${Date.now()}`,
    displayName: trimmed || 'Nouveau joueur',
    avatarId: `Avatar_N${String(avatarFamily) === '2' ? '2' : '1'}`,
    preferredPositions: Array.isArray(preferredPositions) && preferredPositions.length ? [...new Set(preferredPositions.map((pos) => String(pos || '').trim()).filter(Boolean))] : ['MC'],
    classement: 0,
    points: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    goals: 0,
    assists: 0,
    mvps: 0,
    presences: 0,
    absences: 0,
    victoryRate: 0,
  };
}

function createPresenceRow(playerId, status = 'pending') {
  const cleanStatus = ['pending', 'present', 'absent', 'injured'].includes(status) ? status : 'pending';
  return { playerId, present: cleanStatus === 'present', status: cleanStatus };
}

function presenceStatusFromRow(row, draftMode = false) {
  if (!row) return 'pending';
  const raw = String(row.status || row.presenceStatus || '').trim();
  if (['pending', 'present', 'absent', 'injured'].includes(raw)) return raw;
  if (row.injured === true) return 'injured';
  if (row.present === true) return 'present';
  return draftMode ? 'pending' : 'absent';
}

function presenceStatusLabel(status) {
  if (status === 'present') return 'Présent';
  if (status === 'absent') return 'Absent';
  if (status === 'injured') return 'Blessé';
  return 'Pas voté';
}

function nextPresenceStatus(status) {
  if (status === 'pending') return 'present';
  if (status === 'present') return 'absent';
  if (status === 'absent') return 'injured';
  return 'pending';
}

function createEmptyDraftMatch(playersList = []) {
  const nextInfo = nextSundayInfo();
  return {
    dateIso: nextInfo.iso,
    dateLabel: nextInfo.date,
    time: nextInfo.time,
    presences: playersList.map((player) => createPresenceRow(player.playerId, 'pending')),
    teamYellowPlayerIds: [],
    teamBluePlayerIds: [],
    yellowLines: { gb: [], dc: [], mc: [], bu: [] },
    blueLines: { gb: [], dc: [], mc: [], bu: [] },
    yellowSlots: emptyDetailedSlots(),
    blueSlots: emptyDetailedSlots(),
    yellowGoals: [],
    blueGoals: [],
    yellowMvpPlayerId: '',
    blueMvpPlayerId: '',
    updatedAt: Date.now(),
  };
}

function createSeasonTemplate(seasonId, displayName, playersList = []) {
  return {
    id: seasonId,
    displayName,
    nextMatchNumber: 1,
    players: playersList.map((player) => emptyPlayerSeason(player)),
    matches: [],
    draftMatch: createEmptyDraftMatch(playersList),
  };
}

function seasonData() {
  return state.root?.seasons?.[state.activeSeasonId] ?? null;
}

function players() {
  return [...(seasonData()?.players ?? [])];
}

function isPlayerArchived(player) {
  return !!(player?.archived || player?.archivedAt || player?.deletedAt);
}

function activePlayers(base = players()) {
  return [...(base || [])].filter((player) => !isPlayerArchived(player));
}

function isPlayerExcludedFromRanking(player) {
  return !!(player?.excludedFromRanking || player?.rankingExcluded || player?.temporaryMatchOnly || player?.guestOnly);
}

function rankingPlayers(base = players()) {
  return activePlayers(base).filter((player) => !isPlayerExcludedFromRanking(player));
}

function archiveTemporaryPlayers(base = players()) {
  const now = Date.now();
  return [...(base || [])].map((player) => player?.temporaryMatchOnly && !isPlayerArchived(player)
    ? { ...player, archived: true, archivedAt: now }
    : player
  );
}

function playersInMatch(match = null) {
  const ids = new Set();
  if (!match) return activePlayers();
  (match.presences || []).forEach((row) => { if (row?.playerId) ids.add(row.playerId); });
  flattenDetailedSlots(normalizeDetailedSlots(match.yellowSlots, match.yellowLines, match.teamYellowPlayerIds || [])).forEach((id) => ids.add(id));
  flattenDetailedSlots(normalizeDetailedSlots(match.blueSlots, match.blueLines, match.teamBluePlayerIds || [])).forEach((id) => ids.add(id));
  [...(match.yellowGoals || []), ...(match.blueGoals || [])].forEach((goal) => {
    if (goal?.scorerPlayerId) ids.add(goal.scorerPlayerId);
    if (goal?.assistPlayerId) ids.add(goal.assistPlayerId);
  });
  if (match.yellowMvpPlayerId) ids.add(match.yellowMvpPlayerId);
  if (match.blueMvpPlayerId) ids.add(match.blueMvpPlayerId);
  const byId = new Map(players().map((player) => [player.playerId, player]));
  const pool = activePlayers();
  ids.forEach((id) => { const player = byId.get(id); if (player && !pool.some((item) => item.playerId === id)) pool.push(player); });
  return pool;
}

function matches() {
  return [...(seasonData()?.matches ?? [])].sort((a, b) => (b.dateIso || '').localeCompare(a.dateIso || ''));
}

function todayIso() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function completedMatches(baseMatches = matches()) {
  return [...baseMatches].filter((match) => {
    if (match.statsApplied === false) return false;
    return typeof match.yellowScore === 'number' && typeof match.blueScore === 'number';
  });
}

function currentMatchdayNumber() {
  const explicit = Number(seasonData()?.nextMatchNumber || 0);
  const fromIndex = explicit > 1 ? explicit - 1 : 0;
  return Math.max(fromIndex, completedMatches().length);
}

function playerById(playerId) {
  return players().find((player) => player.playerId === playerId);
}

function currentSeasonDisplay() {
  const season = state.root?.seasonIndex?.seasons?.find((item) => item.id === state.activeSeasonId);
  return season?.displayName || '--/--';
}

function seasonDataById(seasonId) {
  return state.root?.seasons?.[seasonId] ?? null;
}

function playersForSeason(seasonId) {
  return [...(seasonDataById(seasonId)?.players ?? [])];
}

function matchesForSeason(seasonId) {
  return [...(seasonDataById(seasonId)?.matches ?? [])].sort((a, b) => (b.dateIso || '').localeCompare(a.dateIso || ''));
}

function playerByIdFromSeason(seasonId, playerId) {
  return playersForSeason(seasonId).find((player) => player.playerId === playerId) || null;
}

function avatarFor(player, teamColor = 'red') {
  const avatarId = String(player?.avatarId || 'Avatar_N1');
  const family = avatarId.endsWith('2') ? '2' : '1';
  if (teamColor === 'yellow') return assetPath(`Avatar_J${family}`, `Avatar_J${family}.webp`);
  if (teamColor === 'blue') return assetPath(`Avatar_B${family}`, `Avatar_B${family}.webp`);
  return assetPath(`Avatar_N${family}`, `Avatar_N${family}.webp`);
}

function avatarFamily(player) {
  const avatarId = String(player?.avatarId || 'Avatar_N1');
  return avatarId.endsWith('2') ? '2' : '1';
}

function avatarForSlot(player, teamColor = 'red', slotPosition = '') {
  if (!player) return avatarFor(player, teamColor);
  const family = avatarFamily(player);
  if (slotPosition === 'GB') {
    if (teamColor === 'yellow') return assetPath(`Avatar_JG${family}`, `Avatar_JG${family}.webp`);
    if (teamColor === 'blue') return assetPath(`Avatar_BG${family}`, `Avatar_BG${family}.webp`);
    return assetPath(`Avatar_G${family}`, `Avatar_G${family}.webp`);
  }
  return avatarFor(player, teamColor === 'neutral' ? 'red' : teamColor);
}

function mvpAvatarFor(player, teamColor = 'yellow') {
  const family = avatarFamily(player);
  if (teamColor === 'blue') return assetPath(`MVP_B${family}`, `MVP_B${family}.webp`);
  return assetPath(`MVP_J${family}`, `MVP_J${family}.webp`);
}

function shareIconSvg() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="share-icon-svg"><path d="M18 8a3 3 0 1 0-2.82-4H15a3 3 0 0 0 .18 1L8.91 8.13a3 3 0 0 0-1.82-.63 3 3 0 1 0 0 6c.67 0 1.28-.22 1.78-.59l6.33 3.17a3 3 0 1 0 .72-1.45l-6.33-3.17c.06-.22.1-.45.1-.69s-.03-.44-.09-.65l6.28-3.13c.53.5 1.25.81 2.04.81Z" fill="currentColor"/></svg>`;
}

function shareButtonMarkup(dataAttr, classes = 'tab-btn header-share-btn icon-only-btn') {
  return `<button class="${classes}" ${dataAttr} aria-label="Partager" title="Partager" type="button">${shareIconSvg()}</button>`;
}

function downloadButtonMarkup(dataAttr, classes = 'tab-btn header-download-btn') {
  return `<button class="${classes}" ${dataAttr} type="button">Télécharger</button>`;
}

function recentFormDotsMarkup(playerId, limit = 5) {
  const form = recentForm(playerId, limit);
  if (!form.length) return '<span class="form-dots-empty">—</span>';
  return `<span class="form-dots" aria-label="Forme récente"><span class="form-dot marker" title="Lecture : dernier match à droite du point gris"></span>${form.map((item) => `<span class="form-dot ${item.result === 'V' ? 'win' : item.result === 'D' ? 'loss' : 'draw'}" title="${item.date} · ${item.result}"></span>`).join('')}</span>`;
}

function summarizeRepeatedNames(list = []) {
  const ordered = [];
  const map = new Map();
  list.forEach((raw) => {
    const name = normalizeName(raw);
    if (!name || name === '-') return;
    if (!map.has(name)) {
      const entry = { name, count: 1 };
      map.set(name, entry);
      ordered.push(entry);
      return;
    }
    map.get(name).count += 1;
  });
  return ordered.map((entry) => entry.count > 1 ? `${entry.name} x${entry.count}` : entry.name);
}

function slotPriorityForPlayer(player, slotPosition) {
  const positions = getPlayerPositions(player);
  const allowed = COMPO_SLOT_TO_GENERIC[slotPosition] || [];
  if (!positions.length || !allowed.length) return 2;
  if (allowed.includes(positions[0])) return 0;
  if (positions.slice(1).some((position) => allowed.includes(position))) return 1;
  return 2;
}

function fmtPct(value) {
  return `${Math.round(Number(value || 0))}%`;
}

function signed(value) {
  const n = Number(value || 0);
  return n > 0 ? `+${n}` : `${n}`;
}

function ordinal(n) {
  if (n === 1) return '1er';
  return `${n}e`;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeString(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}


function closeModalSafe(dialog) {
  try {
    if (dialog?.open) dialog.close();
  } catch {}
}

function showAppDialog({ title = 'C.O.V', message = '', confirmText = 'OK', cancelText = '', danger = false } = {}) {
  if (!els.actionDialog || !els.actionDialogTitle || !els.actionDialogBody || !els.actionDialogConfirm) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      els.actionDialogConfirm?.removeEventListener('click', onConfirm);
      els.actionDialogCancel?.removeEventListener('click', onCancel);
      els.actionDialogClose?.removeEventListener('click', onCancel);
      els.actionDialog?.removeEventListener('cancel', onCancelEvent);
      els.actionDialog?.removeEventListener('close', onClose);
      closeModalSafe(els.actionDialog);
      resolve(value);
    };
    const onConfirm = () => finish(true);
    const onCancel = () => finish(false);
    const onCancelEvent = (event) => { event.preventDefault(); finish(false); };
    const onClose = () => finish(false);

    els.actionDialogTitle.textContent = title;
    els.actionDialogBody.innerHTML = `<p class="action-dialog-text">${escapeHtml(message)}</p>`;
    els.actionDialogConfirm.textContent = confirmText;
    els.actionDialogConfirm.className = danger ? 'danger-btn' : 'primary-btn';
    if (els.actionDialogCancel) {
      els.actionDialogCancel.textContent = cancelText || 'Annuler';
      els.actionDialogCancel.hidden = !cancelText;
    }
    els.actionDialogConfirm.addEventListener('click', onConfirm);
    els.actionDialogCancel?.addEventListener('click', onCancel);
    els.actionDialogClose?.addEventListener('click', onCancel);
    els.actionDialog.addEventListener('cancel', onCancelEvent);
    els.actionDialog.addEventListener('close', onClose);
    closeModalSafe(els.actionDialog);
    els.actionDialog.showModal();
  });
}

async function showAppAlert(message, title = 'Information') {
  await showAppDialog({ title, message, confirmText: 'OK' });
}

async function showAppConfirm(message, title = 'Confirmation', confirmText = 'Confirmer', danger = false) {
  return showAppDialog({ title, message, confirmText, cancelText: 'Annuler', danger });
}
function persistRole() {}

function restoreRole() {
  state.userMode = null;
}

function updateHeader() {
  const isBoot = !state.userMode;
  const isTrophyView = state.activeView === 'trophy';
  if (els.topbar) els.topbar.hidden = isBoot || isTrophyView;
  if (els.bottomNav) els.bottomNav.hidden = isBoot;
  if (isBoot) return;

  let left = '';
  if (state.activeView === 'home') {
    left = `<button class="tab-btn season-open-btn" data-open-seasons="1" type="button">Saisons</button>`;
  } else if (state.activeView === 'ranking') {
    left = canShareGeneral() ? shareButtonMarkup('data-share-ranking="1"') : (canPlayerDownloadClosedSeason() ? downloadButtonMarkup('data-download-ranking="1"') : '');
  } else if (state.activeView === 'compo') {
    left = canShareCompo() ? shareButtonMarkup('data-share-compo="1"') : '';
  } else if (state.activeView === 'completeMatch') {
    left = `<button class="tab-btn" data-view-switch="home">Retour</button>`;
  }
  els.headerLeft.innerHTML = left;
  if (els.seasonBtn) {
    els.seasonBtn.textContent = currentSeasonDisplay();
    els.seasonBtn.classList.add('season-chip-display');
    els.seasonBtn.classList.remove('season-chip-attention');
    els.seasonBtn.disabled = true;
    els.seasonBtn.setAttribute('aria-label', `Saison affichée ${currentSeasonDisplay()}`);
  }

  const adminNavBtn = document.querySelector('.nav-btn[data-view="admin"]');
  const elevenNavBtn = document.querySelector('.nav-btn[data-view="elevenmanage"]');
  if (adminNavBtn) adminNavBtn.hidden = !isPresident();
  if (elevenNavBtn) elevenNavBtn.hidden = !isPresident();
  if (!isPresident() && (state.activeView === 'admin' || state.activeView === 'elevenmanage')) state.activeView = 'home';
  const mainViews = ['home','players','results','compo','ranking','trophy','admin','elevenmanage','ballonor'];
  navButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.view === state.activeView));
  if (els.bottomNav) els.bottomNav.hidden = !mainViews.includes(state.activeView);

  els.headerLeft.querySelectorAll('[data-share-ranking]').forEach((btn) => btn.addEventListener('click', () => shareRanking()));
  els.headerLeft.querySelectorAll('[data-download-ranking]').forEach((btn) => btn.addEventListener('click', () => downloadRanking()));
  els.headerLeft.querySelectorAll('[data-share-compo]').forEach((btn) => btn.addEventListener('click', () => shareCurrentCompo()));
  els.headerLeft.querySelectorAll('[data-open-install]').forEach((btn) => btn.addEventListener('click', () => showInstallDialog()));
  els.headerLeft.querySelectorAll('[data-open-seasons]').forEach((btn) => btn.addEventListener('click', () => els.seasonDialog.showModal()));
  els.headerLeft.querySelectorAll('[data-view-switch]').forEach((btn) => btn.addEventListener('click', () => setView(btn.dataset.viewSwitch)));
}

function linesFromIds(ids = []) {
  const rows = arrangeTeamSimple(ids);
  return { gb: [...rows.goalkeeper], dc: [...rows.defense], mc: [...rows.midfield], bu: [...rows.attack, ...rows.extras] };
}

function normalizeDraftLines(lines, fallbackIds = []) {
  const base = lines && typeof lines === 'object' ? lines : linesFromIds(fallbackIds);
  return {
    gb: [...(base.gb || [])],
    dc: [...(base.dc || [])],
    mc: [...(base.mc || [])],
    bu: [...(base.bu || [])],
  };
}

function flattenLines(lines) {
  const norm = normalizeDraftLines(lines);
  return [...norm.gb, ...norm.dc, ...norm.mc, ...norm.bu];
}

function currentDraft() {
  const draft = seasonData()?.draftMatch || {};
  const upcoming = upcomingMatchFromSeason();
  const yellowSlots = normalizeDetailedSlots(draft.yellowSlots || upcoming?.yellowSlots, draft.yellowLines || upcoming?.yellowLines, draft.teamYellowPlayerIds || upcoming?.teamYellowPlayerIds || []);
  const blueSlots = normalizeDetailedSlots(draft.blueSlots || upcoming?.blueSlots, draft.blueLines || upcoming?.blueLines, draft.teamBluePlayerIds || upcoming?.teamBluePlayerIds || []);
  return {
    dateIso: draft.dateIso || upcoming?.dateIso || currentUpcomingInfo().dateIso,
    dateLabel: draft.dateLabel || upcoming?.dateLabel || currentUpcomingInfo().dateLabel,
    time: draft.time || upcoming?.time || currentUpcomingInfo().time,
    presences: Array.isArray(draft.presences) ? draft.presences : Array.isArray(upcoming?.presences) ? upcoming.presences : [],
    teamYellowPlayerIds: Array.isArray(draft.teamYellowPlayerIds) ? draft.teamYellowPlayerIds : flattenDetailedSlots(yellowSlots),
    teamBluePlayerIds: Array.isArray(draft.teamBluePlayerIds) ? draft.teamBluePlayerIds : flattenDetailedSlots(blueSlots),
    yellowLines: draft.yellowLines || legacyLinesFromDetailedSlots(yellowSlots),
    blueLines: draft.blueLines || legacyLinesFromDetailedSlots(blueSlots),
    yellowSlots,
    blueSlots,
    yellowGoals: Array.isArray(draft.yellowGoals) ? draft.yellowGoals : Array.isArray(upcoming?.yellowGoals) ? upcoming.yellowGoals : [],
    blueGoals: Array.isArray(draft.blueGoals) ? draft.blueGoals : Array.isArray(upcoming?.blueGoals) ? upcoming.blueGoals : [],
    yellowMvpPlayerId: draft.yellowMvpPlayerId || upcoming?.yellowMvpPlayerId || '',
    blueMvpPlayerId: draft.blueMvpPlayerId || upcoming?.blueMvpPlayerId || '',
    updatedAt: draft.updatedAt || null
  };
}

function ensureCoachEditors() {
  const draft = currentEditableMatch() || currentDraft();
  if (!state.coachPresenceEdits) {
    const map = {};
    const draftMode = !state.editingMatchId;
    (draft.presences || []).forEach((item) => { map[item.playerId] = presenceStatusFromRow(item, draftMode); });
    playersInMatch(draft).forEach((player) => { if (!(player.playerId in map)) map[player.playerId] = draftMode ? 'pending' : 'absent'; });
    state.coachPresenceEdits = map;
  }
  if (!state.coachYellowSlots) state.coachYellowSlots = normalizeDetailedSlots(draft.yellowSlots, draft.yellowLines, draft.teamYellowPlayerIds || []);
  if (!state.coachBlueSlots) state.coachBlueSlots = normalizeDetailedSlots(draft.blueSlots, draft.blueLines, draft.teamBluePlayerIds || []);
}

function resetCoachEditors() {
  state.coachPresenceEdits = null;
  state.coachYellowEdits = null;
  state.coachBlueEdits = null;
  state.coachYellowLines = null;
  state.coachBlueLines = null;
  state.coachYellowSlots = null;
  state.coachBlueSlots = null;
  state.coachSelectedLane = 'GB';
}

function draftPresenceMap() {
  ensureCoachEditors();
  const map = new Map();
  Object.entries(state.coachPresenceEdits || {}).forEach(([id, status]) => map.set(id, String(status || 'pending')));
  return map;
}


function presentPlayerIdsFromDraft() {
  const map = draftPresenceMap();
  return [...map.entries()]
    .filter(([, status]) => status === 'present')
    .map(([playerId]) => playerId);
}

function laneQuota(lane) {
  return 1;
}

function laneKey(lane) {
  return lane;
}

function laneLabel(lane) {
  return compoPositionLabel(lane);
}

function teamLineCount(lines, lane) {
  return lines?.[lane] ? 1 : 0;
}

function canAssignToTeam(lines, lane) {
  return true;
}

function assignPlayerToSlot(playerId, team, position) {
  COMPO_POSITION_OPTIONS.forEach((slot) => {
    if (state.coachYellowSlots?.[slot] === playerId) state.coachYellowSlots[slot] = '';
    if (state.coachBlueSlots?.[slot] === playerId) state.coachBlueSlots[slot] = '';
  });
  const target = team === 'yellow' ? state.coachYellowSlots : state.coachBlueSlots;
  target[position] = playerId;
}

function unassignPlayer(playerId) {
  COMPO_POSITION_OPTIONS.forEach((slot) => {
    if (state.coachYellowSlots?.[slot] === playerId) state.coachYellowSlots[slot] = '';
    if (state.coachBlueSlots?.[slot] === playerId) state.coachBlueSlots[slot] = '';
  });
}

function isCoach() {
  return state.userMode === 'coach';
}

function isPresident() {
  return state.userMode === 'president';
}

function canCompleteMatch() {
  return isCoach() || isPresident();
}

function canShareGeneral() {
  return isPresident();
}

function activeSeasonIsClosed() {
  return !!seasonData()?.closedAt;
}

function canPlayerDownloadClosedSeason() {
  return state.userMode === 'player' && activeSeasonIsClosed();
}

function canShareCompo() {
  return isPresident();
}

function canEditPositions() {
  return isPresident();
}


function nextMatchId(list) {
  const ids = list.map((m) => Number(String(m.matchId || '').replace(/\D/g, ''))).filter(Boolean);
  const maxId = ids.length ? Math.max(...ids) : Number(seasonData()?.nextMatchNumber || 0);
  return `match_${String(maxId + 1).padStart(3, '0')}`;
}

function upsertMatch(list, match) {
  const out = [...list];
  const index = out.findIndex((item) => item.matchId === match.matchId || ((item.dateIso || '') === (match.dateIso || '') && item.statsApplied === false));
  if (index >= 0) out[index] = match;
  else out.push(match);
  out.sort((a, b) => (a.dateIso || '').localeCompare(b.dateIso || ''));
  return out;
}

function createOrUpdateUpcomingMatch(nextDraft) {
  const season = seasonData();
  const list = Array.isArray(season?.matches) ? [...season.matches] : [];
  const existing = upcomingMatchFromSeason();
  const base = existing ? { ...existing } : {};
  const presences = Array.isArray(nextDraft.presences) ? nextDraft.presences.filter((row) => activePlayers().some((player) => player.playerId === row.playerId)).map((row) => createPresenceRow(row.playerId, presenceStatusFromRow(row, true))) : activePlayers().map((player) => createPresenceRow(player.playerId, 'pending'));
  const yellowSlots = normalizeDetailedSlots(nextDraft.yellowSlots, nextDraft.yellowLines, nextDraft.teamYellowPlayerIds || []);
  const blueSlots = normalizeDetailedSlots(nextDraft.blueSlots, nextDraft.blueLines, nextDraft.teamBluePlayerIds || []);
  const synced = {
    matchId: base.matchId || nextMatchId(list),
    dateIso: nextDraft.dateIso,
    dateLabel: nextDraft.dateLabel,
    time: nextDraft.time || '9h00 - 10h30',
    yellowScore: typeof base.yellowScore === 'number' ? base.yellowScore : 0,
    blueScore: typeof base.blueScore === 'number' ? base.blueScore : 0,
    presences,
    teamYellowPlayerIds: Array.isArray(nextDraft.teamYellowPlayerIds) ? nextDraft.teamYellowPlayerIds : flattenDetailedSlots(yellowSlots),
    teamBluePlayerIds: Array.isArray(nextDraft.teamBluePlayerIds) ? nextDraft.teamBluePlayerIds : flattenDetailedSlots(blueSlots),
    yellowLines: legacyLinesFromDetailedSlots(yellowSlots),
    blueLines: legacyLinesFromDetailedSlots(blueSlots),
    yellowSlots,
    blueSlots,
    yellowGoals: Array.isArray(nextDraft.yellowGoals) ? nextDraft.yellowGoals : Array.isArray(base.yellowGoals) ? base.yellowGoals : [],
    blueGoals: Array.isArray(nextDraft.blueGoals) ? nextDraft.blueGoals : Array.isArray(base.blueGoals) ? base.blueGoals : [],
    yellowMvpPlayerId: nextDraft.yellowMvpPlayerId || base.yellowMvpPlayerId || '',
    blueMvpPlayerId: nextDraft.blueMvpPlayerId || base.blueMvpPlayerId || '',
    contributions: Array.isArray(base.contributions) ? base.contributions : [],
    statsApplied: typeof base.statsApplied === 'boolean' ? base.statsApplied : false,
    closedAt: base.closedAt || null
  };
  return upsertMatch(list, synced);
}

function emptyPlayerSeason(base) {
  return {
    ...base,
    classement: 0,
    points: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    goals: 0,
    assists: 0,
    mvps: 0,
    presences: 0,
    absences: 0,
    victoryRate: 0,
  };
}

function buildMatchContributions(match) {
  const matchPlayers = playersInMatch(match);
  const templates = matchPlayers.map(emptyPlayerSeason).map((player) => ({
    playerId: player.playerId,
    points: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goals: 0,
    assists: 0,
    mvps: 0,
    presences: 0,
    absences: 0,
  }));
  const map = new Map(templates.map((item) => [item.playerId, item]));
  const yellowIds = new Set(match.teamYellowPlayerIds || []);
  const blueIds = new Set(match.teamBluePlayerIds || []);
  const ys = Number(match.yellowScore || 0);
  const bs = Number(match.blueScore || 0);
  const presences = Array.isArray(match.presences) ? match.presences : [];
  const presentMap = new Map(presences.map((item) => [item.playerId, !!item.present]));
  matchPlayers.forEach((player) => {
    const row = map.get(player.playerId);
    const present = presentMap.has(player.playerId) ? presentMap.get(player.playerId) : (yellowIds.has(player.playerId) || blueIds.has(player.playerId));
    if (!present) {
      row.absences += 1;
      return;
    }
    row.presences += 1;
    let team = yellowIds.has(player.playerId) ? 'yellow' : blueIds.has(player.playerId) ? 'blue' : null;
    if (!team) return;
    row.matchesPlayed += 1;
    const gf = team === 'yellow' ? ys : bs;
    const ga = team === 'yellow' ? bs : ys;
    row.goalsFor += gf;
    row.goalsAgainst += ga;
    if (gf > ga) {
      row.wins += 1;
      row.points += 3;
    } else if (gf === ga) {
      row.draws += 1;
      row.points += 1;
    } else {
      row.losses += 1;
    }
  });
  [...(match.yellowGoals || []), ...(match.blueGoals || [])].forEach((goal) => {
    if (goal.scorerPlayerId && map.has(goal.scorerPlayerId)) map.get(goal.scorerPlayerId).goals += 1;
    if (goal.assistPlayerId && map.has(goal.assistPlayerId)) map.get(goal.assistPlayerId).assists += 1;
  });
  if (match.yellowMvpPlayerId && map.has(match.yellowMvpPlayerId)) map.get(match.yellowMvpPlayerId).mvps += 1;
  if (match.blueMvpPlayerId && map.has(match.blueMvpPlayerId)) map.get(match.blueMvpPlayerId).mvps += 1;
  return [...map.values()].map((row) => ({ ...row }));
}

function aggregatePlayersFromMatches(matchesList) {
  const templateById = new Map(players().map((player) => [player.playerId, emptyPlayerSeason(player)]));
  const out = new Map([...templateById.entries()].map(([id, p]) => [id, { ...p }]));
  completedMatches(matchesList).forEach((match) => {
    const contributions = Array.isArray(match.contributions) && match.contributions.length ? match.contributions : buildMatchContributions(match);
    contributions.forEach((row) => {
      if (!out.has(row.playerId)) {
        const fallback = playerById(row.playerId) || { playerId: row.playerId, displayName: row.displayName || row.playerId, avatarId: 'Avatar_N1', preferredPositions: ['MC'], archived: true };
        out.set(row.playerId, emptyPlayerSeason(fallback));
      }
      const target = out.get(row.playerId);
      ['points','matchesPlayed','wins','draws','losses','goalsFor','goalsAgainst','goals','assists','mvps','presences','absences'].forEach((key) => {
        target[key] += Number(row[key] || 0);
      });
    });
  });
  const list = [...out.values()].map((player) => ({
    ...player,
    goalDifference: Number(player.goalsFor || 0) - Number(player.goalsAgainst || 0),
    victoryRate: Number(player.matchesPlayed || 0) ? Math.round((Number(player.wins || 0) / Number(player.matchesPlayed || 0)) * 100) : 0,
  }));
  const sorter = (a, b) => Number(b.points || 0) - Number(a.points || 0)
    || Number(b.goalDifference || 0) - Number(a.goalDifference || 0)
    || Number(b.goals || 0) - Number(a.goals || 0)
    || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName));
  const visible = list.filter((player) => !isPlayerArchived(player) && !isPlayerExcludedFromRanking(player)).sort(sorter);
  visible.forEach((player, index) => { player.classement = index + 1; });
  list.filter((player) => isPlayerArchived(player) || isPlayerExcludedFromRanking(player)).forEach((player) => { player.classement = 0; });
  return list.sort((a, b) => Number(a.classement || 9999) - Number(b.classement || 9999) || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
}

async function applySeasonUpdate(nextMatches, nextDraft, nextPlayers = null) {
  const season = state.root?.seasons?.[state.activeSeasonId];
  const updatedSeason = {
    ...season,
    draftMatch: nextDraft,
    matches: nextMatches,
    players: nextPlayers || season.players,
  };
  state.root = {
    ...state.root,
    seasons: {
      ...state.root.seasons,
      [state.activeSeasonId]: updatedSeason,
    }
  };
  cacheRoot(state.root);
  const promises = [
    set(ref(db, `/seasons/${state.activeSeasonId}/draftMatch`), nextDraft),
    set(ref(db, `/seasons/${state.activeSeasonId}/matches`), nextMatches),
  ];
  if (nextPlayers) promises.push(set(ref(db, `/seasons/${state.activeSeasonId}/players`), nextPlayers));
  await Promise.all(promises);
}

async function saveDraftPatch(patch) {
  state.coachSaving = true;
  renderCurrentView();
  const draft = currentDraft();
  const nextDraft = { ...draft, ...patch, updatedAt: Date.now() };
  const nextMatches = createOrUpdateUpcomingMatch(nextDraft);
  await applySeasonUpdate(nextMatches, nextDraft);
  state.coachSaving = false;
}

async function saveHistoricalMatch(matchId, patch, options = {}) {
  state.coachSaving = true;
  renderCurrentView();
  const current = matches().find((item) => item.matchId === matchId);
  if (!current) return;
  const merged = { ...current, ...patch };
  if (options.rebuildContributions) merged.contributions = buildMatchContributions(merged);
  const nextMatches = upsertMatch(matches(), merged);
  const nextPlayers = options.reaggregate ? aggregatePlayersFromMatches(nextMatches) : null;
  await applySeasonUpdate(nextMatches, currentDraft(), nextPlayers);
  state.coachSaving = false;
}

async function deleteHistoricalMatch(matchId) {
  const nextMatches = matches().filter((item) => item.matchId !== matchId);
  const nextPlayers = aggregatePlayersFromMatches(nextMatches);
  await applySeasonUpdate(nextMatches, currentDraft(), nextPlayers);
}

async function closeCurrentMatch(match) {
  state.coachSaving = true;
  renderCurrentView();
  const closed = {
    ...match,
    yellowScore: Array.isArray(match.yellowGoals) ? match.yellowGoals.length : Number(match.yellowScore || 0),
    blueScore: Array.isArray(match.blueGoals) ? match.blueGoals.length : Number(match.blueScore || 0),
    statsApplied: true,
    closedAt: Date.now(),
  };
  closed.contributions = buildMatchContributions(closed);
  let nextMatches = upsertMatch(matches(), closed);
  const nextPlayers = archiveTemporaryPlayers(aggregatePlayersFromMatches(nextMatches));
  const nextInfo = nextSundayInfo(closed.dateIso || currentDraft().dateIso);
  const nextDraft = {
    dateIso: nextInfo.iso,
    dateLabel: nextInfo.date,
    time: nextInfo.time,
    presences: activePlayers(nextPlayers).map((player) => createPresenceRow(player.playerId, 'pending')),
    teamYellowPlayerIds: [],
    teamBluePlayerIds: [],
    yellowLines: { gb: [], dc: [], mc: [], bu: [] },
    blueLines: { gb: [], dc: [], mc: [], bu: [] },
    yellowSlots: emptyDetailedSlots(),
    blueSlots: emptyDetailedSlots(),
    yellowGoals: [],
    blueGoals: [],
    yellowMvpPlayerId: '',
    blueMvpPlayerId: '',
    updatedAt: Date.now(),
  };
  state.editingMatchId = null;
  resetCoachEditors();
  await applySeasonUpdate(nextMatches, nextDraft, nextPlayers);
  state.coachSaving = false;
}

async function skipUpcomingMatch() {
  state.coachSaving = true;
  renderCurrentView();
  const open = upcomingMatchFromSeason();
  let nextMatches = open ? matches().filter((item) => item.matchId !== open.matchId) : matches();
  const nextPlayers = archiveTemporaryPlayers(players());
  const nextInfo = nextSundayInfo((open?.dateIso) || currentDraft().dateIso);
  const nextDraft = {
    dateIso: nextInfo.iso,
    dateLabel: nextInfo.date,
    time: nextInfo.time,
    presences: activePlayers(nextPlayers).map((player) => createPresenceRow(player.playerId, 'pending')),
    teamYellowPlayerIds: [],
    teamBluePlayerIds: [],
    yellowLines: { gb: [], dc: [], mc: [], bu: [] },
    blueLines: { gb: [], dc: [], mc: [], bu: [] },
    yellowSlots: emptyDetailedSlots(),
    blueSlots: emptyDetailedSlots(),
    yellowGoals: [],
    blueGoals: [],
    yellowMvpPlayerId: '',
    blueMvpPlayerId: '',
    updatedAt: Date.now(),
  };
  state.editingMatchId = null;
  resetCoachEditors();
  await applySeasonUpdate(nextMatches, nextDraft, nextPlayers);
  state.coachSaving = false;
}

async function savePlayerPositions(playerId, positions) {
  state.playerPositionsSaving = true;
  const updated = players().map((player) => player.playerId === playerId ? { ...player, preferredPositions: positions } : player);
  if (state.root?.seasons?.[state.activeSeasonId]) {
    state.root = {
      ...state.root,
      seasons: {
        ...state.root.seasons,
        [state.activeSeasonId]: {
          ...state.root.seasons[state.activeSeasonId],
          players: updated
        }
      }
    };
  }
  await set(ref(db, `/seasons/${state.activeSeasonId}/players`), updated);
  state.playerPositionsSaving = false;
}

function splitByFormation(ids = []) {
  const list = [...ids];
  return {
    goalkeeper: list.slice(0,1),
    defense: list.slice(1,5),
    midfield: list.slice(5,9),
    attack: list.slice(9,11),
    extras: list.slice(11)
  };
}

function recentHistorySummary(limit = 5) {
  const recent = completedMatches().slice(0, limit);
  return {
    count: recent.length,
    yellowWins: recent.filter((m) => Number(m.yellowScore || 0) > Number(m.blueScore || 0)).length,
    draws: recent.filter((m) => Number(m.yellowScore || 0) === Number(m.blueScore || 0)).length,
    blueWins: recent.filter((m) => Number(m.yellowScore || 0) < Number(m.blueScore || 0)).length,
    yellowGoals: recent.reduce((sum, m) => sum + Number(m.yellowScore || 0), 0),
    blueGoals: recent.reduce((sum, m) => sum + Number(m.blueScore || 0), 0),
  };
}

function formatUpdatedAt(date) {
  if (!date) return 'Maj --';
  return `Maj ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

function updateLastUpdatedMeta() {}

function formatDateShort(iso) {
  if (!iso) return '—';
  const [year, month, day] = String(iso).split('-');
  if (!year || !month || !day) return iso;
  return `${day}/${month}`;
}

function matchesAscending() {
  return [...(seasonData()?.matches ?? [])].sort((a, b) => (a.dateIso || '').localeCompare(b.dateIso || ''));
}

function matchPerspectiveResult(match) {
  if (Number(match.yellowScore || 0) > Number(match.blueScore || 0)) return 'yellow';
  if (Number(match.yellowScore || 0) < Number(match.blueScore || 0)) return 'blue';
  return 'draw';
}

function filteredMatches(baseMatches = matches()) {
  if (state.resultsFilter === 'all') return [...baseMatches];
  return baseMatches.filter((match) => matchPerspectiveResult(match) === state.resultsFilter);
}

function recentForm(playerId, limit = 5) {
  return matchesAscending()
    .filter((match) => (match.contributions || []).some((c) => c.playerId === playerId && Number(c.matchesPlayed || 0) > 0))
    .slice(-limit)
    .reverse()
    .map((match) => {
      const contribution = (match.contributions || []).find((c) => c.playerId === playerId) || {};
      const points = Number(contribution.points || 0);
      const result = points >= 3 ? 'V' : points === 1 ? 'N' : 'D';
      return { result, date: match.dateLabel };
    });
}

function formMarkup(playerId) {
  const form = recentForm(playerId, 5);
  if (!form.length) return '<div class="detail-empty">Aucun match récent</div>';
  return `<div class="form-strip">${form.map((item) => `<span class="form-pill ${item.result === 'V' ? 'win' : item.result === 'N' ? 'draw' : 'loss'}" title="${item.date}">${item.result}</span>`).join('')}</div>`;
}

function topCategoryLeaders() {
  const list = rankingPlayers();
  const leaderFor = (metric, ascending = false) => [...list].sort((a, b) => ascending ? Number(a[metric] || 0) - Number(b[metric] || 0) : Number(b[metric] || 0) - Number(a[metric] || 0))[0]?.playerId;
  return {
    classement: [...list].sort((a, b) => Number(a.classement || 999) - Number(b.classement || 999))[0]?.playerId,
    buteur: leaderFor('goals'),
    passeur: leaderFor('assists'),
    mvp: leaderFor('mvps'),
    presence: leaderFor('presences')
  };
}

function badgeChipsForPlayer(player) {
  const leaders = topCategoryLeaders();
  const badges = [];
  if (leaders.classement === player.playerId) badges.push('👑 #1 classement');
  if (leaders.buteur === player.playerId) badges.push('⚽ #1 buteur');
  if (leaders.passeur === player.playerId) badges.push('🎯 #1 passeur');
  if (leaders.mvp === player.playerId) badges.push('⭐ #1 MVP');
  if (leaders.presence === player.playerId) badges.push('🟢 #1 présence');
  return badges;
}

function badgesMarkup(player) {
  const badges = badgeChipsForPlayer(player);
  if (!badges.length) return '';
  return `<div class="badge-row">${badges.map((badge) => `<span class="mini-badge">${badge}</span>`).join('')}</div>`;
}


function metricRankForPlayer(playerId, metric, descending = true) {
  const list = rankingPlayers().filter((player) => Number(player.matchesPlayed || 0) > 0 || Number(player[metric] || 0) > 0);
  const ordered = [...list].sort((a, b) => {
    const diff = descending ? Number(b[metric] || 0) - Number(a[metric] || 0) : Number(a[metric] || 0) - Number(b[metric] || 0);
    return diff || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName));
  });
  const index = ordered.findIndex((player) => player.playerId === playerId);
  return index >= 0 ? index + 1 : null;
}

function overallRankForPlayer(playerId, key = 'rating', descending = true) {
  const list = rankingPlayers().filter((player) => Number(player.matchesPlayed || 0) > 0);
  const ordered = [...list].sort((a, b) => {
    const av = Number(playerOverallRating(a.playerId)?.[key] || 0);
    const bv = Number(playerOverallRating(b.playerId)?.[key] || 0);
    const diff = descending ? bv - av : av - bv;
    return diff || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName));
  });
  const index = ordered.findIndex((player) => player.playerId === playerId);
  return index >= 0 ? index + 1 : null;
}

function playerBestStatLabel(player) {
  const ranks = [
    { label: 'buts', rank: metricRankForPlayer(player.playerId, 'goals') },
    { label: 'passes', rank: metricRankForPlayer(player.playerId, 'assists') },
    { label: 'MVP', rank: metricRankForPlayer(player.playerId, 'mvps') },
    { label: '% victoire', rank: metricRankForPlayer(player.playerId, 'victoryRate') },
    { label: 'note', rank: overallRankForPlayer(player.playerId, 'rating') },
  ].filter((item) => item.rank);
  if (!ranks.length) return '—';
  const best = ranks.sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label))[0];
  return `${best.label} · ${ordinal(best.rank)}`;
}

function playerProfileSummary(player) {
  const mainPos = getPlayerPositions(player)[0] || '';
  if (['GB'].includes(mainPos)) return 'Gardien · impact défensif';
  if (['DD','DC','DG'].includes(mainPos)) return 'Défenseur · équilibre équipe';
  if (['MDC','MC','MOC','MD','MG'].includes(mainPos)) return Number(player.assists || 0) >= Number(player.goals || 0) ? 'Milieu · création' : 'Milieu · impact complet';
  if (['AD','AC','AG','BU'].includes(mainPos)) return Number(player.goals || 0) >= Number(player.assists || 0) ? 'Attaquant · finition' : 'Attaquant · collectif';
  return 'Profil complet';
}

function previousMatchesFor(match, limit = 5) {
  return matchesAscending().filter((item) => (item.dateIso || '') < (match.dateIso || '')).slice(-limit);
}

function recentColorHistory(match) {
  const previous = previousMatchesFor(match, 5);
  return {
    yellowWins: previous.filter((m) => Number(m.yellowScore || 0) > Number(m.blueScore || 0)).length,
    blueWins: previous.filter((m) => Number(m.blueScore || 0) > Number(m.yellowScore || 0)).length,
    draws: previous.filter((m) => Number(m.blueScore || 0) === Number(m.yellowScore || 0)).length,
    total: previous.length
  };
}

function computeRecords() {
  const allPlayers = rankingPlayers();
  const allMatches = matches();
  const biggestTeamScore = allMatches.reduce((best, match) => {
    const maxScore = Math.max(Number(match.yellowScore || 0), Number(match.blueScore || 0));
    return !best || maxScore > best.value ? { value: maxScore, match } : best;
  }, null);
  const biggestCombined = allMatches.reduce((best, match) => {
    const total = Number(match.yellowScore || 0) + Number(match.blueScore || 0);
    return !best || total > best.value ? { value: total, match } : best;
  }, null);

  const bestScorerMatch = allMatches.reduce((best, match) => {
    const counts = {};
    [...(match.yellowGoals || []), ...(match.blueGoals || [])].forEach((goal) => {
      const id = goal.scorerPlayerId;
      if (!id) return;
      counts[id] = (counts[id] || 0) + 1;
    });
    const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!winner) return best;
    return !best || winner[1] > best.value ? { value: winner[1], playerId: winner[0], match } : best;
  }, null);

  const bestAssistMatch = allMatches.reduce((best, match) => {
    const counts = {};
    [...(match.yellowGoals || []), ...(match.blueGoals || [])].forEach((goal) => {
      const id = goal.assistPlayerId;
      if (!id) return;
      counts[id] = (counts[id] || 0) + 1;
    });
    const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!winner) return best;
    return !best || winner[1] > best.value ? { value: winner[1], playerId: winner[0], match } : best;
  }, null);

  const sortedBy = (metric) => [...allPlayers].sort((a, b) => Number(b[metric] || 0) - Number(a[metric] || 0))[0];
  return {
    bestScorerSeason: sortedBy('goals'),
    bestAssistSeason: sortedBy('assists'),
    bestMvpSeason: sortedBy('mvps'),
    bestPresenceSeason: sortedBy('presences'),
    biggestTeamScore,
    biggestCombined,
    bestScorerMatch,
    bestAssistMatch,
    bestPresenceStreak: computeBestPresenceStreak(),
  };
}

function isPlayerPresentInMatch(match, playerId) {
  const explicit = (match.presences || []).find((presence) => presence.playerId === playerId);
  if (explicit) return !!explicit.present;
  const yellowIds = flattenDetailedSlots(normalizeDetailedSlots(match.yellowSlots, match.yellowLines, match.teamYellowPlayerIds || []));
  const blueIds = flattenDetailedSlots(normalizeDetailedSlots(match.blueSlots, match.blueLines, match.teamBluePlayerIds || []));
  return yellowIds.includes(playerId) || blueIds.includes(playerId);
}

function computeBestPresenceStreak() {
  const all = completedMatches(matchesAscending());
  if (!all.length) return { playerId: '', value: 0 };
  const candidates = rankingPlayers().map((player) => {
    let streak = 0;
    all.forEach((match) => {
      streak = isPlayerPresentInMatch(match, player.playerId) ? streak + 1 : 0;
    });
    return {
      playerId: player.playerId,
      value: streak,
      classement: Number(player.classement || 999),
      name: normalizeString(player.displayName)
    };
  }).filter((item) => item.value > 0);
  candidates.sort((a, b) => Number(b.value || 0) - Number(a.value || 0)
    || Number(a.classement || 999) - Number(b.classement || 999)
    || a.name.localeCompare(b.name)
  );
  return candidates[0] || { playerId: '', value: 0 };
}


function metricMax(list, metric) {
  return Math.max(0, ...list.map((player) => Number(player[metric] || 0)));
}

function normalizeMetric(value, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(1, Number(value || 0) / max));
}

function computeClassOnzeScores() {
  const list = rankingPlayers();
  if (!list.length) return [];
  const pool = rankingPlayers(list);
  return list.map((player) => {
    const score = Math.round(playerGeneralPerformanceScore(player, pool, state.activeSeasonId));
    return { player, score, raw: score };
  }).sort((a, b) => Number(b.score || 0) - Number(a.score || 0)
    || Number(a.player.classement || 999) - Number(b.player.classement || 999)
    || normalizeString(a.player.displayName).localeCompare(normalizeString(b.player.displayName))
  );
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, Number(value || 0)));
}

function seasonIdsChronological() {
  const seasons = [...(state.root?.seasonIndex?.seasons || [])];
  const ids = seasons.map((season) => season.id).filter(Boolean);
  const known = Object.keys(state.root?.seasons || {});
  known.forEach((id) => { if (!ids.includes(id)) ids.push(id); });
  return ids;
}

function seasonStartNumber(seasonId = state.activeSeasonId) {
  const label = seasonLabelById(seasonId);
  const labelMatch = String(label || '').match(/(\d{2})\s*\/\s*(\d{2})/);
  if (labelMatch) return Number(labelMatch[1]);
  const idMatch = String(seasonId || '').match(/(\d{2})[_-](\d{2})/);
  if (idMatch) return Number(idMatch[1]);
  return 0;
}

function seasonUsesSecondaryPositions(seasonId = state.activeSeasonId) {
  return seasonStartNumber(seasonId) >= 26;
}

function ratingFamiliesForPlayer(player, seasonId = state.activeSeasonId) {
  const positions = getPlayerPositions(player);
  const primaryFamily = roleFamily(positions[0] || 'MC');
  if (!seasonUsesSecondaryPositions(seasonId)) return [{ family: primaryFamily, weight: 1 }];
  const families = [];
  positions.forEach((position, index) => {
    const family = roleFamily(position || 'MC');
    if (!family) return;
    const existing = families.find((item) => item.family === family);
    const rawWeight = index === 0 ? 0.65 : 0.35 / Math.max(1, positions.length - 1);
    if (existing) existing.weight += rawWeight;
    else families.push({ family, weight: rawWeight });
  });
  if (!families.length) return [{ family: primaryFamily || 'mid', weight: 1 }];
  const total = families.reduce((sum, item) => sum + Number(item.weight || 0), 0) || 1;
  return families.map((item) => ({ family: item.family, weight: Number(item.weight || 0) / total }));
}

function playerMatchesForRating(player) {
  return Math.max(0, Number(player?.matchesPlayed || 0));
}

function seasonMatchdayCountForRating(seasonId = state.activeSeasonId, pool = []) {
  const completedCount = completedMatches(matchesForSeason(seasonId)).length;
  if (completedCount > 0) return completedCount;
  const source = pool && pool.length ? pool : playersForSeason(seasonId);
  return Math.max(1, ...source.map((player) => Number(player.matchesPlayed || 0)));
}

function rateForBasis(player, key, basis = 'match', seasonId = state.activeSeasonId, pool = []) {
  const denominator = basis === 'journee'
    ? seasonMatchdayCountForRating(seasonId, pool)
    : Math.max(1, playerMatchesForRating(player));
  return Number(player?.[key] || 0) / Math.max(1, denominator);
}

function perMatch(player, key) {
  return rateForBasis(player, key, 'match');
}

function positiveNorm(value, max) {
  const safeMax = Math.max(1e-6, Number(max || 0));
  return clampNumber(Number(value || 0) / safeMax, 0, 1);
}

function rangeNorm(value, values = []) {
  const nums = values.map((item) => Number(item || 0)).filter((item) => Number.isFinite(item));
  if (!nums.length) return 0;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  if (Math.abs(max - min) < 1e-6) return 0.5;
  return clampNumber((Number(value || 0) - min) / (max - min), 0, 1);
}

function inverseRangeNorm(value, values = []) {
  const nums = values.map((item) => Number(item || 0)).filter((item) => Number.isFinite(item));
  if (!nums.length) return 0.5;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  if (Math.abs(max - min) < 1e-6) return 0.5;
  return clampNumber((max - Number(value || 0)) / (max - min), 0, 1);
}

function familyPoolForRating(pool, family, seasonId = state.activeSeasonId, context = 'default') {
  const source = (pool && pool.length ? pool : rankingPlayers(playersForSeason(seasonId))).filter((candidate) => playerMatchesForRating(candidate) > 0);
  if (context === 'eleven' && family === 'gk') {
    const withGoalkeeperRole = source.filter((candidate) => getPlayerPositions(candidate).includes('GB'));
    return withGoalkeeperRole.length ? withGoalkeeperRole : source;
  }
  const allowedFamilies = context === 'ballon' && family === 'gk' ? ['gk', 'def'] : [family];
  const filtered = source.filter((candidate) => ratingFamiliesForPlayer(candidate, seasonId).some((item) => allowedFamilies.includes(item.family)));
  return filtered.length ? filtered : source;
}

function playerImpactScoreForFamily(player, family, pool = [], seasonId = state.activeSeasonId, basis = 'match', context = 'default') {
  const played = playerMatchesForRating(player);
  if (!played) return 50;
  const familyPool = familyPoolForRating(pool, family, seasonId, context);
  const rate = (candidate, key) => rateForBasis(candidate, key, basis, seasonId, familyPool);
  const denominator = basis === 'journee' ? seasonMatchdayCountForRating(seasonId, familyPool) : Math.max(1, played);
  const rates = {
    ppm: rate(player, 'points'),
    gpm: rate(player, 'goals'),
    apm: rate(player, 'assists'),
    cpm: (Number(player.goals || 0) + Number(player.assists || 0)) / Math.max(1, denominator),
    mpm: rate(player, 'mvps'),
    diff: rate(player, 'goalDifference'),
    gapm: rate(player, 'goalsAgainst'),
    win: basis === 'journee'
      ? Number(player.wins || 0) / Math.max(1, seasonMatchdayCountForRating(seasonId, familyPool))
      : clampNumber(Number(player.victoryRate || 0) / 100, 0, 1),
  };
  const maxOf = (getter) => Math.max(1e-6, ...familyPool.map((candidate) => Number(getter(candidate) || 0)));
  const diffValues = familyPool.map((candidate) => rate(candidate, 'goalDifference'));
  const gaValues = familyPool.map((candidate) => rate(candidate, 'goalsAgainst'));
  const ppm = positiveNorm(rates.ppm, maxOf((candidate) => rate(candidate, 'points')));
  const gpm = positiveNorm(rates.gpm, maxOf((candidate) => rate(candidate, 'goals')));
  const apm = positiveNorm(rates.apm, maxOf((candidate) => rate(candidate, 'assists')));
  const cpm = positiveNorm(rates.cpm, maxOf((candidate) => {
    const base = basis === 'journee' ? seasonMatchdayCountForRating(seasonId, familyPool) : Math.max(1, playerMatchesForRating(candidate));
    return (Number(candidate.goals || 0) + Number(candidate.assists || 0)) / Math.max(1, base);
  }));
  const mpm = positiveNorm(rates.mpm, maxOf((candidate) => rate(candidate, 'mvps')));
  const diff = rangeNorm(rates.diff, diffValues);
  const defensive = inverseRangeNorm(rates.gapm, gaValues);

  let raw = 0;
  if (family === 'gk') {
    raw = ppm * 22 + rates.win * 13 + diff * 20 + defensive * 30 + mpm * 15;
  } else if (family === 'def') {
    raw = diff * 28 + defensive * 22 + ppm * 18 + rates.win * 8 + apm * 8 + gpm * 4 + mpm * 12;
  } else if (family === 'mid') {
    raw = apm * 28 + ppm * 18 + diff * 17 + gpm * 15 + mpm * 17 + rates.win * 5;
  } else if (family === 'att') {
    raw = gpm * 38 + apm * 20 + cpm * 12 + ppm * 12 + diff * 8 + mpm * 10;
  } else {
    raw = ppm * 25 + diff * 25 + gpm * 20 + apm * 20 + mpm * 10;
  }
  return clampNumber(Math.round(raw), 0, 100);
}

function playerSeasonPerformanceScore(player, pool = [], seasonId = state.activeSeasonId, basis = 'match', context = 'default') {
  const played = playerMatchesForRating(player);
  if (!played) return 50;
  const families = ratingFamiliesForPlayer(player, seasonId);
  const weighted = families.reduce((sum, item) => sum + playerImpactScoreForFamily(player, item.family, pool, seasonId, basis, context) * Number(item.weight || 0), 0);
  return clampNumber(Math.round(weighted), 0, 100);
}

function playerHarmonizedMatchScore(player, pool = [], seasonId = state.activeSeasonId, context = 'default') {
  const matchScore = playerSeasonPerformanceScore(player, pool, seasonId, 'match', context);
  const played = playerMatchesForRating(player);
  const confidence = played / (played + 3);
  return clampNumber(Math.round(matchScore * confidence + 50 * (1 - confidence)), 0, 100);
}

function playerHybridPerformanceScore(player, pool = [], seasonId = state.activeSeasonId, seasonWeight = 0.3, context = 'default') {
  const seasonScore = playerSeasonPerformanceScore(player, pool, seasonId, 'journee', context);
  const harmonized = playerHarmonizedMatchScore(player, pool, seasonId, context);
  return clampNumber(Math.round(seasonScore * seasonWeight + harmonized * (1 - seasonWeight)), 0, 100);
}

function playerGeneralPerformanceScore(player, pool = [], seasonId = state.activeSeasonId) {
  return playerHybridPerformanceScore(player, pool, seasonId, 0.3);
}

function playerBallonOrPerformanceScore(player, pool = [], seasonId = state.activeSeasonId) {
  return playerHybridPerformanceScore(player, pool, seasonId, 0.7, 'ballon');
}

function playerOverallRating(playerId, seasonId = state.activeSeasonId, memo = new Map()) {
  const ids = seasonIdsChronological();
  const key = `${seasonId}:${playerId}`;
  if (memo.has(key)) return memo.get(key);
  const idx = ids.indexOf(seasonId);
  const previousId = idx > 0 ? ids[idx - 1] : '';
  const previous = previousId ? playerOverallRating(playerId, previousId, memo) : null;
  const base = previous ? previous.rating : 60;
  const player = playerByIdFromSeason(seasonId, playerId);
  if (!player || !playerMatchesForRating(player)) {
    const missing = { rating: base, base, delta: 0, performance: 50 };
    memo.set(key, missing);
    return missing;
  }
  const pool = rankingPlayers(playersForSeason(seasonId));
  const performance = playerGeneralPerformanceScore(player, pool.length ? pool : playersForSeason(seasonId), seasonId);
  const seasonTarget = clampNumber(45 + performance * 0.55, 40, 99);
  const limits = seasonStartNumber(seasonId) <= 24 ? { min: -15, max: 20 } : { min: -7, max: 7 };
  const adjustment = Math.round(clampNumber((seasonTarget - base) * 0.65, limits.min, limits.max));
  const rating = Math.round(clampNumber(base + adjustment, 40, 99));
  const result = { rating, base, delta: rating - base, performance };
  memo.set(key, result);
  return result;
}

function playerOverallBadgeMarkup(player) {
  const overall = playerOverallRating(player.playerId);
  const positive = Number(overall.delta || 0) >= 0;
  return `
    <div class="player-overall-badge ${positive ? 'positive' : 'negative'}" title="Note de base + évolution de saison">
      <span class="player-overall-delta">${positive ? '+' : ''}${overall.delta}</span>
      <strong>${overall.base}</strong>
    </div>
  `;
}

function classOnzeMarkup() {
  if (!isPresident()) {
    return '<section class="card center-card error-card"><h2>Accès réservé</h2><p>Cette analyse est visible uniquement pour le profil président.</p></section>';
  }
  const rows = computeClassOnzeScores();
  return `
    <section class="card class-onze-card">
      <div class="card-head"><h3>Classement ClassOnze</h3></div>
      <div class="card-body class-onze-intro">
        Score sur 100 basé sur la nouvelle note générale : 30% contribution saison et 70% impact harmonisé.
      </div>
      <div class="card-body table-wrap">
        <table class="ranking-table class-onze-table">
          <thead><tr><th>#</th><th>Joueur</th><th>Note</th><th>Classement</th><th>PTS</th><th>MJ</th><th>Prés.</th><th>Buts</th><th>Pass.</th><th>MVP</th></tr></thead>
          <tbody>
            ${rows.map((row, index) => `
              <tr class="player-trigger" data-player-id="${row.player.playerId}">
                <td>${index + 1}</td>
                <td><div class="table-player-name">${escapeHtml(row.player.displayName)}</div><div class="positions-order-text">${escapeHtml(positionsText(row.player))}</div></td>
                <td><div class="class-score"><strong>${row.score}</strong><span><i style="width:${row.score}%"></i></span></div></td>
                <td>${row.player.classement}</td>
                <td>${row.player.points}</td>
                <td>${row.player.matchesPlayed}</td>
                <td>${row.player.presences}</td>
                <td>${row.player.goals}</td>
                <td>${row.player.assists}</td>
                <td>${row.player.mvps}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function openClassOnzeDialog() {
  if (!isPresident()) return;
  els.featureDialogTitle.textContent = 'classOnze';
  els.featureDialogBody.innerHTML = classOnzeMarkup();
  attachPlayerTriggers(els.featureDialogBody);
  els.featureDialog.showModal();
}

function attachClassOnzeTriggers(root = document) {
  root.querySelectorAll('[data-open-class-onze]').forEach((btn) => btn.addEventListener('click', () => openClassOnzeDialog()));
}

function roleScore(player, lane) {
  const family = lane === 'gk' ? 'gk' : lane === 'def' ? 'def' : lane === 'mid' ? 'mid' : 'att';
  return playerImpactScoreForFamily(player, family, rankingPlayers(), state.activeSeasonId);
}

function playerRoles(playerId) {
  const player = playerById(playerId) || players().find((item) => item.playerId === playerId) || { playerId };
  return getPlayerPositions(player);
}

function autoElevenRoleImpactScore(player, role) {
  const family = roleFamily(role);
  const context = role === 'GB' ? 'eleven' : 'default';
  return playerImpactScoreForFamily(player, family, rankingPlayers(), state.activeSeasonId, 'match', context);
}

function autoElevenCandidateScore(player, role) {
  const roles = playerRoles(player.playerId);
  const roleIndex = roles.indexOf(role);
  const family = roleFamily(role);
  const familyIndex = roles.findIndex((item) => roleFamily(item) === family);
  const affinity = roleIndex === 0 ? 18 : roleIndex > 0 ? 8 - Math.min(4, roleIndex - 1) : familyIndex === 0 ? 10 : familyIndex > 0 ? 3 : -12;
  return playerOverallScore(player) * 0.6 + autoElevenRoleImpactScore(player, role) * 0.4 + affinity;
}

function pickByRoles(pool, desiredRoles, lane) {
  let bestIndex = -1;
  let bestScore = -Infinity;
  pool.forEach((player, index) => {
    const roles = playerRoles(player.playerId);
    const matchingIndex = roles.findIndex((role) => desiredRoles.includes(role));
    if (matchingIndex === -1) return;
    const score = roleScore(player, lane) - matchingIndex * 0.6;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  if (bestIndex === -1) return null;
  return pool.splice(bestIndex, 1)[0];
}

function roleFamily(role = '') {
  if (role === 'GB') return 'gk';
  if (['DD','DC','DG'].includes(role)) return 'def';
  if (['MDC','MC','MOC','MD','MG'].includes(role)) return 'mid';
  if (['AD','AC','AG','BU'].includes(role)) return 'att';
  return 'mid';
}

function playerSeasonStat(player, key) {
  return Number(player?.[key] || 0);
}

function playerScoreForFamily(player, family) {
  return playerImpactScoreForFamily(player, family, rankingPlayers(), state.activeSeasonId);
}

function playerOverallScore(player) {
  return playerSeasonPerformanceScore(player, rankingPlayers(), state.activeSeasonId);
}

function bestSlotCandidatesForRole(role = '') {
  const map = {
    GB: ['GB'],
    DG: ['DG','DD'],
    DD: ['DD','DG'],
    DC: ['DC','DCG','DCD'],
    MDC: ['MDCG','MDCD','MCG','MCD'],
    MC: ['MCG','MCD','MOC','MG','MD'],
    MOC: ['MOC','MCG','MCD','ACG','ACD'],
    MG: ['MG','AG','MCG'],
    MD: ['MD','AD','MCD'],
    AG: ['AG','ACG','AD'],
    AD: ['AD','ACD','AG'],
    AC: ['ACG','ACD','BU'],
    BU: ['BU','ACG','ACD']
  };
  return map[role] || [];
}

function buildElevenOfSeason() {
  const rankedPool = [...topSixteenPlayers()].sort((a, b) => playerOverallScore(b) - playerOverallScore(a) || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
  if (!rankedPool.length) return null;

  const slots = emptyDetailedSlots();
  const occupied = new Set();
  const formationSlots = ['GB','DD','DCD','DCG','DG','MDC','MCD','MCG','MOC','ACD','ACG'];
  const slotToBaseRole = { GB: 'GB', DD: 'DD', DCD: 'DC', DCG: 'DC', DG: 'DG', MDC: 'MDC', MCD: 'MC', MCG: 'MC', MOC: 'MOC', ACD: 'AC', ACG: 'AC' };
  const slotRolePreferences = {
    GB: ['GB'],
    DD: ['DD', 'DG'],
    DCD: ['DC'],
    DCG: ['DC'],
    DG: ['DG', 'DD'],
    MDC: ['MDC', 'MC'],
    MCD: ['MC', 'MDC', 'MD', 'MG'],
    MCG: ['MC', 'MDC', 'MG', 'MD'],
    MOC: ['MOC', 'MC'],
    ACD: ['AC', 'BU', 'AD', 'AG'],
    ACG: ['AC', 'BU', 'AG', 'AD'],
  };

  const assign = (slot, player) => {
    if (!formationSlots.includes(slot) || slots[slot] || occupied.has(player.playerId)) return false;
    slots[slot] = player.playerId;
    occupied.add(player.playerId);
    return true;
  };

  const slotCandidateScore = (player, slot, role, primaryOnly = false) => {
    const roles = playerRoles(player.playerId);
    const roleIndex = roles.indexOf(role);
    if (primaryOnly && roleIndex !== 0) return -Infinity;
    if (!primaryOnly && roleIndex === -1) return -Infinity;
    const baseRole = slotToBaseRole[slot] || role;
    const impactRole = baseRole === 'GB' ? 'GB' : baseRole;
    const impactScore = autoElevenRoleImpactScore(player, impactRole);
    const affinity = roleIndex === 0 ? 16 : Math.max(4, 10 - roleIndex * 2);
    if (baseRole === 'GB' && role !== 'GB') return playerOverallScore(player) * 0.5 + impactScore * 0.5 + 2;
    return playerOverallScore(player) * 0.6 + impactScore * 0.4 + affinity;
  };

  for (const slot of formationSlots) {
    const preferredRoles = slotRolePreferences[slot] || [slotToBaseRole[slot] || 'MC'];
    let candidates = rankedPool
      .filter((player) => !occupied.has(player.playerId) && preferredRoles.some((role) => playerRoles(player.playerId)[0] === role))
      .sort((a, b) => Math.max(...preferredRoles.map((role) => slotCandidateScore(b, slot, role, true))) - Math.max(...preferredRoles.map((role) => slotCandidateScore(a, slot, role, true))) || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
    if (candidates.length) {
      assign(slot, candidates[0]);
      continue;
    }
    candidates = rankedPool
      .filter((player) => !occupied.has(player.playerId) && preferredRoles.some((role) => playerRoles(player.playerId).slice(1).includes(role)))
      .sort((a, b) => Math.max(...preferredRoles.map((role) => slotCandidateScore(b, slot, role, false))) - Math.max(...preferredRoles.map((role) => slotCandidateScore(a, slot, role, false))) || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
    if (candidates.length) assign(slot, candidates[0]);
  }

  const leftovers = rankedPool.filter((player) => !occupied.has(player.playerId)).sort((a, b) => playerOverallScore(b) - playerOverallScore(a) || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
  for (const slot of formationSlots.filter((name) => !slots[name])) {
    const preferredRoles = slotRolePreferences[slot] || [slotToBaseRole[slot] || 'MC'];
    const exact = leftovers.find((player) => preferredRoles.some((role) => playerRoles(player.playerId).includes(role)));
    const fallback = exact || leftovers[0];
    if (!fallback) break;
    assign(slot, fallback);
    const idx = leftovers.findIndex((player) => player.playerId === fallback.playerId);
    if (idx >= 0) leftovers.splice(idx, 1);
  }

  return slots;
}

function dynamicFieldMarkup(lines, teamColor = 'yellow', mirror = false, opts = {}) {
  const order = mirror ? ['bu','mc','dc','gb'] : ['gb','dc','mc','bu'];
  return `<div class="compo-board field-mode ${mirror ? 'mirror' : ''} team-${teamColor}">${order.map((key)=>`
    <div class="dynamic-row-wrap no-label"><div class="compo-row dynamic slots-${Math.max(1, (lines[key]||[]).length)}">${((mirror ? [...(lines[key]||[])].reverse() : (lines[key]||[]))).map((id)=>compoPlayerCard(id, teamColor)).join('') || '<div class="detail-empty">—</div>'}</div></div>`).join('')}</div>`;
}


function familyPositionsForTop16(family) {
  if (family === 'gk') return ['GB'];
  if (family === 'def') return ['DD','DC','DG'];
  if (family === 'mid') return ['MDC','MC','MOC','MD','MG'];
  if (family === 'att') return ['AD','AC','AG','BU'];
  return [];
}

function top16EligibleForFamily(player, family) {
  return ratingFamiliesForPlayer(player, state.activeSeasonId).some((item) => item.family === family);
}

function computeTop16FamilyScore(player, family, pool = []) {
  const roles = getPlayerPositions(player);
  const familyRoles = familyPositionsForTop16(family);
  const roleIndex = roles.findIndex((position) => familyRoles.includes(position));
  const positionBonus = roleIndex === 0 ? 6 : (seasonUsesSecondaryPositions(state.activeSeasonId) && roleIndex > 0 ? 3 : 0);
  return playerImpactScoreForFamily(player, family, pool.length ? pool : rankingPlayers(), state.activeSeasonId) + positionBonus;
}

function topSixteenPlayers() {
  const quotas = [
    { family: 'gk', count: 2 },
    { family: 'def', count: 6 },
    { family: 'mid', count: 5 },
    { family: 'att', count: 3 },
  ];
  const selected = [];
  const used = new Set();
  for (const quota of quotas) {
    const pool = rankingPlayers().filter((player) => top16EligibleForFamily(player, quota.family));
    const ordered = [...pool].sort((a, b) => computeTop16FamilyScore(b, quota.family, pool) - computeTop16FamilyScore(a, quota.family, pool) || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
    for (const player of ordered) {
      if (used.has(player.playerId)) continue;
      selected.push({ ...player, top16Family: quota.family, top16Score: computeTop16FamilyScore(player, quota.family, pool) });
      used.add(player.playerId);
      if (selected.filter((item) => item.top16Family === quota.family).length >= quota.count) break;
    }
  }
  return selected;
}

function publishedElevenData() {
  const raw = seasonData()?.publishedEleven;
  if (!raw || typeof raw !== 'object') return null;
  return {
    slots: normalizeDetailedSlots(raw.slots || raw),
    benchPlayerIds: Array.isArray(raw.benchPlayerIds) ? raw.benchPlayerIds.filter(Boolean) : [],
    sourceTop16PlayerIds: Array.isArray(raw.sourceTop16PlayerIds) ? raw.sourceTop16PlayerIds.filter(Boolean) : [],
    publishedAt: raw.publishedAt || 0,
  };
}

function publishedElevenSource() {
  const published = publishedElevenData();
  if (!published) return null;
  return {
    seasonId: state.activeSeasonId,
    dateLabel: currentSeasonDisplay(),
    yellowSlots: published.slots,
    blueSlots: null,
    benchPlayerIds: published.benchPlayerIds,
    sourceTop16PlayerIds: published.sourceTop16PlayerIds,
  };
}

function benchPlayersFromSlots(slots, baseIds = []) {
  const assigned = new Set(flattenDetailedSlots(slots));
  return (baseIds || []).filter((id) => id && !assigned.has(id));
}

function ensureAdminElevenState() {
  const published = publishedElevenData();
  if (!state.adminElevenSlots) {
    state.adminElevenSlots = normalizeDetailedSlots(published?.slots || emptyDetailedSlots());
  }
  if (!Array.isArray(state.adminElevenBenchIds)) {
    state.adminElevenBenchIds = Array.isArray(published?.benchPlayerIds) ? [...published.benchPlayerIds] : [];
  }
  if (!state.adminElevenSelectedSlot) state.adminElevenSelectedSlot = 'GB';
}

function resetAdminElevenState(fromPublished = true) {
  const published = fromPublished ? publishedElevenData() : null;
  state.adminElevenSlots = normalizeDetailedSlots(published?.slots || emptyDetailedSlots());
  state.adminElevenBenchIds = Array.isArray(published?.benchPlayerIds) ? [...published.benchPlayerIds] : [];
  state.adminElevenSelectedSlot = 'GB';
}

function renderBenchMarkup(benchIds = [], className = '') {
  if (!benchIds.length) return `<div class="empty-state">Aucun remplaçant.</div>`;
  return `<div class="bench-list ${className}">${benchIds.map((playerId) => `<span class="bench-pill">${escapeHtml(playerDisplayName(playerId))}</span>`).join('')}</div>`;
}

function renderEditableBenchMarkup(benchIds = []) {
  if (!benchIds.length) return `<div class="empty-state">Aucun remplaçant.</div>`;
  return `<div class="bench-list bench-edit-list">${benchIds.map((playerId) => `<button class="bench-pill bench-pill-btn" data-eleven-unbench="${playerId}" type="button">${escapeHtml(playerDisplayName(playerId))} ×</button>`).join('')}</div>`;
}

function currentElevenEditorSource() {
  ensureAdminElevenState();
  return {
    seasonId: state.activeSeasonId,
    dateLabel: currentSeasonDisplay(),
    yellowSlots: normalizeDetailedSlots(state.adminElevenSlots),
    blueSlots: null,
    benchPlayerIds: Array.isArray(state.adminElevenBenchIds) ? [...state.adminElevenBenchIds] : [],
  };
}


function renderElevenManage() {
  if (!isPresident()) {
    return `
      <section class="card center-card error-card">
        <h2>Accès réservé</h2>
        <p>Cette page est visible uniquement pour le profil président.</p>
      </section>
    `;
  }
  ensureAdminElevenState();
  const published = publishedElevenData();
  const allPlayers = rankingPlayers().sort((a, b) => normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
  const onzeScores = new Map(computeClassOnzeScores().map((row) => [row.player.playerId, row.score]));
  const assigned = new Set(flattenDetailedSlots(state.adminElevenSlots));
  const benched = new Set(state.adminElevenBenchIds || []);
  const available = allPlayers.filter((player) => !assigned.has(player.playerId) && !benched.has(player.playerId)).sort((a, b) => (onzeScores.get(b.playerId) ?? 0) - (onzeScores.get(a.playerId) ?? 0) || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
  return `
    <section class="card admin-card eleven-manager-card">
      <div class="card-head"><h2>Onze type</h2></div>
      ${published ? `<div class="card-body"><div class="muted">Onze type actuellement publié pour la saison ${currentSeasonDisplay()}.</div></div>` : ''}

      <div class="card-body compo-shell mode-field feature-eleven-shell eleven-manager-pitch">
        <section class="team-box compo-team-card yellow-soft">
          <div class="coach-team-board admin-eleven-board">${renderDetailedPitchBoard(state.adminElevenSlots, 'neutral-edit')}</div>
        </section>
      </div>

      <div class="card-body eleven-bench-zone">
        <div class="mini-section-title">Remplaçants</div>
        ${renderEditableBenchMarkup(state.adminElevenBenchIds || [])}
      </div>

      <div class="card-body eleven-available-zone">
        <div class="mini-section-title">Joueurs disponibles</div>
        <div class="available-list vertical-scroll eleven-players-list" data-preserve-scroll-key="eleven-players-list">
          ${available.length ? available.map((player) => `
            <div class="available-row eleven-player-row">
              <img class="presence-avatar" src="${avatarFor(player)}" alt="${escapeHtml(player.displayName)}" />
              <div>
                <div class="presence-name-row"><div class="presence-name">${escapeHtml(player.displayName)}</div><div class="eleven-score-badge">${onzeScores.get(player.playerId) ?? 0}</div></div>
                <div class="positions-order-text">${escapeHtml(positionsText(player))}</div>
              </div>
              <div class="assign-buttons">
                <button class="assign-btn yellow" data-eleven-open-assign="${player.playerId}" type="button">Ajouter</button>
              </div>
            </div>
          `).join('') : '<div class="empty-state">Aucun joueur disponible.</div>'}
        </div>
      </div>

      <div class="card-body admin-actions-row wrap-actions eleven-actions-row">
        <button class="primary-btn" data-eleven-publish="1" type="button">Enregistrer</button>
        <button class="secondary-btn" data-eleven-auto="1" type="button">Proposer automatiquement</button>
        <button class="danger-btn" data-eleven-delete="1" type="button">Supprimer</button>
        <button class="secondary-btn" data-eleven-reset="1" type="button">Réinitialiser</button>
        <button class="secondary-btn" data-eleven-share="1" type="button">Partager</button>
      </div>
    </section>
  `;
}

function seasonLabelById(seasonId) {
  return state.root?.seasonIndex?.seasons?.find((season) => season.id === seasonId)?.displayName || seasonId || '--/--';
}


function trophyShelfDefinitions() {
  return [
    { seasonId: 'saison_24_25', displayName: '24/25' },
    { seasonId: 'saison_25_26', displayName: '25/26' },
    { seasonId: 'saison_26_27', displayName: '26/27' },
    { seasonId: 'saison_27_28', displayName: '27/28' },
  ];
}

function seasonExists(seasonId) {
  return !!state.root?.seasons?.[seasonId];
}

function trophyOrderRank(type = '') {
  const order = { champion: 1, scorer: 2, playmaker: 3, mvp: 4 };
  return order[type] || 99;
}

function trophyMetricForType(type = '') {
  if (type === 'champion') return 'points';
  if (type === 'playmaker') return 'assists';
  if (type === 'mvp') return 'mvps';
  return 'goals';
}

function trophyTitleForType(type = '') {
  const map = {
    champion: 'Champion',
    scorer: 'Meilleur buteur',
    playmaker: 'Meilleur passeur',
    mvp: 'MVP de la saison',
  };
  return map[type] || 'Trophée';
}

function seasonHasStarted(seasonId) {
  const season = seasonDataById(seasonId);
  if (!season) return false;
  const hasMatches = Array.isArray(season.matches) && season.matches.length > 0;
  const hasStats = playersForSeason(seasonId).some((player) => Number(player.matchesPlayed || 0) > 0 || Number(player.points || 0) > 0 || Number(player.goals || 0) > 0 || Number(player.assists || 0) > 0 || Number(player.mvps || 0) > 0);
  return !!(season.closedAt || hasMatches || hasStats);
}

function trophySeasonStatus(seasonId) {
  if (!seasonExists(seasonId)) return 'not_started';
  const activeSeasonId = state.root?.seasonIndex?.activeSeasonId || state.activeSeasonId;
  if (seasonId === activeSeasonId) return 'current';
  return seasonHasStarted(seasonId) ? 'closed' : 'not_started';
}

function bestPlayerForSeasonMetric(seasonId, metric) {
  const seasonPlayers = playersForSeason(seasonId);
  if (!seasonPlayers.length) return null;
  return [...seasonPlayers].sort((a, b) => Number(b[metric] || 0) - Number(a[metric] || 0)
    || Number(b.points || 0) - Number(a.points || 0)
    || Number(b.matchesPlayed || 0) - Number(a.matchesPlayed || 0)
    || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)))[0] || null;
}

function resolvedTrophyForSeason(seasonId, type) {
  const status = trophySeasonStatus(seasonId);
  const title = trophyTitleForType(type);
  if (status === 'not_started') {
    return { id: `placeholder_${seasonId}_${type}`, seasonId, type, title, status };
  }
  const player = bestPlayerForSeasonMetric(seasonId, trophyMetricForType(type));
  if (!player) {
    return { id: `placeholder_${seasonId}_${type}`, seasonId, type, title, status: 'not_started' };
  }
  return { id: `resolved_${seasonId}_${type}`, seasonId, type, title, winnerPlayerId: player.playerId, status };
}

function getTrophyDetailsById(trophyId) {
  const parts = String(trophyId || '').split('_');
  if (parts.length >= 4 && (parts[0] === 'resolved' || parts[0] === 'placeholder')) {
    const seasonId = `${parts[1]}_${parts[2]}_${parts[3]}`;
    const type = parts.slice(4).join('_') || 'champion';
    return resolvedTrophyForSeason(seasonId, type);
  }
  return null;
}

function trophyVisualForType(type) {
  if (type === 'champion') return assetPath('ChampionTrophy', 'ChampionTrophy.webp');
  if (type === 'mvp') return assetPath('MVPTrophy', 'MVPTrophy.webp');
  if (type === 'playmaker') return assetPath('PlaymakerTrophy', 'PlaymakerTrophy.webp');
  return assetPath('GoldenBootTrophy', 'GoldenBootTrophy.webp');
}

function trophyPlayerImage(player, type) {
  const family = avatarFamily(player);
  if (type === 'champion') return assetPath(`Champion_${family}`, `Champion_${family}.webp`);
  if (type === 'mvp') return assetPath(`MVP_${family}`, `MVP_${family}.webp`);
  if (type === 'playmaker') return assetPath(`Playmaker_${family}`, `Playmaker_${family}.webp`);
  return assetPath(`Scorer_${family}`, `Scorer_${family}.webp`);
}

function trophyDetailStats(trophy, player) {
  const stats = [
    { label: 'Saison', value: seasonLabelById(trophy.seasonId) },
    { label: 'MJ', value: Number(player.matchesPlayed || 0) },
  ];
  if (trophy.type === 'champion') {
    stats.push({ label: 'Points', value: Number(player.points || 0) });
    stats.push({ label: 'Buts', value: Number(player.goals || 0) });
    stats.push({ label: 'Passes', value: Number(player.assists || 0) });
    stats.push({ label: 'MVP', value: Number(player.mvps || 0) });
    stats.push({ label: '% victoire', value: `${Math.round(Number(player.victoryRate || 0))}%` });
  } else if (trophy.type === 'mvp') {
    stats.push({ label: 'MVP', value: Number(player.mvps || 0) });
    stats.push({ label: 'Points', value: Number(player.points || 0) });
  } else if (trophy.type === 'playmaker') {
    stats.push({ label: 'Passes', value: Number(player.assists || 0) });
    stats.push({ label: 'Points', value: Number(player.points || 0) });
  } else {
    stats.push({ label: 'Buts', value: Number(player.goals || 0) });
    stats.push({ label: 'Points', value: Number(player.points || 0) });
  }
  return stats;
}

function renderTrophyDetail(trophyId) {
  const trophy = getTrophyDetailsById(trophyId);
  if (!trophy) return '<section class="card center-card"><p>Trophée introuvable.</p></section>';
  if (trophy.status === 'not_started' || !trophy.winnerPlayerId) {
    return `
      <section class="card trophy-detail-card premium-card">
        <div class="card-body trophy-detail-body trophy-empty-detail">
          <div class="trophy-empty-message">La saison n'a pas commencé</div>
        </div>
      </section>
    `;
  }
  const player = playerByIdFromSeason(trophy.seasonId, trophy.winnerPlayerId) || playerById(trophy.winnerPlayerId);
  if (!player) return '<section class="card center-card"><p>Joueur introuvable.</p></section>';
  const stats = trophyDetailStats(trophy, player);
  const crownLabel = trophy.status === 'current' ? 'Leader actuel' : 'Vainqueur';
  return `
    <section class="card trophy-detail-card premium-card">
      <div class="card-body trophy-detail-body">
        <div class="trophy-detail-toprow">
          <div class="trophy-detail-badge">${escapeHtml(crownLabel)}</div>
          ${canShareGeneral() ? shareButtonMarkup(`data-share-trophy="${trophy.id}"`, 'tab-btn icon-only-btn trophy-share-btn') : ''}
        </div>
        <h2 class="trophy-player-title">${escapeHtml(player.displayName)}</h2>
        <div class="trophy-player-visual-wrap">
          <img class="trophy-player-visual" src="${trophyPlayerImage(player, trophy.type)}" alt="${escapeHtml(player.displayName)}" />
        </div>
        <div class="trophy-stats-grid">
          ${stats.map((item) => `<div class="trophy-stat-box"><span>${item.label}</span><strong>${item.value}</strong></div>`).join('')}
        </div>
      </div>
    </section>
  `;
}

function openTrophyDetail(trophyId) {
  els.featureDialogTitle.textContent = ''; 
  els.featureDialogBody.innerHTML = renderTrophyDetail(trophyId);
  els.featureDialogBody.querySelectorAll('[data-share-trophy]').forEach((btn) => btn.addEventListener('click', () => shareTrophyDetail(btn.dataset.shareTrophy)));
  els.featureDialog.showModal();
}

function renderTrophy() {
  const shelfTypes = [
    ['champion', 'scorer'],
    ['champion', 'scorer', 'playmaker', 'mvp'],
    ['champion', 'scorer', 'playmaker', 'mvp'],
    ['champion', 'scorer', 'playmaker', 'mvp'],
  ];
  return `
    <section class="trophy-room-cabinet-wrap full-room-only">
      <div class="trophy-room-cabinet trophy-showcase">
        <img class="trophy-showcase-img" src="${assetPath('TrophyRoomLayout', 'TrophyRoomShowcase.png')}" alt="Salle des trophées" />
        ${trophyShelfDefinitions().map((shelf, shelfIndex) => `
          <div class="trophy-hotspot-row shelf-${shelfIndex + 1}">
            ${shelfTypes[shelfIndex].map((type, typeIndex) => `
              <button class="trophy-hotspot-card slot-${typeIndex + 1}" data-open-trophy="${resolvedTrophyForSeason(shelf.seasonId, type).id}" type="button" aria-label="${escapeHtml(trophyTitleForType(type))} ${escapeHtml(shelf.displayName)}"></button>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </section>
  `;
}


function trophyShareCongrats(type = '') {
  if (type === 'champion') return 'Félicitations pour cette saison au sommet.';
  if (type === 'scorer') return 'Félicitations pour ce titre de meilleur buteur.';
  if (type === 'playmaker') return 'Félicitations pour ce titre de meilleur passeur.';
  if (type === 'mvp') return 'Félicitations pour cette saison de MVP.';
  return 'Félicitations pour ce trophée.';
}

function drawImageContain(ctx, img, x, y, w, h) {
  const iw = img.naturalWidth || img.width || w;
  const ih = img.naturalHeight || img.height || h;
  const scale = Math.min(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

async function createTrophyDetailShareBlob(trophyId) {
  const trophy = getTrophyDetailsById(trophyId);
  if (!trophy || trophy.status === 'not_started' || !trophy.winnerPlayerId) return null;
  const player = playerByIdFromSeason(trophy.seasonId, trophy.winnerPlayerId) || playerById(trophy.winnerPlayerId);
  if (!player) return null;
  const stats = trophyDetailStats(trophy, player).slice(0, 8);
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const roundRect = (x,y,w,h,r=28)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();};
  ctx.fillStyle = '#07142c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const grad = ctx.createLinearGradient(0,0,0,canvas.height);
  grad.addColorStop(0,'#173c76');
  grad.addColorStop(.55,'#07142c');
  grad.addColorStop(1,'#030814');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle='rgba(255,213,92,.38)';
  ctx.lineWidth=4;
  roundRect(28,28,1144,1744,38);
  ctx.stroke();

  try {
    const logo = await loadImage(assetPath('logo', 'logo-cov.webp'));
    drawImageContain(ctx, logo, 490, 44, 220, 170);
  } catch {}

  ctx.textAlign='center';
  ctx.fillStyle='#ffd55c';
  ctx.font='900 56px Inter, Arial';
  ctx.fillText(trophy.title.toUpperCase(), 600, 270);
  ctx.fillStyle='rgba(255,255,255,.86)';
  ctx.font='800 34px Inter, Arial';
  ctx.fillText(`Saison ${seasonLabelById(trophy.seasonId)}`, 600, 320);

  const visualBox = {x: 210, y: 360, w: 780, h: 620};
  try {
    const visual = await loadImage(trophyPlayerImage(player, trophy.type));
    drawImageContain(ctx, visual, visualBox.x, visualBox.y, visualBox.w, visualBox.h);
  } catch {}

  ctx.fillStyle='#ffffff';
  ctx.font='900 64px Inter, Arial';
  ctx.fillText(player.displayName.toUpperCase(), 600, 1060);

  const cardX = 70; const cardY = 1120; const cardW = 1060; const cardH = 390;
  ctx.fillStyle='rgba(7,18,40,.92)';
  roundRect(cardX,cardY,cardW,cardH,30);
  ctx.fill();
  ctx.strokeStyle='rgba(255,213,92,.24)';
  ctx.lineWidth=2;
  ctx.stroke();

  const boxW=480; const boxH=72; const gapX=40; const gapY=22;
  stats.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const bx = 100 + col * (boxW + gapX);
    const by = 1152 + row * (boxH + gapY);
    ctx.fillStyle='rgba(255,255,255,.055)';
    roundRect(bx,by,boxW,boxH,18);
    ctx.fill();
    ctx.fillStyle='rgba(255,213,92,.88)';
    ctx.font='800 22px Inter, Arial';
    ctx.textAlign='left';
    ctx.fillText(item.label, bx+22, by+45);
    ctx.fillStyle='#ffffff';
    ctx.font='900 30px Inter, Arial';
    ctx.textAlign='right';
    ctx.fillText(String(item.value), bx+boxW-22, by+45);
  });

  ctx.textAlign='center';
  ctx.fillStyle='rgba(255,255,255,.9)';
  ctx.font='800 32px Inter, Arial';
  ctx.fillText(trophyShareCongrats(trophy.type), 600, 1590);

  return blobFromCanvas(canvas);
}

async function shareTrophyDetail(trophyId) {
  const trophy = getTrophyDetailsById(trophyId);
  if (!trophy || trophy.status === 'not_started' || !trophy.winnerPlayerId) return;
  const player = playerByIdFromSeason(trophy.seasonId, trophy.winnerPlayerId) || playerById(trophy.winnerPlayerId);
  if (!player) return;
  const blob = await createTrophyDetailShareBlob(trophyId);
  if (!blob) return;
  await shareBlob(blob, `cov-trophee-${normalizeString(player.displayName)}-${seasonLabelById(trophy.seasonId).replace('/', '-')}.png`, 'C.O.V', `${trophy.title} - ${player.displayName}`);
}

function featureDialogMarkup(kind) {
  if (kind === 'eleven') {
    const published = publishedElevenSource();
    if (!published) return '<section class="card center-card"><p>Onze type disponible après le dernier match de la saison.</p></section>';
    return `
      <section class="card detail-compo-card eleven-feature-card">
        <div class="card-head compo-head eleven-head-row">
          <div class="compo-head-actions eleven-share-left">
            ${canShareCompo() ? shareButtonMarkup('data-share-compo-source="eleven"', 'tab-btn icon-only-btn') : ''}
          </div>
          <div class="eleven-title-block">
            <h3>ONZE TYPE</h3>
            <div class="compo-date-sub">${currentSeasonDisplay()}</div>
          </div>
          <div class="eleven-head-spacer"></div>
        </div>
        <div class="card-body compo-shell mode-field feature-eleven-shell">
          ${renderTeamCompo(published.yellowSlots, 'neutral', 'field', false)}
        </div>
        <div class="card-body eleven-bench-card">
          <h4>Remplaçants</h4>
          ${renderBenchMarkup(published.benchPlayerIds || [], 'bench-inline')}
        </div>
      </section>
    `;
  }
  const records = computeRecords();
  const summaryRows = seasonSummaryRows();
  return `
    <section class="records-grid">
      <article class="card"><div class="card-head centered-head"><h3>Résumé saison</h3>${canShareGeneral() ? shareButtonMarkup('data-share-season-summary="1"', 'tab-btn icon-only-btn') : ''}</div><div class="card-body stats-table">
        ${summaryRows.map(([label, value]) => statsRow(label, value)).join('')}
      </div></article>
      <article class="card"><div class="card-head centered-head"><h3>Records matchs</h3></div><div class="card-body stats-table">
        ${statsRow('Plus gros score équipe', records.biggestTeamScore ? `${records.biggestTeamScore.value} buts · ${records.biggestTeamScore.match.dateLabel}` : '—')}
        ${statsRow('Match le plus prolifique', records.biggestCombined ? `${records.biggestCombined.value} buts · ${records.biggestCombined.match.dateLabel}` : '—')}
        ${statsRow('Buteur sur un match', records.bestScorerMatch ? `${playerDisplayName(records.bestScorerMatch.playerId)} · ${records.bestScorerMatch.value}` : '—')}
        ${statsRow('Passeur sur un match', records.bestAssistMatch ? `${playerDisplayName(records.bestAssistMatch.playerId)} · ${records.bestAssistMatch.value}` : '—')}
      </div></article>
    </section>
  `;
}


function seasonSummaryAwards() {
  const list = rankingPlayers().filter((player) => Number(player.matchesPlayed || 0) > 0 || Number(player.points || 0) > 0);
  const byMetric = (metric) => [...list].sort((a, b) => Number(b[metric] || 0) - Number(a[metric] || 0) || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)))[0] || null;
  const champion = [...list].sort((a, b) => Number(a.classement || 999) - Number(b.classement || 999) || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)))[0] || null;
  const ballon = isBallonOrActive() ? (ballonOrPlayers().find((player) => Number(player.ballonOrRank || 0) === 1) || null) : null;
  const bestNote = [...list].sort((a, b) => Number(playerOverallRating(b.playerId).rating || 0) - Number(playerOverallRating(a.playerId).rating || 0) || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)))[0] || null;
  const bestProgress = [...list].sort((a, b) => Number(playerOverallRating(b.playerId).delta || 0) - Number(playerOverallRating(a.playerId).delta || 0) || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)))[0] || null;
  const bestWinRate = [...list].sort((a, b) => Number(b.victoryRate || 0) - Number(a.victoryRate || 0) || Number(b.matchesPlayed || 0) - Number(a.matchesPlayed || 0) || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)))[0] || null;
  const published = publishedElevenSource();
  const elevenIds = published ? flattenDetailedSlots(published.yellowSlots || {}) : [];
  const elevenNames = elevenIds.map((id) => playerDisplayName(id)).filter(Boolean).slice(0, 11);
  return {
    champion,
    ballon,
    scorer: byMetric('goals'),
    playmaker: byMetric('assists'),
    mvp: byMetric('mvps'),
    bestNote,
    bestProgress,
    bestWinRate,
    elevenNames,
  };
}

function seasonSummaryRows() {
  const awards = seasonSummaryAwards();
  const note = awards.bestNote ? playerOverallRating(awards.bestNote.playerId) : null;
  const progress = awards.bestProgress ? playerOverallRating(awards.bestProgress.playerId) : null;
  return [
    ['Champion', awards.champion ? `${awards.champion.displayName} · ${awards.champion.points} pts` : '—'],
    ['Ballon d’or', awards.ballon ? `${awards.ballon.displayName}` : '—'],
    ['Meilleur buteur', awards.scorer ? `${awards.scorer.displayName} · ${awards.scorer.goals}` : '—'],
    ['Meilleur passeur', awards.playmaker ? `${awards.playmaker.displayName} · ${awards.playmaker.assists}` : '—'],
    ['Roi des MVP', awards.mvp ? `${awards.mvp.displayName} · ${awards.mvp.mvps}` : '—'],
    ['Meilleure note', awards.bestNote && note ? `${awards.bestNote.displayName} · ${note.rating}` : '—'],
    ['Meilleure progression', awards.bestProgress && progress ? `${awards.bestProgress.displayName} · ${progress.delta >= 0 ? '+' : ''}${progress.delta}` : '—'],
    ['Meilleur % victoire', awards.bestWinRate ? `${awards.bestWinRate.displayName} · ${fmtPct(awards.bestWinRate.victoryRate)}` : '—'],
  ];
}

function filteredPlayers(basePlayers = players()) {
  return rankingPlayers(basePlayers);
}

function nextSundayInfo(baseIso = null) {
  const now = baseIso ? new Date(`${baseIso}T12:00:00`) : new Date();
  const day = now.getDay();
  const delta = day === 0 ? 7 : 7 - day;
  const next = new Date(now);
  next.setDate(now.getDate() + delta);
  const dd = String(next.getDate()).padStart(2, '0');
  const mm = String(next.getMonth() + 1).padStart(2, '0');
  const yyyy = next.getFullYear();
  return {
    date: `${dd}/${mm}/${yyyy}`,
    iso: `${yyyy}-${mm}-${dd}`,
    time: '9h00 - 10h30'
  };
}

function upcomingMatchFromSeason() {
  return [...matches()]
    .filter((match) => match && match.statsApplied === false)
    .sort((a, b) => (a.dateIso || '').localeCompare(b.dateIso || ''))[0] || null;
}

function currentUpcomingInfo() {
  const draft = seasonData()?.draftMatch || {};
  const match = upcomingMatchFromSeason();
  const info = {
    dateLabel: draft.dateLabel || match?.dateLabel || nextSundayInfo().date,
    dateIso: draft.dateIso || match?.dateIso || nextSundayInfo().iso,
    time: draft.time || match?.time || '9h00 - 10h30'
  };
  return info;
}


function currentCompoSource() {
  const draft = currentDraft();
  const draftHasTeams = flattenDetailedSlots(draft.yellowSlots || draft.yellowLines || draft.teamYellowPlayerIds || []).length
    || flattenDetailedSlots(draft.blueSlots || draft.blueLines || draft.teamBluePlayerIds || []).length;
  if (draftHasTeams) return draft;
  const upcoming = upcomingMatchFromSeason();
  if (upcoming) {
    const upcomingHasTeams = flattenDetailedSlots(upcoming.yellowSlots || upcoming.yellowLines || upcoming.teamYellowPlayerIds || []).length
      || flattenDetailedSlots(upcoming.blueSlots || upcoming.blueLines || upcoming.teamBluePlayerIds || []).length;
    if (upcomingHasTeams) return upcoming;
  }
  return null;
}

function currentEditableMatch() {
  if (state.editingMatchId) {
    return matches().find((item) => item.matchId === state.editingMatchId) || null;
  }
  const draft = currentDraft();
  const existing = upcomingMatchFromSeason();
  return existing || {
    matchId: `match_${String((seasonData()?.nextMatchNumber || matches().length + 1)).padStart(3, '0')}`,
    dateIso: draft.dateIso,
    dateLabel: draft.dateLabel,
    time: draft.time,
    yellowScore: 0,
    blueScore: 0,
    presences: draft.presences,
    teamYellowPlayerIds: draft.teamYellowPlayerIds,
    teamBluePlayerIds: draft.teamBluePlayerIds,
    yellowLines: draft.yellowLines,
    blueLines: draft.blueLines,
    yellowSlots: draft.yellowSlots || normalizeDetailedSlots(draft.yellowLines, draft.yellowLines, draft.teamYellowPlayerIds || []),
    blueSlots: draft.blueSlots || normalizeDetailedSlots(draft.blueLines, draft.blueLines, draft.teamBluePlayerIds || []),
    yellowGoals: draft.yellowGoals || [],
    blueGoals: draft.blueGoals || [],
    yellowMvpPlayerId: draft.yellowMvpPlayerId || '',
    blueMvpPlayerId: draft.blueMvpPlayerId || '',
    contributions: draft.contributions || [],
    statsApplied: false
  };
}

function computeSummary() {
  const allPlayers = rankingPlayers();
  const completed = completedMatches(matchesAscending());
  const avgPresence = completed.length
    ? Math.round(completed.reduce((sum, match) => sum + presentIdsForCompletedMatch(match).size, 0) / completed.length)
    : 0;
  return {
    journee: currentMatchdayNumber(),
    totalButs: allPlayers.reduce((sum, p) => sum + Number(p.goals || 0), 0),
    totalPasses: allPlayers.reduce((sum, p) => sum + Number(p.assists || 0), 0),
    moyennePresent: avgPresence
  };
}

function topPlayers(metric, count = 3) {
  const labelMap = {
    points: 'PTS',
    goals: 'BUTS',
    assists: 'PASSES',
    mvps: 'MVP'
  };
  return rankingPlayers()
    .sort((a, b) => Number(b[metric] || 0) - Number(a[metric] || 0) || Number(a.classement || 999) - Number(b.classement || 999))
    .slice(0, count)
    .map((player, index) => ({ player, rank: index + 1, label: labelMap[metric], value: Number(player[metric] || 0) }));
}

function playerDisplayName(playerId) {
  return playerById(playerId)?.displayName || '-';
}

function normalizeName(value) {
  return value && String(value).trim() ? String(value).trim() : '-';
}

function scorersForGoals(goals = []) {
  return goals.map((goal) => normalizeName(playerDisplayName(goal.scorerPlayerId))).filter((name) => name !== '-');
}

function assistsForGoals(goals = []) {
  return goals.map((goal) => normalizeName(playerDisplayName(goal.assistPlayerId))).filter((name) => name !== '-');
}

function matchPresentAbsents(match) {
  const present = [];
  const absent = [];
  for (const item of match.presences || []) {
    const name = playerDisplayName(item.playerId);
    (item.present ? present : absent).push(name);
  }
  return { present, absent };
}

function arrangeTeamSimple(teamIds = []) {
  const ids = [...teamIds].filter(Boolean);
  return {
    goalkeeper: ids.slice(0, 1),
    defense: ids.slice(1, 5),
    midfield: ids.slice(5, 9),
    attack: ids.slice(9, 11),
    extras: ids.slice(11)
  };
}

function compoPlayerCard(playerId, teamColor, slotPosition = '') {
  const player = playerById(playerId);
  const name = player?.displayName || playerId || '';
  const avatar = player ? avatarForSlot(player, teamColor, slotPosition) : `Avatar_${teamColor === 'yellow' ? 'J1' : 'B1'}.webp`;
  return `
    <div class="compo-player">
      <img class="compo-avatar" src="${avatar}" alt="${escapeHtml(name)}" loading="lazy" />
      <div class="compo-name">${escapeHtml(name)}</div>
    </div>
  `;
}

function compoSlotsRow(ids = [], size = 1, teamColor = 'yellow', rowClass = '', reverse = false) {
  const filled = [...ids];
  while (filled.length < size) filled.push(null);
  if (reverse) filled.reverse();
  return `
    <div class="compo-row ${rowClass} slots-${size}">
      ${filled.map((playerId) => playerId ? compoPlayerCard(playerId, teamColor) : '<div class="compo-player ghost"></div>').join('')}
    </div>
  `;
}


function renderSimpleSlotsList(slots, teamColor = 'yellow') {
  const groups = [
    { label: 'Gardien', ids: [slots.GB].filter(Boolean) },
    { label: 'Défense', ids: [slots.DG, slots.DCG, slots.DC, slots.DCD, slots.DD].filter(Boolean) },
    { label: 'Milieu', ids: [slots.MDCG, slots.MDCD, slots.MG, slots.MCG, slots.MCD, slots.MD, slots.MOC].filter(Boolean) },
    { label: 'Attaque', ids: [slots.AG, slots.ACG, slots.BU, slots.ACD, slots.AD].filter(Boolean) }
  ].filter((group) => group.ids.length);
  return `
    <div class="simple-compo-list">
      ${groups.map((group) => `
        <div class="simple-line">
          <span>${group.label}</span>
          <div class="simple-grid">${group.ids.map((id) => compoPlayerCard(id, teamColor)).join('')}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderDetailedPitchBoard(slotsInput, teamColor = 'yellow') {
  const slots = normalizeDetailedSlots(slotsInput);
  const filledPositions = COMPO_POSITION_OPTIONS.filter((position) => slots[position]);
  const visualTeam = teamColor === 'neutral-edit' ? 'neutral' : teamColor;
  const editable = ['yellow', 'blue', 'neutral-edit'].includes(teamColor);
  return `
    <div class="pitch-board team-${visualTeam}">
      <img class="pitch-board-bg" src="${assetPath('Terrain', 'Terrain.webp')}" alt="Terrain" />
      ${filledPositions.map((position) => {
        const coords = positionFieldPercent(position);
        const playerId = slots[position];
        const player = playerId ? playerById(playerId) : null;
        if (!player) return '';
        return `
          <div class="pitch-slot filled ${position === 'GB' ? 'goalkeeper-slot' : ''}" style="left:${coords.left}%;top:${coords.top}%;width:${coords.width}%;height:${coords.height}% ;">
            <button class="pitch-player-card ${visualTeam} ${position === 'GB' ? 'goalkeeper-card' : ''}" ${editable ? `data-unassign-player="${playerId}"` : ''} type="button">
              <img class="pitch-player-avatar" src="${avatarForSlot(player, visualTeam, position)}" alt="${escapeHtml(player.displayName)}" />
              <span class="pitch-player-name">${escapeHtml(player.displayName)}</span>
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderTeamCompo(teamIds = [], teamColor = 'yellow', mode = 'field', mirror = false) {
  const slots = normalizeDetailedSlots(
    hasDetailedSlots(teamIds) ? teamIds : null,
    teamIds && typeof teamIds === 'object' && !Array.isArray(teamIds) ? teamIds : null,
    Array.isArray(teamIds) ? teamIds : []
  );
  if (mode === 'simple') return renderSimpleSlotsList(slots, teamColor);
  return renderDetailedPitchBoard(slots, teamColor);
}

function statPill(label, value) {
  return `<div class="stat-pill"><div class="label">${label}</div><div class="value">${value ?? 0}</div></div>`;
}

function statsRow(label, value) {
  return `<div class="stats-row"><span>${label}</span><strong>${value}</strong></div>`;
}

function playerRank(metric, playerId, descending = true) {
  const ordered = [...players()].sort((a, b) => {
    const av = Number(a[metric] || 0);
    const bv = Number(b[metric] || 0);
    return descending ? bv - av : av - bv;
  });
  return ordered.findIndex((p) => p.playerId === playerId) + 1;
}

function seasonBadge() {
  return '';
}

function searchBox() { return ''; }

function leaderSection(title, leaders) {
  return `
    <section class="card">
      <div class="card-head"><h2>${title}</h2></div>
      <div class="card-body leaders-grid">
        ${leaders.map(({ player, label, value }) => `
          <button class="leader-card player-trigger" data-player-id="${player.playerId}" type="button">
            <div class="player-mini">
              <img class="avatar" src="${avatarFor(player)}" alt="${escapeHtml(player.displayName)}" />
              <div>
                <div class="name">${escapeHtml(player.displayName)}</div>
                <div class="stat">${value}</div>
              </div>
            </div>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function matchCard(match) {
  const yellowMvp = playerById(match.yellowMvpPlayerId)?.displayName || '-';
  const blueMvp = playerById(match.blueMvpPlayerId)?.displayName || '-';
  return `
    <button class="result-row match-trigger" data-match-id="${match.matchId}" type="button">
      <div class="result-date">${match.dateLabel}</div>
      <div class="result-score-layout">
        <span class="team-label yellow">JAUNE</span>
        <div class="result-score-box">
          <span class="score-value yellow">${match.yellowScore}</span>
          <span class="score-dash">—</span>
          <span class="score-value blue">${match.blueScore}</span>
        </div>
        <span class="team-label blue">BLEU</span>
      </div>
      <div class="result-mvp-layout">
        <span class="mvp-player-name yellow">${escapeHtml(yellowMvp)}</span>
        <span class="mvp-center">MVP</span>
        <span class="mvp-player-name blue">${escapeHtml(blueMvp)}</span>
      </div>
    </button>
  `;
}


function positionsBlockMarkup(player) {
  const editing = canEditPositions() && state.playerPositionsEditId === player.playerId;
  const current = editing ? [...state.playerPositionsDraft] : getPlayerPositions(player);
  if (!editing) {
    const main = current[0] || '';
    const secondary = current.slice(1);
    const layout = current.length <= 1
      ? `<div class="positions-single"><span class="position-main-badge">${main || '—'}</span></div>`
      : `<div class="positions-split"><div class="positions-main-wrap"><span class="position-main-badge">${main}</span></div><div class="positions-secondary-wrap">${secondary.map((pos) => `<span class="position-chip">${pos}</span>`).join('')}</div></div>`;
    return `
      <section class="card positions-card">
        <div class="card-head"><h3>Postes</h3>${canEditPositions() ? '<button class="tab-btn" data-edit-positions="1" type="button">Modifier</button>' : ''}</div>
        <div class="card-body positions-readonly compact">${layout}</div>
      </section>
    `;
  }
  return `
    <section class="card positions-card">
      <div class="card-head"><h3>Postes</h3></div>
      <div class="card-body positions-editor">
        <div class="positions-palette">${POSITION_OPTIONS.map((pos) => `<button class="position-toggle ${current.includes(pos) ? 'active' : ''}" data-toggle-position="${pos}" type="button">${pos}</button>`).join('')}</div>
        <div class="positions-priority-list">
          ${current.length ? current.map((pos, index) => `
            <div class="position-priority-row">
              <span class="position-chip active">${pos}</span>
              <div class="position-priority-actions">
                <button class="mini-btn" data-move-position="up" data-position-index="${index}" type="button" ${index === 0 ? 'disabled' : ''}>↑</button>
                <button class="mini-btn" data-move-position="down" data-position-index="${index}" type="button" ${index === current.length - 1 ? 'disabled' : ''}>↓</button>
                <button class="mini-btn danger" data-remove-position="${pos}" type="button">×</button>
              </div>
            </div>
          `).join('') : '<div class="empty-state compact">Sélectionne au moins un poste.</div>'}
        </div>
        <div class="coach-save-row">
          <button class="secondary-btn" data-cancel-positions="1" type="button">Annuler</button>
          <button class="primary-btn" data-save-positions="1" type="button">${state.playerPositionsSaving ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>
    </section>
  `;
}

function listMarkup(items, empty = '—', itemClass = '') {
  if (!items.length) return `<div class="detail-empty">${empty}</div>`;
  return items.map((item) => `<div class="detail-name ${itemClass}">${escapeHtml(item)}</div>`).join('');
}


function playerDetailMarkup(player) {
  const impact = playerTeamImpact(player.playerId);
  const positions = getPlayerPositions(player);
  const mainPos = positions[0] || '—';
  const badges = badgeChipsForPlayer(player);
  const isAttacking = ['BU', 'AC', 'AG', 'AD'].includes(mainPos);
  const involvement = (Number(player.goals || 0) + Number(player.assists || 0)) / Math.max(1, Number(player.matchesPlayed || 1));
  return `
    <div class="player-showcase">
      <section class="card player-showcase-hero">
        <div class="player-showcase-avatar-wrap player-avatar-stage">
          <div class="player-avatar-season">SAISON ${currentSeasonDisplay()}</div>
          ${playerOverallBadgeMarkup(player)}
          <img class="avatar" src="${avatarFor(player)}" alt="${escapeHtml(player.displayName)}" />
          <div class="player-avatar-name">${escapeHtml(player.displayName.toUpperCase())}</div>
        </div>
        <div class="player-showcase-meta player-showcase-summary">
          ${badges.length ? `<div class="badge-row">${badges.map((badge) => `<span class="mini-badge">${badge}</span>`).join('')}</div>` : ''}
          <div class="stat-strip">
            ${statPill('MJ', player.matchesPlayed)}
            ${statPill('Buts', player.goals)}
            ${statPill('Passes', player.assists)}
            ${statPill('MVP', player.mvps)}
          </div>
        </div>
      </section>

      <section class="detail-team-grid">
        <section class="card">
          <div class="card-head"><h3>Saison</h3></div>
          <div class="card-body stats-table">
            ${statsRow('Classement', ordinal(player.classement))}
            ${statsRow('Rang buteur', metricRankForPlayer(player.playerId, 'goals') ? ordinal(metricRankForPlayer(player.playerId, 'goals')) : '—')}
            ${statsRow('Rang passeur', metricRankForPlayer(player.playerId, 'assists') ? ordinal(metricRankForPlayer(player.playerId, 'assists')) : '—')}
            ${statsRow('Rang MVP', metricRankForPlayer(player.playerId, 'mvps') ? ordinal(metricRankForPlayer(player.playerId, 'mvps')) : '—')}
            ${statsRow('Note', `${playerOverallRating(player.playerId).base}${playerOverallRating(player.playerId).delta >= 0 ? '+' : ''}${playerOverallRating(player.playerId).delta} = ${playerOverallRating(player.playerId).rating}`)}
            ${statsRow('Points', player.points)}
            ${statsRow('V / N / D', `${player.wins} / ${player.draws} / ${player.losses}`)}
            ${statsRow('BP / BC', `${player.goalsFor} / ${player.goalsAgainst}`)}
            ${statsRow('Différence', signed(player.goalDifference))}
            ${statsRow('% victoire', fmtPct(player.victoryRate))}
            ${statsRow('Présences', player.presences)}
            ${statsRow('Absences', player.absences)}
          </div>
        </section>

        ${positionsBlockMarkup(player)}
      </section>

      <section class="card">
        <div class="card-head"><h3>Impact équipe</h3></div>
        <div class="card-body impact-split-grid">
          <section class="impact-side impact-yellow-night">
            <h4 class="yellow">En jaune</h4>
            <div class="stats-table">
              ${statsRow('Matchs joués', impact.yellowMatches)}
              ${statsRow('Victoires', impact.yellowWins)}
              ${statsRow('Nuls', impact.yellowDraws)}
              ${statsRow('Défaites', impact.yellowLosses)}
              ${statsRow('Marqués', impact.yellowGoalsFor)}
              ${statsRow('Encaissés', impact.yellowGoalsAgainst)}
            </div>
          </section>
          <section class="impact-side impact-blue-night">
            <h4 class="blue">En bleu</h4>
            <div class="stats-table">
              ${statsRow('Matchs joués', impact.blueMatches)}
              ${statsRow('Victoires', impact.blueWins)}
              ${statsRow('Nuls', impact.blueDraws)}
              ${statsRow('Défaites', impact.blueLosses)}
              ${statsRow('Marqués', impact.blueGoalsFor)}
              ${statsRow('Encaissés', impact.blueGoalsAgainst)}
            </div>
          </section>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h3>${isAttacking ? 'Efficience offensive' : 'Efficience'}</h3></div>
        <div class="card-body summary-grid">
          <div class="summary-tile"><div>Buts / match</div><div class="value">${(Number(player.goals || 0) / Math.max(1, Number(player.matchesPlayed || 1))).toFixed(2)}</div></div>
          <div class="summary-tile"><div>Passes / match</div><div class="value">${(Number(player.assists || 0) / Math.max(1, Number(player.matchesPlayed || 1))).toFixed(2)}</div></div>
          <div class="summary-tile"><div>MVP / match</div><div class="value">${(Number(player.mvps || 0) / Math.max(1, Number(player.matchesPlayed || 1))).toFixed(2)}</div></div>
          <div class="summary-tile"><div>Implication / match</div><div class="value">${involvement.toFixed(2)}</div></div>
          <div class="summary-tile"><div>% victoire</div><div class="value">${fmtPct(player.victoryRate)}</div></div>
          <div class="summary-tile"><div>Forme</div><div class="value form-value">${recentFormDotsMarkup(player.playerId, 5)}</div></div>
        </div>
      </section>
    </div>
  `;
}

function matchStatsMarkup(match) {
  const yellowMvp = playerById(match.yellowMvpPlayerId);
  const blueMvp = playerById(match.blueMvpPlayerId);
  const yellowScorers = scorersForGoals(match.yellowGoals || []);
  const yellowAssists = assistsForGoals(match.yellowGoals || []);
  const blueScorers = scorersForGoals(match.blueGoals || []);
  const blueAssists = assistsForGoals(match.blueGoals || []);
  const attendance = matchPresentAbsents(match);

  return `
    <section class="card">
      <div class="card-head"><h3>MVP du match</h3></div>
      <div class="card-body detail-mvp-grid">
        <div class="mvp-player yellow-side yellow-soft">
          ${yellowMvp ? `<img class="avatar" src="${mvpAvatarFor(yellowMvp, 'yellow')}" alt="${yellowMvp.displayName}" />` : ''}
          <div class="mvp-name yellow">${yellowMvp?.displayName || '—'}</div>
        </div>
        <div class="mvp-player blue-side blue-soft">
          ${blueMvp ? `<img class="avatar" src="${mvpAvatarFor(blueMvp, 'blue')}" alt="${blueMvp.displayName}" />` : ''}
          <div class="mvp-name blue">${blueMvp?.displayName || '—'}</div>
        </div>
      </div>
    </section>

    <section class="detail-team-grid">
      <article class="card detail-team-card yellow-soft">
        <div class="card-head"><h3 class="yellow">Jaune</h3></div>
        <div class="card-body detail-team-body">
          <div class="detail-group">
            <div class="detail-group-title yellow">Buteurs</div>
            <div class="detail-list yellow-list">${listMarkup(yellowScorers, 'Aucun')}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-title orange">Passeurs</div>
            <div class="detail-list orange-list">${listMarkup(yellowAssists, 'Aucun')}</div>
          </div>
        </div>
      </article>
      <article class="card detail-team-card blue-soft">
        <div class="card-head"><h3 class="blue">Bleu</h3></div>
        <div class="card-body detail-team-body">
          <div class="detail-group">
            <div class="detail-group-title blue">Buteurs</div>
            <div class="detail-list blue-list">${listMarkup(blueScorers, 'Aucun')}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-title blue-dark">Passeurs</div>
            <div class="detail-list blue-dark-list">${listMarkup(blueAssists, 'Aucun')}</div>
          </div>
        </div>
      </article>
    </section>

    <section class="card">
      <div class="card-head"><h3>Présences</h3></div>
      <div class="card-body attendance-grid">
        <div class="attendance-box present-box">
          <div class="attendance-title">Présents (${attendance.present.length})</div>
          <div class="attendance-list">${listMarkup(attendance.present, 'Aucun')}</div>
        </div>
        <div class="attendance-box absent-box">
          <div class="attendance-title">Absents (${attendance.absent.length})</div>
          <div class="attendance-list">${listMarkup(attendance.absent, 'Aucun')}</div>
        </div>
      </div>
    </section>
  `;
}

function matchCompoMarkup(match) {
  const modeLabel = state.compoMode === 'field' ? 'Vue sobre' : 'Vue terrain';
  return `
    <section class="card detail-compo-card">
      <div class="card-head compo-head">
        <div>
          <h3>Compo du match</h3>
          <div class="compo-date-sub">${match.dateLabel}</div>
        </div>
        <div class="compo-head-actions">
          <button class="tab-btn active compo-toggle-btn" data-compo-toggle-dialog="1">${modeLabel}</button>
        </div>
      </div>
      <div class="card-body compo-shell ${state.compoMode === 'field' ? 'mode-field' : 'mode-simple'}">
        <section class="team-box compo-team-card">
          ${renderTeamCompo(match.yellowSlots || match.yellowLines || match.teamYellowPlayerIds || [], 'yellow', state.compoMode, false)}
        </section>
        <section class="team-box compo-team-card">
          ${renderTeamCompo(match.blueSlots || match.blueLines || match.teamBluePlayerIds || [], 'blue', state.compoMode, false)}
        </section>
      </div>
    </section>
  `;
}

function matchDetailMarkup(match) {
  return `
    <div class="match-detail">
      <section class="card detail-hero">
        <div class="detail-date">${match.dateLabel}</div>
        <div class="detail-score-row">
          <span class="team-label score-team-yellow">JAUNE</span>
          <div class="detail-score-box">
            <span class="detail-score score-team-yellow">${match.yellowScore}</span>
            <span class="detail-score-sep">—</span>
            <span class="detail-score score-team-blue">${match.blueScore}</span>
          </div>
          <span class="team-label score-team-blue">BLEU</span>
        </div>
      </section>

      <section class="detail-actions-row match-detail-tabs-3">
        <button class="tab-btn ${state.matchDetailMode === 'stats' ? 'active' : ''}" data-match-view="stats">Stats</button>
        <button class="tab-btn ${state.matchDetailMode === 'compo' ? 'active' : ''}" data-match-view="compo">Compo</button>
        ${canShareGeneral() ? `<button class="tab-btn" data-share-match-bundle="${match.matchId}" type="button">Partager</button>` : ''}
      </section>

      ${state.matchDetailMode === 'stats' ? matchStatsMarkup(match) : matchCompoMarkup(match)}
    </div>
  `;
}

function attachPlayerDialogInteractions() {
  els.playerDialogBody.querySelectorAll('[data-edit-positions]').forEach((btn) => btn.addEventListener('click', () => {
    const player = playerById(state.activePlayerId);
    if (!player) return;
    state.playerPositionsEditId = player.playerId;
    state.playerPositionsDraft = [...getPlayerPositions(player)];
    els.playerDialogBody.innerHTML = playerDetailMarkup(player);
    attachPlayerDialogInteractions();
  }));
  els.playerDialogBody.querySelectorAll('[data-toggle-position]').forEach((btn) => btn.addEventListener('click', () => {
    const pos = btn.dataset.togglePosition;
    const current = [...state.playerPositionsDraft];
    if (current.includes(pos)) state.playerPositionsDraft = current.filter((v) => v !== pos);
    else state.playerPositionsDraft = [...current, pos];
    const player = playerById(state.activePlayerId);
    if (!player) return;
    els.playerDialogBody.innerHTML = playerDetailMarkup(player);
    attachPlayerDialogInteractions();
  }));
  els.playerDialogBody.querySelectorAll('[data-remove-position]').forEach((btn) => btn.addEventListener('click', () => {
    state.playerPositionsDraft = state.playerPositionsDraft.filter((v) => v !== btn.dataset.removePosition);
    const player = playerById(state.activePlayerId);
    if (!player) return;
    els.playerDialogBody.innerHTML = playerDetailMarkup(player);
    attachPlayerDialogInteractions();
  }));
  els.playerDialogBody.querySelectorAll('[data-move-position]').forEach((btn) => btn.addEventListener('click', () => {
    const index = Number(btn.dataset.positionIndex || 0);
    const dir = btn.dataset.movePosition;
    const arr = [...state.playerPositionsDraft];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    state.playerPositionsDraft = arr;
    const player = playerById(state.activePlayerId);
    if (!player) return;
    els.playerDialogBody.innerHTML = playerDetailMarkup(player);
    attachPlayerDialogInteractions();
  }));
  els.playerDialogBody.querySelectorAll('[data-cancel-positions]').forEach((btn) => btn.addEventListener('click', () => {
    state.playerPositionsEditId = null;
    state.playerPositionsDraft = [];
    const player = playerById(state.activePlayerId);
    if (!player) return;
    els.playerDialogBody.innerHTML = playerDetailMarkup(player);
    attachPlayerDialogInteractions();
  }));
  document.querySelectorAll('[data-share-player]').forEach((btn) => btn.addEventListener('click', () => sharePlayer(state.activePlayerId)));
  document.querySelectorAll('[data-download-player]').forEach((btn) => btn.addEventListener('click', () => downloadPlayer(state.activePlayerId)));
  els.playerDialogBody.querySelectorAll('[data-save-positions]').forEach((btn) => btn.addEventListener('click', async () => {
    const positions = [...new Set(state.playerPositionsDraft.map((v) => String(v || '').trim()).filter(Boolean))];
    await savePlayerPositions(state.activePlayerId, positions);
    state.playerPositionsEditId = null;
    state.playerPositionsDraft = [];
    const player = playerById(state.activePlayerId);
    if (!player) return;
    els.playerDialogBody.innerHTML = playerDetailMarkup(player);
    attachPlayerDialogInteractions();
  }));
}

function openPlayer(playerId) {
  const player = playerById(playerId);
  if (!player) return;
  state.activePlayerId = playerId;
  state.playerPositionsEditId = null;
  state.playerPositionsDraft = [];
  els.playerDialogTitle.innerHTML = canShareGeneral()
    ? shareButtonMarkup('data-share-player="1"')
    : (canPlayerDownloadClosedSeason() ? downloadButtonMarkup('data-download-player="1"') : '');
  els.playerDialogBody.innerHTML = playerDetailMarkup(player);
  attachPlayerDialogInteractions();
  els.playerDialog.showModal();
}

function openMatch(matchId, mode = 'stats') {
  const match = matches().find((item) => item.matchId === matchId);
  if (!match) return;
  state.activeMatchId = matchId;
  state.matchDetailMode = mode;
  els.matchDialogTitle.textContent = `Détail du match · ${match.dateLabel}`;
  els.matchDialogBody.innerHTML = matchDetailMarkup(match);
  attachMatchDialogInteractions();
  els.matchDialog.showModal();
}


function openFeature(kind) {
  const title = kind === 'eleven' ? 'Onze type' : 'Résumé saison';
  els.featureDialogTitle.textContent = title;
  els.featureDialogBody.innerHTML = featureDialogMarkup(kind);
  attachPlayerTriggers(els.featureDialogBody);
  els.featureDialogBody.querySelectorAll('[data-share-compo-source]').forEach((btn) => {
    btn.addEventListener('click', () => shareCompoFromSource(btn.dataset.shareCompoSource));
  });
  els.featureDialogBody.querySelectorAll('[data-share-season-summary]').forEach((btn) => {
    btn.addEventListener('click', () => shareSeasonSummary());
  });
  attachClassOnzeTriggers(els.featureDialogBody);
  els.featureDialog.showModal();
}

function showInstallDialog() {
  if (state.deferredInstallPrompt) {
    state.deferredInstallPrompt.prompt();
    state.deferredInstallPrompt.userChoice.catch(() => {}).finally(() => { state.deferredInstallPrompt = null; });
    return;
  }
  els.installDialogBody.innerHTML = `
    <div class="install-steps compact-install">
      <p class="muted">iPhone : Safari → Partager → Sur l’écran d’accueil.</p>
      <p class="muted">Android : menu du navigateur → Installer l’app, si le prompt ne s’ouvre pas automatiquement.</p>
    </div>
  `;
  els.installDialog.showModal();
}

function renderBoot() {
  const accessLabel = state.bootAccessRole === 'president' ? 'président' : 'entraîneur';
  return `
    <section class="boot-screen">
      <img class="boot-logo" src="${assetPath('logo', 'logo-cov.webp')}" alt="Logo COV" />
      <div class="boot-options">
        <button class="boot-role-btn" data-boot-role="player" type="button">
          <img src="${assetPath('Boot_Player', 'MaillotDomicile.webp')}" alt="Joueur" />
          <span>Joueur</span>
          <small>Libre</small>
        </button>
        <button class="boot-role-btn coach" data-open-secure="coach" type="button">
          <img src="${assetPath('Boot_Coach', 'MaillotExterier.webp')}" alt="Entraîneur" />
          <span>Entraîneur</span>
          <small>Code</small>
        </button>
        <button class="boot-role-btn president" data-open-secure="president" type="button">
          <img src="${assetPath('Boot_President', 'MaillotThird.webp')}" alt="Président" />
          <span>Président</span>
          <small>Code</small>
        </button>
      </div>
      ${state.bootCoachOpen ? `
        <section class="card boot-coach-card">
          <div class="card-head"><h3>Code ${escapeHtml(accessLabel)}</h3></div>
          <div class="card-body boot-coach-form">
            <input id="coachCodeInput" class="coach-code-input" type="password" inputmode="numeric" placeholder="Entrer le code" value="${escapeHtml(state.coachCodeInput)}" />
            ${state.coachCodeError ? `<div class="boot-error">${escapeHtml(state.coachCodeError)}</div>` : ''}
            <div class="boot-actions">
              <button class="secondary-btn" data-close-coach="1" type="button">Fermer</button>
              <button class="primary-btn" data-submit-coach="1" type="button">Entrer sur le terrain</button>
            </div>
          </div>
        </section>
      ` : ''}
    </section>
  `;
}

function isBallonOrActive() {
  return seasonData()?.ballonOrActive === true;
}

function ballonOrPlayers() {
  const base = aggregatePlayersFromMatches(matches());
  const pool = rankingPlayers(base.length ? base : players()).filter((player) => Number(player.matchesPlayed || 0) > 0 || Number(player.points || 0) > 0);
  const source = pool.length ? pool : rankingPlayers();
  if (!source.length) return [];
  const ranked = source.map((player) => {
    const seasonScore = playerSeasonPerformanceScore(player, source, state.activeSeasonId, 'journee', 'ballon');
    const matchScore = playerSeasonPerformanceScore(player, source, state.activeSeasonId, 'match', 'ballon');
    const harmonized = playerHarmonizedMatchScore(player, source, state.activeSeasonId, 'ballon');
    const raw = seasonScore * 0.7 + harmonized * 0.3;
    const score = Math.round(clampNumber(raw, 0, 100));
    const note = playerOverallRating(player.playerId).rating;
    const mj = Math.max(1, Number(player.matchesPlayed || 0));
    const contribRate = (Number(player.goals || 0) + Number(player.assists || 0)) / mj;
    return {
      ...player,
      ballonOrScore: score,
      ballonOrRaw: raw,
      ballonOrNote: note,
      ballonOrSeasonScore: seasonScore,
      ballonOrMatchScore: matchScore,
      ballonOrHarmonizedScore: harmonized,
      implicationPerMatch: contribRate,
    };
  });
  ranked.sort((a, b) => Number(b.ballonOrScore || 0) - Number(a.ballonOrScore || 0)
    || Number(a.classement || 999) - Number(b.classement || 999)
    || Number(b.ballonOrRaw || 0) - Number(a.ballonOrRaw || 0)
    || Number(b.points || 0) - Number(a.points || 0)
    || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName))
  );
  ranked.forEach((player, index) => { player.ballonOrRank = index + 1; });
  return ranked.reverse();
}

function resetBallonOrPlayback() {
  if (state.ballonOrTimer) clearTimeout(state.ballonOrTimer);
  state.ballonOrTimer = null;
  state.ballonOrIndex = 0;
  state.ballonOrPaused = false;
}

async function setBallonOrActive(active) {
  const season = seasonData();
  if (!season) return;
  const nextRoot = structuredClone(state.root);
  nextRoot.seasons[state.activeSeasonId] = {
    ...nextRoot.seasons[state.activeSeasonId],
    ballonOrActive: active === true,
  };
  await persistWholeRoot(nextRoot);
  resetBallonOrPlayback();
}

function renderBallonOrHomeCard() {
  return `
    <section class="card hero-card next-match-card ballon-home-card">
      <div class="hero-grid hero-center next-match-home-grid">
        <div>
          <div class="eyebrow">Voir classement Ballon d'Or</div>
          <div class="next-match-date">Ballon d'Or</div>
          <div class="next-match-time">Saison ${escapeHtml(currentSeasonDisplay())}</div>
        </div>
        <div class="home-actions-scroll">
          <button class="primary-btn" data-view-switch="ballonor" type="button">Voir classement</button>
        </div>
      </div>
    </section>
  `;
}

function renderBallonOr() {
  const list = ballonOrPlayers();
  if (!list.length) {
    return `<section class="card center-card error-card"><h2>Ballon d'Or</h2><p>Aucun joueur disponible.</p></section>`;
  }
  if (state.ballonOrIndex < 0 || state.ballonOrIndex >= list.length) state.ballonOrIndex = 0;
  const player = list[state.ballonOrIndex];
  const isWinner = Number(player.ballonOrRank || 0) === 1;
  const total = list.length;
  const progress = total <= 1 ? 100 : Math.round(((state.ballonOrIndex + 1) / total) * 100);
  const rankLabel = Number(player.ballonOrRank || 0) === 1 ? '1ER' : `${player.ballonOrRank}ÈME`;
  return `
    <section class="ballon-page ${isWinner ? 'winner' : ''}">
      <div class="ballon-topbar">
        <button class="secondary-btn" data-view-switch="home" type="button">← Retour</button>
        <button class="secondary-btn" data-ballon-pause="1" type="button">${state.ballonOrPaused ? '▶ Reprendre' : '⏸ Pause'}</button>
      </div>
      <div class="ballon-title"><div class="ballon-trophy">🏆</div><h1>BALLON D'OR</h1><p>CLASSEMENT SAISON ${escapeHtml(currentSeasonDisplay())}</p></div>
      <div class="ballon-rank ${isWinner ? 'rank-winner' : ''}">${rankLabel}</div>
      ${isWinner ? '<div class="ballon-winner-label">BALLON D’OR DE LA SAISON</div>' : ''}
      <div class="ballon-main-grid">
        <div class="ballon-avatar-card"><img src="${avatarFor(player)}" alt="${escapeHtml(player.displayName)}" /></div>
        <div class="ballon-player-info">
          <h2>${escapeHtml(String(player.displayName || '').toUpperCase())}</h2>
          <div class="ballon-club-line">COV · ${escapeHtml((getPlayerPositions(player)[0] || 'JOUEUR').toUpperCase())}</div>
          <div class="ballon-score-label">Score Ballon d'Or</div>
          <div class="ballon-score"><strong>${Number(player.ballonOrScore || 0)}</strong><span>/ 100</span></div>
        </div>
      </div>
      <div class="ballon-stats-title">STATS SAISON ${escapeHtml(currentSeasonDisplay())}</div>
      <div class="ballon-stats-grid">
        <div><span>Points</span><strong>${Number(player.points || 0)}</strong></div>
        <div><span>MJ</span><strong>${Number(player.matchesPlayed || 0)}</strong></div>
        <div><span>Buts</span><strong>${Number(player.goals || 0)}</strong></div>
        <div><span>Passes</span><strong>${Number(player.assists || 0)}</strong></div>
        <div><span>Victoires</span><strong>${Number(player.wins || 0)}</strong></div>
        <div><span>MVP</span><strong>${Number(player.mvps || 0)}</strong></div>
        <div><span>%V</span><strong>${fmtPct(player.victoryRate)}</strong></div>
      </div>
      <div class="ballon-actions">
        <button class="secondary-btn" data-ballon-pause="1" type="button">${state.ballonOrPaused ? 'Reprendre' : 'Pause / Reprendre'}</button>
        <button class="primary-btn" data-ballon-top5="1" type="button">Passer au top 5</button>
        <button class="secondary-btn" data-view-switch="home" type="button">Retour accueil</button>
        ${isPresident() ? `<button class="secondary-btn" data-share-ballon-range="last11" type="button">Partager dernière → 11e</button><button class="secondary-btn" data-share-ballon-range="ten4" type="button">Partager 10e → 4e</button><button class="secondary-btn" data-share-ballon-range="podium" type="button">Partager podium</button>` : ''}
      </div>
      ${isWinner ? `<div class="ballon-final-message">FÉLICITATIONS ${escapeHtml(String(player.displayName || '').toUpperCase())} !</div>` : ''}
      <div class="ballon-progress-label">${state.ballonOrIndex + 1} / ${total} JOUEURS</div>
      <div class="ballon-progress"><span style="width:${progress}%"></span></div>
    </section>`;
}

function scheduleBallonOrAutoAdvance() {
  if (state.activeView !== 'ballonor' || state.ballonOrPaused) return;
  if (state.ballonOrTimer) clearTimeout(state.ballonOrTimer);
  const list = ballonOrPlayers();
  if (!list.length) return;
  const current = list[state.ballonOrIndex] || list[0];
  const rank = Number(current.ballonOrRank || 999);
  const delay = ballonOrDelayForRank(rank);
  state.ballonOrTimer = setTimeout(() => {
    if (state.activeView !== 'ballonor' || state.ballonOrPaused) return;
    if (state.ballonOrIndex < list.length - 1) state.ballonOrIndex += 1;
    renderCurrentView();
  }, delay);
}


function ballonOrRangeRows(range) {
  const ordered = [...ballonOrPlayers()].sort((a, b) => Number(a.ballonOrRank || 999) - Number(b.ballonOrRank || 999));
  if (range === 'all') return ordered;
  if (range === 'podium') return ordered.filter((player) => Number(player.ballonOrRank || 0) <= 3);
  if (range === 'ten4') return ordered.filter((player) => Number(player.ballonOrRank || 0) >= 4 && Number(player.ballonOrRank || 0) <= 10);
  const tail = ordered.filter((player) => Number(player.ballonOrRank || 0) >= 11);
  return tail.sort((a, b) => Number(b.ballonOrRank || 0) - Number(a.ballonOrRank || 0));
}

function ballonOrRangeTitle(range) {
  if (range === 'all') return 'Ballon d’Or';
  if (range === 'podium') return 'Podium Ballon d’Or';
  if (range === 'ten4') return 'Ballon d’Or · 10e à 4e';
  return 'Ballon d’Or · dernière place à 11e';
}

async function createBallonOrRankingShareBlob(range) {
  const rows = ballonOrRangeRows(range);
  if (!rows.length) return null;
  const rowH = 112;
  const width = 1200;
  const height = 280 + rows.length * rowH + 80;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const rounded = (x, y, w, h, r = 26) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  ctx.fillStyle = '#07142c';
  ctx.fillRect(0, 0, width, height);
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#173c76');
  grad.addColorStop(1, '#030814');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  try { const logo = await loadImage(assetPath('logo', 'logo-cov.webp')); ctx.drawImage(logo, 54, 42, 130, 130); } catch {}
  ctx.fillStyle = '#ffd55c';
  ctx.font = '800 34px Inter, Arial';
  ctx.textAlign = 'left';
  ctx.fillText(currentSeasonDisplay(), 220, 84);
  ctx.fillStyle = '#ffffff';
  ctx.font = '950 58px Inter, Arial';
  ctx.fillText('C.O.V', 220, 150);
  rows.forEach((player, index) => {
    const y = 278 + index * rowH;
    rounded(54, y, width - 108, rowH - 16, 24);
    ctx.fillStyle = index % 2 === 0 ? 'rgba(255,255,255,.065)' : 'rgba(255,255,255,.035)';
    ctx.fill();
    ctx.fillStyle = Number(player.ballonOrRank || 0) <= 3 ? '#ffd55c' : '#ffffff';
    ctx.font = '950 40px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`#${player.ballonOrRank}`, 122, y + 61);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px Inter, Arial';
    ctx.fillText(String(player.displayName || '').toUpperCase(), 200, y + 48);
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.font = '700 22px Inter, Arial';
    ctx.fillText(`${player.points} pts · ${player.matchesPlayed} MJ · ${player.goals} buts · ${player.assists} passes · ${player.mvps} MVP`, 200, y + 82);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffd55c';
    ctx.font = '950 46px Inter, Arial';
    ctx.fillText(`${Number(player.ballonOrScore || 0)}/100`, width - 88, y + 58);
    ctx.fillStyle = 'rgba(255,255,255,.72)';
    ctx.font = '800 22px Inter, Arial';
    ctx.fillText(`J ${Number(player.matchesPlayed || 0)} · B+A ${Number(player.goals || 0) + Number(player.assists || 0)}`, width - 88, y + 86);
  });
  return blobFromCanvas(canvas);
}

async function shareBallonOrRanking(range) {
  if (!isPresident()) return;
  const blob = await createBallonOrRankingShareBlob(range);
  if (!blob) return;
  const label = range === 'all' ? 'global' : range === 'podium' ? 'podium' : range === 'ten4' ? '10-4' : 'derniere-11';
  await shareBlob(blob, `cov-ballon-or-${label}-${currentSeasonDisplay().replace('/', '-')}.png`, 'C.O.V', currentSeasonDisplay());
}

async function imageDataUrlForShare(src, size = 420) {
  try {
    const img = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.fillStyle = '#0b1730';
    ctx.fillRect(0, 0, size, size);
    drawImageContain(ctx, img, 0, 0, size, size);
    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

async function paintBallonOrCardBackground(ctx, canvas) {
  try {
    const bg = await loadImage(assetPath('BallonOrCardTemplate', 'BallonOrCardTemplate.png'));
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  } catch {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0a2f6f');
    grad.addColorStop(1, '#031126');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function renderBallonOrCardCanvas(ctx, player) {
  const canvas = ctx.canvas;
  const rank = Number(player.ballonOrRank || 0);
  const rankLabel = rank === 1 ? '1ER' : `${rank}ÈME`;
  const score = Math.round(Number(player.ballonOrScore || 0));
  const name = String(player.displayName || '').toUpperCase();

  const fitCenterText = (value, x, y, maxWidth, size, weight = 950, color = '#fff') => {
    let fontSize = size;
    do {
      ctx.font = `${weight} ${fontSize}px Inter, Arial, sans-serif`;
      if (ctx.measureText(String(value)).width <= maxWidth || fontSize <= 18) break;
      fontSize -= 2;
    } while (fontSize > 18);
    ctx.fillStyle = color;
    ctx.fillText(String(value), x, y);
  };

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f7d86a';
  ctx.font = '900 32px Inter, Arial, sans-serif';
  ctx.fillText(currentSeasonDisplay(), canvas.width / 2, 190);

  ctx.save();
  ctx.shadowColor = 'rgba(255,213,92,.28)';
  ctx.shadowBlur = 18;
  fitCenterText(rankLabel, canvas.width / 2, 372, 720, rank === 1 ? 164 : 154, 950, '#f7d86a');
  ctx.restore();

  if (player._vodAvatar) {
    ctx.save();
    ctx.shadowColor = 'rgba(255,213,92,.18)';
    ctx.shadowBlur = 14;
    drawImageContain(ctx, player._vodAvatar, 206, 405, 530, 650);
    ctx.restore();
  }

  fitCenterText(name, canvas.width / 2, 1118, 700, 82, 950, '#ffffff');

  ctx.fillStyle = '#f7d86a';
  ctx.font = '950 112px Inter, Arial, sans-serif';
  ctx.fillText(String(score), 425, 1246);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 40px Inter, Arial, sans-serif';
  ctx.fillText('/100', 560, 1237);

  const statBoxes = [
    { x: 48, value: Number(player.goals || 0) },
    { x: 224, value: Number(player.assists || 0) },
    { x: 400, value: Number(player.mvps || 0) },
    { x: 576, value: fmtPct(player.victoryRate) },
    { x: 752, value: ordinal(player.classement) },
  ];

  statBoxes.forEach((box) => {
    ctx.fillStyle = '#ffffff';
    const valueStr = String(box.value);
    let valueSize = 66;
    if (valueStr.length >= 7) valueSize = 30;
    else if (valueStr.length >= 6) valueSize = 34;
    else if (valueStr.length >= 5) valueSize = 40;
    else if (valueStr.length >= 4) valueSize = 50;
    else if (valueStr.length >= 3) valueSize = 58;
    ctx.font = `950 ${valueSize}px Inter, Arial, sans-serif`;
    ctx.fillText(valueStr, box.x + 78, 1518);
  });
}

async function createBallonOrCardBlob(player) {
  const canvas = document.createElement('canvas');
  canvas.width = 941;
  canvas.height = 1672;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  await paintBallonOrCardBackground(ctx, canvas);
  renderBallonOrCardCanvas(ctx, player);
  return blobFromCanvas(canvas);
}

async function createBallonOrCardItems() {
  const season = currentSeasonDisplay().replace('/', '-');
  const rows = ballonOrRangeRows('all');
  for (const player of rows) {
    try { player._vodAvatar = await loadImage(avatarFor(player)); } catch { player._vodAvatar = null; }
  }
  const items = [];
  for (const player of rows) {
    const blob = await createBallonOrCardBlob(player);
    if (!blob) continue;
    items.push({ blob, filename: `cov-ballon-or-card-${String(player.ballonOrRank || '').padStart(2, '0')}-${normalizeString(player.displayName)}-${season}.png` });
  }
  return items;
}

async function shareBallonOrCards() {
  if (!isPresident()) return;
  const items = await createBallonOrCardItems();
  if (!items.length) return;
  await shareNamedBlobs(items, 'C.O.V', `Ballon d'Or Card ${currentSeasonDisplay()}`);
}

async function createAllPlayerCardItems() {
  const season = currentSeasonDisplay().replace('/', '-');
  const pool = rankingPlayers(activePlayers());
  const items = [];
  for (const player of pool) {
    const blob = await createPlayerPremiumFullShareBlob(player);
    if (!blob) continue;
    items.push({ blob, filename: `cov-fiche-card-${String(player.classement || '').padStart(2, '0')}-${normalizeString(player.displayName)}-${season}.png` });
  }
  return items;
}

async function shareAllPlayerCards() {
  if (!isPresident()) return;
  const items = await createAllPlayerCardItems();
  if (!items.length) return;
  await shareNamedBlobs(items, 'C.O.V', `Fiche Card ${currentSeasonDisplay()}`);
}

function ballonOrDelayForRank(rank) {
  const value = Number(rank || 999);
  return value === 1 ? 8000 : value <= 5 ? 4500 : 2200;
}

function showVodGenerationOverlay(message = 'Génération vidéo Ballon d’Or...') {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(2,6,18,.86);display:grid;place-items:center;padding:24px;color:#fff;text-align:center;';
  overlay.innerHTML = `<div style="max-width:420px;background:#07142c;border:1px solid rgba(255,213,92,.28);border-radius:22px;padding:24px;box-shadow:0 24px 80px rgba(0,0,0,.45);"><div style="font:950 22px Inter,Arial;color:#ffd55c;margin-bottom:10px;">${escapeHtml(message)}</div><div style="font:700 14px Inter,Arial;color:rgba(255,255,255,.72);line-height:1.5;">Le fichier vidéo se crée en temps réel pour garder les durées exactes du défilement.</div><div data-vod-progress style="margin-top:14px;font:900 16px Inter,Arial;color:#fff;">Préparation…</div></div>`;
  document.body.appendChild(overlay);
  return {
    set(text) { const node = overlay.querySelector('[data-vod-progress]'); if (node) node.textContent = text; },
    close() { overlay.remove(); }
  };
}

function drawBallonOrVodFrame(ctx, player, progress = 0) {
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (player._vodTemplate) ctx.drawImage(player._vodTemplate, 0, 0, canvas.width, canvas.height);
  else {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0a2f6f');
    grad.addColorStop(1, '#031126');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  renderBallonOrCardCanvas(ctx, player);
}

async function createBallonOrVodVideoBlob() {
  const rows = ballonOrRangeRows('all').sort((a, b) => Number(b.ballonOrRank || 0) - Number(a.ballonOrRank || 0));
  if (!rows.length) return null;
  if (typeof MediaRecorder === 'undefined') {
    await showAppAlert('Création vidéo indisponible sur ce navigateur. Utilise Chrome/Edge/Android récent.', 'Vidéo indisponible');
    return null;
  }
  const status = showVodGenerationOverlay();
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 941;
    canvas.height = 1672;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas indisponible');
    const stream = canvas.captureStream(24);
    const preferredType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType: preferredType, videoBitsPerSecond: 3500000 });
    const chunks = [];
    recorder.ondataavailable = (event) => { if (event.data && event.data.size) chunks.push(event.data); };
    const stopped = new Promise((resolve) => { recorder.onstop = resolve; });
    recorder.start(500);
    const totalDuration = rows.reduce((sum, player) => sum + ballonOrDelayForRank(player.ballonOrRank), 0);
    let elapsed = 0;
    for (let i = 0; i < rows.length; i += 1) {
      const player = rows[i];
      status.set(`${i + 1}/${rows.length} · ${player.displayName}`);
      try { player._vodAvatar = await loadImage(avatarFor(player)); } catch { player._vodAvatar = null; }
      try { player._vodTemplate = await loadImage(assetPath('BallonOrCardTemplate', 'BallonOrCardTemplate.png')); } catch { player._vodTemplate = null; }
      const delay = ballonOrDelayForRank(player.ballonOrRank);
      const start = performance.now();
      await new Promise((resolve) => {
        const tick = () => {
          const now = performance.now();
          const local = Math.min(delay, now - start);
          drawBallonOrVodFrame(ctx, player, (elapsed + local) / Math.max(1, totalDuration));
          if (local >= delay) resolve();
          else requestAnimationFrame(tick);
        };
        tick();
      });
      elapsed += delay;
    }
    drawBallonOrVodFrame(ctx, rows[rows.length - 1], 1);
    recorder.stop();
    await stopped;
    stream.getTracks().forEach((track) => track.stop());
    return new Blob(chunks, { type: preferredType.split(';')[0] || 'video/webm' });
  } finally {
    status.close();
  }
}

async function shareBallonOrVod() {
  if (!isPresident()) return;
  const blob = await createBallonOrVodVideoBlob();
  if (!blob) return;
  const filename = `cov-ballon-or-vod-${currentSeasonDisplay().replace('/', '-')}.webm`;
  await previewShareItems([{ blob, filename }], 'C.O.V', currentSeasonDisplay());
}


function attachBallonOrInteractions() {
  els.viewMount.querySelectorAll('[data-ballon-pause]').forEach((btn) => btn.addEventListener('click', () => {
    state.ballonOrPaused = !state.ballonOrPaused;
    if (state.ballonOrTimer) clearTimeout(state.ballonOrTimer);
    state.ballonOrTimer = null;
    renderCurrentView();
  }));
  els.viewMount.querySelectorAll('[data-share-ballon-range]').forEach((btn) => btn.addEventListener('click', async () => {
    await shareBallonOrRanking(btn.dataset.shareBallonRange);
  }));
  els.viewMount.querySelectorAll('[data-ballon-top5]').forEach((btn) => btn.addEventListener('click', () => {
    const list = ballonOrPlayers();
    const top5Start = list.findIndex((player) => Number(player.ballonOrRank || 0) === Math.min(5, list.length));
    state.ballonOrIndex = top5Start >= 0 ? top5Start : Math.max(0, list.length - 5);
    state.ballonOrPaused = false;
    renderCurrentView();
  }));
  scheduleBallonOrAutoAdvance();
}

function renderHome() {
  const summary = computeSummary();
  const nextMatch = currentUpcomingInfo();
  const recentMatches = completedMatches().slice(0, 3);
  const history = recentHistorySummary(5);
  const canManage = canCompleteMatch();
  return `
    <section class="home-logout-row">
      <button class="secondary-btn" data-logout="1" type="button">Déconnecter</button>
    </section>

    ${isBallonOrActive() ? renderBallonOrHomeCard() : `
    <section class="card hero-card next-match-card">
      <div class="hero-grid hero-center next-match-home-grid">
        <div>
          <div class="eyebrow">Prochain match</div>
          <div class="next-match-date">${nextMatch.dateLabel}</div>
          <div class="next-match-time">${nextMatch.time}</div>
          ${isPresident() ? `<div class="match-day-picker"><input class="match-date-input" data-match-date-input="1" type="date" value="${nextMatch.dateIso || ''}" /></div>` : ''}
        </div>
        ${canManage ? `
          <div class="home-actions-scroll">
            <button class="primary-btn" data-view-switch="completeMatch" type="button">Faire compo</button>
            ${isPresident() ? `<button class="secondary-btn" data-save-match-day="1" type="button">Jour de match</button>` : ''}
            ${isPresident() ? `<button class="secondary-btn" data-view-switch="modifyMatches" type="button">Modifier</button>` : ''}
          </div>
        ` : ''}
      </div>
    </section>

    `}

    <section class="card">
      <div class="card-head"><h2>Saison ${currentSeasonDisplay()}</h2></div>
      <div class="card-body summary-grid">
        <div class="summary-tile"><div>Journée</div><div class="value">${summary.journee}</div></div>
        <div class="summary-tile"><div>Total buts</div><div class="value">${summary.totalButs}</div></div>
        <div class="summary-tile"><div>Total passes</div><div class="value">${summary.totalPasses}</div></div>
        <div class="summary-tile"><div>Moyenne présent</div><div class="value">${summary.moyennePresent}</div></div>
      </div>
    </section>

    <section class="section-stack">
      ${leaderSection('Classement', topPlayers('points'))}
      ${leaderSection('Buteurs', topPlayers('goals'))}
      ${leaderSection('Passeurs', topPlayers('assists'))}
    </section>

    <section class="card home-feature-actions-card">
      <div class="card-body action-grid home-feature-actions">
        <button class="feature-btn" data-open-feature="eleven" type="button">11 Type</button>
        <button class="feature-btn" data-open-feature="records" type="button">Résumé Saison</button>
      </div>
    </section>

    <section class="card">
      <div class="card-head"><h2>Résultats récents</h2></div>
      <div class="card-body results-list">
        ${recentMatches.length ? recentMatches.map(matchCard).join('') : '<div class="empty-state">Aucun match enregistré pour cette saison.</div>'}
      </div>
    </section>

    <section class="card">
      <div class="card-head"><h2>5 derniers matchs</h2></div>
      <div class="card-body recent-summary-grid">
        <div class="recent-summary-line yellow"><span>Victoire jaune</span><strong>${history.yellowWins}</strong></div>
        <div class="recent-summary-line"><span>Nul</span><strong>${history.draws}</strong></div>
        <div class="recent-summary-line blue"><span>Victoire bleu</span><strong>${history.blueWins}</strong></div>
        <div class="recent-goals-row"><span class="yellow">Buts jaune : <strong>${history.yellowGoals}</strong></span><span class="blue">Buts bleu : <strong>${history.blueGoals}</strong></span></div>
      </div>
    </section>
  `;
}

function sortPlayersForMode(mode) {
  const list = filteredPlayers(players());
  const sorters = {
    general: (a, b) => normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)),
    goals: (a, b) => Number(b.goals || 0) - Number(a.goals || 0),
    assists: (a, b) => Number(b.assists || 0) - Number(a.assists || 0),
    mvps: (a, b) => Number(b.mvps || 0) - Number(a.mvps || 0),
    presences: (a, b) => Number(b.presences || 0) - Number(a.presences || 0),
    absences: (a, b) => Number(b.absences || 0) - Number(a.absences || 0),
  };
  return list.sort((a, b) => sorters[mode](a, b) || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
}

function renderPlayers() {
  const sorted = filteredPlayers(players()).sort((a, b) => normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
  return `
    <section class="players-grid">
      ${sorted.length ? sorted.map((player) => `
        <button class="player-card player-trigger" data-player-id="${player.playerId}" type="button">
          <img class="avatar" src="${avatarFor(player)}" alt="${escapeHtml(player.displayName)}" loading="lazy" />
          <div class="name">${escapeHtml(player.displayName)}</div>
          <div class="meta"><span>${player.matchesPlayed} MJ</span><span>${player.points} pts</span></div>
        </button>
      `).join('') : `<section class="card center-card"><p>Aucun joueur trouvé.</p></section>`}
    </section>
  `;
}


function renderResults() {
  const allMatches = filteredMatches(completedMatches());
  const next = currentUpcomingInfo();
  const labels = { all: 'Tous', yellow: 'Victoires Jaune', draw: 'Nul', blue: 'Victoires Bleu' };
  return `
    <section class="card hero-card">
      <div class="hero-grid hero-center">
        <div>
          <div class="eyebrow">Prochain match</div>
          <div class="next-match-date">${next.dateLabel}</div>
          <div class="next-match-time">${next.time}</div>
        </div>
      </div>
    </section>
    <section class="card">
      <div class="card-head"><h2>Anciens matchs</h2></div>
      <div class="card-body header-stack">
        <div class="tab-row compact-tabs" data-preserve-scroll-key="results-filters">
          ${Object.entries(labels).map(([key, label]) => `<button class="tab-btn ${state.resultsFilter === key ? 'active' : ''}" data-results-filter="${key}">${label}</button>`).join('')}
        </div>
      </div>
      <div class="card-body match-list">
        ${allMatches.length ? allMatches.map(matchCard).join('') : '<div class="empty-state">Aucun match ne correspond à ce filtre.</div>'}
      </div>
    </section>
  `;
}

function renderModifyMatches() {
  const all = completedMatches();
  return `
    <section class="card">
      <div class="card-head"><h2>Modifier un match</h2></div>
      <div class="card-body match-list">
        ${all.length ? all.map((match) => `
          <button class="result-row" data-edit-match="${match.matchId}" type="button">
            <div class="result-date">${match.dateLabel}</div>
            <div class="result-score-layout">
              <span class="team-label yellow">JAUNE</span>
              <div class="result-score-box">
                <span class="score-value yellow">${match.yellowScore}</span>
                <span class="score-dash">—</span>
                <span class="score-value blue">${match.blueScore}</span>
              </div>
              <span class="team-label blue">BLEU</span>
            </div>
          </button>`).join('') : '<div class="empty-state">Aucun match terminé à modifier.</div>'}
      </div>
    </section>
  `;
}

function renderCompo() {
  const source = currentCompoSource();
  const modeLabel = state.compoMode === 'field' ? 'Vue sobre' : 'Vue terrain';
  if (!source) {
    return `
      <section class="card center-card">
        <h2>Compo indisponible</h2>
        <p>Aucune compo disponible pour le moment.</p>
      </section>
    `;
  }
  const yellowSource = source?.yellowSlots || source?.yellowLines || source?.teamYellowPlayerIds || [];
  const blueSource = source?.blueSlots || source?.blueLines || source?.teamBluePlayerIds || [];
  return `
    <section class="card">
      <div class="card-head compo-head">
        <div>
          <h2>Compo du match</h2>
          <div class="compo-date-sub">${source.dateLabel || currentUpcomingInfo().dateLabel}</div>
        </div>
        <div class="compo-head-actions">
          ${canShareCompo() ? shareButtonMarkup(`data-share-compo-source="${source.matchId ? `match:${source.matchId}` : 'draft'}"`, 'tab-btn icon-only-btn') : ''}
          <button class="tab-btn active compo-toggle-btn" data-compo-toggle="1">${modeLabel}</button>
        </div>
      </div>
      <div class="card-body compo-shell ${state.compoMode === 'field' ? 'mode-field' : 'mode-simple'} compo-dual-grid">
        <section class="team-box compo-team-card yellow-soft">
          ${renderTeamCompo(yellowSource, 'yellow', state.compoMode, false)}
        </section>
        <section class="team-box compo-team-card blue-soft">
          ${renderTeamCompo(blueSource, 'blue', state.compoMode, false)}
        </section>
      </div>
    </section>
  `;
}


function renderAdmin() {
  if (!isPresident()) {
    return `
      <section class="card center-card error-card">
        <h2>Accès réservé</h2>
        <p>Cette page est visible uniquement pour le profil président.</p>
      </section>
    `;
  }
  const config = state.root?.appConfig || {};
    const seasonsList = [...(state.root?.seasonIndex?.seasons || [])];
  const playerOptions = activePlayers().sort((a, b) => normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
  const archivedOptions = players().filter((player) => isPlayerArchived(player)).sort((a, b) => normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
  const selectedPlayer = playerOptions[0] || null;
  const selectedArchived = archivedOptions[0] || null;
  return `
    <section class="card">
      <div class="card-head"><h2>Administration</h2></div>
    </section>

    <section class="card admin-card">
      <div class="card-head"><h3>Export Excel</h3></div>
      <div class="card-body admin-actions-row wrap-actions">
        <button class="primary-btn" data-admin-export-data="1" type="button">Exporter Excel</button>
      </div>
    </section>

    <section class="card admin-card ballon-admin-card">
      <div class="card-head"><h3>Ballon d'Or</h3></div>
      <div class="card-body admin-actions-row wrap-actions">
        <button class="${isBallonOrActive() ? 'danger-btn' : 'primary-btn'}" data-admin-toggle-ballon="${isBallonOrActive() ? '0' : '1'}" type="button">${isBallonOrActive() ? 'Désactiver Ballon d’Or' : 'Activer Ballon d’Or'}</button>
        <button class="primary-btn" data-share-ballon-range="all" type="button">Partager global</button>
        <button class="primary-btn" data-share-ballon-vod="1" type="button">Partager VoD</button>
        <button class="primary-btn" data-share-ballon-cards="1" type="button">Ballon d'Or Card</button>
        <button class="primary-btn" data-share-fiche-cards="1" type="button">Fiche Card</button>
        <button class="secondary-btn" data-share-ballon-range="last11" type="button">Partager dernière → 11e</button>
        <button class="secondary-btn" data-share-ballon-range="ten4" type="button">Partager 10e → 4e</button>
        <button class="secondary-btn" data-share-ballon-range="podium" type="button">Partager podium</button>
      </div>
    </section>

    <section class="card admin-card">
      <div class="card-head"><h3>Codes d'accès</h3></div>
      <div class="card-body admin-grid-two">
        <label class="form-field"><span>Code entraîneur</span><input id="adminCoachCodeInput" type="text" value="${escapeHtml(String(config.coachCode || ''))}" /></label>
        <label class="form-field"><span>Code président</span><input id="adminPresidentCodeInput" type="text" value="${escapeHtml(String(config.presidentCode || config.adminCode || ''))}" /></label>
      </div>
      <div class="card-body admin-actions-row"><button class="primary-btn" data-admin-save-codes="1" type="button">Enregistrer les codes</button></div>
    </section>

    <section class="card admin-card">
      <div class="card-head"><h3>Ajouter un joueur</h3></div>
      <div class="card-body admin-grid-two">
        <label class="form-field"><span>Nom du joueur</span><input id="adminNewPlayerName" type="text" placeholder="Nom du joueur" /></label>
        <label class="form-field"><span>Poste principal</span><select id="adminNewPlayerPosition">${POSITION_OPTIONS.map((pos) => `<option value="${pos}" ${pos === 'MC' ? 'selected' : ''}>${pos}</option>`).join('')}</select></label>
        <label class="form-field"><span>Variante avatar</span><select id="adminNewPlayerVariant"><option value="1">Avatar_N1</option><option value="2">Avatar_N2</option></select></label>
        <label class="form-field switch-field"><span>Inscrit au classement</span><span class="switch-line"><input id="adminNewPlayerRegistered" type="checkbox" checked /><span class="switch-ui"></span><small>ON = permanent · OFF = match uniquement</small></span></label>
      </div>
      <div class="card-body admin-actions-row"><button class="primary-btn" data-admin-add-player="1" type="button">Ajouter le joueur</button></div>
    </section>

    <section class="card admin-card">
      <div class="card-head"><h3>Modifier / supprimer un joueur</h3></div>
      <div class="card-body admin-grid-two">
        <label class="form-field"><span>Joueur</span><select id="adminPlayerSelect">${playerOptions.map((player, index) => `<option value="${player.playerId}" ${index === 0 ? 'selected' : ''}>${escapeHtml(player.displayName)}</option>`).join('')}</select></label>
        <label class="form-field"><span>Nouveau nom</span><input id="adminPlayerNameEdit" type="text" value="${escapeHtml(selectedPlayer?.displayName || '')}" placeholder="Nom du joueur" /></label>
        <label class="form-field"><span>Variante avatar</span><select id="adminPlayerVariantEdit"><option value="1" ${selectedPlayer && avatarFamily(selectedPlayer) === '1' ? 'selected' : ''}>Avatar_N1</option><option value="2" ${selectedPlayer && avatarFamily(selectedPlayer) === '2' ? 'selected' : ''}>Avatar_N2</option></select></label>
      </div>
      <div class="card-body admin-actions-row">
        <button class="secondary-btn" data-admin-update-selected-player="1" type="button">Enregistrer</button>
        <button class="danger-btn" data-admin-delete-selected-player="1" type="button">Supprimer</button>
      </div>
    </section>

    <section class="card admin-card">
      <div class="card-head"><h3>Joueurs archivés</h3></div>
      ${archivedOptions.length ? `
        <div class="card-body admin-grid-two">
          <label class="form-field"><span>Joueur archivé</span><select id="adminArchivedPlayerSelect">${archivedOptions.map((player, index) => `<option value="${player.playerId}" ${index === 0 ? 'selected' : ''}>${escapeHtml(player.displayName)} · ${escapeHtml((getPlayerPositions(player)[0] || 'Joueur').toUpperCase())}</option>`).join('')}</select></label>
          <div class="form-field"><span>Statut</span><div class="muted">${escapeHtml(selectedArchived?.displayName || '')} · archivé</div></div>
        </div>
        <div class="card-body admin-actions-row">
          <button class="secondary-btn" data-admin-restore-selected-player="1" type="button">Récupérer</button>
          <button class="danger-btn" data-admin-hard-delete-selected-player="1" type="button">Supprimer définitivement</button>
        </div>
      ` : '<div class="card-body"><p class="muted">Aucun joueur archivé.</p></div>'}
    </section>


    <section class="card admin-card">
      <div class="card-head"><h3>Ajouter une saison</h3></div>
      <div class="card-body admin-grid-two">
        <label class="form-field"><span>Nom affiché</span><input id="adminNewSeasonDisplay" type="text" placeholder="Ex : 26/27" /></label>
        <label class="form-field"><span>Copier les joueurs de la saison active</span><select id="adminSeasonCopyPlayers"><option value="1">Oui</option><option value="0">Non</option></select></label>
      </div>
      <div class="card-body admin-actions-row"><button class="primary-btn" data-admin-add-season="1" type="button">Créer la saison</button><button class="secondary-btn" data-admin-close-season="1" type="button">Clôturer</button></div>
    </section>

    <section class="card admin-card">
      <div class="card-head"><h3>Saisons</h3></div>
      <div class="card-body admin-list">
        ${seasonsList.map((season) => `
          <div class="admin-season-row">
            <div>
              <strong>${escapeHtml(season.displayName)}</strong>
              <div class="muted">${season.id}${season.id === state.activeSeasonId ? ' · active' : ''}</div>
            </div>
            <div class="admin-player-actions">
              ${season.id === state.activeSeasonId ? '<span class="season-active-badge">Active</span>' : `<button class="secondary-btn" data-admin-activate-season="${season.id}" type="button">Activer</button>`}
              ${season.id === state.root?.seasonIndex?.activeSeasonId ? `<button class="secondary-btn" data-admin-close-season="1" type="button">Clôturer</button>` : ''}
              ${seasonsList.length > 1 ? `<button class="danger-btn" data-admin-delete-season="${season.id}" type="button">Supprimer</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

async function saveAdminCodes() {
  const coachCode = document.getElementById('adminCoachCodeInput')?.value?.trim() || '';
  const presidentCode = document.getElementById('adminPresidentCodeInput')?.value?.trim() || '';
  if (!coachCode || !presidentCode) {
    await showAppAlert('Renseigne les deux codes.', 'Codes d’accès');
    return;
  }
  await persistWholeRoot({
    ...state.root,
    appConfig: {
      ...(state.root?.appConfig || {}),
      coachCode,
      presidentCode,
    }
  });
}

async function addAdminPlayer() {
  const name = document.getElementById('adminNewPlayerName')?.value?.trim() || '';
  const variant = document.getElementById('adminNewPlayerVariant')?.value || '1';
  const mainPosition = document.getElementById('adminNewPlayerPosition')?.value || 'MC';
  const registered = document.getElementById('adminNewPlayerRegistered')?.checked !== false;
  if (!name) {
    await showAppAlert('Entre un nom de joueur.', 'Ajouter un joueur');
    return;
  }
  const newPlayer = {
    ...createDefaultPlayer(name, variant, [mainPosition]),
    excludedFromRanking: registered ? false : true,
    temporaryMatchOnly: registered ? false : true,
    createdAt: Date.now(),
  };
  if (players().some((player) => player.playerId === newPlayer.playerId)) {
    await showAppAlert('Un joueur avec ce nom existe déjà.', 'Ajouter un joueur');
    return;
  }
  const nextPlayers = [...players(), newPlayer].sort((a, b) => normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
  const season = seasonData();
  const nextSeason = {
    ...season,
    players: nextPlayers,
    draftMatch: season?.draftMatch ? (() => {
      const previousPresence = new Map((season.draftMatch.presences || []).map((row) => [row.playerId, presenceStatusFromRow(row, true)]));
      return {
        ...season.draftMatch,
        presences: activePlayers(nextPlayers).map((player) => createPresenceRow(player.playerId, previousPresence.get(player.playerId) || 'pending'))
      };
    })() : createEmptyDraftMatch(activePlayers(nextPlayers))
  };
  await persistWholeRoot({
    ...state.root,
    seasons: {
      ...state.root.seasons,
      [state.activeSeasonId]: nextSeason,
    }
  });
  await showAppAlert(`${name} a été ajouté.`, 'Joueur créé');
}

async function updateAdminSelectedPlayer() {
  const playerId = document.getElementById('adminPlayerSelect')?.value || '';
  if (!playerId) return;
  const nextName = document.getElementById('adminPlayerNameEdit')?.value?.trim() || '';
  const variant = document.getElementById('adminPlayerVariantEdit')?.value || '1';
  const nextPlayers = players().map((player) => player.playerId === playerId ? {
    ...player,
    displayName: nextName || player.displayName,
    avatarId: `Avatar_N${variant === '2' ? '2' : '1'}`,
  } : player);
  await persistWholeRoot({
    ...state.root,
    seasons: {
      ...state.root.seasons,
      [state.activeSeasonId]: {
        ...seasonData(),
        players: nextPlayers,
      }
    }
  });
}

async function deleteAdminPlayer(playerId) {
  if (!(await showAppConfirm('Retirer ce joueur des prochaines compos ? Ses anciens matchs et ses stats restent conservés.', 'Supprimer joueur', 'Supprimer', true))) return;
  const season = seasonData();
  const currentPlayers = players();
  const target = currentPlayers.find((player) => player.playerId === playerId);
  if (!target) return;

  const nextPlayers = currentPlayers.map((player) => player.playerId === playerId ? {
    ...player,
    archived: true,
    archivedAt: Date.now(),
  } : player);

  const stripId = (list = []) => list.filter((id) => id !== playerId);
  const stripPresence = (list = []) => list.filter((row) => row.playerId !== playerId);
  const stripSlots = (slots, lines, ids) => {
    const next = normalizeDetailedSlots(slots, lines, ids || []);
    Object.keys(next).forEach((key) => { if (next[key] === playerId) next[key] = ''; });
    return next;
  };
  const sanitizeEditableMatch = (match = {}) => ({
    ...match,
    presences: stripPresence(match.presences || []),
    teamYellowPlayerIds: stripId(match.teamYellowPlayerIds || []),
    teamBluePlayerIds: stripId(match.teamBluePlayerIds || []),
    yellowSlots: stripSlots(match.yellowSlots, match.yellowLines, match.teamYellowPlayerIds || []),
    blueSlots: stripSlots(match.blueSlots, match.blueLines, match.teamBluePlayerIds || []),
  });

  const nextDraft = sanitizeEditableMatch(season?.draftMatch || createEmptyDraftMatch(activePlayers(nextPlayers)));
  const nextMatches = Array.isArray(season?.matches) ? season.matches.map((match) => {
    if (match.statsApplied === true || (typeof match.yellowScore === 'number' && typeof match.blueScore === 'number' && match.closedAt)) return match;
    if (upcomingMatchFromSeason()?.matchId && match.matchId !== upcomingMatchFromSeason().matchId) return match;
    return sanitizeEditableMatch(match);
  }) : [];

  await persistWholeRoot({
    ...state.root,
    seasons: {
      ...state.root.seasons,
      [state.activeSeasonId]: {
        ...season,
        players: nextPlayers,
        draftMatch: nextDraft,
        matches: nextMatches,
      }
    }
  });
}

async function restoreArchivedPlayer(playerId) {
  const season = seasonData();
  const currentPlayers = players();
  const target = currentPlayers.find((player) => player.playerId === playerId && isPlayerArchived(player));
  if (!target) return;
  const nextPlayers = currentPlayers.map((player) => {
    if (player.playerId !== playerId) return player;
    const restored = { ...player, archived: false };
    delete restored.archivedAt;
    delete restored.deletedAt;
    return restored;
  });
  const draft = season?.draftMatch || createEmptyDraftMatch(activePlayers(nextPlayers));
  const presenceById = new Map((draft.presences || []).map((row) => [row.playerId, presenceStatusFromRow(row, true)]));
  if (!presenceById.has(playerId)) presenceById.set(playerId, 'pending');
  const nextDraft = {
    ...draft,
    presences: activePlayers(nextPlayers).map((player) => createPresenceRow(player.playerId, presenceById.get(player.playerId) || 'pending')),
  };
  await persistWholeRoot({
    ...state.root,
    seasons: {
      ...state.root.seasons,
      [state.activeSeasonId]: {
        ...season,
        players: nextPlayers,
        draftMatch: nextDraft,
      }
    }
  });
}

async function hardDeleteArchivedPlayer(playerId) {
  const season = seasonData();
  const target = players().find((player) => player.playerId === playerId && isPlayerArchived(player));
  if (!target) return;
  if (!(await showAppConfirm(`Supprimer définitivement ${target.displayName} de la liste des joueurs ? Les anciens matchs et stats déjà passés restent conservés.`, 'Suppression définitive', 'Continuer', true))) return;
  if (!(await showAppConfirm('Confirmation finale : le joueur disparaîtra de la liste active/archivée, mais ses anciens matchs ne seront pas effacés.', 'Confirmation finale', 'Supprimer définitivement', true))) return;

  const stripId = (list = []) => list.filter((id) => id !== playerId);
  const stripRows = (list = []) => list.filter((row) => row.playerId !== playerId);
  const stripGoals = (list = []) => (list || []).filter((goal) => goal.scorerPlayerId !== playerId && goal.assistPlayerId !== playerId);
  const stripSlots = (slots, lines, ids) => {
    const next = normalizeDetailedSlots(slots, lines, ids || []);
    Object.keys(next).forEach((key) => { if (next[key] === playerId) next[key] = ''; });
    return next;
  };
  const sanitizeFutureMatch = (match = {}) => ({
    ...match,
    presences: stripRows(match.presences || []),
    contributions: stripRows(match.contributions || []),
    teamYellowPlayerIds: stripId(match.teamYellowPlayerIds || []),
    teamBluePlayerIds: stripId(match.teamBluePlayerIds || []),
    yellowSlots: stripSlots(match.yellowSlots, match.yellowLines, match.teamYellowPlayerIds || []),
    blueSlots: stripSlots(match.blueSlots, match.blueLines, match.teamBluePlayerIds || []),
    yellowGoals: stripGoals(match.yellowGoals || []),
    blueGoals: stripGoals(match.blueGoals || []),
    yellowMvpPlayerId: match.yellowMvpPlayerId === playerId ? '' : match.yellowMvpPlayerId,
    blueMvpPlayerId: match.blueMvpPlayerId === playerId ? '' : match.blueMvpPlayerId,
  });
  const isCompletedMatch = (match = {}) => match.statsApplied === true || (typeof match.yellowScore === 'number' && typeof match.blueScore === 'number' && !!match.closedAt);
  const nextPlayers = players().filter((player) => player.playerId !== playerId);
  await persistWholeRoot({
    ...state.root,
    seasons: {
      ...state.root.seasons,
      [state.activeSeasonId]: {
        ...season,
        players: nextPlayers,
        draftMatch: sanitizeFutureMatch(season?.draftMatch || createEmptyDraftMatch(activePlayers(nextPlayers))),
        matches: Array.isArray(season?.matches) ? season.matches.map((match) => isCompletedMatch(match) ? match : sanitizeFutureMatch(match)) : [],
      }
    }
  });
}


async function publishAdminEleven() {
  ensureAdminElevenState();
  const slots = normalizeDetailedSlots(state.adminElevenSlots);
  const benchPlayerIds = [...new Set((state.adminElevenBenchIds || []).filter(Boolean))];
  await persistWholeRoot({
    ...state.root,
    seasons: {
      ...state.root.seasons,
      [state.activeSeasonId]: {
        ...seasonData(),
        publishedEleven: {
          slots,
          benchPlayerIds,
          sourceTop16PlayerIds: [],
          publishedAt: Date.now(),
        }
      }
    }
  });
}

async function deletePublishedEleven() {
  const season = { ...(seasonData() || {}) };
  delete season.publishedEleven;
  await persistWholeRoot({
    ...state.root,
    seasons: {
      ...state.root.seasons,
      [state.activeSeasonId]: season,
    }
  });
}

async function addAdminTrophy() {
  const trophyType = document.getElementById('trophyTypeInput')?.value || 'champion';
  const winnerPlayerId = document.getElementById('adminTrophyWinnerSelect')?.value || document.getElementById('trophyWinnerSelect')?.value || '';
  if (!winnerPlayerId) {
    await showAppAlert('Choisis le gagnant du trophée.', 'Trophée');
    return;
  }
  const titleMap = { champion: 'Champion', scorer: 'Golden Boot', playmaker: 'Playmaker', mvp: 'MVP' };
  const title = titleMap[trophyType] || trophyType;
  const nextItems = [...(state.root?.trophyRoom?.items || []), {
    id: `trophy_${Date.now()}`,
    type: trophyType,
    title,
    winnerPlayerId,
    seasonId: state.activeSeasonId,
    createdAt: Date.now(),
  }];
  await persistWholeRoot({
    ...state.root,
    trophyRoom: {
      ...(state.root?.trophyRoom || {}),
      items: nextItems,
    }
  });
}

async function addAdminSeason() {
  const displayName = document.getElementById('adminNewSeasonDisplay')?.value?.trim() || '';
  const copyPlayers = document.getElementById('adminSeasonCopyPlayers')?.value !== '0';
  if (!displayName) {
    await showAppAlert('Entre un nom de saison.', 'Ajouter une saison');
    return;
  }
  const seasonId = seasonDisplayToId(displayName);
  if (!seasonId) {
    await showAppAlert('Nom de saison invalide.', 'Ajouter une saison');
    return;
  }
  if (state.root?.seasons?.[seasonId]) {
    await showAppAlert('Cette saison existe déjà.', 'Ajouter une saison');
    return;
  }
  const sourcePlayers = copyPlayers ? rankingPlayers().map((player) => ({ ...emptyPlayerSeason(player), archived: false, archivedAt: null })) : [];
  const seasonTemplate = createSeasonTemplate(seasonId, displayName, sourcePlayers);
  await persistWholeRoot({
    ...state.root,
    seasons: {
      ...state.root.seasons,
      [seasonId]: seasonTemplate,
    },
    seasonIndex: {
      ...(state.root?.seasonIndex || {}),
      activeSeasonId: state.root?.seasonIndex?.activeSeasonId || seasonId,
      seasons: [...(state.root?.seasonIndex?.seasons || []), { id: seasonId, displayName, resourceName: seasonId }]
    }
  });
}

async function activateAdminSeason(seasonId) {
  state.activeSeasonId = seasonId;
  await persistWholeRoot({
    ...state.root,
    seasonIndex: {
      ...(state.root?.seasonIndex || {}),
      activeSeasonId: seasonId,
      seasons: [...(state.root?.seasonIndex?.seasons || [])]
    }
  });
}

async function deleteAdminSeason(seasonId) {
  if (!(state.root?.seasonIndex?.seasons || []).some((season) => season.id === seasonId)) return;
  if (!(await showAppConfirm('Supprimer cette saison ?', 'Supprimer saison', 'Supprimer', true))) return;
  const seasonsMap = { ...(state.root?.seasons || {}) };
  delete seasonsMap[seasonId];
  const nextSeasonList = (state.root?.seasonIndex?.seasons || []).filter((season) => season.id !== seasonId);
  const nextActive = state.activeSeasonId === seasonId ? (nextSeasonList[0]?.id || '') : state.activeSeasonId;
  state.activeSeasonId = nextActive;
  await persistWholeRoot({
    ...state.root,
    seasons: seasonsMap,
    seasonIndex: {
      ...(state.root?.seasonIndex || {}),
      activeSeasonId: nextActive,
      seasons: nextSeasonList,
    }
  });
}


function nextSeasonDisplayName(displayName = currentSeasonDisplay()) {
  const match = String(displayName || '').match(/(\d{2})\/(\d{2})/);
  if (!match) return '';
  const start = Number(match[1]);
  const end = Number(match[2]);
  return `${String((start + 1) % 100).padStart(2, '0')}/${String((end + 1) % 100).padStart(2, '0')}`;
}

async function closeActiveSeasonAndCreateNext() {
  const currentId = state.root?.seasonIndex?.activeSeasonId || state.activeSeasonId;
  const current = state.root?.seasons?.[currentId];
  if (!current) return;
  const nextDisplay = nextSeasonDisplayName(current.displayName || currentSeasonDisplay());
  if (!nextDisplay) {
    await showAppAlert('Impossible de calculer la prochaine saison.', 'Clôturer la saison');
    return;
  }
  const nextId = seasonDisplayToId(nextDisplay);
  if (state.root?.seasons?.[nextId]) {
    state.activeSeasonId = nextId;
    await persistWholeRoot({
      ...state.root,
      seasonIndex: {
        ...(state.root?.seasonIndex || {}),
        activeSeasonId: nextId,
        seasons: [...(state.root?.seasonIndex?.seasons || [])]
      },
      seasons: {
        ...state.root.seasons,
        [currentId]: { ...current, closedAt: Date.now() }
      }
    });
    return;
  }
  const sourcePlayers = rankingPlayers().map((player) => ({ ...emptyPlayerSeason(player), preferredPositions: [...getPlayerPositions(player)], avatarId: player.avatarId, displayName: player.displayName, playerId: player.playerId, archived: false, archivedAt: null }));
  const seasonTemplate = createSeasonTemplate(nextId, nextDisplay, sourcePlayers);
  state.activeSeasonId = nextId;
  await persistWholeRoot({
    ...state.root,
    seasonIndex: {
      ...(state.root?.seasonIndex || {}),
      activeSeasonId: nextId,
      seasons: [...(state.root?.seasonIndex?.seasons || []), { id: nextId, displayName: nextDisplay, resourceName: nextId }]
    },
    seasons: {
      ...state.root.seasons,
      [currentId]: { ...current, closedAt: Date.now() },
      [nextId]: seasonTemplate,
    }
  });
}

async function toggleAdminTrophies() {
  const enabled = !(state.root?.appConfig?.trophyRoomEnabled);
  await persistWholeRoot({
    ...state.root,
    appConfig: {
      ...(state.root?.appConfig || {}),
      trophyRoomEnabled: enabled,
    }
  });
}

function attachAdminInteractions() {
  const playerSelect = document.getElementById('adminPlayerSelect');
  const playerNameInput = document.getElementById('adminPlayerNameEdit');
  const playerVariantSelect = document.getElementById('adminPlayerVariantEdit');
  if (playerSelect && playerNameInput && playerVariantSelect) {
    playerSelect.addEventListener('change', () => {
      const player = playerById(playerSelect.value);
      if (!player) return;
      playerNameInput.value = player.displayName || '';
      playerVariantSelect.value = avatarFamily(player) === '2' ? '2' : '1';
    });
  }
  els.viewMount.querySelectorAll('[data-admin-save-codes]').forEach((btn) => btn.addEventListener('click', async () => { await saveAdminCodes(); renderCurrentView(); }));
  els.viewMount.querySelectorAll('[data-admin-export-data]').forEach((btn) => btn.addEventListener('click', async () => { await exportAdminData(); }));
  els.viewMount.querySelectorAll('[data-admin-toggle-ballon]').forEach((btn) => btn.addEventListener('click', async () => { await setBallonOrActive(btn.dataset.adminToggleBallon === '1'); renderCurrentView(); }));
  els.viewMount.querySelectorAll('[data-share-ballon-range]').forEach((btn) => btn.addEventListener('click', async () => { await shareBallonOrRanking(btn.dataset.shareBallonRange); }));
  els.viewMount.querySelectorAll('[data-share-ballon-vod]').forEach((btn) => btn.addEventListener('click', async () => { await shareBallonOrVod(); }));
  els.viewMount.querySelectorAll('[data-share-ballon-cards]').forEach((btn) => btn.addEventListener('click', async () => { await shareBallonOrCards(); }));
  els.viewMount.querySelectorAll('[data-share-fiche-cards]').forEach((btn) => btn.addEventListener('click', async () => { await shareAllPlayerCards(); }));
  els.viewMount.querySelectorAll('[data-admin-add-player]').forEach((btn) => btn.addEventListener('click', async () => { await addAdminPlayer(); renderCurrentView(); }));
  els.viewMount.querySelectorAll('[data-admin-update-selected-player]').forEach((btn) => btn.addEventListener('click', async () => { await updateAdminSelectedPlayer(); renderCurrentView(); }));
  els.viewMount.querySelectorAll('[data-admin-delete-selected-player]').forEach((btn) => btn.addEventListener('click', async () => {
    const playerId = document.getElementById('adminPlayerSelect')?.value || '';
    if (!playerId) return;
    await deleteAdminPlayer(playerId);
    renderCurrentView();
  }));
  els.viewMount.querySelectorAll('[data-admin-restore-selected-player]').forEach((btn) => btn.addEventListener('click', async () => {
    const playerId = document.getElementById('adminArchivedPlayerSelect')?.value || '';
    if (!playerId) return;
    await restoreArchivedPlayer(playerId);
    renderCurrentView();
  }));
  els.viewMount.querySelectorAll('[data-admin-hard-delete-selected-player]').forEach((btn) => btn.addEventListener('click', async () => {
    const playerId = document.getElementById('adminArchivedPlayerSelect')?.value || '';
    if (!playerId) return;
    await hardDeleteArchivedPlayer(playerId);
    renderCurrentView();
  }));
  els.viewMount.querySelectorAll('[data-admin-add-season]').forEach((btn) => btn.addEventListener('click', async () => { await addAdminSeason(); renderCurrentView(); }));
  els.viewMount.querySelectorAll('[data-admin-close-season]').forEach((btn) => btn.addEventListener('click', async () => { await closeActiveSeasonAndCreateNext(); renderCurrentView(); }));
  els.viewMount.querySelectorAll('[data-admin-activate-season]').forEach((btn) => btn.addEventListener('click', async () => { await activateAdminSeason(btn.dataset.adminActivateSeason); resetAdminElevenState(); renderCurrentView(); }));
  els.viewMount.querySelectorAll('[data-admin-delete-season]').forEach((btn) => btn.addEventListener('click', async () => { await deleteAdminSeason(btn.dataset.adminDeleteSeason); resetAdminElevenState(); renderCurrentView(); }));
}


function openElevenAssignDialog(playerId) {
  const player = playerById(playerId);
  if (!player) return;
  els.featureDialogTitle.textContent = `Ajouter ${player.displayName}`;
  els.featureDialogBody.innerHTML = `
    <section class="card">
      <div class="card-body eleven-assign-popup">
        <div class="player-mini popup-player-mini">
          <img class="avatar" src="${avatarFor(player)}" alt="${escapeHtml(player.displayName)}" />
          <div>
            <div class="name">${escapeHtml(player.displayName)}</div>
            <div class="stat">${escapeHtml(positionsText(player))}</div>
          </div>
        </div>
        <div class="eleven-position-popup-grid">
          ${COMPO_POSITION_OPTIONS.map((position) => `
            <button class="tab-btn" data-eleven-popup-position="${position}" data-player-id="${player.playerId}" type="button">${compoPositionLabel(position)}</button>
          `).join('')}
          <button class="tab-btn active" data-eleven-popup-bench="1" data-player-id="${player.playerId}" type="button">Rempl</button>
        </div>
      </div>
    </section>
  `;
  els.featureDialogBody.querySelectorAll('[data-eleven-popup-position]').forEach((btn) => btn.addEventListener('click', () => {
    placeElevenPlayer(btn.dataset.playerId, btn.dataset.elevenPopupPosition);
    els.featureDialog.close();
  }));
  els.featureDialogBody.querySelectorAll('[data-eleven-popup-bench]').forEach((btn) => btn.addEventListener('click', () => {
    benchElevenPlayer(btn.dataset.playerId);
    els.featureDialog.close();
  }));
  els.featureDialog.showModal();
}

function placeElevenPlayer(playerId, position) {
  ensureAdminElevenState();
  state.adminElevenBenchIds = (state.adminElevenBenchIds || []).filter((id) => id !== playerId);
  Object.keys(state.adminElevenSlots).forEach((key) => { if (state.adminElevenSlots[key] === playerId) state.adminElevenSlots[key] = ''; });
  state.adminElevenSlots[position] = playerId;
  rerenderPreservePageScroll();
}

function benchElevenPlayer(playerId) {
  ensureAdminElevenState();
  Object.keys(state.adminElevenSlots).forEach((key) => { if (state.adminElevenSlots[key] === playerId) state.adminElevenSlots[key] = ''; });
  if (!state.adminElevenBenchIds.includes(playerId)) state.adminElevenBenchIds.push(playerId);
  rerenderPreservePageScroll();
}


function applyAutoElevenProposal() {
  const slots = buildElevenOfSeason();
  if (!slots) return;
  state.adminElevenSlots = normalizeDetailedSlots(slots);
  const assigned = new Set(flattenDetailedSlots(state.adminElevenSlots));
  state.adminElevenBenchIds = topSixteenPlayers()
    .map((player) => player.playerId)
    .filter((id) => !assigned.has(id))
    .slice(0, 5);
  rerenderPreservePageScroll();
}


function attachElevenManagerInteractions() {
  els.viewMount.querySelectorAll('[data-eleven-open-assign]').forEach((btn) => btn.addEventListener('click', () => {
    openElevenAssignDialog(btn.dataset.elevenOpenAssign);
  }));
  els.viewMount.querySelectorAll('.admin-eleven-board [data-unassign-player]').forEach((btn) => btn.addEventListener('click', () => {
    ensureAdminElevenState();
    Object.keys(state.adminElevenSlots).forEach((key) => { if (state.adminElevenSlots[key] === btn.dataset.unassignPlayer) state.adminElevenSlots[key] = ''; });
    rerenderPreservePageScroll();
  }));
  els.viewMount.querySelectorAll('[data-eleven-unbench]').forEach((btn) => btn.addEventListener('click', () => {
    ensureAdminElevenState();
    state.adminElevenBenchIds = (state.adminElevenBenchIds || []).filter((id) => id !== btn.dataset.elevenUnbench);
    rerenderPreservePageScroll();
  }));
  els.viewMount.querySelectorAll('[data-eleven-reset]').forEach((btn) => btn.addEventListener('click', () => { resetAdminElevenState(false); rerenderPreservePageScroll(); }));
  els.viewMount.querySelectorAll('[data-eleven-auto]').forEach((btn) => btn.addEventListener('click', () => applyAutoElevenProposal()));
  els.viewMount.querySelectorAll('[data-eleven-publish]').forEach((btn) => btn.addEventListener('click', async () => { await publishAdminEleven(); renderCurrentView(); }));
  els.viewMount.querySelectorAll('[data-eleven-delete]').forEach((btn) => btn.addEventListener('click', async () => { await deletePublishedEleven(); resetAdminElevenState(false); renderCurrentView(); }));
  els.viewMount.querySelectorAll('[data-eleven-share]').forEach((btn) => btn.addEventListener('click', async () => { await shareCompoFromSource('eleven_editor'); }));
}

function renderCompleteMatch() {
  const target = currentEditableMatch();
  const presentCount = presentPlayerIdsFromDraft().length;
  const canScore = isPresident();
  const title = state.editingMatchId ? `Modifier match · ${target?.dateLabel || ''}` : 'Compléter match';
  return `
    <section class="card hero-card">
      <div class="hero-grid hero-center">
        <div>
          <div class="eyebrow">${title}</div>
          <div class="next-match-date">${target?.dateLabel || currentUpcomingInfo().dateLabel}</div>
          <div class="next-match-time">${target?.time || currentUpcomingInfo().time}</div>
        </div>
        <div class="coach-home-actions"><button class="secondary-btn" data-view-switch="home" type="button">Retour</button></div>
      </div>
    </section>
    <section class="card">
      <div class="card-body coach-entry-grid">
        <button class="coach-entry-btn ${state.completeMatchStep === 'presence' ? 'active' : ''}" data-complete-step="presence" type="button">Présence</button>
        <button class="coach-entry-btn ${state.completeMatchStep === 'compo' ? 'active' : ''}" data-complete-step="compo" type="button" ${presentCount ? '' : 'disabled'}>Faire compo</button>
        ${canScore ? `<button class="coach-entry-btn ${state.completeMatchStep === 'score' ? 'active' : ''}" data-complete-step="score" type="button" ${(target?.teamYellowPlayerIds?.length || target?.teamBluePlayerIds?.length || state.coachYellowEdits?.length || state.coachBlueEdits?.length) ? '' : 'disabled'}>Score</button>` : ''}
      </div>
    </section>
    ${state.completeMatchStep === 'presence' ? renderPresenceEditor(target) : state.completeMatchStep === 'compo' ? renderCompoEditor(target) : renderScoreEditor(target)}
  `;
}

function renderPresenceEditor(target) {
  const map = draftPresenceMap();
  const list = playersInMatch(target).sort((a, b) => normalizeString(a.displayName).localeCompare(normalizeString(b.displayName)));
  const presentCount = [...map.values()].filter((status) => status === 'present').length;
  return `
    <section class="card">
      <div class="card-head"><h2>Total présents : ${presentCount}</h2></div>
      <div class="card-body coach-presence-list">
        ${list.map((player) => {
          const status = map.get(player.playerId) || 'pending';
          return `
            <div class="presence-row">
              <img class="presence-avatar" src="${avatarFor(player)}" alt="${escapeHtml(player.displayName)}" />
              <div class="presence-name">${escapeHtml(player.displayName)}</div>
              <button class="presence-toggle ${status}" data-toggle-presence="${player.playerId}" type="button">${presenceStatusLabel(status)}</button>
            </div>
          `;
        }).join('')}
      </div>
      <div class="card-body coach-save-row">
        <button class="primary-btn" data-save-presence="1" type="button">${state.coachSaving ? 'Enregistrement...' : 'Enregistrer'}</button>
      </div>
    </section>
  `;
}

function renderAvailablePlayerTile(playerId) {
  const player = playerById(playerId);
  if (!player) return '';
  const lane = state.coachSelectedLane || 'GB';
  const yellowDisabled = !canAssignToTeam(state.coachYellowLines, lane);
  const blueDisabled = !canAssignToTeam(state.coachBlueLines, lane);
  return `
    <div class="available-row">
      <img class="presence-avatar" src="${avatarFor(player)}" alt="${escapeHtml(player.displayName)}" />
      <div class="presence-name">${escapeHtml(player.displayName)}</div>
      <div class="assign-buttons">
        <button class="assign-btn yellow" data-assign-team="yellow" data-player-id="${playerId}" type="button" ${yellowDisabled ? 'disabled' : ''}>Jaune</button>
        <button class="assign-btn blue" data-assign-team="blue" data-player-id="${playerId}" type="button" ${blueDisabled ? 'disabled' : ''}>Bleu</button>
      </div>
    </div>
  `;
}

function renderLaneCount(lines, lane, teamColor) {
  return `<span class="lane-count ${teamColor}">${laneLabel(lane)} ${teamLineCount(lines, lane)}/${laneQuota(lane)}</span>`;
}

function renderCompoEditor(target) {
  const presentIds = presentPlayerIdsFromDraft();
  ensureCoachEditors();
  const yellowSlots = state.coachYellowSlots;
  const blueSlots = state.coachBlueSlots;
  const selectedPosition = state.coachSelectedLane || 'GB';
  const assigned = new Set([...flattenDetailedSlots(yellowSlots), ...flattenDetailedSlots(blueSlots)]);
  const available = presentIds
    .filter((id) => !assigned.has(id))
    .map((id) => playerById(id))
    .filter(Boolean)
    .sort((a, b) => {
      const pa = slotPriorityForPlayer(a, selectedPosition);
      const pb = slotPriorityForPlayer(b, selectedPosition);
      return pa - pb || normalizeString(a.displayName).localeCompare(normalizeString(b.displayName));
    });
  const yellowOccupant = playerDisplayName(yellowSlots[selectedPosition]);
  const blueOccupant = playerDisplayName(blueSlots[selectedPosition]);
  return `
    <section class="card">
      <div class="card-head compo-head">
        <div>
          <h2>Faire compo</h2>
          <div class="compo-date-sub">${target?.dateLabel || currentUpcomingInfo().dateLabel}</div>
        </div>
        <button class="tab-btn icon-with-label" data-open-model-info="1" type="button">ℹ︎ <span>Modèle</span></button>
      </div>
      <div class="card-body coach-position-toolbar" data-preserve-scroll-key="compo-position-toolbar">
        ${COMPO_POSITION_OPTIONS.map((position) => `<button class="tab-btn ${selectedPosition === position ? 'active' : ''}" data-select-slot="${position}" type="button">${compoPositionLabel(position)}</button>`).join('')}
      </div>
      <div class="card-body slot-occupancy-row">
        <div class="slot-occupancy yellow-soft"><strong>Jaune</strong><span>${escapeHtml(yellowOccupant || 'Libre')}</span></div>
        <div class="slot-occupancy blue-soft"><strong>Bleu</strong><span>${escapeHtml(blueOccupant || 'Libre')}</span></div>
      </div>
      <div class="card-body available-list vertical-scroll" data-preserve-scroll-key="compo-players-list">
        ${available.length ? available.map((player) => {
          const priority = slotPriorityForPlayer(player, selectedPosition);
          const priorityLabel = priority === 0 ? 'Poste principal' : priority === 1 ? 'Poste secondaire' : 'Autre poste';
          return `
            <div class="available-row priority-${priority}">
              <img class="presence-avatar" src="${avatarFor(player)}" alt="${escapeHtml(player.displayName)}" />
              <div>
                <div class="presence-name">${escapeHtml(player.displayName)}</div>
                <div class="positions-order-text">${escapeHtml(positionsText(player))}</div>
                <div class="position-priority-badge">${priorityLabel}</div>
              </div>
              <div class="assign-buttons">
                <button class="assign-btn yellow" data-assign-slot-team="yellow" data-player-id="${player.playerId}" type="button">Jaune</button>
                <button class="assign-btn blue" data-assign-slot-team="blue" data-player-id="${player.playerId}" type="button">Bleu</button>
              </div>
            </div>
          `;
        }).join('') : '<div class="empty-state">Aucun joueur disponible.</div>'}
      </div>
    </section>
    <section class="card">
      <div class="card-head compo-head">
        <div>
          <h2>Compo du match</h2>
          <div class="compo-date-sub">${target?.dateLabel || currentUpcomingInfo().dateLabel}</div>
        </div>
        <div class="compo-head-actions">
          ${canShareCompo() ? shareButtonMarkup(`data-share-compo-source="${target?.matchId ? `match:${target.matchId}` : 'draft'}"`, 'tab-btn icon-only-btn') : ''}
        </div>
      </div>
      <div class="card-body compo-shell mode-field coach-compo-editor compo-dual-grid">
        <section class="team-box compo-team-card yellow-soft">
          <div class="coach-team-board">${renderDetailedPitchBoard(yellowSlots, 'yellow')}</div>
        </section>
        <section class="team-box compo-team-card blue-soft">
          <div class="coach-team-board">${renderDetailedPitchBoard(blueSlots, 'blue')}</div>
        </section>
      </div>
      <div class="card-body coach-save-row">
        <button class="secondary-btn" data-reset-compo="1" type="button">Réinitialiser</button>
        <button class="primary-btn" data-save-compo="1" type="button">${state.coachSaving ? 'Enregistrement...' : 'Enregistrer'}</button>
      </div>
    </section>
  `;
}

function initializeScoreEditors(match) {
  if (!match) return;
  if (!state.scoreYellowGoals) {
    state.scoreYellowGoals = {};
    (match.yellowGoals || []).forEach((goal) => { state.scoreYellowGoals[goal.scorerPlayerId] = (state.scoreYellowGoals[goal.scorerPlayerId] || 0) + 1; });
  }
  if (!state.scoreYellowAssists) {
    state.scoreYellowAssists = {};
    (match.yellowGoals || []).forEach((goal) => { if (goal.assistPlayerId) state.scoreYellowAssists[goal.assistPlayerId] = (state.scoreYellowAssists[goal.assistPlayerId] || 0) + 1; });
  }
  if (!state.scoreBlueGoals) {
    state.scoreBlueGoals = {};
    (match.blueGoals || []).forEach((goal) => { state.scoreBlueGoals[goal.scorerPlayerId] = (state.scoreBlueGoals[goal.scorerPlayerId] || 0) + 1; });
  }
  if (!state.scoreBlueAssists) {
    state.scoreBlueAssists = {};
    (match.blueGoals || []).forEach((goal) => { if (goal.assistPlayerId) state.scoreBlueAssists[goal.assistPlayerId] = (state.scoreBlueAssists[goal.assistPlayerId] || 0) + 1; });
  }
  if (!state.scoreYellowMvpId) state.scoreYellowMvpId = match.yellowMvpPlayerId || '';
  if (!state.scoreBlueMvpId) state.scoreBlueMvpId = match.blueMvpPlayerId || '';
}

function scoreBlockPlayerIds(team) {
  const target = currentEditableMatch() || currentDraft();
  const primary = team === 'yellow' ? (target.teamYellowPlayerIds || []) : (target.teamBluePlayerIds || []);
  const secondary = team === 'yellow' ? (target.teamBluePlayerIds || []) : (target.teamYellowPlayerIds || []);
  const seen = new Set();
  return [...primary, ...secondary].filter((id) => {
    if (!id || seen.has(id)) return false;
    seen.add(id); return true;
  });
}

function playerBaseTeamColor(playerId, target) {
  if ((target.teamYellowPlayerIds || []).includes(playerId)) return 'yellow';
  if ((target.teamBluePlayerIds || []).includes(playerId)) return 'blue';
  return 'red';
}

function goalsCountFor(team, playerId) { return Number((team === 'yellow' ? state.scoreYellowGoals : state.scoreBlueGoals)?.[playerId] || 0); }
function assistsCountFor(team, playerId) { return Number((team === 'yellow' ? state.scoreYellowAssists : state.scoreBlueAssists)?.[playerId] || 0); }
function totalGoalsForTeam(team) { return scoreBlockPlayerIds(team).reduce((n,id)=>n+goalsCountFor(team,id),0); }

function scoreEditorColumn(team, target) {
  const ids = scoreBlockPlayerIds(team);
  const mainIds = team === 'yellow' ? (target.teamYellowPlayerIds || []) : (target.teamBluePlayerIds || []);
  const secondIds = ids.filter((id) => !mainIds.includes(id));
  const renderRow = (playerId) => {
    const player = playerById(playerId); if (!player) return '';
    const baseColor = playerBaseTeamColor(playerId, target);
    const goals = goalsCountFor(team, playerId);
    const assists = assistsCountFor(team, playerId);
    return `<div class="score-row-player" data-score-anchor="${team}:${playerId}"><img class="presence-avatar" src="${avatarFor(player, baseColor)}" alt="${escapeHtml(player.displayName)}" /><div class="score-player-main"><div class="presence-name">${escapeHtml(player.displayName)}</div><div class="score-actions-stack"><div class="score-adjust goals" data-label="Buts"><button class="mini-btn" data-score-op="minus-goal" data-score-team="${team}" data-player-id="${playerId}" type="button">−</button><span class="score-count">${goals}</span><button class="mini-btn" data-score-op="plus-goal" data-score-team="${team}" data-player-id="${playerId}" type="button">+</button></div><div class="score-adjust assists" data-label="Passes"><button class="mini-btn" data-score-op="minus-assist" data-score-team="${team}" data-player-id="${playerId}" type="button">−</button><span class="score-count">${assists}</span><button class="mini-btn" data-score-op="plus-assist" data-score-team="${team}" data-player-id="${playerId}" type="button">+</button></div></div></div></div>`;
  };
  const mvpId = team === 'yellow' ? state.scoreYellowMvpId : state.scoreBlueMvpId;
  return `
    <section class="card detail-team-card ${team === 'yellow' ? 'yellow-soft' : 'blue-soft'} score-team-card">
      <div class="card-head"><h3 class="${team === 'yellow' ? 'yellow' : 'blue'}">${team === 'yellow' ? 'Équipe jaune' : 'Équipe bleue'}</h3></div>
      <div class="card-body score-table-head score-table-head-new"><span>Joueurs</span><span class="score-head-stack score-head-stack-double"><span><strong>Buts</strong><small>− / +</small></span><span><strong>Passes</strong><small>− / +</small></span></span></div>
      <div class="card-body score-player-list" data-preserve-scroll-key="score-list-${team}">${mainIds.map(renderRow).join('')}${secondIds.length ? `<div class="score-subtitle">Joueurs adverses</div>${secondIds.map(renderRow).join('')}` : ''}</div>
      <div class="card-body score-mvp-box">
        <div class="score-mvp-title">MVP ${team === 'yellow' ? 'jaune' : 'bleu'}</div>
        <div class="score-mvp-chips">${mainIds.map((id) => `<button class="tab-btn ${mvpId === id ? 'active' : ''}" data-select-mvp="${team}:${id}" type="button">${escapeHtml(playerDisplayName(id))}</button>`).join('')}</div>
      </div>
    </section>
  `;
}

function buildGoalsArrayFromCounts(goalMap = {}, assistMap = {}) {
  const goals = [];
  const scorers = Object.entries(goalMap).flatMap(([playerId, count]) => Array.from({ length: Number(count || 0) }, () => ({ scorerPlayerId: playerId, assistPlayerId: '' })));
  const assists = Object.entries(assistMap).flatMap(([playerId, count]) => Array.from({ length: Number(count || 0) }, () => playerId));
  scorers.forEach((goal, index) => { goal.assistPlayerId = assists[index] || ''; goals.push(goal); });
  return goals;
}

function renderScoreEditor(target) {
  initializeScoreEditors(target);
  const yellowScore = totalGoalsForTeam('yellow');
  const blueScore = totalGoalsForTeam('blue');
  return `
    <section class="card hero-card score-top-card">
      <div class="hero-grid hero-center score-hero-grid">
        <button class="secondary-btn" data-petit-terrain="1" type="button">Petit terrain</button>
        <div class="score-big-board"><span class="yellow">${yellowScore}</span><span>—</span><span class="blue">${blueScore}</span></div>
        <div></div>
      </div>
    </section>
    <section class="detail-team-grid score-editor-grid">
      ${scoreEditorColumn('yellow', target)}
      ${scoreEditorColumn('blue', target)}
    </section>
    <section class="card coach-save-row score-bottom-actions">
      ${isPresident() && state.editingMatchId ? `<button class="danger-btn" data-delete-match="${state.editingMatchId}" type="button">Supprimer le match</button>` : ''}
      ${isPresident() && !state.editingMatchId ? `<button class="secondary-btn" data-skip-match="1" type="button">Pas de match</button>` : ''}
      <button class="primary-btn" data-save-score="1" type="button">Enregistrer score</button>
      ${isPresident() ? `<button class="primary-btn success" data-close-match="1" type="button">Clôturer match</button>` : ''}
    </section>
  `;
}
function rankingCards(list, metricLabel = 'pts') {
  return list.map((player, index) => `
    <button class="ranking-card player-trigger" data-player-id="${player.playerId}" type="button">
      <img class="avatar" src="${avatarFor(player)}" alt="${escapeHtml(player.displayName)}" loading="lazy" />
      <div>
        <div class="name-line"><span class="rank">#${index + 1}</span><span>${escapeHtml(player.displayName)}</span><span>${metricLabel === 'pts' ? player.points + ' pts' : player[metricLabel]}</span></div>
        <div class="substats">
          <div>MJ: ${player.matchesPlayed} · V/N/D: ${player.wins}/${player.draws}/${player.losses}</div>
          <div>Buts: ${player.goals} · Passes: ${player.assists} · MVP: ${player.mvps}</div>
        </div>
      </div>
    </button>
  `).join('');
}

function rankingTable(list) {
  return `
    <table class="ranking-table">
      <thead>
        <tr>
          <th>#</th><th>Joueur</th><th>J</th><th>PTS</th><th>MJ</th><th>V</th><th>N</th><th>D</th><th>BP</th><th>BC</th><th>Diff</th><th>Buts</th><th>Pass.</th><th>MVP</th><th>Prés.</th><th>Abs.</th><th>%V</th>
        </tr>
      </thead>
      <tbody>
        ${list.map((player) => `
          <tr class="player-trigger" data-player-id="${player.playerId}">
            <td>${player.classement}</td>
            <td><div class="table-player-name">${escapeHtml(player.displayName)}</div></td>
            <td>${currentMatchdayNumber()}</td>
            <td>${player.points}</td>
            <td>${player.matchesPlayed}</td>
            <td>${player.wins}</td>
            <td>${player.draws}</td>
            <td>${player.losses}</td>
            <td>${player.goalsFor}</td>
            <td>${player.goalsAgainst}</td>
            <td>${signed(player.goalDifference)}</td>
            <td>${player.goals}</td>
            <td>${player.assists}</td>
            <td>${player.mvps}</td>
            <td>${player.presences}</td>
            <td>${player.absences}</td>
            <td>${fmtPct(player.victoryRate)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function rankingModeConfig() {
  return {
    table: { label: 'Tableau' },
    cards: { label: 'Cartes' },
    goals: { label: 'Buteurs', metric: 'goals' },
    assists: { label: 'Passeurs', metric: 'assists' },
    mvps: { label: 'MVP', metric: 'mvps' },
    presences: { label: 'Prés.', metric: 'presences' },
    absences: { label: 'Abs.', metric: 'absences' }
  };
}

function renderRanking() {
  const config = rankingModeConfig();
  const mode = config[state.rankingMode] || config.table;
  let list = rankingPlayers();
  if (state.rankingMode === 'table') list.sort((a, b) => Number(a.classement || 999) - Number(b.classement || 999));
  else if (state.rankingMode === 'cards') list.sort((a, b) => Number(a.classement || 999) - Number(b.classement || 999));
  else list.sort((a, b) => Number(b[mode.metric] || 0) - Number(a[mode.metric] || 0) || Number(a.classement || 999) - Number(b.classement || 999));
  return `
    <section class="card">
      <div class="card-head">
        <h2>Classement</h2>
      </div>
      <div class="card-body header-stack">
        <div class="tab-row compact-tabs ranking-tabs-row">
          ${Object.entries(config).map(([key, value]) => `<button class="tab-btn ${state.rankingMode === key ? 'active' : ''}" data-ranking-mode="${key}">${value.label}</button>`).join('')}
        </div>
      </div>
      <div class="card-body ${state.rankingMode === 'table' ? 'table-wrap' : 'ranking-list'}">
        ${list.length ? (state.rankingMode === 'table' ? rankingTable(list) : rankingCards(list, mode.metric || 'pts')) : '<section class="card center-card"><p>Aucun joueur trouvé.</p></section>'}
      </div>
    </section>
  `;
}

function attachPlayerTriggers(root) {
  root.querySelectorAll('.player-trigger').forEach((el) => {
    el.addEventListener('click', () => openPlayer(el.dataset.playerId));
  });
}

function attachMatchTriggers(root) {
  root.querySelectorAll('.match-trigger').forEach((el) => {
    el.addEventListener('click', () => openMatch(el.dataset.matchId));
  });
}

async function loadImage(src) {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function blobFromCanvas(canvas) {
  return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}


async function createMatchShareBlob(match) {
  const yellowScorers = summarizeRepeatedNames(scorersForGoals(match.yellowGoals || []));
  const blueScorers = summarizeRepeatedNames(scorersForGoals(match.blueGoals || []));
  const yellowAssists = summarizeRepeatedNames(assistsForGoals(match.yellowGoals || []));
  const blueAssists = summarizeRepeatedNames(assistsForGoals(match.blueGoals || []));
  const listMax = Math.max(yellowScorers.length + yellowAssists.length, blueScorers.length + blueAssists.length, 1);
  const canvas = document.createElement('canvas');
  canvas.width = 1300;
  canvas.height = Math.max(1180, 560 + listMax * 40 + 260);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponible');
  const rounded = (x,y,w,h,r=28)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();};
  ctx.fillStyle = '#07142c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#173c76');
  grad.addColorStop(1, '#030814');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  rounded(28, 28, canvas.width - 56, canvas.height - 56, 28);
  ctx.strokeStyle = 'rgba(255,213,92,.24)';
  ctx.lineWidth = 2;
  ctx.stroke();
  try { const logo = await loadImage(assetPath('logo', 'logo-cov.webp')); ctx.drawImage(logo, 556, 40, 188, 188); } catch {}
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 64px Inter, Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Match du ${match.dateLabel}`, 650, 270);
  ctx.font = '900 164px Inter, Arial';
  ctx.fillText(`${match.yellowScore}  -  ${match.blueScore}`, 650, 450);
  ctx.font = '800 34px Inter, Arial';
  ctx.fillStyle = '#ffd000';
  ctx.fillText(`MVP jaune : ${playerDisplayName(match.yellowMvpPlayerId)}`, 280, 520);
  ctx.fillStyle = '#55b8ff';
  ctx.fillText(`MVP bleu : ${playerDisplayName(match.blueMvpPlayerId)}`, 1020, 520);

  const drawListBlock = (title, color, items, x, y) => {
    ctx.fillStyle = color;
    ctx.font = '800 34px Inter, Arial';
    ctx.textAlign = 'left';
    ctx.fillText(title, x, y);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 28px Inter, Arial';
    if (!items.length) {
      ctx.fillText('• Aucun', x, y + 44);
      return y + 84;
    }
    items.forEach((item, index) => {
      ctx.fillText(`• ${item}`, x, y + 44 + index * 38);
    });
    return y + 44 + items.length * 38;
  };

  rounded(60, 580, 540, canvas.height - 640, 24);
  rounded(700, 580, 540, canvas.height - 640, 24);
  ctx.strokeStyle = 'rgba(255,255,255,.10)';
  ctx.stroke();
  ctx.beginPath();
  rounded(700, 580, 540, canvas.height - 640, 24);
  ctx.stroke();

  let yLeft = drawListBlock('Buteurs jaune', '#ffd000', yellowScorers, 92, 640);
  yLeft = drawListBlock('Passeurs jaune', '#ffb347', yellowAssists, 92, yLeft + 34);
  let yRight = drawListBlock('Buteurs bleu', '#55b8ff', blueScorers, 732, 640);
  yRight = drawListBlock('Passeurs bleu', '#88c8ff', blueAssists, 732, yRight + 34);
  return blobFromCanvas(canvas);
}

async function createRankingShareBlob() {
  const list = rankingPlayers().sort((a, b) => Number(a.classement || 999) - Number(b.classement || 999));
  const rowH = 42;
  const headerH = 180;
  const width = 1620;
  const height = headerH + rowH * (list.length + 2) + 40;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponible');
  ctx.fillStyle = '#07142c';
  ctx.fillRect(0,0,width,height);
  const grad = ctx.createLinearGradient(0,0,width,height);
  grad.addColorStop(0,'#173c76');
  grad.addColorStop(1,'#030814');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,width,height);
  try { const logo = await loadImage(assetPath('logo', 'logo-cov.webp')); ctx.drawImage(logo, 60, 36, 110, 110); } catch {}
  ctx.fillStyle = '#ffd55c';
  ctx.font = '700 36px Inter, Arial';
  ctx.fillText(`Saison ${currentSeasonDisplay()}`, 200, 90);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 62px Inter, Arial';
  ctx.fillText('C.O.V', 200, 145);
  const cols = [40, 110, 360, 485, 570, 640, 700, 760, 825, 895, 970, 1065, 1155, 1245, 1335, 1425];
  const headers = ['#','Joueur','J','PTS','MJ','V','N','D','BP','BC','Diff','Buts','Pass.','MVP','Prés.','Abs.'];
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(30, headerH-10, width-60, rowH);
  ctx.fillStyle = '#ffd55c'; ctx.font = '700 24px Inter, Arial';
  headers.forEach((h,i)=>ctx.fillText(h, cols[i], headerH+18));
  list.forEach((player, idx) => {
    const y = headerH + rowH * (idx + 1);
    if (idx % 2 === 0) { ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(30, y-20, width-60, rowH); }
    ctx.fillStyle = '#ffffff'; ctx.font = '600 22px Inter, Arial';
    const vals = [player.classement, player.displayName, currentMatchdayNumber(), player.points, player.matchesPlayed, player.wins, player.draws, player.losses, player.goalsFor, player.goalsAgainst, signed(player.goalDifference), player.goals, player.assists, player.mvps, player.presences, player.absences];
    vals.forEach((v,i)=>ctx.fillText(String(v), cols[i], y+8));
  });
  return blobFromCanvas(canvas);
}

async function createSeasonSummaryShareBlob() {
  const rows = seasonSummaryRows();
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1500;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponible');
  const rounded = (x, y, w, h, r = 28) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  };
  ctx.fillStyle = '#07142c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#173c76');
  grad.addColorStop(1, '#020716');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  try { const logo = await loadImage(assetPath('logo', 'logo-cov.webp')); ctx.drawImage(logo, 500, 60, 200, 200); } catch {}
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '950 72px Inter, Arial, sans-serif';
  ctx.fillText('C.O.V', 600, 310);
  ctx.fillStyle = '#ffd55c';
  ctx.font = '850 40px Inter, Arial, sans-serif';
  ctx.fillText(currentSeasonDisplay(), 600, 365);
  rows.forEach(([label, value], index) => {
    const y = 430 + index * 106;
    ctx.fillStyle = index % 2 ? 'rgba(255,255,255,.055)' : 'rgba(255,255,255,.09)';
    rounded(90, y, 1020, 82, 22);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd55c';
    ctx.font = '800 27px Inter, Arial, sans-serif';
    ctx.fillText(label.toUpperCase(), 130, y + 50);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = '850 30px Inter, Arial, sans-serif';
    const cleanValue = String(value || '—');
    const display = cleanValue.length > 42 ? `${cleanValue.slice(0, 39)}...` : cleanValue;
    ctx.fillText(display, 1070, y + 52);
  });
  return blobFromCanvas(canvas);
}

async function shareSeasonSummary() {
  const blob = await createSeasonSummaryShareBlob();
  await shareBlob(blob, `cov-resume-saison-${currentSeasonDisplay().replace('/', '-')}.png`, 'C.O.V', currentSeasonDisplay());
}

function downloadNamedBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

async function downloadShareItems(items = []) {
  for (const item of items) {
    downloadNamedBlob(item.blob, item.filename);
    await new Promise((resolve) => setTimeout(resolve, 260));
  }
}

async function nativeShareItems(items = [], title = 'C.O.V', text = '') {
  const files = items.map((item) => new File([item.blob], item.filename, { type: item.blob?.type || item.type || 'application/octet-stream' }));
  if (navigator.canShare && navigator.canShare({ files })) {
    await navigator.share({ files, title, text });
    return true;
  }
  return false;
}

function previewShareItems(items = [], title = 'C.O.V', text = '') {
  const safeItems = items.filter((item) => item?.blob && item?.filename);
  if (!safeItems.length) return Promise.resolve(false);
  return new Promise((resolve) => {
    const urls = safeItems.map((item) => URL.createObjectURL(item.blob));
    const overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(2,6,18,.88);display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;';
    const card = document.createElement('div');
    card.style.cssText = 'width:min(980px,100%);max-height:92vh;background:#07142c;border:1px solid rgba(255,213,92,.28);border-radius:24px;box-shadow:0 24px 70px rgba(0,0,0,.55);display:flex;flex-direction:column;overflow:hidden;';
    const images = safeItems.map((item, index) => {
      const mime = item.blob?.type || '';
      const media = mime.startsWith('video/')
        ? `<video src="${urls[index]}" controls playsinline style="display:block;width:100%;max-height:66vh;object-fit:contain;border-radius:16px;background:#020716;"></video>`
        : mime.startsWith('image/')
          ? `<img src="${urls[index]}" alt="${escapeHtml(item.filename)}" style="display:block;width:100%;max-height:66vh;object-fit:contain;border-radius:16px;background:#020716;" />`
          : `<div style="display:grid;place-items:center;width:100%;height:260px;border-radius:16px;background:#020716;color:#ffd55c;font:900 18px Inter,Arial;">${escapeHtml(item.filename)}</div>`;
      return `
      <figure style="margin:0;min-width:min(360px,86vw);max-width:520px;">
        ${media}
        <figcaption style="padding:8px 4px 0;text-align:center;color:rgba(255,255,255,.72);font:700 12px Inter,Arial,sans-serif;word-break:break-word;">${escapeHtml(item.filename)}</figcaption>
      </figure>`;
    }).join('');
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08);">
        <div><div style="color:#ffd55c;font:900 18px Inter,Arial,sans-serif;">Aperçu avant partage</div><div style="color:rgba(255,255,255,.64);font:700 12px Inter,Arial,sans-serif;">${safeItems.length} fichier${safeItems.length > 1 ? 's' : ''}</div></div>
        <button type="button" data-preview-close="1" style="border:0;background:rgba(255,255,255,.1);color:#fff;border-radius:999px;width:36px;height:36px;font:900 18px Inter,Arial;">×</button>
      </div>
      <div style="display:flex;gap:16px;overflow:auto;padding:18px;align-items:center;justify-content:${safeItems.length === 1 ? 'center' : 'flex-start'};">${images}</div>
      <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;padding:14px 18px;border-top:1px solid rgba(255,255,255,.08);">
        <button type="button" data-preview-download="1" style="border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#fff;border-radius:14px;padding:12px 16px;font:900 13px Inter,Arial;">Télécharger</button>
        <button type="button" data-preview-share="1" style="border:0;background:#ffd55c;color:#07142c;border-radius:14px;padding:12px 18px;font:950 13px Inter,Arial;">Partager</button>
      </div>
    `;
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    const cleanup = (value) => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      overlay.remove();
      resolve(value);
    };
    overlay.querySelector('[data-preview-close]').addEventListener('click', () => cleanup(false));
    overlay.addEventListener('click', (event) => { if (event.target === overlay) cleanup(false); });
    overlay.querySelector('[data-preview-download]').addEventListener('click', async () => {
      await downloadShareItems(safeItems);
      cleanup(true);
    });
    overlay.querySelector('[data-preview-share]').addEventListener('click', async () => {
      try {
        const shared = await nativeShareItems(safeItems, title, text);
        if (!shared) await downloadShareItems(safeItems);
        cleanup(true);
      } catch {
        cleanup(false);
      }
    });
  });
}

async function shareBlob(blob, filename, title, text) {
  if (!blob) return;
  await previewShareItems([{ blob, filename }], title, text);
}

async function shareMany(blobs, filenameBase, title, text) {
  const items = blobs.map((blob, index) => ({ blob, filename: `${filenameBase}-${index === 0 ? 'terrain' : 'sobre'}.png` }));
  await previewShareItems(items, title, text);
}

async function shareMatch(matchId) {
  const match = matches().find((item) => item.matchId === matchId);
  if (!match) return;
  const blob = await createMatchShareBlob(match);
  await shareBlob(blob, `cov-score-${match.dateLabel.replaceAll('/', '-')}.png`, 'C.O.V', `Match du ${match.dateLabel}`);
}

async function shareMatchBundle(matchId) {
  const match = matches().find((item) => item.matchId === matchId);
  if (!match) return;
  const datePart = (match.dateLabel || currentSeasonDisplay()).replaceAll('/', '-');
  const scoreBlob = await createMatchShareBlob(match);
  const yellowBlob = await createSingleTeamCompoShareBlob(match, 'yellow');
  const blueBlob = await createSingleTeamCompoShareBlob(match, 'blue');
  const items = [
    scoreBlob ? { blob: scoreBlob, filename: `cov-score-${datePart}.png` } : null,
    yellowBlob ? { blob: yellowBlob, filename: `cov-compo-jaune-${datePart}.png` } : null,
    blueBlob ? { blob: blueBlob, filename: `cov-compo-bleu-${datePart}.png` } : null,
  ].filter(Boolean);
  if (items.length === 1) await shareBlob(items[0].blob, items[0].filename, 'C.O.V', `Match du ${match.dateLabel}`);
  else await shareNamedBlobs(items, 'C.O.V', `Match du ${match.dateLabel}`);
}

async function shareRanking() {
  const blob = await createRankingShareBlob();
  await shareBlob(blob, `cov-classement-${currentSeasonDisplay().replace('/', '-')}.png`, 'C.O.V', currentSeasonDisplay());
}

async function downloadRanking() {
  const blob = await createRankingShareBlob();
  await downloadNamedBlob(blob, `cov-classement-${currentSeasonDisplay().replace('/', '-')}.png`);
}


async function shareNamedBlobs(items, title, text) {
  await previewShareItems(items, title, text);
}

function sourceTeamSlots(source, teamKey = 'yellow') {
  if (teamKey === 'blue') return normalizeDetailedSlots(source.blueSlots, source.blueLines, source.teamBluePlayerIds || []);
  return normalizeDetailedSlots(source.yellowSlots, source.yellowLines, source.teamYellowPlayerIds || []);
}


function teamGoalAssistMarkers(source, teamKey = 'yellow') {
  const goals = teamKey === 'blue' ? (source.blueGoals || []) : (source.yellowGoals || []);
  const map = {};
  goals.forEach((goal) => {
    if (goal?.scorerPlayerId) {
      if (!map[goal.scorerPlayerId]) map[goal.scorerPlayerId] = { goals: 0, assists: 0 };
      map[goal.scorerPlayerId].goals += 1;
    }
    if (goal?.assistPlayerId) {
      if (!map[goal.assistPlayerId]) map[goal.assistPlayerId] = { goals: 0, assists: 0 };
      map[goal.assistPlayerId].assists += 1;
    }
  });
  return map;
}

function playerMatchEmojiLine(playerId, markers = {}) {
  const data = markers[playerId] || { goals: 0, assists: 0 };
  return `${'⚽'.repeat(Number(data.goals || 0))}${'👟'.repeat(Number(data.assists || 0))}`;
}

async function createSingleTeamCompoShareBlob(source, teamKey = 'yellow') {
  const teamColor = teamKey === 'blue' ? 'blue' : 'yellow';
  const label = teamColor === 'blue' ? 'BLEU' : 'JAUNE';
  const slots = sourceTeamSlots(source, teamColor);
  const statMarkers = teamGoalAssistMarkers(source, teamColor);
  if (!flattenDetailedSlots(slots).length) return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const rounded = (x, y, w, h, r = 28) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };

  ctx.fillStyle = teamColor === 'yellow' ? '#3d3000' : '#07142c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  if (teamColor === 'yellow') {
    grad.addColorStop(0, '#ffe066');
    grad.addColorStop(0.48, '#c99a00');
    grad.addColorStop(1, '#07142c');
  } else {
    grad.addColorStop(0, '#173c76');
    grad.addColorStop(1, '#030814');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = teamColor === 'yellow' ? 'rgba(255,213,92,.24)' : 'rgba(85,184,255,.24)';
  ctx.lineWidth = 3;
  rounded(24, 24, canvas.width - 48, canvas.height - 48, 32);
  ctx.stroke();

  try { const logo = await loadImage(assetPath('logo', 'logo-cov.webp')); ctx.drawImage(logo, 500, 38, 200, 200); } catch {}
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 58px Inter, Arial';
  ctx.fillText('C.O.V', 600, 292);
  ctx.fillStyle = teamColor === 'yellow' ? '#ffd55c' : '#55b8ff';
  ctx.font = '800 34px Inter, Arial';
  ctx.fillText(source.dateLabel || currentSeasonDisplay(), 600, 340);

  const field = { x: 80, y: 410, width: 1040, height: 1240 };
  try {
    const terrain = await loadImage(assetPath('Terrain', 'Terrain.webp'));
    rounded(field.x, field.y, field.width, field.height, 34);
    ctx.save();
    ctx.clip();
    ctx.drawImage(terrain, field.x, field.y, field.width, field.height);
    ctx.restore();
  } catch {
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.fillRect(field.x, field.y, field.width, field.height);
  }
  ctx.strokeStyle = teamColor === 'yellow' ? 'rgba(255,213,92,.86)' : 'rgba(85,184,255,.86)';
  ctx.lineWidth = 5;
  ctx.strokeRect(field.x, field.y, field.width, field.height);

  const drawPlayerCard = async (playerId, slotPosition, x, y, w, h) => {
    const player = playerById(playerId);
    if (!player) return;
    const r = 18;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.38)';
    ctx.shadowBlur = 16;
    ctx.fillStyle = 'rgba(7,18,40,.95)';
    ctx.strokeStyle = teamColor === 'yellow' ? 'rgba(255,213,92,.82)' : 'rgba(78,153,255,.82)';
    ctx.lineWidth = 2;
    rounded(x, y, w, h, r);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    const nameBarHeight = Math.max(28, Math.round(h * 0.28));
    try {
      const avatar = await loadImage(avatarForSlot(player, teamColor, slotPosition));
      drawImageContain(ctx, avatar, x + 7, y + 5, w - 14, h - nameBarHeight - 8);
    } catch {}
    ctx.fillStyle = 'rgba(3,11,17,.96)';
    rounded(x, y + h - nameBarHeight, w, nameBarHeight, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${Math.max(14, Math.round(h * 0.12))}px Inter, Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(player.displayName || '').slice(0, 13), x + w / 2, y + h - nameBarHeight / 2 + 1);
    const emojiLine = playerMatchEmojiLine(player.playerId, statMarkers);
    if (emojiLine) {
      let emojiSize = Math.max(14, Math.round(h * 0.16));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `900 ${emojiSize}px Arial, sans-serif`;
      while (emojiSize > 10 && ctx.measureText(emojiLine).width > w - 8) {
        emojiSize -= 1;
        ctx.font = `900 ${emojiSize}px Arial, sans-serif`;
      }
      ctx.fillText(emojiLine, x + w / 2, y + h - nameBarHeight - Math.max(8, emojiSize * 0.25));
    }
  };

  for (const position of COMPO_POSITION_OPTIONS) {
    const playerId = slots[position];
    if (!playerId) continue;
    const coords = getAdjustedFieldCoords(position);
    const x = field.x + (coords.x / MODEL_FIELD_SIZE.width) * field.width;
    const y = field.y + (coords.y / MODEL_FIELD_SIZE.height) * field.height;
    const w = (coords.w / MODEL_FIELD_SIZE.width) * field.width;
    const h = (coords.h / MODEL_FIELD_SIZE.height) * field.height;
    await drawPlayerCard(playerId, position, x, y, w, h);
  }
  return blobFromCanvas(canvas);
}

async function createCompoShareItems(source) {
  const datePart = (source.dateLabel || currentSeasonDisplay()).replaceAll('/', '-');
  const yellowCount = flattenDetailedSlots(sourceTeamSlots(source, 'yellow')).length;
  const blueCount = flattenDetailedSlots(sourceTeamSlots(source, 'blue')).length;
  if (yellowCount && blueCount) {
    const yellowBlob = await createSingleTeamCompoShareBlob(source, 'yellow');
    const blueBlob = await createSingleTeamCompoShareBlob(source, 'blue');
    return [
      yellowBlob ? { blob: yellowBlob, filename: `cov-compo-jaune-${datePart}.png` } : null,
      blueBlob ? { blob: blueBlob, filename: `cov-compo-bleu-${datePart}.png` } : null
    ].filter(Boolean);
  }
  if (blueCount) {
    const blueBlob = await createSingleTeamCompoShareBlob(source, 'blue');
    return blueBlob ? [{ blob: blueBlob, filename: `cov-compo-bleu-${datePart}.png` }] : [];
  }
  const blob = await createCompoShareBlob(source);
  return blob ? [{ blob, filename: `cov-compo-${datePart}.png` }] : [];
}

async function createCompoShareBlob(source) {
  const canvas = document.createElement('canvas');
  const hasBlueTeam = flattenDetailedSlots(sourceTeamSlots(source, 'blue')).length > 0;
  canvas.width = 1600;
  canvas.height = hasBlueTeam ? 3000 : 1900;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (hasBlueTeam) {
    canvas.width = 1536;
    canvas.height = 1024;
    try {
      const bg = await loadImage(assetPath('ShareCompoTemplate', 'share-compo-template.webp'));
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    } catch {
      ctx.fillStyle = '#06120a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const panels = { yellow: { x: 28, y: 120, width: 705, height: 845 }, blue: { x: 802, y: 120, width: 705, height: 845 } };
    const drawRoundedRect = (x, y, w, h, r = 14) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
    const drawPlayerCard = async (playerId, teamColor, slotPosition, x, y, w, h) => {
      const player = playerById(playerId); if (!player) return;
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4; drawRoundedRect(x, y, w, h, 13); ctx.fillStyle = 'rgba(5,17,25,.96)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.72)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
      const nameBarHeight = Math.max(26, Math.round(h * 0.27));
      try { const avatar = await loadImage(avatarForSlot(player, teamColor, slotPosition)); drawImageContain(ctx, avatar, x + 7, y + 5, w - 14, h - nameBarHeight - 8); } catch {}
      ctx.fillStyle = 'rgba(3,11,17,.96)'; drawRoundedRect(x, y + h - nameBarHeight, w, nameBarHeight, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `900 ${Math.max(13, Math.round(h * 0.115))}px Inter, Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(player.displayName || '').slice(0, 12), x + w / 2, y + h - nameBarHeight / 2 + 1);
    };
    const drawTeam = async (teamKey, teamColor, slotsInput) => {
      const field = panels[teamKey]; const slots = normalizeDetailedSlots(slotsInput);
      for (const position of COMPO_POSITION_OPTIONS) { const playerId = slots[position]; if (!playerId) continue; const coords = getAdjustedFieldCoords(position); const scale = 1.45; const w = Math.max(96, (coords.w / MODEL_FIELD_SIZE.width) * field.width * scale); const h = Math.max(140, (coords.h / MODEL_FIELD_SIZE.height) * field.height * scale); const cx = field.x + (coords.x / MODEL_FIELD_SIZE.width) * field.width + ((coords.w / MODEL_FIELD_SIZE.width) * field.width) / 2; const cy = field.y + (coords.y / MODEL_FIELD_SIZE.height) * field.height + ((coords.h / MODEL_FIELD_SIZE.height) * field.height) / 2; await drawPlayerCard(playerId, teamColor, position, cx - w / 2, cy - h / 2, w, h); }
    };
    await drawTeam('yellow', 'yellow', sourceTeamSlots(source, 'yellow'));
    await drawTeam('blue', 'blue', sourceTeamSlots(source, 'blue'));
    return blobFromCanvas(canvas);
  }

  const paintBackground = () => {
    ctx.fillStyle = '#07142c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#173c76');
    grad.addColorStop(1, '#030814');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,213,92,.18)';
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
  };

  paintBackground();
  try { const logo = await loadImage(assetPath('logo', 'logo-cov.webp')); ctx.drawImage(logo, 700, 28, 200, 200); } catch {}
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 58px Inter, Arial';
  ctx.fillText('C.O.V', 800, 280);
  ctx.fillStyle = '#ffd55c';
  ctx.font = '800 34px Inter, Arial';
  ctx.fillText(currentSeasonDisplay(), 800, 328);

  const terrain = await loadImage(assetPath('Terrain', 'Terrain.webp'));
  const panels = hasBlueTeam
    ? {
        yellow: { x: 110, y: 420, width: 1380, height: 1130 },
        blue: { x: 110, y: 1660, width: 1380, height: 1130 }
      }
    : {
        yellow: { x: 110, y: 420, width: 1380, height: 1300 }
      };

  const drawPanelFrame = (panel, color) => {
    const r = 36;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(panel.x + r, panel.y);
    ctx.arcTo(panel.x + panel.width, panel.y, panel.x + panel.width, panel.y + panel.height, r);
    ctx.arcTo(panel.x + panel.width, panel.y + panel.height, panel.x, panel.y + panel.height, r);
    ctx.arcTo(panel.x, panel.y + panel.height, panel.x, panel.y, r);
    ctx.arcTo(panel.x, panel.y, panel.x + panel.width, panel.y, r);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(terrain, panel.x, panel.y, panel.width, panel.height);
    ctx.restore();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);
  };

  if (panels.yellow) drawPanelFrame(panels.yellow, 'rgba(255,213,92,.88)');
  if (panels.blue) drawPanelFrame(panels.blue, 'rgba(78,153,255,.88)');

  const drawPlayerCard = async (playerId, teamColor, slotPosition, x, y, w, h) => {
    const player = playerById(playerId);
    if (!player) return;
    const r = 20;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.34)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(7,18,40,.94)';
    ctx.strokeStyle = teamColor === 'yellow' ? 'rgba(255,213,92,.82)' : teamColor === 'blue' ? 'rgba(78,153,255,.82)' : 'rgba(255,255,255,.62)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    const nameBarHeight = Math.max(34, Math.round(h * 0.28));
    try {
      const avatar = await loadImage(avatarForSlot(player, teamColor, slotPosition));
      const avatarW = Math.round(w * 0.8);
      const avatarH = Math.round(h * 0.6);
      const avatarX = x + Math.round((w - avatarW) / 2);
      const avatarY = y + Math.round(h * 0.04);
      drawImageContain(ctx, avatar, avatarX, avatarY, avatarW, avatarH);
    } catch {}
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    ctx.fillRect(x, y + h - nameBarHeight, w, nameBarHeight);
    ctx.strokeStyle = 'rgba(255,255,255,.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + h - nameBarHeight);
    ctx.lineTo(x + w, y + h - nameBarHeight);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${Math.max(18, Math.round(h * 0.125))}px Inter, Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.displayName, x + w / 2, y + h - nameBarHeight / 2 + 1);
  };

  const drawTeam = async (teamKey, teamColor, slotsInput) => {
    const field = panels[teamKey];
    if (!field) return;
    const slots = normalizeDetailedSlots(slotsInput);
    for (const position of COMPO_POSITION_OPTIONS) {
      const playerId = slots[position];
      if (!playerId) continue;
      const coords = getAdjustedFieldCoords(position);
      const x = field.x + (coords.x / MODEL_FIELD_SIZE.width) * field.width;
      const y = field.y + (coords.y / MODEL_FIELD_SIZE.height) * field.height;
      const w = (coords.w / MODEL_FIELD_SIZE.width) * field.width;
      const h = (coords.h / MODEL_FIELD_SIZE.height) * field.height;
      await drawPlayerCard(playerId, teamColor, position, x, y, w, h);
    }
  };

  await drawTeam('yellow', hasBlueTeam ? 'yellow' : 'neutral', sourceTeamSlots(source, 'yellow'));
  if (hasBlueTeam) await drawTeam('blue', 'blue', sourceTeamSlots(source, 'blue'));
  if (!hasBlueTeam && Array.isArray(source.benchPlayerIds) && source.benchPlayerIds.length) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px Inter, Arial';
    ctx.textAlign = 'left';
    ctx.fillText('REMPLAÇANTS', 120, 1775);
    ctx.font = '700 24px Inter, Arial';
    const names = source.benchPlayerIds.map((id) => playerDisplayName(id)).filter(Boolean);
    let y = 1820;
    let line = '';
    for (const name of names) {
      const next = line ? `${line} • ${name}` : name;
      if (ctx.measureText(next).width > 1320) {
        ctx.fillText(line, 120, y);
        line = name;
        y += 34;
      } else {
        line = next;
      }
    }
    if (line) ctx.fillText(line, 120, y);
  }
  return blobFromCanvas(canvas);
}

async function shareCurrentCompo() {
  const source = currentCompoSource();
  if (!source) return;
  const items = await createCompoShareItems(source);
  if (!items.length) return;
  if (items.length === 1) await shareBlob(items[0].blob, items[0].filename, 'C.O.V', 'Compo du match');
  else await shareNamedBlobs(items, 'C.O.V', 'Compo du match');
}

function elevenCompoShareSource() {
  const published = publishedElevenSource();
  if (!published) return null;
  return published;
}

function resolveCompoShareSource(value = '') {
  if (!value || value === 'current') {
    return currentCompoSource();
  }
  if (value === 'draft') return currentDraft();
  if (value === 'eleven') return elevenCompoShareSource();
  if (value === 'eleven_editor') return currentElevenEditorSource();
  if (value.startsWith('match:')) {
    const matchId = value.slice(6);
    const match = matches().find((item) => item.matchId === matchId) || null;
    if (!match) return null;
    return {
      matchId: match.matchId,
      dateLabel: match.dateLabel,
      yellowSlots: normalizeDetailedSlots(match.yellowSlots || match.yellowLines || match.teamYellowPlayerIds || []),
      blueSlots: normalizeDetailedSlots(match.blueSlots || match.blueLines || match.teamBluePlayerIds || []),
      benchPlayerIds: [],
    };
  }
  return null;
}

async function shareCompoFromSource(sourceKey = 'current') {
  const source = resolveCompoShareSource(sourceKey);
  if (!source) return;
  const items = await createCompoShareItems(source);
  if (!items.length) return;
  if (items.length === 1) await shareBlob(items[0].blob, items[0].filename, 'C.O.V', sourceKey === 'eleven' || sourceKey === 'eleven_editor' ? 'Onze type' : 'Compo du match');
  else await shareNamedBlobs(items, 'C.O.V', 'Compo du match');
}

async function createPlayerShareBlob(player) {
  const impact = playerTeamImpact(player.playerId);
  const positions = getPlayerPositions(player);
  const mainPos = positions[0] || '—';
  const secondary = positions.slice(1);
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 2050;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponible');
  const rounded = (x,y,w,h,r=24)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();};
  ctx.fillStyle = '#07142c';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  const grad = ctx.createLinearGradient(0,0,0,canvas.height); grad.addColorStop(0,'#173c76'); grad.addColorStop(1,'#030814'); ctx.fillStyle = grad; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = 'rgba(255,213,92,.22)'; ctx.lineWidth = 2; rounded(22,22,1156,2006,28); ctx.stroke();

  try { const avatar = await loadImage(avatarFor(player)); drawImageContain(ctx, avatar, 44, 92, 320, 392); } catch {}
  try { const logo = await loadImage(assetPath('logo', 'logo-cov.webp')); ctx.drawImage(logo, 968, 72, 156, 156); } catch {}
  const overall = playerOverallRating(player.playerId);
  rounded(286, 92, 96, 96, 20); ctx.fillStyle='rgba(7,18,40,.94)'; ctx.fill(); ctx.strokeStyle='rgba(255,213,92,.55)'; ctx.stroke();
  ctx.fillStyle='#ffd55c'; ctx.font='950 48px Inter, Arial'; ctx.textAlign='center'; ctx.fillText(String(overall.rating), 334, 154);
  ctx.fillStyle=overall.delta >= 0 ? '#49d28c' : '#ff6b6b'; ctx.font='900 22px Inter, Arial'; ctx.fillText(`${overall.delta >= 0 ? '+' : ''}${overall.delta}`, 374, 92);

  ctx.fillStyle='#fff'; ctx.font='900 72px Inter, Arial'; ctx.textAlign='left'; ctx.fillText(player.displayName.toUpperCase(), 400, 142);
  ctx.fillStyle='#ffd55c'; ctx.font='700 42px Inter, Arial'; ctx.fillText(`SAISON ${currentSeasonDisplay()}`, 400, 198);

  const badges = badgeChipsForPlayer(player).slice(0,3);
  let bx = 400;
  badges.forEach((badge, i) => {
    const x = bx + i * 185;
    rounded(x, 238, 170, 52, 24);
    ctx.strokeStyle='rgba(255,213,92,.18)'; ctx.stroke();
    ctx.fillStyle='#ffd55c'; ctx.font='800 22px Inter, Arial'; ctx.textAlign='center';
    ctx.fillText(badge, x + 85, 271);
  });

  const statCard = (label, val, x, y) => {
    rounded(x, y, 170, 128, 20); ctx.strokeStyle='rgba(255,213,92,.16)'; ctx.stroke();
    ctx.fillStyle='#ffffff'; ctx.font='700 28px Inter, Arial'; ctx.textAlign='center'; ctx.fillText(label, x + 85, y + 40);
    ctx.fillStyle='#ffd55c'; ctx.font='900 58px Inter, Arial'; ctx.fillText(String(val), x + 85, y + 100);
  };
  [ ['MJ', player.matchesPlayed], ['BUTS', player.goals], ['PASSES', player.assists], ['MVP', player.mvps] ].forEach(([label, value], i) => statCard(label, value, 400 + i * 182, 326));

  rounded(40, 540, 520, 400, 22); ctx.strokeStyle='rgba(255,213,92,.16)'; ctx.stroke();
  ctx.fillStyle='#fff'; ctx.font='800 34px Inter, Arial'; ctx.textAlign='center'; ctx.fillText('SAISON', 300, 590);
  const seasonRows=[['Classement', ordinal(player.classement)],['Points',player.points],['V / N / D', `${player.wins} / ${player.draws} / ${player.losses}`],['BP / BC', `${player.goalsFor} / ${player.goalsAgainst}`],['Différence', signed(player.goalDifference)],['% victoire', `${fmtPct(player.victoryRate)}`],['Présences', player.presences],['Absences', player.absences]];
  let sy=648; seasonRows.forEach(([l,v])=>{ctx.fillStyle='#fff'; ctx.font='600 28px Inter, Arial'; ctx.textAlign='left'; ctx.fillText(l, 82, sy); ctx.font='800 30px Inter, Arial'; ctx.textAlign='right'; ctx.fillStyle=l==='Différence' && String(v).startsWith('+') ? '#7bf07b' : '#fff'; ctx.fillText(String(v), 510, sy); sy += 42;});

  rounded(590, 540, 570, 400, 22); ctx.strokeStyle='rgba(255,213,92,.16)'; ctx.stroke();
  ctx.fillStyle='#fff'; ctx.font='800 34px Inter, Arial'; ctx.textAlign='center'; ctx.fillText('POSTES', 875, 590);
  rounded(640, 654, 160, 160, 80); ctx.strokeStyle='#ffd55c'; ctx.stroke();
  ctx.fillStyle='#ffd55c'; ctx.font='900 56px Inter, Arial'; ctx.fillText(mainPos, 720, 748);
  const chipW = 108, chipH = 56, startX = 830, startY = 646, gap = 12, maxPerRow = 3;
  secondary.forEach((pos, i) => {
    const row = Math.floor(i / maxPerRow);
    const col = i % maxPerRow;
    const x = startX + col * (chipW + gap);
    const y = startY + row * (chipH + gap);
    rounded(x, y, chipW, chipH, 28); ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='800 28px Inter, Arial'; ctx.fillText(pos, x + chipW / 2, y + 37);
  });

  rounded(40, 980, 1120, 430, 22); ctx.strokeStyle='rgba(255,213,92,.16)'; ctx.stroke();
  ctx.fillStyle='#ffd55c'; ctx.font='800 34px Inter, Arial'; ctx.textAlign='center'; ctx.fillText('IMPACT ÉQUIPE', 600, 1032);
  const impactBox=(title,color,x,data)=>{
    rounded(x,1064,500,292,22); ctx.strokeStyle='rgba(255,213,92,.12)'; ctx.stroke(); ctx.fillStyle=color; ctx.font='800 32px Inter, Arial'; ctx.fillText(title, x+250, 1108);
    const rows=[['Matchs joués',data[0]],['Victoires',data[1]],['Nuls',data[2]],['Défaites',data[3]],['Marqués',data[4]],['Encaissés',data[5]]];
    let ry=1168; rows.forEach(([label,val])=>{ctx.fillStyle='#ffffff'; ctx.font='600 27px Inter, Arial'; ctx.textAlign='left'; ctx.fillText(label, x+28, ry); ctx.font='800 31px Inter, Arial'; ctx.textAlign='right'; ctx.fillText(String(val), x+460, ry); ry += 42;});
  };
  impactBox('EN JAUNE', '#ffd000', 60, [impact.yellowMatches, impact.yellowWins, impact.yellowDraws, impact.yellowLosses, impact.yellowGoalsFor, impact.yellowGoalsAgainst]);
  impactBox('EN BLEU', '#55b8ff', 640, [impact.blueMatches, impact.blueWins, impact.blueDraws, impact.blueLosses, impact.blueGoalsFor, impact.blueGoalsAgainst]);

  rounded(40, 1448, 1120, 96, 22); ctx.strokeStyle='rgba(255,213,92,.16)'; ctx.stroke();
  const totals=[['VICTOIRES', impact.yellowWins + impact.blueWins], ['NULS', impact.yellowDraws + impact.blueDraws], ['DÉFAITES', impact.yellowLosses + impact.blueLosses], ['MARQUÉS', impact.yellowGoalsFor + impact.blueGoalsFor], ['ENCAISSÉS', impact.yellowGoalsAgainst + impact.blueGoalsAgainst]];
  const tx=[150,370,590,810,1030]; totals.forEach(([label,val],i)=>{ctx.fillStyle='#fff'; ctx.font='700 22px Inter, Arial'; ctx.textAlign='center'; ctx.fillText(label, tx[i], 1488); ctx.fillStyle='#ffd55c'; ctx.font='900 50px Inter, Arial'; ctx.fillText(String(val), tx[i], 1536);});

  const isAtt = ['BU','AC','AG','AD'].includes(mainPos);
  const effTitle = isAtt ? 'EFFICIENCE OFFENSIVE' : 'EFFICIENCE';
  rounded(40, 1578, 1120, 300, 22); ctx.strokeStyle='rgba(255,213,92,.16)'; ctx.stroke();
  ctx.fillStyle='#fff'; ctx.font='800 34px Inter, Arial'; ctx.textAlign='center'; ctx.fillText(effTitle, 600, 1630);
  const eff=[['Buts / match', (Number(player.goals||0)/Math.max(1,Number(player.matchesPlayed||1))).toFixed(2)], ['Passes / match', (Number(player.assists||0)/Math.max(1,Number(player.matchesPlayed||1))).toFixed(2)], ['MVP / match', (Number(player.mvps||0)/Math.max(1,Number(player.matchesPlayed||1))).toFixed(2)], ['% victoire', fmtPct(player.victoryRate)], ['Implication / match', ((Number(player.goals||0)+Number(player.assists||0))/Math.max(1,Number(player.matchesPlayed||1))).toFixed(2)]];
  eff.forEach(([label,val],i)=>{
    const x = 58 + i * 222;
    rounded(x, 1670, 196, 140, 18); ctx.strokeStyle='rgba(255,213,92,.12)'; ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='600 20px Inter, Arial'; ctx.textAlign='center'; ctx.fillText(label, x + 98, 1716);
    ctx.fillStyle='#ffd55c'; ctx.font='900 44px Inter, Arial'; ctx.fillText(String(val), x + 98, 1785);
  });
  return blobFromCanvas(canvas);
}


function playerBallonOrRank(playerId) {
  const found = ballonOrPlayers().find((item) => item.playerId === playerId);
  return found ? { rank: found.ballonOrRank, score: found.ballonOrScore } : { rank: null, score: null };
}

function drawPremiumCardHelpers(ctx) {
  const rounded = (x, y, w, h, r = 24) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  const textFit = (text, x, y, maxWidth, size, weight = 900, color = '#fff', align = 'center') => {
    let fontSize = size;
    ctx.textAlign = align;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color;
    do {
      ctx.font = `${weight} ${fontSize}px Inter, Arial, sans-serif`;
      if (ctx.measureText(String(text)).width <= maxWidth || fontSize <= 18) break;
      fontSize -= 2;
    } while (fontSize > 18);
    ctx.fillText(String(text), x, y);
  };
  const panel = (x, y, w, h, alpha = 0.74) => {
    rounded(x, y, w, h, 26);
    ctx.fillStyle = `rgba(3, 10, 27, ${alpha})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 216, 112, .48)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  return { rounded, textFit, panel };
}

function playerSeasonShareStats(player) {
  const overall = playerOverallRating(player.playerId);
  const ballon = playerBallonOrRank(player.playerId);
  const played = Math.max(1, Number(player.matchesPlayed || 0));
  const leaders = topCategoryLeaders();
  const badges = [];
  if (leaders.buteur === player.playerId) badges.push('⚽');
  if (leaders.passeur === player.playerId) badges.push('👟');
  if (leaders.classement === player.playerId) badges.push('👑');
  if (leaders.mvp === player.playerId) badges.push('⭐');
  if (ballon.rank === 1) badges.push('🏆');
  return {
    overall,
    ballon,
    badges,
    positions: getPlayerPositions(player),
    involvement: Number(player.goals || 0) + Number(player.assists || 0),
    goalsPerMatch: (Number(player.goals || 0) / played).toFixed(2),
    assistsPerMatch: (Number(player.assists || 0) / played).toFixed(2),
    pointsPerMatch: (Number(player.points || 0) / played).toFixed(2),
    mvpPerMatch: (Number(player.mvps || 0) / played).toFixed(2),
    winRate: fmtPct(player.victoryRate),
  };
}

async function paintPlayerPremiumBackground(ctx, canvas) {
  try {
    const bg = await loadImage(assetPath('PlayerCardTemplate', 'PlayerCardTemplate.png'));
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  } catch {
    ctx.fillStyle = '#07142c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0b2d70');
    grad.addColorStop(1, '#020716');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const bottom = ctx.createLinearGradient(0, 560, 0, canvas.height);
  bottom.addColorStop(0, 'rgba(2, 8, 24, 0)');
  bottom.addColorStop(0.42, 'rgba(2, 8, 24, .72)');
  bottom.addColorStop(1, 'rgba(2, 8, 24, .94)');
  ctx.fillStyle = bottom;
  ctx.fillRect(0, 560, canvas.width, canvas.height - 560);
}

async function createPlayerPremiumFullShareBlob(player) {
  const stats = playerSeasonShareStats(player);
  const canvas = document.createElement('canvas');
  canvas.width = 1056;
  canvas.height = 1536;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponible');
  const { textFit, panel } = drawPremiumCardHelpers(ctx);
  await paintPlayerPremiumBackground(ctx, canvas);

  try {
    const avatar = await loadImage(avatarFor(player));
    drawImageContain(ctx, avatar, 150, 130, 756, 800);
  } catch {}

  panel(56, 176, 248, 196, .86);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffd55c';
  ctx.font = '950 90px Inter, Arial, sans-serif';
  ctx.fillText(String(stats.overall.base), 86, 270);
  ctx.textAlign = 'right';
  ctx.fillStyle = Number(stats.overall.delta || 0) >= 0 ? '#52e58e' : '#ff6969';
  ctx.font = '900 32px Inter, Arial, sans-serif';
  ctx.fillText(`${Number(stats.overall.delta || 0) >= 0 ? '+' : ''}${stats.overall.delta}`, 286, 220);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '850 34px Inter, Arial, sans-serif';
  ctx.fillText(stats.positions[0] || '—', 88, 330);

  if (stats.badges.length) {
    panel(754, 176, 246, 82, .68);
    ctx.textAlign = 'center';
    ctx.font = '900 34px Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Inter, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    const gap = 42;
    const totalWidth = (stats.badges.length - 1) * gap;
    const startX = 877 - totalWidth / 2;
    stats.badges.forEach((badge, index) => ctx.fillText(badge, startX + index * gap, 228));
  }

  const firstName = String(player.displayName || '').trim().split(/\s+/)[0] || player.displayName;
  textFit(firstName.toUpperCase(), 528, 940, 820, 78, 950, '#ffffff');
  textFit(currentSeasonDisplay(), 528, 992, 220, 34, 850, '#ffd55c');

  panel(98, 1036, 860, 126, .62);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd55c';
  ctx.font = '900 26px Inter, Arial, sans-serif';
  ctx.fillText('CLASSEMENT', 528, 1078);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 28px Inter, Arial, sans-serif';
  ctx.fillText(`Général : ${ordinal(player.classement)}`, 300, 1130);
  ctx.fillText(`Ballon d'or : ${stats.ballon.rank ? ordinal(stats.ballon.rank) : '—'}`, 760, 1130);

  const statGrid = [
    ['J', player.matchesPlayed], ['PTS', player.points], ['BUTS', player.goals], ['PASSES', player.assists],
    ['%V', stats.winRate], ['MVP', player.mvps], ['V/N/D', `${player.wins}/${player.draws}/${player.losses}`], ['DIFF', signed(player.goalDifference)],
  ];
  statGrid.forEach(([label, value], index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const x = 98 + col * 215;
    const y = 1190 + row * 132;
    panel(x, y, 184, 104, .58);
    ctx.fillStyle = '#ffffff';
    ctx.font = '750 22px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + 92, y + 34);
    ctx.fillStyle = '#ffd55c';
    ctx.font = '950 40px Inter, Arial, sans-serif';
    ctx.fillText(String(value ?? 0), x + 92, y + 82);
  });
  return blobFromCanvas(canvas);
}

async function createPlayerPremiumCompactShareBlob(player) {
  const stats = playerSeasonShareStats(player);
  const canvas = document.createElement('canvas');
  canvas.width = 1056;
  canvas.height = 1536;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponible');
  const { textFit, panel } = drawPremiumCardHelpers(ctx);
  await paintPlayerPremiumBackground(ctx, canvas);

  try {
    const avatar = await loadImage(avatarFor(player));
    drawImageContain(ctx, avatar, 250, 360, 560, 620);
  } catch {}

  panel(74, 190, 228, 180, .86);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffd55c';
  ctx.font = '950 96px Inter, Arial, sans-serif';
  ctx.fillText(String(stats.overall.rating), 100, 284);
  ctx.textAlign = 'right';
  ctx.fillStyle = Number(stats.overall.delta || 0) >= 0 ? '#52e58e' : '#ff6969';
  ctx.font = '900 30px Inter, Arial, sans-serif';
  ctx.fillText(`${Number(stats.overall.delta || 0) >= 0 ? '+' : ''}${stats.overall.delta}`, 278, 228);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '850 34px Inter, Arial, sans-serif';
  ctx.fillText(stats.positions[0] || '—', 102, 332);

  const firstName = String(player.displayName || '').trim().split(/\s+/)[0] || player.displayName;
  textFit(firstName.toUpperCase(), 528, 1022, 850, 80, 950, '#ffffff');
  textFit(currentSeasonDisplay(), 528, 1078, 260, 34, 850, '#ffd55c');

  const topStats = [
    ['J', player.matchesPlayed], ['PTS', player.points], ['B+A', stats.involvement],
    ['MVP', player.mvps], ['BO', stats.ballon.rank ? `#${stats.ballon.rank}` : '—'], ['GÉN', ordinal(player.classement)],
  ];
  topStats.forEach(([label, value], index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = 116 + col * 285;
    const y = 1166 + row * 132;
    panel(x, y, 240, 104, .60);
    ctx.fillStyle = '#ffffff';
    ctx.font = '750 23px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + 120, y + 34);
    ctx.fillStyle = '#ffd55c';
    ctx.font = '950 44px Inter, Arial, sans-serif';
    ctx.fillText(String(value ?? 0), x + 120, y + 82);
  });

  return blobFromCanvas(canvas);
}

async function createPlayerShareItems(player) {
  const safeName = normalizeString(player.displayName);
  const season = currentSeasonDisplay().replace('/', '-');
  const full = await createPlayerPremiumFullShareBlob(player);
  return [
    { blob: full, filename: `cov-fiche-joueur-${safeName}-${season}.png` },
  ];
}

async function sharePlayer(playerId) {
  const player = playerById(playerId);
  if (!player) return;
  const items = await createPlayerShareItems(player);
  await shareNamedBlobs(items, 'C.O.V', `Fiche joueur ${player.displayName}`);
}

async function downloadPlayer(playerId) {
  const player = playerById(playerId);
  if (!player) return;
  const items = await createPlayerShareItems(player);
  await downloadShareItems(items);
}


function attachMatchDialogInteractions() {
  els.matchDialogBody.querySelectorAll('[data-match-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.matchDetailMode = btn.dataset.matchView;
      const match = matches().find((item) => item.matchId === state.activeMatchId);
      if (!match) return;
      els.matchDialogBody.innerHTML = matchDetailMarkup(match);
      attachMatchDialogInteractions();
    });
  });

  els.matchDialogBody.querySelectorAll('[data-compo-toggle-dialog]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.compoMode = state.compoMode === 'field' ? 'simple' : 'field';
      const match = matches().find((item) => item.matchId === state.activeMatchId);
      if (!match) return;
      els.matchDialogBody.innerHTML = matchDetailMarkup(match);
      attachMatchDialogInteractions();
    });
  });

  els.matchDialogBody.querySelectorAll('[data-share-match]').forEach((btn) => {
    btn.addEventListener('click', () => shareMatch(btn.dataset.shareMatch));
  });
  els.matchDialogBody.querySelectorAll('[data-share-match-bundle]').forEach((btn) => {
    btn.addEventListener('click', () => shareMatchBundle(btn.dataset.shareMatchBundle));
  });
  els.matchDialogBody.querySelectorAll('[data-share-compo-source]').forEach((btn) => {
    btn.addEventListener('click', () => shareCompoFromSource(btn.dataset.shareCompoSource));
  });
}


function openModelInfoDialog() {
  els.featureDialogTitle.textContent = 'Référence des postes';
  els.featureDialogBody.innerHTML = `
    <section class="card">
      <div class="card-body model-info-body">
        <img class="model-info-image" src="${assetPath('ModelCompo', 'ModelCompo.png')}" alt="Modèle des postes disponibles" />
      </div>
    </section>
  `;
  els.featureDialog.showModal();
}

function captureScrollState() {
  const memory = { __windowY: window.scrollY || document.documentElement.scrollTop || 0, __windowX: window.scrollX || document.documentElement.scrollLeft || 0 };
  els.viewMount.querySelectorAll('[data-preserve-scroll-key]').forEach((el) => {
    const key = el.dataset.preserveScrollKey;
    if (!key) return;
    memory[key] = { top: el.scrollTop, left: el.scrollLeft };
  });
  return memory;
}

function restoreScrollState(memory = {}) {
  const { __windowY = 0, __windowX = 0, ...areas } = memory || {};
  window.scrollTo(__windowX, __windowY);
  els.viewMount.querySelectorAll('[data-preserve-scroll-key]').forEach((el) => {
    const key = el.dataset.preserveScrollKey;
    const saved = areas[key];
    if (!saved) return;
    el.scrollTop = saved.top || 0;
    el.scrollLeft = saved.left || 0;
  });
}

function rerenderPreservePageScroll() {
  const memory = captureScrollState();
  renderCurrentView();
  requestAnimationFrame(() => {
    restoreScrollState(memory);
    requestAnimationFrame(() => restoreScrollState(memory));
  });
}

function renderSeasonDialog() {
  const seasonIndex = state.root?.seasonIndex?.seasons ?? [];
  els.seasonList.innerHTML = seasonIndex.map((season) => `
    <button class="chip-btn ${season.id === state.activeSeasonId ? 'active' : ''}" data-season-id="${season.id}" type="button">${season.displayName}</button>
  `).join('');
  els.seasonList.querySelectorAll('[data-season-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (state.activeSeasonId === btn.dataset.seasonId) {
        els.seasonDialog.close();
        return;
      }
      state.activeSeasonId = btn.dataset.seasonId;
      resetCoachEditors();
      resetAdminElevenState();
      els.seasonDialog.close();
      renderCurrentView();
    });
  });
}

function attachSearchHandler() {}

function attachBootInteractions() {
  els.viewMount.querySelectorAll('[data-boot-role="player"]').forEach((btn) => btn.addEventListener('click', () => {
    state.userMode = 'player';
    state.activeSeasonId = state.root?.seasonIndex?.activeSeasonId || state.activeSeasonId;
    persistRole();
    state.activeView = 'home';
    renderCurrentView();
  }));
  els.viewMount.querySelectorAll('[data-open-secure]').forEach((btn) => btn.addEventListener('click', () => {
    state.bootAccessRole = btn.dataset.openSecure || 'coach';
    state.bootCoachOpen = true;
    state.coachCodeError = '';
    state.coachCodeInput = '';
    renderCurrentView();
  }));
  els.viewMount.querySelectorAll('[data-close-coach]').forEach((btn) => btn.addEventListener('click', () => {
    state.bootCoachOpen = false;
    state.coachCodeInput = '';
    state.coachCodeError = '';
    renderCurrentView();
  }));
  const input = document.getElementById('coachCodeInput');
  if (input) input.addEventListener('input', (e) => { state.coachCodeInput = e.target.value; });
  els.viewMount.querySelectorAll('[data-submit-coach]').forEach((btn) => btn.addEventListener('click', () => {
    const role = state.bootAccessRole || 'coach';
    const expected = role === 'president'
      ? String(state.root?.appConfig?.presidentCode || state.root?.appConfig?.adminCode || '')
      : String(state.root?.appConfig?.coachCode || '');
    if (String(state.coachCodeInput).trim() === expected) {
      state.userMode = role === 'president' ? 'president' : 'coach';
      state.activeSeasonId = state.root?.seasonIndex?.activeSeasonId || state.activeSeasonId;
      resetCoachEditors();
      state.bootCoachOpen = false;
      state.coachCodeInput = '';
      state.coachCodeError = '';
      persistRole();
      state.activeView = 'home';
      renderCurrentView();
    } else {
      state.coachCodeError = 'Code incorrect';
      renderCurrentView();
    }
  }));
}

function bumpScoreMap(team, kind, playerId, delta) {
  const target = team === 'yellow'
    ? (kind === 'goal' ? state.scoreYellowGoals : state.scoreYellowAssists)
    : (kind === 'goal' ? state.scoreBlueGoals : state.scoreBlueAssists);
  target[playerId] = Math.max(0, Number(target[playerId] || 0) + delta);
  if (!target[playerId]) delete target[playerId];
}

function resetScoreEditors() {
  state.scoreYellowGoals = null;
  state.scoreYellowAssists = null;
  state.scoreBlueGoals = null;
  state.scoreBlueAssists = null;
  state.scoreYellowMvpId = '';
  state.scoreBlueMvpId = '';
  state.lastScoreAnchor = null;
}

function matchFromCurrentEditors(target) {
  const yellowGoals = buildGoalsArrayFromCounts(state.scoreYellowGoals || {}, state.scoreYellowAssists || {});
  const blueGoals = buildGoalsArrayFromCounts(state.scoreBlueGoals || {}, state.scoreBlueAssists || {});
  const yellowSlots = state.coachYellowSlots || normalizeDetailedSlots(target.yellowSlots, target.yellowLines, target.teamYellowPlayerIds || []);
  const blueSlots = state.coachBlueSlots || normalizeDetailedSlots(target.blueSlots, target.blueLines, target.teamBluePlayerIds || []);
  return {
    ...target,
    yellowSlots,
    blueSlots,
    yellowLines: legacyLinesFromDetailedSlots(yellowSlots),
    blueLines: legacyLinesFromDetailedSlots(blueSlots),
    teamYellowPlayerIds: flattenDetailedSlots(yellowSlots),
    teamBluePlayerIds: flattenDetailedSlots(blueSlots),
    presences: [...(target.presences || [])],
    yellowGoals,
    blueGoals,
    yellowScore: yellowGoals.length,
    blueScore: blueGoals.length,
    yellowMvpPlayerId: state.scoreYellowMvpId || '',
    blueMvpPlayerId: state.scoreBlueMvpId || '',
  };
}

function attachCoachInteractions() {
  ensureCoachEditors();
  const target = currentEditableMatch();
  els.viewMount.querySelectorAll('[data-complete-step]').forEach((btn) => btn.addEventListener('click', () => {
    if (btn.disabled) return;
    state.completeMatchStep = btn.dataset.completeStep;
    renderCurrentView();
  }));
  els.viewMount.querySelectorAll('[data-toggle-presence]').forEach((btn) => btn.addEventListener('click', () => {
    const listEl = els.viewMount.querySelector('.coach-presence-list');
    state.presenceScrollTop = listEl ? listEl.scrollTop : 0;
    const id = btn.dataset.togglePresence;
    const current = state.coachPresenceEdits[id] || 'pending';
    state.coachPresenceEdits[id] = nextPresenceStatus(current);
    if (state.coachPresenceEdits[id] !== 'present') {
      state.coachYellowEdits = (state.coachYellowEdits || []).filter((pid) => pid !== id);
      state.coachBlueEdits = (state.coachBlueEdits || []).filter((pid) => pid !== id);
    }
    renderCurrentView();
  }));
  els.viewMount.querySelectorAll('[data-save-presence]').forEach((btn) => btn.addEventListener('click', async () => {
    const updated = playersInMatch(target).sort((a,b)=>normalizeString(a.displayName).localeCompare(normalizeString(b.displayName))).map((player) => createPresenceRow(player.playerId, state.coachPresenceEdits[player.playerId] || 'pending'));
    const present = new Set(updated.filter((x) => x.present).map((x) => x.playerId));
    COMPO_POSITION_OPTIONS.forEach((position) => {
      if (state.coachYellowSlots?.[position] && !present.has(state.coachYellowSlots[position])) state.coachYellowSlots[position] = '';
      if (state.coachBlueSlots?.[position] && !present.has(state.coachBlueSlots[position])) state.coachBlueSlots[position] = '';
    });
    const patch = {
      presences: updated,
      teamYellowPlayerIds: flattenDetailedSlots(state.coachYellowSlots),
      teamBluePlayerIds: flattenDetailedSlots(state.coachBlueSlots),
      yellowLines: legacyLinesFromDetailedSlots(state.coachYellowSlots),
      blueLines: legacyLinesFromDetailedSlots(state.coachBlueSlots),
      yellowSlots: state.coachYellowSlots,
      blueSlots: state.coachBlueSlots
    };
    if (state.editingMatchId) await saveHistoricalMatch(state.editingMatchId, patch, { reaggregate: false, rebuildContributions: false });
    else await saveDraftPatch(patch);
    resetCoachEditors();
    resetScoreEditors();
    state.completeMatchStep = present.size ? 'compo' : 'presence';
    renderCurrentView();
  }));
  els.viewMount.querySelectorAll('[data-select-slot]').forEach((btn) => btn.addEventListener('click', () => { state.coachSelectedLane = btn.dataset.selectSlot; rerenderPreservePageScroll(); }));
  els.viewMount.querySelectorAll('[data-assign-slot-team]').forEach((btn) => btn.addEventListener('click', () => {
    assignPlayerToSlot(btn.dataset.playerId, btn.dataset.assignSlotTeam, state.coachSelectedLane || 'GB');
    rerenderPreservePageScroll();
  }));
  els.viewMount.querySelectorAll('[data-unassign-player]').forEach((btn) => btn.addEventListener('click', () => {
    unassignPlayer(btn.dataset.unassignPlayer);
    rerenderPreservePageScroll();
  }));
  els.viewMount.querySelectorAll('[data-reset-compo]').forEach((btn) => btn.addEventListener('click', () => {
    state.coachYellowSlots = emptyDetailedSlots();
    state.coachBlueSlots = emptyDetailedSlots();
    renderCurrentView();
  }));
  els.viewMount.querySelectorAll('[data-save-compo]').forEach((btn) => btn.addEventListener('click', async () => {
    const patch = {
      teamYellowPlayerIds: flattenDetailedSlots(state.coachYellowSlots),
      teamBluePlayerIds: flattenDetailedSlots(state.coachBlueSlots),
      yellowLines: legacyLinesFromDetailedSlots(state.coachYellowSlots),
      blueLines: legacyLinesFromDetailedSlots(state.coachBlueSlots),
      yellowSlots: state.coachYellowSlots,
      blueSlots: state.coachBlueSlots
    };
    if (state.editingMatchId) await saveHistoricalMatch(state.editingMatchId, patch, { reaggregate: false, rebuildContributions: false });
    else await saveDraftPatch(patch);
    resetCoachEditors();
    state.completeMatchStep = isPresident() ? 'score' : 'menu';
    renderCurrentView();
  }));
  els.viewMount.querySelectorAll('[data-score-op]').forEach((btn) => btn.addEventListener('click', () => {
    const op = btn.dataset.scoreOp;
    const team = btn.dataset.scoreTeam;
    const id = btn.dataset.playerId;
    state.lastScoreAnchor = `${team}:${id}`;
    if (op === 'plus-goal') bumpScoreMap(team, 'goal', id, 1);
    if (op === 'minus-goal') bumpScoreMap(team, 'goal', id, -1);
    if (op === 'plus-assist') bumpScoreMap(team, 'assist', id, 1);
    if (op === 'minus-assist') bumpScoreMap(team, 'assist', id, -1);
    rerenderPreservePageScroll();
  }));
  els.viewMount.querySelectorAll('[data-select-mvp]').forEach((btn) => btn.addEventListener('click', () => {
    const [team, id] = btn.dataset.selectMvp.split(':');
    if (team === 'yellow') state.scoreYellowMvpId = state.scoreYellowMvpId === id ? '' : id;
    else state.scoreBlueMvpId = state.scoreBlueMvpId === id ? '' : id;
    rerenderPreservePageScroll();
  }));
  els.viewMount.querySelectorAll('[data-petit-terrain]').forEach((btn) => btn.addEventListener('click', () => {
    const yellowIds = target?.teamYellowPlayerIds || [];
    const blueIds = target?.teamBluePlayerIds || [];
    state.scoreYellowGoals = Object.fromEntries(yellowIds.map((id) => [id, 1]));
    state.scoreYellowAssists = Object.fromEntries(yellowIds.map((id) => [id, 1]));
    state.scoreBlueGoals = Object.fromEntries(blueIds.map((id) => [id, 1]));
    state.scoreBlueAssists = Object.fromEntries(blueIds.map((id) => [id, 1]));
    state.scoreYellowMvpId = '';
    state.scoreBlueMvpId = '';
    rerenderPreservePageScroll();
  }));
  els.viewMount.querySelectorAll('[data-save-score]').forEach((btn) => btn.addEventListener('click', async () => {
    const updatedMatch = matchFromCurrentEditors(target);
    if (state.editingMatchId) await saveHistoricalMatch(state.editingMatchId, updatedMatch, { reaggregate: false, rebuildContributions: false });
    else await saveDraftPatch(updatedMatch);
    renderCurrentView();
  }));
  els.viewMount.querySelectorAll('[data-close-match]').forEach((btn) => btn.addEventListener('click', async () => {
    const updatedMatch = matchFromCurrentEditors(target);
    if (state.editingMatchId) {
      await saveHistoricalMatch(state.editingMatchId, { ...updatedMatch, statsApplied: true, closedAt: Date.now() }, { reaggregate: true, rebuildContributions: true });
      state.activeView = 'modifyMatches';
      state.editingMatchId = null;
    } else {
      await closeCurrentMatch(updatedMatch);
      state.activeView = 'home';
    }
    state.completeMatchStep = 'presence';
    resetScoreEditors();
    renderCurrentView();
  }));
  els.viewMount.querySelectorAll('[data-delete-match]').forEach((btn) => btn.addEventListener('click', async () => {
    await deleteHistoricalMatch(btn.dataset.deleteMatch);
    state.activeView = 'modifyMatches';
    state.editingMatchId = null;
    resetScoreEditors();
    renderCurrentView();
  }));
  els.viewMount.querySelectorAll('[data-skip-match]').forEach((btn) => btn.addEventListener('click', async () => {
    await skipUpcomingMatch();
    state.activeView = 'home';
    resetScoreEditors();
    renderCurrentView();
  }));
}

function renderCurrentView() {
  if (!state.authReady) {
    els.viewMount.innerHTML = '';
    els.viewMount.appendChild(cloneTemplate(els.loadingTemplate));
    updateHeader();
    return;
  }

  if (!state.root) {
    els.viewMount.innerHTML = '';
    els.viewMount.appendChild(cloneTemplate(els.loadingTemplate));
    updateHeader();
    return;
  }

  renderSeasonDialog();

  let html = '';
  if (!state.userMode) html = renderBoot();
  else if (state.activeView === 'home') html = renderHome();
  else if (state.activeView === 'players') html = renderPlayers();
  else if (state.activeView === 'results') html = renderResults();
  else if (state.activeView === 'compo') html = renderCompo();
  else if (state.activeView === 'ranking') html = renderRanking();
  else if (state.activeView === 'trophy') html = renderTrophy();
  else if (state.activeView === 'ballonor') html = renderBallonOr();
  else if (state.activeView === 'admin') html = renderAdmin();
  else if (state.activeView === 'elevenmanage') html = renderElevenManage();
  else if (state.activeView === 'modifyMatches') html = renderModifyMatches();
  else if (state.activeView === 'completeMatch') html = renderCompleteMatch();

  els.viewMount.innerHTML = html;
  updateHeader();
  if (els.backTopBtn && state.activeView === 'home') {
    els.backTopBtn.hidden = true;
    els.backTopBtn.classList.remove('visible');
  }

  if (!state.userMode) attachBootInteractions();

  if (state.activeView === 'ranking') {
    els.viewMount.querySelectorAll('[data-ranking-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (state.rankingMode === btn.dataset.rankingMode) return;
        state.rankingMode = btn.dataset.rankingMode;
        rerenderPreservePageScroll();
      });
    });
  }

  if (state.activeView === 'compo') {
    els.viewMount.querySelectorAll('[data-compo-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.compoMode = state.compoMode === 'field' ? 'simple' : 'field';
        rerenderPreservePageScroll();
      });
    });
  }

  if (state.activeView === 'completeMatch') {
    if (canCompleteMatch()) attachCoachInteractions();
    if (state.completeMatchStep === 'presence') {
      const listEl = els.viewMount.querySelector('.coach-presence-list');
      if (listEl) requestAnimationFrame(() => { listEl.scrollTop = state.presenceScrollTop || 0; });
    }
  }

  if (state.activeView === 'admin') {
    attachAdminInteractions();
  }
  if (state.activeView === 'elevenmanage') {
    attachElevenManagerInteractions();
  }
  if (state.activeView === 'trophy') {
    els.viewMount.querySelectorAll('[data-open-trophy]').forEach((btn) => btn.addEventListener('click', () => openTrophyDetail(btn.dataset.openTrophy)));
  }
  if (state.activeView === 'ballonor') {
    attachBallonOrInteractions();
  } else if (state.ballonOrTimer) {
    clearTimeout(state.ballonOrTimer);
    state.ballonOrTimer = null;
  }

  els.viewMount.querySelectorAll('[data-view-switch]').forEach((btn) => btn.addEventListener('click', () => setView(btn.dataset.viewSwitch)));
  els.viewMount.querySelectorAll('[data-open-feature]').forEach((btn) => btn.addEventListener('click', () => openFeature(btn.dataset.openFeature)));
  els.viewMount.querySelectorAll('[data-open-model-info]').forEach((btn) => btn.addEventListener('click', () => openModelInfoDialog()));
  els.viewMount.querySelectorAll('[data-open-install]').forEach((btn) => btn.addEventListener('click', () => showInstallDialog()));
  els.viewMount.querySelectorAll('[data-results-filter]').forEach((btn) => btn.addEventListener('click', () => { state.resultsFilter = btn.dataset.resultsFilter; rerenderPreservePageScroll(); }));
  els.viewMount.querySelectorAll('[data-edit-match]').forEach((btn) => btn.addEventListener('click', () => openCompleteMatch(btn.dataset.editMatch)));
  els.viewMount.querySelectorAll('[data-save-match-day]').forEach((btn) => btn.addEventListener('click', async () => {
    const input = els.viewMount.querySelector('[data-match-date-input]');
    const iso = input?.value || currentUpcomingInfo().dateIso;
    if (!iso) return;
    const [year, month, day] = iso.split('-');
    await saveDraftPatch({ dateIso: iso, dateLabel: `${day}/${month}/${year}` });
    renderCurrentView();
  }));

  attachPlayerTriggers(els.viewMount);
  attachMatchTriggers(els.viewMount);
  els.viewMount.querySelectorAll('[data-share-compo-source]').forEach((btn) => {
    btn.addEventListener('click', () => shareCompoFromSource(btn.dataset.shareCompoSource));
  });
  els.viewMount.querySelectorAll('[data-share-match-bundle]').forEach((btn) => {
    btn.addEventListener('click', () => shareMatchBundle(btn.dataset.shareMatchBundle));
  });
  if (state.lastScoreAnchor) {
    const anchor = els.viewMount.querySelector(`[data-score-anchor="${state.lastScoreAnchor}"]`);
    if (anchor) requestAnimationFrame(() => anchor.scrollIntoView({ block: 'center', behavior: 'instant' }));
  }
  els.viewMount.querySelectorAll('[data-logout]').forEach((btn)=>btn.addEventListener('click', ()=>{ state.userMode = null; persistRole(); state.activeView='home'; resetCoachEditors(); resetAdminElevenState(false); renderCurrentView(); }));
}


function showFirebaseBanner(show) {
  els.firebaseBanner.hidden = !show;
}

function setView(viewName) {
  const previousView = state.activeView;
  if ((viewName === 'admin' || viewName === 'elevenmanage') && !isPresident()) {
    viewName = 'home';
  }
  if (viewName === 'completeMatch') {
    openCompleteMatch();
    return;
  }
  if (viewName === 'ballonor' && previousView !== 'ballonor') {
    if (state.ballonOrTimer) clearTimeout(state.ballonOrTimer);
    state.ballonOrTimer = null;
    state.ballonOrIndex = 0;
    state.ballonOrPaused = false;
  }
  state.activeView = viewName;
  if (viewName !== 'completeMatch') {
    state.editingMatchId = null;
    resetScoreEditors();
  }
  renderCurrentView();
}

function openCompleteMatch(matchId = null) {
  if (!canCompleteMatch()) return;
  state.editingMatchId = matchId || null;
  resetCoachEditors();
  resetScoreEditors();
  state.completeMatchStep = 'presence';
  state.activeView = 'completeMatch';
  renderCurrentView();
}
els.seasonBtn?.addEventListener('click', (event) => event.preventDefault());
els.headerHomeBtn?.addEventListener('click', () => {
  if (!state.userMode) return;
  setView('home');
});
navButtons.forEach((btn) => btn.addEventListener('click', () => setView(btn.dataset.view)));

restoreRole();

const cachedRoot = loadCachedRoot();
if (cachedRoot) {
  state.root = cachedRoot;
  state.activeSeasonId = cachedRoot.seasonIndex?.activeSeasonId || 'saison_25_26';
  showFirebaseBanner(false);
}
renderCurrentView();

async function bootFirebase() {
  try {
    const auth = getAuth(app);
    await signInAnonymously(auth);
    state.authReady = true;
    renderCurrentView();
    onValue(ref(db, '/'), (snapshot) => {
      const value = snapshot.val();
      if (!value) {
        state.hasFirebaseError = true;
        showFirebaseBanner(true);
        if (!state.root) {
          els.viewMount.innerHTML = '';
          els.viewMount.appendChild(cloneTemplate(els.errorTemplate));
        }
        return;
      }
      state.root = value;
      cacheRoot(value);
      state.activeSeasonId = state.activeSeasonId || value.seasonIndex?.activeSeasonId || 'saison_25_26';
      state.hasFirebaseError = false;
      state.lastUpdated = new Date();
      showFirebaseBanner(false);
      renderCurrentView();
    }, () => {
      state.hasFirebaseError = true;
      showFirebaseBanner(true);
      if (!state.root) {
        els.viewMount.innerHTML = '';
        els.viewMount.appendChild(cloneTemplate(els.errorTemplate));
      }
    });
  } catch (error) {
    state.authReady = true;
    state.hasFirebaseError = true;
    showFirebaseBanner(true);
    if (!state.root) {
      els.viewMount.innerHTML = '';
      els.viewMount.appendChild(cloneTemplate(els.errorTemplate));
    }
  }
}

bootFirebase();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const activeSeason = state.root?.seasonIndex?.activeSeasonId;
  if (activeSeason && state.activeSeasonId !== activeSeason) {
    state.activeSeasonId = activeSeason;
    resetCoachEditors();
    resetAdminElevenState();
    renderCurrentView();
  }
});

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  state.deferredInstallPrompt = event;
});

window.addEventListener('scroll', () => {
  if (!els.backTopBtn) return;
  const shouldShow = window.scrollY > 420 && !!state.userMode && state.activeView !== 'home';
  els.backTopBtn.hidden = !shouldShow;
  els.backTopBtn.classList.toggle('visible', shouldShow);
});

els.backTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
