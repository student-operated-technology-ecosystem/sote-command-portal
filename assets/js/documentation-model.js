(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const humanize = value => String(value || '').replace(/_/g,' ').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());

  function loadGraph(){
    return fetch('data/visibility-graph.json',{cache:'no-store'}).then(r=>{
      if(!r.ok) throw new Error('Documentation graph unavailable');
      return r.json();
    });
  }

  function records(graph){
    const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
    const edges = Array.isArray(graph?.edges) ? graph.edges : [];
    const byId = new Map(nodes.map(n=>[n.id,n]));
    return nodes.filter(n=>['service','component','rack'].includes(n.type)).map(node=>{
      const docs = edges.filter(e=>e.from===node.id && ['documented_by','recovery_documented_by','validated_by'].includes(e.type)).map(e=>({type:e.type,node:byId.get(e.to)})).filter(x=>x.node);
      return {node,docs};
    }).filter(r=>r.docs.length);
  }

  function statusClass(status){
    const v=String(status||'').toLowerCase();
    if(v.includes('validated')||v.includes('complete')||v.includes('current')) return 'green';
    if(v.includes('draft')||v.includes('verify')||v.includes('partial')||v.includes('develop')) return 'blue';
    if(v.includes('pending')||v.includes('missing')) return 'red';
    return '';
  }

  window.SOTE_DOCUMENTATION={esc,humanize,loadGraph,records,statusClass};
})();