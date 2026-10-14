"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => (
    <p className="p-4 text-sm text-gray-500">지도 불러오는 중...</p>
  ),
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
    if (!city.trim()) {
      setError("도시를 입력해 주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, days, taste }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "일정 생성에 실패했어요.");
        return;
      }
      setPlan(data);
      setActiveDay(data.days?.[0]?.day ?? 1);
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  const current = plan?.days.find((d) => d.day === activeDay);

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <aside className="w-full overflow-y-auto border-b p-4 md:w-96 md:border-b-0 md:border-r">
        <h1 className="text-2xl font-bold">TripMate</h1>
        <p className="mt-1 text-sm text-gray-600">
          AI가 추천하는 나만의 여행 일정
        </p>

        <div className="mt-4 space-y-2">
          <input
            className="w-full rounded border px-2 py-1"
            placeholder="도시 (예: 부산)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              className="rounded border px-2 py-1"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}일
                </option>
              ))}
            </select>
            <input
              className="w-full rounded border px-2 py-1"
              placeholder="취향 (예: 먹방, 바다, 카페)"
              value={taste}
              onChange={(e) => setTaste(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
            />
          </div>
          <button
            className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
            onClick={generate}
            disabled={loading}
          >
            {loading ? "일정 만드는 중..." : "일정 추천받기"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {plan && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold">{plan.title}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {plan.days.map((d) => (
                <button
                  key={d.day}
                  onClick={() => setActiveDay(d.day)}
                  className={`rounded border px-3 py-1 text-sm ${
                    activeDay === d.day ? "bg-black text-white" : ""
                  }`}
                >
                  Day {d.day}
                </button>
              ))}
            </div>
            <ol className="mt-3 space-y-2">
              {current?.places.map((p, i) => (
                <li key={`${p.name}-${i}`} className="rounded border p-2">
                  <p className="font-semibold">
                    {i + 1}. {p.name}
                  </p>
                  <p className="text-xs text-gray-600">{p.description}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </aside>

      <div className="min-h-[300px] flex-1">
        <TripMap places={current?.places ?? []} />
      </div>
    </div>
  );
}
