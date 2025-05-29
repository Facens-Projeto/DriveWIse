export interface Vehicle {
  id?: string;         
  userId: string;
  modelId: string;
  year: number;
  initialKm: number;
  modifications?: string;
}
