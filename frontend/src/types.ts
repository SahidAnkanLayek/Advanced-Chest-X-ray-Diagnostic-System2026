
// export interface Prediction {
//   label: string;
//   probability: number;
// }

// export interface PatientDetails {
//   name: string;
//   patientId: string;
//   dob: string;
//   gender: 'Male' | 'Female' | 'Other';
// }

// export interface AnalysisResult {
//   predictions: Prediction[];
//   heatmapUrl: string; // Base64 or URL
//   reportId: string;
//   timestamp: string;
//   fileName: string;
//   patient?: PatientDetails;
// }

// export enum AppTab {
//   DASHBOARD = 'DASHBOARD',
//   ANALYZE = 'ANALYZE',
//   REPORTS = 'REPORTS',
//   SETTINGS = 'SETTINGS'
// }

// export const CLASS_NAMES = [
//   'Atelectasis',
//   'Cardiomegaly',
//   'Effusion',
//   'Infiltration',
//   'Mass',
//   'Nodule',
//   'Pneumonia',
//   'Pneumothorax',
//   'Consolidation',
//   'Edema',
//   'Emphysema',
//   'Fibrosis',
//   'Pleural_Thickening',
//   'Hernia'
// ];
// export interface PredictionResponse {
//   success: boolean;
//   probabilities: Record<string, number>;
//   heatmap_base64: string;
//   pdf_base64: string;
//   pdf_filename: string;
// }











export interface PatientDetails {
  name: string;
  patientId: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
}

// 1. The exact structure returned by your FastAPI backend
export interface PredictionResponse {
  success: boolean;
  probabilities: Record<string, number>;
  heatmap_base64: string;
  pdf_base64: string;
  pdf_filename: string;
}

// 2. The extended structure saved to LocalStorage / Firebase
// By extending PredictionResponse, we guarantee perfectly matching data types
export interface AnalysisResult extends PredictionResponse {
  fileName: string;
  timestamp: string;
  reportId: string;
  patient?: PatientDetails;
}

export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  ANALYZE = 'ANALYZE',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS'
}

export const CLASS_NAMES = [
  'Atelectasis',
  'Cardiomegaly',
  'Effusion',
  'Infiltration',
  'Mass',
  'Nodule',
  'Pneumonia',
  'Pneumothorax',
  'Consolidation',
  'Edema',
  'Emphysema',
  'Fibrosis',
  'Pleural_Thickening',
  'Hernia'
];