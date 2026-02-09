
# # import torch
# # import torch.nn.functional as F
# # import numpy as np
# # import cv2
# # import base64
# # import uuid
# # from PIL import Image
# # from torchvision import transforms
# # from .model import get_model
# # from .utils import preprocess_image

# # # Model constants
# # CLASS_NAMES = [
# #     'Atelectasis', 'Cardiomegaly', 'Effusion', 'Infiltration', 'Mass', 'Nodule', 
# #     'Pneumonia', 'Pneumothorax', 'Consolidation', 'Edema', 'Emphysema', 'Fibrosis', 
# #     'Pleural_Thickening', 'Hernia'
# # ]

# # # Lazy load model
# # model = get_model() # In production, provide path to .pth file

# # def generate_gradcam(model, input_tensor, target_class_idx):
# #     """
# #     Generates Grad-CAM activation map for the given target class.
# #     """
# #     # Set up hooks to get gradients and features
# #     features = None
# #     gradients = None
    
# #     def hook_feature(module, input, output):
# #         nonlocal features
# #         features = output
        
# #     def hook_gradient(module, input, output):
# #         nonlocal gradients
# #         gradients = output[0]

# #     # Target the last convolutional layer of DenseNet
# #     target_layer = model.densenet121.features.norm5
# #     handle_f = target_layer.register_forward_hook(hook_feature)
# #     handle_g = target_layer.register_backward_hook(hook_gradient)

# #     # Forward pass
# #     output = model(input_tensor)
# #     model.zero_grad()
    
# #     # Backward pass for the specific class
# #     score = output[0][target_class_idx]
# #     score.backward()
    
# #     # Pool the gradients across the channels
# #     pooled_gradients = torch.mean(gradients, dim=[0, 2, 3])
    
# #     # Weight the channels by corresponding gradients
# #     for i in range(features.shape[1]):
# #         features[:, i, :, :] *= pooled_gradients[i]
        
# #     # Average the channels to get the heatmap
# #     heatmap = torch.mean(features, dim=1).squeeze()
# #     heatmap = F.relu(heatmap)
# #     heatmap /= torch.max(heatmap)
    
# #     handle_f.remove()
# #     handle_g.remove()
    
# #     return heatmap.detach().cpu().numpy()

# # def predict_chest_xray(image: Image.Image):
# #     input_tensor = preprocess_image(image)
    
# #     with torch.no_grad():
# #         output = model(input_tensor)
# #         probs = output[0].numpy()
        
# #     # Get top predictions
# #     predictions = []
# #     for i, prob in enumerate(probs):
# #         predictions.append({
# #             "label": CLASS_NAMES[i],
# #             "probability": float(prob)
# #         })
        
# #     # Generate Grad-CAM for the highest probability class
# #     top_idx = np.argmax(probs)
# #     # Note: Grad-CAM requires a backward pass, so we need to enable gradients temporarily
# #     with torch.enable_grad():
# #         cam = generate_gradcam(model, input_tensor, top_idx)
        
# #     # Convert heatmap to color image
# #     cam_resized = cv2.resize(cam, (224, 224))
# #     heatmap = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
    
# #     # Encode to base64
# #     _, buffer = cv2.imencode('.png', heatmap)
# #     heatmap_base64 = base64.b64encode(buffer).decode('utf-8')
    
# #     return {
# #         "predictions": predictions,
# #         "heatmap_base64": f"data:image/png;base64,{heatmap_base64}",
# #         "report_id": str(uuid.uuid4())
# #     }


# import torch
# import torch.nn.functional as F
# import numpy as np
# import cv2
# import base64
# import uuid
# from PIL import Image
# from torchvision import transforms
# from .model import get_model
# from .utils import preprocess_image

# # -----------------------------
# # Model constants
# # -----------------------------
# CLASS_NAMES = [
#     'Atelectasis', 'Cardiomegaly', 'Effusion', 'Infiltration', 'Mass', 'Nodule',
#     'Pneumonia', 'Pneumothorax', 'Consolidation', 'Edema', 'Emphysema', 'Fibrosis',
#     'Pleural_Thickening', 'Hernia'
# ]

# # -----------------------------
# # Lazy load model
# # -----------------------------
# model = get_model()  # assumes eval() already set


# # -----------------------------
# # FIXED Grad-CAM implementation
# # -----------------------------
# def generate_gradcam(model, input_tensor, target_class_idx):
#     target_layer = model.densenet121.features.norm5
#     activations = []

#     def forward_hook(module, input, output):
#         activations.append(output.clone())

#     handle = target_layer.register_forward_hook(forward_hook)

#     output = model(input_tensor)
#     score = output[0, target_class_idx]

#     grads = torch.autograd.grad(
#         outputs=score,
#         inputs=activations[0],
#         retain_graph=False,
#         create_graph=False,
#         allow_unused=True
#     )[0]

#     handle.remove()

#     # 🔒 SAFE GUARD
#     if grads is None:
#         return np.zeros(
#             activations[0].shape[2:],
#             dtype=np.float32
#         )

#     weights = grads.mean(dim=(2, 3), keepdim=True)
#     cam = (weights * activations[0]).sum(dim=1)

#     cam = torch.relu(cam)
#     cam -= cam.min()
#     cam /= (cam.max() + 1e-8)

#     return cam.squeeze().cpu().numpy()



# # -----------------------------
# # Prediction + Grad-CAM
# # -----------------------------
# def predict_chest_xray(image: Image.Image):
#     input_tensor = preprocess_image(image)

#     # Forward inference (no gradients)
#     with torch.no_grad():
#         output = model(input_tensor)
#         probs = output[0].cpu().numpy()

#     # Prepare predictions
#     predictions = []
#     for i, prob in enumerate(probs):
#         predictions.append({
#             "label": CLASS_NAMES[i],
#             "probability": float(prob)
#         })

#     # Select top predicted class for Grad-CAM
#     top_idx = int(np.argmax(probs))

#     # Grad-CAM requires gradients
#     with torch.enable_grad():
#         cam = generate_gradcam(model, input_tensor, top_idx)

#     # Resize CAM to image size
#     cam_resized = cv2.resize(cam, (224, 224))

#     # Original image (for overlay)
#     original = np.array(
#         image.resize((224, 224)).convert("RGB")
#     )

#     # Apply color map
#     heatmap = cv2.applyColorMap(
#         np.uint8(255 * cam_resized),
#         cv2.COLORMAP_JET
#     )

#     # Proper medical overlay (NOT standalone heatmap)
#     overlay = cv2.addWeighted(
#         original, 0.65,
#         heatmap, 0.35,
#         0
#     )

#     # Encode overlay to base64
#     _, buffer = cv2.imencode('.png', overlay)
#     heatmap_base64 = base64.b64encode(buffer).decode('utf-8')

#     return {
#         "predictions": predictions,
#         "heatmap_base64": f"data:image/png;base64,{heatmap_base64}",
#         "report_id": str(uuid.uuid4())
#     }






import torch
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import numpy as np
import cv2
import base64
import io
import uuid
import os

# ======================================================
# CONFIGURATION
# ======================================================

DEVICE = torch.device("cpu")   # Render Free tier = CPU only
ENABLE_GRADCAM = False         # ❌ Disable on free tier (can enable on paid tier)

# ======================================================
# LOAD MODEL (ONCE AT STARTUP)
# ======================================================

model = models.densenet121(
    weights=models.DenseNet121_Weights.IMAGENET1K_V1
)
model.eval()
model.to(DEVICE)

# ======================================================
# IMAGE TRANSFORM
# ======================================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ======================================================
# LABELS (ADJUST IF YOU HAVE MORE CLASSES)
# ======================================================

LABELS = [
    "Normal",
    "Pneumonia"
]

# ======================================================
# GRAD-CAM IMPLEMENTATION (OPTIONAL)
# ======================================================

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.gradients = None
        self.activations = None

        target_layer.register_forward_hook(self.save_activation)
        target_layer.register_backward_hook(self.save_gradient)

    def save_activation(self, module, input, output):
        self.activations = output

    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]

    def generate(self, class_idx):
        weights = self.gradients.mean(dim=(2, 3), keepdim=True)
        cam = (weights * self.activations).sum(dim=1)
        cam = F.relu(cam)
        cam = cam.squeeze().detach().cpu().numpy()
        cam = cv2.resize(cam, (224, 224))
        cam = cam / np.max(cam)
        return cam

# ======================================================
# MAIN PREDICTION FUNCTION
# ======================================================

def predict_chest_xray(image: Image.Image):
    """
    Performs chest X-ray prediction.
    Optimized for low-memory environments (Render Free Tier).
    """

    # ---------- Preprocess ----------
    image = image.convert("RGB")
    input_tensor = transform(image).unsqueeze(0).to(DEVICE)

    # ---------- Forward Pass ----------
    with torch.no_grad():   # ✅ CRITICAL for memory
        outputs = model(input_tensor)
        probs = F.softmax(outputs, dim=1)[0]

    # ---------- Build Predictions ----------
    predictions = []
    for i, label in enumerate(LABELS):
        predictions.append({
            "label": label,
            "probability": round(float(probs[i]), 4)
        })

    # ---------- Grad-CAM (OPTIONAL) ----------
    heatmap_base64 = None

    if ENABLE_GRADCAM:
        target_layer = model.features[-1]
        gradcam = GradCAM(model, target_layer)

        class_idx = torch.argmax(probs).item()
        model.zero_grad()
        outputs[0, class_idx].backward()

        cam = gradcam.generate(class_idx)

        heatmap = cv2.applyColorMap(
            np.uint8(255 * cam),
            cv2.COLORMAP_JET
        )

        heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
        heatmap_img = Image.fromarray(heatmap)

        buffer = io.BytesIO()
        heatmap_img.save(buffer, format="PNG")
        heatmap_base64 = base64.b64encode(
            buffer.getvalue()
        ).decode("utf-8")

    # ---------- Response ----------
    return {
        "predictions": predictions,
        "heatmap_base64": heatmap_base64,
        "report_id": str(uuid.uuid4())
    }
