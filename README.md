# 생일 롤링페이퍼 — 심플 버전

한 장의 종이에 다 같이 글을 남기는 롤링페이퍼야. 로그인, 색상 선택, 스티커 고르기 없이 **이름 + 메시지 → 종이에 붙이기**만 있어.

## Netlify에 연결하기 (중요)
1. 이 폴더의 파일 **전부**를 새 GitHub 저장소에 올려. `public` 폴더만 올리면 안 돼.
2. Netlify → **Add new project** → **Import an existing project** → GitHub에서 저장소 선택.
3. 자동 인식되지 않으면 빌드 명령어는 `npm run build`, 게시 디렉터리는 `public`으로 설정해. 함수 디렉터리는 `netlify/functions` (`netlify.toml`에 포함).
4. Deploy를 누르고 발급되는 `https://...netlify.app` 주소로 접속해.
5. 편지를 하나 직접 남긴 뒤 다른 기기에서 새로고침해서 **동일한 글이 보이는지** 확인해. 성공하면 그 링크를 공유하면 돼.

> **주의:** ZIP 파일을 Netlify Drop에 올리거나 `index.html`만 실행하면, 서버 저장 기능이 동작하지 않아. 반드시 GitHub 연동한 소스 배포로 진행해. Netlify 배포는 Netlify 로그인 및 저장소 연결을 해야 하므로 이 ZIP만으로 자동 완료되는 건 아니야.

## 제목과 색상 수정
`public/config.js` 한 파일을 수정하면 돼.
- `title` : 큰 제목
- `recipient` : 받는 사람 이름
- `intro` : 제목 밑 문구
- `paperColor` : 종이 색 (예: `#fffdf5`)
- `backgroundColor` : 바탕 색

수정한 파일을 GitHub에 다시 올리면 Netlify가 재배포해.

## 데이터 보관
Netlify Functions + Netlify Blobs 사용. 모든 방문자가 편지를 읽고 추가할 수 있어. 공개 게시판이기 때문에 개인정보나 민감한 내용은 올리지 말아야 해. 악성 글 자동 차단, 관리자 삭제 화면은 이 심플 버전의 UI에 포함돼 있지 않아. 운영용 삭제 API는 관리자 비밀번호를 Netlify 환경 변수 `ROLLING_ADMIN_KEY`로 설정한 경우에만 사용 가능해.
