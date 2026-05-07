export default function InterventionCard({
  immediateAction,
  weeklyAction
}: {
  immediateAction: string;
  weeklyAction: string;
}) {
  return (
    <div className="card">
      <p className="label">Action plan</p>
      <p><strong>Now:</strong> {immediateAction}</p>
      <p><strong>This week:</strong> {weeklyAction}</p>
    </div>
  );
}
