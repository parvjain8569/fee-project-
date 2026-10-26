/**
 * ==========================================================================
 * BOARDLY — CENTRAL REACTIVE STATE STORE & STORAGE MANAGER
 * File: /src/state.js
 * Purpose: Implements an immutable Observer (Pub/Sub) pattern StateStore
 *          that manages all application data (workspaces, folders, boards,
 *          columns, cards, comments, user auth) and syncs everything to
 *          browser LocalStorage so data persists across reloads.
 * ==========================================================================
 */

// Import default workspace data and seed boards from data.js
import { initialSidebarStructure, initialBoardsData } from './data.js';

// LocalStorage Keys for persistent client-side data
const SIDEBAR_KEY = 'boardly-v8-sidebar'; // Key for folders and board file tree
const BOARDS_KEY = 'boardly-v8-boards';   // Key for board columns, cards, and comments
const USER_KEY = 'boardly-v8-user';       // Key for registered user credentials

/**
 * loadInitialState()
 * Reads cached data from LocalStorage; falls back to seed defaults if first visit.
 * Returns:
 *   - Complete initial application state object
 */
function loadInitialState() {
  let sidebar = null;
  let boards = null;
  let user = null;

  try {
    // Attempt to load previously saved folder structure
    const rawSidebar = localStorage.getItem(SIDEBAR_KEY);
    if (rawSidebar) sidebar = JSON.parse(rawSidebar);

    // Attempt to load previously saved board data
    const rawBoards = localStorage.getItem(BOARDS_KEY);
    if (rawBoards) boards = JSON.parse(rawBoards);

    // Attempt to load previously saved user account
    const rawUser = localStorage.getItem(USER_KEY);
    if (rawUser) user = JSON.parse(rawUser);
  } catch (e) {
    console.error('Error loading LocalStorage state:', e);
  }

  // Use loaded LocalStorage data or fall back to seed files
  const initialSidebar = sidebar || initialSidebarStructure;
  const initialBoards = boards || initialBoardsData;

  // Find the first available file to open automatically on startup
  let firstFileId = null;
  if (initialSidebar.length > 0 && initialSidebar[0].files.length > 0) {
    firstFileId = initialSidebar[0].files[0].id;
  }

  // Construct and return baseline state tree
  return {
    view: 'website',                        // Active screen: 'website' | 'login' | 'register'
    isLoggedIn: false,                      // Authentication flag
    registeredUser: user || null,           // Registered user profile { name, surname, email, password }
    sidebarStructure: initialSidebar,       // List of folders and their board files
    expandedFolders: { 'folder-1': true, 'folder-2': true }, // Tracking which folders are opened
    activeFileId: firstFileId,              // ID of the currently selected/open board file
    boards: initialBoards,                  // Dictionary of all board objects containing columns & tasks
    activeModal: null,                      // Active modal popup descriptor: { type, colId, taskId, ... }
    inlineAction: null,                     // Inline sidebar action: { type: 'file'|'folder'|'rename-file', targetFolderId, fileId }
    inlineValue: ''                         // Temporary string buffer for inline text inputs
  };
}

/**
 * StateStore Class
 * Central state container providing reactive subscriptions and atomic mutation methods.
 */
class StateStore {
  constructor() {
    this.state = loadInitialState(); // Initialize state from LocalStorage or defaults
    this.listeners = [];             // List of callback functions subscribed to state changes
  }

  /**
   * getState()
   * Returns current immutable snapshot of the application state.
   */
  getState() {
    return this.state;
  }

  /**
   * setState(updater)
   * Merges partial state updates, triggers LocalStorage persistence, and notifies subscribers.
   */
  setState(updater) {
    // Support functional updater (s => ({ ... })) or plain object
    const nextState = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...nextState }; // Merge immutably
    this.saveToStorage();                          // Persist changes to browser LocalStorage
    this.notify();                                 // Trigger re-render across UI
  }

  /**
   * saveToStorage()
   * Serializes active state properties into browser LocalStorage.
   */
  saveToStorage() {
    try {
      localStorage.setItem(SIDEBAR_KEY, JSON.stringify(this.state.sidebarStructure));
      localStorage.setItem(BOARDS_KEY, JSON.stringify(this.state.boards));
      if (this.state.registeredUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(this.state.registeredUser));
      }
    } catch (e) {
      console.error('Error saving to LocalStorage:', e);
    }
  }

  /**
   * subscribe(listener)
   * Registers a callback function to run whenever state updates.
   * Returns an unsubscribe function.
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * notify()
   * Calls all registered listener callbacks with the new state snapshot.
   */
  notify() {
    this.listeners.forEach(l => l(this.state));
  }

  // ==========================================================================
  // HELPER ACTION METHODS — MUTATIONS
  // ==========================================================================

  /**
   * setActiveFile(fileId)
   * Switches active board workspace to selected fileId.
   * If board doesn't exist yet, initializes empty default columns.
   */
  setActiveFile(fileId) {
    this.setState(s => {
      const nextBoards = { ...s.boards };
      if (!nextBoards[fileId]) {
        // Find filename from sidebar
        let fileName = 'New File';
        for (const folder of s.sidebarStructure) {
          const found = folder.files.find(f => f.id === fileId);
          if (found) {
            fileName = found.name;
            break;
          }
        }
        // Create initial default columns for new board
        nextBoards[fileId] = {
          id: fileId,
          name: fileName,
          columns: {
            'col-todo': { id: 'col-todo', title: 'To Do', taskIds: [] },
            'col-doing': { id: 'col-doing', title: 'Doing', taskIds: [] },
            'col-done': { id: 'col-done', title: 'Done', taskIds: [] }
          },
          tasks: {},
          columnOrder: ['col-todo', 'col-doing', 'col-done']
        };
      }
      return { activeFileId: fileId, boards: nextBoards };
    });
  }

  /**
   * toggleFolder(folderId)
   * Flips expanded/collapsed boolean for the target sidebar folder.
   */
  toggleFolder(folderId) {
    this.setState(s => ({
      expandedFolders: {
        ...s.expandedFolders,
        [folderId]: !s.expandedFolders[folderId]
      }
    }));
  }

  /**
   * addCard(colId, text)
   * Creates a new card task inside the specified column of the active board.
   */
  addCard(colId, text) {
    const { activeFileId, boards } = this.state;
    if (!activeFileId || !text.trim()) return;

    const board = boards[activeFileId];
    if (!board) return;

    const taskId = 'task-' + Date.now(); // Generate unique task ID
    const newTask = {
      id: taskId,
      content: text.trim(),
      description: '',
      comments: []
    };

    const targetCol = board.columns[colId];
    const updatedCol = {
      ...targetCol,
      taskIds: [...targetCol.taskIds, taskId] // Append new card to column
    };

    const updatedBoard = {
      ...board,
      tasks: { ...board.tasks, [taskId]: newTask },
      columns: { ...board.columns, [colId]: updatedCol }
    };

    this.setState({
      boards: { ...boards, [activeFileId]: updatedBoard }
    });
  }

  /**
   * moveTask(taskId, targetColId, newIndex)
   * Moves a card between columns or reorders within the same column during drag-and-drop.
   */
  moveTask(taskId, targetColId, newIndex) {
    const { activeFileId, boards } = this.state;
    if (!activeFileId) return;

    const board = boards[activeFileId];
    if (!board) return;

    // Find current source column holding the task
    let sourceColId = null;
    for (const [cId, col] of Object.entries(board.columns)) {
      if (col.taskIds.includes(taskId)) {
        sourceColId = cId;
        break;
      }
    }

    if (!sourceColId) return; // Guard clause

    const sourceCol = board.columns[sourceColId];
    const targetCol = board.columns[targetColId];

    // Remove task ID from source column
    const newSourceTaskIds = sourceCol.taskIds.filter(id => id !== taskId);

    let newTargetTaskIds;
    if (sourceColId === targetColId) {
      // Reordering within the exact same column
      newTargetTaskIds = [...newSourceTaskIds];
      newTargetTaskIds.splice(newIndex, 0, taskId); // Insert at calculated drop index
    } else {
      // Moving to a different column
      newTargetTaskIds = [...targetCol.taskIds];
      newTargetTaskIds.splice(newIndex, 0, taskId); // Insert into target column
    }

    const updatedColumns = {
      ...board.columns,
      [sourceColId]: { ...sourceCol, taskIds: newSourceTaskIds },
      [targetColId]: { ...targetCol, taskIds: newTargetTaskIds }
    };

    this.setState({
      boards: {
        ...boards,
        [activeFileId]: { ...board, columns: updatedColumns }
      }
    });
  }

  /**
   * addList(title)
   * Creates a new column list on the active board.
   */
  addList(title) {
    const { activeFileId, boards } = this.state;
    if (!activeFileId || !title.trim()) return;

    const board = boards[activeFileId];
    if (!board) return;

    const colId = 'col-' + Date.now(); // Generate unique column ID
    const newColumn = { id: colId, title: title.trim(), taskIds: [] };

    const updatedBoard = {
      ...board,
      columns: { ...board.columns, [colId]: newColumn },
      columnOrder: [...board.columnOrder, colId] // Append new column to end of horizontal order
    };

    this.setState({
      boards: { ...boards, [activeFileId]: updatedBoard }
    });
  }

  /**
   * renameList(colId, newTitle)
   * Updates display title of an existing column list.
   */
  renameList(colId, newTitle) {
    const { activeFileId, boards } = this.state;
    if (!activeFileId || !newTitle.trim()) return;

    const board = boards[activeFileId];
    const col = board.columns[colId];
    if (!col) return;

    const updatedBoard = {
      ...board,
      columns: {
        ...board.columns,
        [colId]: { ...col, title: newTitle.trim() }
      }
    };

    this.setState({
      boards: { ...boards, [activeFileId]: updatedBoard }
    });
  }

  /**
   * deleteList(colId)
   * Removes a column and cleans its ID from the board's column order.
   */
  deleteList(colId) {
    const { activeFileId, boards } = this.state;
    if (!activeFileId) return;

    const board = boards[activeFileId];
    const { [colId]: removedCol, ...remainingCols } = board.columns;
    const newColumnOrder = board.columnOrder.filter(id => id !== colId);

    this.setState({
      boards: {
        ...boards,
        [activeFileId]: {
          ...board,
          columns: remainingCols,
          columnOrder: newColumnOrder
        }
      }
    });
  }

  /**
   * updateTask(taskId, newContent, description, newComment)
   * Edits card title headline, description text, and appends a new comment if provided.
   */
  updateTask(taskId, newContent, description, newComment) {
    const { activeFileId, boards, registeredUser } = this.state;
    if (!activeFileId) return;

    const board = boards[activeFileId];
    const task = board.tasks[taskId];
    if (!task) return;

    // Clone comments array and append new comment if submitted
    const updatedComments = [...(task.comments || [])];
    if (newComment && newComment.trim()) {
      updatedComments.push({
        id: 'c-' + Date.now(),
        userName: registeredUser?.name || 'User',
        text: newComment.trim()
      });
    }

    const updatedTask = {
      ...task,
      content: newContent !== undefined && newContent.trim() ? newContent.trim() : task.content,
      description: description !== undefined ? description : task.description,
      comments: updatedComments
    };

    this.setState({
      boards: {
        ...boards,
        [activeFileId]: {
          ...board,
          tasks: { ...board.tasks, [taskId]: updatedTask }
        }
      }
    });
  }

  /**
   * deleteTask(taskId)
   * Permanently deletes a task card and removes its reference from parent column.
   */
  deleteTask(taskId) {
    const { activeFileId, boards } = this.state;
    if (!activeFileId) return;

    const board = boards[activeFileId];
    if (!board || !board.tasks[taskId]) return;

    // Remove from tasks dictionary
    const { [taskId]: removedTask, ...remainingTasks } = board.tasks;

    // Remove from parent column's taskIds array
    const updatedColumns = {};
    for (const [colId, col] of Object.entries(board.columns)) {
      updatedColumns[colId] = {
        ...col,
        taskIds: col.taskIds.filter(id => id !== taskId)
      };
    }

    this.setState({
      boards: {
        ...boards,
        [activeFileId]: {
          ...board,
          tasks: remainingTasks,
          columns: updatedColumns
        }
      }
    });
  }

  /**
   * addFile(folderId, fileName)
   * Creates a new board file under the specified folder and provisions default columns.
   */
  addFile(folderId, fileName) {
    if (!fileName.trim()) return;
    const fileId = 'file-' + Date.now();
    const newFile = { id: fileId, name: fileName.trim() };

    this.setState(s => {
      // Add new file to sidebar structure
      const nextSidebar = s.sidebarStructure.map(folder => {
        if (folder.id === folderId) {
          return { ...folder, files: [...folder.files, newFile] };
        }
        return folder;
      });

      // Initialize empty Kanban board for the new file
      const nextBoards = {
        ...s.boards,
        [fileId]: {
          id: fileId,
          name: fileName.trim(),
          columns: {
            'col-todo': { id: 'col-todo', title: 'To Do', taskIds: [] },
            'col-doing': { id: 'col-doing', title: 'Doing', taskIds: [] },
            'col-done': { id: 'col-done', title: 'Done', taskIds: [] }
          },
          tasks: {},
          columnOrder: ['col-todo', 'col-doing', 'col-done']
        }
      };

      return {
        sidebarStructure: nextSidebar,
        boards: nextBoards,
        activeFileId: fileId,  // Automatically open the new board
        inlineAction: null,    // Close inline creation box
        inlineValue: ''
      };
    });
  }

  /**
   * addFolder(folderName)
   * Creates a new top-level folder directory in the sidebar.
   */
  addFolder(folderName) {
    if (!folderName.trim()) return;
    const folderId = 'folder-' + Date.now();
    const newFolder = { id: folderId, title: folderName.trim().toUpperCase(), files: [] };

    this.setState(s => ({
      sidebarStructure: [...s.sidebarStructure, newFolder],
      expandedFolders: { ...s.expandedFolders, [folderId]: true }, // Auto-expand new folder
      inlineAction: null,
      inlineValue: ''
    }));
  }

  /**
   * deleteFile(folderId, fileId)
   * Removes a board file from its folder and cleans up board data.
   */
  deleteFile(folderId, fileId) {
    this.setState(s => {
      const nextSidebar = s.sidebarStructure.map(folder => {
        if (folder.id === folderId) {
          return {
            ...folder,
            files: folder.files.filter(f => f.id !== fileId)
          };
        }
        return folder;
      });

      // Delete board data object
      const { [fileId]: removedBoard, ...nextBoards } = s.boards;

      // If active board was deleted, switch to first available board
      let nextActiveId = s.activeFileId;
      if (s.activeFileId === fileId) {
        nextActiveId = null;
        for (const folder of nextSidebar) {
          if (folder.files.length > 0) {
            nextActiveId = folder.files[0].id;
            break;
          }
        }
      }

      return {
        sidebarStructure: nextSidebar,
        boards: nextBoards,
        activeFileId: nextActiveId
      };
    });
  }

  /**
   * deleteFolder(folderId)
   * Removes a folder and all contained board files from state.
   */
  deleteFolder(folderId) {
    this.setState(s => {
      const folderToDelete = s.sidebarStructure.find(f => f.id === folderId);
      const fileIdsToDelete = folderToDelete ? folderToDelete.files.map(f => f.id) : [];

      const nextSidebar = s.sidebarStructure.filter(f => f.id !== folderId);
      const nextBoards = { ...s.boards };
      fileIdsToDelete.forEach(id => delete nextBoards[id]);

      // If active board was in deleted folder, switch to first available
      let nextActiveId = s.activeFileId;
      if (fileIdsToDelete.includes(s.activeFileId)) {
        nextActiveId = null;
        for (const folder of nextSidebar) {
          if (folder.files.length > 0) {
            nextActiveId = folder.files[0].id;
            break;
          }
        }
      }

      return {
        sidebarStructure: nextSidebar,
        boards: nextBoards,
        activeFileId: nextActiveId
      };
    });
  }

  /**
   * renameFile(fileId, newName)
   * Updates name of a file across sidebar and board title.
   */
  renameFile(fileId, newName) {
    if (!newName || !newName.trim()) return;
    const trimmed = newName.trim();
    this.setState(s => {
      const nextSidebar = s.sidebarStructure.map(folder => ({
        ...folder,
        files: folder.files.map(f => (f.id === fileId ? { ...f, name: trimmed } : f))
      }));

      const nextBoards = { ...s.boards };
      if (nextBoards[fileId]) {
        nextBoards[fileId] = {
          ...nextBoards[fileId],
          name: trimmed
        };
      }

      return {
        sidebarStructure: nextSidebar,
        boards: nextBoards,
        inlineAction: null,
        inlineValue: ''
      };
    });
  }
}

// Export single shared instance for entire application
export const store = new StateStore();
