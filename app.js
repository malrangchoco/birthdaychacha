(() => {
  const conf = window.ROLLING_PAPER || {};
  const $ = id => document.getElementById(id);
  $('title').textContent = conf.title || '생일 축하해!';
  $('recipient').textContent = conf.recipient || '오늘의 주인공';
  $('intro').textContent = conf.intro || '한 장의 종이에 우리 마음을 모아보자.';
  document.title = `${conf.recipient || '생일'} 롤링페이퍼`;
  document.documentElement.style.setProperty('--paper', conf.paperColor || '#fffdf5');
  document.documentElement.style.setProperty('--bg', conf.backgroundColor || '#f8f4e8');
  const notes = $('notes');
  const status = $('status');
  const formatError = err => { status.textContent = err.message || '잠시 뒤 다시 시도해줘.'; };
  const render = messages => {
    notes.replaceChildren();
    if (!messages.length) {
      const p = document.createElement('p'); p.className='empty';
      p.textContent='아직 편지가 없어. 첫 번째 축하를 남겨줘 ♡';
      notes.append(p); return;
    }
    for (const item of messages) {
      const el = document.createElement('article'); el.className='note';
      const body = document.createElement('p'); body.className='body'; body.textContent=item.message;
      const name = document.createElement('div'); name.className='from'; name.textContent=`FROM. ${item.name}`;
      el.append(body,name); notes.append(el);
    }
  };
  const load = async () => {
    try {
      const response=await fetch('/api/messages',{cache:'no-store'});
      if(!response.ok) throw Error('편지를 불러오지 못했어. 배포 설정을 확인해줘.');
      const data=await response.json(); render(data.messages || []);
    } catch(err) {
      render([]); $('notes').querySelector('.empty').textContent='편지를 불러올 수 없어. Netlify 배포 상태를 확인해줘.';
    }
  };
  $('message').addEventListener('input',()=> { $('count').textContent=`${$('message').value.length} / 600`; });
  $('writeForm').addEventListener('submit',async e => {
    e.preventDefault();
    const name=$('writer').value.trim(), message=$('message').value.trim();
    if(!name || message.length<3){status.textContent='이름과 세 글자 이상의 메시지를 적어줘.';return;}
    $('submit').disabled=true;status.textContent='편지를 붙이는 중…';
    try {
      const res=await fetch('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,message,website:$('website').value})});
      const data=await res.json();
      if(!res.ok) throw Error(data.error || '저장에 실패했어.');
      $('message').value='';$('count').textContent='0 / 600';status.textContent='종이에 편지를 붙였어! ♡';
      await load();
    }catch(err){formatError(err);}finally{$('submit').disabled=false;}
  });
  $('share').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(location.href);$('share').textContent='복사했어 ♡';}
    catch{ $('share').textContent='주소창의 링크를 복사해줘'; }
  });
  load();
})();
