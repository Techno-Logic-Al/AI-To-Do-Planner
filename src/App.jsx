import { useEffect, useState } from "react";

import { TaskComposer } from "./components/TaskComposer";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { TaskList } from "./components/TaskList";
import { TaskStats } from "./components/TaskStats";
import { requestInsight } from "./lib/requestInsight";
import { loadTaskState, saveTaskState } from "./lib/storage";
import { normalizeTaskDetails } from "../shared/insightShape";

export default function App() {
  const [taskState, setTaskState] = useState(loadTaskState);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const { tasks, deletedTasks } = taskState;

  useEffect(() => {
    saveTaskState(taskState);
  }, [taskState]);

  const activeTasks = tasks
    .filter((task) => !task.completed)
    .sort(sortByCreatedAtDescending);
  const completedTasks = tasks
    .filter((task) => task.completed)
    .sort(sortByCreatedAtDescending);
  const deletedTaskItems = [...deletedTasks].sort(sortByDeletedAtDescending);
  const currentSelectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId) ||
      deletedTasks.find((task) => task.id === selectedTaskId)
    : null;
  const selectedTask = currentSelectedTask
    ? {
        task: currentSelectedTask,
        groupLabel: getGroupLabel(getTaskStatus(currentSelectedTask)),
      }
    : null;

  async function handleGenerateInsight(taskId) {
    const currentTask = tasks.find((task) => task.id === taskId);

    if (!currentTask) {
      return;
    }

    setTaskState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              isThinking: true,
              error: "",
            }
          : task,
      ),
    }));

    try {
      const insight = await requestInsight(currentTask);

      setTaskState((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                insight,
                isThinking: false,
                error: "",
              }
            : task,
        ),
      }));
    } catch (error) {
      setTaskState((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                isThinking: false,
                error: error.message,
              }
            : task,
        ),
      }));
    }
  }

  function handleAddTask({ title, details }) {
    const newTask = {
      id: crypto.randomUUID(),
      title,
      details: normalizeTaskDetails(details),
      completed: false,
      createdAt: new Date().toISOString(),
      insight: null,
      isThinking: false,
      error: "",
    };

    setTaskState((current) => ({
      ...current,
      tasks: [newTask, ...current.tasks],
    }));
  }

  function handleToggleTask(taskId) {
    setTaskState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
            }
          : task,
      ),
    }));
  }

  function handleDeleteTask(taskId) {
    setTaskState((current) => {
      const taskToDelete = current.tasks.find((task) => task.id === taskId);

      if (!taskToDelete) {
        return current;
      }

      const deletedTask = {
        ...taskToDelete,
        deletedAt: new Date().toISOString(),
        isThinking: false,
        error: "",
      };

      return {
        tasks: current.tasks.filter((task) => task.id !== taskId),
        deletedTasks: [deletedTask, ...current.deletedTasks],
      };
    });
  }

  function handleSelectTask(task) {
    setSelectedTaskId(task.id);
  }

  function handleMoveTask(taskId, targetStatus) {
    setTaskState((current) => moveTaskBetweenGroups(current, taskId, targetStatus).taskState);
  }

  function handleBackToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="app-shell" id="top">
      <div className="background-orb orb-one" aria-hidden="true" />
      <div className="background-orb orb-two" aria-hidden="true" />

      <main className="layout">
        <section className="hero panel">
          <div className="hero-copy">
            <p className="eyebrow">Harnessing the power of ChatGTP</p>
            <h1>To-do planning with AI suggestions and improvements.</h1>
            <p className="hero-text">
              Add tasks, ask the assistant to sharpen the wording, suggest the
              next action, and group similar work into smarter batches.
            </p>
          </div>

          <TaskStats
            activeTasks={activeTasks}
            completedTasks={completedTasks}
            deletedTasks={deletedTaskItems}
            onSelectTask={handleSelectTask}
          />
        </section>

        <section className="workspace">
          <TaskComposer onAddTask={handleAddTask} />

          <TaskList
            tasks={activeTasks}
            onDeleteTask={handleDeleteTask}
            onGenerateInsight={handleGenerateInsight}
            onToggleTask={handleToggleTask}
          />
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p className="site-footer-copy">
            Designed and created by Techno-Logic-Al Web Studio. ChatGTP is a
            registered trademark of OpenAI.
          </p>

          <button
            className="ghost-button footer-top-button"
            onClick={handleBackToTop}
            type="button"
          >
            Back to top
          </button>
        </div>
      </footer>

      <TaskDetailModal
        onMoveTask={handleMoveTask}
        selectedTask={selectedTask}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}

function getTaskStatus(task) {
  if (task.deletedAt) {
    return "deleted";
  }

  return task.completed ? "completed" : "active";
}

function getGroupLabel(status) {
  if (status === "completed") {
    return "Completed tasks";
  }

  if (status === "deleted") {
    return "Deleted tasks";
  }

  return "Active tasks";
}

function moveTaskBetweenGroups(taskState, taskId, targetStatus) {
  const sourceTask =
    taskState.tasks.find((task) => task.id === taskId) ||
    taskState.deletedTasks.find((task) => task.id === taskId);

  if (!sourceTask) {
    return {
      taskState,
      movedTask: null,
    };
  }

  const tasksWithoutSource = taskState.tasks.filter((task) => task.id !== taskId);
  const deletedWithoutSource = taskState.deletedTasks.filter(
    (task) => task.id !== taskId,
  );

  if (targetStatus === "deleted") {
    const movedTask = {
      ...sourceTask,
      completed: false,
      deletedAt: new Date().toISOString(),
      isThinking: false,
      error: "",
    };

    return {
      taskState: {
        tasks: tasksWithoutSource,
        deletedTasks: [movedTask, ...deletedWithoutSource],
      },
      movedTask,
    };
  }

  const { deletedAt, ...restoredTask } = sourceTask;
  const movedTask = {
    ...restoredTask,
    completed: targetStatus === "completed",
    isThinking: false,
    error: "",
  };

  return {
    taskState: {
      tasks: [movedTask, ...tasksWithoutSource],
      deletedTasks: deletedWithoutSource,
    },
    movedTask,
  };
}

function sortByCreatedAtDescending(left, right) {
  return new Date(right.createdAt) - new Date(left.createdAt);
}

function sortByDeletedAtDescending(left, right) {
  return new Date(right.deletedAt) - new Date(left.deletedAt);
}
