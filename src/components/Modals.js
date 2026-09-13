import { store } from '../state.js';

export function renderModals(state) {
  const { activeModal, activeFileId, boards } = state;
  if (!activeModal) return '';

  const board = activeFileId ? boards[activeFileId] : null;

  if (activeModal.type === 'addList') {
    return `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">Add New List</h3>
            <button class="btn-close" id="btn-modal-close">×</button>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <label>List Title</label>
              <input type="text" id="modal-input-title" autoFocus placeholder="e.g. In Review" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" id="btn-modal-cancel">Cancel</button>
            <button class="btn-confirm" id="btn-modal-save">Add List</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal.type === 'editList') {
    return `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">Rename List</h3>
            <button class="btn-close" id="btn-modal-close">×</button>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <label>List Title</label>
              <input type="text" id="modal-input-title" autoFocus value="${activeModal.title || ''}" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" id="btn-modal-cancel">Cancel</button>
            <button class="btn-confirm" id="btn-modal-save">Save Title</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal.type === 'deleteList') {
    return `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">Delete List</h3>
            <button class="btn-close" id="btn-modal-close">×</button>
          </div>
          <div class="modal-body">
            <p style="color: #64748b; font-size: 0.95rem;">Are you sure you want to delete this list and all its cards? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" id="btn-modal-cancel">Cancel</button>
            <button class="btn-danger" id="btn-modal-delete-confirm">Delete List</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal.type === 'addCard') {
    return `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">Add New Card</h3>
            <button class="btn-close" id="btn-modal-close">×</button>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <label>Card Content</label>
              <textarea id="modal-input-card-text" rows="3" autoFocus placeholder="Enter card title or description..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" id="btn-modal-cancel">Cancel</button>
            <button class="btn-confirm" id="btn-modal-save-card">Add Card</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal.type === 'cardDetail' && board) {
    const task = board.tasks[activeModal.taskId];
    if (!task) return '';

    const comments = Array.isArray(task.comments) ? task.comments : [];

    return `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-card" style="max-width: 560px;">
          <div class="modal-header">
            <h3 class="modal-title">Edit Card</h3>
            <button class="btn-close" id="btn-modal-close">×</button>
          </div>

          <div class="modal-body">
            <div class="input-group">
              <label>Card Title</label>
              <input type="text" id="modal-input-card-title" value="${task.content || ''}" placeholder="Enter card title..." />
            </div>

            <div class="input-group">
              <label>Description</label>
              <textarea id="modal-input-desc" rows="3" placeholder="Add a detailed description...">${task.description || ''}</textarea>
            </div>

            <div class="comments-section">
              <label style="font-size:0.82rem; font-weight:700; color:#334155;">Comments (${comments.length})</label>
              ${comments.length > 0 ? `
                <div style="max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                  ${comments.map(c => `
                    <div class="comment-item">
                      <div class="comment-author">${c.userName}</div>
                      <div class="comment-text">${c.text}</div>
                    </div>
                  `).join('')}
                </div>
              ` : `<div style="font-size:0.85rem; color:#94a3b8;">No comments yet. Be the first to comment!</div>`}

              <div class="input-group" style="margin-top: 8px;">
                <input type="text" id="modal-input-new-comment" placeholder="Write a comment..." />
              </div>
            </div>
          </div>

          <div class="modal-footer" style="justify-content: space-between;">
            <button class="btn-danger" id="btn-modal-delete-task">Delete Card</button>
            <div style="display: flex; gap: 10px;">
              <button class="btn-cancel" id="btn-modal-cancel">Close</button>
              <button class="btn-confirm" id="btn-modal-save-detail">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return '';
}

export function attachModalEvents(container) {
  const overlay = container.querySelector('#modal-overlay');
  if (!overlay) return;

  const closeModal = () => store.setState({ activeModal: null });

  // Close on backdrop click or close/cancel button
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  const closeBtn = overlay.querySelector('#btn-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  const cancelBtn = overlay.querySelector('#btn-modal-cancel');
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Add/Edit List Save
  const saveListBtn = overlay.querySelector('#btn-modal-save');
  if (saveListBtn) {
    saveListBtn.addEventListener('click', () => {
      const input = overlay.querySelector('#modal-input-title');
      const text = input ? input.value : '';
      const { activeModal } = store.getState();
      if (!activeModal) return;

      if (activeModal.type === 'addList') {
        store.addList(text);
      } else if (activeModal.type === 'editList') {
        store.renameList(activeModal.colId, text);
      }
      closeModal();
    });
  }

  // Delete List Confirm
  const deleteListConfirmBtn = overlay.querySelector('#btn-modal-delete-confirm');
  if (deleteListConfirmBtn) {
    deleteListConfirmBtn.addEventListener('click', () => {
      const { activeModal } = store.getState();
      if (activeModal && activeModal.colId) {
        store.deleteList(activeModal.colId);
      }
      closeModal();
    });
  }

  // Add Card Save
  const saveCardBtn = overlay.querySelector('#btn-modal-save-card');
  if (saveCardBtn) {
    saveCardBtn.addEventListener('click', () => {
      const textarea = overlay.querySelector('#modal-input-card-text');
      const text = textarea ? textarea.value : '';
      const { activeModal } = store.getState();
      if (activeModal && activeModal.colId) {
        store.addCard(activeModal.colId, text);
      }
      closeModal();
    });
  }

  // Delete Card from inside detail modal
  const deleteTaskBtn = overlay.querySelector('#btn-modal-delete-task');
  if (deleteTaskBtn) {
    deleteTaskBtn.addEventListener('click', () => {
      const { activeModal } = store.getState();
      if (activeModal && activeModal.taskId) {
        store.deleteTask(activeModal.taskId);
      }
      closeModal();
    });
  }

  // Card Detail Save (title, description & new comment)
  const saveDetailBtn = overlay.querySelector('#btn-modal-save-detail');
  if (saveDetailBtn) {
    saveDetailBtn.addEventListener('click', () => {
      const titleInput = overlay.querySelector('#modal-input-card-title');
      const descInput = overlay.querySelector('#modal-input-desc');
      const commentInput = overlay.querySelector('#modal-input-new-comment');
      const { activeModal } = store.getState();
      if (activeModal && activeModal.taskId) {
        store.updateTask(
          activeModal.taskId,
          titleInput ? titleInput.value : undefined,
          descInput ? descInput.value : undefined,
          commentInput ? commentInput.value : ''
        );
      }
      closeModal();
    });
  }
}
