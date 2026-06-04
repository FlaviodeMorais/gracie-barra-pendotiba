"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DAYS_FULL, MODALITIES, LEVELS } from "@/lib/utils";

type Schedule = { id: string; day: number; startTime: string; endTime: string; modality: string; level: string; instructor?: string | null; active: boolean };

const emptyForm = { day: "1", startTime: "06:00", endTime: "07:00", modality: "Jiu-Jitsu", level: "Fundamentos", instructor: "", active: true };

export default function ScheduleAdmin({ schedules: initial }: { schedules: Schedule[] }) {
  const [schedules, setSchedules] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const load = async () => {
    const res = await fetch("/api/schedule?all=true");
    const data = await res.json();
    setSchedules(data);
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editing ? `/api/schedule/${editing}` : "/api/schedule";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
    await load();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este horário?")) return;
    await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    await load();
  };

  const handleEdit = (s: Schedule) => {
    setForm({ day: String(s.day), startTime: s.startTime, endTime: s.endTime, modality: s.modality, level: s.level, instructor: s.instructor || "", active: s.active });
    setEditing(s.id);
    setShowForm(true);
  };

  const byDay: Record<number, Schedule[]> = {};
  schedules.forEach((s) => { if (!byDay[s.day]) byDay[s.day] = []; byDay[s.day].push(s); });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-400 text-sm">{schedules.length} aulas cadastradas</p>
        <button type="button" onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm">
          + Adicionar Aula
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
          <h2 className="text-white font-bold mb-4">{editing ? "Editar Aula" : "Nova Aula"}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Dia</label>
              <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}
                className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600">
                {DAYS_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Início</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Fim</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Modalidade</label>
              <select value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value })}
                className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600">
                {MODALITIES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nível</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600">
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Instrutor</label>
              <input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                placeholder="Nome do instrutor"
                className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={handleSave} disabled={saving}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold text-sm">
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {([1, 2, 3, 4, 5, 6, 0] as number[]).map((day) => {
          const ds = byDay[day];
          if (!ds?.length) return null;
          return (
            <div key={day} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
              <div className="bg-gray-800 px-6 py-3 font-bold text-white text-sm">{DAYS_FULL[day]}</div>
              <div className="divide-y divide-gray-800">
                {ds.map((s) => (
                  <div key={s.id} className="px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-white font-mono text-sm">{s.startTime}–{s.endTime}</span>
                      <span className="text-red-400 text-sm font-semibold">{s.modality}</span>
                      <span className="text-gray-400 text-sm">{s.level}</span>
                      {s.instructor && <span className="text-gray-600 text-xs">{s.instructor}</span>}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleEdit(s)} className="text-xs text-blue-400 hover:text-blue-300">Editar</button>
                      <button type="button" onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:text-red-400">Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {schedules.length === 0 && <p className="text-center text-gray-500 py-8">Nenhum horário cadastrado</p>}
      </div>
    </div>
  );
}
