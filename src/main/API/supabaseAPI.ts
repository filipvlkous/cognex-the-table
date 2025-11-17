import { Message } from '../../renderer/useTcpStore';

const SUPABASE_URL = 'https://aouteibsooigkxdtuayu.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdXRlaWJzb29pZ2t4ZHR1YXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzQyMjgsImV4cCI6MjA3NzI1MDIyOH0.jG7qLOe5swEBxeTltE9MJmWt0NpZ4uUZpChTwwz67ac'; // or service key
const SUPBAASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdXRlaWJzb29pZ2t4ZHR1YXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzQyMjgsImV4cCI6MjA3NzI1MDIyOH0.jG7qLOe5swEBxeTltE9MJmWt0NpZ4uUZpChTwwz67ac';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdXRlaWJzb29pZ2t4ZHR1YXl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTY3NDIyOCwiZXhwIjoyMDc3MjUwMjI4fQ.I8Jpz99DIfdmTN4GmQTsCvP39zESPyXheYF26aU2UV4';
export async function uploadLog(message: Message) {
  const receivedMs = message.receivedTime
    ? Date.parse(message.receivedTime)
    : null;
  const sendMs = message.sendTime ? Date.parse(message.sendTime) : null;

  const durationSeconds =
    receivedMs !== null && sendMs !== null
      ? Number(((sendMs - receivedMs) / 1000).toFixed(0))
      : null;

  const body = [
    {
      content: message.content?.map((item) => item.content) ?? [],
      regime: message.regime ?? null,
      receivedTime: message.receivedTime ?? null,
      sendTime: message.sendTime ?? null,
      imageName: message.imageName ?? null,
      duration: durationSeconds,
      totalSendCount: message.content?.length ?? 0,
      addedCount: message.content?.filter((item) => item.added)?.length ?? 0,
    },
  ];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/logs`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation', // optional: returns inserted row(s)
      },
      body: JSON.stringify(body),
    });

    // ✅ Try to parse response safely
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // fallback if no JSON returned
      data = null;
    }

    // ✅ Check HTTP status
    if (!res.ok) {
      console.error('❌ Upload failed:', data || (await res.text()));
      return { success: false, error: data || 'Upload failed' };
    }

    // ✅ Optionally validate Supabase structure (if known)

    return { success: true, error: null };
  } catch (err: any) {
    console.error('❌ Network or unexpected error:', err.message || err);
    return { success: false, error: err.message || 'Unexpected error' };
  }
}

export async function uploadBase64ToSupabase(
  base64Data: string,
  bucketName: string,
  filePath: string,
  contentType: string,
) {
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${bucketName}/${filePath}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': contentType,
        'x-upsert': 'true',
      },
      body: bytes,
    },
  );

  const result = await response.json();
  return result;
}
