/* ============================================================================
 * Anemetrics Risk Dashboard — SportCo Clubhouse & Facilities programme
 * ----------------------------------------------------------------------------
 * This drives both the Portfolio View (all phases) and the Phase View (single phase).
 * The content is an Anemetrics D-8 Interpreter assessment of the SportCo build:
 * a 2-year, £1.5m programme to deliver a Staff House, Clubhouse, Gardens and
 * Sports Facilities (incl. swimming pool and tennis courts). The assessment reads
 * the 40 call transcripts across all four phases and scores each phase across the
 * eight delivery dimensions.
 *
 * D-8 scoring: each dimension is marked 0-5 (5 = high competence, 0 = very
 * poor). The dashboard shows a 0-100 health score derived as (D-8 x 20); the
 * underlying D-8 score is stated at the head of every reasoning narrative.
 *
 * Dimensions group into Engagement (1 Strategy, 2 Risk, 3 Decision, 4 Scope)
 * and Capability (5 Communications, 6 Planning, 7 Resourcing, 8 Collaboration).
 *
 * Every dimension carries:
 *   - score          0-100 health score (D-8 x 20) for the latest checkpoint
 *   - reasoning      qualitative narrative explaining the D-8 score
 *   - trend          checkpoint scores (oldest -> newest) for the sparkline
 *   - risks          concrete risks tagged by impact type
 *   - recommendations principal next actions for that dimension
 * ==========================================================================*/

const DIMENSIONS = [
  { key: "strategy",      name: "Strategy Alignment",  icon: "🎯" },
  { key: "risk",          name: "Risk Management",     icon: "🛡️" },
  { key: "decision",      name: "Decision Making",     icon: "⚖️" },
  { key: "scope",         name: "Scope Management",    icon: "📐" },
  { key: "comms",         name: "Communications",      icon: "📣" },
  { key: "planning",      name: "Planning",            icon: "🗺️" },
  { key: "resourcing",    name: "Resourcing",          icon: "👥" },
  { key: "collaboration", name: "Collaboration",       icon: "🤝" },
];

// Review-checkpoint labels shared across every sparkline (oldest -> newest).
const WEEK_LABELS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];

/* Impact types let us colour-code and filter risks by what they threaten. */
const IMPACT = {
  budget:     { label: "Budget",     tag: "budget" },
  timeline:   { label: "Timeline",   tag: "timeline" },
  objectives: { label: "Objectives", tag: "objectives" },
};

const PORTFOLIO = {
  generatedAt: "2026-07-03",
  dimensions: DIMENSIONS,
  weekLabels: WEEK_LABELS,

  projects: [
    /* ----------------------------------------------------------------------
     * PHASE 1 — Staff House  (RED / critical)
     * £400k / 6 months -> £480k outturn, +8 weeks
     * -------------------------------------------------------------------- */
    {
      id: "phase1",
      name: "Phase 1 — Staff House",
      code: "P1",
      pm: "Paula (PM)",
      sponsor: "Marcus · SportCo",
      status: "red",
      overallScore: 31,
      overallTrend: [45, 42, 40, 38, 35, 34, 32, 31],
      budget:    { status: "red",   spent: 0.48, total: 0.40, unit: "£m", note: "£480k outturn vs £400k budget — 20% over" },
      timeline:  { status: "red",   milestone: "Staff House handover", due: "Month 8", variance: "+8 wks" },
      objectives:{ status: "amber", delivered: 3, total: 4, note: "Built, but drawings signed off late and drainage sized for the Staff House only" },
      executiveSummary:
        "Phase 1 sets the pattern that dogs the whole programme. The team assembled but core project controls were never stood up: there was no project plan, no populated risk register, and no budget tracking a month into a six-month phase. Architectural drawings were not signed off before work began, so bricks were ordered without a bill of quantities and BuildCo was never formally contracted. Two Engagement failures dominate — Risk Management (register left blank despite the sponsor asking twice) and the mis-sized drainage that Sandra at WaterCannonCo flagged in month 3 and which was not actioned. On the Capability side, Planning was the weakest link: a two-week delivery date was entered against six-week brick lead times. The Staff House was delivered, but 20% over budget and eight weeks late.",
      overallRecommendations: [
        "Stand up a live risk register this week with named owners and dates — starting with the WaterCannonCo drainage sizing issue, which is currently unlogged.",
        "Freeze on-site work until the internal-wall drawings are signed off by the client; draft drawings without sign-off are driving rework risk.",
        "Formally contract BuildCo and re-baseline the plan against real supplier lead times (bricks 6 wks, ventilation 8 wks), not aspirational ones.",
        "Establish weekly budget tracking now — one month in, no spend has been recorded against the £400k phase budget.",
      ],
      dimensions: {
        strategy: {
          score: 40,
          reasoning:
            "D-8 2/5 (Engagement). The team understood the headline goal — a Staff House, £400k, six months — but day-to-day activity was not aligned to it. Work started on site before the architectural drawings were signed off, and the drainage was designed for the Staff House in isolation with no line of sight to the later pool and pond loads. Progress was not being measured against the client's outcome, only against activity.",
          trend: [50, 48, 46, 45, 43, 42, 41, 40],
          risks: [
            { impact: "objectives", severity: "medium", title: "Drainage designed in isolation from the wider build",
              detail: "Phase 1 drainage runs were sized for the Staff House alone (200mm pipe at 1-in-80), with no allowance for the Phase 4 pool.",
              consequence: "The undersized runs must later be dug up and upsized, adding ~£22k and coordination across three suppliers in Phase 4." },
          ],
          recommendations: [
            "Design site-wide services (drainage in particular) against the full four-phase programme, not phase-by-phase.",
            "Gate the start of on-site work on signed-off drawings so activity stays tied to the agreed outcome.",
          ],
        },
        risk: {
          score: 20,
          reasoning:
            "D-8 1/5 (Engagement). This is the programme's worst dimension. The sponsor asked for a risk register in Call 04 and again in Call 06; it remained an empty template with no entries, owners, or mitigations. The single most consequential risk of the whole project — the undersized drainage flagged by Sandra at WaterCannonCo in month 3 — was never logged or actioned. Risks were only handled once they had already become issues.",
          trend: [34, 30, 28, 26, 24, 22, 21, 20],
          risks: [
            { impact: "budget", severity: "high", title: "No risk register maintained",
              detail: "One month in, the register is a blank template. Late drawings, incorrect brick spec and the missing testing brief are all known but unlogged, unowned and unmitigated.",
              consequence: "Foreseeable problems recur unmanaged across all four phases and surface as cost and schedule overruns." },
            { impact: "objectives", severity: "high", title: "Drainage sizing risk flagged and ignored",
              detail: "WaterCannonCo raised the drainage integration risk in month 3; it was noted informally and never formally actioned.",
              consequence: "An 18-month-latent risk that ultimately forces trench remediation, a disturbed pond liner, and unbudgeted Phase 4 cost." },
          ],
          recommendations: [
            "Create and maintain a live top-10 risk register with owners, dates and RAG status; review it in every sponsor call.",
            "Log and action the WaterCannonCo drainage risk immediately — it is the highest-consequence item on the programme.",
          ],
        },
        decision: {
          score: 30,
          reasoning:
            "D-8 1.5/5 (Engagement). Decisions were made expediently rather than well. Paula placed an 8,000-brick order with no architect's specification and no bill of quantities, choosing 'standard' brick to move on (Call 02). Where decisions needed the client — the internal-wall layout — they were deferred with 'we'll cross that bridge when we come to it' rather than escalated (Call 03).",
          trend: [42, 40, 38, 36, 34, 32, 31, 30],
          risks: [
            { impact: "budget", severity: "high", title: "Brick order placed without specification",
              detail: "8,000 standard bricks ordered against a rough guess; Karl at BrickCo warned the real figure could be 12-15k and that a top-up adds a six-week lead time.",
              consequence: "Risk of over/under-ordering and a six-week delivery gap, entered into the plan as two weeks regardless." },
          ],
          recommendations: [
            "No procurement decision without an architect's spec and a bill of quantities behind it.",
            "Route client-dependent decisions (e.g. room layout) into a scheduled forcing point rather than deferring them.",
          ],
        },
        scope: {
          score: 30,
          reasoning:
            "D-8 1.5/5 (Engagement). Scope was never firmly documented or controlled. The internal-wall layout depended on a client room-usage brief that never arrived, so Anthea was pushed to issue best-guess draft drawings for Bert to build from — with no change process to manage the rework when the real layout landed (Call 03). Supplier specs (mortar type, facing, ventilation airflow) were left as gaps for others to fill.",
          trend: [44, 42, 39, 37, 35, 33, 31, 30],
          risks: [
            { impact: "objectives", severity: "high", title: "Building from unsigned draft drawings",
              detail: "Draft internal-wall drawings issued without client sign-off on room usage; load-bearing positions are a best guess.",
              consequence: "Structural rework risk if the final layout differs, with no change-control trail to manage it." },
          ],
          recommendations: [
            "Obtain the client room-usage brief and sign off the internal layout before any walls are built.",
            "Introduce a simple change-control log so spec gaps and layout changes are assessed, not absorbed silently.",
          ],
        },
        comms: {
          score: 30,
          reasoning:
            "D-8 1.5/5 (Capability). Communication channels were nominally open but unreliable. The client's room-layout email sat unforwarded to the architect for weeks (Paula cited '300 unread emails'), and in the month-1 sponsor call Paula reported the drawings and risk register as effectively in hand when neither was true (Call 04). Optimistic upward reporting masked the real state.",
          trend: [42, 40, 38, 36, 34, 32, 31, 30],
          risks: [
            { impact: "objectives", severity: "high", title: "Status misrepresented to the sponsor",
              detail: "Drawings reported as 'final refinements only' and the risk register as 'in progress' when the register was blank and the layout brief was still stuck.",
              consequence: "Sponsor makes decisions on a false green picture; trust erodes sharply when reality surfaces later." },
            { impact: "timeline", severity: "medium", title: "Client brief not forwarded",
              detail: "The SportCo facilities-manager email on room usage was not passed to Anthea, blocking the internal-wall design.",
              consequence: "Drawings stall and the on-site start slips." },
          ],
          recommendations: [
            "Report status against evidence (the dimension scores), not optimism; give the sponsor a candid reset.",
            "Put a simple action/inbox triage in place so client inputs reach the right person within a day.",
          ],
        },
        planning: {
          score: 20,
          reasoning:
            "D-8 1/5 (Capability). There was no credible plan. A Monday on-site start was assumed while drawings were still weeks away and BuildCo had never been told to mobilise (Call 05). Supplier lead times were ignored: BrickCo quoted four-to-six weeks and Paula entered two weeks in the plan (Call 02); NuclearFanCo's eight-week ventilation lead time was never surfaced to Paula (Call 07).",
          trend: [36, 33, 30, 28, 26, 23, 21, 20],
          risks: [
            { impact: "timeline", severity: "high", title: "Plan dates ignore supplier lead times",
              detail: "Two-week brick delivery planned against a four-to-six week quote; eight-week ventilation lead time not reflected at all.",
              consequence: "Baseline is fiction, so every downstream date is optimistic and slips compound into the eight-week phase overrun." },
            { impact: "timeline", severity: "medium", title: "BuildCo mobilised without notice",
              detail: "Bert assumed a confirmed Monday start; BuildCo had had no formal instruction and needed a week's notice to redeploy.",
              consequence: "Ten-day delay to groundworks before Phase 1 has properly begun." },
          ],
          recommendations: [
            "Build the plan bottom-up from confirmed supplier lead times and a defined critical path.",
            "Issue formal mobilisation instructions to contractors with adequate notice before committing dates.",
          ],
        },
        resourcing: {
          score: 40,
          reasoning:
            "D-8 2/5 (Capability). The named team held strong trade skills (Bert, 20 years building) but the skill mix was wrong for the work. There was no M&E engineer to specify ventilation, no structural or drainage engineer, and Terry — a wind tester — had no testing brief and no clear role this early. Capacity was also thin: Paula was covering PM, risk lead and finance tracking herself.",
          trend: [46, 45, 44, 43, 42, 41, 40, 40],
          risks: [
            { impact: "objectives", severity: "medium", title: "No engineering specialists on the team",
              detail: "Ventilation was being scoped by the builder with an industrial supplier (NuclearFanCo, 3000 m³/h minimum) because no M&E engineer was engaged.",
              consequence: "Over-specified or non-compliant systems and avoidable rework where specialist judgement was needed." },
            { impact: "timeline", severity: "medium", title: "PM covering multiple governance roles",
              detail: "Paula is acting as PM, risk owner and budget tracker simultaneously.",
              consequence: "Governance tasks (register, budget, escalation) fall through the gaps under load." },
          ],
          recommendations: [
            "Engage an M&E engineer and, given the pool, a drainage/structural engineer for the programme.",
            "Confirm Terry's testing brief early so equipment and scheduling can be planned.",
          ],
        },
        collaboration: {
          score: 40,
          reasoning:
            "D-8 2/5 (Capability). Internal coordination was weak — the kick-off started 11 minutes late with the architect joining eight minutes in, and there was no action log or minutes (Call 01). Bert repeatedly discovered gaps (uncontracted BuildCo, missing drainage layout) that the PM should have closed. Offsetting this, suppliers such as Karl and Dave were constructive and proactive in flagging problems.",
          trend: [48, 47, 45, 44, 43, 42, 41, 40],
          risks: [
            { impact: "timeline", severity: "medium", title: "No shared action log or minutes",
              detail: "Kick-off produced no action log, minutes or owners; dependencies (drawings -> bricks -> groundworks) were left implicit.",
              consequence: "Hand-offs fall between people; the same issues resurface week after week unresolved." },
          ],
          recommendations: [
            "Run structured meetings with minutes, actions and owners captured every time.",
            "Make dependencies between architect, builder and suppliers explicit and tracked.",
          ],
        },
      },
    },

    /* ----------------------------------------------------------------------
     * PHASE 2 — Clubhouse  (RED / critical)
     * £600k / 6 months -> £718k outturn, +8 weeks
     * -------------------------------------------------------------------- */
    {
      id: "phase2",
      name: "Phase 2 — Clubhouse",
      code: "P2",
      pm: "Paula (PM)",
      sponsor: "Marcus · SportCo",
      status: "red",
      overallScore: 34,
      overallTrend: [40, 38, 37, 36, 35, 35, 34, 34],
      budget:    { status: "red",   spent: 0.718, total: 0.60, unit: "£m", note: "£718k outturn vs £600k budget — 20% over" },
      timeline:  { status: "red",   milestone: "Clubhouse handover", due: "Month 14", variance: "+8 wks" },
      objectives:{ status: "amber", delivered: 3, total: 4, note: "Delivered, but ground-condition surprises and unresolved drainage carried forward" },
      executiveSummary:
        "Phase 2 repeated Phase 1 rather than learning from it. The sponsor opened the phase asking what would be done differently, and the honest answer was: little. Ground-condition surprises added cost, the risk register was still not being maintained, budget reporting to the sponsor remained absent, and the Phase 1 drainage issue was still 'in hand' rather than actioned. Bert increasingly stepped in as an informal advisor to cover the PM gaps. The Clubhouse was completed to a good physical standard but again ran ~20% over budget and roughly eight weeks late, taking combined Phase 1-2 overspend to around £212k.",
      overallRecommendations: [
        "Answer the sponsor's 'what is different this time' with concrete governance changes — a maintained register, monthly budget reporting, and a change-control process — not intentions.",
        "Commission the ground surveys that Phase 2's surprises showed were missing, ahead of the remaining phases.",
        "Escalate and resolve the carried-over drainage sizing decision now, before it compounds further in Phases 3 and 4.",
        "Give Bert a defined advisory role or add a construction lead, rather than relying on informal cover for PM gaps.",
      ],
      dimensions: {
        strategy: {
          score: 40,
          reasoning:
            "D-8 2/5 (Engagement). The Clubhouse remained aligned to the overall SportCo vision, but strategic learning between phases was absent. Marcus explicitly pressed on what would change for future phases; the delivery approach carried the same gaps forward, so alignment stayed nominal rather than driving how the work was run.",
          trend: [42, 42, 41, 41, 40, 40, 40, 40],
          risks: [
            { impact: "objectives", severity: "medium", title: "No cross-phase learning applied",
              detail: "The failures identified in Phase 1 (no register, no budget reporting, deferred drainage) persisted unchanged into Phase 2.",
              consequence: "The programme repeats the same overruns phase after phase instead of improving." },
          ],
          recommendations: [
            "Run a formal Phase 1 lessons-learned review and apply its actions before and during Phase 2.",
            "Track each phase's outcome against the client vision, not just its own deliverables.",
          ],
        },
        risk: {
          score: 20,
          reasoning:
            "D-8 1/5 (Engagement). Risk management remained effectively non-existent. The register was still not maintained, ground-condition risks were discovered rather than anticipated, and the long-running drainage issue continued to be described as 'in hand' with no owner or action. The dimension stays at the bottom of the assessment.",
          trend: [26, 25, 24, 23, 22, 21, 20, 20],
          risks: [
            { impact: "budget", severity: "high", title: "Ground conditions not surveyed",
              detail: "Ground-condition surprises drove additional Clubhouse cost because no ground survey had been commissioned up front.",
              consequence: "Unbudgeted groundworks contribute to the ~20% Phase 2 overrun and recur as a risk in later phases." },
            { impact: "objectives", severity: "high", title: "Drainage issue still unresolved",
              detail: "The Phase 1 drainage sizing risk remained unactioned through Phase 2, described only as 'considered'.",
              consequence: "The problem is pushed into Phase 3 (temporary soakaway) and Phase 4 (£22k remediation), growing with each deferral." },
          ],
          recommendations: [
            "Maintain the risk register weekly with the drainage and ground-condition risks owned and dated.",
            "Commission ground surveys for the remaining phases now to convert surprises into planned work." ,
          ],
        },
        decision: {
          score: 40,
          reasoning:
            "D-8 2/5 (Engagement). Decisions were being taken but slowly and often without escalation. The sponsor was left chasing progress and the drainage decision continued to be deferred. Some decisions improved marginally under Marcus's pressure, but the pattern of 'in hand' answers meant real choices were postponed.",
          trend: [46, 45, 44, 43, 42, 41, 40, 40],
          risks: [
            { impact: "timeline", severity: "medium", title: "Deferred decisions accumulating",
              detail: "The drainage strategy and several spec decisions were repeatedly postponed rather than resolved.",
              consequence: "Open decisions block clean planning of later phases and inflate eventual remediation cost." },
          ],
          recommendations: [
            "Give each open decision an owner and a deadline; close the drainage decision this phase.",
            "Communicate decisions and their rationale to the sponsor and team as they are made.",
          ],
        },
        scope: {
          score: 30,
          reasoning:
            "D-8 1.5/5 (Engagement). Scope control was still weak. Specification gaps continued to be pushed between builder, architect and suppliers, and cost-adding ground-condition work entered without a change-control assessment against budget and timeline. Additions were absorbed rather than baselined.",
          trend: [40, 38, 36, 35, 33, 32, 31, 30],
          risks: [
            { impact: "budget", severity: "medium", title: "Additional works absorbed without change control",
              detail: "Ground-condition remediation was taken on without a formal change request updating budget, plan or client expectations.",
              consequence: "True scope exceeds the baseline, so the phase forecast understates cost and time." },
          ],
          recommendations: [
            "Route all additions through a change-control assessment before work starts.",
            "Reflect approved changes in the plan and budget so forecasts stay honest.",
          ],
        },
        comms: {
          score: 40,
          reasoning:
            "D-8 2/5 (Capability). Communication was marginally better than Phase 1 but still fell short: budget reporting to the sponsor was absent, and problems tended to reach Marcus as surprises rather than early warnings. Internal comms leaned on Bert informally relaying and covering gaps.",
          trend: [44, 43, 42, 42, 41, 41, 40, 40],
          risks: [
            { impact: "budget", severity: "medium", title: "No budget reporting to the sponsor",
              detail: "The sponsor received no regular budget report, so the ~20% overrun emerged after the fact rather than being visible in-flight.",
              consequence: "The client cannot intervene early; overruns are discovered too late to correct within the phase." },
          ],
          recommendations: [
            "Provide the sponsor with a monthly budget and progress report against baseline.",
            "Surface emerging cost and schedule pressures early, while they can still be managed.",
          ],
        },
        planning: {
          score: 20,
          reasoning:
            "D-8 1/5 (Capability). Planning remained the weakest Capability dimension. There was still no robust, maintained plan reflecting supplier lead times and dependencies, and no ground survey feeding the groundworks plan. The eight-week overrun mirrors Phase 1 almost exactly, indicating the plan was never a working control.",
          trend: [30, 28, 26, 25, 24, 22, 21, 20],
          risks: [
            { impact: "timeline", severity: "high", title: "Phase 1 planning failures repeated",
              detail: "No credible baseline, no modelled critical path, and unsurveyed ground conditions carried straight into Phase 2.",
              consequence: "The phase lands ~8 weeks late again — a repeat, not a one-off." },
          ],
          recommendations: [
            "Rebuild a working plan with a modelled critical path and realistic durations.",
            "Feed ground-survey and lead-time data into the plan before committing milestone dates.",
          ],
        },
        resourcing: {
          score: 40,
          reasoning:
            "D-8 2/5 (Capability). The team continued to lack the specialist and governance capacity the work required, with Bert absorbing project-management and advisory tasks beyond his role. Trade skills were sound; the surrounding engineering and PM capability was still thin.",
          trend: [44, 43, 42, 42, 41, 40, 40, 40],
          risks: [
            { impact: "objectives", severity: "medium", title: "Builder covering PM and advisory gaps",
              detail: "Bert is increasingly relied on to advise and coordinate because the PM and specialist layers are under-resourced.",
              consequence: "Key-person dependency and diluted focus on the actual build." },
          ],
          recommendations: [
            "Add project-controls and specialist engineering capacity rather than leaning on the builder.",
            "Define Bert's advisory contribution formally so it is planned, not ad hoc.",
          ],
        },
        collaboration: {
          score: 40,
          reasoning:
            "D-8 2/5 (Capability). Collaboration continued to depend on individuals filling gaps — Bert stepping in, suppliers raising issues — rather than on a working team system. There were no shared collaboration tools or cadence ensuring assumptions and dependencies were surfaced across the team.",
          trend: [44, 43, 42, 42, 41, 41, 40, 40],
          risks: [
            { impact: "timeline", severity: "medium", title: "Coordination reliant on informal cover",
              detail: "Cross-team coordination worked only because individuals compensated for missing process.",
              consequence: "Fragile delivery that breaks down whenever the compensating individual is unavailable." },
          ],
          recommendations: [
            "Adopt shared collaboration tools and a regular cadence for surfacing dependencies.",
            "Create explicit space for the team to challenge assumptions before they become issues.",
          ],
        },
      },
    },

    /* ----------------------------------------------------------------------
     * PHASE 3 — Gardens  (RED / at risk)
     * £100k / 3 months -> £114k outturn, +3 weeks
     * -------------------------------------------------------------------- */
    {
      id: "phase3",
      name: "Phase 3 — Gardens",
      code: "P3",
      pm: "Paula (PM)",
      sponsor: "Marcus · SportCo",
      status: "red",
      overallScore: 38,
      overallTrend: [34, 35, 36, 37, 38, 38, 38, 38],
      budget:    { status: "red",   spent: 0.114, total: 0.10, unit: "£m", note: "£114k outturn vs £100k budget — 14% over" },
      timeline:  { status: "amber", milestone: "Gardens sign-off", due: "Month 17", variance: "+3 wks" },
      objectives:{ status: "amber", delivered: 3, total: 4, note: "Signed off late; sunflowers died and were replaced, lawn snagging outstanding" },
      executiveSummary:
        "Phase 3 shows small process improvements undermined by the same escalation and specialist-resourcing failures. Paula claimed an improved risk process, but the phase started with no landscape design, no landscape architect, and Terry (a wind tester) with an undefined role. The defining incident is the sunflowers: FlowerCo warned they would not survive an autumn planting, Paula ordered them anyway without escalating to the client, and they died within three weeks — requiring winter-plant substitution and a spring replant. The drainage was patched with a temporary soakaway rather than resolved, deferring cost to Phase 4, and the lawn was laid by an informally-hired labourer with no contract. Gardens were signed off 14% over budget and three weeks late.",
      overallRecommendations: [
        "Engage a landscape architect and confirm a lawn contractor with a written contract before further garden works.",
        "Escalate supplier warnings (like FlowerCo's seasonal-planting advice) to the client instead of proceeding regardless.",
        "Resolve the drainage properly rather than installing a temporary soakaway that must be replaced in Phase 4.",
        "Commission a soil test and confirm bed dimensions so planting is specified, not assumed.",
      ],
      dimensions: {
        strategy: {
          score: 40,
          reasoning:
            "D-8 2/5 (Engagement). The gardens remained part of the agreed vision, but delivery again ran ahead of the strategy — the phase began without a landscape design and without confirming who would lead the physical garden works. Alignment to the outcome was assumed rather than planned.",
          trend: [40, 40, 40, 40, 40, 40, 40, 40],
          risks: [
            { impact: "objectives", severity: "medium", title: "Phase started without a delivery plan",
              detail: "No landscape design, no confirmed lawn contractor, and Terry's role undefined at kick-off (Call 30).",
              consequence: "Works proceed piecemeal, risking a garden that does not meet the client's intent." },
          ],
          recommendations: [
            "Confirm design, specialists and contractors against the outcome before starting works.",
            "Tie each garden element back to the agreed client brief.",
          ],
        },
        risk: {
          score: 40,
          reasoning:
            "D-8 2/5 (Engagement). A modest improvement: Paula claimed an improved risk-register process and commissioned some forward thinking. But the response to concrete risks was still poor — the seasonal-planting risk was accepted rather than mitigated, and the drainage risk was patched temporarily rather than closed, keeping the underlying exposure alive into Phase 4.",
          trend: [30, 32, 34, 36, 38, 39, 40, 40],
          risks: [
            { impact: "budget", severity: "high", title: "Temporary soakaway defers the drainage risk",
              detail: "Roberto (FountainCo) and Bert flagged that connecting to undersized runs was pointless; a temporary soakaway was chosen, lasting only 6-12 months (Call 32).",
              consequence: "Cost duplication and a live flooding risk carried into Phase 4 construction." },
            { impact: "objectives", severity: "medium", title: "Seasonal planting risk not mitigated",
              detail: "FlowerCo warned sunflowers would die if planted in autumn; the risk was accepted rather than mitigated or escalated.",
              consequence: "Dead planting within three weeks and rework at additional cost." },
          ],
          recommendations: [
            "Resolve the drainage permanently instead of accepting a temporary patch.",
            "Treat clear supplier warnings as risks to mitigate, not costs to absorb.",
          ],
        },
        decision: {
          score: 40,
          reasoning:
            "D-8 2/5 (Engagement). Decisions were made but often the wrong ones, or made without the client. Ordering sunflowers against explicit supplier advice, and choosing a temporary soakaway to avoid confronting the drainage root cause, are decisions taken to move on rather than to solve the problem.",
          trend: [44, 43, 42, 41, 41, 40, 40, 40],
          risks: [
            { impact: "objectives", severity: "medium", title: "Decisions made against expert advice",
              detail: "Sunflowers ordered despite FlowerCo's warning; drainage patched despite engineers advising a full solution.",
              consequence: "Predictable rework and deferred cost from decisions that ignored available expertise." },
          ],
          recommendations: [
            "Weigh supplier and engineer advice before deciding; escalate to the client where their brief conflicts with expert guidance.",
            "Avoid expedient decisions that knowingly defer a bigger cost.",
          ],
        },
        scope: {
          score: 40,
          reasoning:
            "D-8 2/5 (Engagement). Scope was loosely defined again — the flower-bed dimensions were unknown at order time and rose varieties were left as 'standard' (Call 31). Substitutions (rudbeckia for sunflowers, winter plants) were handled informally rather than through change control with the client.",
          trend: [46, 45, 44, 43, 42, 41, 40, 40],
          risks: [
            { impact: "budget", severity: "medium", title: "Planting ordered without a defined spec",
              detail: "Bed size assumed at 20 m², soil untested, rose type unspecified; substitutions not escalated to the client.",
              consequence: "Wrong or failed planting and replant costs outside any agreed change." },
          ],
          recommendations: [
            "Define bed dimensions, soil type and planting spec before ordering.",
            "Escalate substitutions to the client through change control." ,
          ],
        },
        comms: {
          score: 40,
          reasoning:
            "D-8 2/5 (Capability). Communication with the client on emerging problems remained the weak point — FlowerCo's warning that the sunflowers would die was not relayed to Marcus, who then discovered a bed of dead plants on a site visit (Call 33). When surfaced, the news reached the sponsor as a fait accompli.",
          trend: [46, 45, 44, 42, 41, 41, 40, 40],
          risks: [
            { impact: "objectives", severity: "medium", title: "Supplier warning not escalated to client",
              detail: "The known risk that the sunflowers would fail was not communicated to Marcus before planting.",
              consequence: "Client learns of avoidable failures after the fact, further eroding confidence." },
          ],
          recommendations: [
            "When a supplier flags a brief-versus-reality conflict, call the client before proceeding.",
            "Give the sponsor early notice of issues rather than letting them find them on site.",
          ],
        },
        planning: {
          score: 30,
          reasoning:
            "D-8 1.5/5 (Capability). The phase was under-planned: no landscape design, no identified lawn contractor, no soil assessment, and no defined testing scope for the garden. Terry was asked on the fly what wind testing meant for a lawn. Planning improved only marginally over earlier phases.",
          trend: [36, 35, 34, 33, 32, 31, 30, 30],
          risks: [
            { impact: "timeline", severity: "medium", title: "Garden works planned on the fly",
              detail: "No landscape design or lawn contractor at kick-off; roles and scope defined reactively during the phase (Call 30).",
              consequence: "Gaps (uneven grading, missing contractor) surface late and delay sign-off." },
          ],
          recommendations: [
            "Produce a complete garden delivery plan — design, contractors, testing scope — before starting.",
            "Commission a soil test to inform the planting plan up front.",
          ],
        },
        resourcing: {
          score: 30,
          reasoning:
            "D-8 1.5/5 (Capability). Specialist resourcing was clearly wrong for the work. No landscape architect was engaged (the building architect produced a functional layout with a caveat), FlowerCo was leaned on as a de-facto consultant, and the lawn was laid by an informally-hired labourer through BuildCo with no written agreement. Terry's structural wind-testing skills did not fit garden testing.",
          trend: [36, 35, 34, 33, 32, 31, 30, 30],
          risks: [
            { impact: "objectives", severity: "high", title: "No landscape specialist; informal labour",
              detail: "No landscape architect for planting and pond ecology; lawn laid by a labourer with no contract, later untraceable for snagging (Call 34).",
              consequence: "Quality risk and a three-week delay locating someone to correct grading with no contractual recourse." },
          ],
          recommendations: [
            "Engage a landscape architect and contract garden trades formally.",
            "Assign Terry appropriate work or bring in the right testing specialism for the phase.",
          ],
        },
        collaboration: {
          score: 50,
          reasoning:
            "D-8 2.5/5 (Capability). The best dimension this phase. Bert joined informally to lend construction knowledge, and suppliers (Roberto at FountainCo, Jenny at FlowerCo) proactively raised drainage and planting concerns. Collaboration worked where individuals chose to engage — though it still was not backed by process, so good advice was not always acted upon.",
          trend: [42, 44, 45, 46, 48, 49, 50, 50],
          risks: [
            { impact: "objectives", severity: "low", title: "Good advice not consistently actioned",
              detail: "Suppliers and Bert raised sound concerns (drainage, planting, soil) that were acknowledged but not always followed.",
              consequence: "Collaboration generates the right signals but the team does not reliably convert them into action." },
          ],
          recommendations: [
            "Formalise supplier and advisor input into decisions and the risk register.",
            "Keep Bert's cross-phase involvement but define it so it is dependable.",
          ],
        },
      },
    },

    /* ----------------------------------------------------------------------
     * PHASE 4 — Sports Facilities & Pool  (AMBER / recovering)
     * £300k original -> £400k revised -> £460k forecast, +6 wks (pool +10)
     * -------------------------------------------------------------------- */
    {
      id: "phase4",
      name: "Phase 4 — Sports Facilities",
      code: "P4",
      pm: "Paula (PM)",
      sponsor: "Marcus · SportCo",
      status: "amber",
      overallScore: 46,
      overallTrend: [36, 38, 40, 42, 44, 45, 46, 46],
      budget:    { status: "red",   spent: 0.46, total: 0.40, unit: "£m", note: "£460k forecast vs £400k revised (£300k original) — 53% over original" },
      timeline:  { status: "amber", milestone: "Facilities & pool handover", due: "Month 24", variance: "+6 wks (pool opens +10)" },
      objectives:{ status: "amber", delivered: 4, total: 5, note: "Handed over; LTA accreditation and pool opening fall after handover" },
      executiveSummary:
        "Phase 4 is the recovery chapter — genuine improvement, but from a low base and against a phase that was structurally under-budgeted from day one. Marcus's own quantity surveyor showed the £300k budget was unrealistic (the pool alone was ~£220k), a gap Anthea had flagged in an unanswered month-1 email. The long-buried drainage issue was finally addressed formally, 18 months after Sandra first raised it, at ~£22k. Specification errors recurred (tennis courts scoped only as 'all-weather', missing LTA and environmental-health lead times). What improved was transparency: in the final budget call Paula owned the failures and articulated exactly what should have been done differently, and a thorough lessons-learned document was produced. The facilities were delivered to a high standard, but 53% over the original budget, with LTA accreditation and the public pool opening falling weeks after handover.",
      overallRecommendations: [
        "Rebaseline Phase 4 against the quantity surveyor's realistic costs and secure board approval before committing works.",
        "Close out the drainage remediation with WaterCannonCo, coordinating BuildCo and FountainCo to protect the new pond liner.",
        "Engage the LTA and council environmental-health inspectors now — their 6-8 week lead times gate the pool opening and court accreditation.",
        "Complete the lessons-learned document, defects-liability schedule and drainage maintenance plan the sponsor has required for final sign-off.",
      ],
      dimensions: {
        strategy: {
          score: 50,
          reasoning:
            "D-8 2.5/5 (Engagement). Strategic clarity improved once Marcus set out the scope precisely (two tennis courts, two badminton, ping-pong, pool) and engaged his own quantity surveyor. Alignment between the client's real requirements and the plan finally tightened — though only after 18 months and a board-level budget reset.",
          trend: [40, 42, 44, 46, 48, 49, 50, 50],
          risks: [
            { impact: "budget", severity: "high", title: "Phase underbudgeted from the outset",
              detail: "The £300k budget was unrealistic — the pool alone was ~£220k, plus ~£30k per tennis court; Anthea's month-1 warning went unanswered (Call 35).",
              consequence: "A four-week board approval delay and a scramble to rebaseline before substantive works can start." },
          ],
          recommendations: [
            "Align budget to a properly-estimated scope before committing, not after works begin.",
            "Ensure early strategic warnings from the team reach decision-makers." ,
          ],
        },
        risk: {
          score: 40,
          reasoning:
            "D-8 2/5 (Engagement). The most consequential risk on the programme was finally confronted: Sandra at WaterCannonCo and Bert formally addressed the drainage sizing 18 months after it was first raised. Handling was reactive and costly rather than managed, but the risk was at last owned. A hairline crack in the pool shell was sensibly put under monitoring at handover.",
          trend: [26, 28, 30, 33, 36, 38, 39, 40],
          risks: [
            { impact: "budget", severity: "high", title: "Drainage remediation now unavoidable and unbudgeted",
              detail: "~40m of trench and upsized pipework (~£22k) needed, coordinated with BuildCo and FountainCo near the new pond liner, which is later disturbed and needs repair (Call 36).",
              consequence: "Unbudgeted cost and rework that a day of Phase 1 engineering would have prevented." },
            { impact: "objectives", severity: "medium", title: "Pool shell hairline crack under monitoring",
              detail: "Contractor says the crack is within tolerance; Bert wants it monitored, with a north-elevation gutter draining slowly (Call 40).",
              consequence: "Requires a formal monitoring and remediation plan before final sign-off." },
          ],
          recommendations: [
            "Complete the drainage remediation and formally close the risk with a maintenance plan.",
            "Put the pool-shell crack and gutter on a documented monitoring schedule.",
          ],
        },
        decision: {
          score: 50,
          reasoning:
            "D-8 2.5/5 (Engagement). Decision-making sharpened under sponsor pressure — Marcus forced the budget, drainage and specification decisions that had drifted for months. Choices still arrived late (LTA surface, environmental-health engagement), but they were now being made deliberately rather than deferred indefinitely.",
          trend: [40, 42, 44, 46, 47, 48, 49, 50],
          risks: [
            { impact: "timeline", severity: "medium", title: "Key decisions still arriving late",
              detail: "The ITF/LTA court-surface decision and environmental-health engagement were resolved only once their lead times already threatened handover.",
              consequence: "Accreditation and pool opening slip past the handover date despite the decisions eventually being made." },
          ],
          recommendations: [
            "Bring specification and compliance decisions forward against their lead times.",
            "Preserve the sponsor decision forum that finally unblocked progress.",
          ],
        },
        scope: {
          score: 40,
          reasoning:
            "D-8 2/5 (Engagement). Scope definition remained loose at first — 'two all-weather tennis courts' was not a specification, forcing Bert to go back to the client on surface accreditation (Call 37). Compliance scope (LTA accreditation, environmental-health inspection) was omitted from the plan and only added once flagged. Corrections were made, but reactively.",
          trend: [34, 35, 36, 37, 38, 39, 40, 40],
          risks: [
            { impact: "budget", severity: "medium", title: "Specification and compliance gaps in scope",
              detail: "Court surface under-specified (ITF adds ~£15k); LTA accreditation and environmental-health inspection not in the plan though effectively mandatory (Calls 37-38).",
              consequence: "Added cost, a ten-day court delay, and accreditation/opening pushed beyond handover." },
          ],
          recommendations: [
            "Specify facility surfaces and finishes to their intended use (competitive play) up front.",
            "Include statutory and accreditation requirements in scope from the start.",
          ],
        },
        comms: {
          score: 60,
          reasoning:
            "D-8 3/5 (Capability). The strongest dimension by the end. In the final budget call Paula was transparent, laid out the full cost history, accepted responsibility for insufficient escalation, and articulated precisely what should have been done differently. Reporting to the sponsor became candid — belatedly, but genuinely.",
          trend: [42, 45, 48, 51, 54, 57, 59, 60],
          risks: [
            { impact: "objectives", severity: "low", title: "Transparency arrived late",
              detail: "The honest account of root causes came in Phase 4, 18 months after the key drainage decision was taken (Call 39).",
              consequence: "The right conversation happened, but too late to prevent the overruns it explained." },
          ],
          recommendations: [
            "Sustain the candid reporting cadence through handover and defects liability.",
            "Capture the transparency in the lessons-learned document so it becomes standard practice.",
          ],
        },
        planning: {
          score: 30,
          reasoning:
            "D-8 1.5/5 (Capability). Planning remained the weakest Capability dimension. The phase was under-budgeted from the outset, and critical lead times were missed — environmental-health inspection needs eight weeks' notice and LTA accreditation six-to-eight weeks with finished courts, neither planned for. Courts finished in month 23 against a month-24 handover, so accreditation could not land in time.",
          trend: [24, 25, 26, 27, 28, 29, 30, 30],
          risks: [
            { impact: "timeline", severity: "high", title: "Statutory lead times not planned",
              detail: "Environmental-health (8 wks) and LTA (6-8 wks, courts finished) inspections were engaged too late; courts completed month 23 (Calls 38, 40).",
              consequence: "Pool opens six weeks post-handover; LTA accreditation follows six weeks after that." },
          ],
          recommendations: [
            "Back-plan statutory inspections and accreditations from the handover date.",
            "Rebaseline cost and schedule on the QS estimate and finished-works dependencies.",
          ],
        },
        resourcing: {
          score: 50,
          reasoning:
            "D-8 2.5/5 (Capability). Resourcing improved as the right expertise finally came into play — the client's quantity surveyor exposed the budget gap, Bert led supplier coordination, and Sandra (WaterCannonCo) engaged on drainage. Gaps persisted (no in-house QS or M&E, Terry still outside his specialism for pool water quality) but the effective skill mix was closer to the task than in earlier phases.",
          trend: [40, 42, 44, 46, 47, 48, 49, 50],
          risks: [
            { impact: "objectives", severity: "medium", title: "Specialist testing still outside the team",
              detail: "Pool water quality and chemical balance need environmental-health expertise; Terry is a wind tester and cannot cover it (Call 38).",
              consequence: "Reliance on late external engagement for statutory testing, contributing to the delayed opening." },
          ],
          recommendations: [
            "Retain the quantity-surveyor and specialist input through completion.",
            "Bring in the correct testing specialisms for pool commissioning early.",
          ],
        },
        collaboration: {
          score: 60,
          reasoning:
            "D-8 3/5 (Capability). Collaboration reached its programme high as the drainage fix pulled WaterCannonCo, BuildCo and FountainCo together, and Bert coordinated across suppliers effectively. It was largely forced by crisis rather than designed, but the multi-party working that had been missing for 18 months finally happened, and the team closed out with a shared lessons-learned exercise.",
          trend: [46, 48, 50, 53, 55, 57, 59, 60],
          risks: [
            { impact: "budget", severity: "low", title: "Coordination triggered by crisis, not design",
              detail: "Cross-supplier collaboration on drainage only mobilised once the problem became urgent in Phase 4.",
              consequence: "Earlier, planned collaboration would have avoided the trench remediation and disturbed pond liner." },
          ],
          recommendations: [
            "Institutionalise multi-supplier coordination from the start of any interdependent works.",
            "Use the final lessons-learned review to make this collaboration the default, not the exception.",
          ],
        },
      },
    },
  ],
};

/* Convenience: expose on window for the plain-script app. */
window.PORTFOLIO = PORTFOLIO;
window.IMPACT = IMPACT;
