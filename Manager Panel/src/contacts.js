// ===========================================
// GLOBENTIX CRM - CONTACTS MODULE
// ===========================================

let currentContactPage = 1;

function renderContacts() {
  const container = document.getElementById('contentContainer');
  
  const html = `
    <div class="table-container">
      <div class="table-controls">
        <div class="table-filters">
          <select class="filter-select" id="contactRelationshipFilter" onchange="filterContacts()">
            <option value="">All Relationships</option>
            <option value="Lead">Lead</option>
            <option value="Client">Client</option>
            <option value="Partner">Partner</option>
          </select>
          <select class="filter-select" id="contactIndustryFilter" onchange="filterContacts()">
            <option value="">All Industries</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Retail">Retail</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Education">Education</option>
          </select>
          <input type="text" class="filter-input" placeholder="Search contacts..." id="contactSearchInput" oninput="filterContacts()" />
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary" onclick="showAddContactModal()"><i class="fas fa-plus"></i> Add Contact</button>
          
        </div>
      </div>
      
      <table id="contactsTable">
        <thead>
          <tr>
            <th onclick="sortTable('contactsTable', 0)">Name <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('contactsTable', 1)">Company <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('contactsTable', 2)">Title <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('contactsTable', 3)">Email <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('contactsTable', 4)">Phone <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('contactsTable', 5)">Relationship <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('contactsTable', 6)">Industry <i class="fas fa-sort"></i></th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="contactsTableBody"></tbody>
      </table>
      
      <div id="contactsPagination"></div>
    </div>
  `;
  
  container.innerHTML = html;
  filterContacts();
}

function filterContacts() {
  const relationshipFilter = document.getElementById('contactRelationshipFilter')?.value || '';
  const industryFilter = document.getElementById('contactIndustryFilter')?.value || '';
  const searchQuery = document.getElementById('contactSearchInput')?.value.toLowerCase() || '';
  
  let contacts = getContacts();
  
  if (relationshipFilter) contacts = contacts.filter(c => c.relationshipType === relationshipFilter);
  if (industryFilter) contacts = contacts.filter(c => c.industry === industryFilter);
  if (searchQuery) {
    contacts = contacts.filter(c => 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery) ||
      c.company.toLowerCase().includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery)
    );
  }
  
  displayContacts(contacts);
}

function displayContacts(contacts) {
  const tbody = document.getElementById('contactsTableBody');
  const paginationContainer = document.getElementById('contactsPagination');
  
  if (!tbody) return;
  
  const paginated = paginateData(contacts, currentContactPage, 25);
  
  if (paginated.data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="empty-state"><i class="fas fa-inbox"></i><h3>No contacts found</h3></div></td></tr>';
    paginationContainer.innerHTML = '';
    return;
  }
  
  let html = '';
  paginated.data.forEach(contact => {
    html += `
      <tr>
        <td><strong>${contact.firstName} ${contact.lastName}</strong></td>
        <td>${contact.company}</td>
        <td>${contact.jobTitle}</td>
        <td>${contact.email}</td>
        <td>${contact.phone}</td>
        <td><span class="badge badge-${contact.relationshipType.toLowerCase()}">${contact.relationshipType}</span></td>
        <td>${contact.industry}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn" onclick="showContactDetails('${contact.id}')" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="action-btn" onclick="showEditContactModal('${contact.id}')" title="Edit"><i class="fas fa-pencil"></i></button>
            <button class="action-btn danger" onclick="deleteContactConfirm('${contact.id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
  renderPagination('contactsPagination', paginated.totalPages, paginated.currentPage, 'changeContactPage');
}

function changeContactPage(page) {
  currentContactPage = page;
  filterContacts();
}

function showAddContactModal() {
  const content = `
    <form id="contactForm" class="form-grid">
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
        <label class="form-label">Company</label>
        <input type="text" class="form-input" name="company" />
      </div>
      
      <div class="form-group">
        <label class="form-label">Job Title</label>
        <input type="text" class="form-input" name="jobTitle" />
      </div>
      
      <div class="form-group">
        <label class="form-label">Email <span class="required">*</span></label>
        <input type="email" class="form-input" name="email" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Phone <span class="required">*</span></label>
        <input type="tel" class="form-input" name="phone" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Relationship Type <span class="required">*</span></label>
        <select class="form-select" name="relationshipType" required>
          <option value="">Select Type</option>
          <option value="Lead">Lead</option>
          <option value="Client">Client</option>
          <option value="Partner">Partner</option>
        </select>
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Industry</label>
        <select class="form-select" name="industry">
          <option value="">Select Industry</option>
          <option value="Technology">Technology</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Finance">Finance</option>
          <option value="Retail">Retail</option>
          <option value="Manufacturing">Manufacturing</option>
          <option value="Real Estate">Real Estate</option>
          <option value="Education">Education</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Country</label>
        <select class="form-select" name="country">
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
      </div>
      
      <div class="form-group">
        <label class="form-label">Address</label>
        <input type="text" class="form-input" name="address" />
      </div>
      
      <div class="form-group">
        <label class="form-label">LinkedIn Profile</label>
        <input type="url" class="form-input" name="linkedinProfile" />
      </div>
      
      <div class="form-group" style="grid-column: 1 / -1;">
        <label class="form-label">Notes</label>
        <textarea class="form-textarea" name="notes"></textarea>
      </div>
    </form>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="handleAddContact()">Add Contact</button>
    </div>
  `;
  
  showModal(content, 'Add New Contact');
}

function handleAddContact() {
  if (!validateForm('contactForm')) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  const formData = getFormData('contactForm');
  createContact(formData);
  closeModal();
  showToast('Contact added successfully!', 'success');
  renderContacts();
}

function showEditContactModal(contactId) {
  const contact = getContact(contactId);
  if (!contact) return;
  
  const content = `
    <form id="editContactForm" class="form-grid">
      <input type="hidden" name="id" value="${contact.id}" />
      
      <div class="form-group">
        <label class="form-label">First Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="firstName" value="${contact.firstName}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Last Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="lastName" value="${contact.lastName}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Email <span class="required">*</span></label>
        <input type="email" class="form-input" name="email" value="${contact.email}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Phone <span class="required">*</span></label>
        <input type="tel" class="form-input" name="phone" value="${contact.phone}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Relationship Type</label>
        <select class="form-select" name="relationshipType">
          <option value="Lead" ${contact.relationshipType === 'Lead' ? 'selected' : ''}>Lead</option>
          <option value="Client" ${contact.relationshipType === 'Client' ? 'selected' : ''}>Client</option>
          <option value="Partner" ${contact.relationshipType === 'Partner' ? 'selected' : ''}>Partner</option>
        </select>
      </div>
    </form>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="handleUpdateContact()">Update Contact</button>
    </div>
  `;
  
  showModal(content, 'Edit Contact');
}

function handleUpdateContact() {
  if (!validateForm('editContactForm')) return;
  
  const formData = getFormData('editContactForm');
  updateContact(formData.id, formData);
  closeModal();
  showToast('Contact updated successfully!', 'success');
  renderContacts();
}

function deleteContactConfirm(contactId) {
  const contact = getContact(contactId);
  confirmDialog(`Are you sure you want to delete the contact "${contact.firstName} ${contact.lastName}"? This action cannot be undone.`, () => {
    deleteContact(contactId);
    showToast('Contact deleted successfully', 'success');
    renderContacts();
  });
}

function showContactDetails(contactId) {
  const contact = getContact(contactId);
  if (!contact) return;
  
  const linkedDeals = CRMData.deals.filter(d => d.contactId === contactId);
  const linkedTasks = CRMData.tasks.filter(t => t.relatedTo === `Contact:${contactId}`);
  
  const content = `
    <div style="padding: 10px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div>
          <label style="font-size: 12px; color: var(--text-secondary);">Name</label>
          <p style="font-weight: 600; margin: 5px 0 15px;">${contact.firstName} ${contact.lastName}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Email</label>
          <p style="margin: 5px 0 15px;">${contact.email}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Phone</label>
          <p style="margin: 5px 0 15px;">${contact.phone}</p>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-secondary);">Company</label>
          <p style="margin: 5px 0 15px;">${contact.company}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Job Title</label>
          <p style="margin: 5px 0 15px;">${contact.jobTitle}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Relationship</label>
          <p style="margin: 5px 0 15px;"><span class="badge badge-${contact.relationshipType.toLowerCase()}">${contact.relationshipType}</span></p>
        </div>
      </div>
      
      <div style="border-top: 1px solid var(--border-color); padding-top: 15px; margin-top: 15px;">
        <h4 style="margin-bottom: 10px;">Linked Deals (${linkedDeals.length})</h4>
        ${linkedDeals.length > 0 ? linkedDeals.map(deal => `
          <div style="padding: 10px; background: var(--background); border-radius: 6px; margin-bottom: 8px;">
            <strong>${deal.dealName}</strong> - ${formatCurrency(deal.value)}
            <span class="badge badge-${deal.stage.toLowerCase().replace(' ', '-')}" style="margin-left: 10px;">${deal.stage}</span>
          </div>
        `).join('') : '<p style="color: var(--text-secondary);">No linked deals</p>'}
      </div>
      
      <div style="border-top: 1px solid var(--border-color); padding-top: 15px; margin-top: 15px;">
        <h4 style="margin-bottom: 10px;">Tasks (${linkedTasks.length})</h4>
        ${linkedTasks.length > 0 ? linkedTasks.slice(0, 5).map(task => `
          <div style="padding: 8px; background: var(--background); border-radius: 6px; margin-bottom: 8px;">
            ${task.taskName} - <span class="badge badge-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span>
          </div>
        `).join('') : '<p style="color: var(--text-secondary);">No tasks</p>'}
      </div>
    </div>
  `;
  
  showSideDrawer(content, 'Contact Details');
}
