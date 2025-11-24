/* ==========================================================================
   Reports Module (Globentix CRM)
   - Predefined reports
   - Custom report builder
   - Visualizations with Chart.js (if available)
   - CSV/Excel( CSV ) export, print
   - No layout/design changes; only uses existing styles and action colors
   - Uses Font Awesome 6 icons for actions
   ========================================================================== */

window.ReportsModule = (function () {
  const el = {
    mount: () => document.getElementById('content'),
  };

  // Cached state
  const state = {
    activeReport: null,
    chart: null,
    lastData: [],
    lastColumns: [],
  };

  // Helpers (expecting global Storage, Utils, and Toast helpers if present)
  const $$ = (sel, root = document) => root.querySelector(sel);
  const $$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const fmtCurrency = (n) =>
    typeof n === 'number'
      ? (window.Utils?.formatCurrency?.(n) || `₹${n.toLocaleString()}`)
      : n;

  // Data access shims (fall back to empty arrays if Storage not present)
  const Data = {
    leads: () => (window.Storage?.getLeads?.() || []),
    deals: () => (window.Storage?.getDeals?.() || []),
    contacts: () => (window.Storage?.getContacts?.() || []),
    accounts: () => (window.Storage?.getAccounts?.() || []),
    tasks: () => (window.Storage?.getTasks?.() || []),
    team: () => (window.Storage?.getTeam?.() || []),
  };

  // Chart safe creation/cleanup
  function renderChart(canvas, type, data, options = {}) {
    if (!window.Chart) return; // Chart.js not loaded yet
    if (state.chart) state.chart.destroy();
    state.chart = new Chart(canvas.getContext('2d'), {
      type,
      data,
      options: Object.assign(
        {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
        },
        options
      ),
    });
  }

  // ---------- Predefined report generators ----------
  function leadConversionReport() {
    const leads = Data.leads();
    const byStage = ['New', 'Contacted', 'Qualified', 'Converted', 'Unqualified'].map((stage) => ({
      stage,
      count: leads.filter((l) => (l.stage || '').toLowerCase() === stage.toLowerCase()).length,
    }));
    state.lastColumns = ['Stage', 'Count'];
    state.lastData = byStage.map((r) => [r.stage, r.count]);

    return {
      title: 'Lead Conversion Report',
      chartType: 'bar',
      chartData: {
        labels: byStage.map((r) => r.stage),
        datasets: [
          {
            label: 'Leads',
            data: byStage.map((r) => r.count),
            backgroundColor: '#1E88E5',
          },
        ],
      },
      summary: `Total Leads: ${leads.length}`,
    };
  }

  function dealPipelineReport() {
    const deals = Data.deals();
    const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    const byStage = stages.map((s) => ({
      stage: s,
      count: deals.filter((d) => (d.stage || '').toLowerCase() === s.toLowerCase()).length,
      value: deals
        .filter((d) => (d.stage || '').toLowerCase() === s.toLowerCase())
        .reduce((sum, d) => sum + (Number(d.value) || 0), 0),
    }));
    state.lastColumns = ['Stage', 'Count', 'Total Value'];
    state.lastData = byStage.map((r) => [r.stage, r.count, r.value]);

    return {
      title: 'Deal Pipeline Report',
      chartType: 'bar',
      chartData: {
        labels: byStage.map((r) => r.stage),
        datasets: [
          { label: 'Deals', data: byStage.map((r) => r.count), backgroundColor: '#1565C0' },
          {
            label: 'Total Value',
            data: byStage.map((r) => r.value),
            yAxisID: 'y1',
            backgroundColor: '#10B981',
          },
        ],
      },
      chartOptions: {
        scales: {
          y: { beginAtZero: true },
          y1: { beginAtZero: true, position: 'right', ticks: { callback: (v) => fmtCurrency(v) } },
        },
      },
      summary: `Total Deals: ${deals.length} | Total Value: ${fmtCurrency(
        deals.reduce((s, d) => s + (Number(d.value) || 0), 0)
      )}`,
    };
  }

  function revenueForecastReport() {
    const deals = Data.deals();
    // naive monthly rollup by expectedCloseDate (YYYY-MM)
    const byMonth = {};
    deals.forEach((d) => {
      const dt = d.expectedCloseDate ? new Date(d.expectedCloseDate) : null;
      if (!dt || isNaN(dt)) return;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      const prob = Number(d.probability) || stageProbability(d.stage);
      const value = Number(d.value) || 0;
      byMonth[key] = (byMonth[key] || 0) + value * (prob / 100);
    });
    const labels = Object.keys(byMonth).sort();
    const data = labels.map((k) => Math.round(byMonth[k]));
    state.lastColumns = ['Month', 'Forecasted Revenue'];
    state.lastData = labels.map((m, i) => [m, data[i]]);

    return {
      title: 'Revenue Forecast',
      chartType: 'line',
      chartData: {
        labels,
        datasets: [
          {
            label: 'Forecast',
            data,
            borderColor: '#1E88E5',
            backgroundColor: 'rgba(30,136,229,0.15)',
            tension: 0.3,
            fill: true,
          },
        ],
      },
      chartOptions: {
        scales: { y: { ticks: { callback: (v) => fmtCurrency(v) } } },
      },
      summary: `Projected Total: ${fmtCurrency(data.reduce((s, n) => s + n, 0))}`,
    };
  }

  function salesByIndustryReport() {
    const deals = Data.deals();
    const accounts = Data.accounts();
    const industryMap = {};
    deals.forEach((d) => {
      const acct = accounts.find((a) => a.id === d.accountId);
      const ind = (acct?.industry || 'Unknown').trim();
      const val = Number(d.value) || 0;
      industryMap[ind] = (industryMap[ind] || 0) + val;
    });
    const labels = Object.keys(industryMap);
    const data = labels.map((k) => industryMap[k]);
    state.lastColumns = ['Industry', 'Revenue'];
    state.lastData = labels.map((k, i) => [k, data[i]]);

    return {
      title: 'Sales by Industry',
      chartType: 'pie',
      chartData: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: ['#1E88E5', '#1565C0', '#10B981', '#3B82F6', '#FFD93D', '#FF6B6B', '#8B5CF6'],
          },
        ],
      },
      summary: `Industries: ${labels.length}`,
    };
  }

  function salesByRegionReport() {
    const accounts = Data.accounts();
    const map = {};
    accounts.forEach((a) => {
      const r = a.region || 'Unknown';
      map[r] = (map[r] || 0) + 1;
    });
    const labels = Object.keys(map);
    const data = labels.map((k) => map[k]);
    state.lastColumns = ['Region', 'Accounts'];
    state.lastData = labels.map((k, i) => [k, data[i]]);

    return {
      title: 'Sales by Region (Accounts Count)',
      chartType: 'bar',
      chartData: {
        labels,
        datasets: [{ label: 'Accounts', data, backgroundColor: '#3B82F6' }],
      },
      summary: `Total Accounts: ${accounts.length}`,
    };
  }

  function salesByRepReport() {
    const deals = Data.deals();
    const team = Data.team();
    const map = {};
    deals.forEach((d) => {
      const owner = d.owner || 'Unassigned';
      map[owner] = (map[owner] || 0) + (Number(d.value) || 0);
    });
    const labels = Object.keys(map);
    const data = labels.map((k) => map[k]);
    state.lastColumns = ['Rep', 'Revenue'];
    state.lastData = labels.map((k, i) => [k, data[i]]);

    return {
      title: 'Sales by Rep',
      chartType: 'bar',
      chartData: {
        labels,
        datasets: [{ label: 'Revenue', data, backgroundColor: '#10B981' }],
      },
      summary: `Team Members: ${team.length}`,
    };
  }

  function activityReport() {
    const tasks = Data.tasks();
    const byStatus = {};
    tasks.forEach((t) => {
      const s = t.status || 'Unknown';
      byStatus[s] = (byStatus[s] || 0) + 1;
    });
    const labels = Object.keys(byStatus);
    const data = labels.map((k) => byStatus[k]);
    state.lastColumns = ['Status', 'Tasks'];
    state.lastData = labels.map((k, i) => [k, data[i]]);

    return {
      title: 'Activity Report (Tasks by Status)',
      chartType: 'doughnut',
      chartData: {
        labels,
        datasets: [
          { data, backgroundColor: ['#1E88E5', '#43A047', '#FF6B6B', '#FFD93D', '#8B5CF6'] },
        ],
      },
      summary: `Total Activities (Tasks): ${tasks.length}`,
    };
  }

  function taskCompletionReport() {
    const tasks = Data.tasks();
    const total = tasks.length || 1;
    const done = tasks.filter((t) => (t.status || '').toLowerCase() === 'completed').length;
    const pct = Math.round((done / total) * 100);
    state.lastColumns = ['Metric', 'Value'];
    state.lastData = [
      ['Total Tasks', total],
      ['Completed', done],
      ['Completion %', pct],
    ];

    return {
      title: 'Task Completion',
      chartType: 'polarArea',
      chartData: {
        labels: ['Completed', 'Remaining'],
        datasets: [{ data: [done, total - done], backgroundColor: ['#10B981', '#E5E7EB'] }],
      },
      summary: `Completion: ${pct}%`,
    };
  }

  // Probability fallback by stage
  function stageProbability(stage) {
    const map = {
      Prospecting: 10,
      Qualification: 25,
      Proposal: 50,
      Negotiation: 75,
      'Closed Won': 100,
      'Closed Lost': 0,
    };
    return map[stage] ?? 0;
  }

  // ---------- Custom Report Builder ----------
  function handleGenerateCustom() {
    const module = $$('#crb-module').value;
    const metric = $$('#crb-metric').value;
    const group = $$('#crb-group').value;

    // Simple example: Deals grouped by Stage with sum(Value)
    if (module === 'Deals' && metric === 'Sum(Value)' && group === 'Stage') {
      const deals = Data.deals();
      const map = {};
      deals.forEach((d) => {
        const g = d.stage || 'Unknown';
        map[g] = (map[g] || 0) + (Number(d.value) || 0);
      });
      const labels = Object.keys(map);
      const values = labels.map((k) => map[k]);
      state.lastColumns = ['Stage', 'Total Value'];
      state.lastData = labels.map((k, i) => [k, values[i]]);

      drawResult({
        title: 'Custom: Deals Sum(Value) by Stage',
        chartType: 'bar',
        chartData: {
          labels,
          datasets: [{ label: 'Value', data: values, backgroundColor: '#1565C0' }],
        },
        summary: `Groups: ${labels.length}`,
      });
      return;
    }

    // Fallback message
    drawResult({
      title: 'Custom Report',
      chartType: 'bar',
      chartData: {
        labels: ['Not Implemented'],
        datasets: [{ label: 'Value', data: [0], backgroundColor: '#E5E7EB' }],
      },
      summary:
        'This metric/grouping is not yet implemented. Please choose Deals: Sum(Value) by Stage for a working example.',
    });
  }

  // ---------- Rendering ----------
  function render() {
    const mount = el.mount();
    if (!mount) return;

    mount.innerHTML = `
      <div class="page-header">
        <h2><i class="fa-solid fa-chart-bar" style="margin-right:8px;"></i>Reports</h2>
        <div class="header-actions">
          <button id="rep-export-csv" class="btn action-button btn-secondary">
            <i class="fa-solid fa-download"></i> Export CSV
          </button>
          <button id="rep-print" class="btn action-button btn-secondary">
            <i class="fa-solid fa-print"></i> Print
          </button>
        </div>
      </div>

      <div class="card" style="margin-top:15px;">
        <div class="card-header">
          <i class="fa-solid fa-bolt" style="margin-right:6px;"></i> Predefined Reports
        </div>
        <div class="card-body">
          <div class="grid grid-4">
            ${reportCard('lead-conv', 'Lead Conversion', 'fa-filter')}
            ${reportCard('deal-pipe', 'Deal Pipeline', 'fa-handshake')}
            ${reportCard('rev-forecast', 'Revenue Forecast', 'fa-chart-line')}
            ${reportCard('sales-ind', 'Sales by Industry', 'fa-chart-pie')}
            ${reportCard('sales-region', 'Sales by Region', 'fa-globe')}
            ${reportCard('sales-rep', 'Sales by Rep', 'fa-user')}
            ${reportCard('activity', 'Activity Report', 'fa-history')}
            ${reportCard('task-compl', 'Task Completion', 'fa-check-square')}
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:15px;">
        <div class="card-header">
          <i class="fa-solid fa-wand-magic-sparkles" style="margin-right:6px;"></i> Custom Report Builder
        </div>
        <div class="card-body">
          <div class="form-row">
            <label>Module</label>
            <select id="crb-module" class="input">
              <option>Deals</option>
              <option>Leads</option>
              <option>Contacts</option>
              <option>Accounts</option>
              <option>Tasks</option>
            </select>
          </div>
          <div class="form-row">
            <label>Metric</label>
            <select id="crb-metric" class="input">
              <option>Sum(Value)</option>
              <option>Count</option>
            </select>
          </div>
          <div class="form-row">
            <label>Group By</label>
            <select id="crb-group" class="input">
              <option>Stage</option>
              <option>Owner</option>
              <option>Month</option>
            </select>
          </div>
          <div class="form-actions" style="margin-top:10px;">
            <button id="crb-generate" class="btn action-button btn-primary">
              <i class="fa-solid fa-play"></i> Generate Report
            </button>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:15px;">
        <div class="card-header">
          <i class="fa-solid fa-chart-simple" style="margin-right:6px;"></i> Result
        </div>
        <div class="card-body">
          <h3 id="rep-title" style="margin-bottom:10px;"></h3>
          <div style="height:360px;">
            <canvas id="rep-canvas"></canvas>
          </div>
          <p id="rep-summary" style="margin-top:10px;"></p>
          <div class="table-wrap" style="margin-top:10px;">
            <table id="rep-table" class="table"></table>
          </div>
        </div>
      </div>
    `;

    // Events
    $$$('.rep-card', mount).forEach((c) =>
      c.addEventListener('click', () => {
        const id = c.getAttribute('data-id');
        runPredefined(id);
      })
    );
    $$('#crb-generate', mount).addEventListener('click', handleGenerateCustom);
    $$('#rep-export-csv', mount).addEventListener('click', exportCSV);
    $$('#rep-print', mount).addEventListener('click', () => window.print());
  }

  function reportCard(id, title, icon) {
    return `
      <button class="rep-card btn action-button btn-secondary" data-id="${id}" title="${title}">
        <i class="fa-solid ${icon}"></i>
        <span style="margin-left:8px;">${title}</span>
      </button>
    `;
  }

  function drawResult(payload) {
    const titleEl = $$('#rep-title');
    const canvas = $$('#rep-canvas');
    const summaryEl = $$('#rep-summary');
    const table = $$('#rep-table');

    titleEl.textContent = payload.title || 'Report';
    summaryEl.textContent = payload.summary || '';

    renderChart(canvas, payload.chartType, payload.chartData, payload.chartOptions);

    // Draw table
    const cols = state.lastColumns || [];
    const rows = state.lastData || [];
    table.innerHTML = `
      <thead>
        <tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map((r) => `<tr>${r.map((v) => `<td>${typeof v === 'number' ? fmtCurrency(v) : v}</td>`).join('')}</tr>`).join('')}
      </tbody>
    `;
  }

  function runPredefined(id) {
    let payload;
    switch (id) {
      case 'lead-conv':
        payload = leadConversionReport();
        break;
      case 'deal-pipe':
        payload = dealPipelineReport();
        break;
      case 'rev-forecast':
        payload = revenueForecastReport();
        break;
      case 'sales-ind':
        payload = salesByIndustryReport();
        break;
      case 'sales-region':
        payload = salesByRegionReport();
        break;
      case 'sales-rep':
        payload = salesByRepReport();
        break;
      case 'activity':
        payload = activityReport();
        break;
      case 'task-compl':
        payload = taskCompletionReport();
        break;
      default:
        payload = { title: 'Report', chartType: 'bar', chartData: { labels: [], datasets: [] }, summary: '' };
    }
    drawResult(payload);
  }

  function exportCSV() {
    if (!state.lastData?.length) {
      window.Toast?.info?.('No data to export') || alert('No data to export');
      return;
    }
    const rows = [state.lastColumns, ...state.lastData];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${(state.activeReport || 'data').replace(/\s+/g, '_').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function init() {
    render();
    // Default view
    runPredefined('lead-conv');
  }

  return { init, render, runPredefined };
})();
