"use client";
import { useRouter } from "next/navigation";

export default function EventActions({ eventId }: { eventId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Deletar este evento e todas as inscrições?")) return;
    await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <button type="button" onClick={handleDelete}
      className="bg-red-950/50 hover:bg-red-900/50 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium">
      Excluir
    </button>
  );
}
