"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Banner = { id: string; imageUrl: string; title?: string | null; description?: string | null; linkUrl?: string | null; order: number; active: boolean };

const emptyForm = { imageUrl: "", title: "", description: "", linkUrl: "", order: 0, active: true };

export default function BannersAdmin() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const res = await fetch("/api/banners");
    setBanners(await res.json());
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) setForm((f) => ({ ...f, imageUrl: data.url }));
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editing ? `/api/banners/${editing}` : "/api/banners";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
    load();
  };

  const handleEdit = (b: Banner) => {
    setForm({ imageUrl: b.imageUrl, title: b.title || "", description: b.description || "", linkUrl: b.linkUrl || "", order: b.order, active: b.active });
    setEditing(b.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar este banner?")) return;
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Banners</h1>
        <button type="button" onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm">
          + Novo Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
          <h2 className="text-white font-bold mb-4">{editing ? "Editar Banner" : "Novo Banner"}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1" htmlFor="banner-file-btn">Imagem *</label>
              <div className="flex gap-3 items-center">
                <input
                  id="banner-file-input"
                  type="file"
                  ref={fileRef}
                  accept="image/*"
                  aria-label="Selecionar imagem do banner"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                <button
                  id="banner-file-btn"
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm border border-gray-700"
                >
                  {uploading ? "Enviando..." : "Selecionar Imagem"}
                </button>
                {form.imageUrl && (
                  <div className="relative w-20 h-12 rounded overflow-hidden">
                    <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
              <input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="Ou cole a URL da imagem"
                aria-label="URL da imagem"
                className="mt-2 w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="banner-title">Título</label>
                <input id="banner-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Título do banner"
                  className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="banner-link">Link (opcional)</label>
                <input id="banner-link" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  placeholder="/eventos/123"
                  className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="banner-desc">Descrição</label>
                <input id="banner-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descrição"
                  className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="banner-order">Ordem</label>
                <input id="banner-order" type="number" value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
                  className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-red-600" />
              <span className="text-sm text-gray-300">Banner ativo (visível no site)</span>
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={handleSave} disabled={!form.imageUrl || saving}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold text-sm">
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2 rounded-lg text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
            <div className="relative h-36">
              <Image src={b.imageUrl} alt={b.title || "Banner"} fill className="object-cover" />
              <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold ${b.active ? "bg-green-900/80 text-green-400" : "bg-gray-800/80 text-gray-400"}`}>
                {b.active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="p-4">
              {b.title && <p className="text-white text-sm font-semibold truncate">{b.title}</p>}
              {b.description && <p className="text-gray-500 text-xs truncate">{b.description}</p>}
              <p className="text-gray-600 text-xs mt-1">Ordem: {b.order}</p>
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={() => handleEdit(b)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium">
                  Editar
                </button>
                <button type="button" onClick={() => handleDelete(b.id)}
                  className="flex-1 bg-red-950/50 hover:bg-red-900/50 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && !showForm && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">🖼️</p>
            <p>Nenhum banner cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
