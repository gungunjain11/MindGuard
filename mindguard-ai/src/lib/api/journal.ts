export async function analyzeJournal(payload: { uid: string; journalId: string; text: string }) {
  const response = await fetch('/api/journal/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: payload.uid,
      journalId: payload.journalId,
      journalText: payload.text
    })
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to analyze journal');
  }

  return result.data;
}
