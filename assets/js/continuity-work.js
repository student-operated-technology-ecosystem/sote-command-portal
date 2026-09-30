(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const humanize = value => String(value || '').replace(/_/g,' ').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());

  function statusClass(status){
    const v=String(status||'').toLowerCase();
    if(v.includes('ready')||v.includes('active')||v.includes('complete')) return 'green';
    if(v.includes('blocked')) return 'red';
    return 'blue';
  }

  function load(){
    return fetch('data/continuity-actions.json',{cache:'no-store'}).then(r=>{
      if(!r.ok) throw new Error('Continuity work queue unavailable');
      return r.json();
    });
  }

  function render(host,payload){
    const actions=payload?.schema_version===2 && Array.isArray(payload.actions)?payload.actions:[];
    if(!actions.length){
      host.innerHTML='<article class="card"><h3>No open continuity work is currently projected.</h3><p>Canonical continuity work remains in SOTE-framework GitHub issues.</p></article>';
      return;
    }
    host.innerHTML=actions.filter(a=>Number.isInteger(a.issue)&&a.issue>0&&a.title==='Continuity work #'+a.issue).map(a=>'<article class="card">'+
      '<span class="tag '+statusClass(a.status)+'">'+esc(humanize(a.status||'open'))+'</span>'+
      '<h2>'+esc(a.title)+'</h2>'+
      '</article>').join('');
    const stamp=document.querySelector('[data-continuity-generated]');
    if(stamp && payload.generated_at) stamp.textContent='Projection generated '+new Date(payload.generated_at).toLocaleString();
  }

  window.SOTE_CONTINUITY_WORK={load,render};
})();
