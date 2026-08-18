import React, { useState } from 'react';
import { DndContext, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';

// ==========================================
// 1. DRAGGABLE CARD COMPONENT
// ==========================================
const SortableCard = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="card">
      <p className="card-text">{task.content}</p>
    </div>
  );
};

// ==========================================
// 2. DROPPABLE COLUMN COMPONENT
// ==========================================
const BoardColumn = ({ column, tasks, onAddTask }) => {
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
            <SortableCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>

      <button className="add-task-btn" onClick={() => onAddTask(column.id)}>
        + Add Card
      </button>
    </div>
  );
};

// ==========================================
// 3. MAIN WEBSITE EXPORT
// ==========================================
export default function Website({ registeredUser, onLogout }) {
  const [expandedFolders, setExpandedFolders] = useState({ 'folder-1': true, 'folder-2': true });
  const [activeFileId, setActiveFileId] = useState('file-1');

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

  const [boards, setBoards] = useState({
    'file-1': {
      columns: {
        backlog: { id: 'backlog', title: 'Backlog', taskIds: ['t1'] },
        todo: { id: 'todo', title: 'To Do', taskIds: [] },
        doing: { id: 'doing', title: 'Doing', taskIds: [] },
        done: { id: 'done', title: 'Done', taskIds: [] },
      },
      tasks: { 't1': { id: 't1', content: 'Setup Aether UI CSS' } }
    },
    'file-2': {
      columns: {
        backlog: { id: 'backlog', title: 'Backlog', taskIds: [] },
        todo: { id: 'todo', title: 'To Do', taskIds: ['t2'] },
        doing: { id: 'doing', title: 'Doing', taskIds: [] },
        done: { id: 'done', title: 'Done', taskIds: [] },
      },
      tasks: { 't2': { id: 't2', content: 'Review C matrices logic' } }
    },
    'file-3': {
      columns: {
        backlog: { id: 'backlog', title: 'Backlog', taskIds: [] },
        todo: { id: 'todo', title: 'To Do', taskIds: [] },
        doing: { id: 'doing', title: 'Doing', taskIds: ['t3'] },
        done: { id: 'done', title: 'Done', taskIds: [] },
      },
      tasks: { 't3': { id: 't3', content: 'Defeat Genichiro Ashina' } }
    }
  });

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleDragEnd = (event) => {
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

  const handleAddTask = (colId) => {
    const text = prompt('Enter new card name:');
    if (!text) return;
    const newId = `t-${uuidv4()}`;
    
    setBoards(prev => {
      const newBoard = JSON.parse(JSON.stringify(prev[activeFileId]));
      newBoard.tasks[newId] = { id: newId, content: text };
      newBoard.columns[colId].taskIds.push(newId);
      return { ...prev, [activeFileId]: newBoard };
    });
  };

  const activeBoard = boards[activeFileId];
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

      {/* AETHER WORKSPACE */}
      <div className="workspace">
        <div className="header">
          <div className="header-path">
            Aether <span className="path-slash">/</span> Workspace <span className="path-slash">/</span> {sidebarStructure.flatMap(f => f.files).find(f => f.id === activeFileId)?.name}
          </div>
          <div className="header-user">
            <span className="user-name">{registeredUser?.name || 'Guest'} {registeredUser?.surname || ''}</span>
            <div className="avatar">{registeredUser?.name ? registeredUser.name.charAt(0).toUpperCase() : 'U'}</div>
            <button className="btn-logout" onClick={onLogout}>Log Out</button>
          </div>
        </div>

        <div className="board-canvas">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {columnOrder.map(colId => {
              const column = activeBoard.columns[colId];
              const tasks = column.taskIds.map(taskId => activeBoard.tasks[taskId]);

              return (
                <BoardColumn 
                  key={column.id} 
                  column={column} 
                  tasks={tasks} 
                  onAddTask={handleAddTask} 
                />
              );
            })}
          </DndContext>
        </div>
      </div>
    </div>
  );
}