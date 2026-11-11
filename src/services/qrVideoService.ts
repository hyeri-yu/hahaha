import { ActivityItem, EquipmentCategory } from '../types';

declare global {
  interface Window {
    pdfjsLib?: any;
    jsQR?: any;
  }
}

export interface QrExtractionResult {
  activityId: number;
  pdfPage: number;
  foundUrl: string | null;
  status: 'found' | 'not_found' | 'error';
  error?: string;
}

export const qrVideoService = {
  /**
   * Render a specific PDF page to canvas and scan for QR code with jsQR
   */
  async scanPageForQrCode(pdfDoc: any, pageNumber: number): Promise<string | null> {
    try {
      if (!window.jsQR) {
        console.warn('jsQR library is not yet loaded.');
        return null;
      }

      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2.0 }); // higher scale for QR scanning clarity

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;

      await page.render({ canvasContext: ctx, viewport }).promise;

      // Scan full image
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let code = window.jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      });

      if (code && code.data && (code.data.startsWith('http://') || code.data.startsWith('https://'))) {
        return code.data;
      }

      // If not found on full page, scan common QR code locations (top right, bottom right, bottom left)
      const regions = [
        // Top right 35%
        { x: Math.floor(canvas.width * 0.65), y: 0, w: Math.floor(canvas.width * 0.35), h: Math.floor(canvas.height * 0.35) },
        // Bottom right 35%
        { x: Math.floor(canvas.width * 0.65), y: Math.floor(canvas.height * 0.65), w: Math.floor(canvas.width * 0.35), h: Math.floor(canvas.height * 0.35) },
        // Bottom left 35%
        { x: 0, y: Math.floor(canvas.height * 0.65), w: Math.floor(canvas.width * 0.35), h: Math.floor(canvas.height * 0.35) }
      ];

      for (const r of regions) {
        try {
          const regionData = ctx.getImageData(r.x, r.y, r.w, r.h);
          code = window.jsQR(regionData.data, regionData.width, regionData.height, {
            inversionAttempts: 'attemptBoth'
          });
          if (code && code.data && (code.data.startsWith('http://') || code.data.startsWith('https://'))) {
            return code.data;
          }
        } catch {
          // ignore region errors
        }
      }

      return null;
    } catch (e) {
      console.error(`Failed to scan QR code on page ${pageNumber}`, e);
      return null;
    }
  },

  /**
   * Helper to format video URL into embeddable URL (YouTube, Vimeo, or direct video)
   */
  getEmbedUrl(url: string | null | undefined): { isEmbeddable: boolean; embedUrl: string | null } {
    if (!url || !url.trim()) {
      return { isEmbeddable: false, embedUrl: null };
    }

    const trimmed = url.trim();

    // YouTube checks
    // e.g. https://www.youtube.com/watch?v=XXXX or https://youtu.be/XXXX
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return {
        isEmbeddable: true,
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0`
      };
    }

    // Vimeo checks
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        isEmbeddable: true,
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      };
    }

    // Direct MP4 / WebM
    if (trimmed.endsWith('.mp4') || trimmed.endsWith('.webm') || trimmed.endsWith('.ogg')) {
      return {
        isEmbeddable: true,
        embedUrl: trimmed
      };
    }

    return {
      isEmbeddable: false,
      embedUrl: null
    };
  }
};
