import {
  customSeriesDefaultOptions,
  type CustomData,
  type CustomSeriesOptions,
  type ICustomSeriesPaneRenderer,
  type ICustomSeriesPaneView,
  type PaneRendererCustomData,
  type PriceToCoordinateConverter,
  type Time,
} from "lightweight-charts";
import type { CanvasRenderingTarget2D } from "fancy-canvas";

export interface OhlcData extends CustomData<Time> {
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface RoundedCandleOptions extends CustomSeriesOptions {
  upColor: string;
  downColor: string;
  wickUpColor: string;
  wickDownColor: string;
  radius: number;
  wickWidth: number;
}

const defaultOptions: RoundedCandleOptions = {
  ...customSeriesDefaultOptions,
  upColor:    "#00FF87",
  downColor:  "#FF3D5A",
  wickUpColor:   "#00FF87",
  wickDownColor: "#FF3D5A",
  radius: 3,
  wickWidth: 2,
};

class RoundedCandleRenderer implements ICustomSeriesPaneRenderer {
  private _data: PaneRendererCustomData<Time, OhlcData> | null = null;
  private _opts: RoundedCandleOptions = defaultOptions;

  update(data: PaneRendererCustomData<Time, OhlcData>, opts: RoundedCandleOptions) {
    this._data = data;
    this._opts = opts;
  }

  draw(target: CanvasRenderingTarget2D, priceToCoord: PriceToCoordinateConverter) {
    target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio, verticalPixelRatio }) => {
      if (!this._data) return;
      const { bars, barSpacing, visibleRange } = this._data;
      if (!visibleRange) return;

      const opts = this._opts;
      const bodyWidth = Math.max(1, Math.floor(barSpacing * 0.6 * horizontalPixelRatio));
      const r = Math.min(opts.radius * Math.min(horizontalPixelRatio, verticalPixelRatio), bodyWidth / 2);
      const wickW = Math.max(1, Math.round(opts.wickWidth * horizontalPixelRatio));

      for (let i = visibleRange.from; i < visibleRange.to; i++) {
        const bar = bars[i];
        if (!bar) continue;

        const d = bar.originalData;
        const isUp = d.close >= d.open;

        const cx = Math.round(bar.x * horizontalPixelRatio);

        const yOpen  = priceToCoord(d.open);
        const yClose = priceToCoord(d.close);
        const yHigh  = priceToCoord(d.high);
        const yLow   = priceToCoord(d.low);

        if (yOpen == null || yClose == null || yHigh == null || yLow == null) continue;

        const yTop    = Math.round(Math.min(yOpen, yClose) * verticalPixelRatio);
        const yBottom = Math.round(Math.max(yOpen, yClose) * verticalPixelRatio);
        const yHighPx = Math.round(yHigh * verticalPixelRatio);
        const yLowPx  = Math.round(yLow  * verticalPixelRatio);

        const bodyColor = isUp ? opts.upColor : opts.downColor;
        const wickColor = isUp ? opts.wickUpColor : opts.wickDownColor;

        const bodyH = Math.max(1, yBottom - yTop);
        const left  = cx - Math.floor(bodyWidth / 2);

        // Wick
        ctx.beginPath();
        ctx.strokeStyle = wickColor;
        ctx.lineWidth = wickW;
        ctx.moveTo(cx, yHighPx);
        ctx.lineTo(cx, yTop);
        ctx.moveTo(cx, yBottom);
        ctx.lineTo(cx, yLowPx);
        ctx.stroke();

        // Rounded body
        const rad = Math.min(r, bodyH / 2, bodyWidth / 2);
        ctx.beginPath();
        ctx.fillStyle = bodyColor;
        if (bodyH < 2) {
          ctx.fillRect(left, yTop, bodyWidth, Math.max(1, bodyH));
        } else {
          ctx.moveTo(left + rad, yTop);
          ctx.lineTo(left + bodyWidth - rad, yTop);
          ctx.arcTo(left + bodyWidth, yTop, left + bodyWidth, yTop + rad, rad);
          ctx.lineTo(left + bodyWidth, yTop + bodyH - rad);
          ctx.arcTo(left + bodyWidth, yTop + bodyH, left + bodyWidth - rad, yTop + bodyH, rad);
          ctx.lineTo(left + rad, yTop + bodyH);
          ctx.arcTo(left, yTop + bodyH, left, yTop + bodyH - rad, rad);
          ctx.lineTo(left, yTop + rad);
          ctx.arcTo(left, yTop, left + rad, yTop, rad);
          ctx.closePath();
          ctx.fill();
        }
      }
    });
  }
}

export class RoundedCandleSeriesView implements ICustomSeriesPaneView<Time, OhlcData, RoundedCandleOptions> {
  private _renderer = new RoundedCandleRenderer();

  priceValueBuilder(data: OhlcData) {
    return [data.high, data.low, data.close];
  }

  isWhitespace(data: OhlcData | { time: Time }): data is { time: Time } {
    return !("close" in data);
  }

  renderer() {
    return this._renderer;
  }

  update(data: PaneRendererCustomData<Time, OhlcData>, options: RoundedCandleOptions) {
    this._renderer.update(data, options);
  }

  defaultOptions() {
    return defaultOptions;
  }
}
