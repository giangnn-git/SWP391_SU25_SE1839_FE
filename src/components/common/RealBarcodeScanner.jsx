// components/RealBarcodeScanner.jsx
import { useCallback, useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import Quagga from "@ericblade/quagga2";

const RealBarcodeScanner = ({ onScan, onClose, partName }) => {
  const webcamRef = useRef(null);
  const [deviceId, setDeviceId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Lấy danh sách camera
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cams = devices.filter((d) => d.kind === "videoinput");
      if (cams.length === 0) {
        setCameraError("Cannot found camera");
        return;
      }
      const preferred =
        cams.find((d) => d.label.toLowerCase().includes("back")) || cams[0];
      setDeviceId(preferred.deviceId);
    });
  }, []);

  // Init scanner
  const initScanner = useCallback(async () => {
    if (!webcamRef.current?.video?.srcObject) {
      setDebugInfo("Camera stream chưa sẵn sàng…");
      setTimeout(initScanner, 500);
      return;
    }

    try {
      setScanning(true);
      setCameraError(null);
      setDebugInfo("Initializing scanner…");
      await new Promise((resolve) => setTimeout(resolve, 500));
      const video = webcamRef.current.video;

      const config = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: video,
          constraints: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
            facingMode: "environment",
          },
          area: { top: "10%", right: "5%", left: "5%", bottom: "10%" },
        },
        frequency: 30,
        decoder: { readers: ["code_128_reader"] }, // chỉ quét Code 128
        locator: { patchSize: "large", halfSample: false },
        numOfWorkers: 4,
        locate: true,
      };

      Quagga.init(config, (err) => {
        if (err) {
          console.error("Quagga init error:", err);
          setCameraError("Scanner init failed: " + err.message);
          setScanning(false);
          if (retryCount < 3) {
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
              initScanner();
            }, 1500);
          }
          return;
        }

        setDebugInfo("Scanner initialized");
        Quagga.start();
        setScanning(true);

        Quagga.onDetected((result) => {
          if (result?.codeResult?.code) {
            const barcode = result.codeResult.code.trim();
            setDebugInfo(`Detected: ${barcode}`);
            setTimeout(() => {
              Quagga.stop();
              setScanning(false);
              onScan(barcode);
            }, 300);
          }
        });

        Quagga.onProcessed((result) => {
          const ctx = Quagga.canvas.ctx.overlay;
          const canvas = Quagga.canvas.dom.overlay;
          if (!ctx || !canvas) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (result && result.boxes) {
            ctx.strokeStyle = "#FF0000";
            result.boxes
              .filter((b) => b !== result.box)
              .forEach((b) => {
                ctx.beginPath();
                ctx.moveTo(b[0][0], b[0][1]);
                b.forEach((p) => ctx.lineTo(p[0], p[1]));
                ctx.closePath();
                ctx.stroke();
              });
          }

          if (result && result.box) {
            ctx.strokeStyle = "#00FF00";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(result.box[0][0], result.box[0][1]);
            result.box.forEach((p) => ctx.lineTo(p[0], p[1]));
            ctx.closePath();
            ctx.stroke();
          }
        });
      });
    } catch (error) {
      console.error("Scanner error:", error);
      setCameraError("Scanner error: " + error.message);
      setScanning(false);
    }
  }, [deviceId, retryCount, onScan]);

  // Stop scanner on unmount
  useEffect(() => {
    return () => {
      if (Quagga) {
        Quagga.stop();
        Quagga.offDetected();
        Quagga.offProcessed();
      }
    };
  }, []);

  const videoConstraints = deviceId
    ? { deviceId: { exact: deviceId } }
    : { width: 1280, height: 720 };

  // Mock / manual
  const testWithMockBarcode = () => {
    const codes = ["123456789012", "ABC123", "CODE128-TEST"];
    const random = codes[Math.floor(Math.random() * codes.length)];
    setDebugInfo("Mock: " + random);
    setTimeout(() => onScan(random), 1000);
  };

  const manualInput = () => {
    const code = prompt("Enter barcode manually:");
    if (code) onScan(code.trim());
  };

  return (
    <div className="real-barcode-scanner p-4 w-full">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Scan Serial Number</h3>
        <p className="text-sm text-gray-600">
          Part: <span className="font-semibold text-blue-700">{partName}</span>
        </p>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden mb-4 border-2 border-green-500 w-full">
        {deviceId ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            videoConstraints={videoConstraints}
            className="w-full h-80 object-cover"
            onUserMedia={() => setDebugInfo("Camera ready")}
            onUserMediaError={(err) => {
              console.error(err);
              setCameraError("Camera error: " + err.message);
            }}
          />
        ) : (
          <div className="text-white text-center py-20">Detecting camera…</div>
        )}

        {/* Green box overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-green-500 w-4/5 h-3/4 rounded-lg relative animate-pulse">
            <div className="absolute -top-8 left-0 right-0 text-center text-white font-semibold text-sm bg-black bg-opacity-70 rounded px-2 py-1">
              Position anywhere in green box
            </div>
            <div className="absolute -bottom-8 left-0 right-0 text-center text-white text-xs bg-black bg-opacity-70 rounded px-2 py-1">
              No need to center perfectly
            </div>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <canvas className="quagga-overlay w-full h-full" />
        </div>

        {scanning && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold">
            SCANNING...
          </div>
        )}
      </div>

      <div className="mb-3 p-3 bg-gray-100 rounded-lg border">
        <div className="text-xs font-mono text-gray-700 break-words">
          <strong>Status:</strong> {debugInfo || "Starting scanner..."}
        </div>
        {retryCount > 0 && (
          <div className="text-xs text-orange-600 mt-1">
            Retry: {retryCount}/3
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={testWithMockBarcode}
          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
        >
          Test with Mock
        </button>
        <button
          onClick={manualInput}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
        >
          Manual Input
        </button>
      </div>

      {cameraError && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm font-medium">{cameraError}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={initScanner}
              className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Try Again
            </button>
            <button
              onClick={manualInput}
              className="flex-1 px-3 py-1 bg-gray-600 text-white rounded text-sm"
            >
              Manual Input
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => {
            Quagga.stop();
            onClose();
          }}
          className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 text-sm"
        >
          Close
        </button>
        <button
          onClick={initScanner}
          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 text-sm"
        >
          Restart Scanner
        </button>
      </div>
    </div>
  );
};

export default RealBarcodeScanner;
