export async function fetchInsightSummary(payload: { uid: string; currentVector: number[]; currentJournalId: string }) {
  const response = await fetch('/api/insights/retrieve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to retrieve similar entries');
  }

  return result.data;
}
