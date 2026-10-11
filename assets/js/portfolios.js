(() => {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;
  const status = document.getElementById('portfolio-status');
  const search = document.getElementById('portfolio-search');
  let entries = [];
  const allowed = url => {
    try {
      const u = new URL(url);
      return u.protocol === 'https:' && !!u.hostname && !u.username && !u.password;
    } catch { return false; }
  };
  const el = (tag, text, className) => {
    const item = document.createElement(tag);
    if (text) item.textContent = text;
    if (className) item.className = className;
    return item;
  };
  function render() {
    const needle = (search.value || '').toLowerCase().trim();
    const shown = entries.filter(p => [p.name,p.program,p.summary,...(p.skills || [])].join(' ').toLowerCase().includes(needle));
    grid.replaceChildren();
    shown.forEach(p => {
      if (!allowed(p.site)) return;
      const card = el('article', '', 'portfolio-card');
      card.append(el('p', p.kind === 'example' ? 'Fictional instructor demonstration' : 'Approved student portfolio', 'portfolio-tags'));
      card.append(el('h3', p.name));
      card.append(el('p', p.program || 'Student professional portfolio', 'portfolio-tags'));
      card.append(el('p', p.summary || 'Explore this portfolio for technical evidence and reflection.'));
      if (p.skills?.length) card.append(el('p', p.skills.join(' · '), 'portfolio-tags'));
      const actions = el('div', '', 'portfolio-actions');
      const site = el('a', 'Visit portfolio ↗'); site.href = p.site; site.target = '_blank'; site.rel = 'noopener noreferrer'; actions.append(site);
      if (p.github && allowed(p.github)) { const code = el('a', 'View GitHub ↗'); code.href = p.github; code.target = '_blank'; code.rel = 'noopener noreferrer'; actions.append(code); }
      card.append(actions); grid.append(card);
    });
    status.textContent = shown.length ? shown.length + ' portfolio' + (shown.length === 1 ? '' : 's') + ' shown' : 'No matching portfolios.';
  }
  fetch('data/portfolio-directory.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw Error('Directory unavailable'); return r.json(); })
    .then(data => { entries = Array.isArray(data.portfolios) ? data.portfolios : []; render(); })
    .catch(() => { status.textContent = 'The portfolio directory is temporarily unavailable. Please try again later.'; });
  search.addEventListener('input', render);
})();