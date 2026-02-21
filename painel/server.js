require("dotenv").config();
const express = require("express");
const fs = require("fs");
const axios = require("axios");

const app = express();
app.use(express.static("public"));
app.use(express.json());

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

// ====================== FUNÇÕES AUXILIARES ======================
function carregarPedidosJSON() {
  if (!fs.existsSync("./pedidos.json")) fs.writeFileSync("./pedidos.json", "[]");
  const raw = fs.readFileSync("./pedidos.json");
  try { return JSON.parse(raw); } catch { return []; }
}

function salvarPedidosJSON(pedidos) {
  fs.writeFileSync("./pedidos.json", JSON.stringify(pedidos, null, 2));
}

async function enviarDiscord(pedido) {
  const mensagem = {
    content: null,
    embeds: [{
      title: "🛒 Novo pedido atualizado!",
      color: 0x00ff00,
      fields: [
        { name: "Nome", value: pedido.nome },
        { name: "Produto", value: pedido.produto },
        { name: "Status", value: pedido.status },
        { name: "Endereço", value: `${pedido.rua}, ${pedido.numero} - ${pedido.bairro}, ${pedido.cidade}/${pedido.estado}` }
      ]
    }]
  };

  try {
    await axios.post(DISCORD_WEBHOOK, mensagem);
  } catch (err) {
    console.log("Erro Discord:", err.message);
  }
}

// ====================== CRIAR PEDIDO ======================
app.post("/novo-pedido", async (req, res) => {
  const { nome, cpf, rua, numero, bairro, cidade, estado, tipoCasa, referencia, produto, preco } = req.body;

  if (!nome || !produto) {
    return res.status(400).json({ ok: false, msg: "Nome e produto obrigatórios" });
  }

  const pedidos = carregarPedidosJSON();

  const novoPedido = {
    id: pedidos.length ? pedidos[pedidos.length - 1].id + 1 : 1,
    nome, cpf, rua, numero, bairro, cidade, estado, tipoCasa, referencia,
    produto,
    preco,
    status: "Aguardando pagamento"
  };

  pedidos.push(novoPedido);
  salvarPedidosJSON(pedidos);

  try {
    const mpRes = await axios.post(
      "https://api.mercadopago.com/checkout/preferences",
      {
        items: [
          {
            title: produto,
            quantity: 1,
            currency_id: "BRL",
            unit_price: parseFloat(preco || 10)
          }
        ],
        back_urls: {
          success: "https://seusite.com/success",
          failure: "https://seusite.com/failure"
        },
        auto_return: "approved",
        external_reference: novoPedido.id.toString(), // 🔥 AQUI TÁ A CHAVE
        notification_url: "https://SEU-DOMINIO.com/mp-webhook" // 🔥 IMPORTANTE
      },
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`
        }
      }
    );

    res.json({
      ok: true,
      pedido: novoPedido,
      mp_link: mpRes.data.init_point
    });

  } catch (err) {
    console.log("Erro MP:", err.message);
    res.status(500).json({ ok: false, msg: "Erro ao criar pagamento" });
  }
});

// ====================== WEBHOOK MERCADO PAGO ======================
app.post("/mp-webhook", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type !== "payment") return res.sendStatus(200);

    // pega detalhes do pagamento
    const pagamento = await axios.get(
      `https://api.mercadopago.com/v1/payments/${data.id}`,
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`
        }
      }
    );

    const paymentData = pagamento.data;

    const pedidoId = parseInt(paymentData.external_reference, 10);

    const pedidos = carregarPedidosJSON();
    const pedido = pedidos.find(p => p.id === pedidoId);

    if (!pedido) return res.sendStatus(404);

    // atualiza status
    pedido.status = paymentData.status === "approved" ? "Pago" : paymentData.status;

    salvarPedidosJSON(pedidos);

    // manda pro discord
    await enviarDiscord(pedido);

    res.sendStatus(200);

  } catch (err) {
    console.log("Erro webhook:", err.message);
    res.sendStatus(500);
  }
});

// ====================== SERVER ======================
app.listen(3000, () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");
});