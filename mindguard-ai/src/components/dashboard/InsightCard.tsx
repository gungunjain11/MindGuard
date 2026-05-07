export default function InsightCard({ summary }: { summary: string }) {
  return (
    <div className="card">
      <p className="label">Latest AI insight</p>
      <p>{summary}</p>
    </div>
  );
}
