export interface FeatureTest {
  id: string;
  group: string;
  name: string;
  description: string;
  route: string;
  implementation: string;
  addedAt?: string;
}

const registry: FeatureTest[] = [];

export const registerFeature = (feature: FeatureTest) => {
  if (registry.find((f) => f.id === feature.id)) return;
  registry.push({
    ...feature,
    addedAt: feature.addedAt || new Date().toISOString(),
  });
};

export const getRegistry = (): FeatureTest[] => {
  return [...registry].sort((a, b) => a.group.localeCompare(b.group));
};

export const getGroups = (): string[] => {
  return ["All", ...new Set(registry.map((f) => f.group))];
};
