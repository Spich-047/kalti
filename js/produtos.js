// ====================== PRODUTOS ======================
const camisetas = [
  { nome: "liberdade", precoBase: 83, img: "img/camisas/camisetas/liberdade.png", estoque: { P: 0, M: 2, G: 1, GG: 0 } },
  { nome: "senna", precoBase: 84, img: "img/camisas/camisetas/senna.png", estoque: { P: 2, M: 0, G: 0, GG: 1 } },
  { nome: "ceu de jesus", precoBase: 90, img: "img/camisas/camisetas/ceu-de-jesus.png", estoque: { P: 1, M: 1, G: 0, GG: 0 } },
  { nome: "Camiseta 4", precoBase: 95, img: "img/tags/nao-feita.png", estoque: { P: 0, M: 0, G: 0, GG: 0 } },
];

const polos = [
  { nome: "Polo 1", precoBase: 89, img: "img/tags/nao-feita.png", estoque: { P: 0, M: 0, G: 1, GG: 0 } },
  { nome: "Polo 2", precoBase: 89, img: "img/tags/nao-feita.png", estoque: { P: 2, M: 0, G: 0, GG: 0 } },
  { nome: "Polo 3", precoBase: 89, img: "img/tags/nao-feita.png", estoque: { P: 0, M: 0, G: 0, GG: 0 } },
];

// ====================== ELEMENTOS ======================
const formCard = document.getElementById("formCard");
const produtoSelecionadoP = document.getElementById("produtoSelecionado");
const tamanhoSelect = document.getElementById("tamanho");
const precoSelecionadoSpan = document.getElementById("precoSelecionado");

const camisetasDiv = document.querySelector(".camisetas");
const camisetasContainer = document.querySelector(".camisetas-container");
const polosDiv = document.querySelector(".polos");
const polosContainer = document.querySelector(".polos-container");

let indexCentralCamiseta = 0;
let indexCentralPolo = 0;
let produtoAtualCamiseta = null;
let produtoAtualPolo = null;

// ====================== NUM VALIDADOR ======================
function validarTelefoneBR(telefone) {
  // remove tudo que não for número
  telefone = telefone.replace(/\D/g, '');

  // tem que ter 10 ou 11 dígitos (com DDD)
  if (telefone.length < 10 || telefone.length > 11) return false;

  const ddd = telefone.substring(0, 2);
  const numero = telefone.substring(2);

  // DDD válido (11 até 99)
  if (parseInt(ddd) < 11 || parseInt(ddd) > 99) return false;

  // celular precisa começar com 9 e ter 9 dígitos
  if (numero.length === 9 && numero[0] !== '9') return false;

  // evita número fake tipo 00000000000 ou 11111111111
  if (/^(\d)\1+$/.test(telefone)) return false;

  return true;
}

// ====================== CPF VALIDADOR ======================
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

// ====================== PREÇO ======================
function calcularPreco(tamanho, produto) {
  switch (tamanho) {
    case "P": return produto.precoBase;
    case "M": return produto.precoBase + 1;
    case "G": return produto.precoBase + 7;
    case "GG": return produto.precoBase + 12;
    default: return produto.precoBase;
  }
}

// ====================== TAMANHOS DISPONÍVEIS ======================
function atualizarTamanhos(produto) {
  Array.from(tamanhoSelect.options).forEach(opt => {
    if (produto.estoque[opt.value] <= 0) {
      opt.disabled = true;
      opt.textContent = opt.value + " - Sem estoque";
    } else {
      opt.disabled = false;
      opt.textContent = opt.value;
    }
  });
}

// ====================== CRIAR CARD ======================
function criarCard(produto, container, tipo) {
  const card = document.createElement("div");
  card.classList.add("card");

  const img = document.createElement("img");
  img.src = produto.img;

  const nome = document.createElement("p");
  nome.textContent = produto.nome;

  const preco = document.createElement("p");
  preco.textContent = "R$ " + produto.precoBase;

  const botao = document.createElement("button");
  botao.textContent = "Comprar";

  botao.onclick = () => {
    produtoAtualCamiseta = tipo === "camiseta" ? produto : null;
    produtoAtualPolo = tipo === "polo" ? produto : null;

    produtoSelecionadoP.textContent = `Produto: ${produto.nome}`;

    atualizarTamanhos(produto);

    precoSelecionadoSpan.textContent = calcularPreco(tamanhoSelect.value, produto);

    formCard.style.display = "block";
    window.scrollTo({ top: formCard.offsetTop, behavior: "smooth" });
  };

  card.append(img, nome, preco, botao);
  container.appendChild(card);
}

// ====================== GERAR CARDS ======================
camisetas.forEach(p => criarCard(p, camisetasDiv, "camiseta"));
polos.forEach(p => criarCard(p, polosDiv, "polo"));

// ====================== ATUALIZA PREÇO AO MUDAR TAMANHO ======================
tamanhoSelect.addEventListener("change", () => {
  const produto = produtoAtualCamiseta || produtoAtualPolo;
  if (!produto) return;

  precoSelecionadoSpan.textContent = calcularPreco(tamanhoSelect.value, produto);
});

// ====================== ENVIO DO PEDIDO ======================
document.getElementById("btnPedido").onclick = async () => {
  const produto = produtoAtualCamiseta || produtoAtualPolo;

  if (!produto) {
    alert("Selecione um produto!");
    return;
  }


  if (produto.estoque[tamanho] <= 0) {
    alert("Este tamanho está sem estoque!");
    return;
  }

  const pedido = {
    nome: document.getElementById("nome").value.trim(),
    cpf: document.getElementById("cpf").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    rua: document.getElementById("rua").value.trim(),
    numero: document.getElementById("numero").value.trim(),
    bairro: document.getElementById("bairro").value.trim(),
    cidade: document.getElementById("cidade").value.trim(),
    estado: document.getElementById("estado").value.trim(),
    tipoCasa: document.getElementById("tipoCasa").value.trim(),
    referencia: document.getElementById("referencia").value.trim(),
    produto: produto.nome,
    tamanho: tamanho,
    preco: precoSelecionadoSpan.textContent
  };

  // VALIDAÇÕES
  if (!pedido.nome || !pedido.cpf || !pedido.telefone || !pedido.rua || !pedido.numero || !pedido.bairro || !pedido.cidade || !pedido.estado) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  if (!validarCPF(pedido.cpf)) {
    alert("CPF inválido!");
    return;
  }
  
  if (!validarTelefoneBR(pedido.telefone)) {
  alert("Telefone inválido!");
  return;
}

  try {
    const res = await fetch("/novo-pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido)
    });

    const data = await res.json();

    if (data.ok) {
      document.getElementById("linkPagamento").innerHTML =
        `<p>Pedido registrado! Clique abaixo para pagar:</p>
         <a href="${data.mp_link || data.checkout_url}" target="_blank">Pagar agora</a>`;

      document.querySelectorAll("input").forEach(i => i.value = "");
      formCard.style.display = "none";
      produtoAtualCamiseta = null;
      produtoAtualPolo = null;
    } else {
      alert("Erro ao criar pedido");
    }

  } catch (err) {
    alert("Erro de conexão com servidor");
  }
};
function atualizarCentral(div, index) {
  const cards = div.querySelectorAll(".card");

  cards.forEach((c, i) => {
    c.classList.toggle("central", i === index);
  });

  const offset =
    cards[index].offsetLeft -
    div.offsetWidth / 2 +
    cards[index].offsetWidth / 2;

  div.style.transform = `translateX(${-offset}px)`;
}

camisetasContainer.querySelector(".seta.esquerda").onclick = () => {
  indexCentralCamiseta = Math.max(0, indexCentralCamiseta - 1);
  atualizarCentral(camisetasDiv, indexCentralCamiseta);
};

camisetasContainer.querySelector(".seta.direita").onclick = () => {
  indexCentralCamiseta = Math.min(camisetas.length - 1, indexCentralCamiseta + 1);
  atualizarCentral(camisetasDiv, indexCentralCamiseta);
};

polosContainer.querySelector(".seta.esquerda").onclick = () => {
  indexCentralPolo = Math.max(0, indexCentralPolo - 1);
  atualizarCentral(polosDiv, indexCentralPolo);
};

polosContainer.querySelector(".seta.direita").onclick = () => {
  indexCentralPolo = Math.min(polos.length - 1, indexCentralPolo + 1);
  atualizarCentral(polosDiv, indexCentralPolo);
};

// inicia centralizado
atualizarCentral(camisetasDiv, indexCentralCamiseta);
atualizarCentral(polosDiv, indexCentralPolo);