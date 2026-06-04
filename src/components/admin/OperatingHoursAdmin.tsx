"use client";
import { useState } from "react";
import { DAYS_FULL } from "@/lib/utils";

type Hour = { id: string; day: number; open: boolean; openTime: string; closeTime: string };

export default function OperatingHoursAdmin({ hours: initial }: { hours: Hour[] }) {
  const defaultHours = DAYS_FULL.map((_, i) => ({
    id: "", day: i, open: i > 0 && i < 7,
    openTime: i === 0 || i === 6 ? "08:00" : "06:00",
    closeTime: i === 0 || i === 6 ? "12:00" : "22:00",
  }));

  const [hours, setHours] = useState<Hour[]>(
    DAYS_FULL.map((_, i) => initial.find((h) => h.day === i) || defaultHours[i])
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (day: number, key: keyof Hour, value: string | boolean) => {
    setHours((prev) => prev.map((h) => h.day === day ? { ...h, [key]: value } : h));
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/hours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hours),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 max-w-lg">
      <p className="text-gray-400 text-sm mb-6">Configure os horários de funcionamento da academia para cada dia da semana.</p>
      <div className="space-y-3">
        {hours.map((h) => (
          <div key={h.day} className="flex items-center gap-3 flex-wrap">
            <div className="w-32 flex-shrink-0">
              <p className="text-white text-sm font-medium">{DAYS_FULL[h.day]}</p>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={h.open} onChange={(e) => update(h.day, "open", e.target.checked)}
                className="w-4 h-4 accent-red-600" />
              <span className="text-xs text-gray-400">Aberto</span>
            </label>
            {h.open && (
              <>
                <input type="time" aria-label={`Abertura ${DAYS_FULL[h.day]}`} value={h.openTime} onChange={(e) => update(h.day, "openTime", e.target.value)}
                  className="bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-600 w-28" />
                <span className="text-gray-500 text-sm">até</span>
                <input type="time" aria-label={`Fechamento ${DAYS_FULL[h.day]}`} value={h.closeTime} onChange={(e) => update(h.day, "closeTime", e.target.value)}
                  className="bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-600 w-28" />
              </>
            )}
            {!h.open && <span className="text-gray-600 text-sm">Fechado</span>}
          </div>
        ))}
      </div>

      <button type="button" onClick={handleSave} disabled={saving}
        className={`mt-6 px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${
          saved ? "bg-green-600 text-white" : "bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white"
        }`}>
        {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar Horários"}
      </button>
    </div>
  );
}
