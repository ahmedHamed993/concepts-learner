import { describe, expect, it } from "vitest";
import {
  buildVariablesFromTemplate,
  defaultVariableValues,
  extractVariableKeys,
  missingRequiredVariables,
  renderPrompt,
} from "@/lib/template";
import type { PromptTemplate } from "@/lib/types";

const prompt = {
  variables: [
    { key: "concept", label: "Concept", type: "text", required: true },
    { key: "code", label: "Code", type: "textarea", required: true },
    { key: "notes", label: "Notes", type: "textarea", required: false },
  ],
} as Pick<PromptTemplate, "variables">;

describe("prompt variables", () => {
  it("extracts each unique variable key in order", () => {
    expect(extractVariableKeys("{{ concept }} and {{code}} and {{ concept }}")).toEqual([
      "concept",
      "code",
    ]);
  });

  it("substitutes values and preserves unresolved placeholders", () => {
    const rendered = renderPrompt("Teach {{concept}} with {{ code }}. {{missing}}", {
      concept: "slices",
      code: "append(a, b)",
    });
    expect(rendered).toBe("Teach slices with append(a, b). {{missing}}");
  });

  it("treats whitespace-only values as missing", () => {
    expect(missingRequiredVariables(prompt, { concept: "slices", code: "   " })).toEqual([
      expect.objectContaining({ key: "code" }),
    ]);
    expect(
      missingRequiredVariables(prompt, { concept: "slices", code: "code", notes: "" }),
    ).toEqual([]);
  });

  it("builds variables from a template while preserving existing metadata", () => {
    const variables = buildVariablesFromTemplate("Explain {{concept}} using {{example}}", [
      { key: "concept", label: "Custom label", type: "text", required: true },
    ]);
    expect(variables).toHaveLength(2);
    expect(variables[0].label).toBe("Custom label");
    expect(variables[1].key).toBe("example");
    expect(variables[1].required).toBe(true);
  });

  it("collects default values only when present", () => {
    expect(
      defaultVariableValues([
        { key: "a", label: "A", type: "text", required: true, defaultValue: "x" },
        { key: "b", label: "B", type: "text", required: true },
      ]),
    ).toEqual({ a: "x" });
  });
});
