// ===========================================
// GLOBENTIX CRM - LEADS MODULE
// ===========================================

let currentLeadFilters = { type: '' };
let currentLeadPage = 1;

function renderLeads() {
  const container = document.getElementById('contentContainer');
  
  const html = `
    <div class="table-container">
      <div class="table-controls">
        <div class="table-filters">
          <select class="filter-select" id="leadTypeFilter" onchange="filterLeads()">
            <option value="">All Leads</option>
            <option value="show">Show Leads</option>
            <option value="industry">Industry Leads</option>
          </select>
          <select class="filter-select" id="leadStageFilter" onchange="filterLeads()">
            <option value="">All Stages</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Unqualified">Unqualified</option>
            <option value="Converted">Converted</option>
          </select>
          <select class="filter-select" id="leadSourceFilter" onchange="filterLeads()">
            <option value="">All Sources</option>
            <option value="Email">Email</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Website">Website</option>
            <option value="Events">Events</option>
            <option value="Referral">Referral</option>
          </select>
          <input type="text" class="filter-input" placeholder="Search leads..." id="leadSearchInput" oninput="filterLeads()" />
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary" onclick="showAddLeadModal()"><i class="fas fa-plus"></i> Add Lead</button>
          </button>
        </div>
      </div>
      
      <table id="leadsTable">
        <thead>
          <tr>
            <th onclick="sortTable('leadsTable', 0)">Name <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('leadsTable', 1)">Company <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('leadsTable', 2)">Email <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('leadsTable', 3)">Phone <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('leadsTable', 4)">Source <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('leadsTable', 5)">Stage <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('leadsTable', 6)">LeadGen<i class="fas fa-sort"></i></th>
            <th onclick="sortTable('leadsTable', 7)">Show Name <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('leadsTable', 8)">Score <i class="fas fa-sort"></i></th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="leadsTableBody"></tbody>
      </table>
      
      <div id="leadsPagination"></div>
    </div>
  `;
  
  container.innerHTML = html;
  filterLeads();
}

function filterLeads() {
  const typeFilter = document.getElementById('leadTypeFilter')?.value || '';
  const stageFilter = document.getElementById('leadStageFilter')?.value || '';
  const sourceFilter = document.getElementById('leadSourceFilter')?.value || '';
  const searchQuery = document.getElementById('leadSearchInput')?.value.toLowerCase() || '';
  
  let leads = getLeads();
  
  if (typeFilter) leads = leads.filter(l => l.type === typeFilter);
  if (stageFilter) leads = leads.filter(l => l.stage === stageFilter);
  if (sourceFilter) leads = leads.filter(l => l.leadSource === sourceFilter);
  if (searchQuery) {
    leads = leads.filter(l => 
      l.contactName.toLowerCase().includes(searchQuery) ||
      l.companyName.toLowerCase().includes(searchQuery) ||
      l.clientEmail.toLowerCase().includes(searchQuery)
    );
  }
  
  displayLeads(leads);
}

function displayLeads(leads) {
  const tbody = document.getElementById('leadsTableBody');
  const paginationContainer = document.getElementById('leadsPagination');
  
  if (!tbody) return;
  
  const paginated = paginateData(leads, currentLeadPage, 25);
  
  if (paginated.data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center"><div class="empty-state"><i class="fas fa-inbox"></i><h3>No leads found</h3></div></td></tr>';
    paginationContainer.innerHTML = '';
    return;
  }
  
  let html = '';
  paginated.data.forEach(lead => {
    html += `
      <tr>
        <td><strong>${lead.contactName}</strong></td>
        <td>${lead.companyName}</td>
        <td>${lead.clientEmail}</td>
        <td>${lead.phone}</td>
        <td><span class="badge badge-${lead.leadSource.toLowerCase()}">${lead.leadSource}</span></td>
        <td><span class="badge badge-${lead.stage.toLowerCase().replace(' ', '-')}">${lead.stage}</span></td>
        <td>${lead.assignedToName || 'Unassigned'}</td>
        <td>${lead.createdByName || 'N/A'}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 5px;">
            <div style="width: 50px; height: 6px; background: #E0E0E0; border-radius: 3px; overflow: hidden;">
              <div style="width: ${lead.score}%; height: 100%; background: ${lead.score > 70 ? 'var(--success)' : lead.score > 40 ? 'var(--warning)' : 'var(--error)'};">
              </div>
            </div>
            <span style="font-size: 11px; color: var(--text-secondary);">${lead.score}</span>
          </div>
        </td>
        <td>
          <div class="table-actions">
            <button class="action-btn" onclick="showLeadDetails('${lead.id}')" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="action-btn" onclick="showEditLeadModal('${lead.id}')" title="Edit"><i class="fas fa-pencil"></i></button>
            <button class="action-btn" onclick="convertLeadToDeal('${lead.id}')" title="Convert to Deal"><i class="fas fa-arrow-right"></i></button>
            <button class="action-btn danger" onclick="deleteLeadConfirm('${lead.id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
  renderPagination('leadsPagination', paginated.totalPages, paginated.currentPage, 'changeLeadPage');
}

function changeLeadPage(page) {
  currentLeadPage = page;
  filterLeads();
}

function showAddLeadModal() {
  const content = `
    <form id="leadForm" class="form-grid">
      <div class="form-group">
        <label class="form-label">Lead Type <span class="required">*</span></label>
        <select class="form-select" name="type" required onchange="toggleLeadFormFields()" id="leadTypeSelect">
          <option value="">Select Type</option>
          <option value="industry">Industry Lead</option>
          <option value="show">Show Lead</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Contact Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="contactName" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Client Email <span class="required">*</span></label>
        <input type="email" class="form-input" name="clientEmail" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Job Title</label>
        <input type="text" class="form-input" name="jobTitle" />
      </div>
      
      <div class="form-group">
        <label class="form-label">Company Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="companyName" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Company Website</label>
        <input type="url" class="form-input" name="companyWebsite" />
      </div>
      
      <div class="form-group">
        <label class="form-label">Country <span class="required">*</span></label>
        <select class="form-select" name="country" required>
          <option value="">Select Country</option>
          <option value="USA">USA</option>
          <option value="UK">UK</option>
          <option value="Canada">Canada</option>
          <option value="Germany">Germany</option>
          <option value="India">India</option>
          <option value="Australia">Australia</option>
          <option value="Singapore">Singapore</option>
          <option value="UAE">UAE</option>
        </select>
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Phone <span class="required">*</span></label>
        <input type="tel" class="form-input" name="phone" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Lead Source <span class="required">*</span></label>
        <select class="form-select" name="leadSource" required>
          <option value="">Select Source</option>
          <option value="Email">Email</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Website">Website</option>
          <option value="Events">Events</option>
          <option value="Referral">Referral</option>
        </select>
        <div class="form-error"></div>
      </div>
      
    
      
      <div id="showLeadFields" class="hidden" style="grid-column: 1 / -1;">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Show Name <span class="required">*</span></label>
            <input type="text" class="form-input" name="showName" />
          </div>
          <div class="form-group">
            <label class="form-label">Show Website</label>
            <input type="url" class="form-input" name="showWebsite" />
          </div>
          <div class="form-group">
            <label class="form-label">Show Date</label>
            <input type="date" class="form-input" name="showDate" />
          </div>
          <div class="form-group">
            <label class="form-label">Attendee Count</label>
            <input type="number" class="form-input" name="attendeeCount" />
          </div>
        </div>
      </div>
      
      <div class="form-group" style="grid-column: 1 / -1;">
        <label class="form-label">Email Message</label>
        <textarea class="form-textarea" name="emailMessage"></textarea>
      </div>
      
      <div class="form-group" style="grid-column: 1 / -1;">
        <label class="form-label">Key Points</label>
        <textarea class="form-textarea" name="keyPoints"></textarea>
      </div>
    </form>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="handleAddLead()">Add Lead</button>
    </div>
  `;
  
  showModal(content, 'Add New Lead');
}

function toggleLeadFormFields() {
  const typeSelect = document.getElementById('leadTypeSelect');
  const showFields = document.getElementById('showLeadFields');
  
  if (typeSelect && showFields) {
    if (typeSelect.value === 'show') {
      showFields.classList.remove('hidden');
      showFields.querySelectorAll('input').forEach(input => {
        if (input.name === 'showName') input.required = true;
      });
    } else {
      showFields.classList.add('hidden');
      showFields.querySelectorAll('input').forEach(input => input.required = false);
    }
  }
}

function handleAddLead() {
  if (!validateForm('leadForm')) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  const formData = getFormData('leadForm');
  const assignedMember = CRMData.team.find(m => m.id === formData.assignedTo);
  
  const leadData = {
    ...formData,
    assignedToName: assignedMember ? `${assignedMember.firstName} ${assignedMember.lastName}` : 'Unassigned',
    createdBy: CRMData.currentUser.id,
    createdByName: `${CRMData.currentUser.firstName} ${CRMData.currentUser.lastName}`,
    lastContacted: new Date().toISOString(),
    score: Math.floor(Math.random() * 100)
  };
  
  createLead(leadData);
  closeModal();
  showToast('Lead added successfully!', 'success');
  renderLeads();
}

function showEditLeadModal(leadId) {
  const lead = getLead(leadId);
  if (!lead) return;
  
  const content = `
    <form id="editLeadForm" class="form-grid">
      <input type="hidden" name="id" value="${lead.id}" />
      <input type="hidden" name="type" value="${lead.type}" />
      
      <div class="form-group">
        <label class="form-label">Contact Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="contactName" value="${lead.contactName}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Client Email <span class="required">*</span></label>
        <input type="email" class="form-input" name="clientEmail" value="${lead.clientEmail}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Company Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="companyName" value="${lead.companyName}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Phone <span class="required">*</span></label>
        <input type="tel" class="form-input" name="phone" value="${lead.phone}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Stage</label>
        <select class="form-select" name="stage">
          <option value="New" ${lead.stage === 'New' ? 'selected' : ''}>New</option>
          <option value="Contacted" ${lead.stage === 'Contacted' ? 'selected' : ''}>Contacted</option>
          <option value="Qualified" ${lead.stage === 'Qualified' ? 'selected' : ''}>Qualified</option>
          <option value="Unqualified" ${lead.stage === 'Unqualified' ? 'selected' : ''}>Unqualified</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Assigned To</label>
        <select class="form-select" name="assignedTo">
          ${CRMData.team.map(m => `<option value="${m.id}" ${m.id === lead.assignedTo ? 'selected' : ''}>${m.firstName} ${m.lastName}</option>`).join('')}
        </select>
      </div>
    </form>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="handleUpdateLead()">Update Lead</button>
    </div>
  `;
  
  showModal(content, 'Edit Lead');
}

function handleUpdateLead() {
  if (!validateForm('editLeadForm')) return;
  
  const formData = getFormData('editLeadForm');
  const assignedMember = CRMData.team.find(m => m.id === formData.assignedTo);
  
  const updates = {
    ...formData,
    assignedToName: assignedMember ? `${assignedMember.firstName} ${assignedMember.lastName}` : 'Unassigned'
  };
  
  updateLead(formData.id, updates);
  closeModal();
  showToast('Lead updated successfully!', 'success');
  renderLeads();
}

function deleteLeadConfirm(leadId) {
  const lead = getLead(leadId);
  confirmDialog(`Are you sure you want to delete the lead "${lead.contactName}"? This action cannot be undone.`, () => {
    deleteLead(leadId);
    showToast('Lead deleted successfully', 'success');
    renderLeads();
  });
}

function convertLeadToDeal(leadId) {
  const lead = getLead(leadId);
  if (!lead) return;
  
  const dealData = {
    dealName: `${lead.companyName} - New Opportunity`,
    company: lead.companyName,
    contactName: lead.contactName,
    value: 50000,
    stage: 'Prospecting',
    probability: 10,
    expectedCloseDate: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
    owner: lead.assignedTo,
    ownerName: lead.assignedToName,
    description: `Converted from lead: ${lead.contactName}`,
    notes: lead.keyPoints || ''
  };
  
  createDeal(dealData);
  updateLead(leadId, { stage: 'Converted' });
  showToast('Lead converted to deal successfully!', 'success');
  renderLeads();
}

function showLeadDetails(leadId) {
  const lead = getLead(leadId);
  if (!lead) return;
  
  const content = `
    <div style="padding: 10px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div>
          <label style="font-size: 12px; color: var(--text-secondary);">Contact Name</label>
          <p style="font-weight: 600; margin: 5px 0 15px;">${lead.contactName}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Email</label>
          <p style="margin: 5px 0 15px;">${lead.clientEmail}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Company</label>
          <p style="margin: 5px 0 15px;">${lead.companyName}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Lead Type</label>
          <p style="margin: 5px 0 15px;"><span class="badge badge-${lead.type}">${lead.type.toUpperCase()}</span></p>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-secondary);">Phone</label>
          <p style="margin: 5px 0 15px;">${lead.phone}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Stage</label>
          <p style="margin: 5px 0 15px;"><span class="badge badge-${lead.stage.toLowerCase()}">${lead.stage}</span></p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Assigned To</label>
          <p style="margin: 5px 0 15px;">${lead.assignedToName}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Created By</label>
          <p style="margin: 5px 0 15px;">${lead.createdByName}</p>
        </div>
      </div>
      
      ${lead.keyPoints ? `
        <div style="margin-bottom: 20px;">
          <label style="font-size: 12px; color: var(--text-secondary);">Key Points</label>
          <p style="margin: 5px 0;">${lead.keyPoints}</p>
        </div>
      ` : ''}
      
      ${lead.emailMessage ? `
        <div style="margin-bottom: 20px;">
          <label style="font-size: 12px; color: var(--text-secondary);">Email Message</label>
          <p style="margin: 5px 0;">${lead.emailMessage}</p>
        </div>
      ` : ''}
      
      ${lead.type === 'show' ? `
        <div style="border-top: 1px solid var(--border-color); padding-top: 15px;">
          <h4 style="margin-bottom: 10px;">Show Information</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <label style="font-size: 12px; color: var(--text-secondary);">Show Name</label>
              <p style="margin: 5px 0;">${lead.showName || 'N/A'}</p>
            </div>
            <div>
              <label style="font-size: 12px; color: var(--text-secondary);">Show Date</label>
              <p style="margin: 5px 0;">${formatDate(lead.showDate)}</p>
            </div>
            <div>
              <label style="font-size: 12px; color: var(--text-secondary);">Attendee Count</label>
              <p style="margin: 5px 0;">${lead.attendeeCount || 'N/A'}</p>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  showSideDrawer(content, 'Lead Details');
}
