Title: From Ohio State to Trabzon: My TÜBİTAK 2219 Experience
Date: 2025-06-01 10:00
Category: Academic Life
Tags: tubitak, postdoc, research, ohio state, academic career
Slug: tubitak-2219-ohio-state-experience
Author: Ramazan Ozgur Dogan
Lang: en
Summary: In May 2024, I joined The Ohio State University as a Visiting Research Scholar, supported by a TÜBİTAK 2219 Postdoctoral Research Fellowship. Here's what I learned about multimodal AI for clinical data — and about international research culture.

# From Ohio State to Trabzon: My TÜBİTAK 2219 Experience

In May 2024, I packed my bags and flew to Columbus, Ohio to begin a year-long postdoctoral stay at
**The Ohio State University (OSU)**, supported by a **TÜBİTAK 2219 International Postdoctoral Research Fellowship**.

This was my second international research visit — I had previously spent a year at **Youngstown State University**
(2019–2020), where I worked on pancreas segmentation. But OSU was a different scale entirely.

## What Is TÜBİTAK 2219?

The **TÜBİTAK 2219 Program** funds postdoctoral research abroad for Turkish academics. It covers:
- Monthly stipend (~2500 USD)
- Round-trip airfare
- Health insurance
- Up to 12 months at a host institution

**Application tip:** The key is securing a strong **host researcher** who writes a compelling invitation letter.
Your research overlap with the host lab matters more than your paper count.

## My Research at OSU

At OSU, I joined a lab working on **multimodal AI for clinical and pharmacological data**. My focus:

### 1. Multimodal Fusion for Drug Response Prediction
Combining:
- **Genomic data** (gene expression profiles)
- **Molecular structure** (SMILES / graph representations)
- **Clinical notes** (NLP features)

to predict patient-specific drug responses — a step toward **precision medicine**.

### 2. Medical Foundation Models
I spent considerable time studying and fine-tuning **SAM (Segment Anything Model)** and **MedSAM** for
medical image segmentation. The zero-shot generalization of these large models is remarkable — but
they still need domain-specific fine-tuning for clinical accuracy.

```python
# MedSAM fine-tuning snippet
from segment_anything import sam_model_registry

model = sam_model_registry["vit_b"](checkpoint="medsam_vit_b.pth")

# Only fine-tune the mask decoder
for param in model.image_encoder.parameters():
    param.requires_grad = False  # Freeze encoder

optimizer = torch.optim.AdamW(
    model.mask_decoder.parameters(),
    lr=1e-4, weight_decay=1e-4
)
```

### 3. Interpretable AI in Healthcare
One lesson from OSU: **clinicians don't trust black boxes**. We explored:
- **Grad-CAM** visualizations on CT/MRI scans
- **SHAP values** for tabular clinical predictors
- **Concept-based explanations** for deep classifiers

## Cultural Takeaways

Beyond research, I gained a lot from observing how science is done at a top-10 US university:

1. **Group meetings are sacred** — weekly lab meetings with genuine critical discussion, not just presentations
2. **Reproducibility culture** — code, data, and model weights are shared by default
3. **Reading culture** — every PhD student reads 2-3 papers per week and presents them
4. **Collaboration is easy** — emailing another professor for collaboration is normal and usually welcomed

## Advice for Turkish Academics Applying for 2219

1. **Start 18 months early** — finding the host, preparing the application, and waiting for the result is slow
2. **Target labs with shared interests**, not just famous names
3. **Learn the paperwork early** — international travel and financial bureaucracy can be exhausting
4. **Join Turkish academia networks abroad** — there are active WhatsApp and email groups

## What's Next?

I returned to **Trabzon University** in May 2025 with both new research directions and stronger collaborations.
Current projects include:
- A multimodal learning framework for drug-disease interaction prediction
- Adapting medical foundation models for Turkish hospital datasets
- Submitting the OSU collaboration results to high-impact journals

If you're considering applying for TÜBİTAK 2219, feel free to message me — I'm happy to share my experience
and help with the application process!

📧 **dogan@trabzon.edu.tr**
