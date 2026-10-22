import type {
  Difficulty,
  Note,
  PromptCategory,
  PromptTemplate,
  Topic,
} from "@/lib/types";

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFKD");
}

function tokenize(query: string): string[] {
  return normalize(query)
    .split(/[^a-z0-9'+#-]+/i)
    .map((token) => token.trim())
    .filter(Boolean);
}

function matchesAll(haystack: string, tokens: string[]): boolean {
  const text = normalize(haystack);
  return tokens.every((token) => text.includes(token));
}

export function searchTopics(
  query: string,
  topics: Topic[],
): Topic[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return topics;

  return topics
    .map((topic) => {
      const title = normalize(topic.title);
      const keywords = normalize(topic.keywords.join(" "));
      const aliases = normalize(topic.aliases.join(" "));
      const body = normalize(
        [topic.definition, topic.summary, topic.content.what, topic.content.why].join(
          " ",
        ),
      );
      let score = 0;
      for (const token of tokens) {
        if (title.includes(token)) score += 8;
        if (aliases.includes(token)) score += 5;
        if (keywords.includes(token)) score += 4;
        if (body.includes(token)) score += 1;
      }
      return { topic, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ topic }) => topic);
}

export function filterTopics(
  topics: Topic[],
  options: { query?: string; phaseId?: string; difficulty?: Difficulty | "all" },
): Topic[] {
  const searched = searchTopics(options.query ?? "", topics);
  return searched.filter((topic) => {
    const phaseMatch =
      !options.phaseId || options.phaseId === "all" || topic.phaseId === options.phaseId;
    const difficultyMatch =
      !options.difficulty ||
      options.difficulty === "all" ||
      topic.difficulty === options.difficulty;
    return phaseMatch && difficultyMatch;
  });
}

export function searchPrompts(
  prompts: PromptTemplate[],
  query: string,
): PromptTemplate[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return prompts;

  return prompts
    .map((prompt) => {
      const title = normalize(prompt.title);
      const keywords = normalize(prompt.keywords.join(" "));
      const category = normalize(prompt.category);
      const description = normalize(prompt.description);
      const template = normalize(prompt.template);
      let score = 0;
      for (const token of tokens) {
        if (title.includes(token)) score += 6;
        if (keywords.includes(token)) score += 4;
        if (category.includes(token)) score += 3;
        if (description.includes(token)) score += 2;
        if (template.includes(token)) score += 1;
      }
      return { prompt, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ prompt }) => prompt);
}

export function filterPrompts(
  prompts: PromptTemplate[],
  options: {
    query?: string;
    category?: PromptCategory | "all";
    difficulty?: Difficulty | "all";
    favoritesOnly?: boolean;
    favoriteIds?: string[];
  },
): PromptTemplate[] {
  const searched = searchPrompts(prompts, options.query ?? "");
  return searched.filter((prompt) => {
    if (options.category && options.category !== "all" && prompt.category !== options.category) {
      return false;
    }
    if (
      options.difficulty &&
      options.difficulty !== "all" &&
      prompt.difficulty !== options.difficulty
    ) {
      return false;
    }
    if (options.favoritesOnly && !(options.favoriteIds ?? []).includes(prompt.id)) {
      return false;
    }
    return true;
  });
}

export function searchNotes(notes: Note[], query: string): Note[] {
  const tokens = tokenize(query);
  return notes
    .filter((note) =>
      tokens.length === 0 || matchesAll(`${note.title} ${note.content}`, tokens),
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}
