import traceback
import sys

try:
    print("Importing faster_whisper...")
    from faster_whisper import WhisperModel
    print("Loading WhisperModel tiny...")
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    print("Model loaded successfully!")
    print("Transcribing audio...")
    segments, info = model.transcribe(
        ".local-data/projects/proj_ba8969f1/audio.wav",
        language="ml"
    )
    print(f"Detected language: {info.language} with prob {info.language_probability:.2f}")
    seg_list = list(segments)
    print(f"Segments found: {len(seg_list)}")
    for s in seg_list:
        print(f"[{s.start:.2f}s -> {s.end:.2f}s]: {s.text}")
except Exception as e:
    print("Exception occurred:")
    traceback.print_exc()
    sys.exit(1)
