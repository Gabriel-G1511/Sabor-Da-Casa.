// script.js

// Número WhatsApp fixo
const WHATSAPP_NUMBER = "5548998089729";

// Senha admin
const SENHA_ADMIN = "admin123";

// Estado
let cardapioData = JSON.parse(localStorage.getItem('cardapio')) || [
  // Cardápio padrão inicial
  {
    id: 1,
    nome: "Frango Grelhado com Legumes",
    descricao: "Peito de frango grelhado, acompanha arroz, feijão, batata doce, brócolis e cenoura refogados",
    precos: { media: 15.00, grande: 18.00 }
  },
  {
    id: 2,
    nome: "Carne de Panela com Mandioca",
    descricao: "Carne bovina refogada com temperos especiais, acompanha arroz, feijão, mandioca e salada verde",
    precos: { media: 17.00, grande: 20.00 }
  }
];

// Carrinho: array de itens
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// ----------- FUNÇÕES CARDÁPIO -----------

function carregarCardapio() {
  const cardapioDiv = document.getElementById('cardapio');
  if (!cardapioDiv) return;

  cardapioDiv.innerHTML = '';

  cardapioData.forEach(marmita => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'marmita-item';

    itemDiv.innerHTML = `
      <h3>${marmita.nome}</h3>
      <p>${marmita.descricao}</p>
      <div class="precos">
        <span class="preco">Média: R$ ${marmita.precos.media.toFixed(2)}</span>
        <span class="preco">Grande: R$ ${marmita.precos.grande.toFixed(2)}</span>
      </div>

      <div class="form-group">
        <label>Tamanho:</label>
        <select class="select-tamanho" data-id="${marmita.id}">
          <option value="">Selecione</option>
          <option value="media">Média</option>
          <option value="grande">Grande</option>
        </select>
      </div>

      <div class="form-group">
        <label>Quantidade:</label>
        <input type="number" class="input-quantidade" data-id="${marmita.id}" min="1" value="1" />
      </div>

      <fieldset class="form-group">
        <legend>Itens para remover:</legend>
        <label><input type="checkbox" class="remover-item" data-id="${marmita.id}" value="Cebola" /> Cebola</label><br/>
        <label><input type="checkbox" class="remover-item" data-id="${marmita.id}" value="Pimentão" /> Pimentão</label><br/>
        <label><input type="checkbox" class="remover-item" data-id="${marmita.id}" value="Alho" /> Alho</label><br/>
        <label><input type="checkbox" class="remover-item" data-id="${marmita.id}" value="Tomate" /> Tomate</label>
      </fieldset>

      <button class="btn-primary btn-adicionar" data-id="${marmita.id}">Adicionar ao Carrinho</button>
    `;

    cardapioDiv.appendChild(itemDiv);
  });

  // Adiciona eventos nos botões após renderizar
  document.querySelectorAll('.btn-adicionar').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      adicionarAoCarrinho(id);
    });
  });
}

// ----------- FUNÇÕES CARRINHO -----------

function adicionarAoCarrinho(id) {
  const marmita = cardapioData.find(m => m.id === id);
  if (!marmita) return alert('Item não encontrado.');

  const tamanhoSelect = document.querySelector(`.select-tamanho[data-id="${id}"]`);
  const tamanho = tamanhoSelect ? tamanhoSelect.value : '';
  if (!tamanho) return alert('Selecione o tamanho.');

  const quantidadeInput = document.querySelector(`.input-quantidade[data-id="${id}"]`);
  const quantidade = quantidadeInput ? parseInt(quantidadeInput.value) : 1;
  if (quantidade < 1) return alert('Quantidade inválida.');

  // Itens para remover
  const removerItensCheckboxes = document.querySelectorAll(`.remover-item[data-id="${id}"]:checked`);
  const itensParaRemover = Array.from(removerItensCheckboxes).map(cb => cb.value);

  // Checa se já existe o item igual (mesmo id, tamanho, removidos iguais)
  let itemExistente = carrinho.find(item => 
    item.id === id &&
    item.tamanho === tamanho &&
    JSON.stringify(item.remover) === JSON.stringify(itensParaRemover)
  );

  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    carrinho.push({
      id,
      nome: marmita.nome,
      tamanho,
      quantidade,
      precoUnitario: marmita.precos[tamanho],
      remover: itensParaRemover
    });
  }

  salvarCarrinho();
  atualizarUICarrinho();
  alert('Item adicionado ao carrinho!');
}

function salvarCarrinho() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function atualizarUICarrinho() {
  const carrinhoDiv = document.getElementById('carrinhoFlutuante');
  const itensDiv = document.getElementById('itensCarrinho');
  const btnFinalizar = document.getElementById('btnFinalizarPedido');

  if (!carrinho.length) {
    carrinhoDiv.style.display = 'none';
    btnFinalizar.style.display = 'none';
    return;
  }

  carrinhoDiv.style.display = 'block';
  btnFinalizar.style.display = 'block';

  itensDiv.innerHTML = '';

  let total = 0;

  carrinho.forEach((item, index) => {
    const subtotal = item.precoUnitario * item.quantidade;
    total += subtotal;

    const itemHTML = document.createElement('div');
    itemHTML.style.borderBottom = '1px solid #ccc';
    itemHTML.style.marginBottom = '10px';
    itemHTML.style.paddingBottom = '10px';

    itemHTML.innerHTML = `
      <strong>${item.nome}</strong> (${item.tamanho}) x${item.quantidade} <br/>
      R$ ${subtotal.toFixed(2)}<br/>
      <small>Remover: ${item.remover.length ? item.remover.join(', ') : 'Nenhum'}</small><br/>
      <button class="btn-secondary btn-remover-item" data-index="${index}">Remover</button>
    `;

    itensDiv.appendChild(itemHTML);
  });

  document.getElementById('totalCarrinho').textContent = total.toFixed(2);

  // Eventos remover item
  document.querySelectorAll('.btn-remover-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      carrinho.splice(idx, 1);
      salvarCarrinho();
      atualizarUICarrinho();
    });
  });
}

// ----------- EVENTOS GERAIS -----------

document.addEventListener('DOMContentLoaded', () => {
  carregarCardapio();
  atualizarUICarrinho();

  // Finalizar pedido
  const btnFinalizar = document.getElementById('btnFinalizarPedido');
  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', () => {
      if (carrinho.length === 0) {
        alert('Seu carrinho está vazio.');
        return;
      }
      // Salva carrinho para o finalizar pedido
      localStorage.setItem('pedidoAtual', JSON.stringify(carrinho));
      window.location.href = 'finalizar-pedido.html';
    });
  }

  // Fechar carrinho flutuante
  const btnFecharCarrinho = document.getElementById('btnFecharCarrinho');
  if (btnFecharCarrinho) {
    btnFecharCarrinho.addEventListener('click', () => {
      document.getElementById('carrinhoFlutuante').style.display = 'none';
    });
  }

  // Página finalizar pedido
  if (document.getElementById('resumoPedido')) {
    carregarResumoFinalizar();
    document.getElementById('btnEnviarPedido').addEventListener('click', enviarPedido);
    document.getElementById('btnVoltar').addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Página admin
  if (document.getElementById('btnEntrarAdmin')) {
    document.getElementById('btnEntrarAdmin').addEventListener('click', fazerLoginAdmin);
    document.getElementById('btnAdicionarMarmita').addEventListener('click', adicionarMarmita);
    document.getElementById('btnSairAdmin').addEventListener('click', logoutAdmin);
    carregarCardapioAdmin();
  }
});

// ----------- FINALIZAR PEDIDO -----------

function carregarResumoFinalizar() {
  const resumoDiv = document.getElementById('resumoPedido');
  const pedido = JSON.parse(localStorage.getItem('pedidoAtual'));

  if (!pedido || pedido.length === 0) {
    resumoDiv.innerHTML = '<p>Nenhum pedido encontrado. Volte ao cardápio para fazer seu pedido.</p>';
    return;
  }

  let html = '<h3>Resumo do Pedido</h3><ul>';
  let total = 0;

  pedido.forEach(item => {
    const subtotal = item.precoUnitario * item.quantidade;
    total += subtotal;
    html += `<li><strong>${item.nome}</strong> (${item.tamanho}) x${item.quantidade} - R$ ${subtotal.toFixed(2)}<br/>`;
    html += `Itens removidos: ${item.remover.length ? item.remover.join(', ') : 'Nenhum'}</li>`;
  });

  html += `</ul><h3 style="color: #e74c3c;">Total: R$ ${total.toFixed(2)}</h3>`;

  resumoDiv.innerHTML = html;
}

function enviarPedido() {
  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const endereco = document.getElementById('endereco').value.trim();
  const referencia = document.getElementById('referencia').value.trim();
  const obsExtra = document.getElementById('obsExtra').value.trim();

  if (!nome || !endereco) {
    alert('Por favor, preencha nome e endereço.');
    return;
  }

  const pedido = JSON.parse(localStorage.getItem('pedidoAtual'));
  if (!pedido || pedido.length === 0) {
    alert('Nenhum pedido encontrado.');
    window.location.href = 'index.html';
    return;
  }

  let mensagem = `🍽️ *NOVO PEDIDO - SABOR DA CASA*\n\n`;
  mensagem += `👤 *Cliente:* ${nome}\n`;
  mensagem += `📱 *Telefone:* ${telefone || 'Não informado'}\n`;
  mensagem += `📍 *Endereço:* ${endereco}\n`;
  if (referencia) mensagem += `🗺️ *Referência:* ${referencia}\n`;
  if (obsExtra) mensagem += `📝 *Observações extras:* ${obsExtra}\n`;

  mensagem += `\n🍱 *PEDIDO:*\n`;

  let total = 0;
  pedido.forEach(item => {
    const subtotal = item.precoUnitario * item.quantidade;
    total += subtotal;
    mensagem += `• ${item.nome} (${item.tamanho}) x${item.quantidade}\n`;
    if (item.remover.length)
      mensagem += `  - Sem: ${item.remover.join(', ')}\n`;
  });

  mensagem += `\n💰 *TOTAL: R$ ${total.toFixed(2)}*`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
  window.open(whatsappUrl, '_blank');

  // Limpa pedido
  localStorage.removeItem('pedidoAtual');
  localStorage.removeItem('carrinho');

  alert('Pedido enviado! Você será redirecionado para o WhatsApp.');
  window.location.href = 'index.html';
}

// ----------- ADMIN -----------

function fazerLoginAdmin() {
  const senha = document.getElementById('senhaAdmin').value;
  const erroDiv = document.getElementById('erroLogin');

  if (senha === SENHA_ADMIN) {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    erroDiv.style.display = 'none';
    carregarCardapioAdmin();
  } else {
    erroDiv.style.display = 'block';
    setTimeout(() => {
      erroDiv.style.display = 'none';
    }, 3000);
  }
}

function adicionarMarmita() {
  const nome = document.getElementById('nomeMarmita').value.trim();
  const descricao = document.getElementById('descricaoMarmita').value.trim();
  const precoMedia = parseFloat(document.getElementById('precoMedia').value);
  const precoGrande = parseFloat(document.getElementById('precoGrande').value);

  if (!nome || !descricao || isNaN(precoMedia) || isNaN(precoGrande)) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  const novoId = cardapioData.length ? Math.max(...cardapioData.map(i => i.id)) + 1 : 1;

  cardapioData.push({
    id: novoId,
    nome,
    descricao,
    precos: { media: precoMedia, grande: precoGrande }
  });

  salvarCardapioAdmin();
  carregarCardapioAdmin();

  // limpa campos
  document.getElementById('nomeMarmita').value = '';
  document.getElementById('descricaoMarmita').value = '';
  document.getElementById('precoMedia').value = '';
  document.getElementById('precoGrande').value = '';

  alert('Marmita adicionada com sucesso!');
}

function carregarCardapioAdmin() {
  const listaDiv = document.getElementById('listaCardapio');
  listaDiv.innerHTML = '';

  cardapioData.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cardapio-item';

    div.innerHTML = `
      <strong>${item.nome}</strong> - Média: R$ ${item.precos.media.toFixed(2)}, Grande: R$ ${item.precos.grande.toFixed(2)}<br/>
      <small>${item.descricao}</small>
      <button class="btn-remover" data-id="${item.id}" title="Remover Marmita">×</button>
    `;

    listaDiv.appendChild(div);
  });

  // remover marmita
  document.querySelectorAll('.btn-remover').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      if (confirm('Deseja remover esta marmita?')) {
        cardapioData = cardapioData.filter(i => i.id !== id);
        salvarCardapioAdmin();
        carregarCardapioAdmin();
      }
    });
  });
}

function salvarCardapioAdmin() {
  localStorage.setItem('cardapio', JSON.stringify(cardapioData));
}

function logoutAdmin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('senhaAdmin').value = '';
}

// ----------- FIM -----------
