import { getAllSettings } from "@/lib/settings";

const ZAPSTER_URL = "https://api.zapsterapi.com/v1";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export async function notifyAdmin(text: string): Promise<{ ok: boolean; error?: string }> {
  const settings = await getAllSettings();
  const token = settings.zapsterToken;
  const instanceId = settings.zapsterInstanceId;
  const phone = settings.zapsterNotifyPhone || settings.whatsapp;

  if (!token || !instanceId || !phone) {
    return { ok: false, error: "Zapster não configurado (token/instância/telefone)" };
  }

  try {
    const res = await fetch(`${ZAPSTER_URL}/wa/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: normalizePhone(phone),
        instance_id: instanceId,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => String(res.status));
      console.error(`[WhatsApp/Zapster] Erro ${res.status}:`, body);
      return { ok: false, error: `Zapster ${res.status}: ${body.substring(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[WhatsApp/Zapster] Erro de rede:", err);
    return { ok: false, error: String(err) };
  }
}
