from fastapi import FastAPI, UploadFile, File, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import io
from PIL import Image

from app.predict import predict_chest_xray
from app.report_generator import generate_medical_pdf

app = FastAPI(title="CheXNet-AI API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Models ----------

class PatientDetails(BaseModel):
    name: str
    patientId: str
    dob: str
    gender: str

class Prediction(BaseModel):
    label: str
    probability: float

class ReportRequest(BaseModel):
    predictions: List[Prediction]
    heatmapUrl: str
    reportId: str
    timestamp: str
    fileName: str
    originalImage: str  # base64
    patient: Optional[PatientDetails] = None

# ---------- Routes ----------

@app.get("/")
def health_check():
    return {
        "status": "active",
        "model": "DenseNet-121 (CheXNet weights)"
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    try:
        content = await file.read()
        img = Image.open(io.BytesIO(content)).convert("RGB")

        results = predict_chest_xray(img)

        return {
            "fileName": file.filename,
            "predictions": results["predictions"],
            "heatmapUrl": results["heatmap_base64"],
            "reportId": results["report_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-report")
async def generate_report(request: ReportRequest):
    try:
        pdf_bytes = generate_medical_pdf(
            request.dict(),
            request.originalImage
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Report_{request.reportId}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
