/*
  JavaScript functions
  Includes:
  1. Mobile navigation
  2. Practice timer
  3. Repertoire search and filter
  4. Browse carousel
  5. Dynamic piano sheet page viewer
  6. Weekly practice chart
  7. Practice session analytics chart
  8. PDF upload modal
  9. Performance entry modal
*/

document.addEventListener('DOMContentLoaded', function () {
  setupMobileNavigation();
  setupPracticeTimer();
  setupRepertoireFilters();
  setupBrowseCarousel();
  setupPieceDetailPage();
  setupWeeklyPracticeChart();
  setupPracticeAnalyticsChart();
  setupPdfUploadModal();
  setupPerformanceModal();
});

/**
 * Mobile navigation 
 */
function setupMobileNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (!navToggle || !mainNav) return;

  navToggle.addEventListener('click', function () {
    mainNav.classList.toggle('open');
  });
}

/**
 * Practice timer
 */
function setupPracticeTimer() {
  const timerDisplay = document.getElementById('timerDisplay');
  const startButton = document.getElementById('startTimer');
  const stopButton = document.getElementById('stopTimer');
  const resetButton = document.getElementById('resetTimer');

  if (!timerDisplay || !startButton || !stopButton) return;

  let seconds = 0;
  let timerInterval = null;

  function updateTimerDisplay() {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');

    timerDisplay.textContent = `${hrs}:${mins}:${secs}`;
  }

  startButton.addEventListener('click', function () {
    if (timerInterval) return;

    timerInterval = setInterval(function () {
      seconds += 1;
      updateTimerDisplay();
    }, 1000);
  });

  stopButton.addEventListener('click', function () {
    clearInterval(timerInterval);
    timerInterval = null;
  });

  if (resetButton) {
    resetButton.addEventListener('click', function () {
      clearInterval(timerInterval);
      timerInterval = null;
      seconds = 0;
      updateTimerDisplay();
    });
  }
}

/**
 * Repertoire search and filter
 */
function setupRepertoireFilters() {
  const searchInput = document.getElementById('pieceSearch');
  const difficultyFilter = document.getElementById('difficultyFilter');
  const noResults = document.getElementById('noResults');
  const pieceCards = document.querySelectorAll('.piece-card');

  if (!searchInput || !difficultyFilter || !pieceCards.length) return;

  function filterPieces() {
    const searchValue = searchInput.value.toLowerCase().trim();
    const difficultyValue = difficultyFilter.value;

    let visibleCount = 0;

    pieceCards.forEach(function (card) {
      const title = card.dataset.title ? card.dataset.title.toLowerCase() : '';
      const composer = card.dataset.composer ? card.dataset.composer.toLowerCase() : '';
      const difficulty = card.dataset.difficulty || '';

      const matchesSearch =
        title.includes(searchValue) || composer.includes(searchValue);

      const matchesDifficulty =
        difficultyValue === 'all' || difficulty === difficultyValue;

      const shouldShow = matchesSearch && matchesDifficulty;

      card.dataset.matches = shouldShow ? 'true' : 'false';

      if (!card.classList.contains('browse-card')) {
        card.style.display = shouldShow ? 'flex' : 'none';
      }

      if (shouldShow && !card.classList.contains('browse-card')) {
        visibleCount += 1;
      }
    });

    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    if (typeof window.updateBrowseCarousel === 'function') {
      window.updateBrowseCarousel(true);
    }
  }

  searchInput.addEventListener('input', filterPieces);
  difficultyFilter.addEventListener('change', filterPieces);

  filterPieces();
}

/**
 * Browse carousel
 */
function setupBrowseCarousel() {
  const browseCards = Array.from(document.querySelectorAll('.browse-card'));
  const prevButton = document.getElementById('browsePrev');
  const nextButton = document.getElementById('browseNext');
  const viewAllButton = document.getElementById('viewAllBrowse');
  const browseStatus = document.getElementById('browseStatus');

  if (!browseCards.length || !prevButton || !nextButton) return;

  let browseStart = 0;
  let viewAll = false;

  function getPageSize() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 4;
  }

  function getMatchingCards() {
    return browseCards.filter(function (card) {
      return card.dataset.matches !== 'false';
    });
  }

  function updateBrowseCarousel(resetPosition) {
    const matchingCards = getMatchingCards();
    const pageSize = getPageSize();

    if (resetPosition) {
      browseStart = 0;
    }

    if (browseStart >= matchingCards.length) {
      browseStart = Math.max(0, matchingCards.length - pageSize);
    }

    browseCards.forEach(function (card) {
      card.style.display = 'none';
    });

    if (viewAll) {
      matchingCards.forEach(function (card) {
        card.style.display = 'flex';
      });

      if (browseStatus) {
        browseStatus.textContent = `Showing all ${matchingCards.length} pieces`;
      }

      if (prevButton) {
        prevButton.disabled = true;
      }

      if (nextButton) {
        nextButton.disabled = true;
      }

      if (viewAllButton) {
        viewAllButton.textContent = 'Show Less';
      }

      return;
    }

    const visibleCards = matchingCards.slice(browseStart, browseStart + pageSize);

    visibleCards.forEach(function (card) {
      card.style.display = 'flex';
    });

    const from = matchingCards.length ? browseStart + 1 : 0;
    const to = Math.min(browseStart + pageSize, matchingCards.length);

    if (browseStatus) {
      browseStatus.textContent = `Showing ${from}-${to} of ${matchingCards.length} pieces`;
    }

    if (prevButton) {
      prevButton.disabled = browseStart === 0;
    }

    if (nextButton) {
      nextButton.disabled = browseStart + pageSize >= matchingCards.length;
    }

    if (viewAllButton) {
      viewAllButton.textContent = 'View All';
    }
  }

  window.updateBrowseCarousel = updateBrowseCarousel;

  prevButton.addEventListener('click', function () {
    browseStart -= getPageSize();

    if (browseStart < 0) {
      browseStart = 0;
    }

    viewAll = false;
    updateBrowseCarousel(false);
  });

  nextButton.addEventListener('click', function () {
    browseStart += getPageSize();

    viewAll = false;
    updateBrowseCarousel(false);
  });

  if (viewAllButton) {
    viewAllButton.addEventListener('click', function () {
      viewAll = !viewAll;
      updateBrowseCarousel(false);
    });
  }

  window.addEventListener('resize', function () {
    updateBrowseCarousel(false);
  });

  updateBrowseCarousel(true);
}

/**
 * Piano sheet viewer
 */

// Different pieces for page switching
const pianoPieces = {
  liebestraum: {
    title: 'Liebestraum S. 541 No. 3 in A♭ Major - Liszt',
    duration: '3:50',
    playback: '00:04 / 03:51',
    measures: '88',
    key: 'A♭ major, F minor',
    parts: '1',
    notesKey: 'liebestraum-notes',
    recordingUrl: 'https://www.youtube.com/watch?v=bhYfOh6dn3o',
    pages: [
      'images/liebestraum-1.png',
      'images/liebestraum-2.png',
      'images/liebestraum-3.png',
      'images/liebestraum-4.png',
      'images/liebestraum-5.png',
      'images/liebestraum-6.png'
    ]
  },

  moonlight: {
    title: 'Opus 27 No. 2 Moonlight Sonata 1st Movement - Beethoven',
    duration: '5:25',
    playback: '00:00 / 05:25',
    measures: '69',
    key: 'E major, C♯ minor',
    parts: '1',
    notesKey: 'moonlight-notes',
    recordingUrl: 'https://www.youtube.com/watch?v=ITidiBe-0T0',
    pages: [
      'images/moonlight-1.jpg',
      'images/moonlight-2.jpg',
      'images/moonlight-3.jpg',
      'images/moonlight-4.jpg',
      'images/moonlight-5.jpg',
      'images/moonlight-6.jpg',
      'images/moonlight-7.jpg',
      'images/moonlight-8.jpg',
      'images/moonlight-9.jpg'
    ]
  },

  nocturne: {
    title: 'Nocturne in D-Flat Major, Op. 27, No. 2 - Chopin',
    duration: '5:05',
    playback: '00:00 / 5:05',
    measures: '77',
    key: 'D♭ major, B♭ minor',
    parts: '1',
    notesKey: 'nocturne-notes',
    recordingUrl: 'https://www.youtube.com/watch?v=QoYN4ubUusc',
    pages: [
      'images/nocturne-1.png',
      'images/nocturne-2.png',
      'images/nocturne-3.png',
      'images/nocturne-4.png',
      'images/nocturne-5.png',
      'images/nocturne-6.png'
    ]
  },

  turkish: {
    title: 'Piano Sonata No. 11 K. 331, 3rd Movement, “Rondo alla Turca” - Mozart',
    duration: '3:44',
    playback: '00:00 / 03:44',
    measures: '137',
    key: 'C major, A minor',
    parts: '1',
    notesKey: 'turkish-notes',
    recordingUrl: 'https://www.youtube.com/watch?v=n2Tru4Qa3pc',
    pages: [
      'images/turkish-1.png',
      'images/turkish-2.png',
      'images/turkish-3.png',
      'images/turkish-4.png',
      'images/turkish-5.png'
    ]
  }
};

function setupPieceDetailPage() {
  const sheetImage = document.getElementById('sheetImage');
  const pieceTitle = document.getElementById('pieceTitle');

  if (!sheetImage || !pieceTitle) return;

  const params = new URLSearchParams(window.location.search);
  const pieceId = params.get('id') || 'liebestraum';
  const currentPiece = pianoPieces[pieceId] || pianoPieces.liebestraum;

  let currentPage = 0;

  const playbackTime = document.getElementById('playbackTime');
  const piecePages = document.getElementById('piecePages');
  const pieceDuration = document.getElementById('pieceDuration');
  const pieceMeasures = document.getElementById('pieceMeasures');
  const pieceKey = document.getElementById('pieceKey');
  const pieceParts = document.getElementById('pieceParts');
  const pageIndicator = document.getElementById('sheetPageIndicator');
  const thumbnailContainer = document.getElementById('sheetThumbnails');
  const notesArea = document.getElementById('notesArea');

  const firstButton = document.getElementById('firstSheetPage');
  const prevButton = document.getElementById('prevSheetPage');
  const nextButton = document.getElementById('nextSheetPage');
  const prevBottomButton = document.getElementById('prevSheetPageBottom');
  const nextBottomButton = document.getElementById('nextSheetPageBottom');
  const viewRecordingButton = document.getElementById('viewRecordingButton');

  function loadPieceInformation() {
    document.title = `Piano Dashboard | ${currentPiece.title}`;

    pieceTitle.textContent = currentPiece.title;

    if (playbackTime) playbackTime.textContent = currentPiece.playback;
    if (piecePages) piecePages.textContent = currentPiece.pages.length;
    if (pieceDuration) pieceDuration.textContent = currentPiece.duration;
    if (pieceMeasures) pieceMeasures.textContent = currentPiece.measures;
    if (pieceKey) pieceKey.textContent = currentPiece.key;
    if (pieceParts) pieceParts.textContent = currentPiece.parts;

    if (viewRecordingButton) {
      viewRecordingButton.href = currentPiece.recordingUrl;
    }

    if (notesArea) {
      notesArea.dataset.storageKey = currentPiece.notesKey;
      notesArea.value = localStorage.getItem(currentPiece.notesKey) || '';
    }
  }

  // Page flipping for pieces
  function renderCurrentPage() {
    sheetImage.src = currentPiece.pages[currentPage];
    sheetImage.alt = `${currentPiece.title} - page ${currentPage + 1}`;

    if (pageIndicator) {
      pageIndicator.textContent = `Page ${currentPage + 1} of ${currentPiece.pages.length}`;
    }

    const thumbs = document.querySelectorAll('.sheet-thumb');

    thumbs.forEach(function (thumb, index) {
      thumb.classList.toggle('active', index === currentPage);
    });
  }

  function renderThumbnails() {
    if (!thumbnailContainer) return;

    thumbnailContainer.innerHTML = '';

    currentPiece.pages.forEach(function (pageSrc, index) {
      const button = document.createElement('button');
      button.className = 'sheet-thumb';
      button.type = 'button';

      button.innerHTML = `
        <img src="${pageSrc}" alt="Page ${index + 1}">
        <span>${index + 1}</span>
      `;

      button.addEventListener('click', function () {
        currentPage = index;
        renderCurrentPage();
      });

      thumbnailContainer.appendChild(button);
    });
  }

  function goToFirstPage() {
    currentPage = 0;
    renderCurrentPage();
  }

  function goToPreviousPage() {
    if (currentPage === 0) {
      currentPage = currentPiece.pages.length - 1;
    } else {
      currentPage -= 1;
    }

    renderCurrentPage();
  }

  function goToNextPage() {
    if (currentPage === currentPiece.pages.length - 1) {
      currentPage = 0;
    } else {
      currentPage += 1;
    }

    renderCurrentPage();
  }

  if (firstButton) firstButton.addEventListener('click', goToFirstPage);
  if (prevButton) prevButton.addEventListener('click', goToPreviousPage);
  if (nextButton) nextButton.addEventListener('click', goToNextPage);
  if (prevBottomButton) prevBottomButton.addEventListener('click', goToPreviousPage);
  if (nextBottomButton) nextBottomButton.addEventListener('click', goToNextPage);

  document.addEventListener('keydown', function (event) {
    if (!sheetImage) return;

    if (event.key === 'ArrowLeft') {
      goToPreviousPage();
    }

    if (event.key === 'ArrowRight') {
      goToNextPage();
    }
  });

  loadPieceInformation();
  renderThumbnails();
  renderCurrentPage();
}

/**
 * Weekly practice chart
 */
function setupWeeklyPracticeChart() {
  const chartCanvas = document.getElementById('weeklyPracticeChart');

  if (!chartCanvas) return;

  if (typeof Chart === 'undefined') {
    return;
  }

  new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Practice Minutes',
          data: [0, 0, 0, 0, 30, 50, 41],
          backgroundColor: '#000000',
          borderColor: '#000000',
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 130
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.raw + ' minutes';
            }
          }
        }
      },

      scales: {
        x: {
          grid: {
            display: false
          },
          border: {
            display: false
          },
          ticks: {
            color: '#000000',
            font: {
              size: 11
            }
          }
        },

        y: {
          beginAtZero: true,
          max: 60,
          ticks: {
            stepSize: 10,
            color: '#000000',
            font: {
              size: 11
            }
          },
          grid: {
            display: false
          },
          border: {
            display: false
          }
        }
      }
    }
  });
}

/**
 * Practice page chart
 */
function setupPracticeAnalyticsChart() {
  const chartCanvas = document.getElementById('sessionAnalyticsChart');
  const pieceSelect = document.getElementById('practicePiece');
  const chartCaption = document.getElementById('sessionChartCaption');

  if (!chartCanvas || !pieceSelect) return;

  if (typeof Chart === 'undefined') {
    return;
  }

  const practiceData = {
    overall: {
      title: 'overall practice sessions',
      labels: ['Session 1', 'Session 2', 'Session 3'],
      minutes: [30, 45, 25]
    },

    liebestraum: {
      title: 'Liebestraum No. 3',
      labels: ['Session 1', 'Session 2', 'Session 3', 'Session 4'],
      minutes: [25, 32, 38, 45]
    },

    moonlight: {
      title: 'Moonlight Sonata 1st Movement',
      labels: ['Session 1', 'Session 2', 'Session 3'],
      minutes: [40, 45, 50]
    },

    nocturne: {
      title: 'Chopin Nocturne Op. 27 No. 2',
      labels: ['Session 1', 'Session 2', 'Session 3'],
      minutes: [20, 35, 40]
    },

    turca: {
      title: 'Rondo alla Turca',
      labels: ['Session 1', 'Session 2', 'Session 3'],
      minutes: [30, 28, 36]
    }
  };

  const selectedData = practiceData[pieceSelect.value] || practiceData.overall;

  const sessionChart = new Chart(chartCanvas, {
    type: 'line',

    data: {
      labels: selectedData.labels,
      datasets: [
        {
          label: 'Practice Minutes',
          data: selectedData.minutes,
          borderColor: '#000000',
          backgroundColor: '#000000',
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.15
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false
        },

        tooltip: {
          callbacks: {
            label: function (context) {
              return context.raw + ' minutes';
            }
          }
        }
      },

      scales: {
        x: {
          grid: {
            display: false
          },
          border: {
            display: false
          },
          ticks: {
            color: '#000000',
            font: {
              size: 12
            }
          }
        },

        y: {
          beginAtZero: true,
          suggestedMax: 60,
          ticks: {
            stepSize: 10,
            color: '#999999',
            font: {
              size: 12
            }
          },
          grid: {
            color: '#dddddd'
          },
          border: {
            display: false
          }
        }
      }
    }
  });

  function updateChartForSelectedPiece() {
    const pieceId = pieceSelect.value;
    const newData = practiceData[pieceId] || practiceData.overall;

    sessionChart.data.labels = newData.labels;
    sessionChart.data.datasets[0].data = newData.minutes;
    sessionChart.update();

    if (chartCaption) {
      chartCaption.textContent = 'Showing practice sessions for ' + newData.title;
    }
  }

  pieceSelect.addEventListener('change', updateChartForSelectedPiece);

  updateChartForSelectedPiece();
}

/**
 * PDF upload modal
 */
function setupPdfUploadModal() {
  const openButton = document.getElementById('openUploadModal');
  const modal = document.getElementById('uploadModal');
  const closeButton = document.getElementById('closeUploadModal');
  const cancelButton = document.getElementById('cancelUploadButton');
  const choosePdfButton = document.getElementById('choosePdfButton');
  const pdfInput = document.getElementById('pdfUploadInput');
  const confirmButton = document.getElementById('confirmUploadButton');

  if (!openButton || !modal || !pdfInput) return;

  function openModal() {
    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
    pdfInput.value = '';

    if (choosePdfButton) {
      choosePdfButton.textContent = 'Select PDF';
    }
  }

  openButton.addEventListener('click', openModal);

  if (closeButton) closeButton.addEventListener('click', closeModal);
  if (cancelButton) cancelButton.addEventListener('click', closeModal);

  if (choosePdfButton) {
    choosePdfButton.addEventListener('click', function () {
      pdfInput.click();
    });
  }

  pdfInput.addEventListener('change', function () {
    const file = pdfInput.files[0];

    if (!file) return;

    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      alert('Please choose a PDF file.');
      pdfInput.value = '';
      return;
    }

    if (choosePdfButton) {
      choosePdfButton.textContent = file.name;
    }
  });

  if (confirmButton) {
    confirmButton.addEventListener('click', function () {
      const file = pdfInput.files[0];

      if (!file) {
        alert('Please select a PDF file first.');
        return;
      }

      closeModal();
    });
  }

  modal.addEventListener('click', function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });
}

function setupPerformanceModal() {
  const openButton = document.getElementById('openPerformanceModal');
  const modal = document.getElementById('performanceModal');
  const closeButton = document.getElementById('closePerformanceModal');
  const cancelButton = document.getElementById('cancelPerformanceButton');
  const confirmButton = document.getElementById('confirmPerformanceButton');

  const captionInput = document.getElementById('performanceCaptionInput');
  const dateInput = document.getElementById('performanceDateInput');
  const locationInput = document.getElementById('performanceLocationInput');
  const youtubeInput = document.getElementById('performanceYoutubeInput');
  const performanceTimeline = document.getElementById('performanceTimeline');

  if (!openButton || !modal || !captionInput || !dateInput || !locationInput || !youtubeInput) return;

  function openModal() {
    modal.classList.add('open');
    captionInput.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    captionInput.value = '';
    dateInput.value = '';
    locationInput.value = '';
    youtubeInput.value = '';
  }

  function isValidYoutubeLink(url) {
    return (
      url.startsWith('https://www.youtube.com/') ||
      url.startsWith('https://youtu.be/')
    );
  }

  function formatDate(dateValue) {
    if (!dateValue) return '';

    const parts = dateValue.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  openButton.addEventListener('click', openModal);

  if (closeButton) closeButton.addEventListener('click', closeModal);
  if (cancelButton) cancelButton.addEventListener('click', closeModal);

  if (confirmButton) {
    confirmButton.addEventListener('click', function () {
      const caption = captionInput.value.trim();
      const date = dateInput.value.trim();
      const location = locationInput.value.trim();
      const youtubeUrl = youtubeInput.value.trim();

      if (!caption || !date || !location || !youtubeUrl) {
        alert('Please fill in the caption, date, location, and YouTube link.');
        return;
      }

      if (!isValidYoutubeLink(youtubeUrl)) {
        alert('Please enter a valid YouTube link starting with https://www.youtube.com/ or https://youtu.be/');
        return;
      }

      if (performanceTimeline) {
        const newCard = document.createElement('a');
        newCard.className = 'card perf-card';
        newCard.href = youtubeUrl;
        newCard.target = '_blank';
        newCard.rel = 'noopener noreferrer';

        newCard.innerHTML = `
          <div class="perf-placeholder">▶</div>
          <div class="perf-body">
            <div class="perf-title">${caption}</div>
            <div class="perf-line">📅 ${formatDate(date)}</div>
            <div class="perf-line">📍 ${location}</div>
          </div>
        `;

        performanceTimeline.prepend(newCard);
      }

      closeModal();
    });
  }

  modal.addEventListener('click', function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });
}