import { Message } from '../../renderer/useTcpStore';

const SUPABASE_URL = 'https://aouteibsooigkxdtuayu.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdXRlaWJzb29pZ2t4ZHR1YXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzQyMjgsImV4cCI6MjA3NzI1MDIyOH0.jG7qLOe5swEBxeTltE9MJmWt0NpZ4uUZpChTwwz67ac'; // or service key

export async function uploadLog(message: Message) {
  const body = [
    {
      content: { name: 'test upload' },
      imageName: 'uploaded image name',
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
