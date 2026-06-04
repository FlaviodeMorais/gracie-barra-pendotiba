import EventForm from "@/components/admin/EventForm";

export default function NovoEventoPage() {
  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Novo Evento</h1>
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <EventForm />
      </div>
    </div>
  );
}
