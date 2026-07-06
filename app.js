/* ============================================================================
 * Anemetrics Risk Dashboard — application logic
 * ----------------------------------------------------------------------------
 * Content is sourced entirely from data.js (window.PORTFOLIO / window.IMPACT).
 * This file renders that content into the Anemetrics dashboard UI.
 *
 * Role gating:
 *   · Portfolio View    -> all phases overview + drill into any phase + dimensions
 *   · Phase View        -> ONLY their assigned phase + its dimensions
 *
 * Router has three levels: portfolio -> phase -> dimension.
 * ==========================================================================*/

const P = window.PORTFOLIO;
/* IMPACT is already declared globally in data.js — reuse it directly. */

/* ---- small DOM helper ---------------------------------------------------- */
function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const k in attrs) {
      if (k === "class") node.className = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else if (k.startsWith("on") && typeof attrs[k] === "function") {
        node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      } else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) {
        node.setAttribute(k, attrs[k]);
      }
    }
  }
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c === null || c === undefined || c === false) return;
    node.appendChild(typeof c === "string" || typeof c === "number"
      ? document.createTextNode(String(c)) : c);
  });
  return node;
}
const sym = (name, cls, fill) =>
  el("span", { class: "material-symbols-outlined " + (cls || ""),
    style: fill ? "font-variation-settings:'FILL' 1;" : null }, name);

/* ---- RAG semantics (health score: high = good) --------------------------- */
function ragOf(score) { return score >= 75 ? "green" : score >= 55 ? "amber" : "red"; }
const RAG_HEX = { green: "#34d399", amber: "#fbbf24", red: "#f87171" };
function ragText(rag)  { return rag === "green" ? "text-rag-green" : rag === "amber" ? "text-rag-amber" : "text-rag-red"; }
function ragBg(rag)    { return rag === "green" ? "bg-rag-green" : rag === "amber" ? "bg-rag-amber" : "bg-rag-red"; }
function ragLabel(rag) { return rag === "green" ? "Healthy" : rag === "amber" ? "At risk" : "Critical"; }
function heatColor(score) {
  const r = ragOf(score);
  return r === "green" ? "rgba(52,211,153,0.85)" : r === "amber" ? "rgba(251,191,36,0.85)" : "rgba(248,113,113,0.85)";
}

/* ---- impact + severity styling ------------------------------------------ */
const SEV_META = {
  high:   { label: "CRITICAL", chip: "bg-error-container text-on-error-container", bar: "bg-rag-red",   dots: 4, dot: "bg-rag-red" },
  medium: { label: "MEDIUM",   chip: "bg-tertiary-container/30 text-tertiary",     bar: "bg-rag-amber", dots: 2, dot: "bg-rag-amber" },
  low:    { label: "LOW",      chip: "bg-rag-green-dim text-rag-green",            bar: "bg-rag-green", dots: 1, dot: "bg-rag-green" },
};
const IMPACT_ICON = { budget: "payments", timeline: "schedule", objectives: "flag" };

/* ---- dimension -> Material Symbol icon ---------------------------------- */
const DIM_ICON = {
  strategy: "target", risk: "security", decision: "balance", scope: "crop_free",
  comms: "campaign", planning: "map", resourcing: "groups", collaboration: "handshake",
};

/* ---- app state ----------------------------------------------------------- */
const state = {
  role: "hod",
  pmProjectId: P.projects[0].id,
  level: "portfolio",
  projectId: null,
  dimKey: null,
};

const $view = document.getElementById("view");
const tooltip = document.getElementById("tooltip");

/* ---- tooltip helpers ----------------------------------------------------- */
function showTip(html, x, y) {
  tooltip.innerHTML = html;
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
  tooltip.hidden = false;
}
function hideTip() { tooltip.hidden = true; }

/* ============================================================================
 * Interactive SVG line chart (hover crosshair + tooltip)
 * ==========================================================================*/
function lineChart(series, opts) {
  opts = opts || {};
  const w = opts.w || 520, h = opts.h || 140, pad = 22;
  const labels = P.weekLabels;
  const min = 0, max = 100;
  const xOf = (i) => pad + (i * (w - pad * 2)) / (series.length - 1);
  const yOf = (v) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const color = opts.color || "#c0c1ff";

  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("class", "lc-hit");

  [0, 25, 50, 75, 100].forEach((g) => {
    const ln = document.createElementNS(NS, "line");
    ln.setAttribute("x1", pad); ln.setAttribute("x2", w - pad);
    ln.setAttribute("y1", yOf(g)); ln.setAttribute("y2", yOf(g));
    ln.setAttribute("stroke", "#273647"); ln.setAttribute("stroke-width", "1");
    svg.appendChild(ln);
  });

  const linePts = series.map((v, i) => `${xOf(i)},${yOf(v)}`).join(" ");
  const areaPts = `${pad},${h - pad} ${linePts} ${w - pad},${h - pad}`;
  const gid = "g" + Math.random().toString(36).slice(2, 8);
  const defs = document.createElementNS(NS, "defs");
  defs.innerHTML = `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient>`;
  svg.appendChild(defs);

  const area = document.createElementNS(NS, "polygon");
  area.setAttribute("points", areaPts);
  area.setAttribute("fill", `url(#${gid})`);
  svg.appendChild(area);

  const poly = document.createElementNS(NS, "polyline");
  poly.setAttribute("points", linePts);
  poly.setAttribute("fill", "none");
  poly.setAttribute("stroke", color);
  poly.setAttribute("stroke-width", "2.5");
  poly.setAttribute("stroke-linejoin", "round");
  poly.setAttribute("stroke-linecap", "round");
  svg.appendChild(poly);

  const cross = document.createElementNS(NS, "line");
  cross.setAttribute("stroke", "#7bd0ff"); cross.setAttribute("stroke-width", "1");
  cross.setAttribute("stroke-dasharray", "3 3"); cross.setAttribute("opacity", "0");
  cross.setAttribute("y1", pad); cross.setAttribute("y2", h - pad);
  svg.appendChild(cross);

  const dots = series.map((v, i) => {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", xOf(i)); c.setAttribute("cy", yOf(v));
    c.setAttribute("r", "3"); c.setAttribute("fill", "#051424");
    c.setAttribute("stroke", color); c.setAttribute("stroke-width", "2");
    c.setAttribute("class", "lc-dot");
    svg.appendChild(c);
    return c;
  });

  svg.addEventListener("mousemove", (e) => {
    const rect = svg.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width * w;
    let idx = Math.round((rel - pad) / ((w - pad * 2) / (series.length - 1)));
    idx = Math.max(0, Math.min(series.length - 1, idx));
    cross.setAttribute("x1", xOf(idx)); cross.setAttribute("x2", xOf(idx));
    cross.setAttribute("opacity", "1");
    dots.forEach((d, i) => d.setAttribute("r", i === idx ? "5" : "3"));
    showTip(
      `<div class="tt-label">${labels[idx]}</div><div>Health <b>${series[idx]}</b></div>`,
      e.clientX, e.clientY - 6
    );
  });
  svg.addEventListener("mouseleave", () => {
    cross.setAttribute("opacity", "0");
    dots.forEach((d) => d.setAttribute("r", "3"));
    hideTip();
  });
  return svg;
}

/* ---- compact trend bars (header sparkline) ------------------------------ */
function trendBars(series, rag) {
  const wrap = el("div", { class: "flex gap-1.5 items-end h-12" });
  const max = 100;
  series.forEach((v, i) => {
    const isLast = i === series.length - 1;
    wrap.appendChild(el("div", {
      class: "w-3 rounded-t-sm " + (isLast ? ragBg(rag) : "bg-primary/30"),
      style: `height:${Math.max(6, (v / max) * 48)}px`,
      title: `${P.weekLabels[i]}: ${v}`,
    }));
  });
  return wrap;
}

/* ---- trend delta (first vs last) ---------------------------------------- */
function trendDelta(series) {
  const d = series[series.length - 1] - series[0];
  const up = d > 0, flat = d === 0;
  const icon = flat ? "trending_flat" : up ? "trending_up" : "trending_down";
  const cls = flat ? "text-on-surface-variant" : up ? "text-rag-green" : "text-rag-red";
  return el("span", { class: "flex items-center gap-1 text-body-sm font-bold " + cls }, [
    sym(icon, "text-[16px]"), (d > 0 ? "+" : "") + d + " over 8 wks",
  ]);
}

/* ---- risk tally across a project ---------------------------------------- */
function riskTally(project) {
  let high = 0, med = 0, low = 0;
  P.dimensions.forEach((d) => {
    (project.dimensions[d.key].risks || []).forEach((r) => {
      if (r.severity === "high") high++; else if (r.severity === "medium") med++; else low++;
    });
  });
  return { high, med, low, total: high + med + low };
}

/* ============================================================================
 * CHROME: top nav, sidebar, breadcrumb
 * ==========================================================================*/
function currentProject() {
  const id = state.role === "pm" ? state.pmProjectId : state.projectId;
  return P.projects.find((p) => p.id === id);
}

function renderChrome() {
  document.getElementById("genStamp").textContent = "Generated " + P.generatedAt;

  const topNav = document.getElementById("topNav");
  topNav.innerHTML = "";
  const navItems = state.role === "hod"
    ? [{ label: "Portfolio Overview", go: goPortfolio, active: state.level === "portfolio" }]
    : [{ label: "My Project", go: () => goProject(state.pmProjectId), active: state.level === "project" }];
  navItems.forEach((it) => {
    topNav.appendChild(el("a", {
      class: "font-medium transition-colors duration-200 cursor-pointer " +
        (it.active ? "text-primary" : "text-on-surface-variant hover:text-primary"),
      onclick: it.go,
    }, it.label));
  });

  const sideTitle = document.getElementById("sideTitle");
  const sideSub = document.getElementById("sideSub");
  if (state.role === "hod") {
    sideTitle.textContent = "SportCo Programme";
    sideSub.textContent = P.projects.length + " Phases · 2-Year Build";
  } else {
    const proj = currentProject();
    sideTitle.textContent = proj.code + " · " + proj.name.split("—")[1].trim();
    sideSub.textContent = "PM · " + proj.pm;
  }

  const sideNav = document.getElementById("sideNav");
  sideNav.innerHTML = "";
  if (state.role === "hod") {
    sideNav.appendChild(el("div", {
      class: "side-item " + (state.level === "portfolio" ? "is-active" : ""),
      onclick: goPortfolio,
    }, [sym("dashboard", "text-[20px]"), el("span", { class: "font-label-caps text-label-caps" }, "Portfolio Overview")]));
    P.projects.forEach((p) => {
      const active = state.level !== "portfolio" && state.projectId === p.id;
      sideNav.appendChild(el("div", {
        class: "side-item " + (active ? "is-active" : ""),
        onclick: () => goProject(p.id),
      }, [
        el("span", { class: "material-symbols-outlined text-[20px] " + ragText(ragOf(p.overallScore)) }, "folder"),
        el("span", { class: "font-label-caps text-label-caps flex-1" }, p.code),
        el("span", { class: "text-[10px] font-data-mono " + ragText(ragOf(p.overallScore)) }, p.overallScore),
      ]));
    });
  } else {
    const proj = currentProject();
    sideNav.appendChild(el("div", {
      class: "side-item " + (state.level === "project" ? "is-active" : ""),
      onclick: () => goProject(proj.id),
    }, [sym("summarize", "text-[20px]"), el("span", { class: "font-label-caps text-label-caps" }, "Executive Summary")]));
    P.dimensions.forEach((d) => {
      const dim = proj.dimensions[d.key];
      const active = state.level === "dimension" && state.dimKey === d.key;
      sideNav.appendChild(el("div", {
        class: "side-item " + (active ? "is-active" : ""),
        onclick: () => goDimension(proj.id, d.key),
      }, [
        sym(DIM_ICON[d.key], "text-[20px]"),
        el("span", { class: "font-label-caps text-label-caps flex-1" }, d.name),
        el("span", { class: "text-[10px] font-data-mono " + ragText(ragOf(dim.score)) }, dim.score),
      ]));
    });
  }
}

/* ---- breadcrumb --------------------------------------------------------- */
function breadcrumb() {
  const crumbs = [];
  if (state.role === "hod") crumbs.push({ label: "Portfolio", go: goPortfolio });
  if (state.level !== "portfolio") {
    const proj = currentProject();
    crumbs.push({ label: proj.code + " — " + proj.name.split("—")[1].trim(), go: () => goProject(proj.id) });
  }
  if (state.level === "dimension") {
    const dim = P.dimensions.find((d) => d.key === state.dimKey);
    crumbs.push({ label: dim.name });
  }
  const nav = el("nav", { class: "flex items-center gap-2 mb-4 text-body-sm flex-wrap" });
  crumbs.forEach((c, i) => {
    const isCurrent = i === crumbs.length - 1;
    nav.appendChild(el("span", {
      class: "crumb " + (isCurrent ? "is-current" : ""),
      onclick: isCurrent ? null : c.go,
    }, c.label));
    if (!isCurrent) nav.appendChild(sym("chevron_right", "text-[16px] text-outline"));
  });
  return nav;
}

/* ============================================================================
 * NAVIGATION
 * ==========================================================================*/
function goPortfolio() {
  if (state.role !== "hod") return goProject(state.pmProjectId);
  state.level = "portfolio"; state.projectId = null; state.dimKey = null;
  render();
}
function goProject(id) {
  state.level = "project"; state.projectId = id; state.dimKey = null;
  if (state.role === "pm") state.pmProjectId = id;
  render();
}
function goDimension(id, key) {
  state.level = "dimension"; state.projectId = id; state.dimKey = key;
  if (state.role === "pm") state.pmProjectId = id;
  render();
}

/* ============================================================================
 * LEVEL 1 — PORTFOLIO OVERVIEW  (Head of Delivery only)
 * ==========================================================================*/
function renderPortfolio() {
  const frag = document.createDocumentFragment();
  frag.appendChild(breadcrumb());

  const atRisk = P.projects.filter((p) => ragOf(p.overallScore) !== "green");
  const worst = P.projects.slice().sort((a, b) => a.overallScore - b.overallScore)[0];
  frag.appendChild(copilotBanner(
    `${atRisk.length} of ${P.projects.length} phases need attention. ` +
    `<b>${worst.name.split("—")[1].trim()}</b> is the most exposed at a health score of ` +
    `<span class="text-rag-red font-bold">${worst.overallScore}</span> — absent risk management and chronic under-planning run through every phase.`
  ));

  const avg = Math.round(P.projects.reduce((s, p) => s + p.overallScore, 0) / P.projects.length);
  const totalRisks = P.projects.reduce((s, p) => s + riskTally(p).total, 0);
  const highRisks = P.projects.reduce((s, p) => s + riskTally(p).high, 0);
  frag.appendChild(el("div", { class: "grid grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter" }, [
    kpiCard("Portfolio Health", avg + "", ragText(ragOf(avg)), "monitoring", "Mean score across 8 dimensions"),
    kpiCard("Programmes at Risk", atRisk.length + "/" + P.projects.length, atRisk.length ? "text-rag-amber" : "text-rag-green", "warning", "Amber or red overall status"),
    kpiCard("Critical Risks", highRisks + "", highRisks ? "text-rag-red" : "text-rag-green", "priority_high", "High-severity risks live now"),
    kpiCard("Tracked Risks", totalRisks + "", "text-primary", "flag", "Across all programmes & dimensions"),
  ]));

  const grid = el("div", { class: "grid grid-cols-12 gap-gutter" });
  grid.appendChild(el("section", { class: "col-span-12 xl:col-span-7" }, [programmesTable()]));
  grid.appendChild(el("section", { class: "col-span-12 xl:col-span-5" }, [heatmap()]));
  grid.appendChild(el("section", { class: "col-span-12" }, [portfolioRecommendations()]));
  frag.appendChild(grid);
  $view.appendChild(frag);
}

function kpiCard(label, value, valueCls, icon, sub) {
  return el("div", { class: "glass-card p-4 is-hoverable" }, [
    el("div", { class: "flex justify-between items-start mb-3" }, [
      el("span", { class: "font-label-caps text-label-caps text-on-surface-variant uppercase tracking-tight" }, label),
      sym(icon, "text-on-surface-variant text-[20px]"),
    ]),
    el("p", { class: "text-display-lg font-bold " + valueCls }, value),
    el("p", { class: "text-body-sm text-on-surface-variant mt-1" }, sub),
  ]);
}

function programmesTable() {
  const card = el("div", { class: "glass-card overflow-hidden" });
  card.appendChild(el("div", { class: "px-6 py-4 border-b border-outline-variant flex justify-between items-center" }, [
    el("h3", { class: "font-headline-sm text-headline-sm text-on-surface" }, "Programmes"),
    el("span", { class: "text-body-sm text-on-surface-variant" }, "Click a row to drill in"),
  ]));
  const table = el("table", { class: "w-full text-left border-collapse" });
  table.appendChild(el("thead", {}, el("tr", { class: "bg-surface-container-low" },
    ["Programme", "Owner", "Health", "Budget", "Timeline", "Objectives", "Risks"].map((h) =>
      el("th", { class: "px-4 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase" }, h)))));
  const tbody = el("tbody", { class: "divide-y divide-outline-variant" });
  P.projects.forEach((p) => {
    const rag = ragOf(p.overallScore);
    const t = riskTally(p);
    tbody.appendChild(el("tr", {
      class: "hover:bg-surface-variant/30 transition-colors clickable",
      onclick: () => goProject(p.id),
    }, [
      el("td", { class: "px-4 py-4" }, [
        el("div", { class: "flex items-center gap-3" }, [
          el("div", { class: "w-2 h-10 rounded-full " + ragBg(rag) }),
          el("div", {}, [
            el("p", { class: "font-bold text-on-surface" }, p.name.split("—")[1].trim()),
            el("p", { class: "text-body-sm text-on-surface-variant" }, p.code + " · " + p.sponsor),
          ]),
        ]),
      ]),
      el("td", { class: "px-4 py-4 text-body-sm text-on-surface-variant" }, p.pm),
      el("td", { class: "px-4 py-4" }, [
        el("div", { class: "flex items-center gap-2" }, [
          el("span", { class: "text-headline-sm font-bold font-data-mono " + ragText(rag) }, p.overallScore),
          trendMini(p.overallTrend, rag),
        ]),
      ]),
      statusPill(p.budget.status),
      statusPill(p.timeline.status, p.timeline.variance),
      statusPill(p.objectives.status, p.objectives.delivered + "/" + p.objectives.total),
      el("td", { class: "px-4 py-4" }, [
        el("div", { class: "flex gap-1 items-center" }, [
          t.high ? riskChip(t.high, "bg-rag-red") : null,
          t.med ? riskChip(t.med, "bg-rag-amber") : null,
          t.low ? riskChip(t.low, "bg-rag-green") : null,
        ]),
      ]),
    ]));
  });
  table.appendChild(tbody);
  card.appendChild(el("div", { class: "overflow-x-auto" }, table));
  return card;
}

function riskChip(n, bg) {
  return el("span", { class: "inline-flex items-center justify-center min-w-[22px] h-5 px-1 rounded-full text-[10px] font-bold text-background " + bg }, n + "");
}
function statusPill(status, extra) {
  const rag = status === "green" ? "green" : status === "amber" ? "amber" : "red";
  return el("td", { class: "px-4 py-4" }, [
    el("div", { class: "flex items-center gap-2" }, [
      el("span", { class: "w-2.5 h-2.5 rounded-full " + ragBg(rag) }),
      extra ? el("span", { class: "text-body-sm text-on-surface-variant" }, extra)
            : el("span", { class: "text-body-sm text-on-surface-variant capitalize" }, status),
    ]),
  ]);
}
function trendMini(series, rag) {
  const NS = "http://www.w3.org/2000/svg";
  const w = 64, h = 20;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`); svg.setAttribute("width", w); svg.setAttribute("height", h);
  const xOf = (i) => (i * w) / (series.length - 1);
  const yOf = (v) => h - 2 - (v / 100) * (h - 4);
  const poly = document.createElementNS(NS, "polyline");
  poly.setAttribute("points", series.map((v, i) => `${xOf(i)},${yOf(v)}`).join(" "));
  poly.setAttribute("fill", "none"); poly.setAttribute("stroke", RAG_HEX[rag]); poly.setAttribute("stroke-width", "1.5");
  svg.appendChild(poly);
  return svg;
}

/* ---- dimension heatmap (projects × dimensions) -------------------------- */
function heatmap() {
  const card = el("div", { class: "glass-card p-6" });
  card.appendChild(el("div", { class: "flex items-center gap-3 mb-4" }, [
    sym("grid_view", "text-tertiary", true),
    el("h3", { class: "font-headline-sm text-headline-sm text-on-surface" }, "Dimension Heatmap"),
  ]));
  card.appendChild(el("p", { class: "text-body-sm text-on-surface-variant mb-4" },
    "Health score per programme across all 8 delivery dimensions. Click a cell to open it."));

  const tbl = el("table", { class: "w-full border-separate", style: "border-spacing:3px;" });
  tbl.appendChild(el("tr", {}, [el("th", {})].concat(
    P.projects.map((p) => el("th", { class: "text-[10px] font-data-mono text-on-surface-variant pb-1", title: p.name }, p.code)))));
  P.dimensions.forEach((d) => {
    const row = el("tr", {}, [
      el("td", { class: "text-body-sm text-on-surface-variant pr-2 whitespace-nowrap" }, d.name),
    ]);
    P.projects.forEach((p) => {
      const score = p.dimensions[d.key].score;
      row.appendChild(el("td", {}, [
        el("div", {
          class: "h-9 rounded flex items-center justify-center text-[11px] font-bold font-data-mono clickable transition-transform hover:scale-105",
          style: `background:${heatColor(score)};color:#051424;`,
          onclick: () => goDimension(p.id, d.key),
          title: p.code + " · " + d.name + " = " + score,
        }, score + ""),
      ]));
    });
    tbl.appendChild(row);
  });
  card.appendChild(el("div", { class: "overflow-x-auto" }, tbl));
  card.appendChild(el("div", { class: "flex items-center gap-4 mt-4 text-body-sm text-on-surface-variant" }, [
    legendSwatch("#f87171", "Critical <55"),
    legendSwatch("#fbbf24", "At risk 55–74"),
    legendSwatch("#34d399", "Healthy ≥75"),
  ]));
  return card;
}
function legendSwatch(hex, label) {
  return el("span", { class: "flex items-center gap-1.5" }, [
    el("span", { class: "w-3 h-3 rounded", style: "background:" + hex }), label,
  ]);
}

/* ---- portfolio-level principal recommendations -------------------------- */
function portfolioRecommendations() {
  const wrap = el("div", {});
  wrap.appendChild(el("h3", { class: "font-headline-sm text-headline-sm text-on-surface px-1 mb-3" },
    "Portfolio Principal Recommendations"));
  const grid = el("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-3" });
  const atRisk = P.projects.filter((p) => ragOf(p.overallScore) !== "green")
    .sort((a, b) => a.overallScore - b.overallScore);
  atRisk.forEach((p) => {
    p.overallRecommendations.slice(0, 1).forEach((rec) => {
      const rag = ragOf(p.overallScore);
      grid.appendChild(el("div", {
        class: "glass-card p-4 is-hoverable clickable group",
        onclick: () => goProject(p.id),
      }, [
        el("div", { class: "flex gap-4" }, [
          el("div", { class: "p-2 rounded h-fit " + ragBg(rag) + "/10 " + ragText(rag) }, sym("priority_high")),
          el("div", { class: "flex-1" }, [
            el("p", { class: "font-label-caps text-label-caps uppercase " + ragText(rag) }, p.code + " · " + ragLabel(rag)),
            el("p", { class: "font-bold text-on-surface mt-1 group-hover:text-primary transition-colors" }, rec),
          ]),
          sym("chevron_right", "text-on-surface-variant self-center"),
        ]),
      ]));
    });
  });
  wrap.appendChild(grid);
  return wrap;
}

/* ============================================================================
 * LEVEL 2 — PROJECT DEEP DIVE
 * ==========================================================================*/
function renderProject() {
  const proj = currentProject();
  const rag = ragOf(proj.overallScore);
  const frag = document.createDocumentFragment();
  frag.appendChild(breadcrumb());

  frag.appendChild(copilotBanner(
    `Copilot summary for <b>${proj.name.split("—")[1].trim()}</b>: overall health ` +
    `<span class="${ragText(rag)} font-bold">${proj.overallScore}</span> (${ragLabel(rag)}). ` +
    (rag === "green"
      ? "No executive intervention required — maintain trajectory."
      : "See the highlighted dimensions and overall recommendations below.")
  ));

  const grid = el("div", { class: "grid grid-cols-12 gap-gutter" });
  grid.appendChild(el("section", { class: "col-span-12 lg:col-span-8 flex flex-col gap-gutter" }, [
    projectHeader(proj, rag),
    execNarrative(proj),
  ]));
  grid.appendChild(el("aside", { class: "col-span-12 lg:col-span-4" }, [overallCopilotPanel(proj, rag)]));
  grid.appendChild(el("section", { class: "col-span-12 lg:col-span-5 flex flex-col gap-gutter" }, [vitals(proj)]));
  grid.appendChild(el("section", { class: "col-span-12 lg:col-span-7" }, [overallRecoList(proj)]));
  grid.appendChild(el("section", { class: "col-span-12" }, [dimensionGrid(proj)]));
  frag.appendChild(grid);
  $view.appendChild(frag);
}

function projectHeader(proj, rag) {
  return el("div", { class: "glass-card p-6 relative overflow-hidden" }, [
    el("div", { class: "flex items-center gap-2 mb-2" }, [
      el("span", { class: "material-symbols-outlined " + ragText(rag) }, "workspaces"),
      el("span", { class: "text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase" }, proj.code + " · " + proj.sponsor),
    ]),
    el("h2", { class: "font-display-lg text-display-lg text-on-surface mb-1" }, proj.name.split("—")[1].trim()),
    el("p", { class: "text-body-sm text-on-surface-variant mb-6" }, "Managed by " + proj.pm),
    el("div", { class: "flex items-baseline gap-6" }, [
      el("div", {}, [
        el("p", { class: "text-on-surface-variant text-body-sm mb-1 uppercase font-bold tracking-tight" }, "Health Score"),
        el("p", { class: "text-display-lg font-bold " + ragText(rag) }, proj.overallScore + ""),
        el("div", { class: "mt-1" }, trendDelta(proj.overallTrend)),
      ]),
      el("div", { class: "h-16 w-[1px] bg-outline-variant" }),
      el("div", { class: "flex-1" }, [
        el("p", { class: "text-on-surface-variant text-body-sm mb-2 uppercase font-bold tracking-tight" }, "8-Week Trend"),
        trendBars(proj.overallTrend, rag),
      ]),
    ]),
  ]);
}

function execNarrative(proj) {
  return el("div", { class: "glass-card ai-glow p-6" }, [
    el("div", { class: "flex items-center gap-3 mb-4" }, [
      sym("auto_awesome", "text-tertiary", true),
      el("h3", { class: "font-headline-sm text-headline-sm text-on-surface" }, "Intelligence Narrative"),
    ]),
    el("p", { class: "text-on-surface leading-relaxed text-body-md" }, proj.executiveSummary),
  ]);
}

function overallCopilotPanel(proj, rag) {
  return el("div", { class: "bg-tertiary-container text-on-tertiary-container p-6 rounded-lg relative overflow-hidden flex flex-col justify-between h-full min-h-[380px]" }, [
    el("div", { class: "relative z-10" }, [
      el("div", { class: "flex items-center gap-2 mb-6" }, [
        sym("psychology", "", true),
        el("span", { class: "font-label-caps text-label-caps uppercase tracking-widest" }, "Copilot's Top Recommendation"),
      ]),
      el("h4", { class: "font-headline-md text-headline-md mb-4 leading-tight" }, proj.overallRecommendations[0]),
      el("div", { class: "space-y-3" }, [
        infoChip("check_circle", "Overall health: " + proj.overallScore + " (" + ragLabel(rag) + ")"),
        infoChip("flag", riskTally(proj).high + " critical · " + riskTally(proj).med + " medium risks live"),
        infoChip("timer", "Review cadence: weekly steering"),
      ]),
    ]),
    el("button", {
      class: "mt-8 bg-on-tertiary-container text-tertiary-container py-3 px-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors relative z-10",
      onclick: () => goDimension(proj.id, weakestDim(proj)),
    }, ["Open weakest dimension", sym("arrow_forward")]),
    el("div", { class: "absolute -bottom-12 -right-12 opacity-30 pointer-events-none" },
      el("span", { class: "material-symbols-outlined text-[240px]", style: "font-variation-settings:'wght' 100;" }, "monitoring")),
  ]);
}
function infoChip(icon, text) {
  return el("div", { class: "flex items-center gap-3 bg-on-tertiary-container/10 p-3 rounded-md" }, [
    sym(icon, "text-[20px]"), el("span", { class: "text-body-sm font-medium" }, text),
  ]);
}
function weakestDim(proj) {
  return P.dimensions.slice().sort((a, b) =>
    proj.dimensions[a.key].score - proj.dimensions[b.key].score)[0].key;
}

/* ---- delivery vitals: budget / timeline / objectives -------------------- */
function vitals(proj) {
  const wrap = el("div", {});
  wrap.appendChild(el("h3", { class: "font-headline-sm text-headline-sm text-on-surface px-1 mb-3" }, "Delivery Vitals"));
  const grid = el("div", { class: "grid grid-cols-2 gap-4" });

  const b = proj.budget;
  const bPct = Math.round((b.spent / b.total) * 100);
  grid.appendChild(el("div", { class: "glass-card p-4 col-span-1" }, [
    el("div", { class: "flex justify-between items-start mb-3" }, [
      el("span", { class: "font-label-caps text-label-caps text-on-surface-variant uppercase" }, "Budget"),
      el("span", { class: "material-symbols-outlined " + ragText(b.status === "green" ? "green" : b.status === "amber" ? "amber" : "red") }, "payments"),
    ]),
    el("p", { class: "text-headline-md font-bold text-on-surface" }, b.unit + b.spent + " / " + b.unit + b.total),
    progressBar(bPct, b.status),
    el("p", { class: "text-body-sm text-on-surface-variant mt-2" }, b.note),
  ]));

  const t = proj.timeline;
  grid.appendChild(el("div", { class: "glass-card p-4 col-span-1" }, [
    el("div", { class: "flex justify-between items-start mb-3" }, [
      el("span", { class: "font-label-caps text-label-caps text-on-surface-variant uppercase" }, "Timeline"),
      el("span", { class: "material-symbols-outlined " + ragText(t.status === "green" ? "green" : t.status === "amber" ? "amber" : "red") }, "schedule"),
    ]),
    el("p", { class: "text-headline-md font-bold text-on-surface" }, t.variance),
    el("p", { class: "text-body-sm text-on-surface-variant mt-2" }, t.milestone + " · due " + t.due),
  ]));

  const o = proj.objectives;
  grid.appendChild(el("div", { class: "glass-card p-5 col-span-2 flex items-center gap-6" }, [
    el("div", {
      class: "w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-headline-sm font-data-mono " +
        (o.status === "green" ? "border-rag-green text-rag-green" : o.status === "amber" ? "border-rag-amber text-rag-amber" : "border-rag-red text-rag-red"),
    }, o.delivered + "/" + o.total),
    el("div", {}, [
      el("p", { class: "font-bold text-on-surface" }, "Committed Objectives"),
      el("p", { class: "text-body-sm text-on-surface-variant mt-1" }, o.note),
    ]),
  ]));
  wrap.appendChild(grid);
  return wrap;
}
function progressBar(pct, status) {
  const rag = status === "green" ? "green" : status === "amber" ? "amber" : "red";
  return el("div", { class: "w-full h-2 rounded-full bg-surface-container-low mt-3 overflow-hidden" }, [
    el("div", { class: "h-full rounded-full " + ragBg(rag), style: `width:${Math.min(100, pct)}%` }),
  ]);
}

function overallRecoList(proj) {
  const wrap = el("div", {});
  wrap.appendChild(el("h3", { class: "font-headline-sm text-headline-sm text-on-surface px-1 mb-3" }, "Overall Recommendations"));
  const list = el("div", { class: "space-y-3" });
  proj.overallRecommendations.forEach((rec, i) => {
    list.appendChild(el("div", { class: "glass-card p-4 flex gap-4 items-start" }, [
      el("div", { class: "bg-primary/10 text-primary w-7 h-7 rounded-full flex items-center justify-center font-bold text-body-sm shrink-0 font-data-mono" }, i + 1),
      el("p", { class: "text-on-surface text-body-md" }, rec),
    ]));
  });
  wrap.appendChild(list);
  return wrap;
}

/* ---- 8 dimension cards -------------------------------------------------- */
function dimensionGrid(proj) {
  const wrap = el("div", {});
  wrap.appendChild(el("h3", { class: "font-headline-sm text-headline-sm text-on-surface px-1 mb-3" }, "The 8 Delivery Dimensions"));
  const grid = el("div", { class: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter" });
  P.dimensions.forEach((d) => {
    const dim = proj.dimensions[d.key];
    const rag = ragOf(dim.score);
    const riskCount = (dim.risks || []).length;
    grid.appendChild(el("div", {
      class: "glass-card p-5 is-hoverable clickable group flex flex-col",
      onclick: () => goDimension(proj.id, d.key),
    }, [
      el("div", { class: "flex justify-between items-start mb-3" }, [
        el("div", { class: "flex items-center gap-2" }, [
          el("span", { class: "material-symbols-outlined " + ragText(rag) }, DIM_ICON[d.key]),
          el("span", { class: "font-label-caps text-label-caps text-on-surface-variant uppercase" }, d.name),
        ]),
        sym("chevron_right", "text-on-surface-variant group-hover:text-primary"),
      ]),
      el("div", { class: "flex items-end gap-3 mb-3" }, [
        el("span", { class: "text-display-lg font-bold font-data-mono " + ragText(rag) }, dim.score + ""),
        el("div", { class: "flex-1 pb-2" }, trendMini(dim.trend, rag)),
      ]),
      el("p", { class: "text-body-sm text-on-surface-variant leading-relaxed flex-1" }, dim.reasoning),
      el("div", { class: "flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant" }, [
        riskCount
          ? el("span", { class: "text-body-sm " + ragText(rag) + " flex items-center gap-1" }, [sym("warning", "text-[16px]"), riskCount + " risk" + (riskCount > 1 ? "s" : "")])
          : el("span", { class: "text-body-sm text-rag-green flex items-center gap-1" }, [sym("check_circle", "text-[16px]"), "No open risks"]),
        el("span", { class: "text-body-sm text-on-surface-variant ml-auto" }, dim.recommendations.length + " rec" + (dim.recommendations.length > 1 ? "s" : "")),
      ]),
    ]));
  });
  wrap.appendChild(grid);
  return wrap;
}

/* ============================================================================
 * LEVEL 3 — DIMENSION DETAIL  (mirrors strategy_alignment_detail reference)
 * ==========================================================================*/
function renderDimension() {
  const proj = currentProject();
  const dimMeta = P.dimensions.find((d) => d.key === state.dimKey);
  const dim = proj.dimensions[state.dimKey];
  const rag = ragOf(dim.score);
  const frag = document.createDocumentFragment();
  frag.appendChild(breadcrumb());

  const grid = el("div", { class: "grid grid-cols-12 gap-gutter" });
  grid.appendChild(el("section", { class: "col-span-12 lg:col-span-8 flex flex-col gap-gutter" }, [
    dimHeader(dimMeta, dim, rag),
    dimReasoning(dim),
  ]));
  grid.appendChild(el("aside", { class: "col-span-12 lg:col-span-4" }, [dimCopilotPanel(dimMeta, dim, rag)]));
  grid.appendChild(el("section", { class: "col-span-12" }, [risksTable(dimMeta, dim)]));
  grid.appendChild(el("section", { class: "col-span-12 lg:col-span-7 flex flex-col gap-gutter" }, [impactBento(dim)]));
  grid.appendChild(el("section", { class: "col-span-12 lg:col-span-5" }, [dimRecommendations(dim)]));
  frag.appendChild(grid);
  $view.appendChild(frag);
}

function dimHeader(dimMeta, dim, rag) {
  return el("div", { class: "glass-card p-6 relative overflow-hidden" }, [
    el("div", { class: "flex items-center gap-2 mb-2" }, [
      el("span", { class: "material-symbols-outlined " + ragText(rag) }, DIM_ICON[dimMeta.key]),
      el("span", { class: "text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase" }, "Delivery Dimension"),
    ]),
    el("h2", { class: "font-display-lg text-display-lg text-on-surface mb-6" }, dimMeta.name),
    el("div", { class: "flex items-baseline gap-6" }, [
      el("div", {}, [
        el("p", { class: "text-on-surface-variant text-body-sm mb-1 uppercase font-bold tracking-tight" }, "Health Score"),
        el("p", { class: "text-display-lg font-bold " + ragText(rag) }, dim.score + ""),
        el("div", { class: "mt-1" }, trendDelta(dim.trend)),
      ]),
      el("div", { class: "h-16 w-[1px] bg-outline-variant" }),
      el("div", { class: "flex-1 min-w-0" }, [
        el("p", { class: "text-on-surface-variant text-body-sm mb-2 uppercase font-bold tracking-tight" }, "8-Week Trend"),
        lineChart(dim.trend, { color: RAG_HEX[rag], h: 120 }),
      ]),
    ]),
  ]);
}

function dimReasoning(dim) {
  return el("div", { class: "glass-card ai-glow p-6" }, [
    el("div", { class: "flex items-center gap-3 mb-4" }, [
      sym("auto_awesome", "text-tertiary", true),
      el("h3", { class: "font-headline-sm text-headline-sm text-on-surface" }, "Intelligence Narrative"),
    ]),
    el("p", { class: "text-on-surface leading-relaxed text-body-md" }, dim.reasoning),
  ]);
}

function dimCopilotPanel(dimMeta, dim, rag) {
  const delta = dim.trend[dim.trend.length - 1] - dim.trend[0];
  return el("div", { class: "bg-tertiary-container text-on-tertiary-container p-6 rounded-lg relative overflow-hidden flex flex-col justify-between h-full min-h-[360px]" }, [
    el("div", { class: "relative z-10" }, [
      el("div", { class: "flex items-center gap-2 mb-6" }, [
        sym("psychology", "", true),
        el("span", { class: "font-label-caps text-label-caps uppercase tracking-widest" }, "Copilot's Top Recommendation"),
      ]),
      el("h4", { class: "font-headline-md text-headline-md mb-4 leading-tight" }, dim.recommendations[0]),
      el("div", { class: "space-y-3" }, [
        infoChip("insights", dimMeta.name + " health: " + dim.score + " (" + ragLabel(rag) + ")"),
        infoChip("flag", (dim.risks || []).length + " specific risk" + ((dim.risks || []).length === 1 ? "" : "s") + " flagged"),
        infoChip("trending_" + (delta >= 0 ? "up" : "down"), "Trend " + (delta > 0 ? "+" : "") + delta + " over 8 wks"),
      ]),
    ]),
    el("div", { class: "absolute -bottom-12 -right-12 opacity-30 pointer-events-none" },
      el("span", { class: "material-symbols-outlined text-[240px]", style: "font-variation-settings:'wght' 100;" }, "monitoring")),
  ]);
}

function risksTable(dimMeta, dim) {
  const card = el("div", { class: "glass-card overflow-hidden" });
  card.appendChild(el("div", { class: "px-6 py-4 border-b border-outline-variant flex justify-between items-center" }, [
    el("h3", { class: "font-headline-sm text-headline-sm text-on-surface" }, "Specific Risks: " + dimMeta.name),
    el("span", { class: "text-body-sm text-on-surface-variant" }, (dim.risks || []).length + " logged"),
  ]));

  if (!dim.risks || dim.risks.length === 0) {
    card.appendChild(el("div", { class: "px-6 py-10 flex flex-col items-center gap-2 text-center" }, [
      sym("verified", "text-rag-green text-[40px]", true),
      el("p", { class: "text-on-surface font-bold" }, "No open risks on this dimension"),
      el("p", { class: "text-body-sm text-on-surface-variant" }, "The Copilot is not flagging any active threats here — maintain current practice."),
    ]));
    return card;
  }

  const table = el("table", { class: "w-full text-left border-collapse" });
  table.appendChild(el("thead", {}, el("tr", { class: "bg-surface-container-low" },
    ["Risk", "Impact", "Severity", "Consequence"].map((h) =>
      el("th", { class: "px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase" }, h)))));
  const tbody = el("tbody", { class: "divide-y divide-outline-variant" });
  dim.risks.forEach((r) => {
    const sev = SEV_META[r.severity];
    tbody.appendChild(el("tr", { class: "hover:bg-surface-variant/30 transition-colors align-top" }, [
      el("td", { class: "px-6 py-4" }, [
        el("div", { class: "flex items-start gap-3" }, [
          el("div", { class: "w-2 h-10 rounded-full shrink-0 " + sev.bar }),
          el("div", {}, [
            el("p", { class: "font-bold text-on-surface" }, r.title),
            el("p", { class: "text-body-sm text-on-surface-variant mt-0.5 max-w-md" }, r.detail),
          ]),
        ]),
      ]),
      el("td", { class: "px-6 py-4" }, [
        el("span", { class: "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-surface-variant text-on-surface whitespace-nowrap" }, [
          sym(IMPACT_ICON[r.impact], "text-[14px]"), IMPACT[r.impact].label,
        ]),
      ]),
      el("td", { class: "px-6 py-4" }, [
        el("div", { class: "px-2 py-1 rounded-full text-center font-bold text-[10px] w-fit " + sev.chip }, sev.label),
        el("div", { class: "flex gap-1 mt-2" }, [0, 1, 2, 3].map((i) =>
          el("div", { class: "w-4 h-1.5 rounded-full " + (i < sev.dots ? sev.dot : "bg-outline-variant") }))),
      ]),
      el("td", { class: "px-6 py-4" }, [
        el("p", { class: "text-body-sm text-on-surface max-w-sm" }, r.consequence),
      ]),
    ]));
  });
  table.appendChild(tbody);
  card.appendChild(el("div", { class: "overflow-x-auto" }, table));
  return card;
}

/* ---- impact analysis bento --------------------------------------------- */
function impactBento(dim) {
  const counts = { budget: 0, timeline: 0, objectives: 0 };
  let worst = null;
  (dim.risks || []).forEach((r) => {
    counts[r.impact] = (counts[r.impact] || 0) + 1;
    if (!worst || SEV_META[r.severity].dots > SEV_META[worst.severity].dots) worst = r;
  });
  const wrap = el("div", {});
  wrap.appendChild(el("h3", { class: "font-headline-sm text-headline-sm text-on-surface px-1 mb-1" }, "Impact Analysis"));
  wrap.appendChild(el("p", { class: "text-body-sm text-on-surface-variant px-1 mb-3" },
    "What the risks on this dimension threaten — budget, timeline or objectives."));
  const grid = el("div", { class: "grid grid-cols-2 gap-4" });
  grid.appendChild(impactTile("Budget", counts.budget, "payments", "text-rag-red", "risks threaten cost"));
  grid.appendChild(impactTile("Timeline", counts.timeline, "schedule", "text-rag-amber", "risks threaten dates"));
  grid.appendChild(el("div", { class: "glass-card p-5 col-span-2 flex items-center gap-6" }, [
    el("div", {
      class: "w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-headline-sm font-data-mono shrink-0 " +
        (counts.objectives ? "border-rag-amber text-rag-amber" : "border-rag-green text-rag-green"),
    }, counts.objectives + ""),
    el("div", {}, [
      el("p", { class: "font-bold text-on-surface" }, "Objective Integrity"),
      el("p", { class: "text-body-sm text-on-surface-variant mt-1" },
        worst ? "Highest-severity threat: " + worst.title + "." : "No objective-level threats flagged on this dimension."),
    ]),
  ]));
  wrap.appendChild(grid);
  return wrap;
}
function impactTile(label, n, icon, iconCls, sub) {
  return el("div", { class: "glass-card p-4 col-span-1" }, [
    el("div", { class: "flex justify-between items-start mb-3" }, [
      el("span", { class: "font-label-caps text-label-caps text-on-surface-variant uppercase" }, label),
      el("span", { class: "material-symbols-outlined " + iconCls }, icon),
    ]),
    el("p", { class: "text-display-lg font-bold text-on-surface" }, n + ""),
    el("p", { class: "text-body-sm text-on-surface-variant mt-1" }, sub),
  ]);
}

function dimRecommendations(dim) {
  const wrap = el("div", {});
  wrap.appendChild(el("h3", { class: "font-headline-sm text-headline-sm text-on-surface px-1 mb-3" }, "Principal Recommendations"));
  const list = el("div", { class: "space-y-3" });
  const icons = ["sync", "visibility", "flag", "task_alt", "bolt"];
  dim.recommendations.forEach((rec, i) => {
    list.appendChild(el("div", { class: "glass-card p-4 is-hoverable hover:border-primary group" }, [
      el("div", { class: "flex gap-4" }, [
        el("div", { class: "bg-primary/10 text-primary p-2 rounded h-fit" }, sym(icons[i % icons.length])),
        el("div", { class: "flex-1" }, [
          el("p", { class: "font-bold text-on-surface group-hover:text-primary transition-colors" }, rec),
        ]),
      ]),
    ]));
  });
  wrap.appendChild(list);
  return wrap;
}

/* ============================================================================
 * Copilot standing banner (shared)
 * ==========================================================================*/
function copilotBanner(html) {
  return el("div", { class: "glass-card ai-glow p-4 mb-gutter flex items-center gap-4" }, [
    el("div", { class: "w-10 h-10 rounded-full bg-tertiary-container/30 flex items-center justify-center shrink-0" },
      sym("smart_toy", "text-tertiary", true)),
    el("div", { class: "flex-1", html: `<span class="font-label-caps text-label-caps uppercase tracking-widest text-tertiary block mb-1">Copilot Insight</span><span class="text-on-surface text-body-md leading-relaxed">${html}</span>` }),
  ]);
}

/* ============================================================================
 * MASTER RENDER + motion
 * ==========================================================================*/
function render() {
  renderChrome();
  $view.innerHTML = "";
  if (state.level === "portfolio") renderPortfolio();
  else if (state.level === "project") renderProject();
  else renderDimension();
  window.scrollTo({ top: 0, behavior: "smooth" });
  animateIn();
}

function animateIn() {
  if (typeof gsap === "undefined") return; // degrade gracefully offline
  gsap.fromTo(
    $view.querySelectorAll(".glass-card"),
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: "power2.out", overwrite: true }
  );
}

/* ============================================================================
 * Role switch wiring
 * ==========================================================================*/
function setupRoleSwitch() {
  const btns = document.querySelectorAll(".role-btn");
  const picker = document.getElementById("pmPicker");

  picker.innerHTML = "";
  P.projects.forEach((p) => {
    picker.appendChild(el("option", { value: p.id }, p.pm + " · " + p.code));
  });
  picker.value = state.pmProjectId;

  btns.forEach((b) => {
    b.addEventListener("click", () => {
      const role = b.dataset.role;
      state.role = role;
      btns.forEach((x) => x.classList.toggle("is-active", x === b));
      picker.hidden = role !== "pm";
      if (role === "pm") {
        state.pmProjectId = picker.value;
        goProject(state.pmProjectId);
      } else {
        goPortfolio();
      }
    });
  });

  picker.addEventListener("change", () => {
    state.pmProjectId = picker.value;
    goProject(picker.value);
  });
}

/* ---- boot ---------------------------------------------------------------- */
setupRoleSwitch();
render();
