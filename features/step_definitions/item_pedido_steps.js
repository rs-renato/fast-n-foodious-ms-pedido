const { Given, When } = require('@cucumber/cucumber');
const { spec } = require('pactum');
const { getCurrentDate } = require('./utils');
const { BASE_URL } = require('../config');

let globalItemId;
let globalPedidoId;
let globalProdutoId;

Given('Nos temos um produto cadastrado', async function () {
  if (this.produtoId !== undefined) {
    return true;
  } else {
    const novoProduto = {
      nome: 'X Burguer',
      idCategoriaProduto: 1,
      descricao: 'X Burguer',
      preco: 10,
      imagemBase64: '',
      ativo: true,
    };

    const response = await spec().post(BASE_URL.PRODUTO).withBody(novoProduto);
    this.produtoId = response.body.id;
    globalProdutoId = this.produtoId;
  }
});

Given('Temos um cliente cadastrado', async function () {
  const novoCliente = {
    nome: 'Benjamin',
    email: 'benjamin@test.com',
    cpf: '54462836510',
  };

  const response = await spec().post(BASE_URL.CLIENTE).withBody(novoCliente);
  this.clienteId = response.body.id;
  globalClienteId = this.clienteId;
});

Given('Temos um pedido criado', async function () {
  if (this.pedidoId !== undefined) {
    return true;
  } else {
    const novoPedido = {
      clienteId: this.clienteId,
      dataInicio: getCurrentDate(),
      estadoPedido: 0,
      ativo: true,
    };

    const response = await spec().post(BASE_URL.PEDIDO).withBody(novoPedido);
    this.pedidoId = response.body.id;
    globalPedidoId = this.pedidoId;
  }
});

Given('Nos temos um item adicionado', async function () {
  if (globalItemId !== undefined) {
    return true;
  } else {
    const novoItem = {
      pedidoId: this.pedidoId,
      produtoId: this.produtoId,
      quantidade: 1,
    };

    this.response = await spec().post(BASE_URL.ITEM).withBody(novoItem);
    this.itemId = this.response.body.id;
    globalItemId = this.itemId;
  }
});

When('Nos adicionamos o item cadastrado ao pedido', async function () {
  const novoItem = {
    pedidoId: this.pedidoId,
    produtoId: this.produtoId,
    quantidade: 1,
  };

  this.response = await spec().post(BASE_URL.ITEM).withBody(novoItem);
  this.itemId = this.response.body.id;
  globalItemId = this.itemId;
});

When('Nos alteramos a quantidade desse item para {int}', async function (quantidade) {
  const itemEditado = {
    pedidoId: globalPedidoId,
    produtoId: globalProdutoId,
    quantidade,
  };

  this.response = await spec()
    .put(`${BASE_URL.ITEM}/{itemId}`)
    .withPathParams({
      itemId: globalItemId,
    })
    .withBody(itemEditado);
});

When('Nos removemos este item', async function () {
  this.response = await spec().delete(`${BASE_URL.ITEM}/{itemId}`).withPathParams({
    itemId: globalItemId,
  });
});
