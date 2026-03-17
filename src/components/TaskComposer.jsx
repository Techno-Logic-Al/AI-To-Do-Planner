import { useState } from "react";

export function TaskComposer({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  function submitTask() {
    const cleanTitle = title.trim();
    const cleanDetails = details.trim();

    if (!cleanTitle) {
      return false;
    }

    onAddTask({
      title: cleanTitle,
      details: cleanDetails,
    });

    setTitle("");
    setDetails("");
    return true;
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitTask();
  }

  function handleDetailsKeyDown(event) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    if (submitTask()) {
      event.preventDefault();
    }
  }

  return (
    <section className="panel composer">
      <div className="panel-heading composer-heading">
        <div className="composer-heading-copy">
          <p className="eyebrow">Task creation</p>
          <h2>Add a task or planning note</h2>
          <p className="panel-copy">
            Keep the first draft rough. The AI can refine it when it suggests
            an improvement.
          </p>
        </div>
      </div>

      <form className="composer-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Task title</span>
          <input
            maxLength={140}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: Pick up groceries after work"
            type="text"
            value={title}
          />
        </label>

        <label className="field">
          <span>Context or notes</span>
          <textarea
            maxLength={600}
            onChange={(event) => setDetails(event.target.value)}
            onKeyDown={handleDetailsKeyDown}
            placeholder="Add a little context so the AI can suggest a sharper title, next step, or grouping."
            rows="5"
            value={details}
          />
        </label>

        <div className="composer-footer">
          <p className="character-note">
            Better prompts come from concrete details, not longer paragraphs.
          </p>

          <button className="primary-button" disabled={!title.trim()} type="submit">
            Add task
          </button>
        </div>
      </form>
    </section>
  );
}
