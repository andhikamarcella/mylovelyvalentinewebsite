export default function handler() {
  return Response.json({ ok: true, now: new Date().toISOString() });
}
