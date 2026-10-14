# TripMate

AI가 여행 일정 초안을 추천하고, 장소 순서와 이동 경로를 지도에 보여주는 웹서비스입니다.

## 주요 기능

- 도시, 여행 일수, 취향을 입력해 AI 여행 일정 생성
- 장소 순서와 경로를 OpenStreetMap 기반 지도에 표시

## Google API

- Google Gemini API: 여행 일정 생성
- 서버 환경변수 `GEMINI_API_KEY`에 키를 설정합니다. `NEXT_PUBLIC_` 접두사는 사용하지 않습니다.

## 데이터 저장 방식

- 계정과 여행 일정 저장 기능은 제공하지 않습니다.

## 사용 기술

- Next.js 15 App Router, TypeScript, Tailwind CSS 4
- Leaflet, React Leaflet, OpenStreetMap
- Vercel 배포, GitHub 저장소 연동

## 로컬 실행

1. `.env.example`을 참고해 `.env.local`에 `GEMINI_API_KEY`를 설정합니다.
2. 의존성을 설치하고 개발 서버를 실행합니다.

```bash
npm install
npm run dev
```

## 실행 주소

- 배포 주소: Vercel 프로젝트 URL을 입력하세요.
- 저장소: https://github.com/honggunwooo/tripmate
