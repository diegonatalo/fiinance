export type Allocation = {
  paperPct: number;
  brickPct: number;
};

export function currentAllocation(paper: number, brick: number): Allocation {
  const total = paper + brick;
  return {
    paperPct: total > 0 ? (paper / total) * 100 : 0,
    brickPct: total > 0 ? (brick / total) * 100 : 0,
  };
}

export type Suggestion = {
  variantClass: "papel" | "tijolo";
  /** aporte necessário, só em compras, para atingir a meta */
  contribution: number;
};

/**
 * Menor aporte em uma única classe que leva a carteira à meta.
 * Resolve (A + x) / (T + x) = alvo  =>  x = (alvo·T − A) / (1 − alvo).
 */
export function suggestContribution(
  paper: number,
  brick: number,
  paperTarget: number,
): Suggestion | null {
  const total = paper + brick;
  if (total <= 0) return null;
  const paperGoal = paperTarget / 100;
  const brickGoal = 1 - paperGoal;

  if (paper / total < paperGoal && paperGoal < 1) {
    const contribution = (paperGoal * total - paper) / (1 - paperGoal);
    return contribution > 0.005 ? { variantClass: "papel", contribution } : null;
  }
  if (brick / total < brickGoal && brickGoal < 1) {
    const contribution = (brickGoal * total - brick) / (1 - brickGoal);
    return contribution > 0.005 ? { variantClass: "tijolo", contribution } : null;
  }
  return null;
}
