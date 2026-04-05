"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { 
  Brain, 
  Search, 
  Trash2, 
  Tag, 
  Clock, 
  Lightbulb,
  AlertCircle,
  Code,
  BookOpen,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, React.ReactNode> = {
  solution: <Lightbulb className="size-4" />,
  error: <AlertCircle className="size-4" />,
  pattern: <Code className="size-4" />,
  knowledge: <BookOpen className="size-4" />,
  general: <FileText className="size-4" />,
};

const categoryColors: Record<string, string> = {
  solution: "text-terminal-green",
  error: "text-terminal-red",
  pattern: "text-terminal-cyan",
  knowledge: "text-terminal-yellow",
  general: "text-muted-foreground",
};

export function MemoryBrowser() {
  const { memories, deleteMemory, clearMemories } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredMemories = memories.filter((mem) => {
    const matchesSearch = 
      searchQuery === "" ||
      mem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === null || mem.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ["solution", "error", "pattern", "knowledge", "general"];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Brain className="size-5 text-terminal-cyan" />
          <h1 className="font-semibold text-foreground">Memory Bank</h1>
          <span className="text-xs text-muted-foreground">
            ({memories.length} entries)
          </span>
        </div>
        {memories.length > 0 && (
          <button
            onClick={clearMemories}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-terminal-red/10 hover:bg-terminal-red/20 text-terminal-red transition-colors min-h-[44px]"
          >
            <Trash2 className="size-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="px-4 py-3 border-b border-border space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[36px]",
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize min-h-[36px]",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {categoryIcons[cat]}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Memories List */}
      <div className="flex-1 overflow-y-auto p-4">
        {memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <Brain className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">No Memories Yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              As SI Agent learns from your interactions, important information will be stored here for future reference.
            </p>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Search className="size-8 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No memories match your search criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMemories.map((mem) => (
              <div
                key={mem.id}
                className="rounded-lg border border-border bg-card p-4 group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className={cn("flex items-center gap-2", categoryColors[mem.category])}>
                    {categoryIcons[mem.category]}
                    <span className="text-xs font-medium capitalize">{mem.category}</span>
                  </div>
                  <button
                    onClick={() => deleteMemory(mem.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-terminal-red/10 text-muted-foreground hover:text-terminal-red transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">
                  {mem.content}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {mem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                    >
                      <Tag className="size-2.5" />
                      {tag}
                    </span>
                  ))}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                    <Clock className="size-3" />
                    {new Date(mem.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
