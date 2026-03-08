import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/api-utils";

export async function GET() {
  const photos = await prisma.galleryPhoto.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return jsonResponse({ photos });
}
