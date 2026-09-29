(() => {
  const STATES = new Set(['Active','Approved / Queued','Discovery','Future / Backlog','Blocked','Open for Proposals','Completed']);

  function fromSnapshot(data) {
    return (data?.issues || []).filter(i => i.kind === 'mission').map(i => ({
      number: i.number,
      title: i.title,
      summary: i.public_summary || 'No approved public summary is available.',
      portfolio_state: STATES.has(i.portfolio_state) ? i.portfolio_state : 'Open for Proposals',
      state: i.state,
      source: 'snapshot'
    }));
  }

  function fromGraph(graph) {
    return (graph?.nodes || []).filter(n => n.type === 'mission' && n.issue).map(n => ({
      number: n.issue,
      title: n.name,
      summary: n.public_summary || 'Explore the mission record and its public-safe relationships across SOTE.',
      portfolio_state: STATES.has(n.status) ? n.status : 'Discovery',
      state: 'open',
      source: 'relationship-graph'
    }));
  }

  function merge(snapshotMissions, graphMissions) {
    const byNumber = new Map();
    graphMissions.forEach(m => byNumber.set(String(m.number), m));
    snapshotMissions.forEach(m => byNumber.set(String(m.number), {...byNumber.get(String(m.number)), ...m}));
    return [...byNumber.values()].sort((a,b) => Number(b.number) - Number(a.number));
  }

  function counts(missions) {
    const result = {};
    missions.forEach(m => { result[m.portfolio_state] = (result[m.portfolio_state] || 0) + 1; });
    return result;
  }

  function relationshipsForMission(graph, number) {
    const missionId = 'mission-' + number;
    const nodes = new Map((graph?.nodes || []).map(n => [n.id, n]));
    return (graph?.edges || []).filter(e => e.from === missionId || e.to === missionId).map(e => {
      const outgoing = e.from === missionId;
      const otherId = outgoing ? e.to : e.from;
      return {
        direction: outgoing ? 'outgoing' : 'incoming',
        type: e.type,
        other: nodes.get(otherId) || {id: otherId, name: otherId, type: 'object'}
      };
    });
  }

  function loadGraph() {
    return fetch('data/visibility-graph.json', {cache:'no-store'}).then(r => {
      if (!r.ok) throw new Error('Mission relationship graph unavailable');
      return r.json();
    });
  }

  window.SOTE_MISSIONS = { fromSnapshot, fromGraph, merge, counts, relationshipsForMission, loadGraph };
})();
