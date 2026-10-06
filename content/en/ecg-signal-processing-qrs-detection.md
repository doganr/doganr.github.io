Title: ECG Signal Processing: From QRS Detection to Deep Learning
Date: 2024-09-20 08:00
Category: Signal Processing
Tags: ECG, QRS detection, signal processing, deep learning, biomedical
Slug: ecg-signal-processing-qrs-detection
Author: Ramazan Ozgur Dogan
Lang: en
Summary: The electrocardiogram (ECG) is one of the most widely used diagnostic tools in medicine. In this post, I review classical and deep learning-based methods for R-peak and QRS complex detection, summarizing insights from our 2023 review paper.

# ECG Signal Processing: From QRS Detection to Deep Learning

The **electrocardiogram (ECG)** records the electrical activity of the heart and is used daily in hospitals worldwide
to diagnose arrhythmias, myocardial infarction, heart failure, and more. At the core of ECG analysis is **QRS complex
detection** — identifying the sharp spikes corresponding to ventricular depolarization.

This post summarizes the key findings from our review paper published in
*Archives of Computational Methods in Engineering* (2023).

## What Is the QRS Complex?

An ECG cycle contains several waves:
- **P wave** — atrial depolarization
- **QRS complex** — ventricular depolarization (the dominant, sharp spike)
- **T wave** — ventricular repolarization

The **R peak** (the sharp positive peak of QRS) is the most important fiducial point. From R-R intervals, we
compute **heart rate variability (HRV)**, which is a key indicator of autonomic nervous system health.

```
      R
      |
   Q  |  S
---/  |  \------- T
  \   |   \      /
   P  |    \____/
```

## Classical Methods

### 1. Pan-Tompkins Algorithm (1985)
Still the most widely implemented detector. The pipeline:

```python
def pan_tompkins(ecg, fs=360):
    # 1. Bandpass filter (5-15 Hz)
    filtered = bandpass_filter(ecg, 5, 15, fs)
    # 2. Derivative
    differentiated = np.diff(filtered)
    # 3. Squaring (amplifies peaks)
    squared = differentiated ** 2
    # 4. Moving window integration
    integrated = moving_average(squared, window=int(0.15 * fs))
    # 5. Adaptive thresholding
    r_peaks = adaptive_threshold(integrated, ecg, fs)
    return r_peaks
```

**Strength:** Robust, fast, interpretable  
**Weakness:** Fails with arrhythmias, noise, and non-standard ECG morphologies

### 2. Wavelet-Based Methods
Multi-scale wavelet decomposition separates QRS energy from noise and baseline wander. Works well for
noisy ECGs from ambulatory monitors (Holter).

### 3. Template Matching
Cross-correlates the signal with a pre-defined QRS template. Fast but requires a good template.

## Deep Learning Revolution

Since 2016, deep learning has dramatically improved detection accuracy on challenging ECGs:

| Architecture | Advantage | Notes |
|-------------|-----------|-------|
| **1D CNN** | Fast, local feature extraction | Needs labeled peaks |
| **LSTM / GRU** | Captures temporal dependencies | Slow on long signals |
| **CNN + LSTM** | Best of both worlds | Most common hybrid |
| **Transformer** | Long-range context | High compute cost |

### U-Net for QRS Segmentation

A compelling approach treats QRS detection as **1D segmentation**:

```python
class ECG_UNet(nn.Module):
    def __init__(self):
        super().__init__()
        # Encoder
        self.enc1 = ConvBlock(1, 32)
        self.enc2 = ConvBlock(32, 64)
        self.enc3 = ConvBlock(64, 128)
        # Bottleneck
        self.bottleneck = ConvBlock(128, 256)
        # Decoder
        self.dec3 = ConvBlock(256 + 128, 128)
        self.dec2 = ConvBlock(128 + 64, 64)
        self.dec1 = ConvBlock(64 + 32, 32)
        self.out  = nn.Conv1d(32, 1, 1)  # Binary: QRS or not

    def forward(self, x):
        e1 = self.enc1(x)
        e2 = self.enc2(F.max_pool1d(e1, 2))
        e3 = self.enc3(F.max_pool1d(e2, 2))
        b  = self.bottleneck(F.max_pool1d(e3, 2))
        d3 = self.dec3(torch.cat([F.interpolate(b, scale_factor=2), e3], 1))
        d2 = self.dec2(torch.cat([F.interpolate(d3, scale_factor=2), e2], 1))
        d1 = self.dec1(torch.cat([F.interpolate(d2, scale_factor=2), e1], 1))
        return torch.sigmoid(self.out(d1))
```

## Key Datasets

- **MIT-BIH Arrhythmia Database** — 48 two-lead ECG recordings, the gold standard benchmark
- **PTB-Diagnostic** — 549 records, 12-lead ECGs for cardiovascular diagnosis
- **PhysioNet Challenge datasets** — annual competitions for ECG analysis

## Performance Comparison (MIT-BIH)

| Method | Sensitivity | Precision | F1 |
|--------|------------|-----------|-----|
| Pan-Tompkins | 99.3% | 99.1% | 99.2% |
| Wavelet | 99.5% | 99.4% | 99.4% |
| 1D CNN | **99.8%** | **99.7%** | **99.7%** |
| CNN+LSTM | 99.9% | 99.8% | 99.8% |

## Key Findings from Our Review

1. **Deep learning outperforms classical methods** on all benchmarks — but margins are small on clean data
2. **The biggest gap is on noisy / arrhythmic ECGs** — deep learning is far more robust
3. **Real-time requirements** still favor lightweight CNNs or optimized Pan-Tompkins variants
4. **Cross-dataset generalization remains a challenge** — train on MIT-BIH, test on PTB, performance drops

---

📄 **Full paper:** [DOI: 10.1007/s11831-023-09916-x](https://doi.org/10.1007/s11831-023-09916-x)
