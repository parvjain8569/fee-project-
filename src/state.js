import { initialSidebarStructure, initialBoardsData } from './data.js';

const SIDEBAR_KEY = 'boardly-v7-sidebar';
const BOARDS_KEY = 'boardly-v7-boards';
const USER_KEY = 'boardly-v7-user';

// Load stored state or use initial defaults
function loadInitialState() {
  let sidebar = null;
  let boards = null;
  let user = null;

  try {
    const rawSidebar = localStorage.getItem(SIDEBAR_KEY);
    if (rawSidebar) sidebar = JSON.parse(rawSidebar);

    const rawBoards = localStorage.getItem(BOARDS_KEY);
    if (rawBoards) boards = JSON.parse(rawBoards);

    const rawUser = localStorage.getItem(USER_KEY);
    if (rawUser) user = JSON.parse(rawUser);
  } catch (e) {
    console.error('Error loading LocalStorage state:', e);
  }

  const initialSidebar = sidebar || initialSidebarStructure;
  const initialBoards = boards || initialBoardsData;

  // Find first active file
  let firstFileId = null;
  if (initialSidebar.length > 0 && initialSidebar[0].files.length > 0) {
    firstFileId = initialSidebar[0].files[0].id;
  }

  return {
    view: 'website', // 'website' | 'login' | 'register'
    isLoggedIn: false,
    registeredUser: user || null,
    sidebarStructure: initialSidebar,
    expandedFolders: { 'folder-1': true, 'folder-2': true },
    activeFileId: firstFileId,
    boards: initialBoards,
    activeModal: null, // { type, data }
    inlineAction: null, // { type: 'file'|'folder', targetFolderId }
    inlineValue: ''
  };
}

class StateStore {
  constructor() {
    this.state = loadInitialState();
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(updater) {
    const nextState = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...nextState };
    this.saveToStorage();
    this.notify();
  }

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

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l(this.state));
  }

  // --- HELPER ACTION METHODS ---

  setActiveFile(fileId) {
    this.setState(s => {
      const nextBoards = { ...s.boards };
      if (!nextBoards[fileId]) {
        // Find filename
        let fileName = 'New File';
        for (const folder of s.sidebarStructure) {
          const found = folder.files.find(f => f.id === fileId);
          if (found) {
            fileName = found.name;
            break;
          }
        }
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

  toggleFolder(folderId) {
    this.setState(s => ({
      expandedFolders: {
        ...s.expandedFolders,
        [folderId]: !s.expandedFolders[folderId]
      }
    }));
  }

  // Add card to column
  addCard(colId, text) {
    const { activeFileId, boards } = this.state;
    if (!activeFileId || !text.trim()) return;

    const board = boards[activeFileId];
    if (!board) return;

    const taskId = 'task-' + Date.now();
    const newTask = {
      id: taskId,
      content: text.trim(),
      description: '',
      comments: []
    };

    const targetCol = board.columns[colId];
    const updatedCol = {
      ...targetCol,
      taskIds: [...targetCol.taskIds, taskId]
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

  // Move card between columns or reorder
  moveTask(taskId, targetColId, newIndex) {
    const { activeFileId, boards } = this.state;
    if (!activeFileId) return;

    const board = boards[activeFileId];
    if (!board) return;

    // Find source column
    let sourceColId = null;
    for (const [cId, col] of Object.entries(board.columns)) {
      if (col.taskIds.includes(taskId)) {
        sourceColId = cId;
        break;
      }
    }

    if (!sourceColId) return;

    const sourceCol = board.columns[sourceColId];
    const targetCol = board.columns[targetColId];

    // Remove from source
    const newSourceTaskIds = sourceCol.taskIds.filter(id => id !== taskId);

    let newTargetTaskIds;
    if (sourceColId === targetColId) {
      newTargetTaskIds = [...newSourceTaskIds];
      newTargetTaskIds.splice(newIndex, 0, taskId);
    } else {
      newTargetTaskIds = [...targetCol.taskIds];
      newTargetTaskIds.splice(newIndex, 0, taskId);
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

  // Add List
  addList(title) {
    const { activeFileId, boards } = this.state;
    if (!activeFileId || !title.trim()) return;

    const board = boards[activeFileId];
    if (!board) return;

    const colId = 'col-' + Date.now();
    const newColumn = { id: colId, title: title.trim(), taskIds: [] };

    const updatedBoard = {
      ...board,
      columns: { ...board.columns, [colId]: newColumn },
      columnOrder: [...board.columnOrder, colId]
    };

    this.setState({
      boards: { ...boards, [activeFileId]: updatedBoard }
    });
  }

  // Rename List
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

  // Delete List
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

  // Update Task content, detail & comments
  updateTask(taskId, newContent, description, newComment) {
    const { activeFileId, boards, registeredUser } = this.state;
    if (!activeFileId) return;

    const board = boards[activeFileId];
    const task = board.tasks[taskId];
    if (!task) return;

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

  // Delete Task Card
  deleteTask(taskId) {
    const { activeFileId, boards } = this.state;
    if (!activeFileId) return;

    const board = boards[activeFileId];
    if (!board || !board.tasks[taskId]) return;

    const { [taskId]: removedTask, ...remainingTasks } = board.tasks;

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

  // Add File to Explorer
  addFile(folderId, fileName) {
    if (!fileName.trim()) return;
    const fileId = 'file-' + Date.now();
    const newFile = { id: fileId, name: fileName.trim() };

    this.setState(s => {
      const nextSidebar = s.sidebarStructure.map(folder => {
        if (folder.id === folderId) {
          return { ...folder, files: [...folder.files, newFile] };
        }
        return folder;
      });

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
        activeFileId: fileId,
        inlineAction: null,
        inlineValue: ''
      };
    });
  }

  // Add Folder to Explorer
  addFolder(folderName) {
    if (!folderName.trim()) return;
    const folderId = 'folder-' + Date.now();
    const newFolder = { id: folderId, title: folderName.trim().toUpperCase(), files: [] };

    this.setState(s => ({
      sidebarStructure: [...s.sidebarStructure, newFolder],
      expandedFolders: { ...s.expandedFolders, [folderId]: true },
      inlineAction: null,
      inlineValue: ''
    }));
  }

  // Delete File
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

      const { [fileId]: removedBoard, ...nextBoards } = s.boards;
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

  // Delete Folder
  deleteFolder(folderId) {
    this.setState(s => {
      const folderToDelete = s.sidebarStructure.find(f => f.id === folderId);
      const fileIdsToDelete = folderToDelete ? folderToDelete.files.map(f => f.id) : [];

      const nextSidebar = s.sidebarStructure.filter(f => f.id !== folderId);
      const nextBoards = { ...s.boards };
      fileIdsToDelete.forEach(id => delete nextBoards[id]);

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
}

export const store = new StateStore();
