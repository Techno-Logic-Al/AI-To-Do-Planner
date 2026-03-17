import { useEffect } from "react";

import { InsightPanel } from "./insightPanel";

export function TaskDetailModal({ selectedTask, onClose, onMoveTask }) {
  useEffect(() => {
    if (!selectedTask) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTask, onClose]);

  if (!selectedTask) {
    return null;
  }

  const { task, groupLabel } = selectedTask;
  const currentStatus = getTaskStatus(task);
  const statusLabel = getStatusLabel(currentStatus);
  const statusClass = getStatusPillClass(currentStatus);
  const statusIconClass = getStatusIconClass(currentStatus);
  const moveActions = getMoveActions(currentStatus);
  const createdAt = formatTimestamp(task.createdAt);
  const deletedAt = formatTimestamp(task.deletedAt);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-labelledby={`task-detail-${task.id}`}
        aria-modal="true"
        className="task-modal panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="task-modal-header">
          <div>
            <p className="eyebrow">{groupLabel}</p>
            <h2 id={`task-detail-${task.id}`}>{task.title}</h2>
          </div>

          <button className="ghost-button" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="task-modal-meta">
          <span className={`status-pill ${statusClass}`}>
            {statusLabel}
            <span
              aria-hidden="true"
              className={`status-icon ${statusIconClass}`}
            />
          </span>
          {createdAt ? <p>Created {createdAt}</p> : null}
          {deletedAt ? <p>Deleted {deletedAt}</p> : null}
        </div>

        <section className="task-modal-section">
          <h3>Context or notes</h3>
          <p>{task.details || "No notes were added for this task."}</p>
        </section>

        <section className="task-modal-section">
          <h3>Move task</h3>
          <div className="task-modal-actions">
            {moveActions.map((action) => (
              <button
                className={`ghost-button button-with-icon ${action.buttonClass}`}
                key={action.targetStatus}
                onClick={() => onMoveTask(task.id, action.targetStatus)}
                type="button"
              >
                <span>{action.label}</span>
                <span
                  aria-hidden="true"
                  className={`status-icon ${action.iconClass}`}
                />
              </button>
            ))}
          </div>
        </section>

        {task.insight ? (
          <section className="task-modal-section">
            <h3>AI suggestion</h3>
            <InsightPanel insight={task.insight} />
          </section>
        ) : (
          <section className="task-modal-section">
            <h3>AI suggestion</h3>
            <p className="task-modal-empty">
              No AI suggestion has been generated for this task yet.
            </p>
          </section>
        )}
      </section>
    </div>
  );
}

function formatTimestamp(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getTaskStatus(task) {
  if (task.deletedAt) {
    return "deleted";
  }

  return task.completed ? "completed" : "active";
}

function getStatusLabel(status) {
  if (status === "completed") {
    return "Completed";
  }

  if (status === "deleted") {
    return "Deleted";
  }

  return "Active";
}

function getStatusPillClass(status) {
  if (status === "completed") {
    return "done";
  }

  if (status === "deleted") {
    return "deleted";
  }

  return "open";
}

function getStatusIconClass(status) {
  if (status === "completed") {
    return "completed";
  }

  if (status === "deleted") {
    return "deleted";
  }

  return "active";
}

function getMoveActions(status) {
  if (status === "deleted") {
    return [
      {
        targetStatus: "active",
        label: "Move to active",
        iconClass: "active",
        buttonClass: "",
      },
      {
        targetStatus: "completed",
        label: "Move to completed",
        iconClass: "completed",
        buttonClass: "",
      },
    ];
  }

  if (status === "completed") {
    return [
      {
        targetStatus: "active",
        label: "Move to active",
        iconClass: "active",
        buttonClass: "",
      },
      {
        targetStatus: "deleted",
        label: "Move to deleted",
        iconClass: "deleted",
        buttonClass: "danger",
      },
    ];
  }

  return [
    {
      targetStatus: "completed",
      label: "Move to completed",
      iconClass: "completed",
      buttonClass: "",
    },
    {
      targetStatus: "deleted",
      label: "Move to deleted",
      iconClass: "deleted",
      buttonClass: "danger",
    },
  ];
}
