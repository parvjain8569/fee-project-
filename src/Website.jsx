import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, useDroppable, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

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
  const commentCount = task.comments ? task.comments.length : 0;

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
const BoardColumn = ({ column, tasks, onOpenAddModal, onOpenDetail, user }) => {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div ref={setNodeRef} className="column" id={column.id}>
      <div className="column-header">
        <h3 className="column-title">{column.title}</h3>
        <span className="column-count">{tasks.length}</span>
      </div>
      
      <div className="card-dropzone">
        <SortableContext items={column.taskIds} strategy={verticalListSortingStrategy}>
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
// DEFAULT DATA
// ==========================================
const defaultBoards = {
  'file-1': {
    columns: {
      backlog: { id: 'backlog', title: 'Backlog', taskIds: ['t1'] },
      todo: { id: 'todo', title: 'To Do', taskIds: [] },
      doing: { id: 'doing', title: 'Doing', taskIds: [] },
      done: { id: 'done', title: 'Done', taskIds: [] },
    },
    tasks: { 't1': { id: 't1', content: 'Setup Aether UI CSS', description: '', comments: [] } }
  },
  'file-2': {
    columns: {
      backlog: { id: 'backlog', title: 'Backlog', taskIds: [] },
      todo: { id: 'todo', title: 'To Do', taskIds: ['t2'] },
      doing: { id: 'doing', title: 'Doing', taskIds: [] },
      done: { id: 'done', title: 'Done', taskIds: [] },
    },
    tasks: { 't2': { id: 't2', content: 'Review C matrices logic', description: '', comments: [] } }
  },
  'file-3': {
    columns: {
      backlog: { id: 'backlog', title: 'Backlog', taskIds: [] },
      todo: { id: 'todo', title: 'To Do', taskIds: [] },
      doing: { id: 'doing', title: 'Doing', taskIds: ['t3'] },
      done: { id: 'done', title: 'Done', taskIds: [] },
    },
    tasks: { 't3': { id: 't3', content: 'Defeat Genichiro Ashina', description: '', comments: [] } }
  }
};

// ==========================================
// MAIN WEBSITE EXPORT
// ==========================================
export default function Website({ registeredUser, onLogout }) {
  const [activeId, setActiveId] = useState(null); 
  const [expandedFolders, setExpandedFolders] = useState({ 'folder-1': true, 'folder-2': true });
  const [activeFileId, setActiveFileId] = useState('file-1');
  
  // MODAL STATES
  const [addModalCol, setAddModalCol] = useState(null);
  const [newCardText, setNewCardText] = useState('');
  
  const [detailModalTask, setDetailModalTask] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');

  // LOCAL STORAGE INITIALIZATION
  const [boards, setBoards] = useState(() => {
    const saved = localStorage.getItem('aether-boards-data');
    if (saved) return JSON.parse(saved);
    return defaultBoards;
  });

  // SAVES TO LOCAL STORAGE EVERY TIME 'BOARDS' CHANGES
  useEffect(() => {
    localStorage.setItem('aether-boards-data', JSON.stringify(boards));
  }, [boards]);

  const [sidebarStructure] = useState([
    {
      id: 'folder-1', title: 'SEMESTER 3', files: [
        { id: 'file-1', name: 'Web Dev.json' },
        { id: 'file-2', name: 'Data Structures.json' }
      ]
    },
    {
      id: 'folder-2', title: 'GAMING', files: [
        { id: 'file-3', name: 'Sekiro_Bosses.json' }
      ]
    }
  ]);

  const toggleFolder = (folderId) => setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));

  // --- DRAG LOGIC ---
  const handleDragStart = (event) => setActiveId(event.active.id);
  const handleDragEnd = (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const sourceId = active.id;
    const destId = over.id;
    const activeBoard = boards[activeFileId];
    
    let sourceColId = null;
    let destColId = null;

    Object.keys(activeBoard.columns).forEach(colId => {
      if (activeBoard.columns[colId].taskIds.includes(sourceId)) sourceColId = colId;
      if (colId === destId || activeBoard.columns[colId].taskIds.includes(destId)) destColId = colId;
    });

    if (!sourceColId || !destColId) return;

    setBoards(prev => {
      const newBoard = JSON.parse(JSON.stringify(prev[activeFileId])); 
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

  // --- ADD CARD MODAL LOGIC ---
  const handleConfirmAddCard = () => {
    if (!newCardText.trim()) return;
    const newId = `t-${uuidv4()}`;
    setBoards(prev => {
      const newBoard = JSON.parse(JSON.stringify(prev[activeFileId]));
      newBoard.tasks[newId] = { id: newId, content: newCardText, description: '', comments: [] };
      newBoard.columns[addModalCol].taskIds.push(newId);
      return { ...prev, [activeFileId]: newBoard };
    });
    setAddModalCol(null);
    setNewCardText('');
  };

  // --- DETAIL MODAL LOGIC ---
  const handleOpenDetail = (taskId) => {
    const task = boards[activeFileId].tasks[taskId];
    setDetailModalTask(task);
    setDescriptionText(task.description || '');
  };

  const handleSaveDetail = () => {
    setBoards(prev => {
      const newBoard = JSON.parse(JSON.stringify(prev[activeFileId]));
      newBoard.tasks[detailModalTask.id].description = descriptionText;
      if (newCommentText.trim()) {
        if (!newBoard.tasks[detailModalTask.id].comments) newBoard.tasks[detailModalTask.id].comments = [];
        newBoard.tasks[detailModalTask.id].comments.push(newCommentText);
      }
      return { ...prev, [activeFileId]: newBoard };
    });
    setNewCommentText('');
    setDetailModalTask(null);
  };

  const activeBoard = boards[activeFileId];
  const activeTask = activeId ? activeBoard.tasks[activeId] : null; 
  const columnOrder = ['backlog', 'todo', 'doing', 'done'];

  return (
    <div className="app-container">
      {/* VS CODE SIDEBAR */}
      <div className="sidebar vscode-sidebar">
        <h3 className="sidebar-header-title">EXPLORER</h3>
        <div className="sidebar-scroll">
          {sidebarStructure.map(folder => (
            <div key={folder.id} className="folder-container">
              <div className="folder-header" onClick={() => toggleFolder(folder.id)}>
                <span className="chevron">{expandedFolders[folder.id] ? 'v' : '>'}</span>
                <span className="folder-name">{folder.title}</span>
              </div>
              {expandedFolders[folder.id] && (
                <div className="folder-contents">
                  {folder.files.map(file => (
                    <div 
                      key={file.id} 
                      className={`file-item ${activeFileId === file.id ? 'active' : ''}`}
                      onClick={() => setActiveFileId(file.id)}
                    >
                      <span className="file-icon">{"{ }"}</span> {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="workspace">
        <div className="header">
          <div className="header-path">
            Aether <span className="path-slash">/</span> Workspace <span className="path-slash">/</span> {sidebarStructure.flatMap(f => f.files).find(f => f.id === activeFileId)?.name}
          </div>
          <div className="header-user">
            <span className="user-name">{registeredUser?.name || 'Guest'}</span>
            <div className="avatar">{registeredUser?.name ? registeredUser.name.charAt(0).toUpperCase() : 'U'}</div>
            <button className="btn-logout" onClick={onLogout}>Log Out</button>
          </div>
        </div>

        <div className="board-canvas">
          <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
            {columnOrder.map(colId => {
              const column = activeBoard.columns[colId];
              const tasks = column.taskIds.map(taskId => activeBoard.tasks[taskId]);

              return (
                <BoardColumn 
                  key={column.id} 
                  column={column} 
                  tasks={tasks} 
                  onOpenAddModal={(colId) => setAddModalCol(colId)} 
                  onOpenDetail={handleOpenDetail}
                  user={registeredUser} 
                />
              );
            })}

            <DragOverlay>
              {activeTask ? (
                <div className="card drag-overlay-card">
                  <p className="card-text">{activeTask.content}</p>
                  <div className="card-footer">
                    <div className="comment-wrapper">
                      <svg className="comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span>{activeTask.comments ? activeTask.comments.length : 0}</span>
                    </div>
                    <div className="card-avatar">{registeredUser?.name ? registeredUser.name.charAt(0).toUpperCase() : 'U'}</div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

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