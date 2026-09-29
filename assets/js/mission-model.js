(() => {
  const normalize = value => String(value || '').trim();
  const upper = value => normalize(value).toUpperCase();

  function isMission(issue) {
    const title = upper(issue?.title);
    const body = upper(issue?.body);
    return title.includes('MISSION') || body.includes('# MISSION') || body.includes('## MISSION BRIEF') || body.includes('MISSION OBJECTIVE');
  }

  function extractStatusText(issue) {
    const body = normalize(issue?.body);
    const match = body.match(/(?:^|\n)#{1,3}\s+Status\s*\n([^#]*?)(?=\n#{1,3}\s|$)/i);
    return normalize(match?.[1] || '');
  }

  function portfolioState(issue) {
    const text = upper(`${issue?.title || ''}\n${extractStatusText(issue)}\n${issue?.body || ''}`);
    if (text.includes('BLOCKED')) return 'Blocked';
    if (text.includes('ACTIVE') || text.includes('IN EXECUTION') || text.includes('BUILD IN PROGRESS')) return 'Active';
    if (text.includes('DISCOVERY') || text.includes('INVESTIGATION CANDIDATE') || text.includes('RESEARCH')) return 'Discovery';
    if (text.includes('APPROVED / QUEUED') || text.includes('APPROVED/QUEUED') || text.includes('APPROVED BACKLOG') || text.includes('READY TO BUILD')) return 'Approved / Queued';
    if (text.includes('BACKLOG') || text.includes('FUTURE') || text.includes('PROPOSED MISSION')) return 'Future / Backlog';
    if (text.includes('OPEN FOR PROPOSALS')) return 'Open for Proposals';
    return issue?.state === 'closed' ? 'Completed' : 'Open for Proposals';
  }

  function summary(issue) {
    const body = normalize(issue?.body).replace(/\r/g, '');
    const objective = body.match(/(?:^|\n)#{1,3}\s+(?:Mission Objective|Objective|Problem Statement)\s*\n([^#]*?)(?=\n#{1,3}\s|$)/i)?.[1];
    const source = normalize(objective || body)
      .replace(/\*\*/g, '')
      .replace(/^[-#> ]+/gm, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return source.slice(0, 260) || 'Mission details are maintained in the canonical SOTE Framework record.';
  }

  function model(issue) {
    return {
      ...issue,
      portfolio_state: portfolioState(issue),
      status_text: extractStatusText(issue),
      summary: summary(issue)
    };
  }

  function fromSnapshot(data) {
    return (data?.issues || []).filter(isMission).map(model);
  }

  function counts(missions) {
    const result = {};
    missions.forEach(m => { result[m.portfolio_state] = (result[m.portfolio_state] || 0) + 1; });
    return result;
  }

  window.SOTE_MISSIONS = { isMission, portfolioState, summary, model, fromSnapshot, counts };
})();