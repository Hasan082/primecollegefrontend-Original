import { useState } from "react";
import { Monitor, Smartphone, Maximize2, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DevicePreviewProps {
  previewPath: string;
  defaultMode?: "pc" | "phone";
}

const SIDEBAR_PREVIEW_WIDTH = 320;

// The actual page URL in the running dev server
const getIframeUrl = (previewPath: string) => {
  return `${window.location.origin}${previewPath}`;
};

/**
 * Renders a live iframe scaled to fit the sidebar, with device-frame chrome.
 * In fullscreen mode the iframe fills the overlay at full resolution.
 */
const DevicePreview = ({ previewPath, defaultMode = "phone" }: DevicePreviewProps) => {
  const [mode, setMode] = useState<"pc" | "phone">(defaultMode);
  const [fullscreen, setFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeUrl = getIframeUrl(previewPath);

  // ── Sidebar scaled preview ────────────────────────────────────────────────
  // Phone: real device is 390px wide (iPhone 14 Pro). We show it at 260px
  // so scale = 260/390 ≈ 0.667
  // PC: real viewport 1440px, we show it scaled into ~300px wide space → 300/1440 ≈ 0.208
  const PHONE_REAL_W = 390;
  const PHONE_REAL_H = 844;
  const PHONE_SCALED_W = 220;
  const PHONE_SCALE = PHONE_SCALED_W / PHONE_REAL_W;
  const PHONE_SCALED_H = PHONE_REAL_H * PHONE_SCALE;

  const PC_REAL_W = 1440;
  const PC_SCALED_W = SIDEBAR_PREVIEW_WIDTH - 16; // some padding
  const PC_SCALE = PC_SCALED_W / PC_REAL_W;
  const PC_REAL_H = 900;
  const PC_SCALED_H = PC_REAL_H * PC_SCALE;

  return (
    <>
      {/* ── Sidebar preview panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col sticky top-6 h-[80vh] rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/60 flex-shrink-0">
          {/* Device toggles */}
          <div className="flex items-center gap-0.5 bg-background rounded-md border border-border p-0.5">
            <button
              onClick={() => setMode("phone")}
              title="Mobile view"
              className={`p-1.5 rounded transition-all ${
                mode === "phone"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setMode("pc")}
              title="Desktop view"
              className={`p-1.5 rounded transition-all ${
                mode === "pc"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* URL badge */}
          <span className="text-[9px] font-mono text-muted-foreground truncate mx-2 flex-1 text-center">
            {previewPath}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              title="Refresh"
              className="p-1.5 rounded text-muted-foreground hover:bg-muted transition-all"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
            <button
              onClick={() => setFullscreen(true)}
              title="Fullscreen"
              className="p-1.5 rounded text-muted-foreground hover:bg-muted transition-all"
            >
              <Maximize2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto flex items-start justify-center py-6 px-2 bg-[#f3f4f6]">
          {mode === "phone" ? (
            /* ── Phone device frame ── */
            <div
              style={{ width: PHONE_SCALED_W + 24 }}
              className="flex-shrink-0"
            >
              <div
                className="relative bg-[#1a1a1a] rounded-[36px] shadow-2xl"
                style={{
                  padding: "10px 6px",
                  boxShadow:
                    "0 0 0 1px #444, 0 30px 60px -10px rgba(0,0,0,0.6), inset 0 0 0 1px #333",
                }}
              >
                {/* Speaker notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#1a1a1a] rounded-full z-10 flex items-center justify-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2a2a2a]" />
                  <div className="w-8 h-1.5 rounded-full bg-[#111]" />
                </div>
                {/* Screen */}
                <div
                  className="overflow-hidden bg-white"
                  style={{
                    width: PHONE_SCALED_W,
                    height: PHONE_SCALED_H,
                    borderRadius: 28,
                  }}
                >
                  <iframe
                    key={refreshKey}
                    src={iframeUrl}
                    title="Phone preview"
                    className="border-0 origin-top-left"
                    style={{
                      width: PHONE_REAL_W,
                      height: PHONE_REAL_H,
                      transform: `scale(${PHONE_SCALE})`,
                      pointerEvents: "none",
                    }}
                  />
                </div>
                {/* Home indicator */}
                <div className="flex justify-center mt-2">
                  <div className="w-20 h-1 rounded-full bg-white/30" />
                </div>
              </div>
            </div>
          ) : (
            /* ── Desktop / laptop device frame ── */
            <div style={{ width: PC_SCALED_W + 24 }} className="flex-shrink-0">
              {/* Monitor body */}
              <div
                className="relative bg-[#1a1a1a] rounded-t-lg"
                style={{
                  padding: "8px 8px 0",
                  boxShadow: "0 0 0 1px #333",
                }}
              >
                {/* Webcam dot */}
                <div className="flex justify-center mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                </div>
                {/* Screen bezel */}
                <div
                  className="bg-black overflow-hidden"
                  style={{
                    width: PC_SCALED_W,
                    height: PC_SCALED_H,
                    borderRadius: "4px 4px 0 0",
                  }}
                >
                  <iframe
                    key={refreshKey}
                    src={iframeUrl}
                    title="Desktop preview"
                    className="border-0 origin-top-left"
                    style={{
                      width: PC_REAL_W,
                      height: PC_REAL_H,
                      transform: `scale(${PC_SCALE})`,
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
              {/* Monitor stand */}
              <div className="flex justify-center">
                <div
                  className="bg-[#1a1a1a]"
                  style={{ width: PC_SCALED_W + 16, height: 6, borderRadius: "0 0 4px 4px" }}
                />
              </div>
              <div className="flex justify-center mt-0.5">
                <div
                  className="bg-[#222]"
                  style={{ width: 40, height: 8, borderRadius: 4 }}
                />
              </div>
              <div className="flex justify-center mt-0.5">
                <div
                  className="bg-[#1a1a1a]"
                  style={{ width: 80, height: 4, borderRadius: 4 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Fullscreen modal ──────────────────────────────────────────────── */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0f0f0f] animate-in fade-in duration-200">
          {/* Fullscreen toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a] border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-black/40 rounded-lg border border-white/10 p-1">
              <button
                onClick={() => setMode("phone")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mode === "phone"
                    ? "bg-primary text-primary-foreground"
                    : "text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" /> Mobile
              </button>
              <button
                onClick={() => setMode("pc")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mode === "pc"
                    ? "bg-primary text-primary-foreground"
                    : "text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" /> Desktop
              </button>
            </div>

            <div className="flex items-center gap-2 mx-4 bg-black/30 px-3 py-1.5 rounded-full border border-white/10 text-white/40 text-[11px] font-mono flex-1 max-w-md">
              <span className="truncate">{iframeUrl}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRefreshKey((k) => k + 1)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFullscreen(false)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Fullscreen device display */}
          <div className="flex-1 overflow-auto flex items-start justify-center py-10 px-8 bg-[#0f0f0f]">
            {mode === "phone" ? (
              <div className="flex-shrink-0" style={{ width: 420 }}>
                <div
                  className="relative bg-[#1a1a1a] rounded-[50px]"
                  style={{
                    padding: "14px 10px",
                    boxShadow:
                      "0 0 0 1.5px #555, 0 40px 80px -10px rgba(0,0,0,0.8), inset 0 0 0 1px #2a2a2a",
                  }}
                >
                  {/* Speaker */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1a1a1a] rounded-full z-10 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                    <div className="w-10 h-2 rounded-full bg-[#111]" />
                  </div>
                  {/* Side buttons */}
                  <div className="absolute -left-[3px] top-28 w-[3px] h-8 bg-[#333] rounded-l" />
                  <div className="absolute -left-[3px] top-40 w-[3px] h-12 bg-[#333] rounded-l" />
                  <div className="absolute -left-[3px] top-56 w-[3px] h-12 bg-[#333] rounded-l" />
                  <div className="absolute -right-[3px] top-36 w-[3px] h-16 bg-[#333] rounded-r" />
                  {/* Screen */}
                  <div
                    className="overflow-hidden bg-white"
                    style={{ width: 390, height: 780, borderRadius: 40 }}
                  >
                    <iframe
                      key={`fs-${refreshKey}`}
                      src={iframeUrl}
                      title="Phone fullscreen preview"
                      className="border-0"
                      style={{ width: 390, height: 780 }}
                    />
                  </div>
                  {/* Home indicator */}
                  <div className="flex justify-center mt-3">
                    <div className="w-28 h-1 rounded-full bg-white/25" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-shrink-0 w-full max-w-5xl">
                {/* Monitor */}
                <div
                  className="bg-[#1a1a1a] rounded-t-2xl"
                  style={{ padding: "12px 12px 0", boxShadow: "0 0 0 1px #333" }}
                >
                  <div className="flex justify-center mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#333]" />
                  </div>
                  <div
                    className="bg-black rounded-t-lg overflow-hidden"
                    style={{ height: 600 }}
                  >
                    <iframe
                      key={`fs-${refreshKey}`}
                      src={iframeUrl}
                      title="Desktop fullscreen preview"
                      className="border-0 w-full h-full"
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="bg-[#1a1a1a] h-3 rounded-b-lg" style={{ width: "100%" }} />
                </div>
                <div className="flex justify-center mt-0.5">
                  <div className="bg-[#222] h-5 w-24 rounded-b-lg" />
                </div>
                <div className="flex justify-center mt-1">
                  <div className="bg-[#1a1a1a] h-3 w-48 rounded-lg" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DevicePreview;
