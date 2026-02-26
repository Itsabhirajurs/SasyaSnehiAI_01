"""Train MobileNetV2 transfer-learning model for plant disease classification."""

import argparse
import json
from pathlib import Path

import tensorflow as tf


def build_model(num_classes: int) -> tf.keras.Model:
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False

    # Data augmentation for real-world robustness
    augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.15),
        tf.keras.layers.RandomZoom(0.15),
        tf.keras.layers.RandomBrightness(0.2),
        tf.keras.layers.RandomContrast(0.2),
    ], name="augmentation")

    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = augmentation(inputs)
    x = tf.keras.layers.Rescaling(scale=1.0 / 127.5, offset=-1.0)(x)
    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.4)(x)
    x = tf.keras.layers.Dense(256, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)

    model = tf.keras.models.Model(inputs, outputs)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def fine_tune_model(model: tf.keras.Model, num_unfreeze: int = 30) -> tf.keras.Model:
    """Unfreeze last N layers of base model for fine-tuning."""
    base_model = model.layers[4]  # augmentation, rescaling, base_model index may vary
    # Find MobileNetV2 layer
    for layer in model.layers:
        if isinstance(layer, tf.keras.applications.MobileNetV2.__class__) or 'mobilenet' in layer.name.lower():
            base_model = layer
            break
    base_model.trainable = True
    for layer in base_model.layers[:-num_unfreeze]:
        layer.trainable = False
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def main() -> None:
    parser = argparse.ArgumentParser(description="Train disease classifier")
    parser.add_argument("--data_dir", type=str, required=True, help="Dataset directory with class subfolders")
    parser.add_argument("--epochs", type=int, default=8, help="Training epochs (5-10 recommended)")
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--val_split", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--model_out", type=str, default="model/disease_model.keras")
    parser.add_argument("--class_map_out", type=str, default="model/class_names.json")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    if not data_dir.exists():
        raise FileNotFoundError(f"Dataset directory not found: {data_dir}")

    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        labels="inferred",
        label_mode="categorical",
        image_size=(224, 224),
        batch_size=args.batch_size,
        validation_split=args.val_split,
        subset="training",
        seed=args.seed,
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        labels="inferred",
        label_mode="categorical",
        image_size=(224, 224),
        batch_size=args.batch_size,
        validation_split=args.val_split,
        subset="validation",
        seed=args.seed,
    )

    class_names = train_ds.class_names

    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.shuffle(1000).prefetch(buffer_size=autotune)
    val_ds = val_ds.prefetch(buffer_size=autotune)

    model = build_model(num_classes=len(class_names))
    callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=3, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, min_lr=1e-6),
    ]

    print("Phase 1: Transfer learning (frozen base)...")
    model.fit(train_ds, validation_data=val_ds, epochs=args.epochs, callbacks=callbacks)

    print("Phase 2: Fine-tuning (unfreezing last 30 layers)...")
    model = fine_tune_model(model, num_unfreeze=30)
    fine_tune_callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=4, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=2, min_lr=1e-7),
    ]
    model.fit(train_ds, validation_data=val_ds, epochs=10, callbacks=fine_tune_callbacks)

    model_out = Path(args.model_out)
    class_map_out = Path(args.class_map_out)
    model_out.parent.mkdir(parents=True, exist_ok=True)
    class_map_out.parent.mkdir(parents=True, exist_ok=True)

    model.save(model_out)
    class_map_out.write_text(json.dumps(class_names, indent=2), encoding="utf-8")

    print(f"Saved model: {model_out}")
    print(f"Saved class map: {class_map_out}")


if __name__ == "__main__":
    main()
