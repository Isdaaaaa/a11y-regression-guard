import type { AxeImpact, AxeViolation, NormalizedNodeViolation, ViolationDiff } from '@/types/scan';

const IMPACT_RANK: Record<AxeImpact, number> = {
  critical: 4,
  serious: 3,
  moderate: 2,
  minor: 1,
};

function normalizeTarget(target: string[] = []) {
  return target
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' > ')
    .replace(/\s+/g, ' ');
}

function impactWeight(impact: AxeImpact | null) {
  return impact ? IMPACT_RANK[impact] : 0;
}

function stableKey(ruleId: string, target: string) {
  return `${ruleId}::${target.toLowerCase()}`;
}

export function normalizeViolations(violations: AxeViolation[]): NormalizedNodeViolation[] {
  const deduped = new Map<string, NormalizedNodeViolation>();

  for (const violation of violations) {
    for (const node of violation.nodes) {
      const target = normalizeTarget(node.target);
      if (!target) {
        continue;
      }

      const key = stableKey(violation.id, target);
      const entry: NormalizedNodeViolation = {
        key,
        ruleId: violation.id,
        impact: violation.impact,
        help: violation.help,
        helpUrl: violation.helpUrl,
        description: violation.description,
        target,
        failureSummary: node.failureSummary,
        tags: violation.tags,
      };

      const existing = deduped.get(key);
      if (!existing || impactWeight(entry.impact) >= impactWeight(existing.impact)) {
        deduped.set(key, entry);
      }
    }
  }

  return [...deduped.values()].sort((a, b) => {
    const rankDelta = impactWeight(b.impact) - impactWeight(a.impact);
    if (rankDelta !== 0) {
      return rankDelta;
    }
    if (a.ruleId !== b.ruleId) {
      return a.ruleId.localeCompare(b.ruleId);
    }
    return a.target.localeCompare(b.target);
  });
}

export function diffViolations(baseline: AxeViolation[], candidate: AxeViolation[]): ViolationDiff {
  const baselineNodes = normalizeViolations(baseline);
  const candidateNodes = normalizeViolations(candidate);

  const baselineKeys = new Set(baselineNodes.map((item) => item.key));
  const candidateKeys = new Set(candidateNodes.map((item) => item.key));

  const regressions = candidateNodes.filter((item) => !baselineKeys.has(item.key));

  let resolvedCount = 0;
  for (const key of baselineKeys) {
    if (!candidateKeys.has(key)) {
      resolvedCount += 1;
    }
  }

  return {
    regressions,
    totalBaselineNodes: baselineNodes.length,
    totalCandidateNodes: candidateNodes.length,
    resolvedCount,
  };
}
