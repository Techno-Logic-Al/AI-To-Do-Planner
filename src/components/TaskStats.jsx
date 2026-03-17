import { useState } from "react";

export function TaskStats({
  activeTasks,
  completedTasks,
  deletedTasks,
  onSelectTask,
}) {
  const [openKey, setOpenKey] = useState(null);

  const stats = [
    {
      key: "active",
      label: "Active tasks",
      tasks: activeTasks,
      iconClass: "active",
    },
    {
      key: "completed",
      label: "Completed tasks",
      tasks: completedTasks,
      iconClass: "completed",
    },
    {
      key: "deleted",
      label: "Deleted tasks",
      tasks: deletedTasks,
      iconClass: "deleted",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat) => {
        const isOpen = openKey === stat.key;

        return (
          <section
            className={`stat-card ${isOpen ? "is-open" : ""}`}
            key={stat.key}
          >
            <button
              aria-expanded={isOpen}
              className="stat-trigger"
              onClick={() => setOpenKey(isOpen ? null : stat.key)}
              type="button"
            >
              <div>
                <p>{stat.label}</p>
                <strong>{stat.tasks.length}</strong>
              </div>

              <div className="stat-trigger-side">
                <span
                  aria-hidden="true"
                  className={`status-icon status-icon-large ${stat.iconClass}`}
                />
                <span className="stat-trigger-copy">
                  {isOpen ? "Hide list" : "View list"}
                </span>
              </div>
            </button>

            {isOpen ? (
              <div className="stat-dropdown">
                {stat.tasks.length > 0 ? (
                  <ul className="stat-task-list">
                    {stat.tasks.map((task) => (
                      <li key={task.id}>
                        <button
                          className="stat-task-button"
                          onClick={() => {
                            onSelectTask(task, stat.label);
                            setOpenKey(null);
                          }}
                          type="button"
                        >
                          <span className="stat-task-title">{task.title}</span>
                          <span
                            aria-hidden="true"
                            className={`status-icon ${stat.iconClass}`}
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="stat-empty">No tasks in this category yet.</p>
                )}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
