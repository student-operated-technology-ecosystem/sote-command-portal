(() => {
  const host = document.querySelector('[data-responsibility-explorer]');
  if (!host) return;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const humanize = value => String(value || '').replace(/_/g,' ').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  const responsibilityTypes = new Set(['governed_by','operated_by','maintained_by','planned_operator','operated_by_when_authorized']);
  const labels = {
    governed_by: 'Governs',
    operated_by: 'Operates',
    maintained_by: 'Maintains',
    planned_operator: 'Planned operator for',
    operated_by_when_authorized: 'Operates when specifically authorized'
  };

  function render(data) {
    const nodes = Array.isArray(data.nodes) ? data.nodes : [];
    const edges = Array.isArray(data.edges) ? data.edges : [];
    const byId = new Map(nodes.map(n => [n.id, n]));
    const roles = nodes.filter(n => n.type === 'role');
    const requested = new URLSearchParams(location.search).get('role');
    const initial = roles.some(r => r.id === requested) ? requested : 'role-sote-operations';

    host.innerHTML = '<div class="filter-panel"><label for="responsibility-role"><strong>View responsibility for</strong></label><select id="responsibility-role">' +
      roles.map(r => '<option value="'+esc(r.id)+'"'+(r.id===initial?' selected':'')+'>'+esc(r.name)+'</option>').join('') +
      '</select></div><div id="responsibility-result"></div>';

    const select = document.getElementById('responsibility-role');
    const result = document.getElementById('responsibility-result');

    function renderRole(id) {
      const role = byId.get(id);
      if (!role) return;
      const responsibilities = edges
        .filter(e => e.to === id && responsibilityTypes.has(e.type))
        .map(e => ({edge:e, object:byId.get(e.from)}))
        .filter(x => x.object);
      const orgLinks = edges
        .filter(e => (e.from === id || e.to === id) && !responsibilityTypes.has(e.type))
        .map(e => ({edge:e, other:byId.get(e.from === id ? e.to : e.from), outgoing:e.from === id}))
        .filter(x => x.other && x.other.type === 'role');

      result.innerHTML = '<article class="card"><span class="tag">'+esc(humanize(role.status||'role'))+'</span><h2>'+esc(role.name)+'</h2><p>'+esc(role.summary||'Persistent SOTE role.')+'</p><div class="hero-actions"><a class="button secondary" href="relationships.html?node='+encodeURIComponent(role.id)+'">Open in Relationship Explorer</a></div></article>' +
        '<div class="section-heading" style="margin-top:2rem"><h2>Published responsibility</h2><p>Responsibility belongs to the role, not to whichever person currently occupies it.</p></div>' +
        '<div class="card-grid">' + (responsibilities.length ? responsibilities.map(item => {
          const obj = item.object;
          const open = obj.path ? '<a class="card-link" href="'+esc(obj.path)+'">Open related view →</a>' : '<a class="card-link" href="relationships.html?node='+encodeURIComponent(obj.id)+'">Explore object →</a>';
          return '<article class="card"><span class="tag">'+esc(labels[item.edge.type]||humanize(item.edge.type))+'</span><h3>'+esc(obj.name)+'</h3><p>'+esc(humanize(obj.type))+' · '+esc(obj.status||'recorded')+'</p>'+open+'</article>';
        }).join('') : '<article class="card"><h3>No published responsibility records</h3><p>No public-safe operational ownership has been recorded for this role yet.</p></article>') + '</div>' +
        (orgLinks.length ? '<div class="section-heading" style="margin-top:2rem"><h2>Organizational relationships</h2></div><div class="pill-row">'+orgLinks.map(item=>'<span class="pill"><strong>'+esc(item.outgoing?humanize(item.edge.type):'Related role')+':</strong> '+esc(item.other.name)+'</span>').join('')+'</div>' : '');
    }

    select.addEventListener('change', () => {
      renderRole(select.value);
      history.replaceState(null,'','?role='+encodeURIComponent(select.value));
    });
    renderRole(initial);
  }

  fetch('data/visibility-graph.json', {cache:'no-store'})
    .then(r => { if (!r.ok) throw new Error('Responsibility data unavailable'); return r.json(); })
    .then(render)
    .catch(() => { host.innerHTML = '<article class="card"><h2>Responsibility data unavailable</h2><p>Please try again shortly.</p></article>'; });
})();
