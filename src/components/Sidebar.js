/**
 * ==========================================================================
 * BOARDLY — VS CODE STYLE EXPLORER SIDEBAR COMPONENT
 * File: /src/components/Sidebar.js
 * Purpose: Renders the dark midnight sidebar tree containing Workspaces,
 *          collapsible folders, individual Kanban board files, inline creation
 *          inputs, rename triggers, and deletion actions.
 * ==========================================================================
 */

// Import central store to read sidebar tree and trigger folder/file mutations
import { store } from '../state.js';

/**
 * getBoardIcon(index)
 * Generates an SVG vector Kanban board icon accented with a rotating vibrant color.
 * Parameters:
 *   - index: Numerical index used to pick a distinct accent hue
 * Returns:
 *   - SVG markup string
 */
function getBoardIcon(index = 0) {
  // Vibrant accent palette for board icons
  const colors = ['#38bdf8', '#fbbf24', '#a855f7', '#34d399', '#f43f5e'];
  const color = colors[index % colors.length];
  
  return `
    <svg class="board-icon-svg" style="stroke: ${color};" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"></rect>
      <line x1="9" y1="3" x2="9" y2="21"></line>
      <line x1="15" y1="3" x2="15" y2="13"></line>
    </svg>
  `;
}

/**
 * renderChevron(isExpanded)
 * Generates a collapsible chevron arrow icon that rotates when folder is open.
 * Parameters:
 *   - isExpanded: Boolean indicating whether parent folder is open
 */
function renderChevron(isExpanded) {
  return `
    <svg class="chevron-svg ${isExpanded ? 'open' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  `;
}

/**
 * renderFolderIcon()
 * Generates the folder directory SVG icon with amber gold accent stroke.
 */
function renderFolderIcon() {
  return `
    <svg class="folder-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
}

/**
 * renderSidebar(state)
 * Generates the HTML string representing the entire left Explorer sidebar.
 * Parameters:
 *   - state: Current application state object
 * Returns:
 *   - HTML string template
 */
export function renderSidebar(state) {
  // Destructure sidebar data and interactive inline editing states
  const { sidebarStructure, expandedFolders, activeFileId, inlineAction, inlineValue } = state;

  return `
    <aside class="sidebar vscode-sidebar">
      <!-- Top Brand Header: Logo, Title, and Motto -->
      <div class="sidebar-brand-header">
        <img src="/logo.svg" alt="Boardly Logo" class="sidebar-brand-logo" />
        <div>
          <div class="sidebar-brand-title">Boardly</div>
          <div class="sidebar-brand-tagline">PLAN • ORGANIZE • ACHIEVE</div>
        </div>
      </div>

      <!-- Workspaces Section Header with Quick "+ New File" & "+ New Folder" action icons -->
      <div class="sidebar-section-header">
        <h3 class="sidebar-header-title">WORKSPACES</h3>
        <div class="sidebar-actions">
          <!-- Create new Board action icon -->
          <svg id="btn-add-file" title="New Board" class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3"></rect>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <!-- Create new Workspace Folder action icon -->
          <svg id="btn-add-folder" title="New Workspace Folder" class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            <line x1="12" y1="11" x2="12" y2="17"></line>
            <line x1="9" y1="14" x2="15" y2="14"></line>
          </svg>
        </div>
      </div>

      <!-- Scrollable Tree View of Folders and Board Files -->
      <div class="sidebar-scroll">
        ${sidebarStructure.map(folder => {
          // Check if this particular folder is currently expanded or collapsed
          const isExpanded = !!expandedFolders[folder.id];

          return `
            <!-- Folder Grouping Container -->
            <div class="folder-container" data-folder-id="${folder.id}">
              <!-- Folder Header Row (Click to toggle expand/collapse) -->
              <div class="folder-header" data-action="toggle-folder" data-folder-id="${folder.id}">
                <div class="folder-left">
                  ${renderChevron(isExpanded)}
                  ${renderFolderIcon()}
                  <span class="folder-name">${folder.title}</span>
                </div>
                <!-- Folder Actions: Add file inside folder & Delete folder -->
                <div class="folder-actions">
                  <svg class="folder-action-icon" data-action="new-file-in-folder" data-folder-id="${folder.id}" title="New Board in Folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <svg class="folder-action-icon delete-icon" data-action="delete-folder" data-folder-id="${folder.id}" title="Delete Folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </div>
              </div>

              <!-- Folder Children: Board Files (Rendered only when folder is expanded) -->
              ${isExpanded ? `
                <div class="folder-contents">
                  ${folder.files.map((file, fileIdx) => {
                    // Check if user is currently renaming this specific file
                    const isRenaming = inlineAction?.type === 'rename-file' && inlineAction.fileId === file.id;

                    return `
                      <!-- File Item Row (Click to open board) -->
                      <div class="file-item ${activeFileId === file.id ? 'active' : ''}" data-action="select-file" data-file-id="${file.id}">
                        <div class="file-left">
                          ${getBoardIcon(fileIdx)}
                          ${isRenaming ? `
                            <!-- Inline text input for renaming board -->
                            <input id="sidebar-inline-input" autoFocus class="inline-input rename-inline-input" value="${inlineValue}" placeholder="Board Name" />
                          ` : `
                            <!-- Standard file label text -->
                            <span class="file-label" title="${file.name}">${file.name}</span>
                          `}
                        </div>
                        <!-- File Actions: Rename board and Delete board -->
                        <div class="file-actions">
                          <svg class="file-action-icon edit-icon" data-action="edit-file" data-file-id="${file.id}" data-file-name="${file.name}" title="Rename Board" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          <svg class="file-action-icon delete-icon" data-action="delete-file" data-folder-id="${folder.id}" data-file-id="${file.id}" title="Delete Board" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </div>
                      </div>
                    `;
                  }).join('')}

                  <!-- Inline text input row shown when creating a new board inside this folder -->
                  ${inlineAction?.type === 'file' && inlineAction.targetFolderId === folder.id ? `
                    <div class="file-item inline-create">
                      <div class="file-left">
                        ${getBoardIcon(folder.files.length)}
                        <input id="sidebar-inline-input" autoFocus class="inline-input" value="${inlineValue}" placeholder="New Board Name" />
                      </div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}

        <!-- Inline text input row shown when creating a brand new root folder -->
        ${inlineAction?.type === 'folder' ? `
          <div class="folder-header inline-create">
            <div class="folder-left">
              ${renderChevron(true)}
              ${renderFolderIcon()}
              <input id="sidebar-inline-input" autoFocus class="inline-input folder-inline-input" value="${inlineValue}" placeholder="NEW WORKSPACE" />
            </div>
          </div>
        ` : ''}
      </div>
    </aside>
  `;
}

/**
 * attachSidebarEvents(container)
 * Binds event listeners for sidebar actions, folder collapsing, file switching,
 * inline creation, rename inputs, and keyboard shortcuts (Enter/Escape).
 * Parameters:
 *   - container: The DOM element containing the sidebar markup (#app)
 */
export function attachSidebarEvents(container) {
  // 1. "+ New Board" top header icon click: opens inline creation input in the first folder
  const addFileBtn = container.querySelector('#btn-add-file');
  if (addFileBtn) {
    addFileBtn.addEventListener('click', () => {
      const state = store.getState();
      let targetFolderId = state.sidebarStructure[0]?.id;
      if (!targetFolderId) return; // Guard clause if no folders exist
      // Expand folder and activate file creation inline input
      store.setState({
        expandedFolders: { ...state.expandedFolders, [targetFolderId]: true },
        inlineAction: { type: 'file', targetFolderId },
        inlineValue: ''
      });
    });
  }

  // 2. "+ New Folder" top header icon click: activates inline folder creation input
  const addFolderBtn = container.querySelector('#btn-add-folder');
  if (addFolderBtn) {
    addFolderBtn.addEventListener('click', () => {
      store.setState({
        inlineAction: { type: 'folder' },
        inlineValue: ''
      });
    });
  }

  // 3. Handle Inline Input interactions (focus, live typing, Enter to submit, Escape to cancel)
  const inlineInput = container.querySelector('#sidebar-inline-input');
  if (inlineInput) {
    inlineInput.focus();
    inlineInput.select();
    
    // Keep typed string synced in state
    inlineInput.addEventListener('input', (e) => {
      store.state.inlineValue = e.target.value;
    });

    // Helper function to submit inline creation or rename
    const submitInline = () => {
      const { inlineAction, inlineValue } = store.getState();
      // Dismiss if empty or cancelled
      if (!inlineAction || !inlineValue.trim()) {
        store.setState({ inlineAction: null, inlineValue: '' });
        return;
      }

      // Case A: Create new file inside target folder
      if (inlineAction.type === 'file') {
        store.addFile(inlineAction.targetFolderId, inlineValue);
      } 
      // Case B: Create new folder
      else if (inlineAction.type === 'folder') {
        store.addFolder(inlineValue);
      } 
      // Case C: Rename existing file
      else if (inlineAction.type === 'rename-file') {
        store.renameFile(inlineAction.fileId, inlineValue);
      }
    };

    // Keyboard controls: Enter saves, Escape cancels
    inlineInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submitInline();
      } else if (e.key === 'Escape') {
        store.setState({ inlineAction: null, inlineValue: '' });
      }
    });

    // Auto-save on blur (clicking anywhere outside)
    inlineInput.addEventListener('blur', () => {
      submitInline();
    });
  }

  // 4. Click Event Delegation for Folder toggle, File selection, Deletions, and Rename triggers
  const scrollContainer = container.querySelector('.sidebar-scroll');
  if (scrollContainer) {
    scrollContainer.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.getAttribute('data-action');
      const folderId = target.getAttribute('data-folder-id');
      const fileId = target.getAttribute('data-file-id');
      const fileName = target.getAttribute('data-file-name');

      e.stopPropagation(); // Stop event bubbling

      // Action A: Toggle folder collapse/expand
      if (action === 'toggle-folder') {
        store.toggleFolder(folderId);
      } 
      // Action B: Switch active file / board on screen
      else if (action === 'select-file') {
        store.setActiveFile(fileId);
      } 
      // Action C: Activate inline rename mode on board
      else if (action === 'edit-file') {
        store.setState({
          inlineAction: { type: 'rename-file', fileId },
          inlineValue: fileName || ''
        });
      } 
      // Action D: Delete board file
      else if (action === 'delete-file') {
        store.deleteFile(folderId, fileId);
      } 
      // Action E: Delete entire folder
      else if (action === 'delete-folder') {
        store.deleteFolder(folderId);
      } 
      // Action F: Create new file specifically within this clicked folder
      else if (action === 'new-file-in-folder') {
        const state = store.getState();
        store.setState({
          expandedFolders: { ...state.expandedFolders, [folderId]: true },
          inlineAction: { type: 'file', targetFolderId: folderId },
          inlineValue: ''
        });
      }
    });
  }
}
