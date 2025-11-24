// ===========================================
// GLOBENTIX CRM - TEAM, REPORTS & SETTINGS MODULES
// ===========================================

// ===== TEAM MANAGEMENT MODULE =====

let currentTeamPage = 1;

function renderTeam() {
  const container = document.getElementById('contentContainer');
  
  const html = `
    <div class="table-container">
      <div class="table-controls">
        <div class="table-filters">
          <select class="filter-select" id="teamRoleFilter" onchange="filterTeam()">
            <option value="">All Roles</option>
            <option value="Sales Executive">Sales Executive</option>
            <option value="Support">Support</option>
            <option value="Admin">Admin</option>
          </select>
          <input type="text" class="filter-input" placeholder="Search team members..." id="teamSearchInput" oninput="filterTeam()" />
        </div>
        <button class="btn btn-primary" onclick="showAddTeamMemberModal()"><i class="fas fa-plus"></i> Add Team Member</button>
      </div>
      
      <table id="teamTable">
        <thead>
          <tr>
            <th onclick="sortTable('teamTable', 0)">Name <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('teamTable', 1)">Role <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('teamTable', 2)">Email <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('teamTable', 3)">Leads <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('teamTable', 4)">Deals <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('teamTable', 5)">Revenue <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('teamTable', 6)">Conversion <i class="fas fa-sort"></i></th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="teamTableBody"></tbody>
      </table>
      
      <div id="teamPagination"></div>
    </div>
    
    <!-- Team Performance Dashboard -->
    <div class="card mt-20">
      <div class="card-header"><h3 class="card-title">Team Performance Overview</h3></div>
      <div class="card-body">
        <div class="chart-container" style="height: 350px;"><canvas id="teamPerformanceDetailChart"></canvas></div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  filterTeam();
  
  setTimeout(() => {
    renderTeamPerformanceChart();
  }, 100);
}

function filterTeam() {
  const roleFilter = document.getElementById('teamRoleFilter')?.value || '';
  const searchQuery = document.getElementById('teamSearchInput')?.value.toLowerCase() || '';
  
  let members = getTeamMembers();
  
  if (roleFilter) members = members.filter(m => m.role === roleFilter);
  if (searchQuery) {
    members = members.filter(m => 
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery) ||
      m.email.toLowerCase().includes(searchQuery)
    );
  }
  
  displayTeam(members);
}

function displayTeam(members) {
  const tbody = document.getElementById('teamTableBody');
  const paginationContainer = document.getElementById('teamPagination');
  
  if (!tbody) return;
  
  const paginated = paginateData(members, currentTeamPage, 25);
  
  if (paginated.data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center"><div class="empty-state"><i class="fas fa-inbox"></i><h3>No team members found</h3></div></td></tr>';
    paginationContainer.innerHTML = '';
    return;
  }
  
  let html = '';
  paginated.data.forEach(member => {
    html += `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="user-avatar" style="width: 32px; height: 32px; font-size: 12px;">${member.firstName[0]}${member.lastName[0]}</div>
            <strong>${member.firstName} ${member.lastName}</strong>
          </div>
        </td>
        <td>${member.role}</td>
        <td>${member.email}</td>
        <td>${member.leadsAssigned}</td>
        <td>${member.dealsAssigned}</td>
        <td><strong>${formatCurrency(member.revenue)}</strong></td>
        <td><span class="badge badge-${member.conversionRate > 20 ? 'qualified' : 'contacted'}">${member.conversionRate}%</span></td>
        <td>
          <div class="table-actions">
            <button class="action-btn" onclick="showTeamMemberDetails('${member.id}')" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="action-btn" onclick="showEditTeamMemberModal('${member.id}')" title="Edit"><i class="fas fa-pencil"></i></button>
            <button class="action-btn danger" onclick="deleteTeamMemberConfirm('${member.id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
  renderPagination('teamPagination', paginated.totalPages, paginated.currentPage, 'changeTeamPage');
}

function changeTeamPage(page) {
  currentTeamPage = page;
  filterTeam();
}

function showAddTeamMemberModal() {
  const content = `
    <form id="teamMemberForm" class="form-grid">
      <div class="form-group">
        <label class="form-label">First Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="firstName" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Last Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="lastName" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Email <span class="required">*</span></label>
        <input type="email" class="form-input" name="email" required />
        <div class="form-error"></div>
      </div>
    
      
      <div class="form-group">
        <label class="form-label">Role <span class="required">*</span></label>
        <select class="form-select" name="role" required>
          <option value="">Select Role</option>
          <option value="Manager">Manager</option>
          <option value="Sales Executive">Sales Executive</option>
          <option value="Support">Support</option>
          <option value="Admin">Admin</option>
        </select>
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Department</label>
        <select class="form-select" name="department">
          <option value="">Select Department</option>
          <option value="Sales">Sales</option>
          <option value="Support">Support</option>
          <option value="Admin">Admin</option>
          <option value="Marketing">Marketing</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Hire Date</label>
        <input type="date" class="form-input" name="hireDate" />
      </div>
      
      <div class="form-group">
        <label class="form-label">Status <span class="required">*</span></label>
        <select class="form-select" name="status" required>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <div class="form-error"></div>
      </div>
    </form>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="handleAddTeamMember()">Add Team Member</button>
    </div>
  `;
  
  showModal(content, 'Add New Team Member');
}

function handleAddTeamMember() {
  if (!validateForm('teamMemberForm')) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  const formData = getFormData('teamMemberForm');
  createTeamMember(formData);
  closeModal();
  showToast('Team member added successfully!', 'success');
  renderTeam();
}

function showEditTeamMemberModal(memberId) {
  const member = getTeamMember(memberId);
  if (!member) return;
  
  const content = `
    <form id="editTeamMemberForm" class="form-grid">
      <input type="hidden" name="id" value="${member.id}" />
      
      <div class="form-group">
        <label class="form-label">First Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="firstName" value="${member.firstName}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Last Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="lastName" value="${member.lastName}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Email <span class="required">*</span></label>
        <input type="email" class="form-input" name="email" value="${member.email}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Role</label>
        <select class="form-select" name="role">
          <option value="Manager" ${member.role === 'Manager' ? 'selected' : ''}>Manager</option>
          <option value="Sales Executive" ${member.role === 'Sales Executive' ? 'selected' : ''}>Sales Executive</option>
          <option value="Support" ${member.role === 'Support' ? 'selected' : ''}>Support</option>
          <option value="Admin" ${member.role === 'Admin' ? 'selected' : ''}>Admin</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" name="status">
          <option value="Active" ${member.status === 'Active' ? 'selected' : ''}>Active</option>
          <option value="Inactive" ${member.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    </form>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="handleUpdateTeamMember()">Update Team Member</button>
    </div>
  `;
  
  showModal(content, 'Edit Team Member');
}

function handleUpdateTeamMember() {
  if (!validateForm('editTeamMemberForm')) return;
  
  const formData = getFormData('editTeamMemberForm');
  updateTeamMember(formData.id, formData);
  closeModal();
  showToast('Team member updated successfully!', 'success');
  renderTeam();
}

function deleteTeamMemberConfirm(memberId) {
  const member = getTeamMember(memberId);
  confirmDialog(`Are you sure you want to delete team member "${member.firstName} ${member.lastName}"? This action cannot be undone.`, () => {
    deleteTeamMember(memberId);
    showToast('Team member deleted successfully', 'success');
    renderTeam();
  });
}

function showTeamMemberDetails(memberId) {
  const member = getTeamMember(memberId);
  if (!member) return;
  
  const memberLeads = CRMData.leads.filter(l => l.assignedTo === memberId);
  const memberDeals = CRMData.deals.filter(d => d.owner === memberId);
  
  const content = `
    <div style="padding: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div class="user-avatar" style="width: 80px; height: 80px; font-size: 32px; margin: 0 auto 10px;">${member.firstName[0]}${member.lastName[0]}</div>
        <h3>${member.firstName} ${member.lastName}</h3>
        <p style="color: var(--text-secondary);">${member.role}</p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div>
          <label style="font-size: 12px; color: var(--text-secondary);">Email</label>
          <p style="margin: 5px 0;">${member.email}</p>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-secondary);">Phone</label>
          <p style="margin: 5px 0;">${member.phone}</p>
        </div>
      </div>
      
      <div class="kpi-grid" style="margin: 20px 0;">
        <div class="kpi-card">
          <div class="kpi-label">Assigned Leads</div>
          <div class="kpi-value">${member.leadsAssigned}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Active Deals</div>
          <div class="kpi-value">${member.dealsAssigned}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Revenue Generated</div>
          <div class="kpi-value" style="font-size: 20px;">${formatCurrency(member.revenue)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Conversion Rate</div>
          <div class="kpi-value">${member.conversionRate}%</div>
        </div>
      </div>
      
      <div style="border-top: 1px solid var(--border-color); padding-top: 15px; margin-top: 15px;">
        <h4 style="margin-bottom: 10px;">Recent Leads (${memberLeads.length})</h4>
        ${memberLeads.slice(0, 5).map(lead => `
          <div style="padding: 8px; background: var(--background); border-radius: 6px; margin-bottom: 8px;">
            ${lead.contactName} - ${lead.companyName}
            <span class="badge badge-${lead.stage.toLowerCase()}" style="margin-left: 10px;">${lead.stage}</span>
          </div>
        `).join('') || '<p style="color: var(--text-secondary);">No leads</p>'}
      </div>
      
      <div style="border-top: 1px solid var(--border-color); padding-top: 15px; margin-top: 15px;">
        <h4 style="margin-bottom: 10px;">Deals (${memberDeals.length})</h4>
        ${memberDeals.slice(0, 5).map(deal => `
          <div style="padding: 8px; background: var(--background); border-radius: 6px; margin-bottom: 8px;">
            ${deal.dealName} - ${formatCurrency(deal.value)}
            <span class="badge badge-${deal.stage.toLowerCase().replace(' ', '-')}" style="margin-left: 10px;">${deal.stage}</span>
          </div>
        `).join('') || '<p style="color: var(--text-secondary);">No deals</p>'}
      </div>
    </div>
  `;
  
  showSideDrawer(content, 'Team Member Details');
}

function renderTeamPerformanceChart() {
  const ctx = document.getElementById('teamPerformanceDetailChart');
  if (!ctx) return;
  
  const topMembers = CRMData.team.sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: topMembers.map(m => `${m.firstName} ${m.lastName[0]}.`),
      datasets: [
        {
          label: 'Revenue',
          data: topMembers.map(m => m.revenue),
          backgroundColor: '#1E88E5',
          yAxisID: 'y'
        },
        {
          label: 'Deals Closed',
          data: topMembers.map(m => m.dealsClosed),
          backgroundColor: '#43A047',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Revenue ($)' }
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Deals Closed' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

// ===== REPORTS MODULE =====

function renderReports() {
  const container = document.getElementById('contentContainer');
  
  const html = `
    <div class="kpi-grid" style="margin-bottom: 30px;">
      <div class="kpi-card" onclick="generateReport('leadConversion')" style="cursor: pointer;">
        <div class="kpi-label">Lead Conversion Report</div>
        <p style="font-size: 12px; margin-top: 10px; color: var(--text-secondary);">Track lead conversion rates and funnel metrics</p>
      </div>
      
      <div class="kpi-card" onclick="generateReport('dealPipeline')" style="cursor: pointer;">
        <div class="kpi-label">Deal Pipeline Report</div>
        <p style="font-size: 12px; margin-top: 10px; color: var(--text-secondary);">Analyze deals across pipeline stages</p>
      </div>
      
      <div class="kpi-card" onclick="generateReport('revenueForecast')" style="cursor: pointer;">
        <div class="kpi-label">Revenue Forecast Report</div>
        <p style="font-size: 12px; margin-top: 10px; color: var(--text-secondary);">Project future revenue based on probability</p>
      </div>
      
      <div class="kpi-card" onclick="generateReport('salesByIndustry')" style="cursor: pointer;">
        <div class="kpi-label">Sales by Industry</div>
        <p style="font-size: 12px; margin-top: 10px; color: var(--text-secondary);">Break down sales performance by industry</p>
      </div>
      
      <div class="kpi-card" onclick="generateReport('salesByRegion')" style="cursor: pointer;">
        <div class="kpi-label">Sales by Region</div>
        <p style="font-size: 12px; margin-top: 10px; color: var(--text-secondary);">Analyze sales distribution across regions</p>
      </div>
      
      <div class="kpi-card" onclick="generateReport('salesByRep')" style="cursor: pointer;">
        <div class="kpi-label">Sales by Rep</div>
        <p style="font-size: 12px; margin-top: 10px; color: var(--text-secondary);">Compare individual sales rep performance</p>
      </div>
      
      <div class="kpi-card" onclick="generateReport('activityReport')" style="cursor: pointer;">
        <div class="kpi-label">Activity Report</div>
        <p style="font-size: 12px; margin-top: 10px; color: var(--text-secondary);">Review team activity and engagement</p>
      </div>
      
      <div class="kpi-card" onclick="generateReport('taskCompletion')" style="cursor: pointer;">
        <div class="kpi-label">Task Completion Report</div>
        <p style="font-size: 12px; margin-top: 10px; color: var(--text-secondary);">Monitor task completion rates</p>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">Custom Report Builder</h3></div>
      <div class="card-body">
        <form id="customReportForm" class="form-grid">
          <div class="form-group">
            <label class="form-label">Select Module</label>
            <select class="form-select" name="module" id="reportModule">
              <option value="leads">Leads</option>
              <option value="deals">Deals</option>
              <option value="contacts">Contacts</option>
              <option value="accounts">Accounts</option>
              <option value="tasks">Tasks</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Date Range</label>
            <select class="form-select" name="dateRange">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div class="form-group" style="grid-column: 1 / -1;">
            <button type="button" class="btn btn-primary" onclick="generateCustomReport()"><i class="fas fa-chart-bar"></i> Generate Report</button>
            <button type="button" class="btn btn-secondary" onclick="showToast('Export feature coming soon', 'info')"><i class="fas fa-download"></i> Export</button>
          </div>
        </form>
      </div>
    </div>
    
    <div id="reportOutput" class="mt-20"></div>
  `;
  
  container.innerHTML = html;
}

function generateReport(type) {
  const output = document.getElementById('reportOutput');
  if (!output) return;
  
  let html = '<div class="card"><div class="card-header"><h3 class="card-title">';
  
  switch(type) {
    case 'leadConversion':
      html += 'Lead Conversion Report</h3></div><div class="card-body">';
      const totalLeads = CRMData.leads.length;
      const convertedLeads = CRMData.leads.filter(l => l.stage === 'Converted').length;
      const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
      
      html += `
        <div class="kpi-grid">
          <div class="kpi-card"><div class="kpi-label">Total Leads</div><div class="kpi-value">${totalLeads}</div></div>
          <div class="kpi-card"><div class="kpi-label">Converted Leads</div><div class="kpi-value">${convertedLeads}</div></div>
          <div class="kpi-card"><div class="kpi-label">Conversion Rate</div><div class="kpi-value">${conversionRate}%</div></div>
        </div>
        <div class="chart-container" style="height: 300px; margin-top: 20px;"><canvas id="reportChart"></canvas></div>
      `;
      break;
      
    case 'dealPipeline':
      html += 'Deal Pipeline Report</h3></div><div class="card-body">';
      const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
      html += '<table><thead><tr><th>Stage</th><th>Count</th><th>Total Value</th></tr></thead><tbody>';
      
      stages.forEach(stage => {
        const stageDeals = CRMData.deals.filter(d => d.stage === stage);
        const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
        html += `<tr><td><strong>${stage}</strong></td><td>${stageDeals.length}</td><td>${formatCurrency(stageValue)}</td></tr>`;
      });
      
      html += '</tbody></table>';
      break;
      
    case 'revenueForecast':
      html += 'Revenue Forecast Report</h3></div><div class="card-body">';
      const activeDeals = CRMData.deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage));
      const forecastedRevenue = activeDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0);
      const wonRevenue = CRMData.deals.filter(d => d.stage === 'Closed Won').reduce((sum, d) => sum + d.value, 0);
      
      html += `
        <div class="kpi-grid">
          <div class="kpi-card"><div class="kpi-label">Forecasted Revenue</div><div class="kpi-value">${formatCurrency(forecastedRevenue)}</div></div>
          <div class="kpi-card"><div class="kpi-label">Won Revenue</div><div class="kpi-value">${formatCurrency(wonRevenue)}</div></div>
          <div class="kpi-card"><div class="kpi-label">Total Potential</div><div class="kpi-value">${formatCurrency(forecastedRevenue + wonRevenue)}</div></div>
        </div>
      `;
      break;
      
    case 'salesByIndustry':
      html += 'Sales by Industry Report</h3></div><div class="card-body">';
      const industryMap = {};
      CRMData.accounts.forEach(acc => {
        const accDeals = CRMData.deals.filter(d => d.accountId === acc.id && d.stage === 'Closed Won');
        const revenue = accDeals.reduce((sum, d) => sum + d.value, 0);
        industryMap[acc.industry] = (industryMap[acc.industry] || 0) + revenue;
      });
      
      html += '<table><thead><tr><th>Industry</th><th>Revenue</th></tr></thead><tbody>';
      Object.entries(industryMap).sort((a, b) => b[1] - a[1]).forEach(([industry, revenue]) => {
        html += `<tr><td><strong>${industry}</strong></td><td>${formatCurrency(revenue)}</td></tr>`;
      });
      html += '</tbody></table>';
      break;
      
    case 'salesByRep':
      html += 'Sales by Rep Report</h3></div><div class="card-body">';
      html += '<table><thead><tr><th>Sales Rep</th><th>Deals Closed</th><th>Revenue</th><th>Conversion Rate</th></tr></thead><tbody>';
      
      CRMData.team.sort((a, b) => b.revenue - a.revenue).forEach(member => {
        html += `
          <tr>
            <td><strong>${member.firstName} ${member.lastName}</strong></td>
            <td>${member.dealsClosed}</td>
            <td>${formatCurrency(member.revenue)}</td>
            <td><span class="badge badge-${member.conversionRate > 20 ? 'qualified' : 'contacted'}">${member.conversionRate}%</span></td>
          </tr>
        `;
      });
      
      html += '</tbody></table>';
      break;
      
    default:
      html += `${type.replace(/([A-Z])/g, ' $1').trim()} Report</h3></div><div class="card-body"><p>Report data will be displayed here.</p>`;
  }
  
  html += '</div></div>';
  output.innerHTML = html;
  
  if (type === 'leadConversion') {
    setTimeout(() => {
      const ctx = document.getElementById('reportChart');
      if (ctx) {
        const stages = ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted'];
        const data = stages.map(stage => CRMData.leads.filter(l => l.stage === stage).length);
        
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: stages,
            datasets: [{ label: 'Leads', data: data, backgroundColor: '#1E88E5' }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }, 100);
  }
  
  showToast('Report generated successfully', 'success');
}

function generateCustomReport() {
  const formData = getFormData('customReportForm');
  showToast('Generating custom report...', 'info');
  
  setTimeout(() => {
    generateReport('dealPipeline');
  }, 500);
}

// ===== SETTINGS MODULE =====

let currentSettingsTab = 'profile';

function renderSettings() {
  const container = document.getElementById('contentContainer');
  
  const html = `
    <div class="tabs" style="margin-bottom: 30px;">
      <button class="tab ${currentSettingsTab === 'profile' ? 'active' : ''}" onclick="switchSettingsTab('profile')">Profile Settings</button>
      <button class="tab ${currentSettingsTab === 'security' ? 'active' : ''}" onclick="switchSettingsTab('security')">Account &amp; Security</button>
      <button class="tab ${currentSettingsTab === 'notifications' ? 'active' : ''}" onclick="switchSettingsTab('notifications')">Notifications</button>
    </div>
    
    <div id="settingsContent"></div>
  `;
  
  container.innerHTML = html;
  switchSettingsTab(currentSettingsTab);
}

function switchSettingsTab(tab) {
  currentSettingsTab = tab;
  const content = document.getElementById('settingsContent');
  
  if (tab === 'profile') {
    content.innerHTML = `
      <div class="card">
        <div class="card-header"><h3 class="card-title">Profile Settings</h3></div>
        <div class="card-body">
          <form id="profileForm" class="form-grid">
            <div class="form-group" style="grid-column: 1 / -1; text-align: center;">
              <div class="user-avatar" style="width: 100px; height: 100px; font-size: 40px; margin: 0 auto 20px;">${CRMData.currentUser.firstName[0]}${CRMData.currentUser.lastName[0]}</div>
              <button type="button" class="btn btn-secondary btn-sm" onclick="showToast('Profile picture upload feature coming soon', 'info')">Change Photo</button>
            </div>
            
            <div class="form-group">
              <label class="form-label">First Name <span class="required">*</span></label>
              <input type="text" class="form-input" name="firstName" value="${CRMData.currentUser.firstName}" required />
            </div>
            
            <div class="form-group">
              <label class="form-label">Last Name <span class="required">*</span></label>
              <input type="text" class="form-input" name="lastName" value="${CRMData.currentUser.lastName}" required />
            </div>
            
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" class="form-input" name="username" value="${CRMData.currentUser.email.split('@')[0]}" />
            </div>
            
            <div class="form-group">
              <label class="form-label">Email <span class="required">*</span></label>
              <input type="email" class="form-input" name="email" value="${CRMData.currentUser.email}" required />
            </div>
            
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="tel" class="form-input" name="phone" value="+1-555-0123" />
            </div>
            
            <div class="form-group">
              <label class="form-label">Role</label>
              <input type="text" class="form-input" value="${CRMData.currentUser.role}" disabled />
            </div>
            
            <div class="form-group">
              <label class="form-label">Time Zone</label>
              <select class="form-select" name="timezone">
                <option value="EST">Eastern Time (EST)</option>
                <option value="PST">Pacific Time (PST)</option>
                <option value="GMT">Greenwich Mean Time (GMT)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Language</label>
              <select class="form-select" name="language">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Bio / About Me</label>
              <textarea class="form-textarea" name="bio" placeholder="Tell us about yourself..."></textarea>
            </div>
            
            <div class="form-group" style="grid-column: 1 / -1;">
              <button type="button" class="btn btn-primary" onclick="handleUpdateProfile()">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    `;
  } else if (tab === 'security') {
    content.innerHTML = `
      <div class="card mb-20">
        <div class="card-header"><h3 class="card-title">Change Password</h3></div>
        <div class="card-body">
          <form id="passwordForm" class="form-grid">
            <div class="form-group">
              <label class="form-label">Current Password <span class="required">*</span></label>
              <input type="password" class="form-input" name="currentPassword" required />
            </div>
            
            <div class="form-group"></div>
            
            <div class="form-group">
              <label class="form-label">New Password <span class="required">*</span></label>
              <input type="password" class="form-input" name="newPassword" required />
            </div>
            
            <div class="form-group">
              <label class="form-label">Confirm Password <span class="required">*</span></label>
              <input type="password" class="form-input" name="confirmPassword" required />
            </div>
            
            <div class="form-group" style="grid-column: 1 / -1;">
              <button type="button" class="btn btn-primary" onclick="handleChangePassword()">Update Password</button>
            </div>
          </form>
        </div>
      </div>
      
      <div class="card mb-20">
        <div class="card-header"><h3 class="card-title">Two-Factor Authentication</h3></div>
        <div class="card-body">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p><strong>Status:</strong> Disabled</p>
              <p style="color: var(--text-secondary); font-size: 12px;">Add an extra layer of security to your account</p>
            </div>
            <button class="btn btn-primary" onclick="showToast('2FA setup feature coming soon', 'info')">Enable 2FA</button>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header"><h3 class="card-title">Login History</h3></div>
        <div class="card-body">
          <table>
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>IP Address</th>
                <th>Device</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${new Date().toLocaleString()}</td>
                <td>192.168.1.1</td>
                <td>Chrome on Windows</td>
                <td>New York, USA</td>
                <td><span class="badge badge-qualified">Success</span></td>
              </tr>
              <tr>
                <td>${new Date(Date.now() - 24*60*60*1000).toLocaleString()}</td>
                <td>192.168.1.1</td>
                <td>Chrome on Windows</td>
                <td>New York, USA</td>
                <td><span class="badge badge-qualified">Success</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (tab === 'notifications') {
    content.innerHTML = `
      <div class="card">
        <div class="card-header"><h3 class="card-title">Notification Preferences</h3></div>
        <div class="card-body">
          <form id="notificationsForm">
            <div style="margin-bottom: 30px;">
              <h4 style="margin-bottom: 15px;">Notification Channels</h4>
              
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border-bottom: 1px solid var(--border-color);">
                <div>
                  <strong>Email Notifications</strong>
                  <p style="color: var(--text-secondary); font-size: 12px; margin: 5px 0 0;">Receive notifications via email</p>
                </div>
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" name="emailNotif" checked style="margin-right: 8px;" />
                  <span>Enabled</span>
                </label>
              </div>
              
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border-bottom: 1px solid var(--border-color);">
                <div>
                  <strong>SMS Notifications</strong>
                  <p style="color: var(--text-secondary); font-size: 12px; margin: 5px 0 0;">Receive notifications via SMS</p>
                </div>
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" name="smsNotif" style="margin-right: 8px;" />
                  <span>Disabled</span>
                </label>
              </div>
              
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border-bottom: 1px solid var(--border-color);">
                <div>
                  <strong>Push Notifications</strong>
                  <p style="color: var(--text-secondary); font-size: 12px; margin: 5px 0 0;">Receive browser push notifications</p>
                </div>
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" name="pushNotif" checked style="margin-right: 8px;" />
                  <span>Enabled</span>
                </label>
              </div>
              
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px;">
                <div>
                  <strong>In-App Notifications</strong>
                  <p style="color: var(--text-secondary); font-size: 12px; margin: 5px 0 0;">Show notifications within the app</p>
                </div>
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" name="inAppNotif" checked style="margin-right: 8px;" />
                  <span>Enabled</span>
                </label>
              </div>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h4 style="margin-bottom: 15px;">Notification Types</h4>
              
              <div style="padding: 10px; border-bottom: 1px solid var(--border-color);">
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" name="leadAssignment" checked style="margin-right: 8px;" />
                  <span>New Lead Assignment</span>
                </label>
              </div>
              
              <div style="padding: 10px; border-bottom: 1px solid var(--border-color);">
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" name="dealStageChange" checked style="margin-right: 8px;" />
                  <span>Deal Stage Change</span>
                </label>
              </div>
              
              <div style="padding: 10px; border-bottom: 1px solid var(--border-color);">
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" name="taskDueReminders" checked style="margin-right: 8px;" />
                  <span>Task Due Reminders</span>
                </label>
              </div>
              
              <div style="padding: 10px; border-bottom: 1px solid var(--border-color);">
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" name="overdueTasks" checked style="margin-right: 8px;" />
                  <span>Overdue Tasks</span>
                </label>
              </div>
              
              <div style="padding: 10px; border-bottom: 1px solid var(--border-color);">
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" name="teamActivity" style="margin-right: 8px;" />
                  <span>Team Activity</span>
                </label>
              </div>
              
              <div style="padding: 10px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" name="systemUpdates" checked style="margin-right: 8px;" />
                  <span>System Updates</span>
                </label>
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h4 style="margin-bottom: 15px;">Additional Settings</h4>
              
              <div style="padding: 10px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" name="soundEnabled" checked style="margin-right: 8px;" />
                  <span>Enable notification sounds</span>
                </label>
              </div>
              
              <div style="padding: 10px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="checkbox" name="desktopNotifications" checked style="margin-right: 8px;" />
                  <span>Enable desktop notifications</span>
                </label>
              </div>
            </div>
            
            <button type="button" class="btn btn-primary" onclick="handleSaveNotifications()">Save Preferences</button>
          </form>
        </div>
      </div>
    `;
  }
}

function handleUpdateProfile() {
  showToast('Profile updated successfully!', 'success');
}

function handleChangePassword() {
  const formData = getFormData('passwordForm');
  
  if (formData.newPassword !== formData.confirmPassword) {
    showToast('Passwords do not match!', 'error');
    return;
  }
  
  showToast('Password changed successfully!', 'success');
}

function handleSaveNotifications() {
  showToast('Notification preferences saved!', 'success');
}
