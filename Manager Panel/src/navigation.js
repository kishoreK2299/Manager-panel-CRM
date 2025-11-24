// ===========================================
// GLOBENTIX CRM - NAVIGATION & ROUTING
// ===========================================

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const contentContainer = document.getElementById('contentContainer');
  const pageTitle = document.getElementById('pageTitle');
  const breadcrumbs = document.getElementById('breadcrumbs');
  
  // Handle navigation clicks
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateTo(page);
    });
  });
  
  // Handle hash changes (browser back/forward)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'dashboard';
    loadPage(hash);
  });
  
  // Load initial page
  const initialPage = window.location.hash.slice(1) || 'dashboard';
  navigateTo(initialPage);
}

function navigateTo(page) {
  window.location.hash = page;
  loadPage(page);
}

function loadPage(page) {
  const contentContainer = document.getElementById('contentContainer');
  const pageTitle = document.getElementById('pageTitle');
  const breadcrumbs = document.getElementById('breadcrumbs');
  
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) {
      item.classList.add('active');
    }
  });
  
  // Update breadcrumbs and title
  const pageNames = {
    'dashboard': 'Dashboard',
    'leads': 'Leads',
    'deals': 'Deals',
    'contacts': 'Contacts',
    'accounts': 'Accounts',
    'tasks': 'Tasks',
    'team': 'Team Management',
    'reports': 'Reports',
    'settings': 'Settings'
  };
  
  const pageName = pageNames[page] || 'Dashboard';
  pageTitle.textContent = pageName;
  breadcrumbs.innerHTML = `Home / <span>${pageName}</span>`;
  
  // Load page content
  contentContainer.innerHTML = '<div class="loader"></div>';
  
  setTimeout(() => {
    switch(page) {
      case 'dashboard':
        if (typeof renderDashboard === 'function') renderDashboard();
        break;
      case 'leads':
        if (typeof renderLeads === 'function') renderLeads();
        break;
      case 'deals':
        if (typeof renderDeals === 'function') renderDeals();
        break;
      case 'contacts':
        if (typeof renderContacts === 'function') renderContacts();
        break;
      case 'accounts':
        if (typeof renderAccounts === 'function') renderAccounts();
        break;
      case 'tasks':
        if (typeof renderTasks === 'function') renderTasks();
        break;
      case 'team':
        if (typeof renderTeam === 'function') renderTeam();
        break;
      case 'reports':
        if (typeof renderReports === 'function') renderReports();
        break;
      case 'settings':
        if (typeof renderSettings === 'function') renderSettings();
        break;
      default:
        contentContainer.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Page not found</h3></div>';
    }
  }, 200);
}
