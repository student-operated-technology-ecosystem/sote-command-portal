(() => {
  const root = document.documentElement;
  const rackId = document.body?.dataset?.rackId;
  const dashboardHost = document.querySelector('[data-infrastructure-dashboard]');
  const componentHost = document.querySelector('[data-component-dashboard]');
  if (!rackId && !dashboardHost && !componentHost) return;

  const labels = {
    inventoried: 'Inventoried',
    located: 'Located',
    connected: 'Connected',
    addressed: 'Addressed',
    configured_reproducibly: 'Configured reproducibly',
    documented: 'Documented',
    recoverable: 'Recoverable',
    role_owned: 'Role-owned',
    discoverable: 'Discoverable',
    independently_validated: 'Independently validated'
  };

  const humanize = value => String(value || 'unknown')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  const statusClass = value => {
    const v = String(value || '').toLowerCase();
    if (['known', 'complete', 'validated', 'operational'].includes(v)) return 'green';
    if (['partial', 'in-progress', 'developing', 'deploying', 'recommissioning'].includes(v)) return 'blue';
    if (['pending', 'unknown', 'restricted-build'].includes(v)) return 'red';
    return '';
  };

  const continuityNote = (key, value) => {
    const valueText = humanize(value);
    const notes = {
      inventoried: `${valueText} inventory coverage in the current infrastructure record.`,
      located: `${valueText} physical or logical location documentation.`,
      connected: `${valueText} physical and logical connectivity documentation.`,
      addressed: `${valueText} network identity and addressing documentation where applicable.`,
      configured_reproducibly: `${valueText} reproducible configuration or rebuild representation.`,
      documented: `${valueText} runbook and operational documentation coverage.`,
      recoverable: `${valueText} recovery, restore, or rebuild documentation.`,
      role_owned: `${valueText} persistent role-based ownership rather than individual dependency.`,
      discoverable: `${valueText} ability for a new operator to locate the authoritative records.`,
      independently_validated: `${valueText} validation by someone other than the primary builder.`
    };
    return notes[key] || valueText;
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

  const tally = continuity => {
    const values = Object.values(continuity || {});
    const established = values.filter(v => ['known', 'complete', 'validated', 'operational'].includes(v)).length;
    const developing = values.filter(v => ['partial', 'in-progress', 'developing', 'deploying', 'recommissioning'].includes(v)).length;
    return { established, developing, pending: values.length - established - developing, total: values.length };
  };

  const renderDashboard = data => {
    if (!dashboardHost) return;
    dashboardHost.innerHTML = data.racks.map(rack => {
      const counts = tally(rack.continuity);
      return `<article class="card">
        <span class="tag ${rack.id === 'rack-3' ? 'red' : rack.id === 'rack-2' ? 'green' : 'blue'}">${humanize(rack.status)}</span>
        <h3>${rack.name}</h3>
        <p>${rack.purpose}</p>
        <div class="pill-row"><span class="pill">${counts.established} established</span><span class="pill">${counts.developing} developing</span><span class="pill">${counts.pending} pending</span></div>
        <a class="card-link" href="${rack.id}.html">Open rack view →</a>
      </article>`;
    }).join('');
  };

  const renderComponents = data => {
    if (!componentHost) return;
    componentHost.innerHTML = (data.components || []).map(component => {
      const rack = data.racks?.find(item => item.id === component.located_in);
      const provides = component.relationships?.provides || [];
      const depends = component.relationships?.depends_on || [];
      return `<article class="card">
        <span class="tag ${statusClass(component.status)}">${humanize(component.status)}</span>
        <h3>${component.name}</h3>
        <p>${component.purpose}</p>
        <div class="project-meta"><span><strong>Location</strong>${rack?.name || humanize(component.located_in)}</span><span><strong>Owner</strong>${(component.owned_by_role || []).join(', ')}</span></div>
        ${provides.length ? `<p><strong>Provides:</strong> ${provides.map(humanize).join(', ')}</p>` : ''}
        ${depends.length ? `<p><strong>Depends on:</strong> ${depends.map(humanize).join(', ')}</p>` : ''}
        <p class="page-note">${component.public_detail || 'Public-safe projection only.'}</p>
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
      renderComponents(data);
      root.dataset.infrastructureLoaded = 'true';
    })
    .catch(() => {
      document.querySelectorAll('[data-infrastructure-fallback]').forEach(el => el.hidden = false);
      root.dataset.infrastructureLoaded = 'false';
    });
})();
