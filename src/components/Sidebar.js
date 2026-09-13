import { store } from '../state.js';

export function renderSidebar(state) {
  const { sidebarStructure, expandedFolders, activeFileId, inlineAction, inlineValue } = state;

  return `
    <aside class="sidebar vscode-sidebar">
      <div class="sidebar-brand-header">
        <img src="/logo.png" alt="Boardly Logo" class="sidebar-brand-logo" />
        <div>
          <div class="sidebar-brand-title">Boardly</div>
          <div class="sidebar-brand-tagline">PLAN • ORGANIZE • ACHIEVE</div>
        </div>
      </div>

      <div class="sidebar-section-header">
        <h3 class="sidebar-header-title">EXPLORER</h3>
        <div class="sidebar-actions">
          <svg id="btn-add-file" title="New File" class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <svg id="btn-add-folder" title="New Folder" class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            <line x1="12" y1="11" x2="12" y2="17"></line>
            <line x1="9" y1="14" x2="15" y2="14"></line>
          </svg>
        </div>
      </div>

      <div class="sidebar-scroll">
        ${sidebarStructure.map(folder => {
          const isExpanded = !!expandedFolders[folder.id];
          return `
            <div class="folder-container" data-folder-id="${folder.id}">
              <div class="folder-header" data-action="toggle-folder" data-folder-id="${folder.id}">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="chevron">${isExpanded ? 'v' : '>'}</span>
                  <span class="folder-name">${folder.title}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <svg class="delete-icon" data-action="new-file-in-folder" data-folder-id="${folder.id}" title="New File Here" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                  <svg class="delete-icon" data-action="delete-folder" data-folder-id="${folder.id}" title="Delete Folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </div>
              </div>

              ${isExpanded ? `
                <div class="folder-contents">
                  ${folder.files.map(file => `
                    <div class="file-item ${activeFileId === file.id ? 'active' : ''}" data-action="select-file" data-file-id="${file.id}">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span class="file-icon">{ }</span>
                        <span>${file.name}</span>
                      </div>
                      <svg class="delete-icon" data-action="delete-file" data-folder-id="${folder.id}" data-file-id="${file.id}" title="Delete File" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </div>
                  `).join('')}

                  ${inlineAction?.type === 'file' && inlineAction.targetFolderId === folder.id ? `
                    <div class="file-item">
                      <span class="file-icon">{ }</span>
                      <input id="sidebar-inline-input" autoFocus class="inline-input" value="${inlineValue}" placeholder="filename.js" />
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}

        ${inlineAction?.type === 'folder' ? `
          <div class="folder-header">
            <span class="chevron">></span>
            <input id="sidebar-inline-input" autoFocus class="inline-input folder-inline-input" value="${inlineValue}" placeholder="FOLDER NAME" />
          </div>
        ` : ''}
      </div>
    </aside>
  `;
}

export function attachSidebarEvents(container) {
  const addFileBtn = container.querySelector('#btn-add-file');
  if (addFileBtn) {
    addFileBtn.addEventListener('click', () => {
      const state = store.getState();
      let targetFolderId = state.sidebarStructure[0]?.id;
      if (!targetFolderId) return;
      store.setState({
        expandedFolders: { ...state.expandedFolders, [targetFolderId]: true },
        inlineAction: { type: 'file', targetFolderId },
        inlineValue: ''
      });
    });
  }

  const addFolderBtn = container.querySelector('#btn-add-folder');
  if (addFolderBtn) {
    addFolderBtn.addEventListener('click', () => {
      store.setState({
        inlineAction: { type: 'folder' },
        inlineValue: ''
      });
    });
  }

  // Handle inline input typing and submit
  const inlineInput = container.querySelector('#sidebar-inline-input');
  if (inlineInput) {
    inlineInput.focus();
    inlineInput.addEventListener('input', (e) => {
      store.state.inlineValue = e.target.value;
    });

    const submitInline = () => {
      const { inlineAction, inlineValue } = store.getState();
      if (!inlineAction || !inlineValue.trim()) {
        store.setState({ inlineAction: null, inlineValue: '' });
        return;
      }

      if (inlineAction.type === 'file') {
        store.addFile(inlineAction.targetFolderId, inlineValue);
      } else if (inlineAction.type === 'folder') {
        store.addFolder(inlineValue);
      }
    };

    inlineInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submitInline();
      } else if (e.key === 'Escape') {
        store.setState({ inlineAction: null, inlineValue: '' });
      }
    });

    inlineInput.addEventListener('blur', () => {
      submitInline();
    });
  }

  // Event Delegation for Folder toggle, File selection, Deletions
  const scrollContainer = container.querySelector('.sidebar-scroll');
  if (scrollContainer) {
    scrollContainer.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.getAttribute('data-action');
      const folderId = target.getAttribute('data-folder-id');
      const fileId = target.getAttribute('data-file-id');

      e.stopPropagation();

      if (action === 'toggle-folder') {
        store.toggleFolder(folderId);
      } else if (action === 'select-file') {
        store.setActiveFile(fileId);
      } else if (action === 'delete-file') {
        store.deleteFile(folderId, fileId);
      } else if (action === 'delete-folder') {
        store.deleteFolder(folderId);
      } else if (action === 'new-file-in-folder') {
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
