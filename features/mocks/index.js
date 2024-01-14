const { novoProduto } = require('./produto');
const { novoCliente } = require('./cliente');
const { novoPedido, pedidoEditado1, pedidoEditado2 } = require('./pedido');
const { novoItemPedido } = require('./item-pedido');

module.exports = {
  novoCliente,
  novoProduto,
  novoPedido,
  novoItemPedido,
  pedidoEditado1,
  pedidoEditado2,
};
