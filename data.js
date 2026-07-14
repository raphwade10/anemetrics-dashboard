/* ============================================================================
 * Anemetrics Risk Dashboard — New Acute Hospital Programme (quarterly)
 * ----------------------------------------------------------------------------
 * An Anemetrics D-8 Interpreter assessment of a 2-year, 8-quarter hospital
 * new-build programme whose objective is a 35% uplift in elective capacity by
 * go-live. The programme runs as EIGHT workstreams (P1–P8), each surveyed every
 * quarter (Delphi method) and scored 0–5 on the eight delivery dimensions. The
 * dashboard shows a 0–100 health score derived as (D-8 × 20).
 *
 * QUARTERLY MODEL
 *   Each workstream carries an 8-element score SERIES per dimension (Q1→Q8).
 *   The app resolves the portfolio "as at" the selected quarter, showing the
 *   trend so far and auto-noting progress/problems versus previous quarters —
 *   i.e. a fresh risk dashboard at the end of each quarter.
 *
 * D-8 INTERPRETER + RECOMMENDATION ENGINE
 *   The Interpreter maps each 0–5 score to a standardized narrative (BAND_NARR)
 *   and specific risks (BAND_RISKS); the Recommendation Engine maps each
 *   (dimension, score-band) to remediation actions (BAND_RECS). The app looks
 *   these up per quarter, so the commentary and recommendations follow the
 *   score as it moves.
 *
 * Dimensions group into Engagement (1 Strategy, 2 Risk, 3 Decision, 4 Scope)
 * and Capability (5 Communications, 6 Planning, 7 Resourcing, 8 Collaboration).
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

// Reporting quarters (oldest -> newest). Sparklines run Q1..Q(current).
const QUARTER_LABELS = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"];

/* Impact types let us colour-code and filter risks by what they threaten. */
const IMPACT = {
  budget:     { label: "Budget",     tag: "budget" },
  timeline:   { label: "Timeline",   tag: "timeline" },
  objectives: { label: "Objectives", tag: "objectives" },
};

/* ============================================================================
 * D-8 INTERPRETER — score band (1–5) -> standardized narrative per dimension
 * ==========================================================================*/
const BAND_NARR = {
  strategy: {
    5: "Every workstream deliverable traces back to the programme objective — a 35% uplift in elective capacity by go-live. Alignment is confirmed at board level and documented, with all leads working to the same strategic intent.",
    4: "Alignment to the elective-capacity objective is strong and largely traceable, with only occasional local decisions taken before their strategic fit is re-tested.",
    3: "The strategic objective is understood but the link from day-to-day activity to it is loosening; some teams are optimising locally rather than for the programme goal.",
    2: "Alignment is weak — teams are operating semi-independently and progress is no longer clearly consistent with the client's stated outcome.",
    1: "Strategy alignment has broken down: the charter has been revised repeatedly without circulation, and teams cannot articulate what success looks like. Activity is disconnected from the programme objective.",
  },
  risk: {
    5: "The risk register is live and complete — every active risk has an owner, mitigations are executing to plan, and residual scores are tracked weekly with 24-hour escalation of reds.",
    4: "Risk management is effective: the register is current and owned, with mitigations largely on track and only minor gaps in remediation cadence.",
    3: "A register exists and is reviewed, but some material risks are under-scored or slow to gain mitigations, and remediation is not always executed to plan.",
    2: "Risk management is largely reactive — the register is incomplete, ownership is patchy, and several risks are surfacing as issues before being mitigated.",
    1: "There is no functioning risk register. Ownership is unclear, known reference risks (e.g. infection-control incidents documented on similar healthcare projects) carry no mitigation, and risks are discovered only once they become problems.",
  },
  decision: {
    5: "Decisions are made at the right level, quickly, and communicated to those who need them — escalations return within hours and nothing sits blocking the critical path.",
    4: "Decision-making is timely and well-governed, with a clear decision log; only a few non-critical items wait longer than ideal.",
    3: "Decisions are generally made but some sit too long, and a handful of open items are beginning to hold up dependent work.",
    2: "Decision latency is a real drag — several critical decisions are open, ownership is ambiguous, and delays are starting to cost budget and time.",
    1: "Decision-making has seized up: the RAID log holds dozens of open decisions, the oldest months old, and consensus-seeking has become paralysis. Teams are building to designs that may still change.",
  },
  scope: {
    5: "Scope is baselined and controlled — every change runs through a formal impact assessment before approval, with zero uncontrolled changes and the plan updated accordingly.",
    4: "Scope is well documented and change-controlled, with only small, promptly-assessed variations entering the baseline.",
    3: "A scope baseline exists but change control is inconsistently applied; some changes are absorbed without a full budget/timeline impact assessment.",
    2: "Scope is drifting — changes are entering without formal control and the true approved scope is becoming unclear, with cost creep not visible to finance.",
    1: "There is no functioning scope process. Changes happen daily based on whoever shouts loudest; nobody can state the current approved scope and uncontrolled cost is now material.",
  },
  comms: {
    5: "Communication channels are established and effective across all stakeholders — satisfaction is high, reporting is candid and cadenced (daily site, fortnightly exec, monthly clinical), and there are no surprises.",
    4: "Communications are working well with clear channels and cadence; occasional misunderstandings surface but are resolved quickly.",
    3: "Core channels exist but reporting is uneven and some groups are less well served, leaving pockets of misalignment.",
    2: "Communication is a recognised weakness — status information is hard to obtain, updates are requested repeatedly, and misconceptions are spreading between teams.",
    1: "Communications have broken down: status reports go unanswered for weeks, stakeholders don't know where the programme stands, and the information vacuum is itself now a primary risk.",
  },
  planning: {
    5: "The programme plan is current and realistic — milestones are resource-loaded, the critical path is monitored daily, and contingency sequences exist for the highest-risk milestones.",
    4: "Planning is solid: plans are published, realistic against budget/timeline/resource, and six-week lookaheads surface issues before they bite.",
    3: "Plans exist but are not always realistic or current; some milestones lack resource loading and the critical path is not consistently monitored.",
    2: "Planning is unreliable — dates are optimistic against known lead times, replans lag reality, and the plan is not a working control.",
    1: "There is no credible plan in use; work proceeds without resource-loaded milestones or a monitored critical path, and forecasts are meaningless.",
  },
  resourcing: {
    5: "The workstream is fully resourced with the right capabilities — key roles are filled, capacity matches the plan, and specialist cover is added ahead of demand peaks.",
    4: "Resourcing is sound, with capability reviews in place and only minor, managed gaps.",
    3: "Resourcing is broadly adequate but stretched in places, with some roles thinly covered or awaiting specialist input.",
    2: "Resourcing gaps are affecting delivery — key skills are missing or over-committed and workarounds are adding cost and risk.",
    1: "The workstream is critically under-resourced or mis-skilled for the task, with essential specialist roles unfilled and no plan to close the gap.",
  },
  collaboration: {
    5: "Collaboration is strong — joint interface meetings surface dependencies early, an anonymous feedback channel is used constructively, and cross-team retrospectives drive continuous improvement.",
    4: "Teams collaborate well across boundaries, with shared tools and open discussion of dependencies and assumptions.",
    3: "Collaboration is functional but inconsistent; some interfaces work well while others rely on individuals rather than an agreed cadence.",
    2: "Collaboration is poor — teams work in silos, dependencies fall between owners, and there are few safe spaces for open feedback.",
    1: "Collaboration has failed: teams actively withhold information, joint meetings are boycotted, and mutual distrust between camps is putting the programme at serious risk.",
  },
};

/* ============================================================================
 * D-8 INTERPRETER — specific risks per dimension at bands 1–3 (none at 4–5)
 * ==========================================================================*/
const BAND_RISKS = {
  strategy: {
    3: [{ impact: "objectives", severity: "medium", title: "Local optimisation over programme goal", detail: "Some workstreams are prioritising local milestones ahead of the elective-capacity objective.", consequence: "The benefits case dilutes if activity stops tracking the headline outcome." }],
    2: [{ impact: "objectives", severity: "high", title: "Teams operating independently of strategy", detail: "Day-to-day work shows little visible connection to the programme strategy.", consequence: "Deliverables may not aggregate into the 35% capacity uplift." }],
    1: [{ impact: "objectives", severity: "high", title: "Charter revised without circulation", detail: "The programme charter has been revised repeatedly and the latest version not circulated; teams cannot state the objective.", consequence: "The programme is steering without a shared destination — outcomes at material risk." }],
  },
  risk: {
    3: [{ impact: "budget", severity: "medium", title: "Material risks under-scored", detail: "Some significant risks are logged but under-rated, with mitigations slow to attach.", consequence: "Under-managed risks can mature into cost and schedule overruns." }],
    2: [{ impact: "timeline", severity: "high", title: "Reactive risk posture", detail: "The register is incomplete and ownership patchy; risks are surfacing as issues.", consequence: "Firefighting displaces planned work and erodes the schedule." }],
    1: [
      { impact: "objectives", severity: "high", title: "No functioning risk register", detail: "Ownership is unclear and known reference risks carry no mitigation.", consequence: "Foreseeable failures (e.g. infection-control incidents) hit unmanaged." },
      { impact: "budget", severity: "high", title: "Risks discovered as problems", detail: "Issues are found only once they materialise, with no early warning.", consequence: "Unbudgeted remediation and repeated crisis response." },
    ],
  },
  decision: {
    3: [{ impact: "timeline", severity: "medium", title: "Ageing open decisions", detail: "A handful of decisions are sitting long enough to hold up dependent work.", consequence: "Dependent workstreams slip while waiting for direction." }],
    2: [{ impact: "timeline", severity: "high", title: "Critical decisions unowned", detail: "Several critical-path decisions are open with ambiguous ownership.", consequence: "Delays convert directly into budget and timeline impact." }],
    1: [{ impact: "timeline", severity: "high", title: "Decision paralysis (RAID backlog)", detail: "Dozens of open decisions, the oldest months old; consensus-seeking has stalled progress.", consequence: "Teams build to designs that may change — rework and wasted spend." }],
  },
  scope: {
    3: [{ impact: "budget", severity: "medium", title: "Inconsistent change control", detail: "Some changes bypass full impact assessment before entering the baseline.", consequence: "Cost creep that is not fully visible in the plan." }],
    2: [{ impact: "budget", severity: "high", title: "Scope drift without control", detail: "Changes enter informally; the true approved scope is unclear.", consequence: "Uncontrolled cost not visible to finance until too late." }],
    1: [{ impact: "budget", severity: "high", title: "No functioning scope process", detail: "Numerous changes each week go through no formal process; approved scope is unknown.", consequence: "Material uncontrolled cost and an undeliverable, moving baseline." }],
  },
  comms: {
    3: [{ impact: "objectives", severity: "medium", title: "Uneven stakeholder reporting", detail: "Some groups are less well served by the reporting cadence.", consequence: "Pockets of misalignment and late-surfacing issues." }],
    2: [{ impact: "objectives", severity: "high", title: "Status information hard to obtain", detail: "Updates are requested repeatedly; misconceptions spread between teams.", consequence: "Decisions made on stale or wrong information." }],
    1: [{ impact: "objectives", severity: "high", title: "Communications breakdown", detail: "Reports go unanswered for weeks; nobody knows the programme's true status.", consequence: "An information vacuum that is itself a primary programme risk." }],
  },
  planning: {
    3: [{ impact: "timeline", severity: "medium", title: "Plan not fully resource-loaded", detail: "Some milestones lack resource loading and the critical path is not monitored consistently.", consequence: "Forecast dates are optimistic and prone to slip." }],
    2: [{ impact: "timeline", severity: "high", title: "Plan not a working control", detail: "Dates are optimistic against known lead times and replans lag reality.", consequence: "Milestones slip repeatedly; forecasts cannot be trusted." }],
    1: [{ impact: "timeline", severity: "high", title: "No credible plan in use", detail: "Work proceeds without resource-loaded milestones or a monitored critical path.", consequence: "Schedule and cost forecasts are meaningless — the workstream is flying blind." }],
  },
  resourcing: {
    3: [{ impact: "timeline", severity: "medium", title: "Thinly covered roles", detail: "Some roles are stretched or awaiting specialist input.", consequence: "Throughput dips and single points of failure emerge." }],
    2: [{ impact: "budget", severity: "high", title: "Missing key skills", detail: "Essential capabilities are absent or over-committed; workarounds in use.", consequence: "Added cost and rework from non-specialist cover." }],
    1: [{ impact: "objectives", severity: "high", title: "Critically under-resourced", detail: "Essential specialist roles are unfilled with no plan to close the gap.", consequence: "Deliverables cannot be completed to standard on time." }],
  },
  collaboration: {
    3: [{ impact: "objectives", severity: "medium", title: "Interfaces rely on individuals", detail: "Some cross-team interfaces work only because individuals compensate for missing cadence.", consequence: "Fragile hand-offs that break when key people are unavailable." }],
    2: [{ impact: "objectives", severity: "high", title: "Siloed working", detail: "Teams work in silos; dependencies fall between owners.", consequence: "Clashes, duplicated work and gaps nobody owns." }],
    1: [{ impact: "objectives", severity: "high", title: "Breakdown between teams", detail: "Information is actively withheld and joint meetings boycotted; two camps with mutual distrust.", consequence: "Programme at serious risk from unmanaged interfaces." }],
  },
};

/* ============================================================================
 * ANEMETRICS RECOMMENDATION ENGINE — remediation per dimension & score band
 * ==========================================================================*/
const BAND_RECS = {
  strategy: {
    5: ["Sustain board-level alignment reviews; keep every deliverable traceable to the capacity objective.", "Continue gating new work against strategic fit."],
    4: ["Re-test local decisions against the programme objective before committing.", "Keep the objective visible in every planning forum."],
    3: ["Re-affirm the programme objective with all workstream leads and restore traceability from activity to outcome.", "Add a strategic-fit test to the change template."],
    2: ["Convene a cross-programme strategy reset to realign workstreams to the objective.", "Publish and circulate a single current statement of programme intent."],
    1: ["URGENT: freeze charter changes, issue one authoritative charter, and confirm every team can state the objective.", "Stand up weekly strategy-alignment reviews chaired by the Programme Director."],
  },
  risk: {
    5: ["Maintain the live register with weekly residual-score tracking and 24-hour red escalation.", "Keep scanning reference risk from comparable healthcare projects."],
    4: ["Close the minor gaps in remediation cadence.", "Hold owner-and-date discipline on every risk."],
    3: ["Re-score under-rated risks with current evidence and attach owned mitigations.", "Restore a weekly review that checks remediation is executing to plan."],
    2: ["Rebuild the top-risk register with named owners, dates and RAG, reviewed in every steering call.", "Introduce reference-risk checks so known failure modes are pre-empted."],
    1: ["URGENT: appoint a single risk owner and stand up a functioning register this week.", "Run a reference-risk workshop against comparable hospital programmes and mitigate the top exposures immediately."],
  },
  decision: {
    5: ["Preserve the fast, well-governed decision forum and decision log.", "Keep escalation SLAs in hours, not weeks."],
    4: ["Clear the few slow non-critical items.", "Maintain decision-log discipline."],
    3: ["Assign owners and hard deadlines to ageing open decisions.", "Adopt a lightweight RACI so decisions have an owner before they are logged."],
    2: ["Force the open critical-path decisions with a single accountable owner and date each.", "Escalate blocked decisions to the sponsor on a fixed cadence."],
    1: ["URGENT: triage the RAID backlog, resolve or kill the oldest decisions, and break consensus paralysis with clear accountability.", "Impose a decision-by-date rule with sponsor escalation for anything over five days."],
  },
  scope: {
    5: ["Keep every change running through formal impact assessment; hold zero uncontrolled changes.", "Maintain the model/baseline as single source of truth."],
    4: ["Keep variations small and promptly assessed.", "Continue reflecting approved changes in the plan and budget."],
    3: ["Tighten change control so every change gets a full budget/timeline impact assessment.", "Reconcile the current baseline so approved scope is unambiguous."],
    2: ["Re-impose change control: no change enters without impact assessment and board approval.", "Give finance visibility of cumulative change cost now."],
    1: ["URGENT: stop uncontrolled changes, re-baseline the approved scope, and quantify the accumulated uncontrolled cost.", "Stand up a change-control board before any further work proceeds."],
  },
  comms: {
    5: ["Sustain the cadence (daily site, fortnightly exec, monthly clinical) and no-surprises reporting.", "Keep measuring stakeholder satisfaction."],
    4: ["Resolve occasional misunderstandings quickly at source.", "Maintain clear channel ownership."],
    3: ["Level up reporting so under-served groups get timely, relevant updates.", "Close misalignment pockets with targeted briefings."],
    2: ["Establish reliable status reporting with a single source of truth and fixed cadence.", "Introduce interface briefings to stop misconceptions spreading."],
    1: ["URGENT: restore basic status reporting this week and assign an accountable communications owner.", "Set up joint interface meetings to rebuild information flow between teams."],
  },
  planning: {
    5: ["Keep the plan resource-loaded with daily critical-path monitoring and contingency sequences.", "Maintain six-week lookaheads."],
    4: ["Hold the lookahead discipline that surfaces issues early.", "Keep plans realistic against budget/timeline/resource."],
    3: ["Resource-load all milestones and monitor the critical path consistently.", "Re-estimate optimistic durations against real lead times."],
    2: ["Rebuild the plan as a working control with a modelled critical path and realistic durations.", "Feed supplier lead times and actuals into the plan before committing dates."],
    1: ["URGENT: produce a credible, resource-loaded plan with a monitored critical path before further commitments.", "Re-baseline all dates from real lead times and current progress."],
  },
  resourcing: {
    5: ["Keep capability reviews and add specialist cover ahead of demand peaks.", "Maintain succession/pairing on key roles."],
    4: ["Close the minor managed gaps.", "Continue capability reviews."],
    3: ["Reinforce thinly covered roles and secure awaited specialist input.", "Pair critical roles to remove single points of failure."],
    2: ["Fill the missing key skills or bring in short-term specialist capacity.", "Rebalance over-committed roles to protect throughput."],
    1: ["URGENT: escalate unfilled specialist roles as programme-critical and secure capacity now.", "Reassign or backfill mis-skilled roles against the actual task needs."],
  },
  collaboration: {
    5: ["Sustain joint interface meetings, the anonymous feedback channel and cross-team retrospectives.", "Keep dependencies surfaced early and owned jointly."],
    4: ["Keep shared tools and open dependency discussion.", "Maintain the cross-boundary working rhythm."],
    3: ["Formalise interface cadence so collaboration doesn't rely on individuals.", "Create safe spaces for open feedback on dependencies."],
    2: ["Stand up joint interface meetings and a shared working agreement across teams.", "Establish an anonymous feedback channel to rebuild trust."],
    1: ["URGENT: broker the inter-team breakdown, mandate joint interface meetings and stop information withholding.", "Bring in facilitation / OD support to rebuild cross-team trust before it derails the programme."],
  },
};

/* Helper: constant 8-quarter series at a fixed score. */
const flat = (v) => [v, v, v, v, v, v, v, v];

/* ============================================================================
 * WORKSTREAMS (P1–P8) — per-dimension quarterly D-8 series (0–5), Q1→Q8
 * Scores are taken verbatim from the quarterly AIR summary in each transcript.
 * ==========================================================================*/
const PHASES = [
  {
    id: "p1", code: "P1", name: "Business Case & Programme Management",
    lead: "Sarah Chen · Programme Director", sponsor: "Programme Board",
    context: "Programme governance and business-case workstream — the exemplar for how the programme should be run.",
    focus: [
      "Programme charter signed; governance structure established; stakeholder register compiled",
      "Benefits framework finalised; risk register baseline set; reporting cadence agreed",
      "Programme Board constituted; first quarterly assurance review completed",
      "Scope baseline approved; programme controls enhanced; cost model updated",
      "Mid-term benefits review; risk landscape reassessment; resource model refreshed",
      "Change management log in use; communications strategy reviewed",
      "Programme performance dashboard launched; resource capacity review",
      "Benefits realisation interim report published; programme health check commissioned",
    ],
    series: { strategy: flat(5), risk: flat(5), decision: flat(5), scope: flat(5), comms: flat(5), planning: flat(5), resourcing: flat(5), collaboration: flat(5) },
  },
  {
    id: "p2", code: "P2", name: "Hospital Design & Clinical Planning",
    lead: "Design Authority Lead", sponsor: "Programme Board",
    context: "Hospital design and clinical-planning workstream — sound delivery with well-controlled design governance.",
    focus: [
      "Design brief issued; site survey completed; BIM environment configured",
      "Concept designs reviewed; infection-control constraints confirmed",
      "Schematic design approved; structural concept agreed",
      "Detailed design issued; MEP coordination underway",
      "Design freeze reached; BIM model completed to LOD 350",
      "Post-design queries managed; variation register active",
      "Clinical workflow validation with surgical teams; equipment interfaces confirmed",
      "Design-to-operations knowledge handover; design lessons captured",
    ],
    series: { strategy: flat(4), risk: flat(4), decision: flat(4), scope: flat(4), comms: flat(4), planning: flat(4), resourcing: flat(4), collaboration: flat(4) },
  },
  {
    id: "p3", code: "P3", name: "Construction",
    lead: "Construction Director", sponsor: "Programme Board",
    context: "Main construction workstream — competent, but carrying the typical build pressures on cost and schedule.",
    focus: [
      "Site establishment; enabling works; demolition of existing structures",
      "Foundation excavation; drainage diversions; groundworks underway",
      "Foundations complete; structural steel frame erection",
      "Superstructure topping out; floor slabs poured",
      "External envelope; cladding and glazing",
      "Internal fit-out commenced; MEP first fix",
      "MEP second fix; medical gas installations",
      "Decoration and finishes; commissioning preparation",
    ],
    series: { strategy: flat(3), risk: flat(3), decision: flat(3), scope: flat(3), comms: flat(3), planning: flat(3), resourcing: flat(3), collaboration: flat(3) },
  },
  {
    id: "p4", code: "P4", name: "Medical Equipment Procurement",
    lead: "Procurement Lead", sponsor: "Programme Board",
    context: "Medical-equipment procurement workstream — under strain, with weak controls across every dimension.",
    focus: [
      "Equipment register compiled; clinical requirements workshop",
      "Procurement strategy approved; supplier market engagement",
      "Invitation to tender issued to key vendors",
      "Tender evaluation; preferred supplier selection",
      "Contracts placed with Philips, Siemens, Stryker, GE, Getinge, Dräger",
      "Delivery schedules confirmed; installation sequencing agreed",
      "Installation planning; site readiness criteria defined",
      "First equipment deliveries; biomedical acceptance testing begins",
    ],
    series: { strategy: flat(2), risk: flat(2), decision: flat(2), scope: flat(2), comms: flat(2), planning: flat(2), resourcing: flat(2), collaboration: flat(2) },
  },
  {
    id: "p5", code: "P5", name: "Digital Hospital Systems",
    lead: "Kezia Brown · Digital Programme Manager", sponsor: "Programme Board",
    context: "Digital hospital systems (EMR, network, cyber) — the highest-risk workstream, in crisis across every dimension.",
    focus: [
      "Digital strategy confirmed; EMR current-state assessment",
      "Network architecture designed; cyber-security framework adopted",
      "EMR specification issued; vendor selection process underway",
      "Contracts signed; system design completed",
      "Network infrastructure build begins; server provisioning",
      "EMR configuration underway; integration architecture designed",
      "System testing commenced; data-migration strategy agreed",
      "Clinical-systems training planned; go-live rehearsal preparation",
    ],
    series: { strategy: flat(1), risk: flat(1), decision: flat(1), scope: flat(1), comms: flat(1), planning: flat(1), resourcing: flat(1), collaboration: flat(1) },
  },
  {
    id: "p6", code: "P6", name: "Operational Readiness",
    lead: "Operational Readiness Lead", sponsor: "Programme Board",
    context: "Operational-readiness workstream — a genuine turnaround: strong governance throughout, with early communications and collaboration failures remediated quarter on quarter.",
    focus: [
      "Operational readiness plan published; change-impact assessment complete",
      "Training needs analysis; simulation-centre dates confirmed",
      "Process-design workshops; staffing model draft",
      "Recruitment plan approved; role profiles updated",
      "First-cohort simulation training; lessons fed back",
      "Draft operational procedures published; staff communication campaign",
      "Full-scale simulation exercises; readiness dashboard live",
      "Final readiness assessment; programme board approval",
    ],
    series: {
      strategy:      [5, 5, 5, 5, 5, 5, 5, 5],
      risk:          [5, 5, 5, 5, 5, 5, 4, 5],
      decision:      [4, 4, 4, 4, 4, 4, 5, 5],
      scope:         [4, 4, 4, 4, 4, 4, 5, 5],
      comms:         [2, 1, 2, 3, 3, 4, 5, 5],
      planning:      [4, 4, 4, 4, 4, 4, 5, 5],
      resourcing:    [4, 4, 4, 4, 4, 4, 5, 5],
      collaboration: [1, 2, 2, 2, 3, 4, 5, 5],
    },
  },
  {
    id: "p7", code: "P7", name: "Commissioning & Regulatory Approval",
    lead: "Commissioning Manager", sponsor: "Programme Board",
    context: "Commissioning and regulatory-approval workstream — technically strong, recovering from early communications and collaboration weaknesses toward go-live.",
    focus: [
      "Commissioning plan agreed; regulatory roadmap published",
      "Technical standards and HTM guidance reviewed",
      "Commissioning team fully mobilised; testing protocols drafted",
      "Systems testing schedule aligned with construction programme",
      "Regulatory submission packs in preparation",
      "Fire-safety strategy approved by fire authority",
      "Medical-gas commissioning and purging commenced",
      "Integrated systems testing; pre-occupation inspection prep",
    ],
    series: {
      strategy:      [5, 5, 5, 5, 5, 5, 5, 5],
      risk:          [5, 5, 5, 5, 5, 5, 4, 5],
      decision:      [4, 4, 4, 4, 4, 4, 5, 5],
      scope:         [4, 4, 4, 4, 4, 4, 5, 5],
      comms:         [2, 1, 2, 3, 3, 4, 5, 5],
      planning:      [4, 4, 4, 4, 4, 4, 5, 5],
      resourcing:    [4, 4, 4, 4, 4, 4, 5, 5],
      collaboration: [1, 2, 2, 2, 3, 4, 5, 5],
    },
  },
  {
    id: "p8", code: "P8", name: "Transition to Operations",
    lead: "Transition Lead", sponsor: "Programme Board",
    context: "Transition-to-operations workstream — improving but volatile, still building the maturity needed for a safe move.",
    focus: [
      "Transition strategy approved; risk and readiness assessment",
      "Stakeholder communication plan live; transition committee formed",
      "Logistics plan drafted; equipment-move sequencing agreed",
      "Patient-pathway redesign workshops; pathway testing",
      "Staff move plan finalised; buddy system in place",
      "Dry-run planning completed; lessons incorporated",
      "Transition simulation exercises; go-live criteria checked",
      "Final transition plan approved; countdown plan activated",
    ],
    series: {
      strategy:      [1, 2, 2, 3, 3, 2, 3, 3],
      risk:          [1, 2, 2, 3, 3, 2, 3, 3],
      decision:      [1, 2, 2, 3, 3, 2, 3, 3],
      scope:         [1, 2, 2, 3, 3, 2, 3, 3],
      comms:         [1, 2, 2, 3, 3, 2, 3, 3],
      planning:      [1, 2, 2, 3, 3, 2, 3, 3],
      resourcing:    [1, 2, 2, 3, 3, 2, 3, 3],
      collaboration: [1, 2, 2, 3, 3, 2, 3, 3],
    },
  },
];

const PORTFOLIO = {
  name: "New Acute Hospital Programme",
  objective: "35% uplift in elective capacity by go-live",
  generatedAt: "2026-07-03",
  quarterCount: 8,
  dimensions: DIMENSIONS,
  quarterLabels: QUARTER_LABELS,
  bands: { narr: BAND_NARR, risks: BAND_RISKS, recs: BAND_RECS },
  // `projects` are the raw workstreams; app.js resolves them per quarter.
  projects: PHASES,
};

/* Convenience: expose on window for the plain-script app. */
window.PORTFOLIO = PORTFOLIO;
window.IMPACT = IMPACT;
