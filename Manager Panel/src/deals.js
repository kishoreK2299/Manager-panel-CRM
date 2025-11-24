// ===========================================
// GLOBENTIX CRM - DEALS MODULE
// ===========================================

let currentDealView = 'pipeline';
let currentDealPage = 1;

function renderDeals() {
  const container = document.getElementById('contentContainer');
  
  const html = `
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div class="tabs">
        <button class="tab ${currentDealView === 'pipeline' ? 'active' : ''}" onclick="switchDealView('pipeline')">Pipeline View</button>
        <button class="tab ${currentDealView === 'table' ? 'active' : ''}" onclick="switchDealView('table')">Table View</button>
      </div>
      <button class="btn btn-primary" onclick="showAddDealModal()"><i class="fas fa-plus"></i> Add Deal</button>
    </div>
    
    <div id="dealViewContainer"></div>
  `;
  
  container.innerHTML = html;
  switchDealView(currentDealView);
}

function switchDealView(view) {
  currentDealView = view;
  
  if (view === 'pipeline') {
    renderPipelineView();
  } else {
    renderTableView();
  }
}

function renderPipelineView() {
  const viewContainer = document.getElementById('dealViewContainer');
  const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  
  let html = '<div class="kanban-board">';
  
  stages.forEach(stage => {
    const stageDeals = CRMData.deals.filter(d => d.stage === stage);
    const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
    
    html += `
      <div class="kanban-column">
        <div class="kanban-header">
          <span class="kanban-title">${stage}</span>
          <span class="kanban-count">${stageDeals.length}</span>
        </div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">
          Total: ${formatCurrency(stageValue)}
        </div>
        <div class="kanban-cards">
          ${stageDeals.map(deal => `
            <div class="kanban-card" onclick="showDealDetails('${deal.id}')">
              <div class="kanban-card-title">${deal.dealName}</div>
              <div class="kanban-card-value">${formatCurrency(deal.value)}</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">${deal.company}</div>
              <div class="kanban-card-meta">
                <span><i class="fas fa-user"></i> ${deal.ownerName}</span>
                <span>${formatDate(deal.expectedCloseDate)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  // Analytics Summary
  const totalValue = CRMData.deals.reduce((sum, d) => sum + d.value, 0);
  const activeDeals = CRMData.deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage));
  const forecastedRevenue = activeDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0);
  const wonDeals = CRMData.deals.filter(d => d.stage === 'Closed Won').length;
  const lostDeals = CRMData.deals.filter(d => d.stage === 'Closed Lost').length;
  const winRate = (wonDeals + lostDeals) > 0 ? ((wonDeals / (wonDeals + lostDeals)) * 100).toFixed(1) : 0;
  
  html += `
    <div class="kpi-grid" style="margin-top: 30px;">
      <div class="kpi-card">
        <div class="kpi-label">Total Deal Value</div>
        <div class="kpi-value">${formatCurrency(totalValue)}</div>
      </div>
      <div class="kpi-card" style="border-left-color: var(--success);">
        <div class="kpi-label">Forecasted Revenue</div>
        <div class="kpi-value">${formatCurrency(forecastedRevenue)}</div>
      </div>
      <div class="kpi-card" style="border-left-color: var(--info);">
        <div class="kpi-label">Active Deals</div>
        <div class="kpi-value">${activeDeals.length}</div>
      </div>
      <div class="kpi-card" style="border-left-color: var(--warning);">
        <div class="kpi-label">Win Rate</div>
        <div class="kpi-value">${winRate}%</div>
        <div class="kpi-trend up">${wonDeals} won / ${lostDeals} lost</div>
      </div>
    </div>
  `;
  
  viewContainer.innerHTML = html;
}

function renderTableView() {
  const viewContainer = document.getElementById('dealViewContainer');
  
  const html = `
    <div class="table-container">
      <div class="table-controls">
        <div class="table-filters">
          <select class="filter-select" id="dealStageFilter" onchange="filterDealsTable()">
            <option value="">All Stages</option>
            <option value="Prospecting">Prospecting</option>
            <option value="Qualification">Qualification</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
          <input type="text" class="filter-input" placeholder="Search deals..." id="dealSearchInput" oninput="filterDealsTable()" />
        </div>
      </div>
      
      <table id="dealsTable">
        <thead>
          <tr>
            <th onclick="sortTable('dealsTable', 0)">Deal Name <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('dealsTable', 1)">Company <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('dealsTable', 2)">Value <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('dealsTable', 3)">Stage <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('dealsTable', 4)">Probability <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('dealsTable', 5)">Close Date <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('dealsTable', 6)">Owner <i class="fas fa-sort"></i></th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="dealsTableBody"></tbody>
      </table>
      
      <div id="dealsPagination"></div>
    </div>
  `;
  
  viewContainer.innerHTML = html;
  filterDealsTable();
}

function filterDealsTable() {
  const stageFilter = document.getElementById('dealStageFilter')?.value || '';
  const searchQuery = document.getElementById('dealSearchInput')?.value.toLowerCase() || '';
  
  let deals = [...CRMData.deals];
  
  if (stageFilter) deals = deals.filter(d => d.stage === stageFilter);
  if (searchQuery) {
    deals = deals.filter(d => 
      d.dealName.toLowerCase().includes(searchQuery) ||
      d.company.toLowerCase().includes(searchQuery)
    );
  }
  
  displayDealsTable(deals);
}

function displayDealsTable(deals) {
  const tbody = document.getElementById('dealsTableBody');
  const paginationContainer = document.getElementById('dealsPagination');
  
  if (!tbody) return;
  
  const paginated = paginateData(deals, currentDealPage, 25);
  
  if (paginated.data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="empty-state"><i class="fas fa-inbox"></i><h3>No deals found</h3></div></td></tr>';
    paginationContainer.innerHTML = '';
    return;
  }
  
  let html = '';
  paginated.data.forEach(deal => {
    html += `
      <tr>
        <td><strong>${deal.dealName}</strong></td>
        <td>${deal.company}</td>
        <td><strong>${formatCurrency(deal.value)}</strong></td>
        <td><span class="badge badge-${deal.stage.toLowerCase().replace(' ', '-')}">${deal.stage}</span></td>
        <td>${deal.probability}%</td>
        <td>${formatDate(deal.expectedCloseDate)}</td>
        <td>${deal.ownerName}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn" onclick="showDealDetails('${deal.id}')" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="action-btn" onclick="showEditDealModal('${deal.id}')" title="Edit"><i class="fas fa-pencil"></i></button>
            <button class="action-btn danger" onclick="deleteDealConfirm('${deal.id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
  renderPagination('dealsPagination', paginated.totalPages, paginated.currentPage, 'changeDealPage');
}

function changeDealPage(page) {
  currentDealPage = page;
  filterDealsTable();
}

function showAddDealModal() {
  const content = `
    <form id="dealForm" class="form-grid">
      <div class="form-group">
        <label class="form-label">Deal Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="dealName" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Company <span class="required">*</span></label>
        <input type="text" class="form-input" name="company" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Contact Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="contactName" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Deal Value <span class="required">*</span></label>
        <input type="number" class="form-input" name="value" required min="0" step="1000" />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Stage <span class="required">*</span></label>
        <select class="form-select" name="stage" required onchange="updateProbability()" id="dealStageSelect">
          <option value="">Select Stage</option>
          <option value="Prospecting">Prospecting</option>
          <option value="Qualification">Qualification</option>
          <option value="Proposal">Proposal</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Closed Won">Closed Won</option>
          <option value="Closed Lost">Closed Lost</option>
        </select>
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Probability %</label>
        <input type="number" class="form-input" name="probability" min="0" max="100" id="dealProbability" />
      </div>
      
      <div class="form-group">
        <label class="form-label">Expected Close Date <span class="required">*</span></label>
        <input type="date" class="form-input" name="expectedCloseDate" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Owner <span class="required">*</span></label>
        <select class="form-select" name="owner" required>
          <option value="">Select Owner</option>
          ${CRMData.team.map(m => `<option value="${m.id}">${m.firstName} ${m.lastName}</option>`).join('')}
        </select>
        <div class="form-error"></div>
      </div>
      
      <div class="form-group" style="grid-column: 1 / -1;">
        <label class="form-label">Description</label>
        <textarea class="form-textarea" name="description"></textarea>
      </div>
      
      <div class="form-group" style="grid-column: 1 / -1;">
        <label class="form-label">Notes</label>
        <textarea class="form-textarea" name="notes"></textarea>
      </div>
    </form>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="handleAddDeal()">Add Deal</button>
    </div>
  `;
  
  showModal(content, 'Add New Deal');
}

function updateProbability() {
  const stageSelect = document.getElementById('dealStageSelect');
  const probabilityInput = document.getElementById('dealProbability');
  
  if (!stageSelect || !probabilityInput) return;
  
  const probabilityMap = {
    'Prospecting': 10,
    'Qualification': 25,
    'Proposal': 50,
    'Negotiation': 75,
    'Closed Won': 100,
    'Closed Lost': 0
  };
  
  probabilityInput.value = probabilityMap[stageSelect.value] || 0;
}

function handleAddDeal() {
  if (!validateForm('dealForm')) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  const formData = getFormData('dealForm');
  const owner = CRMData.team.find(m => m.id === formData.owner);
  
  const dealData = {
    ...formData,
    value: parseFloat(formData.value),
    probability: parseInt(formData.probability) || 0,
    ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Unassigned'
  };
  
  createDeal(dealData);
  closeModal();
  showToast('Deal added successfully!', 'success');
  renderDeals();
}

function showEditDealModal(dealId) {
  const deal = getDeal(dealId);
  if (!deal) return;
  
  const content = `
    <form id="editDealForm" class="form-grid">
      <input type="hidden" name="id" value="${deal.id}" />
      
      <div class="form-group">
        <label class="form-label">Deal Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="dealName" value="${deal.dealName}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Deal Value <span class="required">*</span></label>
        <input type="number" class="form-input" name="value" value="${deal.value}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Stage <span class="required">*</span></label>
        <select class="form-select" name="stage" required>
          <option value="Prospecting" ${deal.stage === 'Prospecting' ? 'selected' : ''}>Prospecting</option>
          <option value="Qualification" ${deal.stage === 'Qualification' ? 'selected' : ''}>Qualification</option>
          <option value="Proposal" ${deal.stage === 'Proposal' ? 'selected' : ''}>Proposal</option>
          <option value="Negotiation" ${deal.stage === 'Negotiation' ? 'selected' : ''}>Negotiation</option>
          <option value="Closed Won" ${deal.stage === 'Closed Won' ? 'selected' : ''}>Closed Won</option>
          <option value="Closed Lost" ${deal.stage === 'Closed Lost' ? 'selected' : ''}>Closed Lost</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Expected Close Date</label>
        <input type="date" class="form-input" name="expectedCloseDate" value="${deal.expectedCloseDate}" />
      </div>
      
      <div class="form-group" style="grid-column: 1 / -1;">
        <label class="form-label">Notes</label>
        <textarea class="form-textarea" name="notes">${deal.notes || ''}</textarea>
      </div>
    </form>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="handleUpdateDeal()">Update Deal</button>
    </div>
  `;
  
  showModal(content, 'Edit Deal');
}

function handleUpdateDeal() {
  if (!validateForm('editDealForm')) return;
  
  const formData = getFormData('editDealForm');
  const updates = {
    ...formData,
    value: parseFloat(formData.value)
  };
  
  updateDeal(formData.id, updates);
  closeModal();
  showToast('Deal updated successfully!', 'success');
  renderDeals();
}

function deleteDealConfirm(dealId) {
  const deal = getDeal(dealId);
  confirmDialog(`Are you sure you want to delete the deal "${deal.dealName}"? This action cannot be undone.`, () => {
    deleteDeal(dealId);
    showToast('Deal deleted successfully', 'success');
    renderDeals();
  });
}

function showDealDetails(dealId) {
  const deal = getDeal(dealId);
  if (!deal) return;
  
  const content = `
    <div style="padding: 10px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div>
          <label style="font-size: 12px; color: var(--text-secondary);">Deal Name</label>
          <p style="font-weight: 600; margin: 5px 0 15px;">${deal.dealName}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Company</label>
          <p style="margin: 5px 0 15px;">${deal.company}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Contact</label>
          <p style="margin: 5px 0 15px;">${deal.contactName}</p>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-secondary);">Value</label>
          <p style="font-weight: 600; color: var(--success); margin: 5px 0 15px;">${formatCurrency(deal.value)}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Stage</label>
          <p style="margin: 5px 0 15px;"><span class="badge badge-${deal.stage.toLowerCase().replace(' ', '-')}">${deal.stage}</span></p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Owner</label>
          <p style="margin: 5px 0 15px;">${deal.ownerName}</p>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div>
          <label style="font-size: 12px; color: var(--text-secondary);">Probability</label>
          <p style="margin: 5px 0;">${deal.probability}%</p>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-secondary);">Expected Close Date</label>
          <p style="margin: 5px 0;">${formatDate(deal.expectedCloseDate)}</p>
        </div>
      </div>
      
      ${deal.description ? `
        <div style="margin-bottom: 20px;">
          <label style="font-size: 12px; color: var(--text-secondary);">Description</label>
          <p style="margin: 5px 0;">${deal.description}</p>
        </div>
      ` : ''}
      
      ${deal.notes ? `
        <div style="margin-bottom: 20px;">
          <label style="font-size: 12px; color: var(--text-secondary);">Notes</label>
          <p style="margin: 5px 0;">${deal.notes}</p>
        </div>
      ` : ''}
    </div>
  `;
  
  showSideDrawer(content, 'Deal Details');
}
