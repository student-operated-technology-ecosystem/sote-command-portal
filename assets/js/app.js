
/* Site-wide public shell normalization */
(() => {
  const script = document.currentScript;
  const siteRoot = script ? new URL('../../', script.src).pathname : '/';
  const href = file => siteRoot + file;
  const bannerText = 'External Testing Preview — Not an official public CCAC website.';

  let banner = document.querySelector('.prototype-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'prototype-banner';
    document.body.prepend(banner);
  }
  banner.textContent = bannerText;

  const header = document.querySelector('.site-header');
  if (header) {
    const current = location.pathname.split('/').pop() || 'index.html';
    const exploreFiles = ['ecosystem.html','tour.html','characters.html','zones.html','badges.html','student-technology-corps.html','corps.html','mission-board.html','tour-mode.html','tour-guide-kit.html','environment-map.html','start-here.html'];
    const activeFor = file => {
      if (file === 'ecosystem.html' && (exploreFiles.includes(current) || location.pathname.includes('/characters/') || location.pathname.includes('/missions/') || location.pathname.includes('/zones/') || location.pathname.includes('/spaces/') || location.pathname.includes('/pages/'))) return ' class="active"';
      return current === file ? ' class="active"' : '';
    };
    header.innerHTML = '<div class="container header-inner">' +
      '<a class="brand" href="'+href('index.html')+'" aria-label="SOTE Command Portal home">' +
      '<img src="'+href('assets/img/brand/sote_paw_badge_icon.webp')+'" alt="" width="52" height="52">' +
      '<span><strong>SOTE Command Portal</strong><small>Student-Operated Technology Ecosystem</small></span></a>' +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">Menu</button>' +
      '<nav id="primary-nav" class="primary-nav" aria-label="Primary navigation">' +
      '<a'+activeFor('index.html')+' href="'+href('index.html')+'">Home</a>' +
      '<a'+activeFor('ace-help-desk.html')+' href="'+href('ace-help-desk.html')+'">Ace Help Desk</a>' +
      '<a'+activeFor('knowledge-base.html')+' href="'+href('knowledge-base.html')+'">Knowledge Base</a>' +
      '<a'+activeFor('projects.html')+' href="'+href('projects.html')+'">Projects</a>' +
      '<a'+activeFor('ecosystem.html')+' href="'+href('ecosystem.html')+'">Explore SOTE</a>' +
      '</nav></div>';
    const button = header.querySelector('.nav-toggle');
    const nav = header.querySelector('#primary-nav');
    button?.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('.site-footer').forEach(footer => {
    footer.querySelectorAll('p').forEach(p => {
      if (/static package|true baseline|portal version|canonical baseline/i.test(p.textContent)) {
        p.textContent = 'Student-Operated Technology Ecosystem';
      }
    });
  });

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    if (node.parentElement?.closest('.prototype-banner')) return;
    node.nodeValue = node.nodeValue
      .replace(/Prototype Preview/gi, 'External Testing Preview')
      .replace(/Working draft for SOTE review and tester feedback\.?/gi, '')
      .replace(/\bv0\.\d+\s+(?:approved[- ]media\s+)?baseline\b/gi, '')
      .replace(/\bDemo mission, fully functional\b/gi, 'Visitor mission')
      .replace(/\bTechnology Cadet demo mission\b/gi, 'Technology Cadet mission')
      .replace(/\bTechnology Cadet demo\b/gi, 'Technology Cadet mission')
      .replace(/\bThis demo runs\b/gi, 'This mission runs')
      .replace(/\bv0\.8 media note:\s*/gi, 'Media note: ');
  });
})();


const SOTE_VERSION = "v0.9";
const ASSET_VERSION = "0.9";
const tourStops = [{"kicker": "Start Tour", "name": "Welcome to SOTE", "slug": "index", "visual": "assets/tour/start-tour.svg", "desc": "Students do not just study technology. They operate it.", "sees": "A branded command portal that makes the ecosystem feel real.", "focus": "Access. Learn. Build. Defend. Lead."}, {"kicker": "Stop 1", "name": "CEIT 325 Classroom", "slug": "ceit-325-classroom", "visual": "assets/tour/ceit-325-classroom.svg", "desc": "The classroom is the student launch point for operating the ecosystem.", "sees": "Workstations, instruction, and access terminals.", "focus": "Begin with First Signal and Technology Cadet readiness."}, {"kicker": "Stop 2", "name": "Mission Control", "slug": "mission-control", "visual": "assets/tour/mission-control.svg", "desc": "The operator floor for network status, troubleshooting, console access, and briefings.", "sees": "Switching, console workflows, status boards, and command-center language.", "focus": "Observe, connect, diagnose, and resolve."}, {"kicker": "Stop 3", "name": "Rocket's Forge", "slug": "rockets-forge", "visual": "assets/tour/rockets-forge.svg", "desc": "The teaching datacenter where students build, provision, host, and orchestrate.", "sees": "Servers, Proxmox, storage, templates, and infrastructure services.", "focus": "Rocket Approved builds and repeatable documentation."}, {"kicker": "Stop 4", "name": "Western Pennsylvania Cyber Defense Command", "slug": "western-pennsylvania-cyber-defense-command", "visual": "assets/tour/cyber-defense-command.svg", "desc": "The cyber range where students practice defense, investigation, and recovery.", "sees": "Cyber range systems, scenarios, and Sir Kingston watchlist identity.", "focus": "Detect, defend, investigate, and recover."}, {"kicker": "Stop 5", "name": "Patch Bay Alpha", "slug": "patch-bay-alpha", "visual": "assets/tour/patch-bay-alpha.svg", "desc": "The physical-layer and security-edge staging bay.", "sees": "Orange wall, blue cabling, patch rack, cable tray, and security-edge staging.", "focus": "CONNECT. PATCH. VERIFY."}, {"kicker": "Stop 6", "name": "Rocket's Engineering Bay", "slug": "rockets-engineering-bay", "visual": "assets/tour/rockets-engineering-bay.svg", "desc": "The R&D and hardware staging space for server prep, parts validation, and experiments.", "sees": "Staged hardware, rails, parts, and engineering workbench workflows.", "focus": "Inspect, stage, test, and document."}, {"kicker": "Final", "name": "Mission Complete", "slug": "badges", "visual": "assets/tour/mission-complete.svg", "desc": "Visitors can complete First Signal and claim the Technology Cadet badge.", "sees": "A pathway from visitor to Student Technology Corps member.", "focus": "Turn curiosity into participation."}];
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}
let activeTourIndex = 0;
function updateTour(index) {
  if (!tourStops.length) return;
  activeTourIndex = (index + tourStops.length) % tourStops.length;
  const stop = tourStops[activeTourIndex];
  const img = document.getElementById('tourVisualImg');
  const kicker = document.getElementById('tourKicker');
  const name = document.getElementById('tourName');
  const desc = document.getElementById('tourDescription');
  const sees = document.getElementById('tourStudentSees');
  const focus = document.getElementById('tourMissionFocus');
  if (img) { img.src = stop.visual + '?v=' + ASSET_VERSION; img.alt = stop.name + ' approved media card'; }
  if (kicker) kicker.textContent = stop.kicker;
  if (name) name.textContent = stop.name;
  if (desc) desc.textContent = stop.desc;
  if (sees) sees.textContent = stop.sees;
  if (focus) focus.textContent = stop.focus;
  document.querySelectorAll('.tour-stop').forEach((button, i) => button.classList.toggle('active', i === activeTourIndex));
}
document.querySelectorAll('.tour-stop').forEach((button) => {
  button.addEventListener('click', () => updateTour(Number(button.dataset.tourIndex || 0)));
});
const nextTour = document.getElementById('nextTour');
const prevTour = document.getElementById('prevTour');
if (nextTour) nextTour.addEventListener('click', () => updateTour(activeTourIndex + 1));
if (prevTour) prevTour.addEventListener('click', () => updateTour(activeTourIndex - 1));
const pills = document.querySelectorAll('.filter-pill');
const projectCards = document.querySelectorAll('.project-card');
pills.forEach((pill) => {
  pill.addEventListener('click', () => {
    pills.forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    const filter = pill.dataset.filter;
    projectCards.forEach((card) => {
      card.style.display = (filter === 'all' || card.dataset.status === filter) ? '' : 'none';
    });
  });
});
updateTour(0);
