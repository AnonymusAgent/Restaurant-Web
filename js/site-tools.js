/* Theme, reading aids and privacy settings shared by every page. */
(() => {
  const safeGet = (key, fallback = '') => {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  };
  const safeSet = (key, value) => { try { localStorage.setItem(key, value); } catch { /* private browsing */ } };
  const readCookie = name => document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=').slice(1).join('=') || '';
  const setCookie = (name, value, days, essential = false) => {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${days * 86400}; Path=/; SameSite=Lax${secure}${essential ? '; Priority=High' : ''}`;
  };
  const removeCookie = name => {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
  };
  const preferencesFromCookie = () => {
    try { return JSON.parse(decodeURIComponent(readCookie('site_consent'))); } catch { return null; }
  };

  function initThemeAndReadingTools() {
    const savedTheme = safeGet('lm-theme', 'light');
    document.documentElement.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';
    const savedScale = Number(safeGet('lm-text-scale', '1'));
    document.documentElement.style.setProperty('--reading-scale', String(Math.min(1.6, Math.max(1, savedScale || 1))));
    const reduceMotion = safeGet('lm-reduce-motion', 'false') === 'true';
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);

    const host = document.querySelector('.accessibility-panel');
    if (!host) return;
    host.innerHTML = `
      <button class="tools-launcher" type="button" aria-expanded="false" aria-controls="reading-tools-panel" aria-label="Open reading and display settings">Display &amp; reading</button>
      <div class="reading-tools-panel" id="reading-tools-panel" hidden>
        <h2>Display &amp; reading settings</h2>
        <p class="tools-hint">Make the page more comfortable to read. Your choices are saved on this device.</p>
        <div class="tools-row"><span id="theme-label">Color theme</span><button type="button" id="theme-toggle" aria-labelledby="theme-label">${document.documentElement.dataset.theme === 'dark' ? 'Use light theme' : 'Use dark theme'}</button></div>
        <div class="tools-row"><span id="text-label">Text size</span><div class="text-size-controls"><button type="button" data-scale="down" aria-label="Make text smaller">A−</button><button type="button" data-scale="reset" aria-label="Reset text size">A</button><button type="button" data-scale="up" aria-label="Make text larger">A+</button></div></div>
        <button type="button" class="tools-wide" id="contrast-toggle" aria-pressed="${safeGet('lm-contrast', 'false') === 'true'}">${safeGet('lm-contrast', 'false') === 'true' ? 'Turn off' : 'Turn on'} high contrast</button>
        <button type="button" class="tools-wide" id="motion-toggle" aria-pressed="${reduceMotion}">${reduceMotion ? 'Allow' : 'Reduce'} motion and animations</button>
        <button type="button" class="tools-wide" id="privacy-open">Privacy &amp; cookie settings</button>
      </div>`;

    const panel = host.querySelector('#reading-tools-panel');
    const launcher = host.querySelector('.tools-launcher');
    launcher.addEventListener('click', () => {
      const isOpen = panel.hidden;
      panel.hidden = !isOpen;
      launcher.setAttribute('aria-expanded', String(isOpen));
    });
    host.querySelector('#theme-toggle').addEventListener('click', event => {
      const dark = document.documentElement.dataset.theme !== 'dark';
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      safeSet('lm-theme', dark ? 'dark' : 'light');
      event.currentTarget.textContent = dark ? 'Use light theme' : 'Use dark theme';
    });
    host.querySelectorAll('[data-scale]').forEach(button => button.addEventListener('click', () => {
      let scale = Number(getComputedStyle(document.documentElement).getPropertyValue('--reading-scale')) || 1;
      if (button.dataset.scale === 'up') scale = Math.min(1.6, Math.round((scale + .1) * 10) / 10);
      if (button.dataset.scale === 'down') scale = Math.max(1, Math.round((scale - .1) * 10) / 10);
      if (button.dataset.scale === 'reset') scale = 1;
      document.documentElement.style.setProperty('--reading-scale', String(scale));
      safeSet('lm-text-scale', scale);
    }));
    host.querySelector('#contrast-toggle').addEventListener('click', event => {
      const enabled = !document.documentElement.classList.contains('high-contrast-mode');
      document.documentElement.classList.toggle('high-contrast-mode', enabled);
      safeSet('lm-contrast', enabled);
      event.currentTarget.setAttribute('aria-pressed', String(enabled));
      event.currentTarget.textContent = `${enabled ? 'Turn off' : 'Turn on'} high contrast`;
    });
    host.querySelector('#motion-toggle').addEventListener('click', event => {
      const enabled = !document.documentElement.classList.contains('reduce-motion');
      document.documentElement.classList.toggle('reduce-motion', enabled);
      safeSet('lm-reduce-motion', enabled);
      event.currentTarget.setAttribute('aria-pressed', String(enabled));
      event.currentTarget.textContent = `${enabled ? 'Allow' : 'Reduce'} motion and animations`;
    });
    host.querySelector('#privacy-open').addEventListener('click', () => openPrivacySettings(true));
    if (safeGet('lm-contrast', 'false') === 'true') document.documentElement.classList.add('high-contrast-mode');
  }

  function mountCookieControls() {
    const footer = document.querySelector('footer');
    if (footer && !footer.querySelector('.cookie-settings-link')) {
      const link = document.createElement('button');
      link.type = 'button'; link.className = 'cookie-settings-link'; link.textContent = 'Privacy & cookie settings';
      link.addEventListener('click', () => openPrivacySettings(true));
      const copyright = footer.querySelector('.copyright') || footer;
      copyright.append(link);
      if (location.pathname !== '/admin.html') {
        const admin = document.createElement('a'); admin.href = 'admin.html'; admin.className = 'cookie-settings-link'; admin.textContent = 'Admin';
        copyright.append(admin);
      }
    }

    const consent = preferencesFromCookie();
    if (consent && consent.essential === true) activateConsent(consent);
    else showCookieBanner();
  }

  function activateConsent(consent) {
    if (consent.analytics) {
      let analyticsId = readCookie('site_analytics_id');
      let validId = false;
      try { validId = /^[a-f0-9-]{36}$/i.test(decodeURIComponent(analyticsId)); } catch { validId = false; }
      if (!validId) {
        analyticsId = crypto.randomUUID();
        setCookie('site_analytics_id', analyticsId, 180);
      }
      if (window.location.pathname !== '/admin.html') sendPageView(analyticsId);
    } else removeCookie('site_analytics_id');
    if (consent.marketing) {
      if (!readCookie('site_marketing')) setCookie('site_marketing', 'enabled', 90);
    } else removeCookie('site_marketing');
  }

  function applyConsent(consent) {
    const normalized = { essential: true, analytics: Boolean(consent.analytics), marketing: Boolean(consent.marketing), updated: new Date().toISOString() };
    setCookie('site_consent', JSON.stringify(normalized), 365, true);
    activateConsent(normalized);
    document.querySelector('.cookie-dialog')?.remove();
  }

  function sendPageView(visitorId) {
    const payload = {
      visitorId,
      path: `${location.pathname}${location.search}`.slice(0, 300),
      referrer: document.referrer || '',
      screen: `${screen.width}x${screen.height}`
    };
    fetch('/api/analytics/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', keepalive: true, body: JSON.stringify(payload) }).catch(() => {});
  }

  function showCookieBanner(settings = false) {
    document.querySelector('.cookie-dialog')?.remove();
    const current = preferencesFromCookie() || { analytics: false, marketing: false };
    const dialog = document.createElement('section');
    dialog.className = 'cookie-dialog'; dialog.setAttribute('role', 'region'); dialog.setAttribute('aria-label', 'Privacy and cookie choices'); dialog.setAttribute('aria-labelledby', 'cookie-title');
    dialog.innerHTML = `
      <div class="cookie-copy"><p class="cookie-eyebrow">YOUR PRIVACY MATTERS</p><h2 id="cookie-title">${settings ? 'Privacy & cookie settings' : 'A choice about cookies'}</h2><p>Essential cookies keep your preferences working. Optional analytics help us understand which pages are useful; marketing cookies are only used if you choose them. You can change your choice at any time.</p><p class="cookie-legal-note">Analytics and marketing are optional. No optional cookies are set until you consent. <a href="privacy.html">Read our privacy notice</a>.</p></div>
      <div class="cookie-options">
        <label class="cookie-option"><input type="checkbox" checked disabled><span><strong>Essential</strong><small>Required for core site preferences and security. Always on.</small></span></label>
        <label class="cookie-option"><input id="consent-analytics" type="checkbox" ${current.analytics ? 'checked' : ''}><span><strong>Analytics</strong><small>Anonymous page-view totals and popular content.</small></span></label>
        <label class="cookie-option"><input id="consent-marketing" type="checkbox" ${current.marketing ? 'checked' : ''}><span><strong>Marketing</strong><small>Optional campaign attribution. Off unless you opt in.</small></span></label>
        <div class="cookie-actions"><button class="cookie-save" type="button">Save my choices</button><button class="cookie-accept" type="button">Accept all</button><button class="cookie-reject" type="button">Reject optional</button></div>
      </div>`;
    document.body.append(dialog);
    const analytics = dialog.querySelector('#consent-analytics');
    const marketing = dialog.querySelector('#consent-marketing');
    dialog.querySelector('.cookie-save').addEventListener('click', () => applyConsent({ analytics: analytics.checked, marketing: marketing.checked }));
    dialog.querySelector('.cookie-accept').addEventListener('click', () => applyConsent({ analytics: true, marketing: true }));
    dialog.querySelector('.cookie-reject').addEventListener('click', () => applyConsent({ analytics: false, marketing: false }));
    if (settings) dialog.querySelector('input:not([disabled])')?.focus({ preventScroll: true });
  }

  function openPrivacySettings(fromPanel = false) {
    showCookieBanner(true);
    if (fromPanel) document.querySelector('.cookie-dialog')?.scrollIntoView({ block: 'nearest' });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initThemeAndReadingTools();
    mountCookieControls();
    document.querySelectorAll('.inline-privacy-trigger').forEach(button => button.addEventListener('click', () => openPrivacySettings(true)));
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => anchor.addEventListener('click', event => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) { event.preventDefault(); target.scrollIntoView({ behavior: document.documentElement.classList.contains('reduce-motion') ? 'auto' : 'smooth', block: 'start' }); }
    }));
  });
})();
