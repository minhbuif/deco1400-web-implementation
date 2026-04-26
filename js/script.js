/*
  Main JavaScript for Piano Dashboard.
  Unique interactions included:
  1. Mobile navigation toggle
  2. Practice timer
  3. Repertoire search and difficulty filter
  4. Notes autosave using localStorage
  5. Creative idea form that adds a new idea card
*/

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return document.querySelectorAll(selector);
}

// Interaction 1: responsive mobile navigation
const navToggle = qs('.nav-toggle');
const mainNav = qs('.main-nav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', function () {
    mainNav.classList.toggle('open');
  });
}

// Interaction 2: practice timer
let timerSeconds = 0;
let timerInterval = null;
const timerDisplay = qs('#timerDisplay');
const startTimer = qs('#startTimer');
const stopTimer = qs('#stopTimer');
const resetTimer = qs('#resetTimer');

function formatTimer(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function updateTimer() {
  if (timerDisplay) {
    timerDisplay.textContent = formatTimer(timerSeconds);
  }
}

if (startTimer) {
  startTimer.addEventListener('click', function () {
    if (timerInterval) return;
    timerInterval = setInterval(function () {
      timerSeconds += 1;
      updateTimer();
    }, 1000);
  });
}

if (stopTimer) {
  stopTimer.addEventListener('click', function () {
    clearInterval(timerInterval);
    timerInterval = null;
  });
}

if (resetTimer) {
  resetTimer.addEventListener('click', function () {
    clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = 0;
    updateTimer();
  });
}

// Interaction 3: repertoire search, filter, and browse carousel
const searchInput = qs('#pieceSearch');
const difficultyFilter = qs('#difficultyFilter');
const pieceCards = qsa('.piece-card[data-title]');
const noResults = qs('#noResults');
const browseCards = Array.from(qsa('.browse-piece'));
const browsePrev = qs('#browsePrev');
const browseNext = qs('#browseNext');
const viewAllBrowse = qs('#viewAllBrowse');
const browseStatus = qs('#browseStatus');
let browseStart = 0;
let browseShowAll = false;

function getBrowsePageSize() {
  if (window.innerWidth < 700) return 1;
  if (window.innerWidth < 980) return 2;
  return 4;
}

function updateBrowseCarousel(resetPosition) {
  if (!browseCards.length) return;

  const matchingCards = browseCards.filter(function (card) {
    return card.dataset.matches !== 'false';
  });
  const pageSize = getBrowsePageSize();

  if (resetPosition) browseStart = 0;
  if (browseStart >= matchingCards.length) {
    browseStart = Math.max(0, matchingCards.length - pageSize);
  }

  browseCards.forEach(function (card) {
    card.style.display = 'none';
  });

  if (browseShowAll) {
    matchingCards.forEach(function (card) {
      card.style.display = 'flex';
    });
    if (browseStatus) browseStatus.textContent = `Showing all ${matchingCards.length} pieces`;
    if (browsePrev) browsePrev.disabled = true;
    if (browseNext) browseNext.disabled = true;
    if (viewAllBrowse) viewAllBrowse.textContent = 'Show Less';
    return;
  }

  const visibleCards = matchingCards.slice(browseStart, browseStart + pageSize);
  visibleCards.forEach(function (card) {
    card.style.display = 'flex';
  });

  const from = matchingCards.length ? browseStart + 1 : 0;
  const to = Math.min(browseStart + pageSize, matchingCards.length);
  if (browseStatus) browseStatus.textContent = `Showing ${from}-${to} of ${matchingCards.length} pieces`;
  if (browsePrev) browsePrev.disabled = browseStart === 0;
  if (browseNext) browseNext.disabled = browseStart + pageSize >= matchingCards.length;
  if (viewAllBrowse) viewAllBrowse.textContent = 'View All';
}

function filterPieces() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const difficulty = difficultyFilter ? difficultyFilter.value : 'all';
  let visibleCount = 0;

  pieceCards.forEach(function (card) {
    const title = card.dataset.title.toLowerCase();
    const composer = card.dataset.composer.toLowerCase();
    const cardDifficulty = card.dataset.difficulty;
    const matchesText = title.includes(query) || composer.includes(query);
    const matchesDifficulty = difficulty === 'all' || cardDifficulty === difficulty;
    const shouldShow = matchesText && matchesDifficulty;
    const isBrowseCard = card.classList.contains('browse-piece');

    card.dataset.matches = shouldShow ? 'true' : 'false';

    if (!isBrowseCard) {
      card.style.display = shouldShow ? 'flex' : 'none';
    }

    if (shouldShow) visibleCount += 1;
  });

  if (noResults) {
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  updateBrowseCarousel(true);
}

if (searchInput) searchInput.addEventListener('input', filterPieces);
if (difficultyFilter) difficultyFilter.addEventListener('change', filterPieces);

if (browsePrev) {
  browsePrev.addEventListener('click', function () {
    browseShowAll = false;
    browseStart = Math.max(0, browseStart - getBrowsePageSize());
    updateBrowseCarousel(false);
  });
}

if (browseNext) {
  browseNext.addEventListener('click', function () {
    browseShowAll = false;
    browseStart += getBrowsePageSize();
    updateBrowseCarousel(false);
  });
}

if (viewAllBrowse) {
  viewAllBrowse.addEventListener('click', function () {
    browseShowAll = !browseShowAll;
    updateBrowseCarousel(false);
  });
}

window.addEventListener('resize', function () {
  updateBrowseCarousel(false);
});

filterPieces();

// Interaction 4: autosave notes on composition / piece pages
const notesArea = qs('#notesArea');
const saveStatus = qs('#saveStatus');
if (notesArea) {
  const storageKey = notesArea.dataset.storageKey || 'piano-notes';
  notesArea.value = localStorage.getItem(storageKey) || '';
  notesArea.addEventListener('input', function () {
    localStorage.setItem(storageKey, notesArea.value);
    if (saveStatus) {
      saveStatus.textContent = 'Notes saved locally';
      setTimeout(function () {
        saveStatus.textContent = 'Autosave is on';
      }, 1200);
    }
  });
}

// Interaction 5: add a new creative idea card
const ideaButton = qs('#newIdeaButton');
const ideaForm = qs('#ideaForm');
const ideaGrid = qs('#ideaGrid');
const ideaTitle = qs('#ideaTitle');
const ideaDate = qs('#ideaDate');

if (ideaButton && ideaForm) {
  ideaButton.addEventListener('click', function () {
    ideaForm.classList.toggle('open');
  });
}

if (ideaForm && ideaGrid) {
  ideaForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const title = ideaTitle.value.trim() || 'New Composition';
    const date = ideaDate.value || new Date().toISOString().slice(0, 10);
    const readableDate = new Date(date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const card = document.createElement('a');
    card.className = 'card image-card';
    card.href = 'composition1.html';
    card.innerHTML = `
      <img src="images/creative-writing.svg" alt="New composition idea">
      <div class="card-body">
        <h3>${title}</h3>
        <p>${readableDate}</p>
      </div>
    `;

    ideaGrid.prepend(card);
    ideaTitle.value = '';
    ideaDate.value = '';
    ideaForm.classList.remove('open');
  });
}

// Interaction 6: sheet music page browser on piece detail page
const sheetPages = [
  'images/liebestraum-1.png',
  'images/liebestraum-2.png',
  'images/liebestraum-3.png',
  'images/liebestraum-4.png',
  'images/liebestraum-5.png',
  'images/liebestraum-6.png'
];
const sheetImage = qs('#sheetImage');
const sheetPageStatus = qs('#sheetPageStatus');
const sheetFirst = qs('#sheetFirst');
const sheetPrev = qs('#sheetPrev');
const sheetNext = qs('#sheetNext');
const sheetPrevBottom = qs('#sheetPrevBottom');
const sheetNextBottom = qs('#sheetNextBottom');
const sheetThumbs = qsa('.sheet-thumb');
let sheetIndex = 0;
function updateSheetPage(newIndex) {
  if (!sheetImage) return;
  sheetIndex = Math.max(0, Math.min(newIndex, sheetPages.length - 1));
  sheetImage.src = sheetPages[sheetIndex];
  sheetImage.alt = `Liebestraum sheet music page ${sheetIndex + 1}`;
  if (sheetPageStatus) sheetPageStatus.textContent = `Page ${sheetIndex + 1} of ${sheetPages.length}`;
  [sheetPrev, sheetPrevBottom, sheetFirst].forEach(function (button) { if (button) button.disabled = sheetIndex === 0; });
  [sheetNext, sheetNextBottom].forEach(function (button) { if (button) button.disabled = sheetIndex === sheetPages.length - 1; });
  sheetThumbs.forEach(function (thumb) { thumb.classList.toggle('active', Number(thumb.dataset.sheetIndex) === sheetIndex); });
}
if (sheetImage) {
  if (sheetFirst) sheetFirst.addEventListener('click', function () { updateSheetPage(0); });
  if (sheetPrev) sheetPrev.addEventListener('click', function () { updateSheetPage(sheetIndex - 1); });
  if (sheetNext) sheetNext.addEventListener('click', function () { updateSheetPage(sheetIndex + 1); });
  if (sheetPrevBottom) sheetPrevBottom.addEventListener('click', function () { updateSheetPage(sheetIndex - 1); });
  if (sheetNextBottom) sheetNextBottom.addEventListener('click', function () { updateSheetPage(sheetIndex + 1); });
  sheetThumbs.forEach(function (thumb) { thumb.addEventListener('click', function () { updateSheetPage(Number(thumb.dataset.sheetIndex)); }); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') updateSheetPage(sheetIndex - 1);
    if (event.key === 'ArrowRight') updateSheetPage(sheetIndex + 1);
  });
  updateSheetPage(0);
}
