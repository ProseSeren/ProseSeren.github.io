(function () {
  const STORAGE_KEY = 'wowpage_lang';
  const TITLES = {
    en: 'Qisong Zhang · 张启淞',
    zh: '张启淞 · Qisong Zhang'
  };

  function getInitialLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'zh') return saved;
    } catch {}
    return (navigator.language || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
  }

  let currentLang = getInitialLang();

  function apply() {
    document.documentElement.classList.toggle('lang-zh-active', currentLang === 'zh');
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    document.title = TITLES[currentLang];

    // Short strings via data-i18n attributes (skip elements with empty values).
    const els = document.querySelectorAll('[data-i18n-en], [data-i18n-zh]');
    els.forEach(function (el) {
      const enText = el.getAttribute('data-i18n-en');
      const zhText = el.getAttribute('data-i18n-zh');
      if (currentLang === 'zh' && zhText) {
        el.innerHTML = zhText;
      } else if (currentLang === 'en' && enText) {
        el.innerHTML = enText;
      }
    });

    updateToggleButtons();
    document.dispatchEvent(new Event('languagechange'));
  }

  function setLang(lang) {
    if (lang !== 'en' && lang !== 'zh') return;
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
    apply();
  }

  function getLang() {
    return currentLang;
  }

  function updateToggleButtons() {
    document.querySelectorAll('[data-action="toggle-language"]').forEach(function (button) {
      button.textContent = currentLang === 'en' ? '中文' : 'EN';
      button.setAttribute('aria-label', currentLang === 'en' ? 'Switch to Chinese' : 'Switch to English');
      button.lang = currentLang === 'en' ? 'zh-CN' : 'en';
    });
    const btns = document.querySelectorAll('.lang-btn');
    btns.forEach(function (btn) {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === currentLang) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  function initToggle() {
    const containers = document.querySelectorAll('.lang-switch-container');
    containers.forEach(function (container) {
      container.innerHTML =
        '<div class="lang-switch" role="group" aria-label="Language Toggle">' +
        '<button class="lang-btn pub-button" data-lang="en" aria-pressed="' + (currentLang === 'en') + '">EN</button>' +
        '<button class="lang-btn pub-button" data-lang="zh" aria-pressed="' + (currentLang === 'zh') + '">中文</button>' +
        '</div>';
    });

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-action="toggle-language"]')) {
        setLang(currentLang === 'en' ? 'zh' : 'en');
        return;
      }
      const btn = e.target.closest('.lang-btn');
      if (btn) {
        const lang = btn.getAttribute('data-lang');
        if (lang) setLang(lang);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initToggle();
    apply();
  });

  window.i18n = {
    getLang: getLang,
    setLang: setLang,
    apply: apply
  };
})();
