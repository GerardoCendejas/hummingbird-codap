/* Hummingbird detective: a CODAP plugin that checks off steps
 * as students build a graph of feeder abundance vs. beak pointiness.
 * All text comes from window.ACTIVITY_LANG (see lang/en.js).
 */
(function () {
  "use strict";

  const L = window.ACTIVITY_LANG;
  const params = new URLSearchParams(location.search);
  const PREVIEW = params.has("preview");   // ?preview : click-through without CODAP
  const DEBUG = params.has("debug");       // ?debug   : show what the plugin detects
  const inCodap = window.parent !== window;

  // Step order. `kind: "choice"` steps are answered by clicking;
  // `kind: "auto"` steps are detected by reading CODAP's state.
  // Choice steps with an `answer` must be answered correctly to continue.
  const STEPS = [
    { id: "graph",    mission: 1, kind: "auto" },
    { id: "sexaxis",  mission: 1, kind: "auto" },
    { id: "dot",      mission: 1, kind: "choice", answer: "bird" },
    { id: "showcount", mission: 1, kind: "auto" },
    { id: "count",    mission: 1, kind: "choice", answer: "male" },
    { id: "yearaxis", mission: 2, kind: "auto" },
    { id: "feedaxis", mission: 2, kind: "auto" },
    { id: "yearline", mission: 2, kind: "auto" },
    { id: "trend",    mission: 2, kind: "choice", answer: "up" },
    { id: "predict",  mission: 3, kind: "choice" },
    { id: "xaxis",    mission: 3, kind: "auto" },
    { id: "yaxis",    mission: 3, kind: "auto" },
    { id: "line",     mission: 3, kind: "auto" },
    { id: "compare",  mission: 3, kind: "choice", answer: "up" },
    { id: "map",      mission: 3, kind: "auto", bonus: true }
  ];
  const MAIN = STEPS.filter(s => !s.bonus);

  const state = {
    started: false,
    done: new Set(),
    open: new Set(),  // done steps the student expanded to reread
    answers: {},    // step id -> last choice clicked
    wrong: {},      // step id -> last choice was wrong
    swapped: false,
    detected: {}
  };

  /* ---------- CODAP connection ---------- */

  let phone = null;
  function call(message) {
    return new Promise(resolve => {
      if (!phone) return resolve(null);
      phone.call(message, reply => resolve(reply || null));
    });
  }

  function connect() {
    phone = new window.iframePhone.IframePhoneRpcEndpoint(
      function onNotification(_msg, reply) {
        reply({ success: true });
        scheduleCheck(150);   // something changed in CODAP: check soon
      },
      "data-interactive",
      window.parent
    );
    call({
      action: "update",
      resource: "interactiveFrame",
      values: {
        name: "hummingbird-detective",
        title: L.frameTitle,
        version: "1.0",
        dimensions: { width: 360, height: 620 }
      }
    });
  }

  const norm = s => (s || "").toString().toLowerCase().replace(/[\s_]+/g, " ").trim();
  const FEED = norm(L.attributes.feeders);
  const BEAK = norm(L.attributes.beak);
  const SEX = norm(L.attributes.sex);
  const YEAR = norm(L.attributes.year);

  async function readCodap() {
    const found = { graph: false, sexaxis: false, showcount: false, yearaxis: false, feedaxis: false,
      yearline: false, xaxis: false, yaxis: false, line: false, map: false, swapped: false };
    const list = await call({ action: "get", resource: "componentList" });
    if (!list || !list.success) return found;

    const comps = list.values || [];
    found.map = comps.some(c => c.type === "map");

    for (const c of comps.filter(c => c.type === "graph")) {
      found.graph = true;
      const g = await call({ action: "get", resource: `component[${c.id}]` });
      if (!g || !g.success) continue;
      const x = norm(g.values.xAttributeName);
      const y = norm(g.values.yAttributeName);

      const ad = await call({ action: "get", resource: `component[${c.id}].adornmentList` });
      const has = type => !!(ad && ad.success && (ad.values || []).some(a => a.type === type && a.isVisible));

      if (x === SEX || y === SEX) {
        found.sexaxis = true;
        if (has("Count")) found.showcount = true;
      }
      if (x === YEAR) found.yearaxis = true;
      if (x === YEAR && y === FEED) {
        found.feedaxis = true;
        if (has("LSRL")) found.yearline = true;
      }
      if (x === BEAK && y === FEED) found.swapped = true;
      if (x === FEED) found.xaxis = true;
      if (x === FEED && y === BEAK) {
        found.yaxis = true;
        if (has("LSRL")) found.line = true;
      }
    }
    return found;
  }

  let checking = false, timer = null;
  function scheduleCheck(ms) {
    clearTimeout(timer);
    timer = setTimeout(check, ms);
  }

  async function check() {
    if (checking) return;
    checking = true;
    try {
      const found = await readCodap();
      state.detected = found;
      state.swapped = found.swapped && !found.xaxis;
      applyDetected(found);
    } finally {
      checking = false;
      scheduleCheck(1200);   // steady polling as a safety net
    }
  }

  /* ---------- Progress logic ---------- */

  // The current step is the first main step not done; after that, the bonus.
  function currentStep() {
    return STEPS.find(s => !state.done.has(s.id)) || null;
  }

  // Steps complete in order: an auto step only counts once it is reached,
  // and once done it stays done (less frustrating for kids).
  function applyDetected(found) {
    let changed = false;
    let step = currentStep();
    while (step && step.kind === "auto" && found[step.id]) {
      state.done.add(step.id);
      changed = true;
      step = currentStep();
    }
    render(changed);
  }

  // A finished auto step in the current mission that CODAP no longer shows
  // (e.g. an axis got moved). We keep it done but show the instructions again.
  function isBroken(step) {
    const cur = currentStep();
    return inCodap && !PREVIEW && !!cur && !cur.bonus && step.kind === "auto" &&
      step.mission === cur.mission && state.done.has(step.id) && !state.detected[step.id];
  }

  function choose(stepId, value) {
    const step = STEPS.find(s => s.id === stepId);
    state.answers[stepId] = value;
    state.wrong[stepId] = step.answer != null && value !== step.answer;
    if (!state.wrong[stepId]) state.done.add(stepId);
    render(true);
    if (inCodap) scheduleCheck(50);
  }

  /* ---------- Rendering ---------- */

  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null) continue;
      if (k === "class") n.className = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const kid of kids) if (kid != null) n.append(kid);
    return n;
  };

  const svg = markup => {
    const t = document.createElement("template");
    t.innerHTML = markup.trim();
    return t.content.firstChild;
  };

  // Two hummingbird heads that explain what "pointiness" means.
  function beakKey() {
    const head = (beak, label) => el("figure", { class: "beak" },
      svg(`<svg viewBox="0 0 120 60" aria-hidden="true">
        <circle cx="34" cy="30" r="17" fill="var(--emerald)"/>
        <path d="M22 38 q12 12 26 0 z" fill="var(--rose)"/>
        <circle cx="40" cy="25" r="3" fill="var(--ink)"/>
        ${beak}
      </svg>`),
      el("figcaption", {}, label));
    return el("div", { class: "beak-key" },
      head(`<path d="M49 21 L80 30 L49 39 z" fill="var(--ink)"/>`, L.beakBlunt),
      head(`<path d="M50 28 L116 30 L50 32 z" fill="var(--ink)"/>`, L.beakPointy));
  }

  const BIRD = `<svg viewBox="0 0 40 40" aria-hidden="true">
    <path d="M9 24 q6 -12 18 -9 q-4 7 -12 12 z" fill="var(--emerald)"/>
    <path d="M14 15 q-2 -10 8 -12 q-1 8 -4 13 z" fill="var(--emerald-light)"/>
    <circle cx="28" cy="15" r="4.5" fill="var(--emerald)"/>
    <path d="M25 18 q3 3 6 0 z" fill="var(--rose)"/>
    <path d="M32 14 L40 15 L32 16 z" fill="var(--ink)"/>
    <path d="M9 24 l-6 5 l7 -2 z" fill="var(--emerald)"/>
  </svg>`;

  function stepBody(step) {
    const t = L.steps[step.id];
    const body = el("div", { class: "step-body" }, el("p", {}, t.body));

    if (step.id === "xaxis" && state.swapped) {
      body.append(el("p", { class: "hint" }, t.swapped));
    }

    if (step.kind === "choice") {
      const group = el("div", { class: "choices", role: "group", "aria-label": t.title });
      for (const [value, label] of Object.entries(t.choices)) {
        const picked = step.answer != null && state.answers[step.id] === value;
        group.append(el("button", {
          type: "button",
          class: "choice" + (picked ? " picked" : ""),
          onclick: () => choose(step.id, value)
        }, label));
      }
      body.append(group);
      if (state.wrong[step.id]) {
        body.append(el("p", { class: "hint" }, t.wrong));
      }
    }

    if (PREVIEW && step.kind === "auto") {
      body.append(el("button", {
        type: "button", class: "preview-btn",
        onclick: () => { state.done.add(step.id); render(true); }
      }, "Preview: mark done"));
    }
    return body;
  }

  function doneNote(step) {
    const t = L.steps[step.id];
    if (step.id === "compare") {
      const matched = state.answers.predict === "pointy";
      return el("div", { class: "step-note" },
        el("p", {}, t.correct),
        el("p", {}, matched ? t.matched : t.notMatched));
    }
    if (step.answer != null) return el("p", { class: "step-note" }, t.correct);
    return el("p", { class: "step-note" }, t.done);
  }

  function storyScreen(app) {
    const S = L.story;
    app.append(el("header", { class: "top" }, el("h1", {}, L.title)),
      el("section", { class: "story" },
        el("h2", {}, S.title),
        el("div", { class: "embed" },
          el("iframe", { src: "https://macaulaylibrary.org/asset/45345081/embed",
            title: S.videoTitle, frameborder: "0", allowfullscreen: "" })),
        ...S.paragraphs.map(p => el("p", {}, p)),
        inCodap || PREVIEW
          ? el("button", { type: "button", class: "start-btn",
              onclick: () => { state.started = true; render(true); } }, S.start)
          : el("p", { class: "notice" }, L.notInCodap)));
  }

  function render(announce) {
    const app = document.getElementById("app");
    const current = currentStep();
    const mainDone = MAIN.filter(s => state.done.has(s.id)).length;

    app.replaceChildren();
    if (!state.started) return storyScreen(app);

    app.append(el("header", { class: "top" },
      el("h1", {}, L.title),
      el("p", { class: "intro" }, L.intro),
      beakKey()));

    if (!inCodap && !PREVIEW) {
      app.append(el("p", { class: "notice" }, L.notInCodap));
      return;
    }

    app.append(el("div", { class: "progress" },
      el("div", { class: "bar", role: "progressbar",
        "aria-valuemin": "0", "aria-valuemax": String(MAIN.length), "aria-valuenow": String(mainDone) },
        el("span", { style: `width:${(mainDone / MAIN.length) * 100}%` })),
      el("p", {}, L.progress(mainDone, MAIN.length))));

    const list = el("ol", { class: "steps" });
    let mission = null;
    STEPS.forEach((step, i) => {
      const isDone = state.done.has(step.id);
      const isCurrent = current && current.id === step.id;
      // Hide the bonus until the main activity is finished.
      if (step.bonus && mainDone < MAIN.length) return;
      // Hide missions that haven't started yet.
      if (current && step.mission > current.mission) return;

      if (step.mission !== mission) {
        mission = step.mission;
        list.append(el("li", { class: "mission" }, el("h2", {}, L.missions[mission])));
      }

      const marker = el("span", { class: "marker" });
      if (isCurrent) marker.append(svg(BIRD));
      else if (isDone) marker.append(svg(`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10.5 l3.5 3.5 l7 -8" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`));
      else marker.textContent = String(i + 1);

      const broken = isBroken(step);
      const title = el("h2", {}, step.bonus ? `${L.bonus}: ${L.steps[step.id].title}` : L.steps[step.id].title);
      let main;
      if (isDone) {
        // Finished steps fold away but can be reopened to reread the instructions.
        const details = el("details", {
          open: broken || state.open.has(step.id) ? "" : null,
          ontoggle: e => { if (!broken) e.target.open ? state.open.add(step.id) : state.open.delete(step.id); }
        },
          el("summary", {}, title),
          broken ? el("p", { class: "hint" }, L.broken) : null,
          el("p", { class: "reread" }, L.steps[step.id].body));
        main = el("div", { class: "step-main" }, details, doneNote(step));
      } else {
        main = el("div", { class: "step-main" }, title, isCurrent ? stepBody(step) : null);
      }

      const li = el("li", {
        class: "step" + (isDone ? " done" : "") + (isCurrent ? " current" : "") + (step.bonus ? " bonus" : "") + (broken ? " broken" : ""),
        "aria-current": isCurrent ? "step" : null
      }, marker, main);
      list.append(li);

      if (step.id === "compare" && isDone) {
        list.append(el("li", { class: "finish" },
          el("h2", {}, L.finish.title),
          el("p", {}, L.finish.body)));
      }
    });
    app.append(list);

    if (DEBUG) {
      app.append(el("pre", { class: "debug" },
        JSON.stringify({ looking_for: { x: FEED, y: BEAK }, detected: state.detected }, null, 2)));
    }

    if (announce) {
      const cur = app.querySelector(".step.current");
      if (cur) cur.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }

  /* ---------- Start ---------- */

  document.documentElement.lang = L.code;
  render(false);
  if (inCodap && window.iframePhone) {
    connect();
    scheduleCheck(300);
  }
})();
