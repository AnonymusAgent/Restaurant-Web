document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.querySelector('#admin-login');
  const dashboard = document.querySelector('#admin-dashboard');
  const loginForm = document.querySelector('#login-form');
  const loginError = document.querySelector('#login-error');
  const notice = document.querySelector('#dashboard-notice');
  const number = new Intl.NumberFormat();

  const showDashboard = () => { loginSection.hidden = true; dashboard.hidden = false; };
  const showLogin = () => { dashboard.hidden = true; loginSection.hidden = false; };

  function fillTable(id, rows, columns, emptyMessage) {
    const body = document.getElementById(id);
    body.replaceChildren();
    if (!rows?.length) {
      const tr = document.createElement('tr'); const td = document.createElement('td');
      td.colSpan = columns.length; td.textContent = emptyMessage; tr.append(td); body.append(tr); return;
    }
    rows.forEach(row => {
      const tr = document.createElement('tr');
      columns.forEach(column => { const td = document.createElement('td'); td.textContent = String(row[column.key] ?? '—'); tr.append(td); });
      body.append(tr);
    });
  }

  async function loadAnalytics(authenticated = false) {
    notice.textContent = 'Loading analytics…';
    const range = document.querySelector('#range-select').value;
    try {
      const response = await fetch(`/api/admin/analytics?range=${encodeURIComponent(range)}`, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
      if (response.status === 401) { showLogin(); notice.textContent = ''; return; }
      const data = await response.json().catch(() => ({ error: 'Admin APIs are available on the Vercel deployment; static preview only serves the website files.' }));
      if (!response.ok) throw new Error(data.error || 'Could not load analytics.');
      showDashboard(); notice.textContent = data.note || '';
      document.querySelector('#last-updated').textContent = `Updated ${new Date(data.generatedAt).toLocaleString()}`;
      document.querySelector('#metric-views').textContent = number.format(data.overview.page_views || 0);
      document.querySelector('#metric-visitors').textContent = number.format(data.overview.unique_visitors || 0);
      document.querySelector('#metric-pages').textContent = number.format(data.overview.unique_pages || 0);
      document.querySelector('#metric-consent').textContent = 'Opt-in';
      fillTable('pages-body', data.pages, [{ key: 'path' }, { key: 'views' }, { key: 'visitors' }], 'No opted-in page views yet.');
      fillTable('referrers-body', data.referrers, [{ key: 'source' }, { key: 'visits' }], 'No referral data yet.');
      fillTable('devices-body', data.devices, [{ key: 'device' }, { key: 'views' }], 'No device data yet.');
      drawTrend(data.daily || []);
    } catch (error) {
      if (authenticated || !dashboard.hidden) { showDashboard(); notice.textContent = error.message; }
      else { showLogin(); loginError.textContent = error.message; }
    }
  }

  function drawTrend(points) {
    const chart = document.querySelector('#trend-chart'); chart.replaceChildren();
    const selected = points.slice(-45);
    if (!selected.length) { chart.textContent = 'No opted-in visits yet.'; chart.setAttribute('aria-label', 'No page-view data for this period'); return; }
    const max = Math.max(1, ...selected.map(point => Number(point.views) || 0));
    chart.setAttribute('aria-label', `${selected.length} days of page-view data. Peak ${max} views in one day.`);
    selected.forEach(point => {
      const bar = document.createElement('div'); bar.className = 'trend-bar';
      const views = Number(point.views) || 0;
      bar.style.height = `${Math.max(2, views / max * 100)}%`;
      bar.title = `${point.day}: ${number.format(views)} page views`;
      bar.setAttribute('aria-hidden', 'true'); chart.append(bar);
    });
  }

  loginForm.addEventListener('submit', async event => {
    event.preventDefault(); loginError.textContent = '';
    const button = loginForm.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Signing in…';
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: document.querySelector('#admin-email').value, password: document.querySelector('#admin-password').value }) });
      const data = await response.json().catch(() => ({ error: 'Admin sign-in requires the Vercel API deployment.' }));
      if (!response.ok) throw new Error(data.error || 'Sign-in failed.');
      loginForm.reset(); await loadAnalytics(true);
    } catch (error) { loginError.textContent = error.message; }
    finally { button.disabled = false; button.textContent = 'Sign in securely'; }
  });

  document.querySelector('#range-select').addEventListener('change', loadAnalytics);
  document.querySelector('#refresh-button').addEventListener('click', loadAnalytics);
  document.querySelector('#logout-button').addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    showLogin(); loginError.textContent = 'You have signed out.';
  });

  loadAnalytics();
});
