// ===========================================
// GLOBENTIX CRM - DATA STORAGE & MANAGEMENT
// ===========================================

const CRMData = {
  leads: [],
  deals: [],
  contacts: [],
  accounts: [],
  tasks: [],
  team: [],
  activities: [],
  notifications: [],
  currentUser: null
};

// ===== GENERATE MOCK DATA =====
function initializeData() {
  // Current user
  CRMData.currentUser = {
    id: 'user_1',
    firstName: 'John',
    lastName: 'Manager',
    email: 'john.manager@globentix.com',
    role: 'Manager',
    avatar: 'JM'
  };

  // Generate Team Members
  const roles = ['Manager', 'Sales Executive', 'Sales Executive', 'Sales Executive', 'Sales Executive', 'Support', 'Support', 'Admin'];
  const firstNames = ['John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'Tom', 'Anna', 'James', 'Rachel'];
  const lastNames = ['Manager', 'Johnson', 'Williams', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
  
  for (let i = 0; i < 10; i++) {
    CRMData.team.push({
      id: `user_${i + 1}`,
      firstName: firstNames[i],
      lastName: lastNames[i],
      email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@globentix.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      role: roles[i % roles.length],
      department: ['Sales', 'Sales', 'Sales', 'Support', 'Admin'][Math.floor(Math.random() * 5)],
      hireDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1).toISOString().split('T')[0],
      status: 'Active',
      leadsAssigned: 0,
      dealsAssigned: 0,
      dealsClosed: Math.floor(Math.random() * 15),
      revenue: Math.floor(Math.random() * 500000) + 50000,
      conversionRate: (Math.random() * 30 + 10).toFixed(1)
    });
  }

  // Generate Accounts
  const industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Real Estate', 'Education'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Middle East'];
  const countries = ['USA', 'UK', 'Canada', 'Germany', 'India', 'Australia', 'Singapore', 'UAE'];
  const companies = [
    'Tech Solutions Inc', 'Global Health Systems', 'Finance Corp', 'Retail World', 'Manufacturing Co',
    'Real Estate Group', 'Education Platform', 'Cloud Services Ltd', 'Data Analytics Corp', 'Software House',
    'Medical Devices Inc', 'Investment Bank', 'Fashion Retail', 'Auto Parts Manufacturing', 'Property Developers',
    'Online Learning', 'Cyber Security Solutions', 'Hospital Network', 'Insurance Group', 'E-commerce Platform',
    'Industrial Equipment', 'Real Estate Investment Trust', 'University Consortium', 'AI Research Lab', 'Biotech Pharma'
  ];

  for (let i = 0; i < 25; i++) {
    CRMData.accounts.push({
      id: `acc_${i + 1}`,
      companyName: companies[i],
      industry: industries[Math.floor(Math.random() * industries.length)],
      website: `www.${companies[i].toLowerCase().replace(/\s+/g, '')}.com`,
      annualRevenue: Math.floor(Math.random() * 50000000) + 100000,
      employeeCount: Math.floor(Math.random() * 5000) + 10,
      region: regions[Math.floor(Math.random() * regions.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      address: `${Math.floor(Math.random() * 999) + 1} Business St`,
      owner: CRMData.team[Math.floor(Math.random() * CRMData.team.length)].id,
      parentAccount: null,
      notes: 'Important client account',
      createdDate: new Date(2024, Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1).toISOString()
    });
  }

  // Generate Contacts
  const jobTitles = ['CEO', 'VP Sales', 'Marketing Manager', 'IT Director', 'Operations Manager', 'CTO', 'CFO', 'Product Manager', 'Sales Director', 'HR Manager'];
  const relationshipTypes = ['Lead', 'Client', 'Partner'];
  const contactFirstNames = ['Michael', 'Jennifer', 'Robert', 'Linda', 'William', 'Patricia', 'Charles', 'Barbara', 'Joseph', 'Susan', 'Thomas', 'Jessica', 'Christopher', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah'];
  const contactLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'];

  for (let i = 0; i < 40; i++) {
    const firstName = contactFirstNames[i % contactFirstNames.length];
    const lastName = contactLastNames[i % contactLastNames.length];
    CRMData.contacts.push({
      id: `con_${i + 1}`,
      firstName: firstName,
      lastName: lastName,
      company: CRMData.accounts[i % CRMData.accounts.length].companyName,
      accountId: CRMData.accounts[i % CRMData.accounts.length].id,
      jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${CRMData.accounts[i % CRMData.accounts.length].companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      relationshipType: relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)],
      industry: CRMData.accounts[i % CRMData.accounts.length].industry,
      country: CRMData.accounts[i % CRMData.accounts.length].country,
      address: `${Math.floor(Math.random() * 999) + 1} Main St`,
      linkedinProfile: `linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      notes: 'Key decision maker',
      createdDate: new Date(2024, Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1).toISOString()
    });
  }

  // Generate Leads
  const leadSources = ['Email', 'LinkedIn', 'Website', 'Events', 'Referral'];
  const leadStages = ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted'];
  const showNames = ['Tech Summit 2024', 'Healthcare Expo', 'Finance Conference', 'Retail Innovation Week', 'Manufacturing Trade Show', 'Real Estate Forum', 'EdTech Summit', 'Cloud Computing Conference', 'AI & ML Symposium', 'Cybersecurity Summit'];
  
  for (let i = 0; i < 50; i++) {
    const isShowLead = i < 30;
    const contact = CRMData.contacts[i % CRMData.contacts.length];
    const account = CRMData.accounts[i % CRMData.accounts.length];
    const assignedTo = CRMData.team[Math.floor(Math.random() * CRMData.team.length)];
    const creator = CRMData.team[Math.floor(Math.random() * CRMData.team.length)];
    
    const lead = {
      id: `lead_${i + 1}`,
      type: isShowLead ? 'show' : 'industry',
      contactName: contact.firstName + ' ' + contact.lastName,
      clientEmail: contact.email,
      jobTitle: contact.jobTitle,
      companyName: account.companyName,
      companyWebsite: account.website,
      country: account.country,
      phone: contact.phone,
      leadSource: leadSources[Math.floor(Math.random() * leadSources.length)],
      emailMessage: 'Interested in learning more about your solutions. Please contact me to discuss further.',
      keyPoints: 'High budget potential, decision maker',
      stage: leadStages[Math.floor(Math.random() * leadStages.length)],
      assignedTo: assignedTo.id,
      assignedToName: `${assignedTo.firstName} ${assignedTo.lastName}`,
      createdBy: creator.id,
      createdByName: `${creator.firstName} ${creator.lastName}`,
      lastContacted: new Date(2024, 10, Math.floor(Math.random() * 28) + 1).toISOString(),
      createdDate: new Date(2024, Math.floor(Math.random() * 6) + 5, Math.floor(Math.random() * 28) + 1).toISOString(),
      score: Math.floor(Math.random() * 100),
      notes: []
    };

    if (isShowLead) {
      lead.showName = showNames[Math.floor(Math.random() * showNames.length)];
      lead.showWebsite = `www.${lead.showName.toLowerCase().replace(/\s+/g, '')}.com`;
      lead.showDate = new Date(2024, 11, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
      lead.attendeeCount = Math.floor(Math.random() * 5000) + 100;
    }

    CRMData.leads.push(lead);
  }

  // Update team stats
  CRMData.team.forEach(member => {
    member.leadsAssigned = CRMData.leads.filter(l => l.assignedTo === member.id).length;
  });

  // Generate Deals
  const dealStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  const stageProbability = { 'Prospecting': 10, 'Qualification': 25, 'Proposal': 50, 'Negotiation': 75, 'Closed Won': 100, 'Closed Lost': 0 };
  const stageDistribution = [8, 6, 5, 4, 5, 2];
  
  let dealIndex = 0;
  stageDistribution.forEach((count, stageIndex) => {
    for (let i = 0; i < count; i++) {
      const contact = CRMData.contacts[dealIndex % CRMData.contacts.length];
      const account = CRMData.accounts[dealIndex % CRMData.accounts.length];
      const owner = CRMData.team[Math.floor(Math.random() * CRMData.team.length)];
      const stage = dealStages[stageIndex];
      
      CRMData.deals.push({
        id: `deal_${dealIndex + 1}`,
        dealName: `${account.companyName} - ${['Software License', 'Service Contract', 'Consulting Project', 'Hardware Purchase', 'Annual Subscription'][Math.floor(Math.random() * 5)]}`,
        company: account.companyName,
        accountId: account.id,
        contactId: contact.id,
        contactName: contact.firstName + ' ' + contact.lastName,
        value: Math.floor(Math.random() * 500000) + 5000,
        stage: stage,
        probability: stageProbability[stage],
        expectedCloseDate: new Date(2024, 11, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        owner: owner.id,
        ownerName: `${owner.firstName} ${owner.lastName}`,
        description: 'Strategic partnership opportunity',
        notes: 'Follow up weekly',
        createdDate: new Date(2024, Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1).toISOString(),
        communications: []
      });
      dealIndex++;
    }
  });

  // Update team deal stats
  CRMData.team.forEach(member => {
    member.dealsAssigned = CRMData.deals.filter(d => d.owner === member.id).length;
    member.dealsClosed = CRMData.deals.filter(d => d.owner === member.id && d.stage === 'Closed Won').length;
  });

  // Generate Tasks
  const taskTypes = ['Call', 'Email', 'Meeting', 'Follow-up', 'Other'];
  const taskPriorities = ['High', 'Medium', 'Low'];
  const taskStatuses = ['Not Started', 'In Progress', 'Completed', 'Deferred'];
  const statusDistribution = [20, 15, 20, 5];
  
  let taskIndex = 0;
  statusDistribution.forEach((count, statusIndex) => {
    for (let i = 0; i < count; i++) {
      const assignedTo = CRMData.team[Math.floor(Math.random() * CRMData.team.length)];
      const status = taskStatuses[statusIndex];
      let dueDate;
      
      if (taskIndex < 10) { // Overdue
        dueDate = new Date(2024, 10, Math.floor(Math.random() * 10) + 1);
      } else if (taskIndex < 18) { // Today
        dueDate = new Date();
      } else if (taskIndex < 33) { // This week
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 7));
      } else { // Future
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 60) + 7);
      }
      
      const relatedTypes = ['Lead', 'Deal', 'Contact', 'Account'];
      const relatedType = relatedTypes[Math.floor(Math.random() * relatedTypes.length)];
      let relatedTo = null;
      let relatedName = '';
      
      switch(relatedType) {
        case 'Lead':
          const lead = CRMData.leads[taskIndex % CRMData.leads.length];
          relatedTo = `${relatedType}:${lead.id}`;
          relatedName = lead.contactName;
          break;
        case 'Deal':
          const deal = CRMData.deals[taskIndex % CRMData.deals.length];
          relatedTo = `${relatedType}:${deal.id}`;
          relatedName = deal.dealName;
          break;
        case 'Contact':
          const contact = CRMData.contacts[taskIndex % CRMData.contacts.length];
          relatedTo = `${relatedType}:${contact.id}`;
          relatedName = `${contact.firstName} ${contact.lastName}`;
          break;
        case 'Account':
          const account = CRMData.accounts[taskIndex % CRMData.accounts.length];
          relatedTo = `${relatedType}:${account.id}`;
          relatedName = account.companyName;
          break;
      }
      
      CRMData.tasks.push({
        id: `task_${taskIndex + 1}`,
        taskName: `${taskTypes[Math.floor(Math.random() * taskTypes.length)]} - ${relatedName}`,
        type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
        description: 'Follow up on previous discussion',
        assignedTo: assignedTo.id,
        assignedToName: `${assignedTo.firstName} ${assignedTo.lastName}`,
        dueDate: dueDate.toISOString().split('T')[0],
        dueTime: `${Math.floor(Math.random() * 12) + 9}:00`,
        priority: taskPriorities[Math.floor(Math.random() * taskPriorities.length)],
        status: status,
        relatedTo: relatedTo,
        relatedName: relatedName,
        reminder: Math.random() > 0.5,
        createdDate: new Date(2024, 10, Math.floor(Math.random() * 28) + 1).toISOString(),
        comments: []
      });
      taskIndex++;
    }
  });

  // Generate Activities
  const activityTypes = ['Lead Created', 'Lead Assigned', 'Deal Stage Changed', 'Task Completed', 'Email Sent', 'Call Logged', 'Meeting Scheduled', 'Contact Added', 'Note Added'];
  
  for (let i = 0; i < 100; i++) {
    const user = CRMData.team[Math.floor(Math.random() * CRMData.team.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const activityDate = new Date();
    activityDate.setDate(activityDate.getDate() - daysAgo);
    activityDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    let entityName = '';
    
    if (activityType.includes('Lead')) {
      entityName = CRMData.leads[Math.floor(Math.random() * CRMData.leads.length)].contactName;
    } else if (activityType.includes('Deal')) {
      entityName = CRMData.deals[Math.floor(Math.random() * CRMData.deals.length)].dealName;
    } else if (activityType.includes('Contact')) {
      const contact = CRMData.contacts[Math.floor(Math.random() * CRMData.contacts.length)];
      entityName = `${contact.firstName} ${contact.lastName}`;
    } else if (activityType.includes('Task')) {
      entityName = CRMData.tasks[Math.floor(Math.random() * CRMData.tasks.length)].taskName;
    }
    
    CRMData.activities.push({
      id: `act_${i + 1}`,
      type: activityType,
      description: `${user.firstName} ${user.lastName} ${activityType.toLowerCase()} ${entityName}`,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      timestamp: activityDate.toISOString(),
      entityType: activityType.split(' ')[0],
      entityId: `${activityType.split(' ')[0].toLowerCase()}_${i + 1}`
    });
  }

  // Sort activities by timestamp (most recent first)
  CRMData.activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Generate Notifications
  const notificationTypes = ['Lead Assigned', 'Deal Updated', 'Task Due', 'Task Overdue', 'New Contact', 'Team Activity'];
  
  for (let i = 0; i < 20; i++) {
    const hoursAgo = Math.floor(Math.random() * 48);
    const notifDate = new Date();
    notifDate.setHours(notifDate.getHours() - hoursAgo);
    
    CRMData.notifications.push({
      id: `notif_${i + 1}`,
      type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
      message: `You have a new notification regarding ${CRMData.leads[i % CRMData.leads.length].contactName}`,
      timestamp: notifDate.toISOString(),
      read: Math.random() > 0.4,
      link: '#'
    });
  }

  // Sort notifications by timestamp (most recent first)
  CRMData.notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// ===== CRUD OPERATIONS =====

// Leads
function createLead(leadData) {
  const id = `lead_${Date.now()}`;
  const lead = { id, ...leadData, createdDate: new Date().toISOString(), notes: [] };
  CRMData.leads.unshift(lead);
  addActivity('Lead Created', `New lead created: ${lead.contactName}`, lead.id);
  return lead;
}

function updateLead(id, updates) {
  const index = CRMData.leads.findIndex(l => l.id === id);
  if (index !== -1) {
    CRMData.leads[index] = { ...CRMData.leads[index], ...updates };
    addActivity('Lead Updated', `Lead updated: ${CRMData.leads[index].contactName}`, id);
    return CRMData.leads[index];
  }
  return null;
}

function deleteLead(id) {
  const index = CRMData.leads.findIndex(l => l.id === id);
  if (index !== -1) {
    const lead = CRMData.leads[index];
    CRMData.leads.splice(index, 1);
    addActivity('Lead Deleted', `Lead deleted: ${lead.contactName}`, id);
    return true;
  }
  return false;
}

function getLeads(filters = {}) {
  let leads = [...CRMData.leads];
  
  if (filters.type) {
    leads = leads.filter(l => l.type === filters.type);
  }
  if (filters.stage) {
    leads = leads.filter(l => l.stage === filters.stage);
  }
  if (filters.source) {
    leads = leads.filter(l => l.leadSource === filters.source);
  }
  if (filters.assignedTo) {
    leads = leads.filter(l => l.assignedTo === filters.assignedTo);
  }
  if (filters.country) {
    leads = leads.filter(l => l.country === filters.country);
  }
  
  return leads;
}

function getLead(id) {
  return CRMData.leads.find(l => l.id === id);
}

// Deals
function createDeal(dealData) {
  const id = `deal_${Date.now()}`;
  const deal = { id, ...dealData, createdDate: new Date().toISOString(), communications: [] };
  CRMData.deals.unshift(deal);
  addActivity('Deal Created', `New deal created: ${deal.dealName}`, deal.id);
  return deal;
}

function updateDeal(id, updates) {
  const index = CRMData.deals.findIndex(d => d.id === id);
  if (index !== -1) {
    const oldStage = CRMData.deals[index].stage;
    CRMData.deals[index] = { ...CRMData.deals[index], ...updates };
    if (updates.stage && updates.stage !== oldStage) {
      addActivity('Deal Stage Changed', `Deal "${CRMData.deals[index].dealName}" moved to ${updates.stage}`, id);
    } else {
      addActivity('Deal Updated', `Deal updated: ${CRMData.deals[index].dealName}`, id);
    }
    return CRMData.deals[index];
  }
  return null;
}

function deleteDeal(id) {
  const index = CRMData.deals.findIndex(d => d.id === id);
  if (index !== -1) {
    const deal = CRMData.deals[index];
    CRMData.deals.splice(index, 1);
    addActivity('Deal Deleted', `Deal deleted: ${deal.dealName}`, id);
    return true;
  }
  return false;
}

function getDeals(filters = {}) {
  let deals = [...CRMData.deals];
  
  if (filters.stage) {
    deals = deals.filter(d => d.stage === filters.stage);
  }
  if (filters.owner) {
    deals = deals.filter(d => d.owner === filters.owner);
  }
  
  return deals;
}

function getDeal(id) {
  return CRMData.deals.find(d => d.id === id);
}

// Contacts
function createContact(contactData) {
  const id = `con_${Date.now()}`;
  const contact = { id, ...contactData, createdDate: new Date().toISOString() };
  CRMData.contacts.unshift(contact);
  addActivity('Contact Created', `New contact added: ${contact.firstName} ${contact.lastName}`, contact.id);
  return contact;
}

function updateContact(id, updates) {
  const index = CRMData.contacts.findIndex(c => c.id === id);
  if (index !== -1) {
    CRMData.contacts[index] = { ...CRMData.contacts[index], ...updates };
    return CRMData.contacts[index];
  }
  return null;
}

function deleteContact(id) {
  const index = CRMData.contacts.findIndex(c => c.id === id);
  if (index !== -1) {
    CRMData.contacts.splice(index, 1);
    return true;
  }
  return false;
}

function getContacts(filters = {}) {
  let contacts = [...CRMData.contacts];
  
  if (filters.relationshipType) {
    contacts = contacts.filter(c => c.relationshipType === filters.relationshipType);
  }
  if (filters.industry) {
    contacts = contacts.filter(c => c.industry === filters.industry);
  }
  if (filters.country) {
    contacts = contacts.filter(c => c.country === filters.country);
  }
  
  return contacts;
}

function getContact(id) {
  return CRMData.contacts.find(c => c.id === id);
}

// Accounts
function createAccount(accountData) {
  const id = `acc_${Date.now()}`;
  const account = { id, ...accountData, createdDate: new Date().toISOString() };
  CRMData.accounts.unshift(account);
  addActivity('Account Created', `New account added: ${account.companyName}`, account.id);
  return account;
}

function updateAccount(id, updates) {
  const index = CRMData.accounts.findIndex(a => a.id === id);
  if (index !== -1) {
    CRMData.accounts[index] = { ...CRMData.accounts[index], ...updates };
    return CRMData.accounts[index];
  }
  return null;
}

function deleteAccount(id) {
  const index = CRMData.accounts.findIndex(a => a.id === id);
  if (index !== -1) {
    CRMData.accounts.splice(index, 1);
    return true;
  }
  return false;
}

function getAccounts(filters = {}) {
  let accounts = [...CRMData.accounts];
  
  if (filters.industry) {
    accounts = accounts.filter(a => a.industry === filters.industry);
  }
  if (filters.region) {
    accounts = accounts.filter(a => a.region === filters.region);
  }
  if (filters.owner) {
    accounts = accounts.filter(a => a.owner === filters.owner);
  }
  
  return accounts;
}

function getAccount(id) {
  return CRMData.accounts.find(a => a.id === id);
}

// Tasks
function createTask(taskData) {
  const id = `task_${Date.now()}`;
  const task = { id, ...taskData, createdDate: new Date().toISOString(), comments: [] };
  CRMData.tasks.unshift(task);
  addActivity('Task Created', `New task created: ${task.taskName}`, task.id);
  return task;
}

function updateTask(id, updates) {
  const index = CRMData.tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    CRMData.tasks[index] = { ...CRMData.tasks[index], ...updates };
    if (updates.status === 'Completed') {
      addActivity('Task Completed', `Task completed: ${CRMData.tasks[index].taskName}`, id);
    }
    return CRMData.tasks[index];
  }
  return null;
}

function deleteTask(id) {
  const index = CRMData.tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    CRMData.tasks.splice(index, 1);
    return true;
  }
  return false;
}

function getTasks(filters = {}) {
  let tasks = [...CRMData.tasks];
  
  if (filters.status) {
    tasks = tasks.filter(t => t.status === filters.status);
  }
  if (filters.priority) {
    tasks = tasks.filter(t => t.priority === filters.priority);
  }
  if (filters.assignedTo) {
    tasks = tasks.filter(t => t.assignedTo === filters.assignedTo);
  }
  if (filters.type) {
    tasks = tasks.filter(t => t.type === filters.type);
  }
  
  // Filter overdue
  if (filters.overdue) {
    const today = new Date().toISOString().split('T')[0];
    tasks = tasks.filter(t => t.dueDate < today && t.status !== 'Completed');
  }
  
  return tasks;
}

function getTask(id) {
  return CRMData.tasks.find(t => t.id === id);
}

// Team
function createTeamMember(memberData) {
  const id = `user_${Date.now()}`;
  const member = { id, ...memberData, leadsAssigned: 0, dealsAssigned: 0, dealsClosed: 0, revenue: 0, conversionRate: 0 };
  CRMData.team.push(member);
  return member;
}

function updateTeamMember(id, updates) {
  const index = CRMData.team.findIndex(m => m.id === id);
  if (index !== -1) {
    CRMData.team[index] = { ...CRMData.team[index], ...updates };
    return CRMData.team[index];
  }
  return null;
}

function deleteTeamMember(id) {
  const index = CRMData.team.findIndex(m => m.id === id);
  if (index !== -1) {
    CRMData.team.splice(index, 1);
    return true;
  }
  return false;
}

function getTeamMembers() {
  return [...CRMData.team];
}

function getTeamMember(id) {
  return CRMData.team.find(m => m.id === id);
}

// Activities
function addActivity(type, description, entityId) {
  const activity = {
    id: `act_${Date.now()}`,
    type,
    description,
    userId: CRMData.currentUser.id,
    userName: `${CRMData.currentUser.firstName} ${CRMData.currentUser.lastName}`,
    timestamp: new Date().toISOString(),
    entityId
  };
  CRMData.activities.unshift(activity);
  return activity;
}

function getActivities(limit = 100) {
  return CRMData.activities.slice(0, limit);
}

// Notifications
function addNotification(type, message, link = '#') {
  const notification = {
    id: `notif_${Date.now()}`,
    type,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    link
  };
  CRMData.notifications.unshift(notification);
  return notification;
}

function markNotificationAsRead(id) {
  const notification = CRMData.notifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
    return true;
  }
  return false;
}

function markAllNotificationsAsRead() {
  CRMData.notifications.forEach(n => n.read = true);
}

function getNotifications(unreadOnly = false) {
  if (unreadOnly) {
    return CRMData.notifications.filter(n => !n.read);
  }
  return CRMData.notifications;
}

// Global Search
function globalSearch(query) {
  const results = [];
  const q = query.toLowerCase();
  
  // Search leads
  CRMData.leads.forEach(lead => {
    if (lead.contactName.toLowerCase().includes(q) || 
        lead.companyName.toLowerCase().includes(q) ||
        lead.clientEmail.toLowerCase().includes(q)) {
      results.push({
        type: 'Lead',
        id: lead.id,
        title: lead.contactName,
        subtitle: lead.companyName,
        icon: 'fa-users'
      });
    }
  });
  
  // Search deals
  CRMData.deals.forEach(deal => {
    if (deal.dealName.toLowerCase().includes(q) || 
        deal.company.toLowerCase().includes(q)) {
      results.push({
        type: 'Deal',
        id: deal.id,
        title: deal.dealName,
        subtitle: `$${deal.value.toLocaleString()} - ${deal.stage}`,
        icon: 'fa-handshake'
      });
    }
  });
  
  // Search contacts
  CRMData.contacts.forEach(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`;
    if (fullName.toLowerCase().includes(q) || 
        contact.email.toLowerCase().includes(q) ||
        contact.company.toLowerCase().includes(q)) {
      results.push({
        type: 'Contact',
        id: contact.id,
        title: fullName,
        subtitle: `${contact.jobTitle} at ${contact.company}`,
        icon: 'fa-address-book'
      });
    }
  });
  
  // Search accounts
  CRMData.accounts.forEach(account => {
    if (account.companyName.toLowerCase().includes(q)) {
      results.push({
        type: 'Account',
        id: account.id,
        title: account.companyName,
        subtitle: `${account.industry} - ${account.region}`,
        icon: 'fa-building'
      });
    }
  });
  
  return results.slice(0, 10);
}

// Initialize data on load
initializeData();
