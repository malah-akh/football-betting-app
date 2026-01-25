const BACKEND_URL = 'http://localhost:5050';

export async function ingestMatches(date: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to call backend ingest:', error);
    // Don't block the UI if backend fails, just log it. 
    // The user will see whatever data is available (or empty state).
    return null; 
  }
}

export async function ingestMatch(matchId: number) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId }),
    });

    if (!response.ok) throw new Error(`Backend error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to ingest match ${matchId}:`, error);
    return null;
  }
}
