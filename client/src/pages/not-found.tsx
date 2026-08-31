import { Link } from "wouter";
import { ArrowLeft, ArrowRight, TrendingDown } from "lucide-react";

export default function NotFound() {
  return (
    <div className="arena-page not-found-page">
      <div className="not-found-wrap">
        <div className="not-found-label"><TrendingDown size={14} /> ROUTE / 404</div>
        <section className="not-found-card">
          <div className="not-found-chart" aria-hidden="true">
            <svg viewBox="0 0 560 170" preserveAspectRatio="none">
              <path d="M0 42H560M0 90H560M0 138H560M88 0V170M220 0V170M352 0V170M484 0V170" className="not-found-grid" />
              <path d="M0 42 C38 34 52 51 87 43 S132 64 168 53 S210 48 241 62 S282 75 314 82 S352 68 389 92 S433 107 466 115 S518 129 560 147" className="not-found-line" />
              <circle cx="560" cy="147" r="5" className="not-found-dot" />
            </svg>
          </div>
          <div className="not-found-copy">
            <span className="not-found-code">404</span>
            <h1>This page missed the move.</h1>
            <p>The route isn’t on the board right now. Head back to a live page and keep your run going.</p>
          </div>
          <div className="not-found-actions">
            <Link href="/" className="arena-primary-link">Back to the lobby <ArrowRight size={16} /></Link>
            <button type="button" className="not-found-back" onClick={() => window.history.back()}><ArrowLeft size={15} /> Previous page</button>
          </div>
        </section>
      </div>
    </div>
  );
}
