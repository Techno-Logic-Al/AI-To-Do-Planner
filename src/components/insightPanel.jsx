export function InsightPanel({ insight }) {
  return (
    <section className="insight-shell">
      <div className="insight-heading">
        <p className="eyebrow">AI suggestion</p>
        <h4>{ensureFullStop(insight.refinedTitle)}</h4>
      </div>

      <dl className="insight-grid">
        <div>
          <dt>Category</dt>
          <dd>{insight.category}</dd>
        </div>
        <div>
          <dt>Why this helps</dt>
          <dd>{insight.improvementSummary}</dd>
        </div>
        <div>
          <dt>Next step</dt>
          <dd>{insight.nextStep}</dd>
        </div>
        <div>
          <dt>Batch it with</dt>
          <dd>{insight.batchWith}</dd>
        </div>
      </dl>

      <div className="tag-row">
        {insight.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}

function ensureFullStop(value) {
  const cleaned = String(value || "").replace(/[.!?;:,]+\s*$/g, "").trimEnd();
  return cleaned ? `${cleaned}.` : "";
}
