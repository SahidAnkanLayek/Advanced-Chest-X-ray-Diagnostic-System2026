from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from gradio_client import Client, handle_file
import shutil
import os
import base64
import tempfile

# Initialize FastAPI App
app = FastAPI(title="CheXNet Backend API")

# Configure CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to your Hugging Face Space
HF_SPACE_ID = "SahidAnkanLayek/Advanced-Chest-X-ray-Diagnostic-System2026"
try:
    hf_client = Client(HF_SPACE_ID)
except Exception as e:
    print(f"Warning: Could not connect to Hugging Face Space. {e}")
    hf_client = None

def file_to_base64(file_path):
    """Converts a file to a Base64 encoded string for the frontend."""
    with open(file_path, "rb") as file:
        return base64.b64encode(file.read()).decode("utf-8")

@app.get("/")
def read_root():
    return {"status": "Backend is running smoothly! 🚀"}

@app.post("/predict")
async def get_prediction(
    image: UploadFile = File(...),
    patient_name: str = Form("Unknown"),
    patient_id: str = Form("Unknown"),
    patient_dob: str = Form("Unknown"),
    patient_gender: str = Form("Unknown")
):
    if not hf_client:
        raise HTTPException(status_code=500, detail="Hugging Face client is not initialized.")

    temp_dir = tempfile.mkdtemp()
    temp_input_path = os.path.join(temp_dir, image.filename)
    
    try:
        with open(temp_input_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        print(f"Sending request to Hugging Face for patient: {patient_name}...")
        result = hf_client.predict(
            image=handle_file(temp_input_path),
            p_name=patient_name,
            p_id=patient_id,
            p_dob=patient_dob,
            p_gender=patient_gender,
            api_name="/predict"
        )
        
        # Hugging Face returns a tuple
        heatmap_path = result[0]
        raw_label_data = result[1]
        pdf_path = result[2]

        # ✅ FIX: Flatten Gradio's nested 'confidences' format back into a simple dictionary for React
        probabilities = {}
        if isinstance(raw_label_data, dict) and "confidences" in raw_label_data:
            for item in raw_label_data["confidences"]:
                probabilities[item["label"]] = item["confidence"]
        else:
            probabilities = raw_label_data # Fallback just in case

        # Convert outputs to Base64
        heatmap_base64 = file_to_base64(heatmap_path)
        pdf_base64 = file_to_base64(pdf_path)

        # Return the structured data to the frontend
        return {
            "success": True,
            "probabilities": probabilities,
            "heatmap_base64": f"data:image/png;base64,{heatmap_base64}",
            "pdf_base64": pdf_base64,
            "pdf_filename": f"Radiology_Report_{patient_name.replace(' ', '_')}.pdf"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        if os.path.exists(temp_input_path):
            os.remove(temp_input_path)
        os.rmdir(temp_dir)        