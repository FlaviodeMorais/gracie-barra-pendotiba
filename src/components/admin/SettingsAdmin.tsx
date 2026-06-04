"use client";
import { useState } from "react";

type Settings = Record<string, string>;

const fields = [
  { section: "Contato", items: [
    { key: "phone", label: "Telefone", placeholder: "(21) 97469-7908" },
    { key: "email", label: "Email", placeholder: "gb.pendotiba@gmail.com" },
    { key: "whatsapp", label: "WhatsApp (somente números)", placeholder: "5521974697908" },
    { key: "address", label: "Endereço", placeholder: "Estr. Caetano Monteiro, 2912 - Pendotiba, Niterói - RJ" },
  ]},
  { section: "Redes Sociais", items: [
    { key: "instagram", label: "Instagram (URL)", placeholder: "https://www.instagram.com/gbpendotiba/" },
  ]},
  { section: "Equipe", items: [
    { key: "headCoach", label: "Head Coach", placeholder: "Mestre André Amaral" },
    { key: "headCoachBelt", label: "Graduação do Head Coach", placeholder: "Faixa Preta 2º Grau" },
  ]},
  { section: "Pagamento PIX (padrão para eventos)", items: [
    { key: "pixKey", label: "Chave PIX", placeholder: "gb.pendotiba@gmail.com" },
    { key: "pixKeyType", label: "Tipo da Chave (email, cpf, cnpj, phone, random)", placeholder: "email" },
    { key: "pixName", label: "Nome do Beneficiário", placeholder: "Gracie Barra Pendotiba" },
    { key: "pixCity", label: "Cidade do Beneficiário", placeholder: "Niteroi" },
  ]},
  { section: "Hero/Banner Principal", items: [
    { key: "heroTitle", label: "Título Principal", placeholder: "Gracie Barra Pendotiba" },
    { key: "heroSubtitle", label: "Subtítulo", placeholder: "Jiu-Jitsu & Defesa Pessoal" },
  ]},
];

export default function SettingsAdmin({ settings: initial }: { settings: Settings }) {
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {fields.map((section) => (
        <div key={section.section} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-white font-bold mb-4">{section.section}</h2>
          <div className="space-y-3">
            {section.items.map((field) => (
              <div key={field.key}>
                <label className="block text-xs text-gray-400 mb-1">{field.label}</label>
                <input
                  value={settings[field.key] || ""}
                  onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${
          saved ? "bg-green-600 text-white" : "bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white"
        }`}
      >
        {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar Configurações"}
      </button>
    </div>
  );
}
