export default function RiskCard({
  score,
  level
}: {
  score: number;
  level: "low" | "medium" | "high";
}) {
  return (
    <div className="card riskCard">
      <p className="label">Current risk</p>
      <h2>{score}</h2>
      <span className={`badge ${level}`}>{level}</span>
    </div>
  );
}
