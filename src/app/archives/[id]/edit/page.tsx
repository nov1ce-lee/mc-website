import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Navbar from "@/components/layout/Navbar";
import ArchiveForm from "@/components/archive/ArchiveForm";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseCoordinates, parseStringArray } from "@/lib/archive";

interface EditArchivePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditArchivePage({ params }: EditArchivePageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const archive = await prisma.archive.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      coordinates: true,
      dimension: true,
      category: true,
      tags: true,
      images: true,
      authorId: true,
    },
  });

  if (!archive) {
    notFound();
  }

  const canEdit =
    archive.authorId === session.user.id ||
    session.user.role === "ADMIN" ||
    session.user.role === "OWNER";

  if (!canEdit) {
    redirect(`/archives/${id}`);
  }

  const { x, y, z } = parseCoordinates(archive.coordinates);
  const tags = parseStringArray(archive.tags).join(", ");
  const images = parseStringArray(archive.images);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <ArchiveForm
        mode="edit"
        archiveId={archive.id}
        initialValues={{
          title: archive.title,
          description: archive.description,
          x,
          y,
          z,
          dimension: archive.dimension,
          category: archive.category,
          tags,
          imageUrl: images[0] || "",
        }}
      />
    </main>
  );
}
