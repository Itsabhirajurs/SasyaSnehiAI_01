/* ============================================================
   Sashyasnehi AI — Shared App JavaScript
   Dark Mode · Animated Background · Left/Right Drawer Panels · i18n
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
    if (btn) btn.innerHTML = theme === 'dark' ? '&#9728;&#65039;' : '&#127769;';
  }

  window.toggleTheme = function () {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  };

  document.addEventListener('DOMContentLoaded', () => { applyTheme(saved); });
})();


// ── Animated Floating Background ─────────────────────────────────────────────
(function initParticles() {
  const EMOJIS = ['🌿','🌾','🌱','🍅','🥔','🌽','🍎','🧅','🌻','🌸','🍃','🌳','🥦','🌶️','🧄','🫛','🌼','🍃','🌾','🌿'];
  const COUNT = 20;
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.className = 'bg-particles';
    container.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(container, document.body.firstChild);
    for (let i = 0; i < COUNT; i++) {
      const span = document.createElement('span');
      span.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const dur = 18 + Math.random() * 24;
      span.style.cssText = `left:${Math.random()*98}%;font-size:${16+Math.random()*24}px;animation-duration:${dur}s;animation-delay:${-(Math.random()*dur)}s;`;
      container.appendChild(span);
    }
  });
})();


// ── i18n — Full UI Translation Dictionary ───────────────────────────────────
window.I18N = {
  English: {
    'nav.home':'Home','nav.community':'Community','nav.market':'Market',
    'nav.about':'About','nav.new-analysis':'New Analysis',
    'result.h1':'Analysis Report',
    'result.h1-sub':'Full AI advisory based on your uploaded image and farm details.',
    'result.disease-detection':'Disease Detection',
    'result.label-plant':'Plant','result.label-disease':'Detected Disease',
    'result.label-confidence':'Model Confidence','result.label-severity':'Severity',
    'result.env-risk':'Environmental Risk','result.label-risk':'Risk Level:',
    'result.label-humidity':'Humidity','result.label-temp':'Temperature',
    'result.label-rain':'Rain Probability',
    'result.advisory':'Crop Advisory',
    'result.h3-summary':'Summary','result.h3-causes':'Possible Causes',
    'result.h3-actions':'Recommended Actions',
    'result.chemicals':'Chemical Safety Analysis',
    'result.community-title':'Similar Issues in Community',
    'result.post-issue':'Post This Issue',
    'result.chat-title':'Ask AI About Your Crop',
    'result.chat-desc2':'Ask follow-up questions — it remembers the whole chat.',
    'result.chat-send':'Send',
    'result.chat-placeholder':'Ask anything... e.g. How often should I spray?',
    'result.new-analysis':'← New Analysis','result.home-btn':'Home',
    'panel.insights':'Farm Insights','panel.weather':'Weather',
    'panel.market-tab':'Market','panel.schemes':'Schemes','panel.shops':'Shops',
    'news.title':'Farming News & Updates',
    'dtab.news':'NEWS','dtab.insights':'INSIGHTS',
  },
  Hindi: {
    'nav.home':'होम','nav.community':'समुदाय','nav.market':'बाज़ार',
    'nav.about':'हमारे बारे में','nav.new-analysis':'नया विश्लेषण',
    'result.h1':'विश्लेषण रिपोर्ट',
    'result.h1-sub':'आपकी अपलोड की गई छवि और खेत विवरण के आधार पर AI सलाह।',
    'result.disease-detection':'रोग पहचान',
    'result.label-plant':'पौधा','result.label-disease':'पहचानी गई बीमारी',
    'result.label-confidence':'मॉडल विश्वास','result.label-severity':'गंभीरता',
    'result.env-risk':'पर्यावरण जोखिम','result.label-risk':'जोखिम स्तर:',
    'result.label-humidity':'आर्द्रता','result.label-temp':'तापमान',
    'result.label-rain':'वर्षा संभावना',
    'result.advisory':'फसल सलाह',
    'result.h3-summary':'सारांश','result.h3-causes':'संभावित कारण',
    'result.h3-actions':'अनुशंसित कार्रवाई',
    'result.chemicals':'रासायनिक सुरक्षा विश्लेषण',
    'result.community-title':'समुदाय में समान समस्याएं',
    'result.post-issue':'यह समस्या पोस्ट करें',
    'result.chat-title':'AI से अपनी फसल के बारे में पूछें',
    'result.chat-desc2':'अनुवर्ती प्रश्न पूछें — यह पूरी चैट याद रखता है।',
    'result.chat-send':'भेजें',
    'result.chat-placeholder':'कुछ भी पूछें... जैसे कितनी बार स्प्रे करूं?',
    'result.new-analysis':'← नया विश्लेषण','result.home-btn':'होम',
    'panel.insights':'खेत की जानकारी','panel.weather':'मौसम',
    'panel.market-tab':'बाज़ार','panel.schemes':'योजनाएं','panel.shops':'दुकानें',
    'news.title':'कृषि समाचार',
    'dtab.news':'समाचार','dtab.insights':'जानकारी',
  },
  Kannada: {
    'nav.home':'ಮನೆ','nav.community':'ಸಮುದಾಯ','nav.market':'ಮಾರುಕಟ್ಟೆ',
    'nav.about':'ನಮ್ಮ ಬಗ್ಗೆ','nav.new-analysis':'ಹೊಸ ವಿಶ್ಲೇಷಣೆ',
    'result.h1':'ವಿಶ್ಲೇಷಣೆ ವರದಿ',
    'result.h1-sub':'ನಿಮ್ಮ ಅಪ್ಲೋಡ್ ಮಾಡಿದ ಚಿತ್ರ ಮತ್ತು ಜಮೀನಿನ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ AI ಸಲಹೆ.',
    'result.disease-detection':'ರೋಗ ಪತ್ತೆ',
    'result.label-plant':'ಸಸ್ಯ','result.label-disease':'ಪತ್ತೆಯಾದ ರೋಗ',
    'result.label-confidence':'ಮಾದರಿ ವಿಶ್ವಾಸ','result.label-severity':'ತೀವ್ರತೆ',
    'result.env-risk':'ಪರಿಸರ ಅಪಾಯ','result.label-risk':'ಅಪಾಯ ಮಟ್ಟ:',
    'result.label-humidity':'ತೇವಾಂಶ','result.label-temp':'ತಾಪಮಾನ',
    'result.label-rain':'ಮಳೆ ಸಂಭಾವ್ಯತೆ',
    'result.advisory':'ಬೆಳೆ ಸಲಹೆ',
    'result.h3-summary':'ಸಾರಾಂಶ','result.h3-causes':'ಸಂಭವನೀಯ ಕಾರಣಗಳು',
    'result.h3-actions':'ಶಿಫಾರಸು ಕ್ರಮಗಳು',
    'result.chemicals':'ರಾಸಾಯನಿಕ ಸುರಕ್ಷತೆ ವಿಶ್ಲೇಷಣೆ',
    'result.community-title':'ಸಮುದಾಯದಲ್ಲಿ ಇದೇ ರೀತಿಯ ಸಮಸ್ಯೆಗಳು',
    'result.post-issue':'ಈ ಸಮಸ್ಯೆ ಪೋಸ್ಟ್ ಮಾಡಿ',
    'result.chat-title':'AI ಅನ್ನು ನಿಮ್ಮ ಬೆಳೆ ಬಗ್ಗೆ ಕೇಳಿ',
    'result.chat-desc2':'ಅನುಸರಣ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ — ಅದು ಇಡೀ ಚಾಟ್ ನೆನಪಿಟ್ಟುಕೊಳ್ಳುತ್ತದೆ.',
    'result.chat-send':'ಕಳುಹಿಸಿ',
    'result.chat-placeholder':'ಏನಾದರೂ ಕೇಳಿ... ಉದಾ. ಎಷ್ಟು ಬಾರಿ ಸ್ಪ್ರೇ ಮಾಡಬೇಕು?',
    'result.new-analysis':'← ಹೊಸ ವಿಶ್ಲೇಷಣೆ','result.home-btn':'ಮನೆ',
    'panel.insights':'ಜಮೀನಿನ ಮಾಹಿತಿ','panel.weather':'ಹವಾಮಾನ',
    'panel.market-tab':'ಮಾರುಕಟ್ಟೆ','panel.schemes':'ಯೋಜನೆಗಳು','panel.shops':'ಅಂಗಡಿಗಳು',
    'news.title':'ಕೃಷಿ ಸುದ್ದಿ',
    'dtab.news':'ಸುದ್ದಿ','dtab.insights':'ಮಾಹಿತಿ',
  }
};

// Applies i18n to all [data-i18n] elements and special dynamic targets
window.applyI18n = function(lang) {
  const dict = window.I18N[lang] || window.I18N['English'];
  // All data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] == null) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = dict[key];
    } else {
      el.textContent = dict[key];
    }
  });
  // Panel tab buttons (store original English label to remap correctly)
  const tabMap = {'Weather':'panel.weather','Market':'panel.market-tab','Schemes':'panel.schemes','Shops':'panel.shops'};
  document.querySelectorAll('.ptab').forEach(tab => {
    const orig = tab.dataset.origLabel || tab.textContent.trim();
    tab.dataset.origLabel = orig;
    if (tabMap[orig] && dict[tabMap[orig]]) tab.textContent = dict[tabMap[orig]];
  });
  // News panel header title
  const newsTitle = document.getElementById('newsPanelTitle');
  if (newsTitle && dict['news.title']) newsTitle.textContent = dict['news.title'];
  // Insights panel header span
  const insightsHeader = document.querySelector('.side-panel-header > span');
  if (insightsHeader && dict['panel.insights']) insightsHeader.textContent = dict['panel.insights'];
  // Drawer tab labels
  const newsLbl = document.getElementById('newsTabLabel');
  if (newsLbl && dict['dtab.news']) newsLbl.textContent = dict['dtab.news'];
  const insightsLbl = document.getElementById('insightsTabLabel');
  if (insightsLbl && dict['dtab.insights']) insightsLbl.textContent = dict['dtab.insights'];
  // Chat input placeholder & send button
  const chatInput = document.getElementById('chatInput');
  if (chatInput && dict['result.chat-placeholder']) chatInput.placeholder = dict['result.chat-placeholder'];
  const chatSend = document.getElementById('chatSendBtn');
  if (chatSend && dict['result.chat-send']) chatSend.textContent = dict['result.chat-send'];
};


// ── LEFT DRAWER — Farming News Panel ────────────────────────────────────────
(function initNewsDrawer() {
  let scrollTimer = null;
  let panel = null;
  let open = false;

  function esc(s) {
    return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function buildPanel() {
    const ov = document.createElement('div');
    ov.id = 'newsOverlay'; ov.className = 'news-overlay';
    ov.addEventListener('click', closeNews);
    document.body.appendChild(ov);

    panel = document.createElement('aside');
    panel.id = 'newsPanel'; panel.className = 'news-panel';
    panel.innerHTML = `
      <div class="news-panel-header">
        <span id="newsPanelTitle">&#128240; Farming News &amp; Updates</span>
        <button class="news-close-btn" onclick="window._closeNews()" title="Close">&times;</button>
      </div>
      <div class="news-scroll" id="newsScroll">
        <div class="news-loading">Loading latest farming news...</div>
      </div>`;
    document.body.appendChild(panel);
  }

  function openNews() {
    open = true; window._newsOpen = true;
    if (!panel) buildPanel();
    panel.classList.add('open');
    document.getElementById('newsOverlay').classList.add('active');
    const tab = document.getElementById('newsDrawerTab');
    if (tab) tab.classList.add('panel-open');
    loadNews();
  }

  function closeNews() {
    open = false; window._newsOpen = false;
    if (panel) panel.classList.remove('open');
    const ov = document.getElementById('newsOverlay');
    if (ov) ov.classList.remove('active');
    const tab = document.getElementById('newsDrawerTab');
    if (tab) tab.classList.remove('panel-open');
    if (scrollTimer) { clearInterval(scrollTimer); scrollTimer = null; }
  }

  window._openNews = openNews;
  window._closeNews = closeNews;
  window._newsOpen = false;

  function startScroll() {
    if (scrollTimer) clearInterval(scrollTimer);
    const el = document.getElementById('newsScroll');
    if (!el) return;
    scrollTimer = setInterval(() => {
      el.scrollTop += 1;
      if (el.scrollTop >= el.scrollHeight / 2) el.scrollTop = 0;
    }, 28);
  }

  function loadNews() {
    const el = document.getElementById('newsScroll');
    if (!el) return;
    if (el.dataset.loaded === '1') { startScroll(); return; }
    fetch('/api/news')
      .then(r => r.json())
      .then(items => {
        if (!items || !items.length) throw new Error('empty');
        const all = [...items, ...items];
        el.innerHTML = all.map(n => `
          <a class="news-item" href="${esc(n.link||'#')}" target="_blank" rel="noopener noreferrer">
            <div class="news-item-title">${esc(n.title)}</div>
            <div class="news-item-meta">
              <span class="news-src">${esc(n.source||'')}</span>
              ${n.date?`<span class="news-date">${esc(String(n.date).slice(0,10))}</span>`:''}
            </div>
          </a>`).join('');
        el.dataset.loaded = '1';
        el.scrollTop = 0;
        startScroll();
      })
      .catch(() => { el.innerHTML = '<div class="news-empty">Could not load news.</div>'; });
  }

  document.addEventListener('DOMContentLoaded', () => {
    buildPanel();
    // Create left-edge drawer tab
    const tab = document.createElement('button');
    tab.id = 'newsDrawerTab';
    tab.className = 'drawer-tab drawer-tab-left';
    tab.setAttribute('aria-label', 'Toggle farming news');
    tab.innerHTML = `
      <span class="dtab-arrow" id="newsArrow">&#9654;</span>
      <span class="dtab-icon">&#128240;</span>
      <span class="dtab-label" id="newsTabLabel">NEWS</span>`;
    tab.addEventListener('click', () => { open ? closeNews() : openNews(); });
    document.body.appendChild(tab);
  });
})();


// ── RIGHT DRAWER — Farm Insights (result.html only) ──────────────────────────
(function initInsightsDrawer() {
  document.addEventListener('DOMContentLoaded', () => {
    const sidePanel = document.getElementById('sidePanel');
    if (!sidePanel) return;

    const tab = document.createElement('button');
    tab.id = 'insightsDrawerTab';
    tab.className = 'drawer-tab drawer-tab-right';
    tab.setAttribute('aria-label', 'Toggle farm insights');
    tab.innerHTML = `
      <span class="dtab-label" id="insightsTabLabel">INSIGHTS</span>
      <span class="dtab-icon">&#127807;</span>
      <span class="dtab-arrow" id="insightsArrow">&#9664;</span>`;
    tab.addEventListener('click', () => {
      if (window.togglePanel) window.togglePanel();
    });
    document.body.appendChild(tab);

    // Sync open/close state of right tab with sidePanel via MutationObserver
    new MutationObserver(() => {
      tab.classList.toggle('panel-open', sidePanel.classList.contains('open'));
    }).observe(sidePanel, { attributes: true, attributeFilter: ['class'] });
  });
})();
