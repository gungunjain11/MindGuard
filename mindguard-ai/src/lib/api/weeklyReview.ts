export async function generateWeeklyReview(uid: string) {
  const response = await fetch('/api/weekly-review/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid })
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to generate weekly review');
  }

  return result.data;
}
