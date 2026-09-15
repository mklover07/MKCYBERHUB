--- src/components/AIVisionEngine.tsx (原始)


+++ src/components/AIVisionEngine.tsx (修改后)
import { useState, useRef, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

interface Detection {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

export default function AIVisionEngine() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [isRunning, setIsRunning] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [fps, setFps] = useState(0);
  const [objectCount, setObjectCount] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [currentFacing, setCurrentFacing] = useState<'environment' | 'user'>('environment');
  const [error, setError] = useState('');

  // Load model on mount
  useEffect(() => {
    loadModel();
    return () => {
      stopCamera();
    };
  }, []);

  const loadModel = async () => {
    try {
      setModelStatus('loading');
      await tf.ready();
      const model = await cocoSsd.load({
        base: 'lite_mobilenet_v2',
      });
      modelRef.current = model;
      setModelStatus('ready');
    } catch (err) {
      console.error('Model loading failed:', err);
      setModelStatus('failed');
      setError('Failed to load AI model. Please refresh the page.');
    }
  };

  const startCamera = async () => {
    if (!videoRef.current) return;
    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacing,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setIsRunning(true);
      lastTimeRef.current = performance.now();
      frameCountRef.current = 0;
      detectFrame();
    } catch (err: any) {
      console.error('Camera error:', err);
      setError(`Camera access denied: ${err.message || 'Please allow camera access'}`);
      setIsRunning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsRunning(false);
    setDetections([]);
    setObjectCount(0);
    setAvgConfidence(0);
    setFps(0);

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const switchCamera = async () => {
    const newFacing = currentFacing === 'environment' ? 'user' : 'environment';
    setCurrentFacing(newFacing);

    if (isRunning) {
      stopCamera();
      setTimeout(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: newFacing,
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setIsRunning(true);
            lastTimeRef.current = performance.now();
            frameCountRef.current = 0;
            detectFrame();
          }
        } catch (err: any) {
          setError(`Camera switch failed: ${err.message}`);
        }
      }, 500);
    }
  };

  const detectFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !modelRef.current || !isRunning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== 4) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      const predictions = await modelRef.current.detect(video);
      const filtered = predictions.filter((p) => p.score > 0.35);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw detections
      filtered.forEach((prediction) => {
        const [x, y, width, height] = prediction.bbox;

        // Draw bounding box
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw label background
        const label = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
        ctx.font = '14px Inter, sans-serif';
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(0, 212, 255, 0.8)';
        ctx.fillRect(x, y - 24, textWidth + 10, 24);

        // Draw label text
        ctx.fillStyle = '#000';
        ctx.fillText(label, x + 5, y - 7);
      });

      // Update stats
      setDetections(filtered);
      setObjectCount(filtered.length);
      const avg = filtered.length > 0
        ? filtered.reduce((sum, d) => sum + d.score, 0) / filtered.length
        : 0;
      setAvgConfidence(Math.round(avg * 100));

      // Calculate FPS
      frameCountRef.current++;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;
      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
    } catch (err) {
      console.error('Detection error:', err);
    }

    // Continue detection loop
    setTimeout(() => {
      animFrameRef.current = requestAnimationFrame(detectFrame);
    }, 100);
  }, [isRunning]);

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h2 className="section-title">
        <i className="fas fa-eye"></i>
        <span className="gradient-text">AI Vision Engine</span>
      </h2>

      {/* Model Status */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`status-dot ${modelStatus === 'ready' ? 'status-dot-green' : modelStatus === 'failed' ? 'status-dot-red' : 'status-dot-yellow'}`}></span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          AI Model: {modelStatus === 'loading' ? '⏳ Loading...' : modelStatus === 'ready' ? '✅ Ready' : '❌ Failed'}
        </span>
        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
          COCO-SSD • 80+ Objects
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: 'var(--danger)' }}>
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      )}

      {/* Camera Feed */}
      <div className="camera-container mb-4">
        <video ref={videoRef} muted playsInline style={{ display: isRunning ? 'block' : 'none' }} />
        <canvas ref={canvasRef} style={{ display: isRunning ? 'block' : 'none' }} />
        <div className="scan-overlay" style={{ display: isRunning ? 'block' : 'none' }}>
          <div className="scan-line"></div>
        </div>
        {!isRunning && (
          <div className="flex items-center justify-center" style={{ height: '360px', background: 'rgba(0,0,0,0.5)' }}>
            <div className="text-center">
              <i className="fas fa-camera text-4xl mb-3" style={{ color: 'var(--text-muted)' }}></i>
              <p style={{ color: 'var(--text-muted)' }}>Camera inactive</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Click START to begin detection</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        {!isRunning ? (
          <button
            className="cyber-btn cyber-btn-success"
            onClick={startCamera}
            disabled={modelStatus !== 'ready'}
          >
            <i className="fas fa-play mr-2"></i>START
          </button>
        ) : (
          <button className="cyber-btn cyber-btn-danger" onClick={stopCamera}>
            <i className="fas fa-stop mr-2"></i>STOP
          </button>
        )}
        <button className="cyber-btn cyber-btn-accent" onClick={switchCamera}>
          <i className="fas fa-sync-alt mr-2"></i>SWITCH CAMERA
        </button>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="dashboard-stat">
          <div className="dashboard-stat-value">{objectCount}</div>
          <div className="dashboard-stat-label">Objects</div>
        </div>
        <div className="dashboard-stat">
          <div className="dashboard-stat-value">{avgConfidence}%</div>
          <div className="dashboard-stat-label">Confidence</div>
        </div>
        <div className="dashboard-stat">
          <div className="dashboard-stat-value">{fps}</div>
          <div className="dashboard-stat-label">FPS</div>
        </div>
        <div className="dashboard-stat">
          <div className="dashboard-stat-value" style={{ color: modelStatus === 'ready' ? 'var(--success)' : 'var(--danger)' }}>
            {modelStatus === 'ready' ? '●' : '○'}
          </div>
          <div className="dashboard-stat-label">AI Status</div>
        </div>
      </div>

      {/* Detected Objects List */}
      {detections.length > 0 && (
        <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,212,255,0.1)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <i className="fas fa-list mr-1"></i> Detected Objects
          </p>
          <div className="flex flex-wrap gap-2">
            {detections.map((d, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded text-xs font-medium"
                style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: 'var(--primary)' }}
              >
                {d.class} ({Math.round(d.score * 100)}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
