/**
 * ==========================================================================
 * BOARDLY — TOP NAVIGATION HEADER COMPONENT
 * File: /src/components/Header.js
 * Purpose: Displays the brand logo, breadcrumb path indicating the current
 *          active board, and user profile / authentication controls (Log In,
 *          Sign Up, Log Out).
 * ==========================================================================
 */

// Import central store to dispatch user view and auth state changes
import { store } from '../state.js';

/**
 * renderHeader(state)
 * Generates the HTML string representing the top navigation bar.
 * Parameters:
 *   - state: Current application state object
 * Returns:
 *   - HTML string template
 */
export function renderHeader(state) {
  // Destructure required state properties
  const { registeredUser, isLoggedIn, activeFileId, sidebarStructure, boards } = state;

  // Step 1: Resolve the human-readable display name of the currently active board
  let activeFileName = 'No File Selected'; // Default fallback text if nothing is open

  // If the activeFile exists in the boards dictionary, use its saved name
  if (activeFileId && boards[activeFileId]) {
    activeFileName = boards[activeFileId].name;
  } else if (activeFileId) {
    // Fallback: search across all folders in sidebarStructure
    for (const folder of sidebarStructure) {
      const found = folder.files.find(f => f.id === activeFileId);
      if (found) {
        activeFileName = found.name;
        break; // Stop loop once match is found
      }
    }
  }

  // Step 2: Compute the avatar initial letter (e.g., 'A' for Alex, or 'U' for User)
  const userInitial = registeredUser?.name ? registeredUser.name.charAt(0).toUpperCase() : 'U';

  // Step 3: Return HTML template for the top header bar
  return `
    <header class="header">
      <!-- Left side: Brand Vector Logo and Breadcrumb Path -->
      <div class="header-left">
        <!-- Brand SVG Vector Icon -->
        <img src="/logo.svg" alt="Boardly Logo" class="header-brand-logo" />
        <!-- Breadcrumbs showing exact location hierarchy in workspace -->
        <div class="header-path">
          Boardly <span class="path-slash">/</span> Workspace <span class="path-slash">/</span> ${activeFileName}
        </div>
      </div>

      <!-- Right side: User Profile / Auth State controls -->
      <div class="header-user">
        ${isLoggedIn ? `
          <!-- When user is logged in: Show Name, Initial Badge, and Logout button -->
          <span class="user-name">${registeredUser?.name || 'User'}</span>
          <div class="avatar">${userInitial}</div>
          <button id="btn-logout" class="btn-logout">Log Out</button>
        ` : `
          <!-- When user is not logged in: Show Log In and Sign Up buttons -->
          <div class="header-auth-buttons">
            <button id="btn-header-login" class="btn-login">Log In</button>
            <button id="btn-header-register" class="btn-register">Sign Up</button>
          </div>
        `}
      </div>
    </header>
  `;
}

/**
 * attachHeaderEvents(container)
 * Binds DOM click listeners to header buttons inside the injected container.
 * Parameters:
 *   - container: The DOM element containing the rendered header (#app)
 */
export function attachHeaderEvents(container) {
  // 1. Log Out Button Handler: resets login status to false and remains on workspace
  const logoutBtn = container.querySelector('#btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Updates state: logs user out
      store.setState({ isLoggedIn: false, view: 'website' });
    });
  }

  // 2. Log In Button Handler: switches view to the dedicated login screen
  const loginBtn = container.querySelector('#btn-header-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      // Updates state: switches screen to login
      store.setState({ view: 'login' });
    });
  }

  // 3. Sign Up Button Handler: switches view to the registration screen
  const registerBtn = container.querySelector('#btn-header-register');
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      // Updates state: switches screen to register
      store.setState({ view: 'register' });
    });
  }
}
