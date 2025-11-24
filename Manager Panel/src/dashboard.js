// ===========================================
// GLOBENTIX CRM - DASHBOARD MODULE
// ===========================================

function renderDashboard() {
  const container = document.getElementById('contentContainer');
  
  // Calculate KPIs
  const totalLeads = CRMData.leads.length;
  const qualifiedLeads = CRMData.leads.filter(l => l.stage === 'Qualified').length;
  const dealsInPipeline = CRMData.deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).length;
  const pipelineValue = CRMData.deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).reduce((sum, d) => sum + d.value, 0);
  const revenueThisMonth = CRMData.deals.filter(d => d.stage === 'Closed Won').reduce((sum, d) => sum + d.value, 0);
  const conversionRate = totalLeads > 0 ? ((CRMData.leads.filter(l => l.stage === 'Converted').length / totalLeads) * 100).toFixed(1) : 0;
  const openTasks = CRMData.tasks.filter(t => t.status !== 'Completed').length;
  const overdueTasks = CRMData.tasks.filter(t => t.dueDate < new Date().toISOString().split('T')[0] && t.status !== 'Completed').length;
  
  let html = `
    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Total Leads</div>
        <div class="kpi-value">${totalLeads}</div>
        <div class="kpi-trend up"><i class="fas fa-arrow-up"></i> ${qualifiedLeads} Qualified</div>
      </div>
      <div class="kpi-card" style="border-left-color: var(--success);">
        <div class="kpi-label">Deals in Pipeline</div>
        <div class="kpi-value">${dealsInPipeline}</div>
        <div class="kpi-trend up"><i class="fas fa-arrow-up"></i> ${formatCurrency(pipelineValue)}</div>
      </div>
      <div class="kpi-card" style="border-left-color: var(--warning);">
        <div class="kpi-label">Revenue Forecast</div>
        <div class="kpi-value">${formatCurrency(revenueThisMonth)}</div>
        <div class="kpi-trend up"><i class="fas fa-arrow-up"></i> This Month</div>
      </div>
      <div class="kpi-card" style="border-left-color: var(--info);">
        <div class="kpi-label">Conversion Rate</div>
        <div class="kpi-value">${conversionRate}%</div>
        <div class="kpi-trend up"><i class="fas fa-arrow-up"></i> +2.3% vs last month</div>
      </div>
      <div class="kpi-card" style="border-left-color: var(--error);">
        <div class="kpi-label">Open Tasks</div>
        <div class="kpi-value">${openTasks}</div>
        <div class="kpi-trend ${overdueTasks > 0 ? 'down' : 'up'}">
          <i class="fas fa-${overdueTasks > 0 ? 'exclamation-triangle' : 'check'}"></i> 
          ${overdueTasks} Overdue
        </div>
      </div>
    </div>
    
    <!-- AI Insights Widget -->
    <div class="card mb-20">
      <div class="card-header">
        <h3 class="card-title"><i class="fas fa-lightbulb" style="color: var(--warning); margin-right: 8px;"></i>AI Insights</h3>
      </div>
      <div class="card-body">
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-content">
              <div class="timeline-text"><strong>High-value lead needs follow-up:</strong> ${CRMData.leads.filter(l => l.score > 80)[0]?.contactName || 'John Smith'} from ${CRMData.leads.filter(l => l.score > 80)[0]?.companyName || 'Tech Corp'}</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-content">
              <div class="timeline-text"><strong>Deal likely to close:</strong> ${CRMData.deals.filter(d => d.stage === 'Negotiation')[0]?.dealName || 'Software License Deal'} - Probability 85%</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-content">
              <div class="timeline-text"><strong>Action needed:</strong> ${CRMData.leads.filter(l => new Date(l.lastContacted) < new Date(Date.now() - 7*24*60*60*1000)).length} leads not contacted in 7+ days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Charts Section -->
    <div class="chart-grid">
      <div class="card">
        <div class="card-header"><h3 class="card-title">Sales Funnel</h3></div>
        <div class="card-body"><div class="chart-container"><canvas id="salesFunnelChart"></canvas></div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">Team Performance</h3></div>
        <div class="card-body"><div class="chart-container"><canvas id="teamPerformanceChart"></canvas></div></div>
      </div>
      
      <div class="card">
        <div class="card-header"><h3 class="card-title">Lead Sources</h3></div>
        <div class="card-body"><div class="chart-container"><canvas id="leadSourceChart"></canvas></div></div>
      </div>
    </div>
    
    <!-- Quick Actions & Activity Feed -->
    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-top: 30px;">
      <div class="card">
        <div class="card-header"><h3 class="card-title">Quick Actions</h3></div>
        <div class="card-body" style="display: flex; flex-direction: column; gap: 10px;">
          <button class="btn btn-primary w-full" onclick="window.location.hash='leads'; setTimeout(() => showAddLeadModal(), 100);">
            <i class="fas fa-plus"></i> Add Lead
          </button>
          <button class="btn btn-primary w-full" onclick="window.location.hash='tasks'; setTimeout(() => showAddTaskModal(), 100);">
            <i class="fas fa-plus"></i> Assign Task
          </button>
          <button class="btn btn-primary w-full" onclick="window.location.hash='deals'; setTimeout(() => showAddDealModal(), 100);">
            <i class="fas fa-plus"></i> Create Deal
          </button>
          <button class="btn btn-primary w-full" onclick="window.location.hash='contacts'; setTimeout(() => showAddContactModal(), 100);">
            <i class="fas fa-plus"></i> Add Contact
          </button>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header"><h3 class="card-title">Recent Activity</h3></div>
        <div class="card-body" style="max-height: 400px; overflow-y: auto;">
          <div class="timeline">
            ${getActivities(10).map(act => `
              <div class="timeline-item">
                <div class="timeline-content">
                  <div class="timeline-time">${formatRelativeTime(act.timestamp)}</div>
                  <div class="timeline-text">${act.description}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Team Leaderboard -->
    <div class="card mt-20">
      <div class="card-header"><h3 class="card-title">Team Leaderboard</h3></div>
      <div class="card-body">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Role</th>
              <th>Deals Closed</th>
              <th>Revenue</th>
              <th>Conversion Rate</th>
            </tr>
          </thead>
          <tbody>
            ${CRMData.team.sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((member, index) => `
              <tr>
                <td><strong>#${index + 1}</strong></td>
                <td>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="user-avatar" style="width: 32px; height: 32px; font-size: 12px;">${member.firstName[0]}${member.lastName[0]}</div>
                    <span>${member.firstName} ${member.lastName}</span>
                  </div>
                </td>
                <td>${member.role}</td>
                <td>${member.dealsClosed}</td>
                <td><strong>${formatCurrency(member.revenue)}</strong></td>
                <td><span class="badge ${member.conversionRate > 20 ? 'badge-qualified' : 'badge-contacted'}">${member.conversionRate}%</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Render charts after DOM update
  setTimeout(() => {
    renderDashboardCharts();
  }, 100);
}

function renderDashboardCharts() {
  // Sales Funnel Chart
  const funnelCtx = document.getElementById('salesFunnelChart');
  if (funnelCtx) {
    const funnelData = {
      'New Leads': CRMData.leads.filter(l => l.stage === 'New').length,
      'Contacted': CRMData.leads.filter(l => l.stage === 'Contacted').length,
      'Qualified': CRMData.leads.filter(l => l.stage === 'Qualified').length,
      'Proposal': CRMData.deals.filter(d => d.stage === 'Proposal').length,
      'Negotiation': CRMData.deals.filter(d => d.stage === 'Negotiation').length,
      'Closed Won': CRMData.deals.filter(d => d.stage === 'Closed Won').length
    };
    
    new Chart(funnelCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(funnelData),
        datasets: [{
          label: 'Count',
          data: Object.values(funnelData),
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#43A047']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
  
  // Team Performance Chart
  const teamCtx = document.getElementById('teamPerformanceChart');
  if (teamCtx) {
    const topTeam = CRMData.team.sort((a, b) => b.dealsClosed - a.dealsClosed).slice(0, 6);
    
    new Chart(teamCtx, {
      type: 'bar',
      data: {
        labels: topTeam.map(m => `${m.firstName} ${m.lastName[0]}.`),
        datasets: [{
          label: 'Deals Closed',
          data: topTeam.map(m => m.dealsClosed),
          backgroundColor: '#1E88E5'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
  
  // Revenue Trend Chart
  const revenueCtx = document.getElementById('revenueTrendChart');
  if (revenueCtx) {
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const revenues = [120000, 145000, 180000, 165000, 210000, 245000];
    
    new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Revenue',
          data: revenues,
          borderColor: '#43A047',
          backgroundColor: 'rgba(67, 160, 71, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + (value / 1000) + 'K'
            }
          }
        }
      }
    });
  }
  
  // Lead Source Chart
  const sourceCtx = document.getElementById('leadSourceChart');
  if (sourceCtx) {
    const sources = {};
    CRMData.leads.forEach(lead => {
      sources[lead.leadSource] = (sources[lead.leadSource] || 0) + 1;
    });
    
    new Chart(sourceCtx, {
      type: 'pie',
      data: {
        labels: Object.keys(sources),
        datasets: [{
          data: Object.values(sources),
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}
