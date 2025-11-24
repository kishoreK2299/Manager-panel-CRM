// ===========================================
// GLOBENTIX CRM - ACCOUNTS MODULE
// ===========================================

let currentAccountPage = 1;

function renderAccounts() {
  const container = document.getElementById('contentContainer');
  
  const html = `
    <div class="table-container">
      <div class="table-controls">
        <div class="table-filters">
          <select class="filter-select" id="accountIndustryFilter" onchange="filterAccounts()">
            <option value="">All Industries</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Retail">Retail</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Education">Education</option>
          </select>
          <select class="filter-select" id="accountRegionFilter" onchange="filterAccounts()">
            <option value="">All Regions</option>
            <option value="North America">North America</option>
            <option value="Europe">Europe</option>
            <option value="Asia Pacific">Asia Pacific</option>
            <option value="Middle East">Middle East</option>
          </select>
          <input type="text" class="filter-input" placeholder="Search accounts..." id="accountSearchInput" oninput="filterAccounts()" />
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary" onclick="showAddAccountModal()"><i class="fas fa-plus"></i> Add Account</button>
        </div>
      </div>
      
      <table id="accountsTable">
        <thead>
          <tr>
            <th onclick="sortTable('accountsTable', 0)">Company Name <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('accountsTable', 1)">POC<i class="fas fa-sort"></i></th>
            <th onclick="sortTable('accountsTable', 2)">Region <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('accountsTable', 3)">Industry <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('accountsTable', 4)">Employees Size<i class="fas fa-sort"></i></th>
            <th onclick="sortTable('accountsTable', 5)">Revenue <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('accountsTable', 6)">Owner <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('accountsTable', 7)">Total Deals <i class="fas fa-sort"></i></th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="accountsTableBody"></tbody>
      </table>
      
      <div id="accountsPagination"></div>
    </div>
    
    <!-- KPI Cards -->
    <div class="kpi-grid" style="margin-top: 30px;">
      <div class="kpi-card">
        <div class="kpi-label">Total Accounts</div>
        <div class="kpi-value">${CRMData.accounts.length}</div>
      </div>
      <div class="kpi-card" style="border-left-color: var(--success);">
        <div class="kpi-label">Total Revenue</div>
        <div class="kpi-value">${formatCurrency(CRMData.accounts.reduce((sum, a) => sum + a.annualRevenue, 0))}</div>
      </div>
      <div class="kpi-card" style="border-left-color: var(--warning);">
        <div class="kpi-label">Avg Deal Size</div>
        <div class="kpi-value">${formatCurrency(CRMData.deals.length > 0 ? CRMData.deals.reduce((sum, d) => sum + d.value, 0) / CRMData.deals.length : 0)}</div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  filterAccounts();
}

function filterAccounts() {
  const industryFilter = document.getElementById('accountIndustryFilter')?.value || '';
  const regionFilter = document.getElementById('accountRegionFilter')?.value || '';
  const searchQuery = document.getElementById('accountSearchInput')?.value.toLowerCase() || '';
  
  let accounts = getAccounts();
  
  if (industryFilter) accounts = accounts.filter(a => a.industry === industryFilter);
  if (regionFilter) accounts = accounts.filter(a => a.region === regionFilter);
  if (searchQuery) {
    accounts = accounts.filter(a => a.companyName.toLowerCase().includes(searchQuery));
  }
  
  displayAccounts(accounts);
}

function displayAccounts(accounts) {
  const tbody = document.getElementById('accountsTableBody');
  const paginationContainer = document.getElementById('accountsPagination');
  
  if (!tbody) return;
  
  const paginated = paginateData(accounts, currentAccountPage, 25);
  
  if (paginated.data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="empty-state"><i class="fas fa-inbox"></i><h3>No accounts found</h3></div></td></tr>';
    paginationContainer.innerHTML = '';
    return;
  }
  
  let html = '';
  paginated.data.forEach(account => {
    const owner = CRMData.team.find(m => m.id === account.owner);
    const accountDeals = CRMData.deals.filter(d => d.accountId === account.id).length;
    
    html += `
      <tr>
        <td><strong>${account.companyName}</strong></td>
        <td>${account.POC}</td>
        <td>${account.region}</td>
        <td>${account.industry}</td>
         <td>${account.employeeCount}</td>
        <td>${formatCurrency(account.annualRevenue)}</td>
        <td>${owner ? `${owner.firstName} ${owner.lastName}` : 'Unassigned'}</td>
        <td>${accountDeals}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn" onclick="showAccountDetails('${account.id}')" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="action-btn" onclick="showEditAccountModal('${account.id}')" title="Edit"><i class="fas fa-pencil"></i></button>
            <button class="action-btn danger" onclick="deleteAccountConfirm('${account.id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
  renderPagination('accountsPagination', paginated.totalPages, paginated.currentPage, 'changeAccountPage');
}

function changeAccountPage(page) {
  currentAccountPage = page;
  filterAccounts();
}

function showAddAccountModal() {
  const content = `
    <form id="accountForm" class="form-grid">
      <div class="form-group">
        <label class="form-label">Company Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="companyName" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">POC <span class="required">*</span></label>
        <input type="text" class="form-input" name="POC" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Region <span class="required">*</span></label>
        <select class="form-select" name="region" required>
          <option value="">Select Region</option>
          <option value="North America">North America</option>
          <option value="South America">South America</option>
          <option value="Europe">Europe</option>
          <option value="Asia">Asia</option>
          <option value="Africa">Africa</option>
          <option value="Oceania">Oceania</option>
        </select>
        <div class="form-error"></div>
      </div>
      

      <div class="form-group">
        <label class="form-label">Industry <span class="required">*</span></label>
        <select class="form-select" name="industry" required>
          <option value="">Select Industry</option>
          <option value="Technology">Technology</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Finance">Finance</option>
          <option value="Retail">Retail</option>
          <option value="Manufacturing">Manufacturing</option>
          <option value="Real Estate">Real Estate</option>
          <option value="Education">Education</option>
        </select>
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Employee Count</label>
        <input type="number" class="form-input" name="employeeCount" min="0" />
      </div>
      
      <div class="form-group">
        <label class="form-label">Annual Revenue</label>
        <input type="number" class="form-input" name="annualRevenue" min="0" step="1000" />
      </div>
      
      
      <div class="form-group">
        <label class="form-label">Owner <span class="required">*</span></label>
        <select class="form-select" name="owner" required>
          <option value="">Select Owner</option>
          ${CRMData.team.map(m => `<option value="${m.id}">${m.firstName} ${m.lastName}</option>`).join('')}
        </select>
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Total Leads</label>
        <input type="number" class="form-input" name="annualRevenue" min="0" step="1000" />
      </div>

    </form>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="handleAddAccount()">Add Account</button>
    </div>
  `;
  
  showModal(content, 'Add New Account');
}

function handleAddAccount() {
  if (!validateForm('accountForm')) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  const formData = getFormData('accountForm');
  const accountData = {
    ...formData,
    annualRevenue: parseFloat(formData.annualRevenue) || 0,
    employeeCount: parseInt(formData.employeeCount) || 0
  };
  
  createAccount(accountData);
  closeModal();
  showToast('Account added successfully!', 'success');
  renderAccounts();
}

function showEditAccountModal(accountId) {
  const account = getAccount(accountId);
  if (!account) return;
  
  const content = `
    <form id="editAccountForm" class="form-grid">
      <input type="hidden" name="id" value="${account.id}" />
      
      <div class="form-group">
        <label class="form-label">Company Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="companyName" value="${account.companyName}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Industry <span class="required">*</span></label>
        <select class="form-select" name="industry" required>
          <option value="Technology" ${account.industry === 'Technology' ? 'selected' : ''}>Technology</option>
          <option value="Healthcare" ${account.industry === 'Healthcare' ? 'selected' : ''}>Healthcare</option>
          <option value="Finance" ${account.industry === 'Finance' ? 'selected' : ''}>Finance</option>
          <option value="Retail" ${account.industry === 'Retail' ? 'selected' : ''}>Retail</option>
          <option value="Manufacturing" ${account.industry === 'Manufacturing' ? 'selected' : ''}>Manufacturing</option>
          <option value="Real Estate" ${account.industry === 'Real Estate' ? 'selected' : ''}>Real Estate</option>
          <option value="Education" ${account.industry === 'Education' ? 'selected' : ''}>Education</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Annual Revenue</label>
        <input type="number" class="form-input" name="annualRevenue" value="${account.annualRevenue}" />
      </div>
      
      <div class="form-group">
        <label class="form-label">Employee Count</label>
        <input type="number" class="form-input" name="employeeCount" value="${account.employeeCount}" />
      </div>
    </form>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="handleUpdateAccount()">Update Account</button>
    </div>
  `;
  
  showModal(content, 'Edit Account');
}

function handleUpdateAccount() {
  if (!validateForm('editAccountForm')) return;
  
  const formData = getFormData('editAccountForm');
  const updates = {
    ...formData,
    annualRevenue: parseFloat(formData.annualRevenue) || 0,
    employeeCount: parseInt(formData.employeeCount) || 0
  };
  
  updateAccount(formData.id, updates);
  closeModal();
  showToast('Account updated successfully!', 'success');
  renderAccounts();
}

function deleteAccountConfirm(accountId) {
  const account = getAccount(accountId);
  const relatedContacts = CRMData.contacts.filter(c => c.accountId === accountId).length;
  const relatedDeals = CRMData.deals.filter(d => d.accountId === accountId).length;
  
  const warning = (relatedContacts > 0 || relatedDeals > 0) 
    ? `<p style="color: var(--warning); margin-bottom: 10px;">Warning: This account has ${relatedContacts} linked contacts and ${relatedDeals} linked deals.</p>` 
    : '';
  
  confirmDialog(`${warning}Are you sure you want to delete the account "${account.companyName}"? This action cannot be undone.`, () => {
    deleteAccount(accountId);
    showToast('Account deleted successfully', 'success');
    renderAccounts();
  });
}

function showAccountDetails(accountId) {
  const account = getAccount(accountId);
  if (!account) return;
  
  const owner = CRMData.team.find(m => m.id === account.owner);
  const accountContacts = CRMData.contacts.filter(c => c.accountId === accountId);
  const accountDeals = CRMData.deals.filter(d => d.accountId === accountId);
  
  const content = `
    <div style="padding: 10px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div>
          <label style="font-size: 12px; color: var(--text-secondary);">Company Name</label>
          <p style="font-weight: 600; margin: 5px 0 15px;">${account.companyName}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Industry</label>
          <p style="margin: 5px 0 15px;">${account.industry}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Region</label>
          <p style="margin: 5px 0 15px;">${account.region}</p>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-secondary);">Annual Revenue</label>
          <p style="font-weight: 600; color: var(--success); margin: 5px 0 15px;">${formatCurrency(account.annualRevenue)}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Employees</label>
          <p style="margin: 5px 0 15px;">${account.employeeCount}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Owner</label>
          <p style="margin: 5px 0 15px;">${owner ? `${owner.firstName} ${owner.lastName}` : 'Unassigned'}</p>
        </div>
      </div>
      
      <div style="border-top: 1px solid var(--border-color); padding-top: 15px; margin-top: 15px;">
        <h4 style="margin-bottom: 10px;">Key Contacts (${accountContacts.length})</h4>
        ${accountContacts.length > 0 ? accountContacts.slice(0, 5).map(contact => `
          <div style="padding: 10px; background: var(--background); border-radius: 6px; margin-bottom: 8px;">
            <strong>${contact.firstName} ${contact.lastName}</strong> - ${contact.jobTitle}<br>
            <span style="font-size: 12px; color: var(--text-secondary);">${contact.email}</span>
          </div>
        `).join('') : '<p style="color: var(--text-secondary);">No contacts</p>'}
      </div>
      
      <div style="border-top: 1px solid var(--border-color); padding-top: 15px; margin-top: 15px;">
        <h4 style="margin-bottom: 10px;">Deals (${accountDeals.length})</h4>
        ${accountDeals.length > 0 ? accountDeals.slice(0, 5).map(deal => `
          <div style="padding: 10px; background: var(--background); border-radius: 6px; margin-bottom: 8px;">
            <strong>${deal.dealName}</strong> - ${formatCurrency(deal.value)}
            <span class="badge badge-${deal.stage.toLowerCase().replace(' ', '-')}" style="margin-left: 10px;">${deal.stage}</span>
          </div>
        `).join('') : '<p style="color: var(--text-secondary);">No deals</p>'}
      </div>
    </div>
  `;
  
  showSideDrawer(content, 'Account Details');
}
