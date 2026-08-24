import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, useDroppable, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';
import './App.css'; 

const BOARDS_DB_KEY = 'aether-boards-v4';
const SIDEBAR_DB_KEY = 'aether-sidebar-v4';

// ==========================================
// DRAGGABLE CARD COMPONENT
// ==========================================
const SortableCard = ({ task, user, onOpenDetail, colId }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  
  const style = { 
    transform: CSS.Translate.toString(transform), 
    transition,
    opacity: isDragging ? 0.3 : 1, 
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const commentCount = Array.isArray(task.comments) ? task.comments.length : 0;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="card">
      <p className="card-text">{task.content}</p>
      
      <div className="card-footer">
        <div 
          className="comment-wrapper" 
          style={{ cursor: 'pointer' }}
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={() => onOpenDetail(task.id, colId)}
        >
          <svg className="comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{commentCount}</span>
        </div>
        <div className="card-avatar">{userInitial}</div>
      </div>
    </div>
  );
};

// ==========================================
// DROPPABLE COLUMN COMPONENT
// ==========================================
const BoardColumn = ({ column, tasks, onOpenAddModal, onOpenDetail, onEditList, onDeleteList, user }) => {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div ref={setNodeRef} className="column" id={column.id}>
      <div className="column-header">
        <h3 className="column-title">{column.title}</h3>
        <div className="column-actions">
          <svg onClick={() => onEditList(column.id, column.title)} className="col-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <svg onClick={() => onDeleteList(column.id)} className="col-icon col-icon-delete" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span className="column-count">{tasks.length}</span>
        </div>
      </div>
      
      <div className="card-dropzone">
        <SortableContext items={column.taskIds || []} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableCard 
              key={task.id} 
              task={task} 
              user={user} 
              onOpenDetail={onOpenDetail} 
              colId={column.id} 
            />
          ))}
        </SortableContext>
      </div>

      <button className="add-task-btn" onClick={() => onOpenAddModal(column.id)}>
        + Add Card
      </button>
    </div>
  );
};

// ==========================================
// MAIN WEBSITE EXPORT
// ==========================================
export default function Website({ registeredUser, onLogout }) {
  const [activeId, setActiveId] = useState(null); 
  const [expandedFolders, setExpandedFolders] = useState({ 'folder-1': true });
  
  const [activeFileId, setActiveFileId] = useState('file-1');
  const [activeFolderId, setActiveFolderId] = useState('folder-1'); 
  
  const [inlineAction, setInlineAction] = useState(null); 
  const [inlineValue, setInlineValue] = useState('');

  // Modals for Cards
  const [addModalCol, setAddModalCol] = useState(null);
  const [newCardText, setNewCardText] = useState('');
  const [detailModalTask, setDetailModalTask] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');

  // Modals for Lists (Columns)
  const [listModal, setListModal] = useState({ isOpen: false, mode: 'add', colId: null, title: '' });
  const [deleteListModal, setDeleteListModal] = useState({ isOpen: false, colId: null });

  // Load Data safely
  const [boards, setBoards] = useState(() => {
    try {
      const saved = localStorage.getItem(BOARDS_DB_KEY);
      return saved ? JSON.parse(saved) : { 'file-1': { columnOrder: [], columns: {}, tasks: {} } };
    } catch {
      return { 'file-1': { columnOrder: [], columns: {}, tasks: {} } };
    }
  });

  const [sidebarStructure, setSidebarStructure] = useState(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_DB_KEY);
      return saved ? JSON.parse(saved) : [{ id: 'folder-1', title: 'PROJECTS', files: [{ id: 'file-1', name: 'New Board.json' }] }];
    } catch {
      return [{ id: 'folder-1', title: 'PROJECTS', files: [{ id: 'file-1', name: 'New Board.json' }] }];
    }
  });

  useEffect(() => {
    localStorage.setItem(BOARDS_DB_KEY, JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_DB_KEY, JSON.stringify(sidebarStructure));
  }, [sidebarStructure]);

  // --- SIDEBAR ACTIONS ---
  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
    setActiveFolderId(folderId); 
  };

  const handleDeleteFolder = (e, folderId) => {
    e.stopPropagation(); 
    setSidebarStructure(prev => prev.filter(f => f.id !== folderId));
  };

  const handleDeleteFile = (e, folderId, fileId) => {
    e.stopPropagation();
    setSidebarStructure(prev => prev.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, files: folder.files.filter(file => file.id !== fileId) };
      }
      return folder;
    }));
    if (activeFileId === fileId) setActiveFileId(null); 
  };

  const startAddFolder = () => {
    setInlineAction({ type: 'folder', targetFolderId: null });
    setInlineValue('');
  };

  const startAddFile = () => {
    if (sidebarStructure.length === 0) return;
    const targetFolderId = activeFolderId || sidebarStructure[0].id;
    setExpandedFolders(prev => ({ ...prev, [targetFolderId]: true }));
    setInlineAction({ type: 'file', targetFolderId });
    setInlineValue('');
  };

  const handleInlineSubmit = () => {
    if (!inlineValue.trim()) {
      setInlineAction(null);
      return;
    }

    if (inlineAction.type === 'folder') {
      const newId = `folder-${uuidv4()}`;
      const newFolder = { id: newId, title: inlineValue.trim().toUpperCase(), files: [] };
      setSidebarStructure(prev => [...prev, newFolder]);
      setExpandedFolders(prev => ({ ...prev, [newId]: true }));
      setActiveFolderId(newId);

    } else if (inlineAction.type === 'file') {
      const fileName = inlineValue.trim();
      const nameWithExt = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
      const newFileId = `file-${uuidv4()}`;

      setSidebarStructure(prev => prev.map(folder => {
        if (folder.id === inlineAction.targetFolderId) {
          return { ...folder, files: [...folder.files, { id: newFileId, name: nameWithExt }] };
        }
        return folder;
      }));

      // Initialize an empty board properly
      setBoards(prev => ({
        ...prev,
        [newFileId]: { columnOrder: [], columns: {}, tasks: {} }
      }));
      setActiveFileId(newFileId);
    }
    
    setInlineAction(null);
    setInlineValue('');
  };

  // --- LIST (COLUMN) LOGIC (Fixed Deep Cloning) ---
  const handleSaveList = () => {
    if (!listModal.title.trim() || !activeFileId) return;

    setBoards(prev => {
      const currentBoard = prev[activeFileId] || {};
      
      // PROPER DEEP CLONE to prevent the mutation bug
      const newBoard = JSON.parse(JSON.stringify(currentBoard));

      if (!Array.isArray(newBoard.columnOrder)) newBoard.columnOrder = [];
      if (!newBoard.columns) newBoard.columns = {};
      if (!newBoard.tasks) newBoard.tasks = {};

      if (listModal.mode === 'add') {
        const newColId = `col-${uuidv4()}`;
        newBoard.columns[newColId] = { id: newColId, title: listModal.title, taskIds: [] };
        newBoard.columnOrder.push(newColId); 
      } else if (listModal.mode === 'edit') {
        if (newBoard.columns[listModal.colId]) {
          newBoard.columns[listModal.colId].title = listModal.title;
        }
      }
      
      return { ...prev, [activeFileId]: newBoard };
    });
    
    setListModal({ isOpen: false, mode: 'add', colId: null, title: '' });
  };

  const confirmDeleteList = () => {
    setBoards(prev => {
      const currentBoard = prev[activeFileId] || {};
      // PROPER DEEP CLONE
      const newBoard = JSON.parse(JSON.stringify(currentBoard));
      
      if (!newBoard.columns || !Array.isArray(newBoard.columnOrder)) return prev;

      const colId = deleteListModal.colId;
      
      if (newBoard.columns[colId] && Array.isArray(newBoard.columns[colId].taskIds)) {
        const tasksToRemove = newBoard.columns[colId].taskIds;
        tasksToRemove.forEach(taskId => {
          if (newBoard.tasks && newBoard.tasks[taskId]) delete newBoard.tasks[taskId];
        });
      }

      delete newBoard.columns[colId];
      newBoard.columnOrder = newBoard.columnOrder.filter(id => id !== colId);
      
      return { ...prev, [activeFileId]: newBoard };
    });
    setDeleteListModal({ isOpen: false, colId: null });
  };

  // --- CARD & DRAG LOGIC ---
  const handleDragStart = (event) => setActiveId(event.active.id);
  
  const handleDragEnd = (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const sourceId = active.id;
    const destId = over.id;
    
    setBoards(prev => {
      const currentBoard = prev[activeFileId] || {};
      const newBoard = JSON.parse(JSON.stringify(currentBoard));

      let sourceColId = null;
      let destColId = null;

      Object.keys(newBoard.columns || {}).forEach(colId => {
        const col = newBoard.columns[colId];
        if (col && Array.isArray(col.taskIds)) {
          if (col.taskIds.includes(sourceId)) sourceColId = colId;
          if (colId === destId || col.taskIds.includes(destId)) destColId = colId;
        }
      });

      if (!sourceColId || !destColId) return prev;

      const sourceTaskIds = newBoard.columns[sourceColId].taskIds;
      const destTaskIds = newBoard.columns[destColId].taskIds;
      const sourceIndex = sourceTaskIds.indexOf(sourceId);
      sourceTaskIds.splice(sourceIndex, 1);

      if (sourceColId === destColId) {
        let destIndex = destTaskIds.indexOf(destId);
        destTaskIds.splice(destIndex, 0, sourceId);
      } else {
        destTaskIds.push(sourceId);
      }
      
      return { ...prev, [activeFileId]: newBoard };
    });
  };
  
  const handleDragCancel = () => setActiveId(null);

  const handleConfirmAddCard = () => {
    if (!newCardText.trim() || !activeFileId) return;
    
    const newId = `t-${uuidv4()}`;
    
    setBoards(prev => {
      const currentBoard = prev[activeFileId] || {};
      const newBoard = JSON.parse(JSON.stringify(currentBoard));
      
      if (!newBoard.tasks) newBoard.tasks = {};
      if (!newBoard.columns) newBoard.columns = {};

      if (newBoard.columns[addModalCol]) {
        if (!Array.isArray(newBoard.columns[addModalCol].taskIds)) {
          newBoard.columns[addModalCol].taskIds = [];
        }
        newBoard.tasks[newId] = { id: newId, content: newCardText, description: '', comments: [] };
        newBoard.columns[addModalCol].taskIds.push(newId);
      }
      return { ...prev, [activeFileId]: newBoard };
    });
    setAddModalCol(null);
    setNewCardText('');
  };

  const handleSaveDetail = () => {
    setBoards(prev => {
      const currentBoard = prev[activeFileId] || {};
      const newBoard = JSON.parse(JSON.stringify(currentBoard));
      
      if (!newBoard.tasks || !newBoard.tasks[detailModalTask.id]) return prev;

      newBoard.tasks[detailModalTask.id].description = descriptionText;
      if (newCommentText.trim()) {
        if (!Array.isArray(newBoard.tasks[detailModalTask.id].comments)) {
          newBoard.tasks[detailModalTask.id].comments = [];
        }
        newBoard.tasks[detailModalTask.id].comments.push(newCommentText);
      }
      return { ...prev, [activeFileId]: newBoard };
    });
    setNewCommentText('');
    setDetailModalTask(null);
  };
  const handleOpenDetail = (taskId) => {
    const currentBoard = boards[activeFileId] || {};
    const task = currentBoard.tasks?.[taskId];
    if (!task) return;
    
    setDetailModalTask(task);
    setDescriptionText(task.description || '');
  };

  // Safe Rendering Defaults
  const activeBoard = boards[activeFileId] || { columnOrder: [], columns: {}, tasks: {} };
  const columnOrder = Array.isArray(activeBoard.columnOrder) ? activeBoard.columnOrder : [];
  const activeTask = activeId && activeBoard.tasks ? activeBoard.tasks[activeId] : null; 

  return (
    <div className="app-container">
      {/* VS CODE SIDEBAR */}
      <div className="sidebar vscode-sidebar">
        <div className="sidebar-header">
          <h3 className="sidebar-header-title">EXPLORER</h3>
          <div className="sidebar-actions">
            <svg onClick={startAddFile} title="New File" className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <svg onClick={startAddFolder} title="New Folder" className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
          </div>
        </div>

        <div className="sidebar-scroll">
          {sidebarStructure.map(folder => (
            <div key={folder.id} className="folder-container" onMouseEnter={() => setActiveFolderId(folder.id)}>
              <div className="folder-header" onClick={() => toggleFolder(folder.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="chevron">{expandedFolders[folder.id] ? 'v' : '>'}</span>
                  <span className="folder-name">{folder.title}</span>
                </div>
                <svg onClick={(e) => handleDeleteFolder(e, folder.id)} className="delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </div>
              
              {expandedFolders[folder.id] && (
                <div className="folder-contents">
                  {folder.files.map(file => (
                    <div 
                      key={file.id} 
                      className={`file-item ${activeFileId === file.id ? 'active' : ''}`}
                      onClick={() => { setActiveFileId(file.id); setActiveFolderId(folder.id); }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="file-icon">{"{ }"}</span> {file.name}
                      </div>
                      <svg onClick={(e) => handleDeleteFile(e, folder.id, file.id)} className="delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </div>
                  ))}
                  
                  {inlineAction?.type === 'file' && inlineAction.targetFolderId === folder.id && (
                    <div className="file-item">
                      <span className="file-icon">{"{ }"}</span>
                      <input 
                        autoFocus
                        className="inline-input"
                        value={inlineValue}
                        onChange={e => setInlineValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleInlineSubmit();
                          if (e.key === 'Escape') { setInlineAction(null); setInlineValue(''); }
                        }}
                        onBlur={handleInlineSubmit}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {inlineAction?.type === 'folder' && (
             <div className="folder-header">
                <span className="chevron">{'>'}</span>
                <input 
                  autoFocus
                  className="inline-input folder-inline-input"
                  value={inlineValue}
                  onChange={e => setInlineValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleInlineSubmit();
                    if (e.key === 'Escape') { setInlineAction(null); setInlineValue(''); }
                  }}
                  onBlur={handleInlineSubmit}
                />
             </div>
          )}
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="workspace">
        <div className="header">
          <div className="header-path">
            Aether <span className="path-slash">/</span> Workspace <span className="path-slash">/</span> {sidebarStructure.flatMap(f => f.files).find(f => f.id === activeFileId)?.name || 'No File Selected'}
          </div>
          <div className="header-user">
            <span className="user-name">{registeredUser?.name || 'Guest'}</span>
            <div className="avatar">{registeredUser?.name ? registeredUser.name.charAt(0).toUpperCase() : 'U'}</div>
            <button className="btn-logout" onClick={onLogout}>Log Out</button>
          </div>
        </div>

        <div className="board-canvas">
          {activeFileId ? (
            <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
              
              {/* RENDER COLUMNS DYNAMICALLY */}
              {columnOrder.map(colId => {
                const column = activeBoard.columns?.[colId];
                if (!column) return null;
                
                // Safe task mapping to completely stop the crash in its tracks
                const safeTaskIds = Array.isArray(column.taskIds) ? column.taskIds : [];
                const tasks = safeTaskIds.map(taskId => activeBoard.tasks?.[taskId]).filter(Boolean);

                return (
                  <BoardColumn 
                    key={column.id} 
                    column={column} 
                    tasks={tasks} 
                    onOpenAddModal={(colId) => setAddModalCol(colId)} 
                    onOpenDetail={handleOpenDetail}
                    onEditList={(id, title) => setListModal({ isOpen: true, mode: 'edit', colId: id, title })}
                    onDeleteList={(id) => setDeleteListModal({ isOpen: true, colId: id })}
                    user={registeredUser} 
                  />
                );
              })}

              {/* ADD NEW LIST BUTTON */}
              <div className="add-list-zone" onClick={() => setListModal({ isOpen: true, mode: 'add', colId: null, title: '' })}>
                <div className="dashed-box">
                  <span className="plus-icon">+</span> Add a list
                </div>
              </div>

              <DragOverlay>
                {activeTask ? (
                  <div className="card drag-overlay-card">
                    <p className="card-text">{activeTask.content}</p>
                    <div className="card-footer">
                      <div className="comment-wrapper">
                        <svg className="comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>{Array.isArray(activeTask.comments) ? activeTask.comments.length : 0}</span>
                      </div>
                      <div className="card-avatar">{registeredUser?.name ? registeredUser.name.charAt(0).toUpperCase() : 'U'}</div>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <div style={{ padding: '40px', color: '#64748b' }}>Select or create a file in the Explorer to begin.</div>
          )}
        </div>
      </div>

      {/* --- ADD/EDIT LIST MODAL --- */}
      {listModal.isOpen && (
        <div className="modal-overlay" onClick={() => setListModal({ isOpen: false, mode: 'add', colId: null, title: '' })}>
          <div className="modal-box small-modal" onClick={e => e.stopPropagation()}>
            <h3>{listModal.mode === 'add' ? 'Add New List' : 'Edit List Name'}</h3>
            <input 
              autoFocus
              type="text" 
              placeholder="Enter list title..." 
              value={listModal.title} 
              onChange={e => setListModal({ ...listModal, title: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSaveList()}
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setListModal({ isOpen: false, mode: 'add', colId: null, title: '' })}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveList}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE LIST CONFIRMATION MODAL --- */}
      {deleteListModal.isOpen && (
        <div className="modal-overlay" onClick={() => setDeleteListModal({ isOpen: false, colId: null })}>
          <div className="modal-box small-modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#ef4444' }}>Delete List?</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Are you sure? This will permanently delete this list and all cards inside it.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteListModal({ isOpen: false, colId: null })}>Cancel</button>
              <button className="btn-primary" style={{ background: '#ef4444' }} onClick={confirmDeleteList}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* --- SMALL MODAL: ADD CARD --- */}
      {addModalCol && (
        <div className="modal-overlay" onClick={() => setAddModalCol(null)}>
          <div className="modal-box small-modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Card</h3>
            <input 
              autoFocus
              type="text" 
              placeholder="Enter card headline..." 
              value={newCardText} 
              onChange={e => setNewCardText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirmAddCard()}
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setAddModalCol(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleConfirmAddCard}>Add Card</button>
            </div>
          </div>
        </div>
      )}

      {/* --- LARGE MODAL: CARD DETAILS --- */}
      {detailModalTask && (
        <div className="modal-overlay" onClick={() => setDetailModalTask(null)}>
          <div className="modal-box large-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Card Detail: {detailModalTask.content}</h3>
              <button className="close-btn" onClick={() => setDetailModalTask(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              <label>Description</label>
              <textarea 
                placeholder="Add a more detailed description..."
                value={descriptionText}
                onChange={e => setDescriptionText(e.target.value)}
              />

              <div className="comments-section">
                <label>Activity & Comments</label>
                <div className="comments-list">
                  {(!detailModalTask.comments || detailModalTask.comments.length === 0) ? (
                    <p className="no-comments">No comments yet.</p>
                  ) : (
                    detailModalTask.comments.map((comment, idx) => (
                      <div key={idx} className="comment-item">
                        <div className="card-avatar small-avatar">{registeredUser?.name ? registeredUser.name.charAt(0).toUpperCase() : 'U'}</div>
                        <div className="comment-bubble">{comment}</div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="add-comment-box">
                  <div className="card-avatar small-avatar">{registeredUser?.name ? registeredUser.name.charAt(0).toUpperCase() : 'U'}</div>
                  <input 
                    type="text" 
                    placeholder="Write a comment..." 
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveDetail()}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDetailModalTask(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveDetail}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}