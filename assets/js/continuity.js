(() => {
  const matrixHost = document.querySelector('[data-continuity-matrix]');
  const summaryHost = document.querySelector('[data-continuity-summary]');
  const defectHost = document.querySelector('[data-continuity-defects]');
  if (!matrixHost && !summaryHost && !defectHost) return;

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

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const humanize = value => String(value || 'unknown').replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const stateRank = value => {
    const v = String(value || '').toLowerCase();
    if (['complete', 'validated', 'known', 'operational'].includes(v)) return 2;
    if (['partial', 'in-progress', 'developing', 'deploying', 'recommissioning'].includes(v)) return 1;
    return 0;
  };
  const stateClass = value => stateRank(value) === 2 ? 'green' : stateRank(value) === 1 ? 'blue' : 'red';
  const actionsOf = actionData => Array.isArray(actionData?.actions) ? actionData.actions : [];
  const workFor = (rackId, control, actionData) => actionsOf(actionData).filter(action =>
    Array.isArray(action.affected_objects) && action.affected_objects.includes(rackId) &&
    Array.isArray(action.controls) && action.controls.includes(control)
  );

  const renderSummary = (data, actionData) => {
    if (!summaryHost) return;
    const tracked = data.racks.flatMap(rack => Object.entries(rack.continuity || {}).map(([control, value]) => ({rack, control, value})));
    const all = tracked.map(item => item.value);
    const established = all.filter(v => stateRank(v) === 2).length;
    const developing = all.filter(v => stateRank(v) === 1).length;
    const pendingItems = tracked.filter(item => stateRank(item.value) === 0);
    const pending = pendingItems.length;
    const coveredPending = pendingItems.filter(item => workFor(item.rack.id, item.control, actionData).length).length;
    const unassignedPending = pending - coveredPending;
    const total = all.length;
    const pct = total ? Math.round((established / total) * 100) : 0;
    summaryHost.innerHTML = `
      <article class="card"><span class="tag green">${established}</span><h3>Established controls</h3><p>Controls currently recorded as complete, known, validated, or operational.</p></article>
      <article class="card"><span class="tag blue">${developing}</span><h3>Developing controls</h3><p>Controls currently partial or actively being built and documented.</p></article>
      <article class="card"><span class="tag red">${pending}</span><h3>Pending controls</h3><p>${coveredPending} linked to canonical work. ${unassignedPending} currently have no matching continuity work item.</p></article>
      <article class="card"><span class="tag">${pct}%</span><h3>Established coverage</h3><p>Established controls divided by all currently tracked rack controls. This is a continuity indicator, not a technical uptime score.</p></article>`;
  };

  const renderMatrix = data => {
    if (!matrixHost) return;
    const controls = data.continuity_controls || Object.keys(data.racks?.[0]?.continuity || {});
    matrixHost.innerHTML = `
      <div class="table-wrap"><table><thead><tr><th>Continuity control</th>${data.racks.map(r => `<th>${esc(r.name)}</th>`).join('')}</tr></thead><tbody>
      ${controls.map(control => `<tr><td><strong>${esc(labels[control] || humanize(control))}</strong></td>${data.racks.map(rack => {
        const value = rack.continuity?.[control] || 'pending';
        return `<td><span class="tag ${stateClass(value)}">${esc(humanize(value))}</span></td>`;
      }).join('')}</tr>`).join('')}
      </tbody></table></div>`;
  };

  const renderDefects = (data, actionData) => {
    if (!defectHost) return;
    const defects = [];
    data.racks.forEach(rack => Object.entries(rack.continuity || {}).forEach(([control, value]) => {
      if (stateRank(value) < 2) defects.push({ rack, control, value, rank: stateRank(value), work: workFor(rack.id, control, actionData) });
    }));
    defects.sort((a, b) => a.rank - b.rank || Number(Boolean(b.work.length)) - Number(Boolean(a.work.length)) || a.rack.id.localeCompare(b.rack.id));
    defectHost.innerHTML = defects.slice(0, 12).map(item => {
      const action = item.work[0];
      const ownership = action
        ? `<p><span class="tag blue">Work exists · #${esc(action.issue)}</span></p><p><strong>Responsible role:</strong> ${esc(action.responsible_role || 'Not published')}</p><a class="card-link" target="_blank" rel="noopener" href="${esc(action.url)}">Open canonical work item ↗</a>`
        : `<p><span class="tag red">Unassigned continuity debt</span></p><p>No matching canonical continuity work item is currently published for this rack/control pair.</p><a class="card-link" href="continuity-work.html">Open Continuity Work Queue →</a>`;
      return `
      <article class="card">
        <span class="tag ${stateClass(item.value)}">${esc(humanize(item.value))}</span>
        <h3>${esc(item.rack.name)}: ${esc(labels[item.control] || humanize(item.control))}</h3>
        <p>This control has not yet reached an established state. Treat it as continuity debt to resolve through documentation, validation, configuration capture, or an appropriate mission.</p>
        ${ownership}
        <p><a class="card-link" href="${esc(item.rack.id)}.html">Open rack view →</a></p>
      </article>`;
    }).join('') || '<article class="card"><h3>No continuity defects recorded</h3></article>';
  };

  Promise.all([
    fetch('data/infrastructure.json', { cache: 'no-store' }).then(response => {
      if (!response.ok) throw new Error('Continuity data unavailable');
      return response.json();
    }),
    fetch('data/continuity-actions.json', { cache: 'no-store' }).then(response => response.ok ? response.json() : {actions: []}).catch(() => ({actions: []}))
  ])
    .then(([data, actionData]) => {
      renderSummary(data, actionData);
      renderMatrix(data);
      renderDefects(data, actionData);
    })
    .catch(() => {
      document.querySelectorAll('[data-continuity-fallback]').forEach(el => el.hidden = false);
    });
})();
