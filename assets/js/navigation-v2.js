(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const script = document.currentScript;
  const siteRoot = script ? new URL('../../', script.src).pathname : '/';
  const href = file => siteRoot + file;
  const current = location.pathname.split('/').pop() || 'index.html';

  const groups = {
    operations: ['operations.html','mission-command.html','missions.html','mission.html','mission-proposal.html','mission-lifecycle.html','operator.html','ticket-queue.html','ticket.html','project-status.html'],
    infrastructure: ['infrastructure.html','rack-1.html','rack-2.html','rack-3.html','zones.html'],
    services: ['services.html'],
    knowledge: ['knowledge-base.html','knowledge-article.html','knowledge-contribute.html'],
    organization: ['organization.html','student-technology-corps.html','get-involved.html'],
    explore: ['ecosystem.html','explore-zones.html','explore-guides.html','tour.html','start-here.html','environment-map.html','tour-mode.html','tour-guide-kit.html'],
    helpdesk: ['ace-help-desk.html','tickets.html']
  };

  const active = (key, file) => {
    if (key === 'home') return current === 'index.html';
    return (groups[key] || []).includes(current) || current === file;
  };

  header.innerHTML = '<div class="container header-inner">' +
    '<a class="brand" href="'+href('index.html')+'" aria-label="SOTE Command Portal home">' +
    '<img src="'+href('assets/img/brand/sote_paw_badge_icon.webp')+'" alt="" width="52" height="52">' +
    '<span><strong>SOTE Command Portal</strong><small>Student-Operated Technology Ecosystem</small></span></a>' +
    '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">Menu</button>' +
    '<nav id="primary-nav" class="primary-nav" aria-label="Primary navigation">' +
    '<a'+(active('home','index.html')?' class="active"':'')+' href="'+href('index.html')+'">Home</a>' +
    '<a'+(active('operations','operations.html')?' class="active"':'')+' href="'+href('operations.html')+'">Operations</a>' +
    '<a'+(active('infrastructure','infrastructure.html')?' class="active"':'')+' href="'+href('infrastructure.html')+'">Infrastructure</a>' +
    '<a'+(active('services','services.html')?' class="active"':'')+' href="'+href('services.html')+'">Services</a>' +
    '<a'+(active('knowledge','knowledge-base.html')?' class="active"':'')+' href="'+href('knowledge-base.html')+'">Knowledge</a>' +
    '<a'+(active('organization','organization.html')?' class="active"':'')+' href="'+href('organization.html')+'">Organization</a>' +
    '<a'+(active('explore','ecosystem.html')?' class="active"':'')+' href="'+href('ecosystem.html')+'">Explore</a>' +
    '<a'+(active('helpdesk','ace-help-desk.html')?' class="active"':'')+' href="'+href('ace-help-desk.html')+'">Help Desk</a>' +
    '</nav></div>';

  const button = header.querySelector('.nav-toggle');
  const nav = header.querySelector('#primary-nav');
  button?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    button?.setAttribute('aria-expanded', 'false');
  }));
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) {
      nav?.classList.remove('open');
      button?.setAttribute('aria-expanded', 'false');
    }
  });
})();
