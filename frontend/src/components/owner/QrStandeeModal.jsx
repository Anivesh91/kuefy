import React, { useState, useRef } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  Download,
  Copy,
  Check,
  X,
  QrCode,
  ExternalLink,
  Sparkles,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export const QrStandeeModal = ({ isOpen, onClose, organization }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [format, setFormat] = useState('standee'); // 'standee' | 'poster'
  const printRef = useRef(null);
  const qrCanvasRef = useRef(null);

  if (!isOpen || !organization) return null;

  const origin = window.location.origin;
  const targetUrl = `${origin}/customer/organizations/${organization.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = () => {
    try {
      setDownloading(true);

      // Create an offscreen canvas to generate a high-res printable poster image (1200 x 1600 px)
      const canvas = document.createElement('canvas');
      const width = 1200;
      const height = format === 'standee' ? 1600 : 1700;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 1. Background
      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(0, 0, width, height);

      // Outer border
      ctx.lineWidth = 16;
      ctx.strokeStyle = '#184E38';
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // Inner thin accent border
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#D5CCBD';
      ctx.strokeRect(46, 46, width - 92, height - 92);

      // 2. Header Pill: "VIRTUAL QUEUE"
      ctx.fillStyle = '#184E38';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 190, 80, 380, 56, 28);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN TO JOIN QUEUE', width / 2, 115);

      // 3. Organization Name
      ctx.fillStyle = '#141E18';
      ctx.font = 'bold 54px Georgia, serif';
      const orgName = organization.name || 'Our Store';
      // Truncate if too long
      const displayOrgName = orgName.length > 32 ? orgName.slice(0, 30) + '...' : orgName;
      ctx.fillText(displayOrgName, width / 2, 220);

      // Category / Location subtitle
      ctx.fillStyle = '#4D5E53';
      ctx.font = '500 24px -apple-system, BlinkMacSystemFont, sans-serif';
      const locationText = [organization.category, organization.address?.city]
        .filter(Boolean)
        .join(' • ');
      ctx.fillText(locationText || 'Walk-in Welcome', width / 2, 265);

      // 4. White QR Box
      const qrBoxSize = 560;
      const qrBoxX = (width - qrBoxSize) / 2;
      const qrBoxY = 320;

      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 12;
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 32);
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#E8E1D5';
      ctx.stroke();

      // Draw QR Canvas inside box
      const sourceQrCanvas = qrCanvasRef.current?.querySelector('canvas');
      if (sourceQrCanvas) {
        const qrSize = 460;
        const qrX = (width - qrSize) / 2;
        const qrY = qrBoxY + (qrBoxSize - qrSize) / 2;
        ctx.drawImage(sourceQrCanvas, qrX, qrY, qrSize, qrSize);
      }

      // 5. Instruction Steps
      const stepsY = qrBoxY + qrBoxSize + 70;
      ctx.fillStyle = '#184E38';
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('HOW IT WORKS', width / 2, stepsY);

      const steps = [
        '1. Open Camera or Google Lens to scan',
        '2. Select your service & take a virtual ticket',
        '3. Relax anywhere — we chime when your turn arrives',
      ];

      ctx.fillStyle = '#33443B';
      ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      steps.forEach((step, i) => {
        ctx.fillText(step, width / 2, stepsY + 50 + i * 44);
      });

      // 6. Footer Branding
      const footerY = height - 100;
      ctx.fillStyle = '#77887E';
      ctx.font = '500 20px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('Powered by Kuefy • No app download required', width / 2, footerY);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${organization.slug || 'kuefy'}-counter-qr-standee.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export PNG', err);
      alert('Could not download image. You can use the Print button instead.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #kuefy-printable-area, #kuefy-printable-area * {
            visibility: visible !important;
          }
          #kuefy-printable-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 2.5rem !important;
            background: #FAF7F2 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            box-sizing: border-box !important;
            z-index: 999999 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-[#FAF7F2] dark:bg-[#151E19] rounded-3xl shadow-2xl border border-[#E5DEC9] dark:border-stone-800 overflow-hidden my-8">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5DEC9] dark:border-stone-800 bg-[#F4EFE6] dark:bg-[#1A2520]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#184E38] text-white rounded-2xl shadow-xs">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-medium text-[#1A231E] dark:text-white">
                  Counter QR Standee & Poster
                </h3>
                <p className="text-xs text-[#59665F] dark:text-stone-400">
                  Print or download to display at your reception desk or entrance.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#59665F] hover:text-[#1A231E] dark:text-stone-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[#EFE9DC]/60 dark:bg-[#1A2520]/60 border-b border-[#E5DEC9] dark:border-stone-800">
            {/* Format Toggle */}
            <div className="flex items-center p-1 bg-white dark:bg-stone-800 rounded-xl border border-[#DCD5C5] dark:border-stone-700 text-xs">
              <button
                type="button"
                onClick={() => setFormat('standee')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  format === 'standee'
                    ? 'bg-[#184E38] text-white shadow-xs'
                    : 'text-[#59665F] dark:text-stone-400 hover:text-[#184E38]'
                }`}
              >
                Table Standee (4×6)
              </button>
              <button
                type="button"
                onClick={() => setFormat('poster')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  format === 'poster'
                    ? 'bg-[#184E38] text-white shadow-xs'
                    : 'text-[#59665F] dark:text-stone-400 hover:text-[#184E38]'
                }`}
              >
                Wall Poster (A4)
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-[#1A231E] dark:text-stone-200 border border-[#DCD5C5] dark:border-stone-700 rounded-xl text-xs font-medium transition-all shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      Copied!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-[#184E38] dark:text-[#A7D7BC] border border-[#DCD5C5] dark:border-stone-700 rounded-xl text-xs font-semibold transition-all shadow-2xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? 'Exporting...' : 'Save PNG'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#184E38] hover:bg-[#123E2C] text-white rounded-xl text-xs font-semibold transition-all shadow-xs active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Standee</span>
              </button>
            </div>
          </div>

          {/* Standee Preview Window */}
          <div className="p-6 sm:p-8 flex justify-center bg-[#EDE7DA]/50 dark:bg-black/20 overflow-y-auto max-h-[62vh]">
            <div
              id="kuefy-printable-area"
              ref={printRef}
              className={`w-full bg-[#FAF7F2] text-[#141E18] rounded-3xl border-4 border-[#184E38] p-6 sm:p-8 shadow-xl flex flex-col items-center text-center transition-all ${
                format === 'standee' ? 'max-w-md' : 'max-w-lg py-10'
              }`}
            >
              {/* Standee Pill */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-[#184E38] text-white rounded-full text-[11px] font-bold tracking-widest uppercase mb-4 shadow-2xs">
                <Sparkles className="w-3 h-3" />
                <span>SCAN TO JOIN QUEUE</span>
              </div>

              {/* Organization Heading */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#141E18] mb-1">
                {organization.name}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#4D5E53] mb-6">
                {[organization.category, organization.address?.city]
                  .filter(Boolean)
                  .join(' • ') || 'Walk-in Welcome'}
              </p>

              {/* QR Code Container */}
              <div
                ref={qrCanvasRef}
                className="relative p-5 bg-white rounded-3xl border border-[#E0D8C8] shadow-md mb-6"
              >
                <QRCodeCanvas
                  value={targetUrl}
                  size={format === 'standee' ? 220 : 260}
                  level="H"
                  includeMargin={false}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Subtle center logo badge */}
                  <div className="w-10 h-10 bg-[#FAF7F2] border-2 border-[#184E38] rounded-xl flex items-center justify-center shadow-xs">
                    <span className="font-serif font-black text-[#184E38] text-base leading-none">
                      K
                    </span>
                  </div>
                </div>
              </div>

              {/* Step by step guide */}
              <div className="w-full max-w-xs space-y-2 mb-6">
                <div className="text-[11px] font-bold tracking-wider text-[#184E38] uppercase">
                  HOW IT WORKS
                </div>
                <div className="text-xs text-[#33443B] space-y-1.5 text-left bg-white/70 rounded-2xl p-3 border border-[#E8E1D5]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#184E38] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>Scan with Camera or Google Lens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#184E38] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>Select service & get virtual ticket</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#184E38] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span>Wait anywhere — we chime on your turn</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#E8E1D5] w-full flex items-center justify-between text-[10px] text-[#77887E]">
                <span>kuefy.com</span>
                <span className="font-medium text-[#184E38]">
                  No app download needed
                </span>
              </div>
            </div>
          </div>

          {/* Bottom helper */}
          <div className="px-6 py-4 bg-[#F4EFE6] dark:bg-[#1A2520] border-t border-[#E5DEC9] dark:border-stone-800 flex items-center justify-between text-xs text-[#59665F] dark:text-stone-400">
            <span className="truncate max-w-sm font-mono text-[11px] text-[#184E38] dark:text-[#A7D7BC]">
              {targetUrl}
            </span>
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#184E38] dark:text-[#A7D7BC] font-medium hover:underline shrink-0"
            >
              <span>Test Customer View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
