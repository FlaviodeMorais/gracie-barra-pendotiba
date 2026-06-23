export const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const DAYS_FULL = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];
export const BELTS = [
  "branca",
  "cinza",
  "amarela",
  "laranja",
  "verde",
  "azul",
  "roxa",
  "marrom",
  "preta",
];
export const MODALITIES = ["Jiu-Jitsu", "Muay Thai", "Defesa Pessoal", "Ginástica Artística"];
export const LEVELS = ["Fundamentos", "Avançado", "Infantil", "Feminino", "Faixa Preta", "Todos"];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function beltColor(belt: string): string {
  const colors: Record<string, string> = {
    branca: "bg-white text-gray-800 border border-gray-300",
    cinza: "bg-gray-400 text-white",
    amarela: "bg-yellow-400 text-gray-800",
    laranja: "bg-orange-500 text-white",
    verde: "bg-green-600 text-white",
    azul: "bg-blue-600 text-white",
    roxa: "bg-purple-700 text-white",
    marrom: "bg-amber-800 text-white",
    preta: "bg-gray-900 text-white",
  };
  return colors[belt] || "bg-gray-200 text-gray-800";
}

export function eventStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    upcoming: { label: "Em breve", color: "bg-blue-100 text-blue-800" },
    open: { label: "Inscrições abertas", color: "bg-green-100 text-green-800" },
    closed: { label: "Inscrições encerradas", color: "bg-red-100 text-red-800" },
    finished: { label: "Encerrado", color: "bg-gray-100 text-gray-800" },
  };
  return map[status] || { label: status, color: "bg-gray-100 text-gray-800" };
}

export function generatePixPayload(
  pixKey: string,
  pixKeyType: string,
  amount: number,
  merchantName: string,
  merchantCity: string,
  txId: string,
  description: string
): string {
  function crc16(str: string): string {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
        else crc <<= 1;
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  function field(id: string, value: string): string {
    return `${id}${value.length.toString().padStart(2, "0")}${value}`;
  }

  function sanitize(str: string): string {
    return str.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\x20-\x7E]/g, "");
  }

  function normalizePhone(key: string): string {
    const digits = key.replace(/\D/g, "");
    if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
    if (digits.length === 11 || digits.length === 10) return `+55${digits}`;
    return key;
  }

  const normalizedKey = (pixKeyType === "phone" || pixKeyType === "celular")
    ? normalizePhone(pixKey)
    : pixKey;

  const guiValue = "BR.GOV.BCB.PIX";
  const keyField = field("01", normalizedKey);
  const sanitizedDesc = description ? sanitize(description).substring(0, 72) : "";
  const descField = sanitizedDesc ? field("02", sanitizedDesc) : "";
  const merchantAccountInfo = field("00", guiValue) + keyField + descField;

  const amountStr = amount.toFixed(2);
  const sanitizedName = sanitize(merchantName).toUpperCase().substring(0, 25);
  const sanitizedCity = sanitize(merchantCity).toUpperCase().substring(0, 15);
  const sanitizedTxId = txId.replace(/[^a-zA-Z0-9]/g, "").substring(0, 25) || "***";

  const addDataField = field("05", sanitizedTxId);
  const additionalData = field("62", addDataField);

  let payload =
    field("00", "01") +
    field("26", merchantAccountInfo) +
    field("52", "0000") +
    field("53", "986") +
    field("54", amountStr) +
    field("58", "BR") +
    field("59", sanitizedName) +
    field("60", sanitizedCity) +
    additionalData +
    "6304";

  payload += crc16(payload);
  return payload;
}
