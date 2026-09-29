window.SOTEServiceModel={
  statusLabel(status){return ({active:'Active',deploying:'Deploying',future:'Future',blocked:'Blocked',retired:'Retired'})[status]||status||'Unknown';},
  statusClass(status){return ({active:'green',deploying:'blue',future:'',blocked:'red',retired:'purple'})[status]||'';},
  classLabel(value){return String(value||'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());},
  async load(){
    const r=await fetch('data/services.json?v='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error('Service catalog unavailable');
    return r.json();
  }
};
