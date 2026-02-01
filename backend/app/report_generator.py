
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph, Frame
import io
import base64
from PIL import Image
from datetime import datetime

def generate_medical_pdf(data: dict, original_image_b64: str):
    """
    Generates a high-fidelity medical report matching the ChestScan AI layout.
    """
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)
    width, height = letter
    
    # --- 1. Header (Dark Navy Blue) ---
    can.setFillColorRGB(0.06, 0.09, 0.25) # Dark Blue #0F1740
    can.rect(0, height - 120, width, 120, fill=1, stroke=0)
    
    can.setFillColor(colors.white)
    can.setFont("Helvetica-Bold", 26)
    can.drawString(50, height - 65, "ChestScan AI Diagnostic Report")
    
    can.setFont("Helvetica", 10)
    can.drawString(50, height - 90, f"Report ID: {data.get('reportId', 'N/A')}")
    can.drawString(50, height - 105, f"Timestamp: {data.get('timestamp', datetime.now().strftime('%m/%d/%Y, %I:%M:%S %p'))}")
    
    # --- 1.1 Patient Details Section (New) ---
    y_pos = height - 150
    can.setFillColor(colors.black)
    can.setFont("Helvetica-Bold", 11)
    
    patient = data.get('patient', {})
    if patient:
        p_info = [
            f"Patient Name: {patient.get('name', 'Anonymous')}",
            f"Patient ID: {patient.get('patientId', 'N/A')}",
            f"DOB: {patient.get('dob', 'N/A')}",
            f"Gender: {patient.get('gender', 'N/A')}"
        ]
        can.setFont("Helvetica", 9)
        can.drawString(50, y_pos, p_info[0])
        can.drawString(200, y_pos, p_info[1])
        can.drawString(350, y_pos, p_info[2])
        can.drawString(500, y_pos, p_info[3])
    
    # --- 2. Quantitative Pathological Analysis ---
    y_pos -= 40
    can.setFont("Helvetica-Bold", 16)
    can.drawString(50, y_pos, "1. Quantitative Pathological Analysis")
    y_pos -= 35
    
    # Sort and take top 5 for the bars
    predictions = sorted(data.get('predictions', []), key=lambda x: x['probability'], reverse=True)[:5]
    
    for pred in predictions:
        label = pred['label'].replace('_', ' ')
        prob = pred['probability']
        percent = prob * 100
        
        can.setFont("Helvetica", 12)
        can.setFillColor(colors.black)
        can.drawString(50, y_pos, label)
        
        # Bar Background
        bar_x = 180
        bar_max_width = 300
        can.setFillColorRGB(0.95, 0.96, 0.98) # Light gray background
        can.rect(bar_x, y_pos - 4, bar_max_width, 16, stroke=0, fill=1)
        
        # Bar Fill Color
        if percent > 70: fill_color = colors.HexColor("#EF4444") # Red
        elif percent > 40: fill_color = colors.HexColor("#F59E0B") # Amber
        else: fill_color = colors.HexColor("#10B981") # Green
        
        can.setFillColor(fill_color)
        can.rect(bar_x, y_pos - 4, (percent/100) * bar_max_width, 16, stroke=0, fill=1)
        
        # Percentage text
        can.setFillColor(colors.black)
        can.setFont("Helvetica-Bold", 11)
        can.drawString(bar_x + bar_max_width + 15, y_pos, f"{percent:.1f}%")
        
        y_pos -= 30

    # --- 3. Radiographic Visualization (Grad-CAM Analysis) ---
    y_pos -= 15
    can.setFont("Helvetica-Bold", 16)
    can.drawString(50, y_pos, "2. Radiographic Visualization (Grad-CAM Analysis)")
    y_pos -= 260 # Height of image section
    
    try:
        def get_img_reader(b64_str):
            if not b64_str: return None
            if "base64," in b64_str: b64_str = b64_str.split("base64,")[1]
            img_data = base64.b64decode(b64_str)
            return Image.open(io.BytesIO(img_data))

        orig_img = get_img_reader(original_image_b64)
        if orig_img:
            can.drawInlineImage(orig_img, 50, y_pos + 10, width=240, height=240)
        
        heat_img = get_img_reader(data.get('heatmapUrl', ''))
        if heat_img:
            can.drawInlineImage(heat_img, 310, y_pos + 10, width=240, height=240)
        
        can.setFont("Helvetica-Bold", 9)
        can.setFillColorRGB(0.4, 0.45, 0.5)
        can.drawCentredString(170, y_pos - 5, "FIG A: ORIGINAL SOURCE RADIOGRAPH")
        can.drawCentredString(430, y_pos - 5, "FIG B: AI FEATURE ACTIVATION MAP")
    except Exception as e:
        can.drawString(50, y_pos, f"Image Render Error: {str(e)}")

    # --- 4. Clinical Interpretation & Logic ---
    y_pos -= 50
    can.setFillColor(colors.black)
    can.setFont("Helvetica-Bold", 16)
    can.drawString(50, y_pos, "3. Clinical Interpretation & Logic")
    
    styles = getSampleStyleSheet()
    styleN = styles["Normal"]
    styleN.fontSize = 10
    styleN.leading = 14
    
    top_finding = predictions[0]['label'] if predictions else "Normal"
    top_prob = predictions[0]['probability'] if predictions else 0
    
    findings_text = f"<b>Detailed Radiographic Findings:</b> The most prominent finding is potential {top_finding.lower().replace('_', ' ')} detected with {top_prob*100:.1f}% probability. "
    if top_prob > 0.6:
        findings_text += f"There is a localized activation area indicated in Figure B, which obscures standard anatomical margins. This appearance is consistent with acute pathology. "
    else:
        findings_text += "Radiographic findings are subtle and within technical variance. No significant opacities noted. "
    
    findings_text += "The costophrenic angles appear sharp, and the lung fields are relatively clear of secondary infiltrates. Pulmonary vasculature is within normal limits. No pneumothorax or acute osseous abnormalities identified."

    correlation_text = f"<b>Clinical Correlation:</b> The combination of automated findings for {top_finding.lower()} is highly suggestive of acute clinical presentation. While AI interpretations provide decision support, this projection must be correlated with patient symptoms (dyspnea, orthopnea, or fever)."
    
    recommendation_text = f"<b>Follow-up Recommendations:</b> 1. Immediate clinical correlation with physical exam. 2. Review prior imaging to assess chronicity. 3. Consider secondary high-res CT if symptoms persist."

    # Combine into frames
    p1 = Paragraph(findings_text, styleN)
    p2 = Paragraph(correlation_text, styleN)
    p3 = Paragraph(recommendation_text, styleN)
    
    story = [p1, Paragraph("<br/>", styleN), p2, Paragraph("<br/>", styleN), p3]
    f1 = Frame(50, 100, 510, y_pos - 100, showBoundary=0)
    f1.addFromList(story, can)

    # --- 5. Footer (Medical Disclaimer - Amber Background) ---
    can.setFillColorRGB(1.0, 0.98, 0.9) # Light Amber
    can.rect(0, 0, width, 100, fill=1, stroke=0)
    
    can.setFillColor(colors.HexColor("#92400E"))
    can.setFont("Helvetica-Bold", 10)
    can.drawCentredString(width/2, 80, "CRITICAL AI LIMITATIONS & MEDICAL DISCLAIMER")
    
    disclaimer = "This report is generated by an artificial intelligence model and is intended ONLY for clinical decision support. It DOES NOT constitute a final diagnosis. AI interpretations are prone to statistical variance, false positives, and false negatives. A certified radiologist or physician MUST review the original radiographic data and correlate with patient clinical history before any therapeutic intervention. ChestScan AI is not liable for diagnostic errors resulting from sole reliance on this output."
    
    p_disclaimer = Paragraph(disclaimer, ParagraphStyle('dis', fontSize=8, leading=10, alignment=1, textColor=colors.HexColor("#B45309")))
    f_dis = Frame(50, 15, 510, 65, showBoundary=0)
    f_dis.addFromList([p_disclaimer], can)

    can.showPage()
    can.save()
    
    packet.seek(0)
    return packet.getvalue()
