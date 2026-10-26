/**
 * ==========================================================================
 * BOARDLY — APPLICATION BOOTSTRAPPER & ROOT RENDER PIPELINE
 * File: /src/main.js
 * Purpose: Subscribes to the central state store, handles routing between
 *          authentication views and the main Kanban workspace, and coordinates
 *          rendering and DOM event attachments.
 * ==========================================================================
 */

// Import central reactive store singleton managing app state and persistence
import { store } from './state.js';

// Import Header component: renders brand bar, file breadcrumbs, and user profile
import { renderHeader, attachHeaderEvents } from './components/Header.js';

// Import Sidebar component: renders VS Code style project/folder tree
import { renderSidebar, attachSidebarEvents } from './components/Sidebar.js';

// Import Board component: renders Kanban columns, cards, and HTML5 drag-and-drop
import { renderBoard, attachBoardEvents } from './components/Board.js';

// Import Modals component: renders popups for adding/editing cards and lists
import { renderModals, attachModalEvents } from './components/Modals.js';

// Import Auth component: renders dedicated Sign In and Sign Up pages
import { renderAuth, attachAuthEvents } from './components/Auth.js';

// Reference to root HTML containers where dynamic templates are injected
const appEl = document.querySelector('#app');             // Main application screen container
const modalRootEl = document.querySelector('#modal-root'); // Dedicated modal popup layer

/**
 * renderApp()
 * Core render controller executed whenever application state changes.
 * Reads current state snapshot and determines whether to display the
 * Login/Register screen or the full interactive Kanban workspace.
 */
function renderApp() {
  // Retrieve the latest immutable snapshot of application state
  const state = store.getState();
  const { view } = state; // Current screen: 'website' | 'login' | 'register'

  // Route: If user is on 'login' or 'register', render standalone Auth interface
  if (view === 'login' || view === 'register') {
    appEl.innerHTML = renderAuth(state);      // Inject Sign In / Sign Up form HTML
    attachAuthEvents(appEl);                 // Bind click and submit handlers for authentication
    modalRootEl.innerHTML = '';              // Clear any active modals from screen
    return;                                  // Exit early so main board is not rendered behind auth
  }

  // Route: Main Workspace View (Sidebar + Header + Kanban Board)
  appEl.innerHTML = `
    <div class="app-container">
      ${renderSidebar(state)}
      <div class="workspace">
        ${renderHeader(state)}
        ${renderBoard(state)}
      </div>
    </div>
  `;

  // Attach interactive DOM event listeners to newly rendered HTML elements
  attachSidebarEvents(appEl); // Folder collapsing, file switching, rename/delete triggers
  attachHeaderEvents(appEl);  // Sign in / Sign out / breadcrumb actions
  attachBoardEvents(appEl);   // Card dragging, drop targets, card editing & deletion

  // Render modal dialog layer (if any modal is opened in state)
  modalRootEl.innerHTML = renderModals(state);
  attachModalEvents(modalRootEl); // Save / Cancel / Close modal event handlers
}

// Initial application boot render
renderApp();

// Subscribe to store updates — whenever store.setState() is invoked, re-render the UI
store.subscribe(() => {
  renderApp();
});
