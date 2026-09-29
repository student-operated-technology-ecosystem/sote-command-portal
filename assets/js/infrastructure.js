(() => {
  const root = document.documentElement;
  const rackId = document.body?.dataset?.rackId;
  const dashboardHost = document.querySelector('[data-infrastructure-dashboard]');
  if (!rackId && !dashboardHost) return;

  const labels = {
    inventory: 'Inventory',
    location: 'Location',
    connections: 'Connections',
    runbooks: 'Runbooks',
    recovery: 'Recovery',
    independent_validation: 'Independent validation'
  };

  const humanize = value => String(value || 'unknown')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  const statusClass = value => {
    const v = String(value || '').toLowerCase();
    if (['known', 'complete', 'validated', 'operational'].includes(v)) return 'green';
    if (['partial', 'in-progress'].includes(v)) return 'blue';
    if (['pending', 'unknown'].includes(v)) return 'red';
    return '';
  };

  const renderContinuity = rack => {
    const host = document.querySelector('[data-continuity-grid]');
    if (!host || !rack?.continuity) return;
    host.innerHTML = Object.entries(rack.continuity).map(([key, value]) => `
      <article class="card">
        <span class="tag ${statusClass(value)}">${humanize(value)}</span>
        <h3>${labels[key] || humanize(key)}</h3>
        <p>${continuityNote(key, value)}</p>
      </article>`).join('');
  };

  const continuityNote = (key, value) => {
    const valueText = humanize(value);
    const notes = {
      inventory: `${valueText} asset inventory coverage in the current infrastructure record.`,
      location: `${valueText} physical location documentation.`,
      connections: `${valueText} physical and logical connectivity documentation.`,
      runbooks: `${valueText} operational procedure coverage.`,
      recovery: `${valueText} recovery or rebuild documentation.`,
      independent_validation: `${valueText} non-builder validation status.`
    };
    return notes[key] || valueText;
  };

  const renderRack = data => {
    const rack = data.racks?.find(item => item.id === rackId);
    if (!rack) return;
    document.querySelectorAll('[data-rack-status]').forEach(el => el.textContent = humanize(rack.status));
    document.querySelectorAll('[data-rack-purpose]').forEach(el => el.textContent = rack.purpose);
    document.querySelectorAll('[data-rack-authority]').forEach(el => el.textContent = rack.authority);
    document.querySelectorAll('[data-rack-priority]').forEach(el => el.textContent = rack.current_priority);
    const services = document.querySelector('[data-rack-services]');
    if (services) services.innerHTML = rack.services.map(service => `<span class="pill">${service}</span>`).join('');
    renderContinuity(rack);
  };

  const renderDashboard = data => {
    if (!dashboardHost) return;
    dashboardHost.innerHTML = data.racks.map(rack => {
      const values = Object.values(rack.continuity || {});
      const good = values.filter(v => ['known', 'complete', 'validated', 'operational'].includes(v)).length;
      const progressing = values.filter(v => ['partial', 'in-progress'].includes(v)).length;
      const pending = values.length - good - progressing;
      return `<article class="card">
        <span class="tag ${rack.id === 'rack-3' ? 'red' : rack.id === 'rack-2' ? 'green' : 'blue'}">${humanize(rack.status)}</span>
        <h3>${rack.name}</h3>
        <p>${rack.purpose}</p>
        <div class="pill-row"><span class="pill">${good} established</span><span class="pill">${progressing} developing</span><span class="pill">${pending} pending</span></div>
        <a class="card-link" href="${rack.id}.html">Open rack view →</a>
      </article>`;
    }).join('');
  };

  fetch('data/infrastructure.json', { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Infrastructure metadata unavailable');
      return response.json();
    })
    .then(data => {
      renderRack(data);
      renderDashboard(data);
      root.dataset.infrastructureLoaded = 'true';
    })
    .catch(() => {
      document.querySelectorAll('[data-infrastructure-fallback]').forEach(el => el.hidden = false);
      root.dataset.infrastructureLoaded = 'false';
    });
})();
