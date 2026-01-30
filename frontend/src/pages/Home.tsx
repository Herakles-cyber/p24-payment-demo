import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleBuy() {
    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "Konsultacja 30 min",
        amount: 49,
      }),
    });

    const data = await res.json();
    navigate(`/status/${data.orderId}`);
  }

  return (
    <div>
      <h1>Strona główna</h1>
      <p>Konsultacja 30 minut – 49 zł</p>

      <button onClick={handleBuy} disabled={loading}>
        {loading ? "Tworzenie zamówienia..." : "Kup usługę"}
      </button>
    </div>
  );
}