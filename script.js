// ────────────────────────────────────────────────
// DATA DEFINITIONS
// ────────────────────────────────────────────────
const species = [
  { name: "Bifidobacterium adolescentis", color: "#58a6ff" },
  { name: "Agathobacter sp.", color: "#3fb950" },
  { name: "Coprobacillus cateniformis", color: "#79c0ff" },
  { name: "Agathobaculum butyriciproducens", color: "#a371f7" },
  { name: "Faecalibacterium longum", color: "#f0883e" },
  { name: "Bilophila wadsworthia", color: "#f85149" },
  { name: "Ruminococcus gnavus", color: "#ffa657" },
  { name: "Bacteroides vulgatus", color: "#d18616" }
];

const originalBaselines = [
  [22, 18, 12, 15, 20, 4, 6, 3],
  [18, 14, 10, 12, 17, 6, 12, 5],
  [32, 16, 11, 14, 18, 3, 4, 2]
];

const foodEffects = {
  redmeat: [-2, -3, -1, -4, -5, 4, 2, 3],
  fried: [-3, -2, -2, -3, -4, 3, 4, 2],
  soda: [-4, -3, -1, -2, -3, 2, 1, 1],
  emulsifier: [-5, -4, -6, -3, -4, 5, 6, 2],
  alcohol: [-6, -2, -1, -2, -3, 3, 1, 1],
  dairy: [-5, -1, 0, -1, -2, 1, 1, 0],
  fiber: [6, 5, 4, 7, 8, -3, -4, -2],
  berries: [4, 3, 2, 4, 5, -2, -2, -1],
  olive: [3, 2, 2, 3, 4, -2, -1, -1],
  fermented: [7, 3, 3, 4, 6, -2, -2, -1]
};

// ────────────────────────────────────────────────
// STATE
// ────────────────────────────────────────────────
let chart = null;
let currentAbundances = null;
let cumulativeDays = 0;
let allTimePoints = [];
let allSeries = species.map(() => []);
let currentView = 'line';

// ────────────────────────────────────────────────
// ALPHA-DIVERSITY METRICS
// ────────────────────────────────────────────────
function shannonIndex(abundances) {
  let h = 0;
  const total = abundances.reduce((a, b) => a + b, 0) || 1;
  for (const val of abundances) {
    const p = val / total;
    if (p > 0) h -= p * Math.log(p);
  }
  return h;
}

function simpsonIndex(abundances) {
  let sumPSq = 0;
  const total = abundances.reduce((a, b) => a + b, 0) || 1;
  for (const val of abundances) {
    const p = val / total;
    sumPSq += p * p;
  }
  return 1 - sumPSq;
}

function computeDiversitySeries() {
  const shannon = [];
  const simpson = [];
  for (let t = 0; t < allTimePoints.length; t++) {
    const abund = species.map((_, i) => allSeries[i][t] ?? 0);
    shannon.push(shannonIndex(abund));
    simpson.push(simpsonIndex(abund));
  }
  return { shannon, simpson };
}

// ────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────
function getStartingAbundances() {
  if (currentAbundances !== null) return [...currentAbundances];
  const baseIdx = parseInt(document.getElementById("baseline").value);
  return [...originalBaselines[baseIdx]];
}

function updateUI() {
  const appendBtn = document.getElementById("appendBtn");
  const statusEl = document.getElementById("status");

  if (appendBtn) {
    appendBtn.style.display = currentAbundances !== null ? "inline-block" : "none";
  }

  if (statusEl) {
    statusEl.textContent = currentAbundances !== null
      ? `Phase end: day ${cumulativeDays} — ready to append`
      : "Select baseline & dietary factors, then run first phase";
  }
}

// ────────────────────────────────────────────────
// VIEW SWITCHING
// ────────────────────────────────────────────────
function switchView(view) {
  currentView = view;
  document.querySelectorAll('.view-tabs button').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(
      view === 'line' ? 'line' : view === 'stacked' ? 'stacked' : 'diversity'
    ));
  });

  const divSummary = document.getElementById('diversity-summary');
  divSummary.style.display = view === 'diversity' ? 'flex' : 'none';

  renderChart();
}

// ────────────────────────────────────────────────
// CHART RENDERING
// ────────────────────────────────────────────────
function renderChart() {
  if (chart) chart.destroy();
  chart = null;

  const ctx = document.getElementById("chart")?.getContext("2d");
  if (!ctx || !allTimePoints.length) return;

  if (currentView === 'line') {
    renderLineChart(ctx);
  } else if (currentView === 'stacked') {
    renderStackedChart(ctx);
  } else {
    renderDiversityChart(ctx);
  }
}

function renderLineChart(ctx) {
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allTimePoints,
      datasets: species.map((sp, i) => ({
        label: sp.name,
        data: allSeries[i],
        borderColor: sp.color,
        backgroundColor: sp.color + '22',
        tension: 0.25,
        fill: false,
        pointRadius: 0,
        pointHitRadius: 10,
        borderWidth: 2.2
      }))
    },
    options: chartOptions("Relative Abundance (%)", 0, 100)
  });
}

function renderStackedChart(ctx) {
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allTimePoints,
      datasets: species.map((sp, i) => ({
        label: sp.name,
        data: allSeries[i],
        borderColor: sp.color,
        backgroundColor: sp.color + 'aa',
        tension: 0.25,
        fill: true,
        pointRadius: 0,
        pointHitRadius: 10,
        borderWidth: 1
      }))
    },
    options: {
      ...chartOptions("Cumulative Abundance (%)", 0, 100),
      scales: {
        ...chartOptions("Cumulative Abundance (%)", 0, 100).scales,
        y: {
          ...chartOptions("Cumulative Abundance (%)", 0, 100).scales.y,
          stacked: true
        }
      }
    }
  });
}

function renderDiversityChart(ctx) {
  const { shannon, simpson } = computeDiversitySeries();

  // Update summary cards with latest values
  const lastShannon = shannon[shannon.length - 1];
  const lastSimpson = simpson[simpson.length - 1];
  const shannonEl = document.getElementById('shannon-val');
  const simpsonEl = document.getElementById('simpson-val');
  if (shannonEl) shannonEl.textContent = lastShannon.toFixed(3);
  if (simpsonEl) simpsonEl.textContent = lastSimpson.toFixed(3);

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allTimePoints,
      datasets: [
        {
          label: "Shannon (H')",
          data: shannon,
          borderColor: '#d2a8ff',
          backgroundColor: '#d2a8ff22',
          tension: 0.3,
          fill: true,
          pointRadius: 0,
          pointHitRadius: 10,
          borderWidth: 2.5,
          yAxisID: 'yShannon'
        },
        {
          label: "Simpson (1-D)",
          data: simpson,
          borderColor: '#7ee787',
          backgroundColor: '#7ee78722',
          tension: 0.3,
          fill: true,
          pointRadius: 0,
          pointHitRadius: 10,
          borderWidth: 2.5,
          yAxisID: 'ySimpson'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: "Cumulative Days", color: '#c9d1d9' },
          grid: { color: "#30363d" },
          ticks: { color: '#8b949e' }
        },
        yShannon: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: "Shannon (H')", color: '#d2a8ff' },
          grid: { color: "#30363d" },
          ticks: { color: '#d2a8ff' },
          min: 0
        },
        ySimpson: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: "Simpson (1-D)", color: '#7ee787' },
          grid: { drawOnChartArea: false },
          ticks: { color: '#7ee787' },
          min: 0,
          max: 1
        }
      },
      plugins: {
        legend: {
          position: "top",
          labels: { color: '#c9d1d9', boxWidth: 14, padding: 16, font: { size: 13 } }
        },
        tooltip: { enabled: false }
      },
      interaction: { mode: 'index', intersect: false }
    }
  });
}

function chartOptions(yLabel, yMin, yMax) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: "Cumulative Days", color: '#c9d1d9' },
        grid: { color: "#30363d" },
        ticks: { color: '#8b949e' }
      },
      y: {
        title: { display: true, text: yLabel, color: '#c9d1d9' },
        min: yMin,
        max: yMax,
        grid: { color: "#30363d" },
        ticks: { color: '#8b949e' }
      }
    },
    plugins: {
      legend: {
        position: "top",
        labels: { color: '#c9d1d9', boxWidth: 14, padding: 16, font: { size: 13 } }
      },
      tooltip: { enabled: false }
    },
    interaction: { mode: 'index', intersect: false },
    hover: { mode: 'nearest', intersect: false }
  };
}

// ────────────────────────────────────────────────
// SIMULATION
// ────────────────────────────────────────────────
function runPhase(isAppend) {
  let abundances = getStartingAbundances();
  const selectedFoods = Array.from(document.getElementById("foods").selectedOptions || []).map(o => o.value);
  const phaseDays = parseInt(document.getElementById("days").value) || 180;

  const phaseTimePoints = [];
  const phaseSeries = species.map(() => []);

  let dayOffset = isAppend ? cumulativeDays : 0;

  phaseTimePoints.push(dayOffset);
  abundances.forEach((val, i) => phaseSeries[i].push(val));

  for (let day = 7; day <= phaseDays; day += 7) {
    let dailyDelta = new Array(species.length).fill(0);
    selectedFoods.forEach(f => {
      if (foodEffects[f]) {
        foodEffects[f].forEach((d, i) => dailyDelta[i] += d);
      }
    });

    for (let i = 0; i < abundances.length; i++) {
      abundances[i] += dailyDelta[i] * 7 * 0.01;
      abundances[i] *= (0.995 + Math.random() * 0.01);
      if (abundances[i] < 0) abundances[i] = 0;
    }

    const total = abundances.reduce((a, b) => a + b, 0) || 1;
    abundances = abundances.map(v => (v / total) * 100);

    phaseTimePoints.push(dayOffset + day);
    abundances.forEach((val, i) => phaseSeries[i].push(val));
  }

  if (!isAppend) {
    allTimePoints = [];
    allSeries = species.map(() => []);
    cumulativeDays = 0;
  }

  allTimePoints.push(...phaseTimePoints.slice(1));
  allSeries.forEach((s, i) => s.push(...phaseSeries[i].slice(1)));

  cumulativeDays += phaseDays;
  currentAbundances = abundances;

  renderChart();

  const daysValueEl = document.getElementById("daysValue");
  if (daysValueEl) daysValueEl.textContent = phaseDays + " days";

  updateUI();
}

function resetAll() {
  if (chart) chart.destroy();
  chart = null;

  const baselineEl = document.getElementById("baseline");
  const foodsEl = document.getElementById("foods");
  const daysEl = document.getElementById("days");
  const daysValueEl = document.getElementById("daysValue");

  if (baselineEl) baselineEl.selectedIndex = 0;
  if (foodsEl) foodsEl.selectedIndex = -1;
  if (daysEl) daysEl.value = 180;
  if (daysValueEl) daysValueEl.textContent = "180 days";

  currentAbundances = null;
  cumulativeDays = 0;
  allTimePoints = [];
  allSeries = species.map(() => []);

  document.getElementById('shannon-val').textContent = '\u2014';
  document.getElementById('simpson-val').textContent = '\u2014';

  updateUI();
}

// ────────────────────────────────────────────────
// CONTROLS COLLAPSE
// ────────────────────────────────────────────────
function toggleControls() {
  const controls = document.getElementById('controls');
  const toggle = document.getElementById('controls-toggle');
  const collapsed = controls.classList.toggle('collapsed');
  toggle.title = collapsed ? 'Expand controls' : 'Collapse controls';

  // Resize chart after the CSS transition finishes
  controls.addEventListener('transitionend', function handler() {
    controls.removeEventListener('transitionend', handler);
    if (chart) chart.resize();
  });
}

// ────────────────────────────────────────────────
// INITIALIZATION
// ────────────────────────────────────────────────
function init() {
  updateUI();

  const daysSlider = document.getElementById("days");
  if (daysSlider) {
    daysSlider.addEventListener("input", e => {
      const valEl = document.getElementById("daysValue");
      if (valEl) valEl.textContent = e.target.value + " days";
    });
  }

  const canvas = document.getElementById("chart");
  const hoverInfo = document.getElementById("hover-info");

  canvas.addEventListener("mousemove", function (e) {
    if (!chart || !allTimePoints.length) { hoverInfo.style.display = 'none'; return; }

    const pts = chart.getElementsAtEventForMode(e, 'index', { intersect: false }, false);
    if (!pts.length) { hoverInfo.style.display = 'none'; return; }

    const idx = pts[0].index;
    const day = allTimePoints[idx];

    // Find the nearest dataset to highlight
    const nearest = chart.getElementsAtEventForMode(e, 'nearest', { intersect: false }, false);
    const nearestDatasetIndex = nearest.length ? nearest[0].datasetIndex : -1;

    const abund = species.map((_, i) => allSeries[i][idx] ?? 0);
    const h = shannonIndex(abund);
    const d = simpsonIndex(abund);

    let html = `<div class="hover-day">Day ${day}</div>`;

    if (currentView === 'diversity') {
      const labels = ["Shannon H'", "Simpson 1-D"];
      const colors = ['#d2a8ff', '#7ee787'];
      const vals = [h.toFixed(4), d.toFixed(4)];
      for (let i = 0; i < 2; i++) {
        const active = nearestDatasetIndex === i ? ' hover-active' : '';
        html += `<div class="hover-row${active}"><span class="hover-dot" style="background:${colors[i]}"></span>
          <span class="hover-name">${labels[i]}</span>
          <span class="hover-val">${vals[i]}</span></div>`;
      }
    } else {
      // Map species index to dataset index for highlight matching
      const rows = species
        .map((sp, i) => ({ name: sp.name, color: sp.color, value: allSeries[i][idx] ?? 0, dsIndex: i }))
        .sort((a, b) => b.value - a.value);
      rows.forEach(r => {
        const active = nearestDatasetIndex === r.dsIndex ? ' hover-active' : '';
        html += `<div class="hover-row${active}">
          <span class="hover-dot" style="background:${r.color}"></span>
          <span class="hover-name">${r.name}</span>
          <span class="hover-val">${r.value.toFixed(1)}%</span>
        </div>`;
      });
      html += `<div style="border-top:1px solid #30363d; margin-top:6px; padding-top:5px;">
        <div class="hover-row"><span class="hover-dot" style="background:#d2a8ff"></span>
          <span class="hover-name">Shannon H'</span>
          <span class="hover-val">${h.toFixed(3)}</span></div>
        <div class="hover-row"><span class="hover-dot" style="background:#7ee787"></span>
          <span class="hover-name">Simpson 1-D</span>
          <span class="hover-val">${d.toFixed(3)}</span></div>
      </div>`;
    }

    hoverInfo.innerHTML = html;
    hoverInfo.style.display = 'block';
  });

  canvas.addEventListener("mouseleave", function () {
    hoverInfo.style.display = 'none';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
