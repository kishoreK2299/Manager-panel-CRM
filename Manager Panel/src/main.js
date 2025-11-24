// ===========================================
// GLOBENTIX CRM - MAIN APPLICATION LOGIC
// ===========================================

// ===== UTILITY FUNCTIONS =====

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('en-US', options);
}

function formatCurrency(amount) {
  if (typeof amount !== 'number') return '$0';
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatRelativeTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(dateString);
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  toast.innerHTML = `
    <i class="fas ${icons[type]} toast-icon"></i>
    <span class="toast-message">${message}</span>
    <i class="fas fa-times toast-close"></i>
  `;
  
  container.appendChild(toast);
  
  // Auto dismiss after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
  
  // Manual close
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  });
}

function showModal(content, title = '') {
  const overlay = document.getElementById('modalOverlay');
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">${title}</h2>
      <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body">${content}</div>
  `;
  
  overlay.innerHTML = '';
  overlay.appendChild(modal);
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });
  
  // Escape key to close
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  });
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
  setTimeout(() => overlay.innerHTML = '', 300);
}

function showSideDrawer(content, title = '') {
  const drawer = document.getElementById('sideDrawer');
  drawer.innerHTML = `
    <div class="drawer-header">
      <h2 class="drawer-title">${title}</h2>
      <button class="modal-close" onclick="closeSideDrawer()"><i class="fas fa-times"></i></button>
    </div>
    <div class="drawer-body">${content}</div>
  `;
  drawer.classList.add('active');
  drawer.setAttribute('aria-hidden', 'false');
}

function closeSideDrawer() {
  const drawer = document.getElementById('sideDrawer');
  drawer.classList.remove('active');
  drawer.setAttribute('aria-hidden', 'true');
  setTimeout(() => drawer.innerHTML = '', 300);
}

function confirmDialog(message, onConfirm) {
  const content = `
    <p style="margin-bottom: 20px; font-size: 16px;">${message}</p>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" id="confirmBtn">Delete</button>
    </div>
  `;
  
  showModal(content, 'Confirm Action');
  
  document.getElementById('confirmBtn').addEventListener('click', () => {
    onConfirm();
    closeModal();
  });
}

function sortTable(tableId, columnIndex, dataKey) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  // Determine sort direction
  const currentSort = table.dataset.sortColumn;
  const currentDir = table.dataset.sortDir || 'asc';
  const newDir = (currentSort === String(columnIndex) && currentDir === 'asc') ? 'desc' : 'asc';
  
  rows.sort((a, b) => {
    const aVal = a.cells[columnIndex].textContent.trim();
    const bVal = b.cells[columnIndex].textContent.trim();
    
    // Try numeric comparison
    const aNum = parseFloat(aVal.replace(/[^0-9.-]/g, ''));
    const bNum = parseFloat(bVal.replace(/[^0-9.-]/g, ''));
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return newDir === 'asc' ? aNum - bNum : bNum - aNum;
    }
    
    // String comparison
    return newDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });
  
  // Re-append sorted rows
  rows.forEach(row => tbody.appendChild(row));
  
  // Update sort indicators
  table.querySelectorAll('th i').forEach(i => i.className = 'fas fa-sort');
  const th = table.querySelectorAll('th')[columnIndex];
  th.querySelector('i').className = `fas fa-sort-${newDir === 'asc' ? 'up' : 'down'}`;
  
  table.dataset.sortColumn = columnIndex;
  table.dataset.sortDir = newDir;
}

function getFormData(formId) {
  const form = document.getElementById(formId);
  if (!form) return {};
  
  const formData = {};
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    if (input.type === 'checkbox') {
      formData[input.name] = input.checked;
    } else if (input.type === 'file') {
      formData[input.name] = input.files[0] ? input.files[0].name : '';
    } else {
      formData[input.name] = input.value;
    }
  });
  
  return formData;
}

function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;
  
  let isValid = true;
  const requiredInputs = form.querySelectorAll('[required]');
  
  requiredInputs.forEach(input => {
    const errorEl = input.parentElement.querySelector('.form-error');
    
    if (!input.value.trim()) {
      isValid = false;
      input.style.borderColor = 'var(--error)';
      if (errorEl) {
        errorEl.textContent = 'This field is required';
        errorEl.classList.add('active');
      }
    } else {
      input.style.borderColor = 'var(--border-color)';
      if (errorEl) {
        errorEl.classList.remove('active');
      }
    }
  });
  
  // Email validation
  const emailInputs = form.querySelectorAll('[type="email"]');
  emailInputs.forEach(input => {
    if (input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      isValid = false;
      input.style.borderColor = 'var(--error)';
      const errorEl = input.parentElement.querySelector('.form-error');
      if (errorEl) {
        errorEl.textContent = 'Please enter a valid email address';
        errorEl.classList.add('active');
      }
    }
  });
  
  return isValid;
}

function paginateData(data, page = 1, perPage = 25) {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return {
    data: data.slice(start, end),
    totalPages: Math.ceil(data.length / perPage),
    currentPage: page,
    total: data.length,
    perPage: perPage
  };
}

function renderPagination(containerId, totalPages, currentPage, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  let html = '<div class="pagination">';
  html += `<div class="pagination-info">Page ${currentPage} of ${totalPages}</div>`;
  html += '<div class="pagination-controls">';
  
  // Previous button
  html += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="${onPageChange}(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
  
  // Page numbers
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="${onPageChange}(${i})">${i}</button>`;
  }
  
  // Next button
  html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="${onPageChange}(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
  
  html += '</div></div>';
  container.innerHTML = html;
}

// ===== GLOBAL FEATURES =====

function setupGlobalSearch() {
  const searchInput = document.getElementById('globalSearch');
  const searchResults = document.getElementById('searchResults');
  
  if (!searchInput) return;
  
  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      searchResults.classList.remove('active');
      return;
    }
    
    searchTimeout = setTimeout(() => {
      const results = globalSearch(query);
      displaySearchResults(results);
    }, 300);
  });
  
  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('active');
    }
  });
}

function displaySearchResults(results) {
  const searchResults = document.getElementById('searchResults');
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
    searchResults.classList.add('active');
    return;
  }
  
  let html = '';
  results.forEach(result => {
    html += `
      <div class="search-result-item" onclick="navigateToEntity('${result.type.toLowerCase()}', '${result.id}')">
        <i class="fas ${result.icon}"></i>
        <div class="search-result-content">
          <div class="search-result-title">${result.title}</div>
          <div class="search-result-meta">${result.type} - ${result.subtitle}</div>
        </div>
      </div>
    `;
  });
  
  searchResults.innerHTML = html;
  searchResults.classList.add('active');
}

function navigateToEntity(type, id) {
  document.getElementById('searchResults').classList.remove('active');
  document.getElementById('globalSearch').value = '';
  
  // Navigate to appropriate page
  window.location.hash = type === 'lead' ? 'leads' : type === 'deal' ? 'deals' : type === 'contact' ? 'contacts' : 'accounts';
  
  // Show entity details after navigation
  setTimeout(() => {
    if (type === 'lead') showLeadDetails(id);
    else if (type === 'deal') showDealDetails(id);
    else if (type === 'contact') showContactDetails(id);
    else if (type === 'account') showAccountDetails(id);
  }, 100);
}

function setupNotifications() {
  const bell = document.getElementById('notificationBell');
  const panel = document.getElementById('notificationPanel');
  const badge = document.getElementById('notificationBadge');
  
  if (!bell) return;
  
  // Update badge count
  function updateBadge() {
    const unread = getNotifications(true);
    badge.textContent = unread.length;
    badge.style.display = unread.length > 0 ? 'flex' : 'none';
  }
  
  updateBadge();
  
  bell.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('active');
    bell.setAttribute('aria-expanded', panel.classList.contains('active'));
    renderNotifications();
  });
  
  document.addEventListener('click', (e) => {
    if (!bell.contains(e.target) && !panel.contains(e.target)) {
      panel.classList.remove('active');
      bell.setAttribute('aria-expanded', 'false');
    }
  });
}

function renderNotifications() {
  const panel = document.getElementById('notificationPanel');
  const notifications = getNotifications().slice(0, 15);
  
  let html = `
    <div class="notification-header">
      <h3>Notifications</h3>
      <button class="btn-sm btn-secondary" onclick="handleMarkAllAsRead()">Mark all as read</button>
    </div>
    <div class="notification-list">
  `;
  
  if (notifications.length === 0) {
    html += '<div class="notification-item">No notifications</div>';
  } else {
    notifications.forEach(notif => {
      html += `
        <div class="notification-item ${notif.read ? '' : 'unread'}" onclick="handleNotificationClick('${notif.id}')">
          <div class="notification-text">${notif.message}</div>
          <div class="notification-time">${formatRelativeTime(notif.timestamp)}</div>
        </div>
      `;
    });
  }
  
  html += '</div>';
  panel.innerHTML = html;
}

function handleNotificationClick(id) {
  markNotificationAsRead(id);
  setupNotifications(); // Refresh badge
}

function handleMarkAllAsRead() {
  markAllNotificationsAsRead();
  renderNotifications();
  setupNotifications(); // Refresh badge
}

function setupUserProfile() {
  const profile = document.getElementById('userProfile');
  const dropdown = document.getElementById('userDropdown');
  
  if (!profile) return;
  
  profile.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
    profile.setAttribute('aria-expanded', dropdown.classList.contains('active'));
  });
  
  document.addEventListener('click', (e) => {
    if (!profile.contains(e.target)) {
      dropdown.classList.remove('active');
      profile.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Logout handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Logged out successfully', 'success');
      setTimeout(() => {
        window.location.hash = 'dashboard';
      }, 1000);
    });
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  setupGlobalSearch();
  setupNotifications();
  setupUserProfile();
  
  // Initialize navigation
  if (typeof setupNavigation === 'function') {
    setupNavigation();
  }
  
  console.log('%cGlobentix CRM Initialized', 'color: #1E88E5; font-size: 16px; font-weight: bold;');
  console.log('Data loaded:', {
    leads: CRMData.leads.length,
    deals: CRMData.deals.length,
    contacts: CRMData.contacts.length,
    accounts: CRMData.accounts.length,
    tasks: CRMData.tasks.length,
    team: CRMData.team.length
  });
});
