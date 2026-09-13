export const initialSidebarStructure = [
  {
    id: 'folder-1',
    title: 'SRC',
    files: [
      { id: 'file-1', name: 'App.jsx' },
      { id: 'file-2', name: 'index.css' },
      { id: 'file-3', name: 'main.jsx' }
    ]
  },
  {
    id: 'folder-2',
    title: 'PUBLIC',
    files: [
      { id: 'file-4', name: 'logo.png' }
    ]
  }
];

export const initialBoardsData = {
  'file-1': {
    id: 'file-1',
    name: 'App.jsx',
    columns: {
      'col-backlog': {
        id: 'col-backlog',
        title: 'Backlog',
        taskIds: ['task-1', 'task-2']
      },
      'col-todo': {
        id: 'col-todo',
        title: 'To Do',
        taskIds: ['task-3']
      },
      'col-doing': {
        id: 'col-doing',
        title: 'Doing',
        taskIds: ['task-4']
      },
      'col-done': {
        id: 'col-done',
        title: 'Done',
        taskIds: ['task-5']
      }
    },
    tasks: {
      'task-1': {
        id: 'task-1',
        content: 'Explore new Boardly theme & color scheme',
        description: 'Review the Boardly logo colors (Navy, Electric Blue, Gold, Purple, Mint Green) and apply them to UI elements.',
        comments: [
          { id: 'c-1', userName: 'Alex', text: 'The gold and electric blue accents look clean!' }
        ]
      },
      'task-2': {
        id: 'task-2',
        content: 'Add Vanilla JS DOM manipulation helpers',
        description: 'Create helper functions for rendering components cleanly.',
        comments: []
      },
      'task-3': {
        id: 'task-3',
        content: 'Implement native HTML5 Drag and Drop',
        description: 'Allow reordering cards between columns with HTML5 drag events.',
        comments: []
      },
      'task-4': {
        id: 'task-4',
        content: 'Build website landing with header auth buttons',
        description: 'Header features Log In / Sign Up buttons that open authentication forms.',
        comments: [
          { id: 'c-2', userName: 'Dev', text: 'Top-right corner Log In button works smoothly!' }
        ]
      },
      'task-5': {
        id: 'task-5',
        content: 'Convert React app to Pure Vanilla JS (Lectures 13-18)',
        description: 'Complete removal of React framework, fitting course requirements.',
        comments: []
      }
    },
    columnOrder: ['col-backlog', 'col-todo', 'col-doing', 'col-done']
  }
};