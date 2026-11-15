import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("junta as classes com espaço", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignora false, null, undefined e string vazia", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("devolve string vazia sem classes", () => {
    expect(cn()).toBe("");
  });
});
