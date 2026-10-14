"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => <div className="map-loading">지도를 불러오고 있어요...</div>,
});

type Place = { name: string; description: string; lat: number; lng: number };
type DayPlan = { day: number; places: Place[] };
type Plan = { title: string; days: DayPlan[] };

export default function Planner() {
  const [city, setCity] = useState("");
  const [days, setDays] = useState(2);
  const [taste, setTaste] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!city.trim()) { setError("여행지를 입력해 주세요."); return; }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, days, taste }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data?.error ?? "일정을 만들지 못했어요. 잠시 후 다시 시도해 주세요."); return; }
      setPlan(data);
      setActiveDay(data.days?.[0]?.day ?? 1);
    } catch {
      setError("네트워크 오류가 발생했어요. 연결을 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  const current = plan?.days.find((day) => day.day === activeDay);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="TripMate 홈"><span className="brand-mark">T</span><span>tripmate</span></a>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-scroll">
            <div className="eyebrow">YOUR NEXT ADVENTURE</div>
            <h1>어디로<br />떠나볼까요?</h1>
            <p className="intro">취향을 알려주시면 AI가 딱 맞는<br />여행 코스를 만들어 드려요.</p>

            <div className="form-card">
              <label className="field-label" htmlFor="city">여행지</label>
              <div className="input-wrap"><span className="field-icon">⌖</span><input id="city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="도시를 입력해 주세요" onKeyDown={(event) => event.key === "Enter" && void generate()} /></div>
              <label className="field-label second-label" htmlFor="days">여행 기간</label>
              <div className="select-wrap"><select id="days" value={days} onChange={(event) => setDays(Number(event.target.value))}>{[1, 2, 3, 4, 5].map((count) => <option key={count} value={count}>{count}일 여행</option>)}</select><span>⌄</span></div>
              <label className="field-label second-label" htmlFor="taste">여행 취향 <span className="optional">선택</span></label>
              <div className="input-wrap"><span className="field-icon">✳</span><input id="taste" value={taste} onChange={(event) => setTaste(event.target.value)} placeholder="맛집, 바다, 카페 등" onKeyDown={(event) => event.key === "Enter" && void generate()} /></div>
              <div className="taste-hints"><button onClick={() => setTaste("맛집 탐방")}># 맛집</button><button onClick={() => setTaste("자연과 바다")}># 자연</button><button onClick={() => setTaste("감성 카페")}># 카페</button></div>
              <button className="generate-button" onClick={() => void generate()} disabled={loading}>{loading ? <><span className="spinner" />일정을 만들고 있어요...</> : <>✦&nbsp; AI 일정 추천받기 <span className="button-arrow">→</span></>}</button>
              {error && <p className="error-message" role="alert">{error}</p>}
            </div>

            {plan ? <section className="itinerary">
              <div className="section-heading"><div><div className="eyebrow">YOUR ITINERARY</div><h2>{plan.title}</h2></div></div>
              <div className="day-tabs">{plan.days.map((day) => <button key={day.day} onClick={() => setActiveDay(day.day)} className={activeDay === day.day ? "day-tab active" : "day-tab"}>Day {String(day.day).padStart(2, "0")}</button>)}</div>
              <ol className="place-list">{current?.places.map((place, index) => <li key={`${place.name}-${index}`} className="place-item"><span className="place-number">{String(index + 1).padStart(2, "0")}</span><div className="place-copy"><strong>{place.name}</strong><p>{place.description}</p></div><span className="place-chevron">›</span></li>)}</ol>
              <p className="route-note">지도에서 번호 순서대로 여행 코스를 확인하세요.</p>
            </section> : <div className="sidebar-tip"><span className="tip-icon">✦</span><p><strong>작은 팁</strong><br />여행지와 취향을 구체적으로 입력할수록 더 알찬 코스를 추천해요.</p></div>}
          </div>
          <footer className="sidebar-footer"><span>✦</span> Make your journey yours</footer>
        </aside>

        <section className="map-panel" aria-label="여행 경로 지도">
          <div className="map-topline"><div className="map-caption"><span className="map-pin">⌖</span><span>{city || "여행지를 입력해 주세요"}</span></div><div className="map-legend"><span className="legend-line" /> 추천 이동 경로</div></div>
          <div className="map-frame"><TripMap places={current?.places ?? []} /></div>
          <div className="map-footer"><span>© OpenStreetMap contributors</span><span className="map-footer-right">TRIPMATE <i>·</i> YOUR TRAVEL COMPANION</span></div>
        </section>
      </div>
    </main>
  );
}
