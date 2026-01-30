const express = require("express");
const crypto = require("crypto");
const { initDb } = require("./db");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db;

app.get("/", (req, res) => {
  res.send("Backend działa ✅");
});

/**
 * 1) Tworzenie zamówienia (usługi)
 */
app.post("/api/orders", async (req, res) => {
  try {
    const { description, amount } = req.body;

    if (!description || amount == null) {
      return res.status(400).json({ error: "Brak description lub amount" });
    }

    const orderId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await db.run(
      `INSERT INTO orders (id, description, amount, status, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [orderId, description, Number(amount), "pending", createdAt]
    );

    res.json({ orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 2) Podgląd zamówienia / statusu
 */
app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await db.get(`SELECT * FROM orders WHERE id = ?`, [req.params.id]);
    if (!order) return res.status(404).json({ error: "Nie znaleziono zamówienia" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 3) Notify/webhook z P24 (na sucho)
 * Zakładamy: sessionId == orderId
 */
app.post("/api/payments/p24/notify", async (req, res) => {
  try {
    const { sessionId, status } = req.body;

    console.log("✅ NOTIFY przyszło:", req.body);

    if (!sessionId) return res.status(400).send("NO_SESSION_ID");

    const order = await db.get(`SELECT * FROM orders WHERE id = ?`, [sessionId]);
    if (!order) return res.status(404).send("ORDER_NOT_FOUND");

    if (status === "paid") {
      await db.run(`UPDATE orders SET status = ?, paidAt = ? WHERE id = ?`, [
        "paid",
        new Date().toISOString(),
        sessionId,
      ]);
    } else if (status === "failed") {
      await db.run(`UPDATE orders SET status = ? WHERE id = ?`, ["failed", sessionId]);
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("SERVER_ERROR");
  }
});

(async () => {
  db = await initDb();
  app.listen(3000, () => {
    console.log("API listening on http://localhost:3000");
  });
})();