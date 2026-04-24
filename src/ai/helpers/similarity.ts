export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimension');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

export function normalizeVector(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) return vec;
  return vec.map(val => val / norm);
}

export function batchCosineSimilarity(
  queryEmbedding: number[],
  candidateEmbeddings: { id: string; embedding: number[] }[],
): { id: string; score: number }[] {
  return candidateEmbeddings
    .map(({ id, embedding }) => ({
      id,
      score: cosineSimilarity(queryEmbedding, embedding),
    }))
    .sort((a, b) => b.score - a.score);
}