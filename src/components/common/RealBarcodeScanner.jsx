// components/RealBarcodeScanner.jsx
import { useCallback, useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import Quagga from "@ericblade/quagga2";

const RealBarcodeScanner = ({ onScan, onClose, partName }) => {
  const webcamRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const initScanner = useCallback(async () => {
    if (!webcamRef.current?.video) {
      setDebugInfo("Waiting for video element...");
      return;
    }

    try {
      setScanning(true);
      setCameraError(null);
      setDebugInfo("Initializing scanner...");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const video = webcamRef.current.video;

      const config = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: video,
          constraints: {
            width: { min: 1280, ideal: 1920, max: 2560 },
            height: { min: 720, ideal: 1080, max: 1440 },
            facingMode: "environment",
            aspectRatio: { ideal: 1.7777777778 },
          },
          area: {
            top: "10%",
            right: "5%",
            left: "5%",
            bottom: "10%",
          },
        },
        frequency: 15,
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
          ],
        },
        locator: {
          patchSize: "large",
          halfSample: false,
        },
        numOfWorkers: 4,
        locate: true,
        src: null,
      };

      Quagga.init(config, (err) => {
        if (err) {
          console.error("Quagga init error:", err);
          setCameraError(`Scanner init failed: ${err.message}`);
          setScanning(false);

          if (retryCount < 3) {
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
              initScanner();
            }, 2000);
          }
          return;
        }

        setDebugInfo("Scanner initialized");
        Quagga.start();
        setScanning(true);

        Quagga.onDetected((result) => {
          console.log("Barcode detected:", result);

          if (result?.codeResult?.code) {
            const barcode = result.codeResult.code.trim();
            const format = result.codeResult.format;

            setDebugInfo(`Detected: ${barcode} (${format})`);

            setTimeout(() => {
              Quagga.stop();
              setScanning(false);
              onScan(barcode);
            }, 500);
          }
        });

        Quagga.onProcessed((result) => {
          if (result) {
            const drawingCtx = Quagga.canvas.ctx.overlay;
            const drawingCanvas = Quagga.canvas.dom.overlay;

            if (!drawingCtx || !drawingCanvas) return;

            drawingCtx.clearRect(
              0,
              0,
              drawingCanvas.width,
              drawingCanvas.height
            );

            const canvasWidth = drawingCanvas.width;
            const canvasHeight = drawingCanvas.height;

            drawingCtx.strokeStyle = "#00FF00";
            drawingCtx.lineWidth = 2;
            drawingCtx.setLineDash([5, 5]);
            drawingCtx.strokeRect(
              canvasWidth * 0.05,
              canvasHeight * 0.1,
              canvasWidth * 0.9,
              canvasHeight * 0.8
            );
            drawingCtx.setLineDash([]);

            if (result.box) {
              drawingCtx.strokeStyle = "#FF0000";
              drawingCtx.lineWidth = 3;
              drawingCtx.strokeRect(
                result.box[0],
                result.box[1],
                result.box[2] - result.box[0],
                result.box[3] - result.box[1]
              );
            }
          }
        });
      });
    } catch (error) {
      console.error("Scanner error:", error);
      setCameraError(`Scanner error: ${error.message}`);
      setScanning(false);
    }
  }, [onScan, retryCount]);

  const testWithMockBarcode = () => {
    const testBarcodes = [
      "1234567890128",
      "12345678",
      "ABC123DEF",
      "123456789012",
      "BOSCH-SMG180-001",
      "SN-2024-001-ABC",
    ];
    const randomBarcode =
      testBarcodes[Math.floor(Math.random() * testBarcodes.length)];
    setDebugInfo(`🧪 TEST: Using mock barcode: ${randomBarcode}`);

    setTimeout(() => {
      onScan(randomBarcode);
    }, 1000);
  };

  const manualInput = () => {
    const manualCode = prompt("Enter barcode manually:");
    if (manualCode && manualCode.trim()) {
      setDebugInfo(`Manual input: ${manualCode}`);
      onScan(manualCode.trim());
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      initScanner();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (Quagga) {
        Quagga.stop();
        Quagga.offDetected();
        Quagga.offProcessed();
      }
    };
  }, [initScanner]);

  const videoConstraints = {
    facingMode: "environment",
    width: { ideal: 1920, max: 2560 },
    height: { ideal: 1080, max: 1440 },
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
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full h-80 object-cover"
          onUserMedia={() => {
            setDebugInfo("✅ Camera access granted - Wide area ready");
            console.log("Webcam initialized successfully");
          }}
          onUserMediaError={(error) => {
            console.error("Webcam error:", error);
            setCameraError(`❌ Camera error: ${error.message}`);
            setScanning(false);
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-green-500 w-4/5 h-3/4 rounded-lg relative animate-pulse">
            <div className="absolute -top-8 left-0 right-0 text-center text-white font-semibold text-sm bg-black bg-opacity-70 rounded px-2 py-1">
              Position anywhere in green box
            </div>
            <div className="absolute -bottom-8 left-0 right-0 text-center text-white text-xs bg-black bg-opacity-70 rounded px-2 py-1">
              No need to center perfectly - Just keep in green area
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
          <strong>Status:</strong>{" "}
          {debugInfo || "Initializing wide area scanner..."}
        </div>
        {retryCount > 0 && (
          <div className="text-xs text-orange-600 mt-1">
            Retry attempt: {retryCount}/3
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={testWithMockBarcode}
          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition"
        >
          Test with Mock
        </button>
        <button
          onClick={manualInput}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition"
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
              className="flex-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
            <button
              onClick={manualInput}
              className="flex-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Manual Input
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => {
            if (Quagga) {
              Quagga.stop();
            }
            onClose();
          }}
          className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition font-medium text-sm"
        >
          Close
        </button>
        <button
          onClick={initScanner}
          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
        >
          Restart Scanner
        </button>
      </div>
    </div>
  );
};

export default RealBarcodeScanner;
