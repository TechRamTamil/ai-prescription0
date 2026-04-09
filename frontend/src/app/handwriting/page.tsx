"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PredictionResult {
  digit: number | null;
  confidence: number;
  all_probabilities: number[];
  model_available: boolean;
  success?: boolean;
  message?: string;
}

const DIGIT_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#06b6d4",
];

export default function HandwritingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize canvas with black background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPosition = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPosition(e, canvas);
    setIsDrawing(true);
    setLastPos(pos);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getPosition(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setLastPos(pos);
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPrediction(null);
    setError(null);
    setHasDrawn(false);
    setUploadedFile(null);
  };

  const predict = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const formData = new FormData();

      if (uploadedFile) {
        formData.append("file", uploadedFile);
      } else {
        // Convert canvas to blob
        const canvas = canvasRef.current!;
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas empty"))), "image/png")
        );
        formData.append("file", blob, "digit.png");
      }

      const res = await fetch(`${API_BASE}/ai/analyze-handwriting`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to analyze image");
      }

      const data: PredictionResult = await res.json();
      setPrediction(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, [uploadedFile]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setHasDrawn(true);
    setPrediction(null);

    // Preview the image on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Center image on canvas
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const topDigit = prediction
    ? [...(prediction.all_probabilities || [])].map((p, i) => ({ digit: i, prob: p })).sort((a, b) => b.prob - a.prob).slice(0, 3)
    : [];

  return (
    <div className="hw-root">
      {/* Header */}
      <div className="hw-header">
        <div className="hw-header-icon">✍️</div>
        <div>
          <h1 className="hw-title">Digit Handwriting Analysis</h1>
          <p className="hw-subtitle">Draw a digit (0–9) or upload an image — our CNN model predicts it instantly</p>
        </div>
        <a href="/doctor" className="hw-back-btn">← Back to Dashboard</a>
      </div>

      {/* Main grid */}
      <div className="hw-grid">

        {/* Left: Canvas */}
        <div className="hw-card hw-canvas-card">
          <div className="hw-card-header">
            <span className="hw-badge">Draw Here</span>
            <p className="hw-card-hint">Write a single digit (0–9) with your mouse or finger</p>
          </div>

          <div className="hw-canvas-wrapper">
            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              className="hw-canvas"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
          </div>

          <div className="hw-actions">
            <button onClick={clearCanvas} className="hw-btn hw-btn-ghost">🗑 Clear</button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hw-btn hw-btn-outline"
            >
              📁 Upload Image
            </button>
            <button
              onClick={predict}
              disabled={!hasDrawn || loading}
              className="hw-btn hw-btn-primary"
            >
              {loading ? (
                <span className="hw-spinner-text"><span className="hw-spinner" /> Analyzing…</span>
              ) : "🔍 Predict"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
          </div>

          {!hasDrawn && (
            <p className="hw-tip">💡 Draw a digit on the black canvas above, then click Predict</p>
          )}
          {uploadedFile && (
            <p className="hw-tip">📎 Using uploaded: <strong>{uploadedFile.name}</strong></p>
          )}
        </div>

        {/* Right: Result */}
        <div className="hw-card hw-result-card">
          <div className="hw-card-header">
            <span className="hw-badge hw-badge-result">Prediction Result</span>
          </div>

          {!prediction && !error && !loading && (
            <div className="hw-empty">
              <div className="hw-empty-icon">🤖</div>
              <p>Draw a digit and click <strong>Predict</strong></p>
              <p className="hw-empty-sub">CNN trained on 60,000 MNIST samples</p>
            </div>
          )}

          {loading && (
            <div className="hw-empty">
              <div className="hw-pulse-ring" />
              <p style={{ marginTop: "1.5rem" }}>Analyzing your handwriting…</p>
            </div>
          )}

          {error && (
            <div className="hw-error">
              <div className="hw-error-icon">
                {error.toLowerCase().includes("fetch") || error.toLowerCase().includes("network") ? "🔌" : "⚠️"}
              </div>
              {error.toLowerCase().includes("fetch") || error.toLowerCase().includes("network") ? (
                <>
                  <p><strong>Backend not reachable</strong></p>
                  <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Make sure the FastAPI server is running:</p>
                  <code className="hw-code">uvicorn main:app --reload --port 8000</code>
                </>
              ) : error.toLowerCase().includes("process") || error.toLowerCase().includes("image") ? (
                <>
                  <p><strong>Image could not be processed</strong></p>
                  <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Make sure the model is trained first, then restart the backend.</p>
                  <code className="hw-code">python train_model.py</code>
                </>
              ) : (
                <>
                  <p><strong>Error:</strong> {error}</p>
                </>
              )}
            </div>
          )}

          {prediction && !loading && (
            <>
              {/* Model not available */}
              {!prediction.model_available ? (
                <div className="hw-error">
                  <div className="hw-error-icon">🏋️</div>
                  <p><strong>Model not trained yet</strong></p>
                  <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Run this once in your backend folder:</p>
                  <code className="hw-code">python train_model.py</code>
                </div>

              /* Image processing failed */
              ) : prediction.success === false ? (
                <div className="hw-error">
                  <div className="hw-error-icon">🖼️</div>
                  <p><strong>Image could not be read</strong></p>
                  <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                    {prediction.message || "Please upload a clear PNG or JPEG of a single handwritten digit (0–9)."}
                  </p>
                </div>

              /* Success — show prediction */
              ) : prediction.digit !== null && prediction.digit >= 0 ? (
                <>
                  <div className="hw-result-hero">
                    <div
                      className="hw-digit-circle"
                      style={{ background: `linear-gradient(135deg, ${DIGIT_COLORS[prediction.digit]}, ${DIGIT_COLORS[(prediction.digit + 3) % 10]})` }}
                    >
                      {prediction.digit}
                    </div>
                    <div>
                      <p className="hw-result-label">Predicted Digit</p>
                      <p className="hw-confidence-val">{(prediction.confidence * 100).toFixed(1)}% confident</p>
                    </div>
                  </div>

                  {/* Confidence bar for predicted digit */}
                  <div className="hw-conf-bar-wrap">
                    <div className="hw-conf-bar-track">
                      <div
                        className="hw-conf-bar-fill"
                        style={{
                          width: `${(prediction.confidence * 100).toFixed(1)}%`,
                          background: `linear-gradient(90deg, ${DIGIT_COLORS[prediction.digit]}, ${DIGIT_COLORS[(prediction.digit + 3) % 10]})`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Top 3 */}
                  <p className="hw-section-title">Top Predictions</p>
                  <div className="hw-top3">
                    {topDigit.map(({ digit, prob }, rank) => (
                      <div key={digit} className={`hw-top3-item ${rank === 0 ? "hw-top3-winner" : ""}`}>
                        <div className="hw-top3-rank">#{rank + 1}</div>
                        <div
                          className="hw-top3-digit"
                          style={{ color: DIGIT_COLORS[digit] }}
                        >{digit}</div>
                        <div className="hw-top3-bar-wrap">
                          <div className="hw-top3-bar-track">
                            <div
                              className="hw-top3-bar-fill"
                              style={{ width: `${(prob * 100).toFixed(1)}%`, background: DIGIT_COLORS[digit] }}
                            />
                          </div>
                          <span className="hw-top3-pct">{(prob * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* All 10 digits probability */}
                  <p className="hw-section-title">All Digit Probabilities</p>
                  <div className="hw-all-probs">
                    {prediction.all_probabilities.map((prob, digit) => (
                      <div key={digit} className="hw-prob-item">
                        <div
                          className="hw-prob-bar"
                          style={{
                            height: `${Math.max(4, prob * 100)}%`,
                            background: digit === prediction.digit
                              ? `linear-gradient(180deg, ${DIGIT_COLORS[digit]}, ${DIGIT_COLORS[(digit + 3) % 10]})`
                              : "#334155",
                          }}
                        />
                        <span className="hw-prob-label">{digit}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="hw-error">
                  <div className="hw-error-icon">⚠️</div>
                  <p>Unexpected result from server. Please try again.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="hw-how-section">
        <h2 className="hw-how-title">How It Works</h2>
        <div className="hw-how-grid">
          {[
            { icon: "🖊️", step: "1", title: "Draw or Upload", desc: "Write a single digit on the canvas or upload a handwritten image" },
            { icon: "⚙️", step: "2", title: "CNN Processing", desc: "The image is resized to 28×28, normalized, and fed into our trained CNN" },
            { icon: "🧠", step: "3", title: "Model Inference", desc: "5-layer CNN (60K MNIST samples, ~99% accuracy) predicts the digit" },
            { icon: "📊", step: "4", title: "Result & Confidence", desc: "See the predicted digit, confidence score, and class-wise probabilities" },
          ].map(({ icon, step, title, desc }) => (
            <div key={step} className="hw-how-card">
              <div className="hw-how-icon">{icon}</div>
              <div className="hw-how-step">Step {step}</div>
              <h3 className="hw-how-card-title">{title}</h3>
              <p className="hw-how-card-desc">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .hw-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          padding: 2rem;
          font-family: 'Inter', sans-serif;
          color: #f1f5f9;
        }
        .hw-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .hw-header-icon {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 16px;
          width: 60px; height: 60px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .hw-title {
          font-size: 1.75rem; font-weight: 700;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0;
        }
        .hw-subtitle { color: #94a3b8; margin: 0.25rem 0 0; font-size: 0.9rem; }
        .hw-back-btn {
          margin-left: auto;
          padding: 0.5rem 1rem;
          border: 1px solid #334155;
          border-radius: 8px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .hw-back-btn:hover { border-color: #6366f1; color: #a5b4fc; }

        .hw-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        @media (max-width: 768px) { .hw-grid { grid-template-columns: 1fr; } }

        .hw-card {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 20px;
          padding: 1.5rem;
        }
        .hw-card-header { margin-bottom: 1rem; }
        .hw-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        .hw-badge-result { background: linear-gradient(135deg, #14b8a6, #3b82f6); }
        .hw-card-hint { color: #94a3b8; font-size: 0.85rem; margin: 0; }

        .hw-canvas-wrapper {
          display: flex; justify-content: center;
          background: #000; border-radius: 12px;
          border: 2px solid #334155;
          overflow: hidden; margin-bottom: 1rem;
          box-shadow: 0 0 30px rgba(99,102,241,0.15) inset;
        }
        .hw-canvas {
          cursor: crosshair; display: block;
          max-width: 100%; max-height: 280px;
          touch-action: none;
        }

        .hw-actions {
          display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;
        }
        .hw-btn {
          flex: 1; min-width: 80px;
          padding: 0.6rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem; font-weight: 600;
          cursor: pointer; border: none;
          transition: all 0.2s; white-space: nowrap;
        }
        .hw-btn-ghost {
          background: rgba(51,65,85,0.5); color: #94a3b8;
        }
        .hw-btn-ghost:hover { background: rgba(51,65,85,0.9); color: #f1f5f9; }
        .hw-btn-outline {
          background: transparent; color: #a5b4fc;
          border: 1px solid #6366f1 !important;
        }
        .hw-btn-outline:hover { background: rgba(99,102,241,0.1); }
        .hw-btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
        }
        .hw-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .hw-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .hw-spinner-text { display: flex; align-items: center; gap: 0.5rem; justify-content: center; }
        .hw-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: hw-spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes hw-spin { to { transform: rotate(360deg); } }
        .hw-tip { color: #64748b; font-size: 0.8rem; margin: 0; text-align: center; }

        /* Result card */
        .hw-empty {
          text-align: center; padding: 3rem 1rem; color: #64748b;
        }
        .hw-empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }
        .hw-empty-sub { font-size: 0.8rem; margin: 0.25rem 0 0; }

        .hw-pulse-ring {
          width: 60px; height: 60px;
          border-radius: 50%;
          border: 3px solid #6366f1;
          animation: hw-pulse 1s ease infinite;
          margin: 0 auto;
        }
        @keyframes hw-pulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .hw-error {
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
          border-radius: 12px; padding: 1rem; text-align: center;
          color: #fca5a5;
        }
        .hw-error-icon { font-size: 2rem; }
        .hw-code {
          display: block; margin-top: 0.5rem;
          background: #0f172a; padding: 0.5rem 1rem;
          border-radius: 8px; font-size: 0.8rem; color: #34d399;
          font-family: monospace;
        }

        .hw-result-hero {
          display: flex; align-items: center; gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .hw-digit-circle {
          width: 90px; height: 90px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem; font-weight: 800; color: #fff;
          flex-shrink: 0;
          box-shadow: 0 8px 32px rgba(99,102,241,0.4);
        }
        .hw-result-label { color: #94a3b8; font-size: 0.85rem; margin: 0; }
        .hw-confidence-val { font-size: 1.5rem; font-weight: 700; margin: 0; color: #f1f5f9; }

        .hw-conf-bar-wrap { margin-bottom: 1.5rem; }
        .hw-conf-bar-track {
          height: 10px; background: #1e293b; border-radius: 999px; overflow: hidden;
        }
        .hw-conf-bar-fill {
          height: 100%; border-radius: 999px;
          transition: width 0.8s ease;
        }

        .hw-section-title {
          font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em;
          color: #64748b; margin: 0 0 0.75rem; font-weight: 600;
        }
        .hw-top3 { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
        .hw-top3-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-radius: 10px;
          background: rgba(15,23,42,0.4);
        }
        .hw-top3-winner { border: 1px solid rgba(99,102,241,0.3); }
        .hw-top3-rank { font-size: 0.7rem; color: #64748b; width: 20px; }
        .hw-top3-digit { font-size: 1.2rem; font-weight: 700; width: 16px; }
        .hw-top3-bar-wrap { display: flex; align-items: center; gap: 0.5rem; flex: 1; }
        .hw-top3-bar-track { flex: 1; height: 6px; background: #1e293b; border-radius: 999px; overflow: hidden; }
        .hw-top3-bar-fill { height: 100%; border-radius: 999px; transition: width 0.6s ease; }
        .hw-top3-pct { font-size: 0.75rem; color: #94a3b8; min-width: 40px; text-align: right; }

        .hw-all-probs {
          display: flex; gap: 6px; align-items: flex-end; height: 80px;
          padding: 0 0.25rem;
        }
        .hw-prob-item {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; gap: 4px; height: 100%;
          justify-content: flex-end;
        }
        .hw-prob-bar {
          width: 100%; border-radius: 4px 4px 0 0;
          transition: height 0.6s ease;
          min-height: 4px;
        }
        .hw-prob-label { font-size: 0.7rem; color: #64748b; }

        /* How it works */
        .hw-how-section { margin-top: 1rem; }
        .hw-how-title {
          font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem;
          color: #e2e8f0;
        }
        .hw-how-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .hw-how-card {
          background: rgba(30,41,59,0.6); border: 1px solid rgba(99,102,241,0.15);
          border-radius: 16px; padding: 1.25rem;
          transition: transform 0.2s, border-color 0.2s;
        }
        .hw-how-card:hover { transform: translateY(-3px); border-color: rgba(99,102,241,0.4); }
        .hw-how-icon { font-size: 1.75rem; margin-bottom: 0.75rem; }
        .hw-how-step { font-size: 0.7rem; color: #6366f1; font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem; }
        .hw-how-card-title { font-size: 0.95rem; font-weight: 600; margin: 0 0 0.5rem; }
        .hw-how-card-desc { font-size: 0.8rem; color: #94a3b8; margin: 0; line-height: 1.5; }
      `}</style>
    </div>
  );
}
