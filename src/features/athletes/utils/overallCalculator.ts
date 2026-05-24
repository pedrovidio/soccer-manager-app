type Stats = {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
};

export function calculateWeightedOverall(
  stats: Stats,
  highestLevel: 'PROFESSIONAL' | 'AMATEUR' | 'CASUAL',
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward'
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  const applyWeight = (stat: number, weight: number) => {
    weightedSum += (stat || 0) * weight;
    totalWeight += weight;
  };

  // Pesos dinâmicos por posição (Regra de Negócio: Matchmaking & Attributes)
  const w = { pace: 1, shooting: 1, passing: 1, dribbling: 1, defense: 1, physical: 1 };

  if (position === 'Defender') { w.defense = 2.0; w.physical = 1.5; }
  if (position === 'Midfielder') { w.passing = 2.0; w.dribbling = 1.5; }
  if (position === 'Forward') { w.shooting = 2.0; w.pace = 1.5; }
  if (position === 'Goalkeeper') { w.defense = 2.5; w.physical = 1.5; } // Assumindo stats equivalentes para GK

  applyWeight(stats.pace, w.pace);
  applyWeight(stats.shooting, w.shooting);
  applyWeight(stats.passing, w.passing);
  applyWeight(stats.dribbling, w.dribbling);
  applyWeight(stats.defense, w.defense);
  applyWeight(stats.physical, w.physical);

  const baseOverall = weightedSum / totalWeight;
  const levelMultipliers = { PROFESSIONAL: 1.2, AMATEUR: 1.0, CASUAL: 0.8 };

  return Math.min(Math.round(baseOverall * levelMultipliers[highestLevel]), 99);
}