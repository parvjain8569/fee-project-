import { store } from '../state.js';

export function renderBoard(state) {
  const { activeFileId, boards, registeredUser } = state;
  const board = activeFileId ? boards[activeFileId] : null;

  if (!board) {
    return `
      <main class="board-canvas">
        <div style="padding: 40px; color: #64748b; font-weight: 500;">
          Select or create a file in the Explorer sidebar to view its Kanban workspace.
        </div>
      </main>
    `;
  }

  const { columns, tasks, columnOrder } = board;

  return `
    <main class="board-canvas" id="board-canvas">
      ${columnOrder.map(colId => {
        const column = columns[colId];
        if (!column) return '';

        const safeTaskIds = Array.isArray(column.taskIds) ? column.taskIds : [];
        const colTasks = safeTaskIds.map(taskId => tasks[taskId]).filter(Boolean);

        return `
          <section class="column" data-col-id="${column.id}">
            <div class="column-header">
              <div class="column-header-left">
                <h3 class="column-title">${column.title}</h3>
                <span class="column-count">${colTasks.length}</span>
              </div>
              <div class="column-actions">
                <button class="icon-btn" data-action="edit-list" data-col-id="${column.id}" data-col-title="${column.title}" title="Edit List Title">✎</button>
                <button class="icon-btn" data-action="delete-list" data-col-id="${column.id}" title="Delete List">🗑</button>
              </div>
            </div>

            <div class="task-list" data-col-id="${column.id}">
              ${colTasks.map(task => {
                const commentCount = Array.isArray(task.comments) ? task.comments.length : 0;
                const userInitial = registeredUser?.name ? registeredUser.name.charAt(0).toUpperCase() : 'U';

                const tagClass = colId.includes('done') ? 'tag-mint' : colId.includes('doing') ? 'tag-purple' : colId.includes('todo') ? 'tag-gold' : 'tag-blue';
                const tagLabel = colId.includes('done') ? 'Completed' : colId.includes('doing') ? 'In Progress' : colId.includes('todo') ? 'Planned' : 'Backlog';

                return `
                  <article class="card" draggable="true" data-task-id="${task.id}" data-col-id="${column.id}">
                    <div class="card-top-bar">
                      <div class="card-tag ${tagClass}">${tagLabel}</div>
                      <div class="card-quick-actions">
                        <button class="card-action-btn" data-action="open-edit-card" data-task-id="${task.id}" title="Edit Card">✏️</button>
                        <button class="card-action-btn delete-btn" data-action="delete-card" data-task-id="${task.id}" title="Delete Card">🗑️</button>
                      </div>
                    </div>
                    <p class="card-text">${task.content}</p>
                    <div class="card-footer">
                      <div class="comment-wrapper">
                        <svg class="comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>${commentCount}</span>
                      </div>
                      <div class="card-avatar">${userInitial}</div>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>

            <button class="btn-add-card" data-action="open-add-card-modal" data-col-id="${column.id}">
              + Add a card
            </button>
          </section>
        `;
      }).join('')}

      <div class="add-list-zone" id="btn-open-add-list-modal">
        <div class="dashed-box">
          <span class="plus-icon">+</span> Add a list
        </div>
      </div>
    </main>
  `;
}

export function attachBoardEvents(container) {
  const canvas = container.querySelector('#board-canvas');
  if (!canvas) return;

  // Click Event Delegation (Modals & Actions)
  canvas.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      const action = actionBtn.getAttribute('data-action');
      const colId = actionBtn.getAttribute('data-col-id');
      const taskId = actionBtn.getAttribute('data-task-id');

      e.stopPropagation();

      if (action === 'open-add-card-modal') {
        store.setState({ activeModal: { type: 'addCard', colId } });
      } else if (action === 'edit-list') {
        const colTitle = actionBtn.getAttribute('data-col-title');
        store.setState({ activeModal: { type: 'editList', colId, title: colTitle } });
      } else if (action === 'delete-list') {
        store.setState({ activeModal: { type: 'deleteList', colId } });
      } else if (action === 'open-edit-card') {
        store.setState({ activeModal: { type: 'cardDetail', taskId } });
      } else if (action === 'delete-card') {
        store.deleteTask(taskId);
      }
      return;
    }

    // Click card to open Detail Modal
    const cardEl = e.target.closest('.card');
    if (cardEl) {
      const taskId = cardEl.getAttribute('data-task-id');
      store.setState({ activeModal: { type: 'cardDetail', taskId } });
    }
  });

  const addListZone = canvas.querySelector('#btn-open-add-list-modal');
  if (addListZone) {
    addListZone.addEventListener('click', () => {
      store.setState({ activeModal: { type: 'addList' } });
    });
  }

  // --- NATIVE HTML5 DRAG AND DROP HANDLERS ---
  let draggedTaskId = null;

  canvas.addEventListener('dragstart', (e) => {
    const cardEl = e.target.closest('.card');
    if (cardEl) {
      draggedTaskId = cardEl.getAttribute('data-task-id');
      e.dataTransfer.setData('text/plain', draggedTaskId);
      e.dataTransfer.effectAllowed = 'move';
      cardEl.classList.add('dragging');
    }
  });

  canvas.addEventListener('dragend', (e) => {
    const cardEl = e.target.closest('.card');
    if (cardEl) {
      cardEl.classList.remove('dragging');
    }
    canvas.querySelectorAll('.task-list').forEach(list => list.classList.remove('drag-over'));
  });

  canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const taskList = e.target.closest('.task-list');
    if (taskList) {
      taskList.classList.add('drag-over');
    }
  });

  canvas.addEventListener('dragleave', (e) => {
    const taskList = e.target.closest('.task-list');
    if (taskList && !taskList.contains(e.relatedTarget)) {
      taskList.classList.remove('drag-over');
    }
  });

  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    canvas.querySelectorAll('.task-list').forEach(list => list.classList.remove('drag-over'));

    const taskList = e.target.closest('.task-list');
    if (!taskList || !draggedTaskId) return;

    const targetColId = taskList.getAttribute('data-col-id');

    // Calculate position index based on drop coordinates
    const cardsInCol = Array.from(taskList.querySelectorAll('.card:not(.dragging)'));
    let dropIndex = cardsInCol.length;

    for (let i = 0; i < cardsInCol.length; i++) {
      const box = cardsInCol[i].getBoundingClientRect();
      const offset = e.clientY - box.top - box.height / 2;
      if (offset < 0) {
        dropIndex = i;
        break;
      }
    }

    store.moveTask(draggedTaskId, targetColId, dropIndex);
    draggedTaskId = null;
  });
}
