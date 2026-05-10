export function useStreamingChat() {
  const stream = async ({
    message,
    sessionToken,
    tenantId,
    onSession,
    onChunk,
    onDone,
  }: {
    message: string;
    sessionToken?: string;
    tenantId: string;
    onSession: (token: string) => void;
    onChunk: (chunk: string) => void;
    onDone: () => void;
  }) => {
    const response = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': tenantId,
      },
      body: JSON.stringify({ message, sessionToken }),
    });

    if (!response.ok) throw new Error('Stream request failed');
    if (!response.body) throw new Error('No response body');

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer    = '';

    try {
      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          let parsed: any;
          try { parsed = JSON.parse(raw); } catch { continue; }

          if (parsed.type === 'session') {
            onSession(parsed.sessionToken);
          } else if (parsed.type === 'text') {
            onChunk(parsed.content);
          } else if (parsed.type === 'done') {
            onDone();
            break outer; // don't wait for TCP close — exit immediately
          } else if (parsed.type === 'error') {
            throw new Error(parsed.content ?? 'Stream error');
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  return { stream };
}
