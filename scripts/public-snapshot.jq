{
  schema_version: 2,
  generated_at: $generated_at,
  source: "student-operated-technology-ecosystem/SOTE-framework",
  issues: [
    $issues[0][] |
    select(.pull_request | not) |
    select(any(.labels[]?.name; . == "portal-public-approved")) |
    {
      number: .number,
      kind: (if any(.labels[]?.name; . == "portal-public-ticket") then "ticket" else "mission" end),
      title: (if any(.labels[]?.name; . == "portal-public-ticket") then "Ticket #\(.number)" else "Mission #\(.number)" end),
      state: .state,
      updated_at: .updated_at,
      public_summary: (
        (.body // "" | capture("(?s)<!-- PUBLIC SUMMARY START -->\\s*(?<summary>.*?)\\s*<!-- PUBLIC SUMMARY END -->").summary? // "")
        | gsub("[\\r\\n\\t]+"; " ") | gsub(" +"; " ") | .[0:180]
      ),
      portfolio_state: (
        [.labels[]?.name | select(startswith("portal-state:")) | sub("^portal-state:"; "")][0] // "Open for Proposals"
      )
    }
  ],
  commits: []
}
