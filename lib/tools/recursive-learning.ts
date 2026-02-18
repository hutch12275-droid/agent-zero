import type { SILearningEntry, MemoryEntry } from "@/lib/agent/types";

/**
 * Recursive Self-Improvement (SI) Learning Engine
 *
 * The SI system works by:
 * 1. Observation: After each task, evaluate success/failure
 * 2. Pattern Storage: Successful solution chains stored in memory
 * 3. Retrieval: Before new tasks, query memory for similar patterns
 * 4. Adaptation: Retrieved patterns inform current approach
 * 5. Refinement: Failed approaches are deprioritized
 */

export function evaluateOutcome(
  taskDescription: string,
  toolsUsed: string[],
  result: string,
  userFeedback?: "positive" | "negative" | "neutral"
): SILearningEntry {
  let outcome: "success" | "failure" | "partial" = "partial";

  if (userFeedback === "positive") {
    outcome = "success";
  } else if (userFeedback === "negative") {
    outcome = "failure";
  } else {
    // Heuristic evaluation
    const hasError =
      result.toLowerCase().includes("error") ||
      result.toLowerCase().includes("failed");
    const hasOutput = result.length > 50;

    if (hasError && !hasOutput) outcome = "failure";
    else if (!hasError && hasOutput) outcome = "success";
  }

  const insight = generateInsight(taskDescription, toolsUsed, outcome);

  return {
    id: "",
    taskType: categorizeTask(taskDescription),
    approach: `Used tools: ${toolsUsed.join(" -> ")}`,
    outcome,
    toolChain: toolsUsed,
    insight,
    timestamp: Date.now(),
  };
}

function categorizeTask(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes("code") || desc.includes("function") || desc.includes("implement"))
    return "coding";
  if (desc.includes("search") || desc.includes("find") || desc.includes("research"))
    return "research";
  if (desc.includes("crypto") || desc.includes("bitcoin") || desc.includes("price"))
    return "crypto-analysis";
  if (desc.includes("fix") || desc.includes("bug") || desc.includes("error"))
    return "debugging";
  if (desc.includes("build") || desc.includes("create") || desc.includes("app"))
    return "app-building";
  return "general";
}

function generateInsight(
  task: string,
  tools: string[],
  outcome: "success" | "failure" | "partial"
): string {
  if (outcome === "success") {
    return `Successfully completed "${task.slice(0, 80)}" using tool chain: ${tools.join(" -> ")}. This pattern works well for similar tasks.`;
  }
  if (outcome === "failure") {
    return `Failed approach for "${task.slice(0, 80)}" using: ${tools.join(" -> ")}. Consider alternative tools or different ordering.`;
  }
  return `Partially completed "${task.slice(0, 80)}" using: ${tools.join(" -> ")}. May need additional steps or refinement.`;
}

export function findRelevantPatterns(
  taskDescription: string,
  learningEntries: SILearningEntry[],
  memories: MemoryEntry[]
): string[] {
  const taskType = categorizeTask(taskDescription);
  const insights: string[] = [];

  // Find matching learning entries
  const matching = learningEntries
    .filter((e) => e.taskType === taskType && e.outcome === "success")
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);

  for (const entry of matching) {
    insights.push(entry.insight);
  }

  // Find matching memories tagged as solutions or patterns
  const query = taskDescription.toLowerCase();
  const relevantMemories = memories
    .filter(
      (m) =>
        (m.category === "solution" || m.category === "pattern") &&
        (m.content.toLowerCase().includes(query.split(" ")[0]) ||
          m.tags.some((t) => query.includes(t.toLowerCase())))
    )
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3);

  for (const mem of relevantMemories) {
    insights.push(`[Memory] ${mem.content}`);
  }

  // Find and deprioritize failed patterns
  const failures = learningEntries
    .filter((e) => e.taskType === taskType && e.outcome === "failure")
    .slice(0, 2);

  for (const f of failures) {
    insights.push(`[AVOID] ${f.insight}`);
  }

  return insights;
}

export function getSuccessRate(entries: SILearningEntry[]): {
  total: number;
  success: number;
  failure: number;
  partial: number;
  rate: number;
} {
  const total = entries.length;
  const success = entries.filter((e) => e.outcome === "success").length;
  const failure = entries.filter((e) => e.outcome === "failure").length;
  const partial = entries.filter((e) => e.outcome === "partial").length;

  return {
    total,
    success,
    failure,
    partial,
    rate: total > 0 ? (success / total) * 100 : 0,
  };
}
