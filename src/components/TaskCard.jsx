import { InsightPanel } from "./insightPanel";

export function TaskCard({
  task,
  index,
  onDeleteTask,
  onGenerateInsight,
  onToggleTask,
}) {
  const statusIconClass = task.completed ? "completed" : "active";

  return (
    <article
      className={`task-card ${task.completed ? "is-complete" : ""}`}
      style={{ animationDelay: `${Math.min(index * 90, 360)}ms` }}
    >
      <div className="task-header">
        <div>
          <span className={`status-pill ${task.completed ? "done" : "open"}`}>
            {task.completed ? "Done" : "Active"}
            <span
              aria-hidden="true"
              className={`status-icon ${statusIconClass}`}
            />
          </span>
          <h3>{task.title}</h3>
        </div>

        <button
          className="ghost-button danger button-with-icon"
          onClick={() => onDeleteTask(task.id)}
          type="button"
        >
          <span>Delete</span>
          <span aria-hidden="true" className="status-icon deleted" />
        </button>
      </div>

      {task.details ? <p className="task-details">{task.details}</p> : null}

      <div className="task-actions">
        <button
          className="ghost-button button-with-icon"
          onClick={() => onToggleTask(task.id)}
          type="button"
        >
          <span>{task.completed ? "Mark active" : "Mark complete"}</span>
          <span
            aria-hidden="true"
            className={`status-icon ${task.completed ? "active" : "completed"}`}
          />
        </button>

        <button
          className="secondary-button"
          disabled={task.isThinking}
          onClick={() => onGenerateInsight(task.id)}
          type="button"
        >
          {task.isThinking
            ? "Thinking..."
            : task.insight
              ? "Refresh Suggestion"
              : "Request Suggestion"}
        </button>
      </div>

      {task.error ? <p className="task-error">{task.error}</p> : null}

      {task.isThinking ? (
        <div className="insight-shell loading">
          <div className="spinner" aria-hidden="true" />
          <div>
            <p className="eyebrow">AI suggestion</p>
            <p className="loading-copy">
              Reviewing the wording, category, and best next step.
            </p>
          </div>
        </div>
      ) : null}

      {task.insight ? <InsightPanel insight={task.insight} /> : null}
    </article>
  );
}
