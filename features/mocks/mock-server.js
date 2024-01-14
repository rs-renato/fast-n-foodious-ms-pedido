const { mock } = require('pactum');

const {
  novoPedidoInteraction,
  checkoutPedidoInteraction,
  getEstadoDoPedidoInteraction,
  getEstadoDoPedidoRejeitadoInteraction,
  getPedidoPorIdInteraction,
  getTodosOsPedidosInteraction,
  editarPedido1Interaction,
  editarPedido2Interaction,
  getTodosOsPedidosPendentesInteraction,
} = require('./pedido');
const { novoItemPedidoInteraction } = require('./item-pedido');
const { pagamentoAceitoInteraction, pagamentoRejeitadoInteraction } = require('./pagamento');

async function startMockServer() {
  const mockOpts = { port: 3000, host: '127.0.0.1' };
  await mock.setDefaults(mockOpts);

  // Pedido
  mock.addInteraction(editarPedido1Interaction);
  mock.addInteraction(editarPedido2Interaction);
  mock.addInteraction(novoPedidoInteraction);
  mock.addInteraction(novoItemPedidoInteraction);
  mock.addInteraction(checkoutPedidoInteraction);
  mock.addInteraction(getEstadoDoPedidoInteraction);
  mock.addInteraction(getEstadoDoPedidoRejeitadoInteraction);
  mock.addInteraction(getPedidoPorIdInteraction);
  mock.addInteraction(getTodosOsPedidosInteraction);
  mock.addInteraction(getTodosOsPedidosPendentesInteraction);

  // Pagamento
  mock.addInteraction(pagamentoAceitoInteraction);
  mock.addInteraction(pagamentoRejeitadoInteraction);

  await mock.start();
}

async function stopMockServer() {
  await mock.stop();
}

module.exports = {
  startMockServer,
  stopMockServer,
};
