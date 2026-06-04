import { getSession } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    return <>{children}</>;
  }
  return <AdminLayout>{children}</AdminLayout>;
}
