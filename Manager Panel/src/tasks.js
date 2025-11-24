// ===========================================
// GLOBENTIX CRM - TASKS MODULE
// ===========================================

let currentTaskPage = 1;
let currentTaskFilter = 'all';

function renderTasks() {
  const container = document.getElementById('contentContainer');
  
  const allTasks = CRMData.tasks;
  const myTasks = allTasks.filter(t => t.assignedTo === CRMData.currentUser.id);
  const overdueTasks = allTasks.filter(t => t.dueDate < new Date().toISOString().split('T')[0] && t.status !== 'Completed');
  const completedTasks = allTasks.filter(t => t.status === 'Completed');
  
  const html = `
    <!-- Task KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">All Tasks</div>
        <div class="kpi-value">${allTasks.length}</div>
      </div>
      <div class="kpi-card" style="border-left-color: var(--primary);">
        <div class="kpi-label">My Tasks</div>
        <div class="kpi-value">${myTasks.length}</div>
      </div>
      <div class="kpi-card" style="border-left-color: var(--error);">
        <div class="kpi-label">Overdue</div>
        <div class="kpi-value">${overdueTasks.length}</div>
      </div>
      <div class="kpi-card" style="border-left-color: var(--success);">
        <div class="kpi-label">Completed</div>
        <div class="kpi-value">${completedTasks.length}</div>
      </div>
    </div>
    
    <!-- Task Filter Tabs -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0;">
      <div class="tabs">
        <button class="tab ${currentTaskFilter === 'all' ? 'active' : ''}" onclick="filterTasks('all')">All Tasks</button>
        <button class="tab ${currentTaskFilter === 'my' ? 'active' : ''}" onclick="filterTasks('my')">My Tasks</button>
        <button class="tab ${currentTaskFilter === 'team' ? 'active' : ''}" onclick="filterTasks('team')">Team Tasks</button>
        <button class="tab ${currentTaskFilter === 'overdue' ? 'active' : ''}" onclick="filterTasks('overdue')">Overdue</button>
        <button class="tab ${currentTaskFilter === 'completed' ? 'active' : ''}" onclick="filterTasks('completed')">Completed</button>
      </div>
      <button class="btn btn-primary" onclick="showAddTaskModal()"><i class="fas fa-plus"></i> Add Task</button>
    </div>
    
    <!-- Task Table -->
    <div class="table-container">
      <div class="table-controls">
        <div class="table-filters">
          <select class="filter-select" id="taskTypeFilter" onchange="displayTasksFiltered()">
            <option value="">All Types</option>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Meeting">Meeting</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Other">Other</option>
          </select>
          <select class="filter-select" id="taskPriorityFilter" onchange="displayTasksFiltered()">
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input type="text" class="filter-input" placeholder="Search tasks..." id="taskSearchInput" oninput="displayTasksFiltered()" />
        </div>
      </div>
      
      <table id="tasksTable">
        <thead>
          <tr>
            <th onclick="sortTable('tasksTable', 0)">Task Name <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('tasksTable', 1)">Type <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('tasksTable', 2)">Due Date <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('tasksTable', 3)">Priority <i class="fas fa-sort"></i></th>
            <th onclick="sortTable('tasksTable', 4)">Status <i class="fas fa-sort"></i></th>
            
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="tasksTableBody"></tbody>
      </table>
      
      <div id="tasksPagination"></div>
    </div>
  `;
  
  container.innerHTML = html;
  displayTasksFiltered();
}

function filterTasks(filter) {
  currentTaskFilter = filter;
  currentTaskPage = 1;
  renderTasks();
}

function displayTasksFiltered() {
  const typeFilter = document.getElementById('taskTypeFilter')?.value || '';
  const priorityFilter = document.getElementById('taskPriorityFilter')?.value || '';
  const searchQuery = document.getElementById('taskSearchInput')?.value.toLowerCase() || '';
  
  let tasks = [];
  
  switch(currentTaskFilter) {
    case 'all':
      tasks = [...CRMData.tasks];
      break;
    case 'my':
      tasks = CRMData.tasks.filter(t => t.assignedTo === CRMData.currentUser.id);
      break;
    case 'team':
      tasks = CRMData.tasks.filter(t => t.assignedTo !== CRMData.currentUser.id);
      break;
    case 'overdue':
      tasks = CRMData.tasks.filter(t => t.dueDate < new Date().toISOString().split('T')[0] && t.status !== 'Completed');
      break;
    case 'completed':
      tasks = CRMData.tasks.filter(t => t.status === 'Completed');
      break;
    default:
      tasks = [...CRMData.tasks];
  }
  
  if (typeFilter) tasks = tasks.filter(t => t.type === typeFilter);
  if (priorityFilter) tasks = tasks.filter(t => t.priority === priorityFilter);
  if (searchQuery) {
    tasks = tasks.filter(t => t.taskName.toLowerCase().includes(searchQuery));
  }
  
  displayTasks(tasks);
}

function displayTasks(tasks) {
  const tbody = document.getElementById('tasksTableBody');
  const paginationContainer = document.getElementById('tasksPagination');
  
  if (!tbody) return;
  
  const paginated = paginateData(tasks, currentTaskPage, 25);
  
  if (paginated.data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="empty-state"><i class="fas fa-inbox"></i><h3>No tasks found</h3></div></td></tr>';
    paginationContainer.innerHTML = '';
    return;
  }
  
  let html = '';
  paginated.data.forEach(task => {
    const isOverdue = task.dueDate < new Date().toISOString().split('T')[0] && task.status !== 'Completed';
    
    html += `
      <tr ${isOverdue ? 'style="background: rgba(229, 57, 53, 0.05);"' : ''}>
        <td><strong>${task.taskName}</strong></td>
        <td><span class="badge badge-${task.type.toLowerCase()}">${task.type}</span></td>
        <td ${isOverdue ? 'style="color: var(--error); font-weight: 600;"' : ''}>${formatDate(task.dueDate)}</td>
        <td><span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span></td>
        <td><span class="badge badge-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span></td>
        <td>
          <div class="table-actions">
            <button class="action-btn" onclick="showTaskDetails('${task.id}')" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="action-btn" onclick="showEditTaskModal('${task.id}')" title="Edit"><i class="fas fa-pencil"></i></button>
            ${task.status !== 'Completed' ? `<button class="action-btn" onclick="markTaskComplete('${task.id}')" title="Mark Complete"><i class="fas fa-check"></i></button>` : ''}
            <button class="action-btn danger" onclick="deleteTaskConfirm('${task.id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
  renderPagination('tasksPagination', paginated.totalPages, paginated.currentPage, 'changeTaskPage');
}

function changeTaskPage(page) {
  currentTaskPage = page;
  displayTasksFiltered();
}

function showAddTaskModal() {
  const content = `
    <form id="taskForm" class="form-grid">
      <div class="form-group">
        <label class="form-label">Task Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="taskName" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Type <span class="required">*</span></label>
        <select class="form-select" name="type" required>
          <option value="">Select Type</option>
          <option value="Call">Call</option>
          <option value="Email">Email</option>
          <option value="Meeting">Meeting</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Other">Other</option>
        </select>
        <div class="form-error"></div>
      </div>
      
    
      
      <div class="form-group">
        <label class="form-label">Due Date <span class="required">*</span></label>
        <input type="date" class="form-input" name="dueDate" required />
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Due Time</label>
        <input type="time" class="form-input" name="dueTime" />
      </div>
      
      <div class="form-group">
        <label class="form-label">Priority <span class="required">*</span></label>
        <select class="form-select" name="priority" required>
          <option value="">Select Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" name="status">
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Deferred">Deferred</option>
        </select>
      </div>
      
     
      
      <div class="form-group" style="grid-column: 1 / -1;">
        <label class="form-label">Description</label>
        <textarea class="form-textarea" name="description"></textarea>
      </div>
      
      <div class="form-group">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" name="reminder" />
          <span>Set Reminder</span>
        </label>
      </div>
    </form>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="handleAddTask()">Add Task</button>
    </div>
  `;
  
  showModal(content, 'Add New Task');
}

function handleAddTask() {
  if (!validateForm('taskForm')) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  const formData = getFormData('taskForm');
  const assignedMember = CRMData.team.find(m => m.id === formData.assignedTo);
  
  const taskData = {
    ...formData,
    assignedToName: assignedMember ? `${assignedMember.firstName} ${assignedMember.lastName}` : 'Unassigned'
  };
  
  createTask(taskData);
  closeModal();
  showToast('Task added successfully!', 'success');
  renderTasks();
}

function showEditTaskModal(taskId) {
  const task = getTask(taskId);
  if (!task) return;
  
  const content = `
    <form id="editTaskForm" class="form-grid">
      <input type="hidden" name="id" value="${task.id}" />
      
      <div class="form-group">
        <label class="form-label">Task Name <span class="required">*</span></label>
        <input type="text" class="form-input" name="taskName" value="${task.taskName}" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">Type <span class="required">*</span></label>
        <select class="form-select" name="type" required>
          <option value="Call" ${task.type === 'Call' ? 'selected' : ''}>Call</option>
          <option value="Email" ${task.type === 'Email' ? 'selected' : ''}>Email</option>
          <option value="Meeting" ${task.type === 'Meeting' ? 'selected' : ''}>Meeting</option>
          <option value="Follow-up" ${task.type === 'Follow-up' ? 'selected' : ''}>Follow-up</option>
          <option value="Other" ${task.type === 'Other' ? 'selected' : ''}>Other</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" name="status">
          <option value="Not Started" ${task.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
          <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
          <option value="Deferred" ${task.status === 'Deferred' ? 'selected' : ''}>Deferred</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Priority</label>
        <select class="form-select" name="priority">
          <option value="High" ${task.priority === 'High' ? 'selected' : ''}>High</option>
          <option value="Medium" ${task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
          <option value="Low" ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Due Date</label>
        <input type="date" class="form-input" name="dueDate" value="${task.dueDate}" />
      </div>
    </form>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="handleUpdateTask()">Update Task</button>
    </div>
  `;
  
  showModal(content, 'Edit Task');
}

function handleUpdateTask() {
  if (!validateForm('editTaskForm')) return;
  
  const formData = getFormData('editTaskForm');
  updateTask(formData.id, formData);
  closeModal();
  showToast('Task updated successfully!', 'success');
  renderTasks();
}

function markTaskComplete(taskId) {
  updateTask(taskId, { status: 'Completed' });
  showToast('Task marked as complete!', 'success');
  renderTasks();
}

function deleteTaskConfirm(taskId) {
  const task = getTask(taskId);
  confirmDialog(`Are you sure you want to delete the task "${task.taskName}"? This action cannot be undone.`, () => {
    deleteTask(taskId);
    showToast('Task deleted successfully', 'success');
    renderTasks();
  });
}

function showTaskDetails(taskId) {
  const task = getTask(taskId);
  if (!task) return;
  
  const content = `
    <div style="padding: 10px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div>
          <label style="font-size: 12px; color: var(--text-secondary);">Task Name</label>
          <p style="font-weight: 600; margin: 5px 0 15px;">${task.taskName}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Type</label>
          <p style="margin: 5px 0 15px;"><span class="badge badge-${task.type.toLowerCase()}">${task.type}</span></p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Assigned To</label>
          <p style="margin: 5px 0 15px;">${task.assignedToName}</p>
        </div>
        <div>
          <label style="font-size: 12px; color: var(--text-secondary);">Due Date</label>
          <p style="margin: 5px 0 15px;">${formatDate(task.dueDate)} ${task.dueTime || ''}</p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Priority</label>
          <p style="margin: 5px 0 15px;"><span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span></p>
          
          <label style="font-size: 12px; color: var(--text-secondary);">Status</label>
          <p style="margin: 5px 0 15px;"><span class="badge badge-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span></p>
        </div>
      </div>
      
      ${task.description ? `
        <div style="margin-bottom: 20px;">
          <label style="font-size: 12px; color: var(--text-secondary);">Description</label>
          <p style="margin: 5px 0;">${task.description}</p>
        </div>
      ` : ''}
      
      ${task.relatedName ? `
        <div style="margin-bottom: 20px;">
          <label style="font-size: 12px; color: var(--text-secondary);">Related To</label>
          <p style="margin: 5px 0;">${task.relatedName}</p>
        </div>
      ` : ''}
    </div>
  `;
  
  showSideDrawer(content, 'Task Details');
}
