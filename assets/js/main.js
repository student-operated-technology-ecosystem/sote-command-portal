const navButton = document.querySelector('.nav-toggle');
const nav = document.querySelector('#primary-nav');
if (navButton && nav) {
  navButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navButton.setAttribute('aria-expanded', String(isOpen));
  });
}

const filterInput = document.querySelector('[data-filter-input]');
if (filterInput) {
  filterInput.addEventListener('input', () => {
    const term = filterInput.value.trim().toLowerCase();
    applyProjectFilters();
  });
}


// v0.3 guided tour controls
const tourButtons = Array.from(document.querySelectorAll('[data-tour-target]'));
const tourStops = Array.from(document.querySelectorAll('[data-tour-stop]'));
function showTourStop(id) {
  if (!tourStops.length) return;
  tourStops.forEach(stop => stop.classList.toggle('active', stop.dataset.tourStop === id));
  tourButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tourTarget === id));
}
tourButtons.forEach(btn => btn.addEventListener('click', () => showTourStop(btn.dataset.tourTarget)));
document.querySelectorAll('[data-tour-next]').forEach(btn => btn.addEventListener('click', () => showTourStop(btn.dataset.tourNext)));
if (tourStops.length) showTourStop(tourStops[0].dataset.tourStop);


// v0.5 project board filtering
let activeProjectFilter = 'all';
function applyProjectFilters() {
  const term = (document.querySelector('[data-filter-input]')?.value || '').trim().toLowerCase();
  document.querySelectorAll('[data-filter-card]').forEach(card => {
    const haystack = card.textContent.toLowerCase();
    const searchMatch = !term || haystack.includes(term);
    let statusMatch = true;
    if (activeProjectFilter && activeProjectFilter !== 'all') {
      if (activeProjectFilter.startsWith('bucket:')) {
        statusMatch = card.dataset.bucket === activeProjectFilter.slice(7);
      } else {
        statusMatch = card.dataset.status === activeProjectFilter;
      }
    }
    card.style.display = searchMatch && statusMatch ? '' : 'none';
  });
}
document.querySelectorAll('[data-status-filter]').forEach(button => {
  button.addEventListener('click', () => {
    activeProjectFilter = button.dataset.statusFilter;
    document.querySelectorAll('[data-status-filter]').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    applyProjectFilters();
  });
});
applyProjectFilters();


// v0.6 mission checklist demo
function updateMissionDemo() {
  document.querySelectorAll('[data-mission-demo]').forEach(demo => {
    const checks = Array.from(demo.querySelectorAll('[data-mission-check]'));
    const done = checks.filter(c => c.checked).length;
    const total = checks.length || 1;
    const pct = Math.round((done / total) * 100);
    const bar = demo.querySelector('[data-mission-progress-bar]');
    const text = demo.querySelector('[data-mission-progress-text]');
    const complete = demo.querySelector('[data-mission-complete]');
    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = `${done} of ${total} steps complete.`;
    if (complete) complete.hidden = done !== total;
  });
}
document.querySelectorAll('[data-mission-check]').forEach(check => check.addEventListener('change', updateMissionDemo));
updateMissionDemo();

// v0.6 project proposal draft builder
const proposalForm = document.querySelector('[data-proposal-form]');
const proposalOutput = document.querySelector('[data-proposal-output]');
const proposalText = document.querySelector('[data-proposal-text]');
function getProposalValue(name) {
  return proposalForm?.elements[name]?.value?.trim() || '';
}
document.querySelector('[data-generate-proposal]')?.addEventListener('click', () => {
  if (!proposalForm || !proposalOutput || !proposalText) return;
  const title = getProposalValue('title') || 'Untitled SOTE Project Proposal';
  const draft = `SOTE STUDENT PROJECT PROPOSAL\n\nProject title: ${title}\nStudent-facing name: ${getProposalValue('studentName')}\nConnected zone: ${getProposalValue('zone')}\nPathway: ${getProposalValue('pathway')}\n\nProblem or opportunity:\n${getProposalValue('problem')}\n\nProposed student work:\n${getProposalValue('work')}\n\nSuccess criteria:\n${getProposalValue('success')}\n\nResources or approvals needed:\n${getProposalValue('needs')}\n\nPublic-safe notes:\n${getProposalValue('safeNotes')}\n\nSafety reminder: Do not include credentials, student private data, sensitive configurations, internal secrets, or unapproved screenshots.`;
  proposalText.value = draft;
  proposalOutput.hidden = false;
  proposalText.focus();
});
document.querySelector('[data-copy-proposal]')?.addEventListener('click', async () => {
  if (!proposalText) return;
  proposalText.select();
  try { await navigator.clipboard.writeText(proposalText.value); } catch (e) { document.execCommand('copy'); }
});


// v1.0 knowledge base filtering
let activeKbCategory = 'all';
function applyKbFilters() {
  const term = (document.querySelector('[data-kb-filter-input]')?.value || '').trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll('[data-kb-card]').forEach(card => {
    const searchMatch = !term || card.textContent.toLowerCase().includes(term);
    const categoryMatch = activeKbCategory === 'all' || card.dataset.category === activeKbCategory;
    const show = searchMatch && categoryMatch;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const empty = document.querySelector('[data-kb-empty]');
  if (empty) empty.hidden = visible !== 0;
}
document.querySelector('[data-kb-filter-input]')?.addEventListener('input', applyKbFilters);
document.querySelectorAll('[data-kb-category]').forEach(button => {
  button.addEventListener('click', () => {
    activeKbCategory = button.dataset.kbCategory;
    document.querySelectorAll('[data-kb-category]').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    applyKbFilters();
  });
});
applyKbFilters();
