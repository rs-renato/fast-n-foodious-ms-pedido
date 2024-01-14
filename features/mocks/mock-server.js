const { mock } = require('pactum');

const { novoProdutoInteraction } = require('./produto');
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
const {
  novoItemPedidoInteraction,
  editarItemPedidoInteraction,
  deleteItemPedidoInteraction,
} = require('./item-pedido');
const { novoClienteInteraction } = require('./cliente');

async function startMockServer() {
  const mockOpts = { port: 3000, host: '127.0.0.1' };
  await mock.setDefaults(mockOpts);

  // Produto
  mock.addInteraction(novoProdutoInteraction);

  // Pedido
  mock.addInteraction(editarPedido1Interaction);
  mock.addInteraction(editarPedido2Interaction);
  mock.addInteraction(novoPedidoInteraction);
  mock.addInteraction(checkoutPedidoInteraction);
  mock.addInteraction(getEstadoDoPedidoInteraction);
  mock.addInteraction(getEstadoDoPedidoRejeitadoInteraction);
  mock.addInteraction(getPedidoPorIdInteraction);
  mock.addInteraction(getTodosOsPedidosInteraction);
  mock.addInteraction(getTodosOsPedidosPendentesInteraction);

  // Item do Pedido
  mock.addInteraction(novoItemPedidoInteraction);
  mock.addInteraction(editarItemPedidoInteraction);
  mock.addInteraction(deleteItemPedidoInteraction);

  // Cliente
  mock.addInteraction(novoClienteInteraction);

  await mock.start();
}

async function stopMockServer() {
  await mock.stop();
}

module.exports = {
  startMockServer,
  stopMockServer,
};
