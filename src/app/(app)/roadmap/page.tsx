import { ConceptRoadmap } from "@/components/concept-roadmap";

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <ConceptRoadmap key={q ?? ""} initialQuery={q ?? ""} />;
}
