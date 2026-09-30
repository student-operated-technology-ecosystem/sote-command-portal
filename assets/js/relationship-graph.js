(() => {
  const host = document.querySelector('[data-relationship-explorer]');
  if (!host) return;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const portalPath = value => typeof value === 'string' && /^(?:[a-z0-9-]+\/)*[a-z0-9-]+\.html(?:#[a-z0-9-]+)?$/i.test(value) ? value : '';
  const canonicalUrl = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === 'github.com' &&
        url.pathname.startsWith('/student-operated-technology-ecosystem/SOTE-framework/') ? url.href : '';
    } catch (_) { return ''; }
  };
  const humanize = value => String(value || '').replace(/_/g,' ').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  const stateClass = value => {
    const v = String(value || '').toLowerCase();
    if (v.includes('active') || v.includes('complete') || v === 'operational' || v === 'governance') return 'green';
    if (v.includes('deploy') || v.includes('develop') || v.includes('progress') || v.includes('discovery') || v.includes('recommission') || v.includes('mission-scoped')) return 'blue';
    if (v.includes('restricted') || v.includes('blocked')) return 'red';
    return '';
  };

  function render(data) {
    const nodes = Array.isArray(data.nodes) ? data.nodes : [];
    const edges = Array.isArray(data.edges) ? data.edges : [];
    const byId = new Map(nodes.map(n => [n.id, n]));
    const selected = new URLSearchParams(location.search).get('node');
    const initial = byId.has(selected) ? selected : 'glpi';

    host.innerHTML = '<div class="filter-panel"><label for="relationship-node"><strong>Explore from</strong></label><select id="relationship-node">' +
      nodes.map(n => '<option value="'+esc(n.id)+'"'+(n.id===initial?' selected':'')+'>'+esc(n.name)+' · '+esc(humanize(n.type))+'</option>').join('') +
      '</select></div><div id="relationship-result"></div>';

    const select = document.getElementById('relationship-node');
    const result = document.getElementById('relationship-result');

    function renderNode(id) {
      const node = byId.get(id);
      if (!node) return;
      const incoming = edges.filter(e => e.to === id).map(e => ({direction:'incoming', edge:e, other:byId.get(e.from)}));
      const outgoing = edges.filter(e => e.from === id).map(e => ({direction:'outgoing', edge:e, other:byId.get(e.to)}));
      const relations = [...outgoing, ...incoming].filter(r => r.other);
      const primaryLink = portalPath(node.path) ? '<a class="button secondary" href="'+esc(portalPath(node.path))+'">Open portal view</a>' : '';
      const sourceLink = canonicalUrl(node.url) ? '<a class="button secondary" target="_blank" rel="noopener" href="'+esc(canonicalUrl(node.url))+'">Open canonical source</a>' : '';
      const responsibilityLink = node.type === 'role' ? '<a class="button secondary" href="responsibility.html?role='+encodeURIComponent(node.id)+'">Open responsibility view</a>' : '';
      const summary = node.summary ? '<p>'+esc(node.summary)+'</p>' : '';
      result.innerHTML = '<article class="card"><span class="tag '+stateClass(node.status)+'">'+esc(node.status || humanize(node.type))+'</span><h2>'+esc(node.name)+'</h2>'+summary+'<p><strong>Object type:</strong> '+esc(humanize(node.type))+'</p><div class="hero-actions">'+primaryLink+sourceLink+responsibilityLink+'</div></article>' +
        '<div class="section-heading" style="margin-top:2rem"><h2>Relationships</h2><p>Public-safe relationships only. This view describes dependencies, responsibility, and organizational context, not privileged access paths.</p></div>' +
        '<div class="card-grid">' + (relations.length ? relations.map(r => {
          const verb = humanize(r.edge.type);
          const sentence = r.direction === 'outgoing' ? verb + ' →' : '← ' + verb;
          const otherLink = r.other.type === 'role' ? '<a class="card-link" href="responsibility.html?role='+encodeURIComponent(r.other.id)+'">Open responsibility →</a>' : portalPath(r.other.path) ? '<a class="card-link" href="'+esc(portalPath(r.other.path))+'">Open related view →</a>' : '<button class="card-link" type="button" data-select-node="'+esc(r.other.id)+'">Explore this object →</button>';
          return '<article class="card"><span class="tag">'+esc(sentence)+'</span><h3>'+esc(r.other.name)+'</h3><p>'+esc(humanize(r.other.type))+' · '+esc(r.other.status || 'recorded')+'</p>'+otherLink+'</article>';
        }).join('') : '<article class="card"><h3>No published relationships</h3><p>No public-safe relationships are currently recorded for this object.</p></article>') + '</div>';
      result.querySelectorAll('[data-select-node]').forEach(button => button.addEventListener('click', () => {
        select.value = button.dataset.selectNode;
        renderNode(button.dataset.selectNode);
        history.replaceState(null,'','?node='+encodeURIComponent(button.dataset.selectNode));
      }));
    }

    select.addEventListener('change', () => {
      renderNode(select.value);
      history.replaceState(null,'','?node='+encodeURIComponent(select.value));
    });
    renderNode(initial);
  }

  fetch('data/visibility-graph.json', {cache:'no-store'})
    .then(r => { if (!r.ok) throw new Error('Relationship graph unavailable'); return r.json(); })
    .then(render)
    .catch(() => { host.innerHTML = '<article class="card"><h2>Relationship data unavailable</h2><p>Please try again shortly.</p></article>'; });
})();
