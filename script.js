/* ===================================================
   GPA Calculator — script.js
   =================================================== */

const GRADE_POINTS = {
  'S': 10, 'A+': 9, 'A': 8.5, 'B+': 8,
  'B': 7.5, 'C+': 7, 'C': 6.5, 'D': 6, 'P': 5.5, 'F': 0
};

const STORAGE_KEY = 'gpacalc-data';
let semesterCount = 0;
let dragSrcCard = null;

/* ── DOM refs ── */
const semestersContainer  = document.getElementById('semestersContainer');
const addSemBtn           = document.getElementById('addSemBtn');
const calculateAllBtn     = document.getElementById('calculateAllBtn');
const resultsPanel        = document.getElementById('resultsPanel');
const resultsContent      = document.getElementById('resultsContent');
const clearResultsBtn     = document.getElementById('clearResultsBtn');
const cgpaDisplay         = document.getElementById('cgpaDisplay');
const totalSemsDisplay    = document.getElementById('totalSems');
const totalCreditsDisplay = document.getElementById('totalCreditsDisplay');
const themeToggle         = document.getElementById('themeToggle');
const iconSun             = document.getElementById('iconSun');
const iconMoon            = document.getElementById('iconMoon');
const gradeRefBtn         = document.getElementById('gradeRefBtn');
const gradeModal          = document.getElementById('gradeModal');
const modalClose          = document.getElementById('modalClose');

/* ── Theme ── */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  iconSun.style.display  = theme === 'light' ? 'none' : '';
  iconMoon.style.display = theme === 'light' ? '' : 'none';
}

applyTheme(localStorage.getItem('gpacalc-theme') || 'dark');

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('gpacalc-theme', next);
});

/* ── Grade Modal ── */
gradeRefBtn.addEventListener('click', () => gradeModal.classList.add('open'));
modalClose.addEventListener('click',  () => gradeModal.classList.remove('open'));
gradeModal.addEventListener('click',  e => { if (e.target === gradeModal) gradeModal.classList.remove('open'); });

/* ── Grade Options HTML ── */
function gradeOptionsHTML(selected = 'S') {
  return Object.keys(GRADE_POINTS)
    .map(g => `<option value="${g}" ${g === selected ? 'selected' : ''}>${g}</option>`)
    .join('');
}

/* ── Save to localStorage ── */
function saveState() {
  const cards = semestersContainer.querySelectorAll('.semester-card');
  const data = [];
  cards.forEach(card => {
    const subjects = [];
    card.querySelectorAll('.subject-row').forEach(row => {
      subjects.push({
        name:   row.querySelector('input[type="text"]').value,
        grade:  row.querySelector('select').value,
        credit: row.querySelector('input[type="number"]').value
      });
    });
    data.push({
      name: card.querySelector('.sem-name-input').value,
      subjects
    });
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ── Load from localStorage ── */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ── Create Subject Row ── */
function createSubjectRow(name = '', grade = 'S', credit = '') {
  const row = document.createElement('div');
  row.classList.add('subject-row');
  row.innerHTML = `
    <input type="text" placeholder="Subject name" value="${name}" />
    <select>${gradeOptionsHTML(grade)}</select>
    <input type="number" placeholder="Credits" min="0.5" step="0.5" value="${credit}" />
    <button class="delete-row-btn" title="Remove subject">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <line x1="1" y1="1" x2="11" y2="11"/>
        <line x1="11" y1="1" x2="1" y2="11"/>
      </svg>
    </button>
  `;

  row.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', saveState);
    el.addEventListener('input', saveState);
  });

  row.querySelector('.delete-row-btn').addEventListener('click', () => {
    const container = row.closest('.subjects-container');
    if (container.querySelectorAll('.subject-row').length <= 1) {
      showToast('At least one subject is required.');
      return;
    }
    row.remove();
    saveState();
  });

  return row;
}

/* ── Drag & Drop ── */
function addDragEvents(card) {
  const handle = card.querySelector('.drag-handle');

  /* Mouse drag — only activate draggable on handle mousedown */
  handle.addEventListener('mousedown', () => { card.draggable = true; });
  document.addEventListener('mouseup', () => { card.draggable = false; }, { passive: true });

  card.addEventListener('dragstart', e => {
    dragSrcCard = card;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  card.addEventListener('dragend', () => {
    card.draggable = false;
    card.classList.remove('dragging');
    dragSrcCard = null;
    semestersContainer.querySelectorAll('.semester-card').forEach(c => c.classList.remove('drag-over'));
    saveState();
  });

  card.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dragSrcCard || dragSrcCard === card) return;
    semestersContainer.querySelectorAll('.semester-card').forEach(c => c.classList.remove('drag-over'));
    card.classList.add('drag-over');
  });

  card.addEventListener('dragleave', e => {
    if (!card.contains(e.relatedTarget)) card.classList.remove('drag-over');
  });

  card.addEventListener('drop', e => {
    e.preventDefault();
    if (!dragSrcCard || dragSrcCard === card) return;
    card.classList.remove('drag-over');
    const allCards = [...semestersContainer.querySelectorAll('.semester-card')];
    const srcIdx  = allCards.indexOf(dragSrcCard);
    const destIdx = allCards.indexOf(card);
    if (srcIdx < destIdx) {
      semestersContainer.insertBefore(dragSrcCard, card.nextSibling);
    } else {
      semestersContainer.insertBefore(dragSrcCard, card);
    }
    saveState();
  });

  /* Touch drag */
  let touchDragActive = false;
  let touchTarget = null;

  handle.addEventListener('touchstart', () => {
    touchDragActive = true;
    card.classList.add('dragging');
  }, { passive: true });

  handle.addEventListener('touchmove', e => {
    if (!touchDragActive) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const overCard = el ? el.closest('.semester-card') : null;
    semestersContainer.querySelectorAll('.semester-card').forEach(c => c.classList.remove('drag-over'));
    if (overCard && overCard !== card) {
      overCard.classList.add('drag-over');
      touchTarget = overCard;
    } else {
      touchTarget = null;
    }
  }, { passive: true });

  handle.addEventListener('touchend', () => {
    touchDragActive = false;
    card.classList.remove('dragging');
    semestersContainer.querySelectorAll('.semester-card').forEach(c => c.classList.remove('drag-over'));
    if (touchTarget && touchTarget !== card) {
      const allCards = [...semestersContainer.querySelectorAll('.semester-card')];
      const srcIdx  = allCards.indexOf(card);
      const destIdx = allCards.indexOf(touchTarget);
      if (srcIdx < destIdx) semestersContainer.insertBefore(card, touchTarget.nextSibling);
      else semestersContainer.insertBefore(card, touchTarget);
      touchTarget = null;
      saveState();
    }
  });
}

/* ── Create Semester Card ── */
function createSemesterCard(name = '', subjects = null) {
  semesterCount++;

  const card = document.createElement('div');
  card.classList.add('semester-card');
  card.dataset.semId = semesterCount;

  card.innerHTML = `
    <div class="semester-header">
      <div class="drag-handle" title="Drag to reorder">
        <span></span><span></span><span></span><span></span>
      </div>
      <div class="sem-name-wrap">
        <span class="sem-label">Semester</span>
        <input class="sem-name-input" type="text" placeholder="${semesterCount}" value="${name}" maxlength="10" />
      </div>
      <span class="sem-sgpa-badge" data-sgpa-badge>SGPA —</span>
      <div class="sem-actions">
        <button class="sem-btn add-sub">+ Subject</button>
        <button class="sem-btn calc-sem">Calc SGPA</button>
        <button class="sem-btn delete-sem">Remove</button>
      </div>
    </div>
    <div class="subjects-container">
      <div class="subjects-legend">
        <span class="legend-label">Subject</span>
        <span class="legend-label">Grade</span>
        <span class="legend-label">Credits</span>
        <span></span>
      </div>
    </div>
  `;

  const subjectsContainer = card.querySelector('.subjects-container');

  if (subjects && subjects.length) {
    subjects.forEach(s => subjectsContainer.appendChild(createSubjectRow(s.name, s.grade, s.credit)));
  } else {
    subjectsContainer.appendChild(createSubjectRow());
  }

  /* Name input → save */
  card.querySelector('.sem-name-input').addEventListener('input', saveState);

  /* + Subject */
  card.querySelector('.add-sub').addEventListener('click', () => {
    const newRow = createSubjectRow();
    subjectsContainer.appendChild(newRow);
    newRow.querySelector('input[type="text"]').focus();
    saveState();
  });

  /* Calc SGPA (individual) */
  card.querySelector('.calc-sem').addEventListener('click', () => {
    const result = calcSGPA(card);
    const badge  = card.querySelector('[data-sgpa-badge]');
    if (result.error) {
      showToast(result.error);
      badge.textContent = 'SGPA —';
      badge.classList.remove('has-value');
    } else {
      badge.textContent = `SGPA ${result.sgpa}`;
      badge.classList.add('has-value');
      const rawName = card.querySelector('.sem-name-input').value.trim();
      const label   = 'Semester ' + (rawName || semesterCount);
      showResultsPanel([{ type: 'sgpa', label, value: result.sgpa }]);
    }
  });

  /* Delete semester */
  card.querySelector('.delete-sem').addEventListener('click', () => {
    if (semestersContainer.querySelectorAll('.semester-card').length <= 1) {
      showToast('At least one semester is required.');
      return;
    }
    card.remove();
    updateSummaryBar();
    saveState();
  });

  addDragEvents(card);
  return card;
}

/* ── Calculate SGPA ── */
function calcSGPA(card) {
  const rows = card.querySelectorAll('.subject-row');
  let totalPoints = 0, totalCredits = 0;

  for (const row of rows) {
    const grade  = row.querySelector('select').value;
    const credit = parseFloat(row.querySelector('input[type="number"]').value);
    if (isNaN(credit) || credit <= 0) continue;
    totalPoints  += GRADE_POINTS[grade] * credit;
    totalCredits += credit;
  }

  if (totalCredits === 0) return { error: 'Enter at least one valid credit value.' };
  return {
    sgpa: (totalPoints / totalCredits).toFixed(2),
    credits: totalCredits,
    points: totalPoints
  };
}

/* ── Calculate All ── */
calculateAllBtn.addEventListener('click', () => {
  const cards = semestersContainer.querySelectorAll('.semester-card');
  if (!cards.length) { showToast('Add at least one semester first.'); return; }

  let globalPoints = 0, globalCredits = 0;
  const rows = [];

  for (const card of cards) {
    const result  = calcSGPA(card);
    const rawName = card.querySelector('.sem-name-input').value.trim();
    const label   = 'Semester ' + (rawName || card.dataset.semId);
    const badge   = card.querySelector('[data-sgpa-badge]');

    if (result.error) {
      badge.textContent = 'SGPA —';
      badge.classList.remove('has-value');
      rows.push({ type: 'error', label, value: result.error });
    } else {
      badge.textContent = `SGPA ${result.sgpa}`;
      badge.classList.add('has-value');
      globalPoints  += result.points;
      globalCredits += result.credits;
      rows.push({ type: 'sgpa', label, value: result.sgpa, credits: result.credits });
    }
  }

  if (globalCredits === 0) {
    showToast('No valid data across all semesters.');
    return;
  }

  const cgpa = (globalPoints / globalCredits).toFixed(2);
  rows.unshift({ type: 'cgpa', label: 'CUMULATIVE GPA', value: cgpa });

  cgpaDisplay.textContent         = cgpa;
  totalSemsDisplay.textContent    = cards.length;
  totalCreditsDisplay.textContent = globalCredits;

  showResultsPanel(rows);
});

/* ── Render Results ── */
function showResultsPanel(rows) {
  resultsContent.innerHTML = '';
  rows.forEach(row => {
    const el = document.createElement('div');
    el.classList.add('result-row', `${row.type}-row`);
    let labelText = row.label;
    if (row.type === 'sgpa' && row.credits) labelText += ` · ${row.credits} cr`;
    el.innerHTML = `
      <span class="result-label">${labelText}</span>
      <span class="result-value">${row.value}</span>
    `;
    resultsContent.appendChild(el);
  });
  resultsPanel.classList.add('visible');
  setTimeout(() => resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
}

/* ── Clear Results ── */
clearResultsBtn.addEventListener('click', () => {
  resultsPanel.classList.remove('visible');
  cgpaDisplay.textContent         = '—';
  totalCreditsDisplay.textContent = '—';
  totalSemsDisplay.textContent    = semestersContainer.querySelectorAll('.semester-card').length;
  document.querySelectorAll('[data-sgpa-badge]').forEach(b => {
    b.textContent = 'SGPA —';
    b.classList.remove('has-value');
  });
});

/* ── Summary Bar ── */
function updateSummaryBar() {
  totalSemsDisplay.textContent    = semestersContainer.querySelectorAll('.semester-card').length;
  totalCreditsDisplay.textContent = '—';
}

/* ── Add Semester ── */
addSemBtn.addEventListener('click', () => {
  const card = createSemesterCard();
  semestersContainer.appendChild(card);
  updateSummaryBar();
  saveState();
  setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
});

/* ── Toast ── */
function showToast(msg) {
  const existing = document.querySelector('.gs-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.classList.add('gs-toast');
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s';
    setTimeout(() => toast.remove(), 260);
  }, 2800);
}

/* ── Init ── */
const saved = loadState();
if (saved && saved.length) {
  saved.forEach(s => semestersContainer.appendChild(createSemesterCard(s.name, s.subjects)));
} else {
  semestersContainer.appendChild(createSemesterCard());
}
updateSummaryBar();
