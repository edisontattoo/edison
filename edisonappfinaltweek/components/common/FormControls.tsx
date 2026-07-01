import React, { useRef, useEffect, useState } from 'react';
import { ArrowUpTrayIcon } from './UIElements'; // Assuming icons are in UIElements

// New helper function to compress images client-side
const compressImage = (dataUrl: string, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Calculate the new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to get canvas context for image compression.'));
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Get the new data URL. 'image/jpeg' is good for photos and offers good compression.
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = (err) => {
      console.error("Failed to load image for compression.", err);
      reject(new Error('Failed to load image for compression.'));
    };
  });
};


interface FileInputProps {
  label: string;
  id: string;
  onFileSelect: (file: File | null, dataUrl?: string) => void;
  accept?: string; // e.g., "image/*", ".pdf"
  error?: string;
  currentFileUrl?: string; // To display existing file (e.g. from form data)
  required?: boolean; // Added required prop
}

export const FileInput: React.FC<FileInputProps> = ({ label, id, onFileSelect, accept, error, currentFileUrl, required }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentFileUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentFileUrl) {
        setPreviewUrl(currentFileUrl);
        setFileName("Previously uploaded file");
    } else {
        // If currentFileUrl becomes null/undefined (e.g. form reset), clear preview
        setPreviewUrl(null);
        setFileName(null);
    }
  }, [currentFileUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const initialDataUrl = reader.result as string;

        // If the uploaded file is an image, attempt to compress it to save space.
        if (file.type.startsWith('image/') && accept?.includes('image')) {
          compressImage(initialDataUrl)
            .then(compressedDataUrl => {
              setPreviewUrl(compressedDataUrl);
              onFileSelect(file, compressedDataUrl);
            })
            .catch(compressionError => {
              console.error("Image compression failed:", compressionError);
              // Fallback to the original image if compression fails
              setPreviewUrl(initialDataUrl);
              onFileSelect(file, initialDataUrl);
            });
        } else {
          // For non-image files (like PDFs), use the original data URL
          setPreviewUrl(initialDataUrl);
          onFileSelect(file, initialDataUrl);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setFileName(null);
      setPreviewUrl(null);
      onFileSelect(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className={`mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 ${error ? 'border-red-500' : 'border-gray-600'} border-dashed rounded-md hover:border-cyan-500 transition-colors`}>
        {previewUrl && (accept?.includes("image") || previewUrl.startsWith("data:image")) ? (
          <img src={previewUrl} alt="Preview" className="max-h-32 rounded mb-2" />
        ) : previewUrl ? (
          <p className="text-sm text-gray-400 mb-2">File ready: {fileName || "Uploaded File"}</p>
        ) : (
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-500" />
        )}
        <div className="space-y-1 text-center">
          <div className="flex text-sm text-gray-400">
            <button
              type="button"
              onClick={triggerFileInput}
              className="relative cursor-pointer bg-transparent rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-cyan-500"
            >
              <span>{previewUrl ? 'Change file' : 'Upload a file'}</span>
              <input ref={fileInputRef} id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} accept={accept} required={required} />
            </button>
            {!previewUrl && <p className="pl-1">or drag and drop</p>}
          </div>
          {fileName && !previewUrl && ( // Shows original filename if a file was selected but has no preview (e.g. PDF)
            <p className="text-xs text-gray-500">{fileName}</p>
          )}
          {!fileName && !previewUrl && (
            <p className="text-xs text-gray-500">{accept === "image/*" ? "PNG, JPG, GIF up to 10MB" : "Accepted files: " + (accept || "any")}</p>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};


interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
  label?: string;
  existingSignatureUrl?: string;
  error?: string;
  required?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  width = 300,
  height = 150,
  penColor = '#1F2937', // Dark gray for better visibility on white
  backgroundColor = 'white',
  label,
  existingSignatureUrl,
  error,
  required
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(!!existingSignatureUrl);
  const [currentSignatureUrl, setCurrentSignatureUrl] = useState<string | undefined>(existingSignatureUrl);

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  };
  
  const initializeCanvas = (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 2.5; // Slightly thicker for better visibility
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
  }

  useEffect(() => {
    const ctx = getCanvasContext();
    if (ctx) {
      initializeCanvas(ctx);
      if (existingSignatureUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
        };
        img.onerror = () => {
          // If existing image fails to load, clear it
          initializeCanvas(ctx);
          setCurrentSignatureUrl(undefined);
          setHasSigned(false);
        }
        img.src = existingSignatureUrl;
        setHasSigned(true);
        setCurrentSignatureUrl(existingSignatureUrl);
      } else {
         // Ensure canvas is clear if no existing signature
        initializeCanvas(ctx);
        setCurrentSignatureUrl(undefined);
        setHasSigned(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, penColor, backgroundColor, existingSignatureUrl]);

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault(); 
    const ctx = getCanvasContext();
    if (!ctx) return;
    
    if (currentSignatureUrl && !isDrawing) { // If there was an existing/saved sig, clear it to start new one
        initializeCanvas(ctx);
        setCurrentSignatureUrl(undefined); 
        onSave(''); // Notify parent that signature is being cleared
    }

    setIsDrawing(true);
    setHasSigned(true); // Mark as signed as soon as drawing starts
    const pos = getPos(event);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing) return;
    const ctx = getCanvasContext();
    if (!ctx) return;
    const pos = getPos(event);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return; // Only act if currently drawing
    const ctx = getCanvasContext();
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas && hasSigned) { // Ensure it's marked as signed
        const dataUrl = canvas.toDataURL('image/png');
        setCurrentSignatureUrl(dataUrl); // Update local preview
        onSave(dataUrl); // Propagate change immediately
    } else if (canvas && !hasSigned) { // If drawing ended without actually drawing anything
        onSave(''); // Ensure empty signature is propagated
    }
  };

  const getPos = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in event.nativeEvent && event.nativeEvent.touches[0]) {
        clientX = event.nativeEvent.touches[0].clientX;
        clientY = event.nativeEvent.touches[0].clientY;
    } else if ('clientX' in event.nativeEvent) {
       clientX = event.nativeEvent.clientX;
       clientY = event.nativeEvent.clientY;
    } else {
        return { x: 0, y: 0 }; // Should not happen with current event handlers
    }
    return {
        x: clientX - rect.left,
        y: clientY - rect.top,
    };
  };

  const clearPad = () => {
    const ctx = getCanvasContext();
    if (ctx) {
      initializeCanvas(ctx);
      setHasSigned(false);
      setCurrentSignatureUrl(undefined);
      setIsDrawing(false); // Ensure drawing state is reset
      onSave(''); // Propagate empty signature
    }
  };

  return (
    <div className="w-full">
      {label && <span className="block text-sm font-medium text-gray-300 mb-1">{label} {required && <span className="text-red-400">*</span>}</span>}
      {currentSignatureUrl && !isDrawing && ( // Show existing/saved signature as an image if not actively drawing
        <div className="mb-2 border border-gray-500 p-1 rounded inline-block bg-white">
            <img src={currentSignatureUrl} alt="Signature Preview" style={{ maxWidth: width, maxHeight: height }} />
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`border touch-none rounded ${error ? 'border-red-500' : 'border-gray-400'} ${currentSignatureUrl && !isDrawing ? 'hidden' : 'block'}`} // Hide canvas if showing preview and not drawing
        style={{ backgroundColor: backgroundColor, touchAction: 'none', cursor: 'crosshair' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing} // End drawing if mouse leaves canvas
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
      />
      <button
        type="button"
        onClick={clearPad}
        className="mt-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
      >
        {currentSignatureUrl || hasSigned ? 'Clear & Redraw' : 'Clear'}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};


// ---------------------------------------------------------------------------
// FingerprintScanner
// Uses the browser WebAuthn API to invoke the device's native biometric sensor
// (Touch ID, Face ID, or fingerprint reader on Android).
// Stores the resulting credential ID as a base64 string — no photos, no files.
// ---------------------------------------------------------------------------

interface FingerprintScannerProps {
  label?: string;
  onCapture: (credentialId: string) => void;
  captured?: boolean;
  required?: boolean;
  note?: string;
}

export const FingerprintScanner: React.FC<FingerprintScannerProps> = ({
  label = 'Fingerprint Verification',
  onCapture,
  captured = false,
  required,
  note,
}) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error' | 'unsupported'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isSupported = () =>
    typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';

  const scan = async () => {
    if (!isSupported()) {
      setStatus('unsupported');
      setErrorMsg('This device or browser does not support biometric scanning. Please use Chrome or Safari on a phone or tablet.');
      return;
    }

    try {
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        setStatus('unsupported');
        setErrorMsg('No fingerprint reader found on this device.');
        return;
      }
    } catch {
      setStatus('unsupported');
      setErrorMsg('Could not check biometric availability.');
      return;
    }

    setStatus('scanning');
    setErrorMsg('');

    try {
      // Random challenge — just needs to be unique per session, not server-validated here
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'Edison Tattoo & Body Piercing' },
          user: {
            id: challenge, // reuse challenge bytes as user id placeholder
            name: 'consent-signer',
            displayName: 'Consent Signer',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' },  // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // forces on-device biometric
            userVerification: 'required',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error('No credential returned.');
      }

      // Convert credential ID to base64 for storage
      const idArray = new Uint8Array(credential.rawId);
      const base64Id = btoa(String.fromCharCode(...idArray));

      setStatus('success');
      onCapture(base64Id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('AbortError') || msg.includes('NotAllowedError') || msg.toLowerCase().includes('cancelled')) {
        setStatus('idle');
        setErrorMsg('Scan was cancelled. Please try again.');
      } else {
        setStatus('error');
        setErrorMsg(`Scan failed: ${msg}`);
      }
    }
  };

  const reset = () => {
    setStatus('idle');
    setErrorMsg('');
    onCapture('');
  };

  return (
    <div className="w-full">
      {label && (
        <span className="block text-sm font-medium text-gray-300 mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </span>
      )}
      {note && (
        <p className="text-xs text-yellow-300 bg-yellow-900/40 border border-yellow-700/50 rounded px-3 py-2 mb-3">
          {note}
        </p>
      )}

      <div className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 ${
        status === 'success'
          ? 'border-green-500 bg-green-900/20'
          : status === 'error' || status === 'unsupported'
          ? 'border-red-500 bg-red-900/20'
          : 'border-gray-600 bg-gray-800/50'
      }`}>
        {/* Fingerprint icon */}
        <svg
          className={`w-16 h-16 mb-3 transition-colors ${
            status === 'success'
              ? 'text-green-400'
              : status === 'scanning'
              ? 'text-cyan-400 animate-pulse'
              : status === 'error' || status === 'unsupported'
              ? 'text-red-400'
              : 'text-gray-500'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>

        {status === 'idle' && !captured && (
          <p className="text-sm text-gray-400 mb-4 text-center">
            Tap the button below to scan your right index finger using this device's biometric reader.
          </p>
        )}
        {status === 'scanning' && (
          <p className="text-sm text-cyan-300 mb-4 text-center animate-pulse">
            Follow your device's prompt to complete the fingerprint scan…
          </p>
        )}
        {status === 'success' && (
          <p className="text-sm text-green-300 mb-4 text-center font-semibold">
            ✓ Fingerprint captured successfully
          </p>
        )}
        {(status === 'error' || status === 'unsupported') && (
          <p className="text-sm text-red-300 mb-4 text-center">{errorMsg}</p>
        )}
        {status === 'idle' && errorMsg && (
          <p className="text-xs text-yellow-300 mb-3 text-center">{errorMsg}</p>
        )}

        {status !== 'success' ? (
          <button
            type="button"
            onClick={scan}
            disabled={status === 'scanning'}
            className="px-5 py-2 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {status === 'scanning' ? 'Scanning…' : 'Scan Fingerprint'}
          </button>
        ) : (
          <button
            type="button"
            onClick={reset}
            className="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded-lg transition-colors"
          >
            Re-scan
          </button>
        )}
      </div>
    </div>
  );
};