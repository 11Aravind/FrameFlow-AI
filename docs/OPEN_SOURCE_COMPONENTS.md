# Open Source Components & Licensing Registry

This document records the evaluation, versioning, licenses, hardware requirements, and suitability for all candidate and selected open-source components in **Malayalam Subtitle AI**.

---

## 1. Frontend & Web Core

| Component | Repository / Source | License | Hardware / Runtime | Decision & Rationale |
|---|---|---|---|---|
| **Next.js 14+ (App Router)** | [vercel/next.js](https://github.com/vercel/next.js) | MIT | Node.js 18.17+ / 24+ | **Selected.** Provides server components, fast routing, and code-splitting so upload page stays lightweight. |
| **React 18 / 19** | [facebook/react](https://github.com/facebook/react) | MIT | Client runtime | **Selected.** Industry standard component model. |
| **Tailwind CSS v3/v4** | [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) | MIT | Build-time | **Selected.** Utility-first styling with custom tokens for a calm, dark-themed editor. |
| **Lucide Icons** | [lucide-icons/lucide](https://github.com/lucide-icons/lucide) | ISC | Client build | **Selected.** Lightweight accessible SVG icons. |
| **Zod** | [colinhacks/zod](https://github.com/colinhacks/zod) | MIT | Runtime validation | **Selected.** Type-safe schema validation at frontend boundary. |

---

## 2. Speech-to-Text (ASR) Providers

| Model / Library | Repository / Source | License | Weights License | Hardware Needs | Malayalam Suitability & Notes |
|---|---|---|---|---|---|
| **faster-whisper** (CTranslate2) | [Systran/faster-whisper](https://github.com/SYSTRAN/faster-whisper) | MIT | Depends on model (MIT for stock Whisper) | CPU (INT8) ~1-2GB RAM; CUDA optional | **Primary Local Candidate.** 4x faster than vanilla Whisper on CPU, INT8 quantization runs smoothly on 16GB RAM Intel Iris Xe machine. Must pass `language="ml"` and an initial prompt in Malayalam script to avoid Tamil/script hallucinations. |
| **OpenAI Whisper** | [openai/whisper](https://github.com/openai/whisper) | MIT | MIT | CPU/GPU (FP32/FP16) ~3-8GB RAM | **Fallback / Reference.** High memory usage and slower on CPU compared to faster-whisper. |
| **IndicWhisper (AI4Bharat)** | [AI4Bharat/IndicWhisper](https://github.com/AI4Bharat/IndicWhisper) | MIT | CC-BY 4.0 | CUDA/CPU ~4GB RAM | High Malayalam accuracy, but heavier setup and specialized Indic pipeline dependencies. |
| **Fine-tuned Malayalam Whisper** (e.g. `rontroy/whisper-large-v3-malayalam-ct2`) | Hugging Face Hub | MIT / Open | Open model weights | CPU (INT8) ~2.5GB RAM | High accuracy for Malayalam spoken audio; can be loaded via `faster-whisper`. |

---

## 3. Machine Translation Providers

| Model / Library | Repository / Source | License | Weights License | Hardware Needs | Malayalam-to-English Suitability & Notes |
|---|---|---|---|---|---|
| **NLLB-200 Distilled 600M** (`facebook/nllb-200-distilled-600M`) | Hugging Face / Meta | MIT (Transformers) | CC-BY-NC 4.0 (Non-Commercial) | CPU ~2GB RAM | **Primary Local Evaluation Model.** Supports `mal_Mlym` (Malayalam) to `eng_Latn` (English). Sentence-level translation prevents degradation. Note: CC-BY-NC 4.0 license is restricted to non-commercial use. |
| **Whisper Translate Task** (`task="translate"`) | OpenAI / faster-whisper | MIT | MIT | Same as ASR | Transcribes Malayalam directly into English subtitles. Useful for cross-checking, but loses Malayalam transcript review step. |
| **IndicTrans2** (AI4Bharat) | [AI4Bharat/IndicTrans2](https://github.com/AI4Bharat/IndicTrans2) | MIT | CC-BY 4.0 (Commercial allowed with attribution) | 1B model requires ~4-6GB RAM | Highest domain accuracy for Indian languages, but requires complex tokenizers (`indic-nlp-library`). |

---

## 4. Media Processing

| Component | Source | License | Hardware Needs | Decision & Rationale |
|---|---|---|---|---|
| **FFmpeg & FFprobe** | [ffmpeg.org](https://ffmpeg.org/) | LGPL v2.1+ / GPL v2+ (depending on build) | Native binary | **Required.** Fast, secure audio extraction (`pcm_s16le`, 16kHz mono) and media validation without loading entire video into RAM. Subprocess calls must use safe argument vectors. |

---

## 5. Backend & Core Architecture

| Component | Source | License | Hardware Needs | Decision & Rationale |
|---|---|---|---|---|
| **FastAPI** | [tiangolo/fastapi](https://github.com/tiangolo/fastapi) | MIT | Lightweight Python | High performance async REST API with Pydantic validation. |
| **Pydantic v2** | [pydantic/pydantic](https://github.com/pydantic/pydantic) | MIT | Python runtime | Strict data contract validation. |
| **Vitest** | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) | MIT | Node.js | Fast unit testing for TypeScript packages (`subtitle-core`). |
| **pytest** | [pytest-dev/pytest](https://github.com/pytest-dev/pytest) | MIT | Python | Backend unit and integration tests. |
