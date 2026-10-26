/**
 * ==========================================================================
 * BOARDLY — DEFAULT SEED DATA & MOCK WORKSPACES
 * File: /src/data.js
 * Purpose: Contains pre-configured folders, project boards, Kanban columns,
 *          and sample cards used on first launch before localStorage exists.
 * ==========================================================================
 */

/**
 * initialSidebarStructure
 * Array of folders displayed in the left-hand Explorer sidebar tree.
 * Each folder contains an ID, folder title, and a list of board files.
 */
export const initialSidebarStructure = [
  {
    id: 'folder-1',         // Unique ID for folder 1
    title: 'PROJECTS',      // Display title shown in the sidebar tree
    files: [
      { id: 'board-1', name: 'Project Management' }, // Active default board
      { id: 'board-2', name: 'Marketing Campaign' },
      { id: 'board-3', name: 'Website Redesign' }
    ]
  },
  {
    id: 'folder-2',         // Unique ID for folder 2
    title: 'PERSONAL',      // Display title shown in the sidebar tree
    files: [
      { id: 'board-4', name: 'Daily Tasks & Goals' },
      { id: 'board-5', name: 'Sprint Roadmap' }
    ]
  }
];

/**
 * initialBoardsData
 * Dictionary mapping each board ID to its internal Kanban columns and task cards.
 * Normalized structure allows instant lookups by ID and reordering via arrays.
 */
export const initialBoardsData = {
  // Board 1: Project Management (Default Active Board)
  'board-1': {
    id: 'board-1',
    name: 'Project Management',

    // Kanban Columns Configuration
    columns: {
      'col-upcoming': {
        id: 'col-upcoming',
        title: 'Upcoming',                           // Column Header Title
        taskIds: ['task-1', 'task-2', 'task-3']       // Ordered list of cards inside this column
      },
      'col-progress': {
        id: 'col-progress',
        title: 'In Progress',
        taskIds: ['task-4', 'task-5', 'task-6']
      },
      'col-done': {
        id: 'col-done',
        title: 'Done',
        taskIds: ['task-7', 'task-8']
      }
    },

    // Individual Task Cards details
    tasks: {
      'task-1': {
        id: 'task-1',
        content: 'Plan marketing campaign',           // Card main title/headline
        description: 'Prepare strategy and schedule for the Q4 product release.', // Detailed notes
        comments: [                                  // User discussion thread
          { id: 'c-1', userName: 'Alex', text: 'Target audience analytics are ready.' }
        ]
      },
      'task-2': {
        id: 'task-2',
        content: 'Approve legal agreement',
        description: 'Send contract draft to the compliance team for signoff.',
        comments: []
      },
      'task-3': {
        id: 'task-3',
        content: 'Schedule recurring client meeting',
        description: 'Set up bi-weekly sprint reviews on Google Calendar.',
        comments: []
      },
      'task-4': {
        id: 'task-4',
        content: 'Collect design assets',
        description: 'Gather high-res SVG vectors, brand typography, and screenshots.',
        comments: [
          { id: 'c-2', userName: 'Sara', text: 'All icon sets uploaded to Figma.' }
        ]
      },
      'task-5': {
        id: 'task-5',
        content: 'Create 10 T-shirt options for launch day',
        description: 'Draft mockups with modern typography and vibrant colorways.',
        comments: []
      },
      'task-6': {
        id: 'task-6',
        content: 'Update online shop inventory',
        description: 'Verify checkout flow and promotional discount codes.',
        comments: []
      },
      'task-7': {
        id: 'task-7',
        content: 'Review legal agreement',
        description: 'Finalize terms of service and privacy disclosures.',
        comments: [
          { id: 'c-3', userName: 'Dev', text: 'Completed and reviewed by counsel.' }
        ]
      },
      'task-8': {
        id: 'task-8',
        content: 'Customer survey & feedback loop',
        description: 'Collect responses from beta testers and synthesize feedback.',
        comments: []
      }
    },

    // Order of column columns displayed horizontally on screen
    columnOrder: ['col-upcoming', 'col-progress', 'col-done']
  },

  // Board 2: Marketing Campaign
  'board-2': {
    id: 'board-2',
    name: 'Marketing Campaign',
    columns: {
      'col-todo': { id: 'col-todo', title: 'To Do', taskIds: ['m-1'] },
      'col-doing': { id: 'col-doing', title: 'Doing', taskIds: ['m-2'] },
      'col-done': { id: 'col-done', title: 'Done', taskIds: [] }
    },
    tasks: {
      'm-1': { id: 'm-1', content: 'Launch email newsletter', description: 'Prepare weekly product digest.', comments: [] },
      'm-2': { id: 'm-2', content: 'Set up social media ad campaign', description: 'Design visuals and copy.', comments: [] }
    },
    columnOrder: ['col-todo', 'col-doing', 'col-done']
  },

  // Board 3: Website Redesign
  'board-3': {
    id: 'board-3',
    name: 'Website Redesign',
    columns: {
      'col-todo': { id: 'col-todo', title: 'To Do', taskIds: [] },
      'col-doing': { id: 'col-doing', title: 'Doing', taskIds: [] },
      'col-done': { id: 'col-done', title: 'Done', taskIds: [] }
    },
    tasks: {},
    columnOrder: ['col-todo', 'col-doing', 'col-done']
  },

  // Board 4: Daily Tasks & Goals
  'board-4': {
    id: 'board-4',
    name: 'Daily Tasks & Goals',
    columns: {
      'col-todo': { id: 'col-todo', title: 'To Do', taskIds: [] },
      'col-doing': { id: 'col-doing', title: 'Doing', taskIds: [] },
      'col-done': { id: 'col-done', title: 'Done', taskIds: [] }
    },
    tasks: {},
    columnOrder: ['col-todo', 'col-doing', 'col-done']
  },

  // Board 5: Sprint Roadmap
  'board-5': {
    id: 'board-5',
    name: 'Sprint Roadmap',
    columns: {
      'col-todo': { id: 'col-todo', title: 'To Do', taskIds: [] },
      'col-doing': { id: 'col-doing', title: 'Doing', taskIds: [] },
      'col-done': { id: 'col-done', title: 'Done', taskIds: [] }
    },
    tasks: {},
    columnOrder: ['col-todo', 'col-doing', 'col-done']
  }
};
