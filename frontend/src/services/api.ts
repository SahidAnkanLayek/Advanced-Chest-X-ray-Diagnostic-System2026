
import { PredictionResponse, AnalysisResult, PatientDetails } from '../types';

const STORAGE_KEY = 'chexnet_history';

// This pulls the URL from your .env.local file
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

/**
 * Local Storage helpers (Keeping these for history tracking)
 */
export const saveToHistory = (result: AnalysisResult) => {
  const history = getHistory();
  const updated = [result, ...history];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getHistory = (): AnalysisResult[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

/**
 * Main API call to the FastAPI Backend
 * Notice we changed the name from analyzeImage to analyzeXRay to match your XRayLab.tsx
 */
export const analyzeXRay = async (imageFile: File, patient?: PatientDetails): Promise<PredictionResponse> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  // ✅ FIX: Actually append the patient data to the request
  if (patient) {
    formData.append('patient_name', patient.name);
    formData.append('patient_id', patient.patientId);
    formData.append('patient_dob', patient.dob);
    formData.append('patient_gender', patient.gender);
  }

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data: PredictionResponse = await response.json();
    
    // Create the AnalysisResult object to save to history
    const historyItem: AnalysisResult = {
      ...data,
      fileName: imageFile.name,
      timestamp: new Date().toISOString(),
      reportId: `R-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      patient: patient
    };
    
    saveToHistory(historyItem);

    return data;
  } catch (error) {
    console.error("Error connecting to the ML backend:", error);
    throw error;
  }
};

/**
 * Simplified PDF Download function.
 * Since the backend now generates the PDF, we just trigger the browser download.
 */
export const downloadReport = (pdfBase64: string, filename?: string) => {
  if (!pdfBase64) {
    console.error("No PDF data provided.");
    return;
  }
  
  const linkSource = `data:application/pdf;base64,${pdfBase64}`;
  const downloadLink = document.createElement("a");
  downloadLink.href = linkSource;
  downloadLink.download = filename || "Radiology_Report.pdf";
  downloadLink.click();
};