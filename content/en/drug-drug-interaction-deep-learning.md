Title: Drug-Drug Interaction Prediction with Deep Learning
Date: 2024-06-10 09:00
Category: AI in Healthcare
Tags: drug interaction, deep learning, pharmacology, CNN, graph neural network
Slug: drug-drug-interaction-prediction-deep-learning
Author: Ramazan Ozgur Dogan
Lang: en
Summary: Predicting adverse drug-drug interactions (DDIs) is a critical safety challenge in pharmacology. I explore how CNNs can tackle this problem using molecular fingerprints and graph representations.

# Drug-Drug Interaction Prediction with Deep Learning

Every year, **adverse drug reactions** cause hundreds of thousands of hospitalizations worldwide. A significant
portion involve **drug-drug interactions (DDIs)** — when two drugs taken together produce unexpected and harmful effects.

With over 20,000 approved drugs on the market, the number of possible pairs exceeds **200 million**. Traditional
clinical testing cannot cover this space. This is where **AI steps in**.

## The Problem Formulation

Given a pair of molecules (Drug A, Drug B), we want to predict:
1. **Whether** they interact adversely
2. **What type** of interaction (pharmacokinetic? pharmacodynamic?)

This can be framed as a **binary or multi-class classification** problem.

## Our CNN-Based Approach

In our paper published in *Süleyman Demirel Üniversitesi Fen Bilimleri Enstitüsü Dergisi* (2023), we developed
a CNN-based model that:

1. Encodes each drug as a **molecular fingerprint** (ECFP4 — Extended Connectivity Fingerprint)
2. Concatenates the two fingerprint vectors
3. Passes them through convolutional layers to extract interaction patterns

```python
import torch
import torch.nn as nn

class DDIPredictor(nn.Module):
    def __init__(self, fp_size=2048, num_classes=2):
        super().__init__()
        # Treat concatenated fingerprints as a 1D "image"
        self.conv_layers = nn.Sequential(
            nn.Conv1d(1, 64, kernel_size=7, padding=3),
            nn.ReLU(),
            nn.MaxPool1d(2),
            nn.Conv1d(64, 128, kernel_size=5, padding=2),
            nn.ReLU(),
            nn.MaxPool1d(2),
            nn.Conv1d(128, 256, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(1),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(128, num_classes)
        )

    def forward(self, fp_a, fp_b):
        combined = torch.cat([fp_a, fp_b], dim=1).unsqueeze(1)
        features = self.conv_layers(combined)
        return self.classifier(features)
```

## Why CNNs Work Here

You might wonder why CNNs (typically used for images) work on molecular fingerprints. The key insight:

- Molecular fingerprints are **bit vectors** where nearby bits often encode structurally similar subgraphs
- CNN kernels can learn **local pharmacophore patterns** in the fingerprint space
- This outperforms simple MLPs on this task because of the implicit structural encoding

## Performance on DrugBank

| Model | AUC-ROC | F1 | Precision |
|-------|---------|-----|-----------|
| Random Forest | 0.872 | 0.81 | 0.84 |
| MLP | 0.891 | 0.83 | 0.86 |
| **CNN (ours)** | **0.924** | **0.88** | **0.90** |
| GNN (SOTA) | 0.941 | 0.90 | 0.92 |

## The Future: Graph Neural Networks

While our CNN model performs well, the natural representation for molecules is a **graph** — atoms as nodes,
bonds as edges. GNNs are now the dominant approach:

```python
# Conceptual GNN-based DDI (using PyTorch Geometric)
from torch_geometric.nn import GCNConv, global_mean_pool

class MoleculeEncoder(nn.Module):
    def __init__(self, node_features, hidden_dim):
        super().__init__()
        self.conv1 = GCNConv(node_features, hidden_dim)
        self.conv2 = GCNConv(hidden_dim, hidden_dim)

    def forward(self, x, edge_index, batch):
        x = F.relu(self.conv1(x, edge_index))
        x = F.relu(self.conv2(x, edge_index))
        return global_mean_pool(x, batch)  # Graph-level embedding
```

Current state-of-the-art models combine GNN molecular encoders with **transformer-based interaction modules**,
achieving >95% AUC on standard benchmarks.

## Open Datasets for DDI Research

- [DrugBank](https://go.drugbank.com/) — gold standard, requires registration
- [TWOSIDES](http://tatonettilab.org/resources/tatonetti-stm.html) — polypharmacy side effects
- [ChEMBL](https://www.ebi.ac.uk/chembl/) — bioactivity data
- [STITCH](http://stitch.embl.de/) — drug-protein and drug-drug interactions

---

This is an exciting intersection of **AI and pharmacology** that I continue to explore. If you're working on
similar problems, feel free to reach out!
