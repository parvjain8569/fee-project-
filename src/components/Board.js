/**
 * ==========================================================================
 * BOARDLY — KANBAN BOARD & DRAG-AND-DROP COMPONENT
 * File: /src/components/Board.js
 * Purpose: Renders the multi-column Kanban canvas, task cards, status badges,
 *          comment counts, action triggers (add card, edit list, delete list),
 *          and implements native HTML5 drag-and-drop mechanics.
 * ==========================================================================
 */

// Import central reactive store for reading boards and dispatching card/list modifications
import { store } from '../state.js';

/**
 * renderBoard(state)
 * Generates the full HTML markup for the active board's Kanban canvas.
 * Parameters:
 *   - state: Current application state object
 * Returns:
 *   - HTML string template
 */
export function renderBoard(state) {
  // Destructure active file and boards dictionary from state
  const { activeFileId, boards, registeredUser } = state;
  // Retrieve the board object for the currently opened file ID
  const board = activeFileId ? boards[activeFileId] : null;

  // If no board is active or found, display a helpful empty state placeholder
  if (!board) {
    return `
      <main class="board-canvas">
        <div style="padding: 40px; color: #64748b; font-weight: 500;">
          Select or create a file in the Explorer sidebar to view its Kanban workspace.
        </div>
      </main>
    `;
  }

  // Destructure columns, tasks dictionary, and column display order array
  const { columns, tasks, columnOrder } = board;

  // Render the horizontal Kanban board canvas
  return `
    <main class="board-canvas" id="board-canvas">
      <!-- Iterate through each column ID in the prescribed order -->
      ${columnOrder.map(colId => {
    const column = columns[colId];
    if (!column) return ''; // Guard against invalid column IDs

    // Safely extract tasks that belong to this column
    const safeTaskIds = Array.isArray(column.taskIds) ? column.taskIds : [];
    const colTasks = safeTaskIds.map(taskId => tasks[taskId]).filter(Boolean);

    return `
          <!-- Individual Column Container -->
          <section class="column" data-col-id="${column.id}">
            <!-- Column Header with Title, Card Count, and Actions -->
            <div class="column-header">
              <div class="column-header-left">
                <!-- Column Title (e.g. Upcoming, In Progress, Done) -->
                <h3 class="column-title">${column.title}</h3>
                <!-- Badge showing total number of cards in this column -->
                <span class="column-count">${colTasks.length}</span>
              </div>
              <div class="column-actions">
                <!-- Edit / Rename column title button -->
                <button class="icon-btn" data-action="edit-list" data-col-id="${column.id}" data-col-title="${column.title}" title="Edit List Title">✎</button>
                <!-- Delete entire column button -->
                <button class="icon-btn" data-action="delete-list" data-col-id="${column.id}" title="Delete List">🗑</button>
              </div>
            </div>

            <!-- Task List Drop Zone containing draggable cards -->
            <div class="task-list" data-col-id="${column.id}">
              ${colTasks.map(task => {
      // Determine comment counter and user avatar letter
      const commentCount = Array.isArray(task.comments) ? task.comments.length : 0;
      const userInitial = registeredUser?.name ? registeredUser.name.charAt(0).toUpperCase() : 'U';

      // Assign status pill tag styles based on column type
      const tagClass = colId.includes('done') ? 'tag-mint' : (colId.includes('doing') || colId.includes('progress')) ? 'tag-purple' : colId.includes('todo') ? 'tag-gold' : 'tag-blue';
      const tagLabel = colId.includes('done') ? 'Completed' : (colId.includes('doing') || colId.includes('progress')) ? 'In Progress' : colId.includes('todo') ? 'Planned' : 'Upcoming';

      return `
                  <!-- Draggable Task Card -->
                  <article class="card" draggable="true" data-task-id="${task.id}" data-col-id="${column.id}">
                    <!-- Card Top Header: Status Tag Pill & Quick Action Buttons -->
                    <div class="card-top-bar">
                      <div class="card-tag ${tagClass}">${tagLabel}</div>
                      <div class="card-quick-actions">
                        <!-- Quick Edit Card Button -->
                        <button class="card-action-btn" data-action="open-edit-card" data-task-id="${task.id}" title="Edit Card">✏️</button>
                        <!-- Delete Card Button -->
                        <button class="card-action-btn delete-btn" data-action="delete-card" data-task-id="${task.id}" title="Delete Card">🗑️</button>
                      </div>
                    </div>
                    <!-- Card Main Text Content / Title -->
                    <p class="card-text">${task.content}</p>
                    <!-- Card Footer: Discussion Comment Count & User Initial Avatar -->
                    <div class="card-footer">
                      <div class="comment-wrapper">
                        <!-- Comment Speech Bubble Icon -->
                        <svg class="comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>${commentCount}</span>
                      </div>
                      <!-- Assignee User Avatar Circle -->
                      <div class="card-avatar">${userInitial}</div>
                    </div>
                  </article>
                `;
    }).join('')}
            </div>

            <!-- "+ Add a card" button pinned at bottom of column -->
            <button class="btn-add-card" data-action="open-add-card-modal" data-col-id="${column.id}">
              + Add a card
            </button>
          </section>
        `;
  }).join('')}

      <!-- "+ Add a list" Dashed Drop Zone to create new columns -->
      <div class="add-list-zone" id="btn-open-add-list-modal">
        <div class="dashed-box">
          <span class="plus-icon">+</span> Add a list
        </div>
      </div>
    </main>
  `;
}

/**
 * attachBoardEvents(container)
 * Attaches event delegation for card clicks, modal triggers, and native HTML5 Drag and Drop.
 * Parameters:
 *   - container: The DOM element containing the board markup (#app)
 */
export function attachBoardEvents(container) {
  const canvas = container.querySelector('#board-canvas');
  if (!canvas) return; // Guard clause if canvas is not in DOM

  // 1. Click Event Delegation for Buttons and Cards
  canvas.addEventListener('click', (e) => {
    // Check if click was on a specific action button with data-action attribute
    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      const action = actionBtn.getAttribute('data-action');
      const colId = actionBtn.getAttribute('data-col-id');
      const taskId = actionBtn.getAttribute('data-task-id');

      e.stopPropagation(); // Stop event bubbling so card details modal does not accidentally open

      // Case A: Open Add Card Modal for this column
      if (action === 'open-add-card-modal') {
        store.setState({ activeModal: { type: 'addCard', colId } });
      }
      // Case B: Open Edit / Rename List Modal
      else if (action === 'edit-list') {
        const colTitle = actionBtn.getAttribute('data-col-title');
        store.setState({ activeModal: { type: 'editList', colId, title: colTitle } });
      }
      // Case C: Open Delete List Confirmation Modal
      else if (action === 'delete-list') {
        store.setState({ activeModal: { type: 'deleteList', colId } });
      }
      // Case D: Open Edit Card Details Modal
      else if (action === 'open-edit-card') {
        store.setState({ activeModal: { type: 'cardDetail', taskId } });
      }
      // Case E: Delete Card Directly
      else if (action === 'delete-card') {
        store.deleteTask(taskId);
      }
      return;
    }

    // Case F: Click anywhere on the card body opens the Card Detail & Comments Modal
    const cardEl = e.target.closest('.card');
    if (cardEl) {
      const taskId = cardEl.getAttribute('data-task-id');
      store.setState({ activeModal: { type: 'cardDetail', taskId } });
    }
  });

  // 2. Open Add List Modal trigger
  const addListZone = canvas.querySelector('#btn-open-add-list-modal');
  if (addListZone) {
    addListZone.addEventListener('click', () => {
      store.setState({ activeModal: { type: 'addList' } });
    });
  }

  // --- NATIVE HTML5 DRAG AND DROP MECHANICS ---
  let draggedTaskId = null; // Stores ID of currently dragged card

  // Event 1: dragstart — user begins dragging a card
  canvas.addEventListener('dragstart', (e) => {
    const cardEl = e.target.closest('.card');
    if (cardEl) {
      draggedTaskId = cardEl.getAttribute('data-task-id');
      e.dataTransfer.setData('text/plain', draggedTaskId);
      e.dataTransfer.effectAllowed = 'move';
      cardEl.classList.add('dragging'); // Add CSS class for reduced opacity & rotation
    }
  });

  // Event 2: dragend — user finishes or cancels dragging
  canvas.addEventListener('dragend', (e) => {
    const cardEl = e.target.closest('.card');
    if (cardEl) {
      cardEl.classList.remove('dragging'); // Restore normal card appearance
    }
    // Remove visual drag-over indicator from all columns
    canvas.querySelectorAll('.task-list').forEach(list => list.classList.remove('drag-over'));
  });

  // Event 3: dragover — card is hovered over a column drop target
  canvas.addEventListener('dragover', (e) => {
    e.preventDefault(); // Necessary to allow drop
    e.dataTransfer.dropEffect = 'move';

    const taskList = e.target.closest('.task-list');
    if (taskList) {
      taskList.classList.add('drag-over'); // Highlight active drop column
    }
  });

  // Event 4: dragleave — card leaves a column area
  canvas.addEventListener('dragleave', (e) => {
    const taskList = e.target.closest('.task-list');
    if (taskList && !taskList.contains(e.relatedTarget)) {
      taskList.classList.remove('drag-over'); // Remove column highlight
    }
  });

  // Event 5: drop — user releases mouse and drops the card into target column
  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    // Clean up all visual drop indicators
    canvas.querySelectorAll('.task-list').forEach(list => list.classList.remove('drag-over'));

    const taskList = e.target.closest('.task-list');
    if (!taskList || !draggedTaskId) return;

    // Target Column ID where card was dropped
    const targetColId = taskList.getAttribute('data-col-id');

    // Calculate position index in column based on vertical cursor coordinates
    const cardsInCol = Array.from(taskList.querySelectorAll('.card:not(.dragging)'));
    let dropIndex = cardsInCol.length; // Default to bottom of list

    // Check vertical offset against existing cards in the column
    for (let i = 0; i < cardsInCol.length; i++) {
      const box = cardsInCol[i].getBoundingClientRect();
      const offset = e.clientY - box.top - box.height / 2;
      if (offset < 0) {
        dropIndex = i; // Insert before this card
        break;
      }
    }

    // Dispatch reorder/move action to state store
    store.moveTask(draggedTaskId, targetColId, dropIndex);
    draggedTaskId = null; // Reset tracked card
  });
}
