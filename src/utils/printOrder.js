// FILE: src/utils/printOrder.js  :contentReference[oaicite:2]{index=2}

export function printOrder(order) {
  if (!order) return;

  const win = window.open("", "_blank", "width=800,height=600");

  win.document.write(`
    <html>
    <head>
      <title>Stampa Ordine - ${order.cliente}</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        td, th { border: 1px solid #ccc; padding: 8px; }
        th { background: #f4f4f4; }
      </style>
    </head>
    <body>

      <h1>Ceralandia - Riepilogo Ordine</h1>

      <h2>${order.cliente}</h2>
      <p><strong>Telefono:</strong> ${order.telefono}</p>
      <p><strong>Operatore:</strong> ${order.operatore}</p>
      <p><strong>Lavoratore:</strong> ${order.lavoratore}</p>
      <p><strong>Stato:</strong> ${order.stato}</p>
      <p><strong>Data Creazione:</strong> ${
        order.created_at ? new Date(order.created_at).toLocaleString() : "-"
      }</p>
      <p><strong>Consegna prevista:</strong> ${
        order.consegna ? new Date(order.consegna).toLocaleDateString() : "-"
      }</p>

      <h3>Prodotti richiesti</h3>

      <table>
        <thead>
          <tr>
            <th>Prodotto</th>
            <th>Quantità</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${
            (order.prodotti || [])
              .map(
                (p) => `
              <tr>
                <td>${p.nome}</td>
                <td>${p.quantita}</td>
                <td>${p.note || ""}</td>
              </tr>`
              )
              .join("")
          }
        </tbody>
      </table>

      <script>
        window.onload = () => window.print();
      </script>

    </body>
    </html>
  `);

  win.document.close();
}
