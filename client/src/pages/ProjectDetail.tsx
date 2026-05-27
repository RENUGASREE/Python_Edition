import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import Editor from "@monaco-editor/react";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { PageLoader } from "@/components/PageLoader";
import { EmptyState } from "@/components/EmptyState";
import { FolderKanban } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:slug");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["project", params?.slug],
    queryFn: () =>
      apiFetch<{
        project: {
          title: string;
          description: string;
          objectives: string[];
          starterCode: string;
          hints: string[];
        };
      }>(`/projects/${params?.slug}`),
    enabled: !!params?.slug,
    retry: false,
  });
  const p = data?.project;

  if (isLoading) {
    return (
      <Layout>
        <PageLoader label="Loading project..." />
      </Layout>
    );
  }

  if (isError || !p) {
    return (
      <Layout>
        <EmptyState
          icon={FolderKanban}
          title="Project not found"
          description="This project may have been removed or the link is incorrect."
          actionLabel="Back to projects"
          onAction={() => (window.location.href = "/projects")}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <Link href="/projects" className="text-sm text-primary hover:underline">
        ← Projects
      </Link>
      <h1 className="text-3xl font-bold mt-4 mb-2">{p.title}</h1>
      <p className="text-muted-foreground mb-6">{p.description}</p>
      <GlassCard className="p-6 mb-6">
        <h2 className="font-semibold mb-2">Objectives</h2>
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          {p.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </GlassCard>
      <GlassCard className="overflow-hidden mb-6">
        <Editor height="360px" defaultLanguage="python" theme="vs-dark" defaultValue={p.starterCode} />
      </GlassCard>
      <GlassCard className="p-6">
        <h2 className="font-semibold mb-2">Hints</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          {p.hints.map((h) => (
            <li key={h}>• {h}</li>
          ))}
        </ul>
      </GlassCard>
    </Layout>
  );
}
