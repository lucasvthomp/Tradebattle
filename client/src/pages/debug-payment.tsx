import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function DebugPayment() {
  const [paymentId, setPaymentId] = useState("5653033856");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/crypto/debug-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentId }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  const manualCredit = async () => {
    if (!result?.user || !result?.paymentData) return;

    setLoading(true);
    try {
      const response = await fetch("/api/crypto/manual-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          paymentId: result.paymentData.payment_id,
          username: result.user.username,
          amount: parseFloat(result.paymentData.price_amount),
        }),
      });

      const data = await response.json();
      alert(data.message || data.error);
      checkPayment(); // Refresh
    } catch (error: any) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#E3B341' }}>Debug Crypto Payment</h1>

      <Card className="p-6 mb-6" style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C' }}>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold" style={{ color: '#C9D1E2' }}>Payment ID</label>
            <Input
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              placeholder="Enter payment ID"
              style={{ backgroundColor: '#0F1419', borderColor: '#2B3A4C', color: '#C9D1E2' }}
            />
          </div>

          <Button
            onClick={checkPayment}
            disabled={loading}
            style={{ backgroundColor: '#E3B341', color: '#06121F' }}
          >
            {loading ? "Checking..." : "Check Payment Status"}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-6" style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#E3B341' }}>Results</h2>

          {result.error ? (
            <div className="text-red-500">{result.error}</div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2" style={{ color: '#28C76F' }}>Payment Data</h3>
                <pre className="bg-black/30 p-4 rounded overflow-auto text-xs" style={{ color: '#8A93A6' }}>
                  {JSON.stringify(result.paymentData, null, 2)}
                </pre>
              </div>

              {result.user && (
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: '#28C76F' }}>User</h3>
                  <pre className="bg-black/30 p-4 rounded overflow-auto text-xs" style={{ color: '#8A93A6' }}>
                    {JSON.stringify(result.user, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div>
                  <span className="font-semibold" style={{ color: '#C9D1E2' }}>Already Credited: </span>
                  <span style={{ color: result.alreadyCredited ? '#28C76F' : '#FF4F58' }}>
                    {result.alreadyCredited ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold" style={{ color: '#C9D1E2' }}>Should Credit: </span>
                  <span style={{ color: result.shouldCredit ? '#28C76F' : '#FF4F58' }}>
                    {result.shouldCredit ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {result.shouldCredit && !result.alreadyCredited && (
                <Button
                  onClick={manualCredit}
                  disabled={loading}
                  className="mt-4"
                  style={{ backgroundColor: '#28C76F', color: '#06121F' }}
                >
                  {loading ? "Processing..." : "Manually Credit This Payment"}
                </Button>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
