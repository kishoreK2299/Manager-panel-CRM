/* ==========================================================================
   Settings Module (Globentix CRM)
   - Profile Settings
   - Account & Security
   - Notifications
   - Uses localStorage for persistence (no backend)
   - Preserves existing layout/styles and action colors
   - Uses Font Awesome 6 icons for actions and inputs
   ========================================================================== */

window.SettingsModule = (function () {
  const el = {
    mount: () => document.getElementById('content'),
  };

  const STORAGE_KEY = 'globentix_crm_settings_v1';

  const defaults = {
    profile: {
      firstName: 'Manager',
      lastName: 'User',
      username: 'globentix.manager',
      email: 'manager@globentix.com',
      phone: '+91 90000 00000',
      role: 'M',
      department: 'Sales',
      timeZone: 'Asia/Kolkata',
      language: 'English',
      bio: '',
      avatar: '', // data URL
    },
    security: {
      twoFA: false,
      loginHistory: [], // {ts, ip, device, location, status}
      allowedDevices: ['Chrome • Windows', 'Edge • Windows'],
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
      inapp: true,
      leadAssigned: true,
      dealStageChange: true,
      taskDue: true,
      overdueTasks: true,
      teamActivity: true,
      systemUpdates: true,
      sound: true,
      desktop: false,
    },
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaults);
      const parsed = JSON.parse(raw);
      // Shallow merge to keep new defaults
      return {
        profile: Object.assign({}, defaults.profile, parsed.profile || {}),
        security: Object.assign({}, defaults.security, parsed.security || {}),
        notifications: Object.assign({}, defaults.notifications, parsed.notifications || {}),
      };
    } catch {
      return structuredClone(defaults);
    }
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    (window.Toast?.success && window.Toast.success('Settings saved')) || console.log('Settings saved');
  }

  function $$ (sel, root = document) { return root.querySelector(sel); }
  function $$$ (sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function render() {
    const mount = el.mount();
    if (!mount) return;

    const state = load();

    mount.innerHTML = `
      <div class="page-header">
        <h2><i class="fa-solid fa-gear" style="margin-right:8px;"></i>Settings</h2>
      </div>

      <div class="tabs">
        <button class="tab active" data-tab="profile"><i class="fa-solid fa-user" style="margin-right:6px;"></i>Profile</button>
        <button class="tab" data-tab="security"><i class="fa-solid fa-shield" style="margin-right:6px;"></i>Account & Security</button>
        <button class="tab" data-tab="notifications"><i class="fa-regular fa-bell" style="margin-right:6px;"></i>Notifications</button>
      </div>

      <div class="tab-panels">

        <!-- Profile -->
        <div class="tab-panel" data-panel="profile" style="display:block;">
          <div class="card">
            <div class="card-header"><i class="fa-solid fa-id-card" style="margin-right:6px;"></i> Profile Settings</div>
            <div class="card-body">
              <div class="profile-grid">
                <div>
                  <label>Profile Picture</label>
                  <div class="avatar-uploader">
                    <img id="set-avatar-preview" src="${state.profile.avatar || ''}" alt="avatar" style="width:96px;height:96px;border-radius:50%;object-fit:cover;background:#E5E7EB;">
                    <div style="margin-top:8px;">
                      <label class="btn action-button btn-secondary">
                        <i class="fa-solid fa-upload"></i> Upload
                        <input id="set-avatar" type="file" accept="image/*" style="display:none;">
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <div class="form-row two">
                    <div>
                      <label>First Name *</label>
                      <input id="set-fn" class="input" required value="${state.profile.firstName}">
                    </div>
                    <div>
                      <label>Last Name *</label>
                      <input id="set-ln" class="input" required value="${state.profile.lastName}">
                    </div>
                  </div>

                  <div class="form-row two">
                    <div>
                      <label>Username *</label>
                      <input id="set-un" class="input" required value="${state.profile.username}">
                    </div>
                    <div>
                      <label>Email *</label>
                      <input id="set-email" type="email" class="input" required value="${state.profile.email}">
                    </div>
                  </div>

                  <div class="form-row two">
                    <div>
                      <label>Phone</label>
                      <input id="set-phone" class="input" value="${state.profile.phone}">
                    </div>
                    <div>
                      <label>Role</label>
                      <input id="set-role" class="input" value="${state.profile.role}" disabled>
                    </div>
                  </div>

                  <div class="form-row two">
                    <div>
                      <label>Department</label>
                      <input id="set-dept" class="input" value="${state.profile.department}">
                    </div>
                    <div>
                      <label>Time Zone</label>
                      <select id="set-tz" class="input">
                        <option ${state.profile.timeZone==='Asia/Kolkata'?'selected':''}>Asia/Kolkata</option>
                        <option ${state.profile.timeZone==='UTC'?'selected':''}>UTC</option>
                        <option ${state.profile.timeZone==='America/New_York'?'selected':''}>America/New_York</option>
                        <option ${state.profile.timeZone==='Europe/London'?'selected':''}>Europe/London</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-row two">
                    <div>
                      <label>Language</label>
                      <select id="set-lang" class="input">
                        <option ${state.profile.language==='English'?'selected':''}>English</option>
                        <option ${state.profile.language==='Spanish'?'selected':''}>Spanish</option>
                        <option ${state.profile.language==='French'?'selected':''}>French</option>
                      </select>
                    </div>
                    <div>
                      <label>&nbsp;</label>
                      <button id="set-profile-save" class="btn action-button btn-primary">
                        <i class="fa-solid fa-floppy-disk"></i> Save Changes
                      </button>
                    </div>
                  </div>

                  <div class="form-row">
                    <label>Bio</label>
                    <textarea id="set-bio" class="input" rows="3" placeholder="Tell something about you...">${state.profile.bio || ''}</textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Security -->
        <div class="tab-panel" data-panel="security" style="display:none;">
          <div class="card">
            <div class="card-header"><i class="fa-solid fa-lock" style="margin-right:6px;"></i> Account & Security</div>
            <div class="card-body">
              <div class="form-row two">
                <div>
                  <label>Change Password</label>
                  <div class="form-row">
                    <input id="sec-cur" type="password" class="input" placeholder="Current Password">
                  </div>
                  <div class="form-row two">
                    <input id="sec-new" type="password" class="input" placeholder="New Password">
                    <input id="sec-cfm" type="password" class="input" placeholder="Confirm Password">
                  </div>
                  <button id="sec-save-pass" class="btn action-button btn-primary" style="margin-top:6px;">
                    <i class="fa-solid fa-key"></i> Update Password
                  </button>
                </div>
                <div>
                  <label>Two-Factor Authentication</label>
                  <div class="form-row">
                    <label class="switch">
                      <input id="sec-2fa" type="checkbox" ${state.security.twoFA ? 'checked' : ''}>
                      <span class="slider"></span>
                    </label>
                    <span style="margin-left:8px;"><i class="fa-solid fa-shield"></i> Enable 2FA</span>
                  </div>
                  <div class="form-row" style="margin-top:6px;">
                    <button id="sec-save-2fa" class="btn action-button btn-secondary">
                      <i class="fa-solid fa-shield"></i> Save 2FA Setting
                    </button>
                  </div>
                </div>
              </div>

              <div class="form-row" style="margin-top:12px;">
                <label>Allowed Devices</label>
                <ul id="sec-devices" class="list">
                  ${state.security.allowedDevices.map((d) => `<li><i class="fa-solid fa-desktop" style="margin-right:6px;"></i>${d}</li>`).join('')}
                </ul>
              </div>

              <div class="table-wrap" style="margin-top:12px;">
                <div class="table-header"><i class="fa-solid fa-clock-rotate-left" style="margin-right:6px;"></i>Login History</div>
                <table class="table" id="sec-logins">
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
                    ${state.security.loginHistory.slice(-20).reverse().map((e) => `
                      <tr>
                        <td>${new Date(e.ts).toLocaleString()}</td>
                        <td>${e.ip || '-'}</td>
                        <td>${e.device || '-'}</td>
                        <td>${e.location || '-'}</td>
                        <td>${e.status || 'OK'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="tab-panel" data-panel="notifications" style="display:none;">
          <div class="card">
            <div class="card-header"><i class="fa-regular fa-bell" style="margin-right:6px;"></i> Notifications</div>
            <div class="card-body">
              <div class="form-row two">
                <div>
                  <label>Channels</label>
                  ${toggle('notif-email','Email Notifications', state.notifications.email, 'fa-regular fa-envelope')}
                  ${toggle('notif-sms','SMS Notifications', state.notifications.sms, 'fa-solid fa-message')}
                  ${toggle('notif-push','Push Notifications', state.notifications.push, 'fa-solid fa-bell')}
                  ${toggle('notif-inapp','In-App Notifications', state.notifications.inapp, 'fa-regular fa-bell')}
                </div>
                <div>
                  <label>Preferences</label>
                  ${toggle('notif-lead','New Lead Assignment', state.notifications.leadAssigned, 'fa-solid fa-user-plus')}
                  ${toggle('notif-deal','Deal Stage Change', state.notifications.dealStageChange, 'fa-solid fa-handshake')}
                  ${toggle('notif-task','Task Due Reminders', state.notifications.taskDue, 'fa-solid fa-calendar')}
                  ${toggle('notif-overdue','Overdue Tasks', state.notifications.overdueTasks, 'fa-solid fa-triangle-exclamation')}
                  ${toggle('notif-team','Team Activity', state.notifications.teamActivity, 'fa-solid fa-users')}
                  ${toggle('notif-system','System Updates', state.notifications.systemUpdates, 'fa-solid fa-circle-info')}
                  ${toggle('notif-sound','Sound', state.notifications.sound, 'fa-solid fa-volume-high')}
                  ${toggle('notif-desktop','Desktop Notifications', state.notifications.desktop, 'fa-solid fa-desktop')}
                </div>
              </div>

              <div class="form-actions" style="margin-top:10px;">
                <button id="notif-save" class="btn action-button btn-primary">
                  <i class="fa-solid fa-floppy-disk"></i> Save Notification Settings
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    // Tabs
    $$('.tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      const name = tab.getAttribute('data-tab');
      $$('.tabs .tab.active')?.classList.remove('active');
      tab.classList.add('active');
      $$$('.tab-panel').forEach((p) => (p.style.display = p.getAttribute('data-panel') === name ? 'block' : 'none'));
    });

    // Avatar upload preview
    $$('#set-avatar').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        $$('#set-avatar-preview').src = reader.result;
      };
      reader.readAsDataURL(file);
    });

    // Save profile
    $$('#set-profile-save').addEventListener('click', () => {
      const next = load();
      next.profile.firstName = $$('#set-fn').value.trim();
      next.profile.lastName = $$('#set-ln').value.trim();
      next.profile.username = $$('#set-un').value.trim();
      next.profile.email = $$('#set-email').value.trim();
      next.profile.phone = $$('#set-phone').value.trim();
      next.profile.department = $$('#set-dept').value.trim();
      next.profile.timeZone = $$('#set-tz').value;
      next.profile.language = $$('#set-lang').value;
      next.profile.bio = $$('#set-bio').value;
      // avatar from preview if set
      const src = $$('#set-avatar-preview').getAttribute('src');
      if (src) next.profile.avatar = src;
      save(next);
    });

    // Save password (client-side demo only)
    $$('#sec-save-pass').addEventListener('click', () => {
      const cur = $$('#sec-cur').value;
      const nw = $$('#sec-new').value;
      const cf = $$('#sec-cfm').value;
      if (!nw || nw.length < 6 || nw !== cf) {
        (window.Toast?.error && window.Toast.error('Password validation failed')) ||
          alert('Password validation failed');
        return;
      }
      const next = load();
      // Append login history entry noting password change
      next.security.loginHistory.push({
        ts: Date.now(),
        ip: '127.0.0.1',
        device: navigator.userAgent.split(') ')[0] || 'Browser',
        location: 'Local',
        status: 'Password Changed',
      });
      save(next);
    });

    // Save 2FA
    $$('#sec-save-2fa').addEventListener('click', () => {
      const next = load();
      next.security.twoFA = $$('#sec-2fa').checked;
      save(next);
    });

    // Save notifications
    $$('#notif-save').addEventListener('click', () => {
      const next = load();
      next.notifications.email = $$('#notif-email').checked;
      next.notifications.sms = $$('#notif-sms').checked;
      next.notifications.push = $$('#notif-push').checked;
      next.notifications.inapp = $$('#notif-inapp').checked;
      next.notifications.leadAssigned = $$('#notif-lead').checked;
      next.notifications.dealStageChange = $$('#notif-deal').checked;
      next.notifications.taskDue = $$('#notif-task').checked;
      next.notifications.overdueTasks = $$('#notif-overdue').checked;
      next.notifications.teamActivity = $$('#notif-team').checked;
      next.notifications.systemUpdates = $$('#notif-system').checked;
      next.notifications.sound = $$('#notif-sound').checked;
      next.notifications.desktop = $$('#notif-desktop').checked;
      save(next);
    });
  }

  function toggle(id, label, checked, icon) {
    return `
      <div class="toggle-row">
        <label class="switch">
          <input id="${id}" type="checkbox" ${checked ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
        <span style="margin-left:8px;"><i class="${icon}" style="margin-right:6px;"></i>${label}</span>
      </div>
    `;
  }

  function init() {
    render();
  }

  return { init, render };
})();
