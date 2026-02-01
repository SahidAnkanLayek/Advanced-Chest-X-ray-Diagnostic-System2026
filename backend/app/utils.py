
import torch
from torchvision import transforms
from PIL import Image

def preprocess_image(image: Image.Image):
    """
    Industry-standard preprocessing for DenseNet-121 on X-rays.
    Resizes, center crops, and normalizes using ImageNet statistics.
    """
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])
    
    # Add batch dimension: [C, H, W] -> [1, C, H, W]
    return preprocess(image).unsqueeze(0)
