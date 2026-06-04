"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type EventData = {
  id?: string;
  title: string;
  description: string;
  bannerUrl: string;
  date: string;
  endDate: string;
  location: string;
  address: string;
  status: string;
  registrationOpen: boolean;
  price: string;
  pixKey: string;
  pixKeyType: string;
  maxParticipants: string;
};

const empty: EventData = {
  title: "", description: "", bannerUrl: "", date: "", endDate: "",
  location: "", address: "", status: "upcoming", registrationOpen: true,
  price: "0", pixKey: "", pixKeyType: "email", maxParticipants: "",
};

export default function EventForm({ initial }: { initial?: EventData & { id?: string } }) {
  const [form, setForm] = useState<EventData>(initial || empty);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) setForm((f) => ({ ...f, bannerUrl: data.url }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = form.id ? `/api/events/${form.id}` : "/api/events";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Erro ao salvar");
        return;
      }
      router.push("/admin/eventos");
      router.refresh();
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  const f = (k: keyof EventData, v: string | boolean) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-300 mb-1">Título *</label>
          <input required value={form.title} onChange={(e) => f("title", e.target.value)}
            placeholder="Nome do evento"
            className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-300 mb-1">Descrição *</label>
          <textarea required rows={4} value={form.description} onChange={(e) => f("description", e.target.value)}
            placeholder="Descrição completa do evento..."
            className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600 resize-none" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Data do Evento *</label>
          <input required type="datetime-local" value={form.date} onChange={(e) => f("date", e.target.value)}
            className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Data de Término</label>
          <input type="datetime-local" value={form.endDate} onChange={(e) => f("endDate", e.target.value)}
            className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Local *</label>
          <input required value={form.location} onChange={(e) => f("location", e.target.value)}
            placeholder="Nome do local"
            className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Endereço</label>
          <input value={form.address} onChange={(e) => f("address", e.target.value)}
            placeholder="Endereço completo"
            className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Status</label>
          <select value={form.status} onChange={(e) => f("status", e.target.value)}
            className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600">
            <option value="upcoming">Em breve</option>
            <option value="open">Inscrições abertas</option>
            <option value="closed">Inscrições encerradas</option>
            <option value="finished">Encerrado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Vagas Máximas</label>
          <input type="number" value={form.maxParticipants} onChange={(e) => f("maxParticipants", e.target.value)}
            placeholder="Ilimitado se vazio"
            className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Taxa de Inscrição (R$)</label>
          <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => f("price", e.target.value)}
            className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Chave PIX</label>
          <input value={form.pixKey} onChange={(e) => f("pixKey", e.target.value)}
            placeholder="Chave PIX para pagamento"
            className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Tipo da Chave PIX</label>
          <select value={form.pixKeyType} onChange={(e) => f("pixKeyType", e.target.value)}
            className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600">
            <option value="email">Email</option>
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
            <option value="phone">Telefone</option>
            <option value="random">Chave Aleatória</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-300 mb-1">Banner do Evento</label>
          <div className="flex gap-3 items-center flex-wrap">
            <input type="file" ref={fileRef} accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm border border-gray-700">
              {uploading ? "Enviando..." : "Selecionar Imagem"}
            </button>
            {form.bannerUrl && (
              <div className="relative w-24 h-14 rounded overflow-hidden">
                <Image src={form.bannerUrl} alt="Banner" fill className="object-cover" />
              </div>
            )}
          </div>
          <input value={form.bannerUrl} onChange={(e) => f("bannerUrl", e.target.value)}
            placeholder="Ou cole a URL da imagem"
            className="mt-2 w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.registrationOpen}
          onChange={(e) => f("registrationOpen", e.target.checked)}
          className="w-4 h-4 accent-red-600" />
        <span className="text-sm text-gray-300">Inscrições abertas</span>
      </label>

      {error && <div className="bg-red-950/50 border border-red-700 rounded-lg p-3 text-red-400 text-sm">{error}</div>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-8 py-2.5 rounded-lg font-bold">
          {saving ? "Salvando..." : form.id ? "Atualizar Evento" : "Criar Evento"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2.5 rounded-lg">
          Cancelar
        </button>
      </div>
    </form>
  );
}
