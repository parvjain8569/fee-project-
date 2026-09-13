import { store } from './state.js';
import { renderHeader, attachHeaderEvents } from './components/Header.js';
import { renderSidebar, attachSidebarEvents } from './components/Sidebar.js';
import { renderBoard, attachBoardEvents } from './components/Board.js';
import { renderModals, attachModalEvents } from './components/Modals.js';
import { renderAuth, attachAuthEvents } from './components/Auth.js';

const appEl = document.querySelector('#app');
const modalRootEl = document.querySelector('#modal-root');

function renderApp() {
  const state = store.getState();
  const { view } = state;

  if (view === 'login' || view === 'register') {
    appEl.innerHTML = renderAuth(state);
    attachAuthEvents(appEl);
    modalRootEl.innerHTML = '';
    return;
  }

  // Render Main Website View
  appEl.innerHTML = `
    <div class="app-container">
      ${renderSidebar(state)}
      <div class="workspace">
        ${renderHeader(state)}
        ${renderBoard(state)}
      </div>
    </div>
  `;

  // Attach DOM Event Handlers
  attachSidebarEvents(appEl);
  attachHeaderEvents(appEl);
  attachBoardEvents(appEl);

  // Render Modals
  modalRootEl.innerHTML = renderModals(state);
  attachModalEvents(modalRootEl);
}

// Initial render
renderApp();

// Subscribe state changes to re-render UI
store.subscribe(() => {
  renderApp();
});
