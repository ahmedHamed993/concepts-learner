import { redirect } from "next/navigation";

export default async function ConceptsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  redirect(q ? `/roadmap?q=${encodeURIComponent(q)}` : "/roadmap");
}
