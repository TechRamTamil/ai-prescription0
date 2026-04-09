"""
ml_service.py  –  ML inference for handwritten digit recognition.
Loads the trained CNN model once and exposes predict_digit().
"""

import os
import io
import logging
from typing import Dict, Any, Optional

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# ── Load model at module import time ──────────────────────────────────────────
_model = None
_MODEL_PATH = os.path.join(os.path.dirname(__file__), "handwriting_model.h5")


def _load_model():
    """Lazily load the TensorFlow model (avoids import at top-level for speed)."""
    global _model
    if _model is not None:
        return _model

    if not os.path.exists(_MODEL_PATH):
        logger.warning(
            "handwriting_model.h5 not found. "
            "Run `python train_model.py` to generate it."
        )
        return None

    try:
        # Import TF only when needed
        os.environ.setdefault("CUDA_VISIBLE_DEVICES", "-1")
        import tensorflow as tf
        _model = tf.keras.models.load_model(_MODEL_PATH)
        logger.info("✅ Handwriting model loaded from %s", _MODEL_PATH)
        return _model
    except Exception as e:
        logger.error("Failed to load handwriting model: %s", e)
        return None


def _preprocess_image(image_bytes: bytes) -> Optional[np.ndarray]:
    """
    Convert raw image bytes → (1, 28, 28, 1) float32 array.
    Accepts PNG, JPEG, WebP, BMP, TIFF, GIF.
    Handles palette (P), RGBA, and all other modes via convert("L").
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))

        # Handle palette / transparency modes before grayscale conversion
        if img.mode in ("P", "RGBA"):
            img = img.convert("RGBA").convert("L")
        else:
            img = img.convert("L")

        arr_raw = np.array(img)

        # Auto-invert: if background is mostly light, flip so digit is white-on-black
        if arr_raw.mean() > 127:
            from PIL import ImageOps
            img = ImageOps.invert(img)

        img = img.resize((28, 28), Image.LANCZOS)
        arr = np.array(img, dtype="float32") / 255.0
        arr = arr[np.newaxis, ..., np.newaxis]  # → (1, 28, 28, 1)
        return arr
    except Exception as e:
        logger.error("Image preprocessing error: %s", e, exc_info=True)
        import traceback
        with open("error_log.txt", "a") as f:
            f.write(f"Image Error: {str(e)}\n{traceback.format_exc()}\n")
        return None


def predict_digit(image_bytes: bytes) -> Dict[str, Any]:
    """
    Predict the handwritten digit in the given image.

    Returns:
        {
            "digit": int,
            "confidence": float,
            "all_probabilities": [float × 10],
            "model_available": bool
        }
    """
    model = _load_model()

    if model is None:
        # Graceful fallback if model not trained yet
        return {
            "digit": -1,
            "confidence": 0.0,
            "all_probabilities": [0.1] * 10,
            "model_available": False,
            "message": "Model not found. Please run `python train_model.py` first."
        }

    arr = _preprocess_image(image_bytes)
    if arr is None:
        return {
            "digit": None,
            "confidence": 0.0,
            "all_probabilities": [],
            "model_available": True,
            "success": False,
            "message": "Could not read the uploaded image. Please upload a clear PNG or JPEG of a single handwritten digit."
        }

    probs = model.predict(arr, verbose=0)[0]          # shape: (10,)
    digit = int(np.argmax(probs))
    confidence = float(probs[digit])

    return {
        "digit": digit,
        "confidence": round(confidence, 4),
        "all_probabilities": [round(float(p), 4) for p in probs],
        "model_available": True,
        "success": True,
    }
