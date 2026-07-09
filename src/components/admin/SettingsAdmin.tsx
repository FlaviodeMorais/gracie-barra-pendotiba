"use client";
import { useState } from "react";

type Settings = Record<string, string>;

type Field = { key: string; label: string; placeholder: string; sensitive?: boolean; hint?: string };

const fields: { section: string; items: Field[] }[] = [
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
  { section: "Pagamento PIX (Mercado Pago)", items: [
    { key: "mpAccessToken", label: "Access Token do Mercado Pago", placeholder: "APP_USR-...", sensitive: true,
      hint: "Gerado em mercadopago.com.br/developers no painel da sua aplicação, em Credenciais de produção. Necessário para gerar QR Codes PIX e confirmar pagamentos automaticamente." },
  ]},
  { section: "Aviso ao Admin via WhatsApp (Zapster)", items: [
    { key: "zapsterToken", label: "Token Zapster", placeholder: "Bearer token da sua conta Zapster", sensitive: true,
      hint: "Painel Zapster → sua conta → API Token." },
    { key: "zapsterInstanceId", label: "Instance ID", placeholder: "ID da instância criada para o app da GB",
      hint: "Crie uma instância nova no painel Zapster e escaneie o QR Code com o WhatsApp que vai receber os avisos." },
    { key: "zapsterNotifyPhone", label: "Número que recebe o aviso", placeholder: "5521974697908",
      hint: "Se vazio, usa o número de WhatsApp cadastrado em Contato." },
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
                  type={field.sensitive ? "password" : "text"}
                  value={settings[field.key] || ""}
                  onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  autoComplete="off"
                  className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                />
                {field.hint && <p className="mt-1 text-xs text-gray-500">{field.hint}</p>}
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
