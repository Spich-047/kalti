// pedidos.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formPedido");
  const linkPagamento = document.getElementById("linkPagamento");
  const statusMsg = document.getElementById("statusMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusMsg.textContent = "Registrando pedido...";

    const pedido = {
      nome: document.getElementById("nome").value,
      cpf: document.getElementById("cpf").value,
      rua: document.getElementById("rua").value,
      numero: document.getElementById("numero").value,
      bairro: document.getElementById("bairro").value,
      cidade: document.getElementById("cidade").value,
      estado: document.getElementById("estado").value,
      tipoCasa: document.getElementById("tipoCasa").value,
      referencia: document.getElementById("referencia").value,
      produto: document.getElementById("produto").value,
      preco: parseFloat(document.getElementById("preco").value || 10)
    };

    try {
      const res = await fetch("/novo-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
      });
      const data = await res.json();

      if(data.ok) {
        statusMsg.textContent = "Pedido registrado com sucesso!";
        linkPagamento.innerHTML = `<a href="${data.mp_link}" target="_blank">Clique aqui para pagar</a>`;
        form.reset();
      } else {
        statusMsg.textContent = "Erro ao registrar pedido: " + (data.msg || "");
      }
    } catch(err) {
      statusMsg.textContent = "Erro na conexão com o servidor.";
      console.log(err);
    }
  });
});