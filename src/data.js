export const createInitialProject = () => ({
  "project-1": {
    id: "project-1",
    name: "My Project",
    columns: {
      "backlog": { id: "backlog", title: "Backlog", taskIds: [] },
      "todo": { id: "todo", title: "To Do", taskIds: [] },
      "doing": { id: "doing", title: "Doing", taskIds: [] },
      "done": { id: "done", title: "Done", taskIds: [] },
    },
    tasks: {},
    columnOrder: ["backlog", "todo", "doing", "done"]
  }
});