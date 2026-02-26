/* ============================================================
   Sashyasnehi AI — Shared App JavaScript
   Dark mode · Animated Background · News Ticker
   ============================================================ */

// ── Dark Mode ────────────────────────────────────────────────────────────────
(function initDarkMode() {
  const STORAGE_KEY = 'sashya-theme';
  const saved = localStorage.getItem(STORAGE_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    if (btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  }

  window.toggleTheme = function () {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  };

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(saved);
  });
})();


// ── Animated Floating Background ─────────────────────────────────────────────
(function initParticles() {
  const EMOJIS = ['🌿','🌾','🌱','🍅','🥔','🌽','🍎','🧅','🌻','🌸','🍃','🌳','🥦','🌶️','🧄','🫛','🌼','🍃','🌾','🌿'];
  const COUNT = 22;

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.className = 'bg-particles';
    container.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(container, document.body.firstChild);

    for (let i = 0; i < COUNT; i++) {
      const span = document.createElement('span');
      const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      span.textContent = emoji;
      const size = 16 + Math.random() * 24; // 16–40px
      const left = Math.random() * 98;          // 0–98%
      const duration = 18 + Math.random() * 24; // 18–42s
      const delay = -(Math.random() * duration);  // stagger start
      span.style.cssText = `
        left:${left}%;
        font-size:${size}px;
        animation-duration:${duration}s;
        animation-delay:${delay}s;
      `;
      container.appendChild(span);
    }
  });
})();


// ── News Ticker Panel ────────────────────────────────────────────────────────
(function initNewsTicker() {
  let newsScrollInterval = null;
  let newsPanel = null;
  let newsScrollEl = null;
  let isOpen = false;

  function buildPanel() {
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'newsOverlay';
    overlay.className = 'news-overlay';
    overlay.addEventListener('click', closeNews);
    document.body.appendChild(overlay);

    // Panel
    newsPanel = document.createElement('aside');
    newsPanel.id = 'newsPanel';
    newsPanel.className = 'news-panel';
    newsPanel.innerHTML = `
      <div class="news-panel-header">
        <span>📰 Farming News &amp; Updates</span>
        <button class="news-close-btn" onclick="window._closeNews()" title="Close">&times;</button>
      </div>
      <div class="news-scroll" id="newsScroll">
        <div class="news-loading">Loading latest news...</div>
      </div>
    `;
    document.body.appendChild(newsPanel);
  }

  function closeNews() {
    isOpen = false;
    if (newsPanel) newsPanel.classList.remove('open');
    const overlay = document.getElementById('newsOverlay');
    if (overlay) overlay.classList.remove('active');
    const btn = document.getElementById('newsFabBtn');
    if (btn) btn.classList.remove('active');
    stopAutoScroll();
  }
  window._closeNews = closeNews;

  function openNews() {
    isOpen = true;
    if (!newsPanel) buildPanel();
    newsPanel.classList.add('open');
    const overlay = document.getElementById('newsOverlay');
    if (overlay) overlay.classList.add('active');
    const btn = document.getElementById('newsFabBtn');
    if (btn) btn.classList.add('active');
    loadNews();
  }

  function stopAutoScroll() {
    if (newsScrollInterval) { clearInterval(newsScrollInterval); newsScrollInterval = null; }
  }

  function startAutoScroll() {
    stopAutoScroll();
    newsScrollEl = document.getElementById('newsScroll');
    if (!newsScrollEl) return;
    newsScrollInterval = setInterval(() => {
      if (!newsScrollEl) return;
      newsScrollEl.scrollTop += 1;
      // Reset to top when scrolled past halfway of content
      if (newsScrollEl.scrollTop >= newsScrollEl.scrollHeight / 2) {
        newsScrollEl.scrollTop = 0;
      }
    }, 30);
  }

  function loadNews() {
    const scroll = document.getElementById('newsScroll');
    if (!scroll) return;
    // Only fetch once per session
    if (scroll.dataset.loaded === '1') { startAutoScroll(); return; }

    fetch('/api/news')
      .then(r => r.json())
      .then(items => {
        if (!items || !items.length) throw new Error('empty');
        // Duplicate items for seamless loop
        const allItems = [...items, ...items];
        scroll.innerHTML = allItems.map(item => `
          <a class="news-item" href="${item.link || '#'}" target="_blank" rel="noopener">
            <div class="news-item-title">${escHtml(item.title)}</div>
            <div class="news-item-meta">
              <span class="news-src">${escHtml(item.source || '')}</span>
              ${item.date ? `<span class="news-date">${escHtml(String(item.date).substring(0,10))}</span>` : ''}
            </div>
          </a>
        `).join('');
        scroll.dataset.loaded = '1';
        scroll.scrollTop = 0;
        startAutoScroll();
      })
      .catch(() => {
        scroll.innerHTML = '<div class="news-empty">Could not load news. Check your connection.</div>';
      });
  }

  function escHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  document.addEventListener('DOMContentLoaded', () => {
    buildPanel();
    // Build FAB button
    const fab = document.createElement('button');
    fab.id = 'newsFabBtn';
    fab.className = 'news-fab-btn';
    fab.title = 'Latest Farming News';
    fab.setAttribute('aria-label', 'Open farming news ticker');
    fab.innerHTML = `<span class="news-fab-icon">📰</span><span class="news-fab-label">News</span>`;
    fab.addEventListener('click', () => { isOpen ? closeNews() : openNews(); });
    document.body.appendChild(fab);
  });
})();
