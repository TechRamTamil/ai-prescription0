"""
train_model.py  –  Train a CNN on MNIST digit data and save the model.
Run once:  python train_model.py
Output:    handwriting_model.h5
"""

import os
import numpy as np

# Use CPU only (no GPU required)
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.datasets import mnist
from tensorflow.keras.utils import to_categorical

print("TensorFlow version:", tf.__version__)
print("Loading MNIST dataset...")

# ── Load & preprocess ──────────────────────────────────────────────────────────
(x_train, y_train), (x_test, y_test) = mnist.load_data()

# Normalize pixel values to [0, 1] and reshape for CNN (N, 28, 28, 1)
x_train = x_train.astype("float32") / 255.0
x_test  = x_test.astype("float32") / 255.0
x_train = x_train[..., np.newaxis]   # shape: (60000, 28, 28, 1)
x_test  = x_test[..., np.newaxis]

# One-hot encode labels
y_train_oh = to_categorical(y_train, 10)
y_test_oh  = to_categorical(y_test,  10)

# ── Build CNN ──────────────────────────────────────────────────────────────────
model = models.Sequential([
    layers.Conv2D(32, (3, 3), activation="relu", input_shape=(28, 28, 1)),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(64, (3, 3), activation="relu"),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(128, (3, 3), activation="relu"),
    layers.BatchNormalization(),

    layers.Flatten(),
    layers.Dropout(0.4),
    layers.Dense(256, activation="relu"),
    layers.Dropout(0.3),
    layers.Dense(10, activation="softmax"),   # 10 digit classes
])

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# ── Train ──────────────────────────────────────────────────────────────────────
print("\nTraining model (this may take a few minutes)...")

callbacks = [
    tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=3, restore_best_weights=True),
    tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, verbose=1),
]

history = model.fit(
    x_train, y_train_oh,
    epochs=15,
    batch_size=128,
    validation_split=0.1,
    callbacks=callbacks,
    verbose=1,
)

# ── Evaluate ───────────────────────────────────────────────────────────────────
loss, acc = model.evaluate(x_test, y_test_oh, verbose=0)
print(f"\n✅  Test accuracy: {acc * 100:.2f}%")

# ── Save ───────────────────────────────────────────────────────────────────────
model_path = os.path.join(os.path.dirname(__file__), "handwriting_model.h5")
model.save(model_path)
print(f"✅  Model saved to: {model_path}")
