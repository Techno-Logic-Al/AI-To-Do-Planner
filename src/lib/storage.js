import {
  normalizeInsight,
  normalizeTaskDetails,
} from "../../shared/insightShape.js";

const STORAGE_KEY = "ai-todo-studio-items";

const seedTasks = [
  {
    id: "starter-1",
    title: "Refine onboarding checklist",
    details:
      "The setup flow for new developers still feels vague and easy to miss.",
    completed: false,
    createdAt: "2026-03-16T09:15:00.000Z",
    insight: null,
    isThinking: false,
    error: "",
  },
  {
    id: "starter-2",
    title: "Group weekly errands",
    details:
      "Need a tighter plan for groceries, pharmacy pickup, and returning parcels.",
    completed: false,
    createdAt: "2026-03-16T08:40:00.000Z",
    insight: null,
    isThinking: false,
    error: "",
  },
];

export function loadTaskState() {
  if (typeof window === "undefined") {
    return createSeedState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createSeedState();
    }

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return {
        tasks: parsed.map(normalizeTask),
        deletedTasks: [],
      };
    }

    if (!parsed || typeof parsed !== "object") {
      return createSeedState();
    }

    return {
      tasks: Array.isArray(parsed.tasks)
        ? parsed.tasks.map(normalizeTask)
        : createSeedState().tasks,
      deletedTasks: Array.isArray(parsed.deletedTasks)
        ? parsed.deletedTasks.map(normalizeDeletedTask)
        : [],
    };
  } catch {
    return createSeedState();
  }
}

export function saveTaskState(taskState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      tasks: taskState.tasks.map(serializeTask),
      deletedTasks: taskState.deletedTasks.map(serializeDeletedTask),
    }),
  );
}

function createSeedState() {
  return {
    tasks: seedTasks.map(normalizeTask),
    deletedTasks: [],
  };
}

function normalizeTask(task) {
  return {
    id: task.id,
    title: task.title || "Untitled task",
    details: normalizeTaskDetails(task.details || ""),
    completed: Boolean(task.completed),
    createdAt: task.createdAt || new Date().toISOString(),
    insight: normalizeInsight(task.insight),
    isThinking: false,
    error: "",
  };
}

function normalizeDeletedTask(task) {
  return {
    ...normalizeTask(task),
    deletedAt: task.deletedAt || new Date().toISOString(),
  };
}

function serializeTask(task) {
  return {
    id: task.id,
    title: task.title || "Untitled task",
    details: normalizeTaskDetails(task.details || ""),
    completed: Boolean(task.completed),
    createdAt: task.createdAt || new Date().toISOString(),
    insight: normalizeInsight(task.insight),
  };
}

function serializeDeletedTask(task) {
  return {
    ...serializeTask(task),
    deletedAt: task.deletedAt || new Date().toISOString(),
  };
}
