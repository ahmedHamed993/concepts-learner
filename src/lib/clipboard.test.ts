import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "@/lib/utils";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("copyText", () => {
  it("uses the async clipboard API when it is available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    vi.stubGlobal("window", { isSecureContext: true });

    await expect(copyText("learning prompt")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith("learning prompt");
  });

  it("reports failure when no clipboard path is usable", async () => {
    await expect(copyText("learning prompt")).resolves.toBe(false);
  });
});
