export interface CreateProjectInput {
  title: string;
  category: string;
  description: string;
  province: string;
  city: string;
  address: string;
  areaSelectionMethod: string;
  polygonCoordinates: [number, number][];
  geoJson: any;
  calculatedArea: number;
  coordinateSystem: string;
  utmZone: string;
  techType: string[];
  outputFormats: string[];
  requiredAccuracy: string;
  deliveryTime: string;
  budgetType: string;
  minBudget: string;
  maxBudget: string;
  terrainTypes?: string[];
}
