// Configurações
const WHATSAPP_NUMBER = "5548998089729";
const SENHA_ADMIN = "22155122";
const TAXA_ENTREGA = 0.00;

// Dados globais
let cardapioData = JSON.parse(localStorage.getItem('cardapio')) || [];
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let marmitaAtual = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('cardapioGrid')) {
        carregarCardapio();
        atualizarCarrinho();
    }
    if (document.getElementById('orderItems')) {
        carregarCheckout();
    }
    if (document.getElementById('listaCardapio')) {
        carregarCardapioAdmin();
    }
    
    // Event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Checkbox sem número
    const semNumeroCheck = document.getElementById('semNumero');
    if (semNumeroCheck) {
        semNumeroCheck.addEventListener('change', toggleSemNumero);
    }
    
    // Forma de pagamento
    const pagamentoRadios = document.querySelectorAll('input[name="pagamento"]');
    pagamentoRadios.forEach(radio => {
        radio.addEventListener('change', toggleTroco);
    });
    
    // Tamanho da marmita no modal
    const tamanhoRadios = document.querySelectorAll('input[name="tamanho"]');
    tamanhoRadios.forEach(radio => {
        radio.addEventListener('change', atualizarPrecoModal);
    });
}

// ==================== CARDÁPIO ====================
function carregarCardapio() {
    const grid = document.getElementById('cardapioGrid');
    
    if (cardapioData.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-light);">
                <i class="fas fa-utensils" style="font-size: 3em; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>Nenhuma marmita disponível hoje.<br>Volte mais tarde!</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    
    cardapioData.forEach(marmita => {
        const card = document.createElement('div');
        card.className = 'marmita-card';
        card.onclick = () => abrirModalMarmita(marmita);
        
        card.innerHTML = `
            <div class="marmita-info">
                <h3>${marmita.nome}</h3>
                <p>${marmita.descricao}</p>
                <div class="marmita-prices">
                    <span class="price-tag">Média: R$ 17,00</span>
                    <span class="price-tag">Grande: R$ 19,00</span>
                </div>
                <button class="add-marmita-btn">
                    <i class="fas fa-plus"></i> Adicionar
                </button>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function abrirModalMarmita(marmita) {
    marmitaAtual = marmita;
    
    document.getElementById('modalTitle').textContent = marmita.nome;
    document.getElementById('modalDescription').textContent = marmita.descricao;
    
    // Carregar ingredientes
    const ingredientesList = document.getElementById('ingredientsList');
    ingredientesList.innerHTML = '';
    
    if (marmita.ingredientes && marmita.ingredientes.length > 0) {
        marmita.ingredientes.forEach(ingrediente => {
            const div = document.createElement('div');
            div.className = 'ingredient-item';
            div.innerHTML = `
                <label class="ingredient-checkbox">
                    <input type="checkbox" value="${ingrediente}">
                    <span>Sem ${ingrediente}</span>
                </label>
            `;
            ingredientesList.appendChild(div);
        });
    } else {
        ingredientesList.innerHTML = '<p style="color: var(--text-light);">Nenhum ingrediente para remover</p>';
    }
    
    // Reset valores
    document.getElementById('quantidadeModal').textContent = '1';
    document.getElementById('observacoesMarmita').value = '';
    document.querySelector('input[name="tamanho"][value="media"]').checked = true;
    
    atualizarPrecoModal();
    
    document.getElementById('marmitaModal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('marmitaModal').style.display = 'none';
    marmitaAtual = null;
}

function alterarQuantidade(delta) {
    const quantidadeSpan = document.getElementById('quantidadeModal');
    let quantidade = parseInt(quantidadeSpan.textContent);
    quantidade = Math.max(1, quantidade + delta);
    quantidadeSpan.textContent = quantidade;
    atualizarPrecoModal();
}

function atualizarPrecoModal() {
    const tamanho = document.querySelector('input[name="tamanho"]:checked').value;
    const quantidade = parseInt(document.getElementById('quantidadeModal').textContent);
    
    const preco = tamanho === 'media' ? 17.00 : 19.00;
    const total = preco * quantidade;
    
    document.getElementById('precoModal').textContent = total.toFixed(2).replace('.', ',');
}

function adicionarAoCarrinho() {
    if (!marmitaAtual) return;
    
    const tamanho = document.querySelector('input[name="tamanho"]:checked').value;
    const quantidade = parseInt(document.getElementById('quantidadeModal').textContent);
    const observacoes = document.getElementById('observacoesMarmita').value;
    
    // Ingredientes para remover
    const ingredientesRemover = Array.from(document.querySelectorAll('#ingredientsList input:checked'))
        .map(input => input.value);
    
    const preco = tamanho === 'media' ? 17.00 : 19.00;
    
    const item = {
        id: Date.now(),
        tipo: 'marmita',
        nome: marmitaAtual.nome,
        tamanho: tamanho,
        quantidade: quantidade,
        preco: preco,
        total: preco * quantidade,
        ingredientesRemover: ingredientesRemover,
        observacoes: observacoes
    };
    
    carrinho.push(item);
    salvarCarrinho();
    atualizarCarrinho();
    fecharModal();
    
    // Feedback visual
    mostrarNotificacao('Item adicionado ao carrinho!');
}

// ==================== BEBIDAS ====================
function adicionarBebida(nome, preco) {
    const item = {
        id: Date.now(),
        tipo: 'bebida',
        nome: nome,
        quantidade: 1,
        preco: preco,
        total: preco
    };
    
    carrinho.push(item);
    salvarCarrinho();
    atualizarCarrinho();
    
    mostrarNotificacao('Bebida adicionada ao carrinho!');
}

// ==================== CARRINHO ====================
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const isVisible = sidebar.style.display === 'block';
    sidebar.style.display = isVisible ? 'none' : 'block';
}

function atualizarCarrinho() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    
    if (carrinho.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Seu carrinho está vazio</p>
            </div>
        `;
        cartFooter.style.display = 'none';
        cartCount.textContent = '0';
        return;
    }
    
    // Atualizar contador
    const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    cartCount.textContent = totalItens;
    
    // Atualizar itens
    cartItems.innerHTML = '';
    carrinho.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        
        let detalhes = '';
        if (item.tipo === 'marmita') {
            detalhes = `Tamanho: ${item.tamanho}`;
            if (item.ingredientesRemover.length > 0) {
                detalhes += `<br>Sem: ${item.ingredientesRemover.join(', ')}`;
            }
            if (item.observacoes) {
                detalhes += `<br>Obs: ${item.observacoes}`;
            }
        }
        
        itemDiv.innerHTML = `
            <div class="cart-item-header">
                <h4>${item.nome}</h4>
                <button class="remove-item" onclick="removerItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            ${detalhes ? `<div class="cart-item-details">${detalhes}</div>` : ''}
            <div class="cart-item-footer">
                <div class="item-quantity">
                    <button class="qty-btn" onclick="alterarQuantidadeItem(${item.id}, -1)">-</button>
                    <span>${item.quantidade}</span>
                    <button class="qty-btn" onclick="alterarQuantidadeItem(${item.id}, 1)">+</button>
                </div>
                <div class="item-price">R$ ${item.total.toFixed(2).replace('.', ',')}</div>
            </div>
        `;
        
        cartItems.appendChild(itemDiv);
    });
    
    // Atualizar total
    const total = carrinho.reduce((sum, item) => sum + item.total, 0);
    cartTotal.textContent = total.toFixed(2).replace('.', ',');
    cartFooter.style.display = 'block';
}

function alterarQuantidadeItem(id, delta) {
    const item = carrinho.find(item => item.id === id);
    if (!item) return;
    
    item.quantidade = Math.max(1, item.quantidade + delta);
    item.total = item.preco * item.quantidade;
    
    salvarCarrinho();
    atualizarCarrinho();
}

function removerItem(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    salvarCarrinho();
    atualizarCarrinho();
}

function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function irParaCheckout() {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    window.location.href = 'checkout.html';
}

// ==================== CHECKOUT ====================
function carregarCheckout() {
    const orderItems = document.getElementById('orderItems');
    const subtotal = document.getElementById('subtotal');
    const totalFinal = document.getElementById('totalFinal');
    
    if (carrinho.length === 0) {
        window.location.href = 'index.html';
        return;
    }
    
    orderItems.innerHTML = '';
    let total = 0;
    
    carrinho.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        
        let detalhes = '';
        if (item.tipo === 'marmita') {
            detalhes = `<small>Tamanho: ${item.tamanho}`;
            if (item.ingredientesRemover.length > 0) {
                detalhes += ` • Sem: ${item.ingredientesRemover.join(', ')}`;
            }
            detalhes += '</small>';
        }
        
        itemDiv.innerHTML = `
            <div class="order-item-info">
                <h4>${item.nome}</h4>
                ${detalhes}
                <div class="order-item-qty">Qtd: ${item.quantidade}</div>
            </div>
            <div class="order-item-price">R$ ${item.total.toFixed(2).replace('.', ',')}</div>
        `;
        
        orderItems.appendChild(itemDiv);
        total += item.total;
    });
    
    subtotal.textContent = total.toFixed(2).replace('.', ',');
    totalFinal.textContent = (total + TAXA_ENTREGA).toFixed(2).replace('.', ',');
}

function toggleSemNumero() {
    const semNumero = document.getElementById('semNumero').checked;
    const numeroInput = document.getElementById('numero');
    const obsGroup = document.getElementById('obsEnderecoGroup');
    const obsInput = document.getElementById('obsEndereco');
    
    if (semNumero) {
        numeroInput.disabled = true;
        numeroInput.value = '';
        obsGroup.style.display = 'block';
        obsInput.required = true;
    } else {
        numeroInput.disabled = false;
        obsGroup.style.display = 'none';
        obsInput.required = false;
        obsInput.value = '';
    }
}

function toggleTroco() {
    const pagamento = document.querySelector('input[name="pagamento"]:checked');
    const trocoGroup = document.getElementById('trocoGroup');
    
    if (pagamento && pagamento.value === 'dinheiro') {
        trocoGroup.style.display = 'block';
    } else {
        trocoGroup.style.display = 'none';
        document.getElementById('troco').value = '';
    }
}

function finalizarPedido() {
    // Validação
    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const rua = document.getElementById('rua').value.trim();
    const bairro = document.getElementById('bairro').value.trim();
    const semNumero = document.getElementById('semNumero').checked;
    const numero = document.getElementById('numero').value.trim();
    const obsEndereco = document.getElementById('obsEndereco').value.trim();
    
    if (!nome || !telefone || !rua || !bairro) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    if (!semNumero && !numero) {
        alert('Por favor, informe o número da casa ou marque "Sem número"!');
        return;
    }
    
    if (semNumero && !obsEndereco) {
        alert('Por favor, informe uma observação para o endereço sem número!');
        return;
    }
    
    // Montar mensagem
    let mensagem = `🍽️ *NOVO PEDIDO - SABOR DA CASA*\n\n`;
    
    // Dados do cliente
    mensagem += `👤 *DADOS DO CLIENTE*\n`;
    mensagem += `• Nome: ${nome}\n`;
    mensagem += `• Telefone: ${telefone}\n\n`;
    
    // Endereço
    mensagem += `📍 *ENDEREÇO DE ENTREGA*\n`;
    mensagem += `• Rua: ${rua}\n`;
    mensagem += `• Número: ${semNumero ? 'Sem número' : numero}\n`;
    mensagem += `• Bairro: ${bairro}\n`;
    
    const complemento = document.getElementById('complemento').value.trim();
    if (complemento) mensagem += `• Complemento: ${complemento}\n`;
    
    if (semNumero && obsEndereco) mensagem += `• Observação: ${obsEndereco}\n`;
    
    const referencia = document.getElementById('referencia').value.trim();
    if (referencia) mensagem += `• Referência: ${referencia}\n`;
    
    // Itens do pedido
    mensagem += `\n🛒 *ITENS DO PEDIDO*\n`;
    let subtotal = 0;
    
    carrinho.forEach(item => {
        mensagem += `\n• *${item.nome}*\n`;
        if (item.tipo === 'marmita') {
            mensagem += `  - Tamanho: ${item.tamanho}\n`;
            if (item.ingredientesRemover.length > 0) {
                mensagem += `  - Sem: ${item.ingredientesRemover.join(', ')}\n`;
            }
            if (item.observacoes) {
                mensagem += `  - Obs: ${item.observacoes}\n`;
            }
        }
        mensagem += `  - Quantidade: ${item.quantidade}\n`;
        mensagem += `  - Valor: R$ ${item.total.toFixed(2).replace('.', ',')}\n`;
        subtotal += item.total;
    });
    
    // Forma de pagamento
    const pagamento = document.querySelector('input[name="pagamento"]:checked');
    if (pagamento) {
        mensagem += `\n💳 *FORMA DE PAGAMENTO*\n`;
        let formaPagamento = '';
        switch(pagamento.value) {
            case 'dinheiro': formaPagamento = '💵 Dinheiro'; break;
            case 'pix': formaPagamento = '📱 PIX'; break;
            case 'cartao': formaPagamento = '💳 Cartão na Entrega'; break;
        }
        mensagem += `• ${formaPagamento}\n`;
        
        const troco = document.getElementById('troco').value;
        if (pagamento.value === 'dinheiro' && troco) {
            mensagem += `• Troco para: R$ ${parseFloat(troco).toFixed(2).replace('.', ',')}\n`;
        }
    }
    
    // Observações gerais
    const obsGerais = document.getElementById('observacoesGerais').value.trim();
    if (obsGerais) {
        mensagem += `\n📝 *OBSERVAÇÕES GERAIS*\n${obsGerais}\n`;
    }
    
    // Total
    const total = subtotal + TAXA_ENTREGA;
    mensagem += `\n💰 *RESUMO FINANCEIRO*\n`;
    mensagem += `• Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    mensagem += `• Taxa de Entrega: R$ ${TAXA_ENTREGA.toFixed(2).replace('.', ',')}\n`;
    mensagem += `• *TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n`;
    
    // Enviar para WhatsApp
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
    
    // Limpar carrinho
    carrinho = [];
    localStorage.removeItem('carrinho');
    
    alert('Pedido enviado com sucesso! Você será redirecionado para o WhatsApp.');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function voltarMenu() {
    window.location.href = 'index.html';
}

// ==================== ADMIN ====================
function fazerLogin() {
    const senha = document.getElementById('senhaAdmin').value;
    const erroDiv = document.getElementById('erroLogin');
    
    if (senha === SENHA_ADMIN) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
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
    const ingredientesStr = document.getElementById('ingredientesMarmita').value.trim();
    
    if (!nome || !descricao) {
        alert('Por favor, preencha nome e descrição!');
        return;
    }
    
    const ingredientes = ingredientesStr ? 
        ingredientesStr.split(',').map(ing => ing.trim()).filter(ing => ing) : [];
    
    const novaMarmita = {
        id: Date.now(),
        nome: nome,
        descricao: descricao,
        ingredientes: ingredientes
    };
    
    cardapioData.push(novaMarmita);
    localStorage.setItem('cardapio', JSON.stringify(cardapioData));
    
    // Limpar formulário
    document.getElementById('nomeMarmita').value = '';
    document.getElementById('descricaoMarmita').value = '';
    document.getElementById('ingredientesMarmita').value = '';
    
    carregarCardapioAdmin();
    mostrarNotificacao('Marmita adicionada com sucesso!');
}

function carregarCardapioAdmin() {
    const lista = document.getElementById('listaCardapio');
    if (!lista) return;
    
    if (cardapioData.length === 0) {
        lista.innerHTML = `
            <div class="empty-admin">
                <i class="fas fa-utensils"></i>
                <p>Nenhuma marmita cadastrada</p>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = '';
    
    cardapioData.forEach(marmita => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'admin-cardapio-item';
        
        itemDiv.innerHTML = `
            <div class="admin-item-header">
                <h4>${marmita.nome}</h4>
                <button class="remove-admin-btn" onclick="removerMarmita(${marmita.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p class="admin-item-desc">${marmita.descricao}</p>
            ${marmita.ingredientes.length > 0 ? 
                `<p class="admin-item-ingredients"><strong>Ingredientes:</strong> ${marmita.ingredientes.join(', ')}</p>` : 
                ''
            }
            <div class="admin-item-prices">
                <span class="admin-price">Média: R$ 17,00</span>
                <span class="admin-price">Grande: R$ 19,00</span>
            </div>
        `;
        
        lista.appendChild(itemDiv);
    });
}

function removerMarmita(id) {
    if (confirm('Tem certeza que deseja remover esta marmita do cardápio?')) {
        cardapioData = cardapioData.filter(marmita => marmita.id !== id);
        localStorage.setItem('cardapio', JSON.stringify(cardapioData));
        carregarCardapioAdmin();
        mostrarNotificacao('Marmita removida com sucesso!');
    }
}

function logout() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('senhaAdmin').value = '';
}

// ==================== UTILITÁRIOS ====================
function mostrarNotificacao(mensagem) {
    // Criar elemento de notificação
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${mensagem}</span>
    `;
    
    document.body.appendChild(notif);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

// Fechar modal ao clicar fora
document.addEventListener('click', function(e) {
    const modal = document.getElementById('marmitaModal');
    if (e.target === modal) {
        fecharModal();
    }
});

// Responsividade do carrinho
function checkMobile() {
    const cartSidebar = document.getElementById('cartSidebar');
    const closeBtn = document.querySelector('.close-cart');
    
    if (window.innerWidth <= 768) {
        if (cartSidebar) {
            cartSidebar.style.position = 'fixed';
            cartSidebar.style.top = '0';
            cartSidebar.style.right = '0';
            cartSidebar.style.height = '100vh';
            cartSidebar.style.zIndex = '1001';
            cartSidebar.style.display = 'none';
        }
        if (closeBtn) closeBtn.style.display = 'block';
    } else {
        if (cartSidebar) {
            cartSidebar.style.position = 'sticky';
            cartSidebar.style.display = 'block';
        }
        if (closeBtn) closeBtn.style.display = 'none';
    }
}

window.addEventListener('resize', checkMobile);
window.addEventListener('load', checkMobile);
