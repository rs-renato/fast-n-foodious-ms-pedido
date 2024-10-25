const { Given, When, Then } = require('@cucumber/cucumber');
const { spec, expect } = require('pactum');

const { getCurrentDate } = require('./utils');
const { BASE_URL } = require('../config');
const { novoPedido, pedidoEditado2, pedidoEditado1 } = require('../mocks');

When('Nos solicitamos a criacao de um novo pedido com os dados:', async function ({ rawTable }) {
  const formattedData = rawTable
    .map(([clienteId, estadoPedido, ativo], index) => {
      if (index !== 0) {
        return {
          clienteId: Number(clienteId),
          dataInicio: getCurrentDate(),
          estadoPedido: Number(estadoPedido),
          ativo: ativo === 'true',
        };
      }
    })
    .filter((content) => content);
  const novoPedido = formattedData[0];

  this.payload = novoPedido;
  this.response = await spec().post(BASE_URL.PEDIDO).withBody(this.payload);
  this.pedidoId = this.response.body.id;
});

When('Nos solicitamos a consulta do pedido com id {string}', async function (pedidoId) {
  this.response = await spec().get(`${BASE_URL.PEDIDO}/{pedidoId}`).withPathParams({
    pedidoId,
  });
});

Then('O pedido deve conter os dados:', async function ({ rawTable }) {
  const formattedData = rawTable
    .map(([id, clienteId, estadoPedido, ativo], index) => {
      if (index > 0) {
        return {
          id: Number(id),
          clienteId: Number(clienteId),
          dataInicio: getCurrentDate(),
          estadoPedido: Number(estadoPedido),
          ativo: ativo === 'true',
        };
      }
    })
    .filter((content) => content);
  const pedido = formattedData[0];

  expect(this.response).should.have.body(pedido);
});

When('Nos solicitamos a edicao de um pedido com os dados:', async function ({ rawTable }) {
  let pedidoId = null;
  const formattedData = rawTable
    .map(([id, clienteId, estadoPedido, ativo], index) => {
      if (index !== 0) {
        pedidoId = id;

        return {
          id: Number(id),
          clienteId: Number(clienteId),
          dataInicio: getCurrentDate(),
          estadoPedido: Number(estadoPedido),
          ativo: ativo === 'true',
        };
      }
    })
    .filter((content) => content);
  const pedido = formattedData[0];
  this.payload = pedido;

  this.response = await spec().put(`${BASE_URL.PEDIDO}/{pedidoId}`).withPathParams({
    pedidoId,
  });
});

Given('Nos temos pedidos cadastrados com estado recebido, em preparacao e pronto', async function () {
  const pedido1 = novoPedido;
  const pedido2 = novoPedido;

  this.response1 = await spec().post(BASE_URL.PEDIDO).withBody(pedido1);
  this.response2 = await spec().post(BASE_URL.PEDIDO).withBody(pedido2);

  this.pedido1Id = this.response1.body.id;
  this.pedido2Id = this.response2.body.id;

  const pedidoAtualizado1 = {
    ...pedido1,
    id: this.pedido1Id,
    estadoPedido: 2,
  };

  const pedidoAtualizado2 = {
    ...pedido2,
    id: this.pedido2Id,
    estadoPedido: 3,
  };

  this.pedido1Editado = await spec().put(`${BASE_URL.PEDIDO}/{pedido_id}`).withPathParams({
    pedido_id: pedidoAtualizado1.id,
  });

  this.pedido2Editado = await spec().put(`${BASE_URL.PEDIDO}/{pedido_id}`).withPathParams({
    pedido_id: pedidoAtualizado2.id,
  });
});

When('Nos solicitamos todos os pedidos', async function () {
  this.response = await spec().get(BASE_URL.PEDIDO);
});

Then('Os pedidos devem ser apresentados na ordem esperada', function () {
  const pedidosEsperados = [pedidoEditado2, pedidoEditado1];

  expect(this.response).should.have.body(pedidosEsperados);
});

When('Nos solicitamos todos os pedidos pendentes', async function () {
  this.response = await spec().get(`${BASE_URL.PEDIDO}/pendentes`);
});

Then('Os pedidos pendentes devem ser listados com os dados:', async function ({ rawTable }) {
  const formattedData = rawTable
    .map(([id, clienteId, estadoPedido, ativo], index) => {
      if (index !== 0) {
        pedidoId = id;

        return {
          id: Number(id),
          clienteId: Number(clienteId),
          dataInicio: getCurrentDate(),
          estadoPedido: Number(estadoPedido),
          ativo: ativo === 'true',
        };
      }
    })
    .filter((content) => content);
  const pedidos = formattedData;

  expect(this.response).should.have.body(pedidos);
});

When('Nos solicitamos o estado do pedido de id {string}', async function (pedidoId) {
  this.response = await spec()
    .get(`${BASE_URL.PEDIDO}/{pedidoId}/estado`)
    .withPathParams({
      pedidoId: Number(pedidoId),
    });
});

Then('O pedido deve retornar com o estado {int}', function (estadoPedido) {
  const resultadoEsperado = {
    estadoPedido,
  };
  expect(this.response).should.have.body(resultadoEsperado);
});

When('Nos solicitamos o checkout do pedido de id {int}', async function (pedidoId) {
  this.response = await spec().post(`${BASE_URL.PEDIDO}/checkout/{pedidoId}`).withPathParams({
    pedidoId,
  });
});

Then('O pedido deve retornar com o id da transacao', function () {
  expect(this.response).should.have.bodyContains('pagamento');
});
