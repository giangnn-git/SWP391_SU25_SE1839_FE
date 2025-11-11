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

  // Initialize scanner - WIDER SCAN AREA
  const initScanner = useCallback(async () => {
    if (!webcamRef.current?.video) {
      setDebugInfo("Waiting for video element...");
      return;
    }

    try {
      setScanning(true);
      setCameraError(null);
      setDebugInfo("Initializing scanner...");

      // Wait for video to be ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const video = webcamRef.current.video;

      // WIDER SCAN AREA CONFIG
      const config = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: video,
          constraints: {
            width: { min: 1280, ideal: 1920, max: 2560 }, // Higher resolution
            height: { min: 720, ideal: 1080, max: 1440 },
            facingMode: "environment",
            aspectRatio: { ideal: 1.7777777778 }, // 16:9
          },
          area: {
            // MUCH WIDER SCAN AREA - covers almost entire screen
            top: "10%", // Reduced from 25%
            right: "5%", // Reduced from 10%
            left: "5%", // Reduced from 10%
            bottom: "10%", // Reduced from 25%
          },
        },
        frequency: 15, // Increased scan frequency
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
          patchSize: "large", // Changed to large for wider detection
          halfSample: false, // Disabled for better wide area coverage
        },
        numOfWorkers: 4, // Increased workers for better performance
        locate: true,
        src: null,
      };

      // Initialize Quagga
      Quagga.init(config, (err) => {
        if (err) {
          console.error("Quagga init error:", err);
          setCameraError(`Scanner init failed: ${err.message}`);
          setScanning(false);

          // Auto-retry after 2 seconds
          if (retryCount < 3) {
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
              initScanner();
            }, 2000);
          }
          return;
        }

        setDebugInfo("Scanner initialized ");
        Quagga.start();
        setScanning(true);

        // Handle successful detection
        Quagga.onDetected((result) => {
          console.log(" Barcode detected:", result);

          if (result?.codeResult?.code) {
            const barcode = result.codeResult.code.trim();
            const format = result.codeResult.format;

            setDebugInfo(` Detected: ${barcode} (${format})`);

            // Stop scanner and return result
            setTimeout(() => {
              Quagga.stop();
              setScanning(false);
              onScan(barcode);
            }, 500);
          }
        });

        // Debug frame processing - SIMPLIFIED for wider area
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

            // Draw wider bounding box for visual reference
            const canvasWidth = drawingCanvas.width;
            const canvasHeight = drawingCanvas.height;

            // Draw large scan area boundary
            drawingCtx.strokeStyle = "#00FF00";
            drawingCtx.lineWidth = 2;
            drawingCtx.setLineDash([5, 5]);
            drawingCtx.strokeRect(
              canvasWidth * 0.05, // 5% from left
              canvasHeight * 0.1, // 10% from top
              canvasWidth * 0.9, // 90% width
              canvasHeight * 0.8 // 80% height
            );
            drawingCtx.setLineDash([]);

            // Draw detected barcode boxes
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

  // Test with mock barcode
  const testWithMockBarcode = () => {
    const testBarcodes = [
      "1234567890128", // EAN-13
      "12345678", // EAN-8
      "ABC123DEF", // Code 39
      "123456789012", // UPC
      "BOSCH-SMG180-001", // Custom format
      "SN-2024-001-ABC", // Serial number format
    ];
    const randomBarcode =
      testBarcodes[Math.floor(Math.random() * testBarcodes.length)];
    setDebugInfo(`🧪 TEST: Using mock barcode: ${randomBarcode}`);

    // Simulate detection delay
    setTimeout(() => {
      onScan(randomBarcode);
    }, 1000);
  };

  // Manual trigger for difficult barcodes
  const manualInput = () => {
    const manualCode = prompt("Enter barcode manually:");
    if (manualCode && manualCode.trim()) {
      setDebugInfo(` Manual input: ${manualCode}`);
      onScan(manualCode.trim());
    }
  };

  // Initialize when component mounts
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

  // WIDER VIDEO CONSTRAINTS
  const videoConstraints = {
    facingMode: "environment",
    width: { ideal: 1920, max: 2560 }, // Higher resolution
    height: { ideal: 1080, max: 1440 },
  };

  return (
    <div className="real-barcode-scanner p-4 w-full">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Scan Serial Number</h3>
        <p className="text-sm text-gray-600">
          Part: <span className="font-semibold text-blue-700">{partName}</span>
        </p>
      </div>

      {/* Camera Preview - LARGER CONTAINER */}
      <div className="relative bg-black rounded-lg overflow-hidden mb-4 border-2 border-green-500 w-full">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full h-80 object-cover" // Increased height
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

        {/* WIDER Scanning overlay */}
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

        {/* Quagga overlay canvas */}
        <div className="absolute inset-0 pointer-events-none">
          <canvas className="quagga-overlay w-full h-full" />
        </div>

        {/* Scanning status overlay */}
        {scanning && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold">
            SCANNING...
          </div>
        )}
      </div>

      {/* Debug Info */}
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

      {/* Action Buttons */}
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

      {/* Error Display */}
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

      {/* Updated Scanning Tips for Wide Area */}
      {/* <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
        <h4 className="font-semibold text-green-900 text-sm mb-2">
          🎯 Wide Area Scanning Tips:
        </h4>
        <ul className="text-green-800 text-xs space-y-1">
          <li>
            • <strong>Large green box</strong> - barcode can be anywhere inside
          </li>
          <li>
            • <strong>No need to center perfectly</strong> - just keep within
            boundaries
          </li>
          <li>
            • Hold <strong>20-50cm</strong> from camera for best results
          </li>
          <li>
            • <strong>Good lighting</strong> is still important
          </li>
          <li>• Scanner automatically detects anywhere in the green area</li>
        </ul>
      </div> */}

      {/* Control Buttons */}
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
