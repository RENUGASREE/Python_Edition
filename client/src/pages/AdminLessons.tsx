import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Lesson } from "@/types";

export default function AdminLessons() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [draft, setDraft] = useState<Partial<Lesson> & { isPublished?: boolean }>({});

  const { data } = useQuery({
    queryKey: ["admin-lessons"],
    queryFn: () => apiFetch<{ lessons: Lesson[] }>("/lessons?published=false"),
  });

  const save = useMutation({
    mutationFn: () =>
      apiFetch(`/lessons/${selected?.slug}`, {
        method: "PUT",
        body: JSON.stringify(draft),
      }),
    onSuccess: () => {
      toast({ title: "Lesson saved" });
      qc.invalidateQueries({ queryKey: ["admin-lessons"] });
    },
  });

  const create = useMutation({
    mutationFn: () =>
      apiFetch("/lessons", {
        method: "POST",
        body: JSON.stringify({
          ...draft,
          slug: draft.slug || draft.title?.toLowerCase().replace(/\s+/g, "-"),
          isPublished: draft.isPublished ?? false,
        }),
      }),
    onSuccess: () => {
      toast({ title: "Lesson created" });
      qc.invalidateQueries({ queryKey: ["admin-lessons"] });
    },
  });

  const pick = (lesson: Lesson) => {
    setSelected(lesson);
    setDraft(lesson);
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Lesson editor</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="p-4 max-h-[600px] overflow-y-auto">
          <p className="text-sm font-medium mb-2">All lessons</p>
          {(data?.lessons || []).map((l) => (
            <button
              key={l.slug}
              type="button"
              onClick={() => pick(l)}
              className={`w-full text-left p-2 rounded-lg text-sm mb-1 ${
                selected?.slug === l.slug ? "bg-primary/15" : "hover:bg-muted"
              }`}
            >
              {l.title}
            </button>
          ))}
        </GlassCard>

        <GlassCard className="lg:col-span-2 p-6 space-y-4">
          <h2 className="font-semibold">{selected ? `Edit: ${selected.title}` : "New lesson"}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={draft.slug || ""} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={draft.category || ""} onChange={(e) => setDraft({ ...draft, category: e.target.value as Lesson["category"] })} />
            </div>
            <div>
              <Label>Difficulty</Label>
              <Input value={draft.difficulty || ""} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Theory (markdown)</Label>
            <Textarea rows={6} value={draft.theory || ""} onChange={(e) => setDraft({ ...draft, theory: e.target.value })} />
          </div>
          <div>
            <Label>Summary</Label>
            <Textarea rows={3} value={draft.summary || ""} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={!!(draft as { isPublished?: boolean }).isPublished}
              onCheckedChange={(v) => setDraft({ ...draft, isPublished: v } as Partial<Lesson>)}
            />
            <Label>Published</Label>
          </div>
          <div className="flex gap-2">
            {selected ? (
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                Save changes
              </Button>
            ) : (
              <Button onClick={() => create.mutate()} disabled={create.isPending}>
                Create lesson
              </Button>
            )}
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
