
import torch
import torch.nn as nn
from torchvision import models

class DenseNet121(nn.Module):
    """
    Standard CheXNet-style architecture using DenseNet-121.
    Modified output layer for 14 common chest pathologies.
    """
    def __init__(self, num_classes=14):
        super(DenseNet121, self).__init__()
        self.densenet121 = models.densenet121(pretrained=True)
        
        # Replace the classifier with a new one for our number of classes
        num_ftrs = self.densenet121.classifier.in_features
        self.densenet121.classifier = nn.Sequential(
            nn.Linear(num_ftrs, num_classes),
            nn.Sigmoid() # Multi-label classification
        )

    def forward(self, x):
        return self.densenet121(x)

# def get_model(weights_path=None):
#     model = DenseNet121(num_classes=14)
#     if weights_path:
#         # Load pre-trained CheXNet weights
#         checkpoint = torch.load(weights_path, map_location='cpu')
#         # Handle different checkpoint formats
#         if 'state_dict' in checkpoint:
#             model.load_state_dict(checkpoint['state_dict'])
#         else:
#             model.load_state_dict(checkpoint)
#     model.eval()
#     return model
def get_model(weights_path=None):
    model = DenseNet121(num_classes=14)

    # 🔥 CRITICAL FIX: disable inplace ReLU for Grad-CAM safety
    for module in model.modules():
        if isinstance(module, torch.nn.ReLU):
            module.inplace = False

    if weights_path:
        checkpoint = torch.load(weights_path, map_location='cpu')
        if 'state_dict' in checkpoint:
            model.load_state_dict(checkpoint['state_dict'])
        else:
            model.load_state_dict(checkpoint)

    model.eval()
    return model
