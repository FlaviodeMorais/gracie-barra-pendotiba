import { prisma } from "@/lib/prisma";
import BannersAdmin from "@/components/admin/BannersAdmin";

export const revalidate = 0;

export default async function BannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });
  return (
    <BannersAdmin
      initialBanners={banners.map((b) => ({
        ...b,
        title: b.title ?? null,
        description: b.description ?? null,
        linkUrl: b.linkUrl ?? null,
      }))}
    />
  );
}
