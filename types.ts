
export interface Prediction {
  label: string;
  probability: number;
}

export interface PatientDetails {
  name: string;
  patientId: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
}

export interface AnalysisResult {
  predictions: Prediction[];
  heatmapUrl: string; // Base64 or URL
  reportId: string;
  timestamp: string;
  fileName: string;
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
