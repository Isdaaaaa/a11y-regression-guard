import type { AxeImpact, NormalizedNodeViolation } from '@/types/scan';

export type SeverityKey = AxeImpact | 'unknown';

export type SeverityCounts = Record<SeverityKey, number>;

export type RegressionGroup = {
  id: string;
  component: string;
  context: string;
  regressions: NormalizedNodeViolation[];
  severityCounts: SeverityCounts;
};

export type GroupedRegressionReport = {
  totalRegressions: number;
  severityCounts: SeverityCounts;
  groups: RegressionGroup[];
};

const SEVERITY_RANK: Record<SeverityKey, number> = {
  critical: 5,
  serious: 4,
  moderate: 3,
  minor: 2,
  unknown: 1,
};

const KEYWORD_COMPONENT_FALLBACKS: Array<{ matcher: RegExp; component: string }> = [
  { matcher: /(form|input|label|checkbox|radio|select|textbox)/i, component: 'Form fields' },
  { matcher: /(image|img|alt|media|figure|video)/i, component: 'Media content' },
  { matcher: /(contrast|color|text|heading|readable)/i, component: 'Text and contrast' },
  { matcher: /(dialog|modal|popover|drawer)/i, component: 'Modal and overlays' },
  { matcher: /(navigation|menu|navbar|breadcrumb)/i, component: 'Navigation' },
  { matcher: /(keyboard|focus|tabindex)/i, component: 'Keyboard and focus' },
  { matcher: /(aria|role|landmark)/i, component: 'ARIA semantics' },
  { matcher: /(button|cta|link)/i, component: 'Buttons and links' },
  { matcher: /(table|grid|list)/i, component: 'Structured data views' },
];

const CONTEXT_TOKENS = new Set([
  'main',
  'header',
  'footer',
  'nav',
  'aside',
  'section',
  'article',
  'dialog',
  'form',
  'body',
]);

function createEmptySeverityCounts(): SeverityCounts {
  return {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    unknown: 0,
  };
}

function impactToSeverity(impact: AxeImpact | null): SeverityKey {
  return impact ?? 'unknown';
}

function humanizeToken(value: string) {
  return value
    .replace(/[:.#\[\]"'=]/g, ' ')
    .replace(/\b(?:nth-child|nth-of-type|first-child|last-child)\b/gi, ' ')
    .replace(/\d+/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleize(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function extractDataAttribute(target: string) {
  const explicitMatch = target.match(/\[(?:data-component|data-testid)=['"]?([\w-]+)['"]?\]/i);
  if (explicitMatch?.[1]) {
    return titleize(humanizeToken(explicitMatch[1]));
  }

  return null;
}

function extractSelectorTokens(selector: string) {
  const idMatch = selector.match(/#([a-zA-Z][\w-]*)/);
  const classMatches = [...selector.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((match) => match[1]);
  return [idMatch?.[1], ...classMatches].filter((token): token is string => Boolean(token));
}

function deriveContext(target: string) {
  const firstScope = target.split('>').map((part) => part.trim())[0] ?? '';
  const explicitToken = extractSelectorTokens(firstScope)[0] ?? firstScope;
  const normalized = humanizeToken(explicitToken).toLowerCase();

  if (!normalized) {
    return 'Page scope';
  }

  if (CONTEXT_TOKENS.has(normalized)) {
    return titleize(normalized);
  }

  return titleize(normalized);
}

function deriveComponentFromSelector(target: string) {
  const explicit = extractDataAttribute(target);
  if (explicit) {
    return explicit;
  }

  const selectorParts = target
    .split('>')
    .map((part) => part.trim())
    .filter(Boolean);

  const tokens = selectorParts.flatMap((part) => extractSelectorTokens(part));
  const preferredToken = tokens.find((token) =>
    /(form|checkout|cart|search|menu|header|footer|nav|button|input|field|card|table|list|modal|dialog)/i.test(
      token,
    ),
  );

  if (preferredToken) {
    return titleize(humanizeToken(preferredToken));
  }

  if (tokens[0]) {
    return titleize(humanizeToken(tokens[0]));
  }

  return null;
}

function deriveComponentFromMeta(regression: NormalizedNodeViolation) {
  const haystack = `${regression.help} ${regression.ruleId} ${(regression.tags ?? []).join(' ')}`;

  for (const fallback of KEYWORD_COMPONENT_FALLBACKS) {
    if (fallback.matcher.test(haystack)) {
      return fallback.component;
    }
  }

  return 'General UI';
}

function groupSortScore(group: RegressionGroup) {
  const worstSeverity = (Object.keys(group.severityCounts) as SeverityKey[]).reduce<SeverityKey>(
    (worst, key) => {
      if (group.severityCounts[key] > 0 && SEVERITY_RANK[key] > SEVERITY_RANK[worst]) {
        return key;
      }
      return worst;
    },
    'unknown',
  );

  return {
    severity: SEVERITY_RANK[worstSeverity],
    count: group.regressions.length,
  };
}

export function createGroupedRegressionReport(
  regressions: NormalizedNodeViolation[],
): GroupedRegressionReport {
  const severityCounts = createEmptySeverityCounts();

  const groupMap = new Map<string, RegressionGroup>();

  for (const regression of regressions) {
    const severity = impactToSeverity(regression.impact);
    severityCounts[severity] += 1;

    const component = deriveComponentFromSelector(regression.target) ?? deriveComponentFromMeta(regression);
    const context = deriveContext(regression.target);
    const id = `${component.toLowerCase()}::${context.toLowerCase()}`;

    const existing = groupMap.get(id);

    if (!existing) {
      const initialCounts = createEmptySeverityCounts();
      initialCounts[severity] = 1;
      groupMap.set(id, {
        id,
        component,
        context,
        regressions: [regression],
        severityCounts: initialCounts,
      });
      continue;
    }

    existing.regressions.push(regression);
    existing.severityCounts[severity] += 1;
  }

  const groups = [...groupMap.values()]
    .map((group) => ({
      ...group,
      regressions: group.regressions.sort((a, b) => {
        const severityDelta = SEVERITY_RANK[impactToSeverity(b.impact)] - SEVERITY_RANK[impactToSeverity(a.impact)];
        if (severityDelta !== 0) {
          return severityDelta;
        }

        if (a.ruleId !== b.ruleId) {
          return a.ruleId.localeCompare(b.ruleId);
        }

        return a.target.localeCompare(b.target);
      }),
    }))
    .sort((a, b) => {
      const scoreA = groupSortScore(a);
      const scoreB = groupSortScore(b);

      if (scoreB.severity !== scoreA.severity) {
        return scoreB.severity - scoreA.severity;
      }

      if (scoreB.count !== scoreA.count) {
        return scoreB.count - scoreA.count;
      }

      return a.component.localeCompare(b.component);
    });

  return {
    totalRegressions: regressions.length,
    severityCounts,
    groups,
  };
}
