# 📝 BOARDLY PROJECT — Super Detailed Codebase & Course Notes

> **Project Name**: Boardly — Plan • Organize • Achieve  
> **Architecture**: 100% Pure Vanilla JavaScript (ES6+ Modules), HTML5 & CSS3 — **Zero Framework Dependencies**  
> **Course Syllabus Mapping**: Fits **Lectures 1–18** (HTML5, CSS3, ES6+, DOM Manipulation, LocalStorage, Event Handling & Interactive Mini Project)  
> **Design Theme**: Custom Boardly Logo Palette (Deep Navy `#0f172a`, Electric Blue `#2563eb`, Vibrant Purple `#9333ea`, Gold `#f59e0b`, Mint Green `#10b981`)

---

## 🎯 Syllabus Alignment Matrix (Lectures 1–18 Verification)

| Syllabus Block | Official Syllabus Topics | How It Is Implemented in This Codebase |
| :--- | :--- | :--- |
| **Lectures 1–6** | • HTML5 structure & semantic tags<br>• CSS3 fundamentals, Box Model, Flexbox, Grid<br>• Responsive design & mobile-first layouts | **`index.html` & `src/style.css`**:<br>• Semantic markup using `<header>`, `<aside>`, `<main>`, `<section>`, `<article>`, `<form>`, `<input>`, `<button>`, `<svg>`.<br>• Layouts built with CSS Flexbox (`display: flex`), CSS Grid, CSS Variables (`:root`), and Glassmorphic overlays. |
| **Lectures 7–12** | • JavaScript basics: variables, functions, arrays, objects, loops<br>• Dev tools & VS Code setup<br>• Mini project foundation | **`src/data.js` & `src/state.js`**:<br>• Variables (`const`/`let`), Arrow functions, Array methods (`.map()`, `.filter()`, `.find()`, `.includes()`, `.splice()`), and Object state structures. |
| **Lectures 13–18** | • **ES6+ Features**: `let`/`const`, arrow functions, destructuring, spread/rest<br>• **Modules**: `import`/`export`<br>• **DOM Manipulation & Event Handling**<br>• **Browser Storage, JSON, and Forms**<br>• **Mini Project**: Interactive App / Kanban Board | **`src/main.js`, `src/state.js`, `src/components/*.js`**:<br>• ES6 Modules (`import`/`export`).<br>• Native DOM manipulation (`querySelector`, `innerHTML`, `createElement`, `classList`).<br>• Event Delegation & Event Handling (`addEventListener`, `e.target.closest('[data-action]')`).<br>• Browser HTML5 Drag and Drop (`dragstart`, `dragover`, `drop`).<br>• Browser Storage (`localStorage.setItem`, `localStorage.getItem`) & JSON (`JSON.stringify`, `JSON.parse`).<br>• Form handling & validation (`<form>`, `e.preventDefault()`). |

---

## 📁 Project Architecture & File Hierarchy

```
project/
├── index.html                  # Core HTML structure & modal container
├── public/
│   └── logo.png                # Boardly logo branding asset
├── src/
│   ├── main.js                 # Entry point & application state subscription orchestrator
│   ├── state.js                # Centralized state management & LocalStorage persistence
│   ├── data.js                 # Default initial explorer tree & sample Kanban data
│   ├── style.css               # Complete responsive CSS design system
│   └── components/
│       ├── Header.js           # Navigation bar renderer (Breadcrumb, Log In / Sign Up / Log Out)
│       ├── Sidebar.js          # Explorer tree renderer (Folders, Files, Add/Delete actions)
│       ├── Board.js            # Kanban board renderer & Native HTML5 Drag & Drop
│       ├── Modals.js           # Modal popups renderer (List, Card, Details, Comments)
│       └── Auth.js             # Sign In & Registration screens renderer
└── NOTES.md                    # Super detailed educational reference guide
```

---

## 🏷️ HTML5 Semantic Elements & Attributes Breakdown

### 1. HTML5 Semantic Tags
| Element Tag | Purpose & Description | Applied In |
| :--- | :--- | :--- |
| `<header>` | Represents top navigational header bar containing brand logo, breadcrumb, and user profile buttons. | `Header.js` |
| `<aside>` | Represents sidebar explorer containing directory folders and files tree view. | `Sidebar.js` |
| `<main>` | Represents the central workspace canvas hosting the Kanban board columns. | `Board.js` |
| `<section>` | Represents an individual Kanban column (e.g., Backlog, To Do, Doing, Done). | `Board.js` |
| `<article>` | Represents a standalone Kanban task card within a column. | `Board.js` |
| `<form>` | Wraps input fields for user sign in and account registration. | `Auth.js` |
| `<input>` | Captures user inputs (email, password, text titles, comments). | `Auth.js`, `Modals.js`, `Sidebar.js` |
| `<button>` | Interactive click buttons for actions (submit, cancel, delete, login). | All Components |
| `<svg>` | Scalable Vector Graphics for crisp vector icons (plus icon, file icon, comment bubble, trash bin). | `Sidebar.js`, `Board.js` |

---

### 2. Essential HTML Attributes & Their Work

| Attribute | Work & Functionality | Code Example |
| :--- | :--- | :--- |
| `draggable="true"` | Enables native browser HTML5 drag-and-drop capability on card elements. | `<article class="card" draggable="true">` |
| `data-*` (Custom Attributes) | Stores custom data attributes (e.g., `data-task-id`, `data-col-id`, `data-action`) on DOM nodes for event delegation. | `<div data-action="select-file" data-file-id="file-1">` |
| `id` | Unique identifier for targeting specific elements in DOM queries or event binding. | `<button id="btn-logout">` |
| `class` | Applies CSS class rules for styling and visual feedback states (e.g., `.active`, `.dragging`, `.drag-over`). | `<div class="card dragging">` |
| `type` | Specifies element input type (`text`, `email`, `password`, `submit`, `button`). | `<input type="password">` |
| `placeholder` | Short hint text rendered inside inputs before user enters a value. | `<input placeholder="alex@example.com">` |
| `autoFocus` | Automatically focuses cursor inside input field upon element rendering. | `<input autoFocus class="inline-input" />` |
| `rows` | Specifies height in text lines for `<textarea>` elements. | `<textarea rows="3"></textarea>` |
| `viewBox` | Defines internal coordinate system space for scalable `<svg>` graphics. | `<svg viewBox="0 0 24 24">` |

---

## ⚙️ JavaScript Functions & Methods Deep-Dive

### 1. State Store Engine (`src/state.js`)

#### `loadInitialState()`
* **Work**: Reads `localStorage` for stored keys (`boardly-v7-sidebar`, `boardly-v7-boards`, `boardly-v7-user`). If no local data exists, falls back to `initialSidebarStructure` and `initialBoardsData` from `src/data.js`.
* **Returns**: Initial state object `{ view, isLoggedIn, registeredUser, sidebarStructure, activeFileId, boards, activeModal }`.

#### `StateStore.setState(updater)`
* **Work**: Central state mutation function. Accepts an updated partial state object or updater function, merges it into `this.state`, executes `this.saveToStorage()`, and notifies all active UI subscribers to re-render.

#### `StateStore.saveToStorage()`
* **Work**: Serializes state objects into JSON strings using `JSON.stringify()` and saves them into browser `localStorage`.

---

### 2. Kanban Board & HTML5 Drag and Drop (`src/components/Board.js`)

#### `renderBoard(state)`
* **Work**: Generates HTML markup for the active file's columns, task cards, card count badges, comment badges, and "Add a list" zone.

#### `attachBoardEvents(container)` — Event Delegation & Drag/Drop
1. **Click Delegation**:
   ```javascript
   canvas.addEventListener('click', (e) => {
     const actionBtn = e.target.closest('[data-action]');
     // Triggers add-card, edit-list, or delete-list modals
   });
   ```
2. **Native HTML5 Drag and Drop Sequence**:
   - **`dragstart`**: Fired when user picks up a card. Attaches task ID to event data transfer:
     ```javascript
     e.dataTransfer.setData('text/plain', draggedTaskId);
     cardEl.classList.add('dragging');
     ```
   - **`dragover`**: Fired continuously as card hovers over columns. Calls `e.preventDefault()` to permit dropping, and adds `.drag-over` highlight class.
   - **`dragleave`**: Removes `.drag-over` highlight class when leaving a target column.
   - **`drop`**: Fired when card is dropped into a target column. Reads `draggedTaskId`, calculates vertical drop index among existing cards, and calls `store.moveTask(taskId, targetColId, dropIndex)`.

---

### 3. Explorer Sidebar (`src/components/Sidebar.js`)

#### `renderSidebar(state)`
* **Work**: Dynamically maps through `sidebarStructure` folders and files to render expandable tree folders, file items, inline inputs for new files/folders, and action icons.

#### `attachSidebarEvents(container)`
* **Work**: Listens for click events on folder header chevrons to expand/collapse folders, file items to switch active board workspace, and plus icons to trigger inline file/folder inputs. Handles `Enter` key or `blur` events to save new file/folder names.

---

### 4. Modal Dialogs (`src/components/Modals.js`)

#### `renderModals(state)`
* **Work**: Renders modal overlays dynamically based on `state.activeModal.type`:
  - `'addList'`: Input field to create new column.
  - `'editList'`: Input field to rename column title.
  - `'deleteList'`: Confirmation warning dialog before deleting column.
  - `'addCard'`: Textarea field for creating new card.
  - `'cardDetail'`: Detailed modal to edit card description and view/add comments.

---

### 5. Authentication (`src/components/Auth.js`)

#### `attachAuthEvents(container)`
* **Work**: Handles user authentication:
  - **Login Submit**: Validates input email and password against `state.registeredUser`. On success, sets `isLoggedIn: true` and switches view to `'website'`.
  - **Register Submit**: Checks password match confirmation, creates `newUser` object, saves to state & LocalStorage, and automatically signs in the user.
  - **Back to Website**: Navigates user back to website view (`store.setState({ view: 'website' })`).

---

### 6. App Lifecycle & Subscription (`src/main.js`)

```javascript
function renderApp() {
  const state = store.getState();
  // 1. Render Auth screen or Main Website structure
  // 2. Attach DOM Event Listeners
  // 3. Render and attach Modal Overlays
}

// Subscribe state store changes to trigger automatic UI re-renders
store.subscribe(() => {
  renderApp();
});
```

---

## 🎨 CSS3 Design System & Theme Tokens (`src/style.css`)

```css
:root {
  --color-navy: #0f172a;       /* Brand dark header & binder text */
  --color-slate-dark: #1e293b;  /* Sidebar dark background */
  --color-blue: #2563eb;        /* Primary action buttons & active file */
  --color-purple: #9333ea;      /* Gradient accents & secondary highlights */
  --color-gold: #f59e0b;        /* Sparkle accents & add list highlights */
  --color-mint: #10b981;        /* Success avatar & completed badge */
}
```

---

## 🎓 Exam & Assessment Summary (Lectures 13–18 Focus)

1. **Why Vanilla JS over React?**
   - Direct control over DOM tree via `querySelector`, `createElement`, and `innerHTML`.
   - Zero framework build dependency or extra bundle weight.
   - Deep understanding of browser event loop, event bubbles, and event delegation.

2. **How does LocalStorage Persistence Work?**
   - `localStorage` stores key-value pairs as strings. `JSON.stringify()` converts JavaScript objects to strings before saving, and `JSON.parse()` restores them back to native objects upon app initialization.

3. **How does Event Delegation Improve Performance?**
   - Instead of attaching individual click listeners to hundreds of cards or file items, a single event listener is attached to the parent container (`.sidebar-scroll` or `#board-canvas`), using `e.target.closest('[data-action]')` to catch clicks efficiently.
