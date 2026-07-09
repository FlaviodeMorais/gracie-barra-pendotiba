import { createStaticPix, hasError } from "pix-utils";

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

export function eventStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    upcoming: { label: "Em breve", color: "bg-blue-100 text-blue-800" },
    open: { label: "Inscrições abertas", color: "bg-green-100 text-green-800" },
    closed: { label: "Inscrições encerradas", color: "bg-red-100 text-red-800" },
    finished: { label: "Encerrado", color: "bg-gray-100 text-gray-800" },
  };
  return map[status] || { label: status, color: "bg-gray-100 text-gray-800" };
}

function normalizePixPhoneKey(key: string): string {
  const digits = key.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  return key;
}

/** Gera o payload Pix estático (BR Code/EMV) via `pix-utils`, testado contra a spec do Bacen. */
export function generatePixPayload(
  pixKey: string,
  pixKeyType: string,
  amount: number,
  merchantName: string,
  merchantCity: string,
  txId: string,
  description: string
): string {
  const normalizedKey = pixKeyType === "phone" || pixKeyType === "celular"
    ? normalizePixPhoneKey(pixKey)
    : pixKey;

  const result = createStaticPix({
    merchantName,
    merchantCity,
    pixKey: normalizedKey,
    transactionAmount: amount,
    txid: txId.replace(/[^a-zA-Z0-9]/g, "").substring(0, 25) || undefined,
    infoAdicional: description,
  });

  if (hasError(result)) {
    throw new Error(`Falha ao gerar Pix estático: ${result.message}`);
  }

  return result.toBRCode();
}
