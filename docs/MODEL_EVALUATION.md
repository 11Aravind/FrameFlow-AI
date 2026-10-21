# Model Evaluation Report: Malayalam ASR & Translation

## Executive Summary

This document evaluates candidate open-source models for **Malayalam speech-to-text (ASR)** and **Malayalam-to-English translation** for local inference on modest hardware (Intel Iris Xe graphics, 16 GB RAM, x86_64 CPU).

---

## 1. Malayalam Speech-to-Text (ASR)

### Challenges Identified in Research
1. **Low-Resource Language & Representation:**
   Malayalam is an agglutinative Dravidian language with complex conjuncts (chillaksharangal) and colloquial contractions common in rural farming contexts.
2. **Script Hallucination Risk:**
   Stock multilingual Whisper (`tiny`, `base`, `small`) frequently confuses Malayalam acoustics with Tamil or Telugu, transcribing valid spoken Malayalam in the Tamil script or failing to detect language accurately.
3. **Mitigations Required:**
   - Always enforce `language="ml"` explicitly in generation options (never rely on automatic language identification for Malayalam clips).
   - Inject an `initial_prompt` with valid Malayalam script to steer decoder tokens toward Malayalam character ranges.
   - Employ `faster-whisper` with `compute_type="int8"` on CPU to keep memory footprint under 2 GB while accelerating inference 3–4x.

### Candidate Matrix

| Candidate | Precision / Quantization | Memory (RAM) | Inference Speed (CPU) | Malayalam Fidelity | Recommendation |
|---|---|---|---|---|---|
| **faster-whisper (base/small)** | INT8 / FP32 | ~1.0 GB | Fast (~0.3x real-time) | Moderate (struggles with heavy regional slang) | **Default MVP baseline** for low-spec setup. |
| **faster-whisper (large-v3)** | INT8 | ~2.5 GB | Balanced (~0.8x-1.2x real-time) | High; handles Malayalam vocabulary and rural terms significantly better | **Balanced / High Accuracy profile** option. |
| **Vanilla Whisper (openai/whisper)** | FP32 | 3.5 - 6.0 GB | Slow on CPU | Equivalent to stock | Not recommended for CPU inference. |
| **IndicWhisper (AI4Bharat)** | FP16 / FP32 | ~4.0 GB | Moderate | Excellent on clean formal Malayalam | Specialized tokenizer and dependencies; candidate for Phase 8. |

---

## 2. Malayalam-to-English Translation

### Candidate Matrix

| Candidate | Architecture | Model Size / Weights | RAM Usage | Malayalam (`mal_Mlym`) Support | Quality & Notes |
|---|---|---|---|---|---|
| **NLLB-200 Distilled 600M** (`facebook/nllb-200-distilled-600M`) | Seq2Seq Transformer | ~2.4 GB (600M params) | ~2.0 GB on CPU | Direct `mal_Mlym` ➔ `eng_Latn` | **Selected Local Default.** Fast, good sentence-level structure. Must translate segment-by-segment (up to 512 tokens). Restricted under CC-BY-NC 4.0. |
| **Whisper Direct Translation (`task="translate"`)** | Encoder-Decoder ASR | Bundled in Whisper | Shared with ASR | Direct Audio ➔ English | Bypasses Malayalam transcription, preventing user review of original Malayalam script. Used only as a fallback comparison. |
| **IndicTrans2 (AI4Bharat)** | 1B Transformer | ~4 GB | ~5-6 GB | Direct Indic-to-English | Highest grammatical accuracy on Indian agricultural terms; requires high RAM and specialized dependencies. |

---

## 3. Recommended Processing Workflow for Low-Spec CPU

1. **Audio Extraction:** Native FFmpeg converts incoming MP4 to 16 kHz 16-bit mono WAV.
2. **ASR Step:** `faster-whisper` runs with `model_size="small"`, `language="ml"`, `compute_type="int8"`.
3. **User Review Step:** The user inspects and corrects the Malayalam transcript segments in the web UI.
4. **Translation Step:** Confirmed Malayalam segments are fed to `NLLB-200-distilled-600M` (`mal_Mlym` ➔ `eng_Latn`).
5. **Cue Timing Alignment:** Translated English text inherits the calibrated start/end millisecond timestamps from the Malayalam speech segments, with subtitle splitting logic applied.
