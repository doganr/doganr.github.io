Title: Getting Started with Python for AI Research: A Practical Roadmap
Date: 2024-03-05 09:00
Category: Teaching
Tags: python, deep learning, tutorial, education, programming
Slug: python-ai-research-roadmap
Author: Ramazan Ozgur Dogan
Lang: en
Summary: Whether you're a student or a researcher transitioning into AI, Python is your entry point. Here's the roadmap I recommend — built from years of teaching Programming and Applications courses at Trabzon and Gumushane universities.

# Getting Started with Python for AI Research: A Practical Roadmap

I've been teaching programming and machine learning to undergraduate and graduate students for over a decade.
One of the most common questions I get: **"How do I start learning Python for AI research?"**

Here's the honest, practical roadmap I now give to every new student.

## Step 0: Get Your Environment Right

Don't waste time on setup. Use these:

```bash
# Install Miniconda (minimal Anaconda)
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh

# Create a dedicated environment
conda create -n airesearch python=3.11
conda activate airesearch

# Install core packages
pip install numpy pandas matplotlib scikit-learn torch torchvision jupyter
```

Use **VS Code** or **JupyterLab** as your IDE. Avoid Notepad or IDLE.

## Step 1: Master Python Basics (4 weeks)

You need solid fundamentals before touching ML:

```python
# Data types you MUST know well
numbers = [1, 2, 3, 4, 5]
lookup = {"name": "Ramazan", "university": "Trabzon"}

# List comprehensions — essential Python skill
squares = [x**2 for x in range(10) if x % 2 == 0]

# Functions and scope
def cosine_similarity(a, b):
    """Dot product divided by magnitudes."""
    import numpy as np
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Classes — needed for PyTorch
class NeuralNetwork:
    def __init__(self, layers):
        self.layers = layers
        self.weights = self._initialize_weights()

    def _initialize_weights(self):
        return [np.random.randn(l1, l2) * 0.01
                for l1, l2 in zip(self.layers[:-1], self.layers[1:])]
```

**Resources:**
- [Python Tutorial](https://docs.python.org/3/tutorial/) — official, comprehensive
- *Automate the Boring Stuff with Python* — free online, excellent for beginners

## Step 2: NumPy and Matplotlib (2 weeks)

99% of ML code uses NumPy:

```python
import numpy as np
import matplotlib.pyplot as plt

# Matrix operations — your bread and butter
A = np.random.randn(100, 10)   # 100 samples, 10 features
B = np.random.randn(10, 5)     # 10 → 5 transformation
C = A @ B                       # Matrix multiply: (100, 5)

# Broadcasting — powerful and confusing at first
signal  = np.random.randn(1000)
window  = np.hanning(50)
# These shapes broadcast correctly
filtered = np.convolve(signal, window / window.sum(), mode='same')

# Always visualize your data
fig, axes = plt.subplots(1, 2, figsize=(12, 4))
axes[0].plot(signal[:200], label='Raw')
axes[1].plot(filtered[:200], label='Filtered', color='orange')
for ax in axes: ax.legend(); ax.grid(alpha=0.3)
plt.tight_layout()
plt.savefig('signal_comparison.png', dpi=150)
```

## Step 3: Scikit-learn for Classical ML (3 weeks)

Before deep learning, understand classical ML:

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report

# Load your data
X, y = load_my_dataset()

# Always scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split carefully — don't leak test data!
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

# Train and evaluate
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Cross-validation is more reliable than a single split
cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='f1_macro')
print(f"CV F1: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")

print(classification_report(y_test, model.predict(X_test)))
```

## Step 4: PyTorch for Deep Learning (8+ weeks)

Now you're ready for the main event:

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

# Everything is a Tensor
x = torch.randn(32, 3, 224, 224)  # Batch of 32 RGB images

# Define a simple CNN
class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d(1),
        )
        self.classifier = nn.Linear(64, num_classes)

    def forward(self, x):
        return self.classifier(self.features(x).flatten(1))

model = SimpleCNN().cuda() if torch.cuda.is_available() else SimpleCNN()
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()

# Training loop
for epoch in range(50):
    model.train()
    for batch_x, batch_y in dataloader:
        optimizer.zero_grad()
        loss = criterion(model(batch_x), batch_y)
        loss.backward()
        optimizer.step()
```

## The Mistakes I See Most Often

| Mistake | Correct Practice |
|---------|-----------------|
| Not splitting test set early | Hold out test set FIRST, never touch it |
| Forgetting `model.eval()` | Always switch modes during evaluation |
| No learning rate scheduling | Use cosine annealing or ReduceLROnPlateau |
| No seed setting | `torch.manual_seed(42)`, `np.random.seed(42)` |
| Overfitting to validation set | Use test set only at the very end |

## Recommended Papers to Read First

1. **ResNet** — He et al., 2015 — understand residual connections
2. **U-Net** — Ronneberger et al., 2015 — segmentation architecture
3. **Attention is All You Need** — Vaswani et al., 2017 — transformers
4. **ViT** — Dosovitskiy et al., 2020 — vision transformers

---

This roadmap usually takes **6-9 months** for a motivated beginner with a STEM background. The key is
**consistent daily practice** — 1 hour every day beats a 10-hour weekend session.

Good luck! 🚀
