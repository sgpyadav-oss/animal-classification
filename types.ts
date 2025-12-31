
export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface Detection {
  label: string;
  confidence: number;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

export interface AppState {
  image: string | null;
  detections: Detection[];
  isLoading: boolean;
  error: string | null;
}
