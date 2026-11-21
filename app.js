const settings = window.ROLLING_PAPER || {};
for (const id of ['title', 'recipient', 'intro']) {
  if (settings[id]) document.getElementById(id).textContent = settings[id];
}

const endpoint = '/api/messages';
const colors = ['pink', 'butter', 'mint', 'lavender', 'blue'];
const notes = document.querySelector('#notes');
const letterCount = document.querySelector('#letter-count');
const boardStatus = document.querySelector('#board-status');
const form = document.querySelector('#write');
const writer = document.querySelector('#writer');
const message = document.querySelector('#message');
const count = document.querySelector('#count');
const submit = document.querySelector('#submit');
const formStatus = document.querySelector('#status');
const share = document.querySelector('#share');
const shareLink = document.querySelector('#share-link');
const shareStatus = document.querySelector('#share-status');
let messages = [];

function renderMessages() {
  letterCount.textContent = `${messages.length}통`;
  letterCount.hidden = false;
  boardStatus.hidden = messages.length > 0;
  boardStatus.textContent = messages.length ? '' : '첫 번째 축하 편지를 남겨줘!';
  notes.replaceChildren(...messages.map(item => {
    const note = document.createElement('article');
    note.className = 'note';
    note.dataset.color = colors.includes(item.color)
      ? item.color
      : colors[parseInt(item.id[0], 16) % colors.length];

    const body = document.createElement('p');
    body.className = 'note-body';
    body.textContent = item.message;

    const signature = document.createElement('p');
    signature.className = 'note-from';
    signature.textContent = `From. ${item.name}`;

    note.append(body, signature);
    return note;
  }));
}

async function loadMessages() {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('편지를 불러오지 못했어.');
    const data = await response.json();
    const merged = new Map([...data.messages, ...messages].map(item => [item.id, item]));
    messages = [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    renderMessages();
  } catch {
    if (!messages.length) {
      boardStatus.textContent = '편지를 불러오지 못했어. 새로고침해서 다시 확인해줘.';
    }
  }
}

function updateCount() {
  count.textContent = `${message.value.length} / ${message.maxLength}`;
}

message.addEventListener('input', updateCount);
form.addEventListener('submit', async event => {
  event.preventDefault();
  const name = writer.value.trim();
  const text = message.value.trim();
  if (!name || text.length < 3) {
    formStatus.textContent = '이름과 세 글자 이상의 축하 메시지를 적어줘.';
    return;
  }

  submit.disabled = true;
  formStatus.textContent = '편지를 붙이는 중…';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message: text, website: form.elements.website.value })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    messages.unshift(data.message);
    renderMessages();
    await loadMessages();
    if (message.value.trim() === text) {
      message.value = '';
      updateCount();
    }
    formStatus.textContent = '편지를 붙였어! ♡';
  } catch {
    formStatus.textContent = '편지를 저장하지 못했어. 잠시 뒤 다시 시도해줘.';
  } finally {
    submit.disabled = false;
  }
});

share.addEventListener('click', async () => {
  const url = new URL(location.pathname, location.origin).href;
  try {
    await navigator.clipboard.writeText(url);
    shareLink.hidden = true;
    shareStatus.textContent = '링크를 복사했어!';
  } catch {
    shareLink.hidden = false;
    shareLink.value = url;
    shareLink.select();
    shareStatus.textContent = '선택된 링크를 복사해줘.';
  }
});

loadMessages();
