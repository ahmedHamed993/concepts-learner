import type { PromptTemplate, PromptVariable } from "@/lib/types";

export const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function extractVariableKeys(template: string): string[] {
  const keys: string[] = [];
  for (const match of template.matchAll(VARIABLE_PATTERN)) {
    if (!keys.includes(match[1])) keys.push(match[1]);
  }
  return keys;
}

export function renderPrompt(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(VARIABLE_PATTERN, (full, key: string) => {
    const value = values[key];
    return value !== undefined && value.trim() !== "" ? value : full;
  });
}

export function missingRequiredVariables(
  prompt: Pick<PromptTemplate, "variables">,
  values: Record<string, string>,
): PromptVariable[] {
  return prompt.variables.filter(
    (variable) => variable.required && !(values[variable.key] ?? "").trim(),
  );
}

export function buildVariablesFromTemplate(
  template: string,
  existing: PromptVariable[] = [],
): PromptVariable[] {
  const keys = extractVariableKeys(template);
  return keys.map((key) => {
    const found = existing.find((variable) => variable.key === key);
    return (
      found ?? {
        key,
        label: key.replace(/[_-]/g, " "),
        type: "text",
        required: true,
        placeholder: `Value for ${key}`,
      }
    );
  });
}

export function defaultVariableValues(
  variables: PromptVariable[],
): Record<string, string> {
  return Object.fromEntries(
    variables
      .filter((variable) => variable.defaultValue !== undefined)
      .map((variable) => [variable.key, variable.defaultValue as string]),
  );
}
