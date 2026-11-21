import { getStore } from '@netlify/blobs';
import { randomUUID, timingSafeEqual } from 'node:crypto';

const DEFAULTS = {
  recipient: '오늘의 주인공', title: '생일 축하해!', subtitle: '네가 태어난 오늘, 우리가 남기는 작은 마음들.',
  theme: 'pink', font: 'round', coverEmoji: '🎂', showNames: true,
  notice: '하나씩 열어보면, 우리가 네게 하고 싶었던 말이 담겨 있어 💌'
};
const THEMES = ['pink','butter','mint','lavender','blue'];
const FONTS = ['round','serif','hand'];
const json = (data, status=200) => new Response(JSON.stringify(data), {status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
const fail = (msg, status=400) => json({error:msg}, status);
const clean = (v, n) => typeof v === 'string' ? v.trim().slice(0,n) : '';
const admin = (req) => {
  const expected = process.env.ROLLING_ADMIN_KEY;
  const supplied = req.headers.get('x-admin-key') || '';
  if (!expected || !supplied) return false;
  const a=Buffer.from(expected), b=Buffer.from(supplied);
  return a.length===b.length && timingSafeEqual(a,b);
};
const corsOrigin = (req) => {
  const url = new URL(req.url);
  const origin = req.headers.get('origin');
  return !origin || origin === url.origin;
};
export default async (req) => {
  if(!corsOrigin(req)) return fail('허용되지 않은 요청이야.',403);
  const url = new URL(req.url);
  const action = url.pathname.split('/').filter(Boolean).pop();
  let store;
  try { store=getStore('birthday-paper-v1'); } catch(e) { return fail('서버 저장소 연결에 실패했어.',503); }
  try {
    if(req.method==='GET' && action==='board') {
      return json({board:{...DEFAULTS,...(await store.get('board',{type:'json'}) || {})}, isConfigured:!!process.env.ROLLING_ADMIN_KEY});
    }
    if(req.method==='GET' && action==='messages') {
      const listing=await store.list({prefix:'messages/'});
      const entries=await Promise.all(listing.blobs.slice(0,500).map(x=>store.get(x.key,{type:'json'})));
      return json({messages:entries.filter(Boolean).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))});
    }
    if(req.method==='POST' && action==='messages') {
      const body=await req.json();
      if(clean(body.website,200)) return fail('제출되지 않았어.',400);
      const name=clean(body.name,20), message=clean(body.message,600);
      if(!name || !message) return fail('이름과 편지를 모두 입력해줘.');
      if(message.length<3) return fail('편지를 세 글자 이상 적어줘.');
      if(typeof body.message!=='string' || body.message.length>600 || typeof body.name!=='string' || body.name.length>20) return fail('입력 글자 수를 확인해줘.');
      const color=THEMES.includes(body.color)?body.color:'pink';
      const sticker=['💗','🎀','🎂','🌷','⭐','🧸','🍀','💌','🦋','🍓'].includes(body.sticker)?body.sticker:'💗';
      const entry={id:randomUUID(),name,message,color,sticker,createdAt:new Date().toISOString()};
      await store.setJSON(`messages/${entry.id}`,entry);
      return json({message:entry},201);
    }
    if(req.method==='PUT' && action==='board') {
      if(!admin(req)) return fail('관리자 비밀번호가 올바르지 않아. Netlify 환경변수 설정도 확인해줘.',401);
      const body=await req.json();
      const board={recipient:clean(body.recipient,30)||DEFAULTS.recipient,title:clean(body.title,50)||DEFAULTS.title,subtitle:clean(body.subtitle,100),notice:clean(body.notice,130),coverEmoji:clean(body.coverEmoji,8)||'🎂',theme:THEMES.includes(body.theme)?body.theme:'pink',font:FONTS.includes(body.font)?body.font:'round',showNames:body.showNames!==false};
      await store.setJSON('board',board);
      return json({board});
    }
    if(req.method==='DELETE' && action==='messages') {
      if(!admin(req)) return fail('관리자 비밀번호가 올바르지 않아.',401);
      const id=url.searchParams.get('id')||'';
      if(!/^[0-9a-f-]{36}$/.test(id)) return fail('유효하지 않은 편지야.');
      await store.delete(`messages/${id}`);
      return json({ok:true});
    }
    return fail('요청한 기능을 찾지 못했어.',404);
  } catch(e) { console.error('rollingpaper-api', e); return fail('서버에서 처리하지 못했어. 잠시 뒤 다시 시도해줘.',500); }
};
