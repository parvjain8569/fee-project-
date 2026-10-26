/**
 * ==========================================================================
 * BOARDLY — MODAL DIALOGS COMPONENT
 * File: /src/components/Modals.js
 * Purpose: Renders dynamic popup overlays and interactive modal dialogs for:
 *          1. Adding a new list (column)
 *          2. Renaming an existing list
 *          3. Confirming list deletion
 *          4. Adding a new task card
 *          5. Viewing/editing card details (title, description, and comments)
 * ==========================================================================
 */

// Import central store to read activeModal state and dispatch modification actions
import { store } from '../state.js';

/**
 * renderModals(state)
 * Inspects state.activeModal and returns the appropriate modal dialog markup.
 * Parameters:
 *   - state: Current application state object
 * Returns:
 *   - HTML string template (or empty string if no modal is active)
 */
export function renderModals(state) {
  // Destructure active modal descriptor and active board data
  const { activeModal, activeFileId, boards } = state;
  // If activeModal is null, render nothing into #modal-root
  if (!activeModal) return '';

  // Get active board data object
  const board = activeFileId ? boards[activeFileId] : null;

  // MODAL TYPE 1: "Add New List" (Creates a new column on the board)
  if (activeModal.type === 'addList') {
    return `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-card">
          <!-- Modal Top Header with Title and Close '×' Button -->
          <div class="modal-header">
            <h3 class="modal-title">Add New List</h3>
            <button class="btn-close" id="btn-modal-close">×</button>
          </div>
          <!-- Modal Body with Title Input Field -->
          <div class="modal-body">
            <div class="input-group">
              <label>List Title</label>
              <input type="text" id="modal-input-title" autoFocus placeholder="e.g. In Review" />
            </div>
          </div>
          <!-- Modal Action Buttons -->
          <div class="modal-footer">
            <button class="btn-cancel" id="btn-modal-cancel">Cancel</button>
            <button class="btn-confirm" id="btn-modal-save">Add List</button>
          </div>
        </div>
      </div>
    `;
  }

  // MODAL TYPE 2: "Rename List" (Edits existing column name)
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
              <!-- Pre-populate input with current list title -->
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

  // MODAL TYPE 3: "Delete List Confirmation"
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

  // MODAL TYPE 4: "Add New Card" (Creates card inside target column)
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

  // MODAL TYPE 5: "Card Detail & Comments Dialog"
  if (activeModal.type === 'cardDetail' && board) {
    const task = board.tasks[activeModal.taskId];
    if (!task) return ''; // Guard against missing task record

    // Extract comments array
    const comments = Array.isArray(task.comments) ? task.comments : [];

    return `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-card" style="max-width: 560px;">
          <!-- Header with Title and Close Button -->
          <div class="modal-header">
            <h3 class="modal-title">Edit Card</h3>
            <button class="btn-close" id="btn-modal-close">×</button>
          </div>

          <!-- Body with Card Title, Description, and Comment Thread -->
          <div class="modal-body">
            <!-- Edit Card Headline / Title -->
            <div class="input-group">
              <label>Card Title</label>
              <input type="text" id="modal-input-card-title" value="${task.content || ''}" placeholder="Enter card title..." />
            </div>

            <!-- Edit Card Detailed Description -->
            <div class="input-group">
              <label>Description</label>
              <textarea id="modal-input-desc" rows="3" placeholder="Add a detailed description...">${task.description || ''}</textarea>
            </div>

            <!-- Comments Discussion Section -->
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

              <!-- Input to write and post a new comment -->
              <div class="input-group" style="margin-top: 8px;">
                <input type="text" id="modal-input-new-comment" placeholder="Write a comment..." />
              </div>
            </div>
          </div>

          <!-- Footer with Delete Card and Save Changes buttons -->
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

/**
 * attachModalEvents(container)
 * Binds click events for closing modals, saving additions, renaming lists,
 * deleting items, and posting comments.
 * Parameters:
 *   - container: The DOM element containing the modal markup (#modal-root)
 */
export function attachModalEvents(container) {
  const overlay = container.querySelector('#modal-overlay');
  if (!overlay) return; // Guard clause if no modal is currently rendered

  // Helper function to dismiss the active modal
  const closeModal = () => store.setState({ activeModal: null });

  // 1. Close modal if user clicks on the darkened backdrop outside the card
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // 2. Close modal on top-right '×' button click
  const closeBtn = overlay.querySelector('#btn-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // 3. Close modal on bottom 'Cancel' / 'Close' button click
  const cancelBtn = overlay.querySelector('#btn-modal-cancel');
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // 4. Save handler for Add List or Rename List
  const saveListBtn = overlay.querySelector('#btn-modal-save');
  if (saveListBtn) {
    saveListBtn.addEventListener('click', () => {
      const input = overlay.querySelector('#modal-input-title');
      const text = input ? input.value : '';
      const { activeModal } = store.getState();
      if (!activeModal) return;

      if (activeModal.type === 'addList') {
        store.addList(text); // Create new column
      } else if (activeModal.type === 'editList') {
        store.renameList(activeModal.colId, text); // Rename existing column
      }
      closeModal();
    });
  }

  // 5. Confirm handler for Deleting a List
  const deleteListConfirmBtn = overlay.querySelector('#btn-modal-delete-confirm');
  if (deleteListConfirmBtn) {
    deleteListConfirmBtn.addEventListener('click', () => {
      const { activeModal } = store.getState();
      if (activeModal && activeModal.colId) {
        store.deleteList(activeModal.colId); // Remove column and all its tasks
      }
      closeModal();
    });
  }

  // 6. Save handler for Adding a new Card
  const saveCardBtn = overlay.querySelector('#btn-modal-save-card');
  if (saveCardBtn) {
    saveCardBtn.addEventListener('click', () => {
      const textarea = overlay.querySelector('#modal-input-card-text');
      const text = textarea ? textarea.value : '';
      const { activeModal } = store.getState();
      if (activeModal && activeModal.colId) {
        store.addCard(activeModal.colId, text); // Add card to target column
      }
      closeModal();
    });
  }

  // 7. Delete task handler from inside the Card Detail modal
  const deleteTaskBtn = overlay.querySelector('#btn-modal-delete-task');
  if (deleteTaskBtn) {
    deleteTaskBtn.addEventListener('click', () => {
      const { activeModal } = store.getState();
      if (activeModal && activeModal.taskId) {
        store.deleteTask(activeModal.taskId); // Remove task
      }
      closeModal();
    });
  }

  // 8. Save handler for Card Details (Title, Description, and new Comment)
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
