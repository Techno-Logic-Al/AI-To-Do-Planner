import { TaskCard } from "./TaskCard";

export function TaskList({
  tasks,
  onDeleteTask,
  onGenerateInsight,
  onToggleTask,
}) {
  return (
    <section className="panel list-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Task planning</p>
          <h2>Active tasks</h2>
        </div>
        <p className="panel-copy">
          Request an AI suggestion to help you plan each task in more detail.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <h3>No active tasks</h3>
          <p>
            Add a new task or open the stat cards above to review completed and
            deleted tasks.
          </p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task, index) => (
            <TaskCard
              index={index}
              key={task.id}
              onDeleteTask={onDeleteTask}
              onGenerateInsight={onGenerateInsight}
              onToggleTask={onToggleTask}
              task={task}
            />
          ))}
        </div>
      )}
    </section>
  );
}
