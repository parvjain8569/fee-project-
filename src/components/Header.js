import { store } from '../state.js';

export function renderHeader(state) {
  const { registeredUser, isLoggedIn, activeFileId, sidebarStructure, boards } = state;

  // Find active file name
  let activeFileName = 'No File Selected';
  if (activeFileId && boards[activeFileId]) {
    activeFileName = boards[activeFileId].name;
  } else if (activeFileId) {
    for (const folder of sidebarStructure) {
      const found = folder.files.find(f => f.id === activeFileId);
      if (found) {
        activeFileName = found.name;
        break;
      }
    }
  }

  const userInitial = registeredUser?.name ? registeredUser.name.charAt(0).toUpperCase() : 'U';

  return `
    <header class="header">
      <div class="header-left">
        <img src="/logo.png" alt="Boardly Logo" class="header-brand-logo" />
        <div class="header-path">
          Boardly <span class="path-slash">/</span> Workspace <span class="path-slash">/</span> ${activeFileName}
        </div>
      </div>
      <div class="header-user">
        ${isLoggedIn ? `
          <span class="user-name">${registeredUser?.name || 'User'}</span>
          <div class="avatar">${userInitial}</div>
          <button id="btn-logout" class="btn-logout">Log Out</button>
        ` : `
          <div class="header-auth-buttons">
            <button id="btn-header-login" class="btn-login">Log In</button>
            <button id="btn-header-register" class="btn-register">Sign Up</button>
          </div>
        `}
      </div>
    </header>
  `;
}

export function attachHeaderEvents(container) {
  const logoutBtn = container.querySelector('#btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      store.setState({ isLoggedIn: false, view: 'website' });
    });
  }

  const loginBtn = container.querySelector('#btn-header-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      store.setState({ view: 'login' });
    });
  }

  const registerBtn = container.querySelector('#btn-header-register');
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      store.setState({ view: 'register' });
    });
  }
}
