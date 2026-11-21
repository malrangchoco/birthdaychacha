# 생일 롤링페이퍼

이름과 축하 메시지를 남기면 같은 주소를 방문한 누구나 편지를 읽을 수 있어.

- 정적 파일과 문구 설정은 `public/`에 있고, `public/config.js`에서 제목과 받는 사람을 수정할 수 있어.
- Netlify는 `public/`을 게시하고 `netlify/functions/api.mjs`를 `/api/messages`에 연결해.
- 편지는 사이트 단위 Netlify Blobs 저장소 `birthday-paper-v1`의 `messages/` 아래에 보관돼. 새 배포에서도 같은 편지를 읽을 수 있어.

로컬에서 서버 저장과 공개 열람을 확인하려면 `npm install` 후 `npm run dev`를 실행해. 로컬 Netlify Blobs의 데이터는 운영 사이트와 별개야.
