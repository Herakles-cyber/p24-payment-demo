import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type Order = {
  id: string;
  description: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  createdAt: string;
  paidAt?: string | null;
};

export default function Status() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrder() {
    if (!id) return;

    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error("Nie udało się pobrać zamówienia");
      const data = (await res.json()) as Order;
      setOrder(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  }

  // 1) Pierwsze pobranie + polling co 3s, ale tylko dopóki pending
  useEffect(() => {
    fetchOrder();

    const interval = setInterval(() => {
      // nie spamujemy jeśli już paid/failed
      if (order?.status === "pending" || !order) {
        fetchOrder();
      }
    }, 3000);

    return () => clearInterval(interval);
    // UWAGA: celowo bez "order" w deps, żeby nie resetować interwału co zmianę
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 2) Symulacja płatności + natychmiastowe odświeżenie
  async function handleSimulatePayment() {
    if (!order) return;

    setPaying(true);
    try {
      const res = await fetch("/api/payments/p24/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: order.id,
          status: "paid",
        }),
      });

      if (!res.ok) throw new Error("Notify nie powiódł się");

      // od razu pobierz świeży status (bez czekania 3s)
      await fetchOrder();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wystąpił błąd");
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p style={{ color: "salmon" }}>{error}</p>;
  if (!order) return <p>Nie znaleziono zamówienia</p>;

  return (
    <div>
      <h1>Status płatności</h1>
      <p>Usługa: {order.description}</p>
      <p>Kwota: {order.amount} zł</p>
      <p>
        Status: <b>{order.status}</b>
      </p>

      <button onClick={handleSimulatePayment} disabled={paying || order.status !== "pending"}>
        {paying ? "Symuluję..." : "Symuluj płatność"}
      </button>

      {order.status === "paid" && <p>✅ Płatność zakończona</p>}
      {order.status === "pending" && <p>⏳ Oczekiwanie na płatność</p>}
      {order.status === "failed" && <p>❌ Płatność nieudana</p>}

      {/* ✅ Przycisk pokazuje się dopiero po paid */}
      {order.status === "paid" && (
        <div style={{ marginTop: 16 }}>
          <button onClick={() => navigate("/")}>Wróć na stronę główną</button>
        </div>
      )}
    </div>
  );
}