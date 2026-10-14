# TripMate

AI가 여행 일정 초안을 추천하고, 장소 순서와 이동 경로를 지도에서 확인하며, 일정을 공용 여행 기록에 저장하는 웹서비스입니다.

## 주요 기능

- 도시, 여행 일수, 취향으로 AI 여행 일정 생성
- 일정의 장소와 경로를 OpenStreetMap 기반 지도에 표시
- 이메일 회원가입 및 로그인, 로그아웃
- Neon 데이터베이스에 계정별 일정 저장, 목록 조회, 불러오기, 삭제
- 비밀번호는 해시해 저장하고 로그인 세션은 보안 쿠키로 관리

## Google API

- Google Gemini API: 여행 일정 생성
- 서버 환경변수 `GEMINI_API_KEY`에 키를 설정합니다. 브라우저에 노출되는 `NEXT_PUBLIC_` 변수로 설정하지 마세요.

## 데이터베이스

- Neon (PostgreSQL): 계정, 로그인 세션, 여행 일정 저장
- 서버 환경변수 `DATABASE_URL`로 연결합니다.
- `users`, `user_sessions`, `trips` 테이블은 첫 API 요청 때 자동으로 생성됩니다.

## 사용 기술

- Next.js 15 App Router, TypeScript, Tailwind CSS 4
- Leaflet, React Leaflet, OpenStreetMap
- Neon Serverless PostgreSQL
- Vercel 배포, GitHub 저장소 연동

## 로컬 실행

1. `.env.example`을 참고해 로컬 `.env.local`을 만들고 `GEMINI_API_KEY`, `DATABASE_URL`을 입력합니다.
2. 의존성을 설치하고 개발 서버를 실행합니다.

```bash
npm install
npm run dev
```

## 실행 주소

- 배포 주소: Vercel 프로젝트 URL을 입력하세요.
- 저장소: https://github.com/honggunwooo/tripmate
