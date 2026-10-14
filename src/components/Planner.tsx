"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => <div className="map-loading">지도를 불러오고 있어요...</div>,
});

type Place = { name: string; description: string; lat: number; lng: number };
type DayPlan = { day: number; places: Place[] };
type Plan = { title: string; days: DayPlan[] };
type SavedTrip = { id: string; title: string; city: string; days: number; taste: string; plan: Plan; created_at: string };

export default function Planner() {
  const [city, setCity] = useState("");
  const [days, setDays] = useState(2);
  const [taste, setTaste] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [dbMessage, setDbMessage] = useState("");
  const [dbBusy, setDbBusy] = useState(false);
  const supabase = getSupabase();

  async function refreshTrips() {
    if (!supabase) { setDbMessage("Supabase 환경변수를 설정하면 저장한 일정을 볼 수 있어요."); return; }
    const { data, error: queryError } = await supabase.from("trips").select("id,title,city,days,taste,plan,created_at").order("created_at", { ascending: false });
    if (queryError) { setDbMessage(`일정 목록을 불러오지 못했어요: ${queryError.message}`); return; }
    setSavedTrips((data ?? []) as SavedTrip[]);
    setDbMessage("");
  }

  useEffect(() => { void refreshTrips(); }, []);

  async function saveTrip() {
    if (!plan || !supabase) return;
    setDbBusy(true); setDbMessage("");
    const { error: saveError } = await supabase.from("trips").insert({ title: plan.title, city, days, taste, plan });
    if (saveError) setDbMessage(`저장하지 못했어요: ${saveError.message}`);
    else { setDbMessage("일정을 저장했어요."); await refreshTrips(); }
    setDbBusy(false);
  }

  function loadTrip(trip: SavedTrip) {
    setCity(trip.city); setDays(trip.days); setTaste(trip.taste ?? ""); setPlan(trip.plan);
    setActiveDay(trip.plan.days?.[0]?.day ?? 1); setError("");
  }

  async function deleteTrip(id: string) {
    if (!supabase) return;
    setDbBusy(true);
    const { error: deleteError } = await supabase.from("trips").delete().eq("id", id);
    if (deleteError) setDbMessage(`삭제하지 못했어요: ${deleteError.message}`);
    else { setDbMessage("일정을 삭제했어요."); await refreshTrips(); }
    setDbBusy(false);
  }

  async function generate() {
    if (!city.trim()) { setError("여행할 도시를 입력해 주세요."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/recommend", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, days, taste }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error ?? "일정을 만들지 못했어요. 잠시 후 다시 시도해 주세요."); return; }
      setPlan(data); setActiveDay(data.days?.[0]?.day ?? 1);
    } catch { setError("네트워크 오류가 발생했어요. 연결을 확인해 주세요."); }
    finally { setLoading(false); }
  }

  const current = plan?.days.find((d) => d.day === activeDay);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="TripMate 홈"><span className="brand-mark">T</span><span>tripmate</span></a>
        <div className="topbar-center"><span className="status-dot" /> 나만의 여행 플래너</div>
        <div className="topbar-right"><span className="topbar-label">여행을 더 가볍게</span><span className="avatar">여</span></div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-scroll">
            <div className="eyebrow">YOUR NEXT ADVENTURE</div>
            <h1>어디로<br />떠나볼까요?</h1>
            <p className="intro">취향을 알려주시면 AI가 딱 맞는<br />여행 코스를 만들어 드려요.</p>

            <div className="form-card">
              <label className="field-label" htmlFor="city">여행지</label>
              <div className="input-wrap"><span className="field-icon">⌖</span><input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="도시를 입력해 주세요" onKeyDown={(e) => e.key === "Enter" && generate()} /></div>

              <label className="field-label second-label" htmlFor="days">여행 기간</label>
              <div className="select-wrap"><select id="days" value={days} onChange={(e) => setDays(Number(e.target.value))}>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}일 여행</option>)}</select><span>⌄</span></div>

              <label className="field-label second-label" htmlFor="taste">여행 취향 <span className="optional">선택</span></label>
              <div className="input-wrap"><span className="field-icon">✳</span><input id="taste" value={taste} onChange={(e) => setTaste(e.target.value)} placeholder="맛집, 바다, 카페 등" onKeyDown={(e) => e.key === "Enter" && generate()} /></div>
              <div className="taste-hints"><button onClick={() => setTaste("맛집 탐방")}># 맛집</button><button onClick={() => setTaste("자연과 바다")}># 자연</button><button onClick={() => setTaste("감성 카페")}># 카페</button></div>

              <button className="generate-button" onClick={generate} disabled={loading}>{loading ? <><span className="spinner" />일정을 만들고 있어요</> : <>✨ &nbsp;AI 일정 추천받기 <span className="button-arrow">→</span></>}</button>
              {error && <p className="error-message">{error}</p>}
            </div>

            {plan ? <section className="itinerary">
              <div className="section-heading"><div><div className="eyebrow">YOUR ITINERARY</div><h2>{plan.title}</h2></div><button className="save-trip-button" onClick={saveTrip} disabled={!supabase || dbBusy}>{dbBusy ? "저장 중…" : "♡ 일정 저장"}</button></div>
              <div className="day-tabs">{plan.days.map((d) => <button key={d.day} onClick={() => setActiveDay(d.day)} className={activeDay === d.day ? "day-tab active" : "day-tab"}>Day {String(d.day).padStart(2,"0")}</button>)}</div>
              <ol className="place-list">{current?.places.map((p, i) => <li key={`${p.name}-${i}`} className="place-item"><span className="place-number">{String(i + 1).padStart(2,"0")}</span><div className="place-copy"><strong>{p.name}</strong><p>{p.description}</p></div><span className="place-chevron">›</span></li>)}</ol>
              <p className="route-note">지도에서 번호 순서대로 코스를 확인하세요</p>
            </section> : <div className="sidebar-tip"><span className="tip-icon">✦</span><p><strong>작은 팁</strong><br />여행지와 취향을 구체적으로 적을수록 더 알찬 코스를 추천해요.</p></div>}
            <section className="saved-trips">
              <div className="saved-heading"><h2>저장한 일정</h2><button onClick={() => void refreshTrips()} disabled={!supabase || dbBusy} aria-label="일정 목록 새로고침">↻</button></div>
              {dbMessage && <p className="db-message">{dbMessage}</p>}
              {savedTrips.length === 0 ? <p className="saved-empty">저장된 일정이 아직 없어요.</p> : <ul className="saved-list">{savedTrips.map((trip) => <li key={trip.id}><button className="saved-load" onClick={() => loadTrip(trip)}><strong>{trip.title}</strong><span>{trip.city} · {trip.days}일</span></button><button className="saved-delete" onClick={() => void deleteTrip(trip.id)} disabled={dbBusy} aria-label={`${trip.title} 삭제`}>삭제</button></li>)}</ul>}
            </section>
          </div>
          <footer className="sidebar-footer"><span>✦</span> Make your journey yours</footer>
        </aside>

        <section className="map-panel" aria-label="여행 경로 지도">
          <div className="map-topline"><div className="map-caption"><span className="map-pin">⌖</span><span>{city || "여행지를 입력해 주세요"}</span></div><div className="map-legend"><span className="legend-line" /> 추천 이동 경로</div></div>
          <div className="map-frame"><TripMap places={current?.places ?? []} />
            {!plan && <div className="map-empty"><div className="empty-orbit"><span>✦</span></div><h2>여행의 시작을 그려보세요</h2><p>여행지를 입력하면 추천 코스가<br />지도 위에 펼쳐집니다.</p></div>}
          </div>
          <div className="map-footer"><span>© OpenStreetMap contributors</span><span className="map-footer-right">TRIPMATE <i>·</i> YOUR TRAVEL COMPANION</span></div>
        </section>
      </div>
    </main>
  );
}
