
import React, { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { WorksheetVisual } from "@/components/worksheet/WorksheetVisual";
import { toWorksheetVisualData } from "./utils/worksheet-visual-adapter";
import type { WorkshopRoomItem } from "@/hooks/useWorkshopData";

interface VisualSnapshotProps {
  item: WorkshopRoomItem;
  width?: number;   // capture width in px
  scale?: number;   // pixel density
}

export const VisualSnapshot: React.FC<VisualSnapshotProps> = ({ item, width = 420, scale = 2 }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement | null>(null);

  const wsProps = useMemo(() => toWorksheetVisualData(item), [item]);

  useEffect(() => {
    let cancelled = false;

    const doCapture = async () => {
      if (!captureRef.current) return;

      // Wait longer for full rendering and CSS application
      await new Promise((r) => setTimeout(r, 300));
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const node = captureRef.current;
      const canvas = await html2canvas(node, {
        backgroundColor: '#ffffff',
        scale,
        useCORS: true,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: true,
        imageTimeout: 0,
        onclone: (doc, element) => {
          // Ensure the node is visible and properly styled during capture
          const clonedNode = doc.getElementById(node.id);
          if (clonedNode) {
            clonedNode.style.position = 'static';
            clonedNode.style.left = '0';
            clonedNode.style.top = '0';
            clonedNode.style.opacity = '1';
            clonedNode.style.pointerEvents = 'auto';
            clonedNode.style.transform = 'none';
            
            // Force all child elements to be visible and preserve styles
            const allElements = clonedNode.querySelectorAll('*');
            allElements.forEach((el: any) => {
              el.style.opacity = window.getComputedStyle(el.parentElement || el).opacity || '1';
            });
          }
        },
      });
      if (!cancelled) {
        setDataUrl(canvas.toDataURL("image/png"));
      }
    };

    doCapture().catch((e) => {
      console.error("VisualSnapshot capture failed:", e);
      setDataUrl(null);
    });

    return () => {
      cancelled = true;
    };
  }, [wsProps, scale]);

  const captureWidth = width;
  const offscreenId = useMemo(() => `visual-snap-${item.id}`, [item.id]);

  return (
    <div className="w-full">
      {/* Display snapshot if ready */}
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`Visual preview for ${item.name || "window"}`}
          className="w-full h-auto rounded-lg border bg-card object-contain"
        />
      ) : (
        <div className="w-full aspect-[4/3] grid place-items-center rounded-lg border bg-muted/30 text-xs text-muted-foreground">
          Generating preview…
        </div>
      )}

      {/* Offscreen renderer used for capture */}
      <div
        id={offscreenId}
        ref={captureRef}
        aria-hidden
        style={{
          position: "fixed",
          left: "-10000px",
          top: "-10000px",
          width: `${captureWidth}px`,
          minHeight: "400px",
          opacity: 1,
          pointerEvents: "none",
          zIndex: -1,
          backgroundColor: "#ffffff",
        }}
      >
        <div className="w-[420px] max-w-none" style={{ minHeight: "400px" }}>
          <WorksheetVisual
            windowType={wsProps.windowType}
            measurements={wsProps.measurements}
            selectedTemplate={wsProps.selectedTemplate}
          />
        </div>
      </div>
    </div>
  );
};

