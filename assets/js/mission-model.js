(() => {
  const STATES = new Set(['Active','Approved / Queued','Discovery','Future / Backlog','Blocked','Open for Proposals','Completed']);
  function fromSnapshot(data) {
    return (data?.issues || []).filter(i => i.kind === 'mission').map(i => ({
      number: i.number,
      title: i.title,
      summary: i.public_summary || 'No approved public summary is available.',
      portfolio_state: STATES.has(i.portfolio_state) ? i.portfolio_state : 'Open for Proposals',
      state: i.state
    }));
  }
  function counts(missions) {
    const result = {};
    missions.forEach(m => { result[m.portfolio_state] = (result[m.portfolio_state] || 0) + 1; });
    return result;
  }
  window.SOTE_MISSIONS = { fromSnapshot, counts };
})();
