import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';

export const config = { path: '/api/messages' };

function json(body, status = 200, headers = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', ...headers }
  });
}

function error(message, status) {
  return json({ error: message }, status);
}

function getMessageStore() {
  return getStore({ name: 'birthday-paper-v1', consistency: 'strong' });
}

export default async function handleMessages(request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return error('허용되지 않은 요청이야.', 403);
  }

  try {
    if (request.method === 'GET') {
      const store = getMessageStore();
      const { blobs } = await store.list({ prefix: 'messages/' });
      const messages = [];
      const batchSize = 25;
      for (let index = 0; index < blobs.length; index += batchSize) {
        const batch = blobs.slice(index, index + batchSize);
        const entries = await Promise.all(batch.map(({ key }) => store.get(key, { type: 'json' })));
        messages.push(...entries.filter(Boolean));
      }
      messages.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return json({ messages });
    }

    if (request.method !== 'POST') {
      return json({ error: '지원하지 않는 요청이야.' }, 405, { Allow: 'GET, POST' });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return error('편지 형식을 확인해줘.', 400);
    }
    if (!body || typeof body.name !== 'string' || typeof body.message !== 'string' ||
        body.name.length > 20 || body.message.length > 600 || body.website) {
      return error('이름과 메시지의 글자 수를 확인해줘.', 400);
    }

    const name = body.name.trim();
    const message = body.message.trim();
    if (!name || message.length < 3) {
      return error('이름과 세 글자 이상의 축하 메시지를 적어줘.', 400);
    }

    const entry = { id: randomUUID(), name, message, createdAt: new Date().toISOString() };
    await getMessageStore().setJSON(`messages/${entry.id}`, entry);
    return json({ message: entry }, 201);
  } catch (cause) {
    console.error('Failed to access birthday messages', cause);
    return error('편지를 처리하지 못했어. 잠시 뒤 다시 시도해줘.', 500);
  }
}
