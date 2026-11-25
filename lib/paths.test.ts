import { describe, expect, it } from "vitest";
import { paths, signInPath } from "@/lib/paths";

describe("signInPath", () => {
  it("guarda a página pedida para voltar depois de entrar", () => {
    expect(signInPath("/app/proventos?x=1")).toBe("/entrar?de=%2Fapp%2Fproventos%3Fx%3D1");
  });

  it("sem página, ou já no painel, vai direto para entrar", () => {
    expect(signInPath()).toBe(paths.signIn);
    expect(signInPath(paths.home)).toBe(paths.signIn);
  });
});
