(() => {
  const form = document.querySelector('#ticket-form');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const value = id => document.getElementById(id).value.trim();
    const body = [
      '## Support request',
      `**Requested by:** ${value('t-requester') || 'To be confirmed'}`,
      `**Location:** ${value('t-location') || 'To be confirmed'}`,
      '', '### What happened / what is needed', value('t-scope'),
      '', '### Triage', 'Category, priority, assignee, and acceptance criteria to be determined by a SOTE operator.',
      '', 'Created from the SOTE Help Desk preview.'
    ].join('\n');
    const url = 'https://github.com/student-operated-technology-ecosystem/SOTE-framework/issues/new?title=' +
      encodeURIComponent('[TICKET] ' + value('t-title')) + '&body=' + encodeURIComponent(body);
    window.location.href = url;
  });

  const host = document.getElementById('ticket-list');
  if (!host) return;
  const issues = window.SOTE_PROJECT_DATA?.issues || [];
  const tickets = issues.filter(issue => /^\[TICKET\]/i.test(issue.title || '')).slice(0, 8);
  if (!tickets.length) {
    host.innerHTML = '<p>No ticket-designated items are available in the current snapshot. Operators can check the operations repository for the full queue.</p>';
    return;
  }
  host.replaceChildren();
  tickets.forEach(issue => {
    const item = document.createElement('article');
    item.className = 'ticket-row';
    const label = document.createElement('span');
    label.className = 'ticket-number';
    label.textContent = '#' + issue.number;
    const title = document.createElement('h3');
    title.textContent = issue.title.replace(/^\[TICKET\]\s*/i, '');
    const status = document.createElement('span');
    status.className = 'ticket-state';
    status.textContent = 'Open';
    item.append(label, title, status);
    host.append(item);
  });
})();
