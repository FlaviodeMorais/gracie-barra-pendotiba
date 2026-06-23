export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-gray-800 rounded-lg" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-900 rounded-xl border border-gray-800" />
        ))}
      </div>
    </div>
  );
}
