const novoItemPedido = {
  pedidoId: 1,
  produtoId: 1,
  quantidade: 1,
};

const itemPedido1 = {
  ...novoItemPedido,
  id: 1,
};

const itemEditado1 = {
  ...itemPedido1,
  quantidade: 2,
};

const novoItemPedidoInteraction = {
  request: {
    method: 'POST',
    path: '/v1/item',
    body: novoItemPedido,
  },
  response: {
    status: 201,
    body: itemPedido1,
  },
};

const editarItemPedidoInteraction = {
  request: {
    method: 'PUT',
    path: '/v1/item/1',
    body: { ...novoItemPedido, quantidade: 2 },
  },
  response: {
    status: 200,
    body: itemEditado1,
  },
};

const deleteItemPedidoInteraction = {
  request: {
    method: 'DELETE',
    path: '/v1/item/1',
  },
  response: {
    status: 200,
  },
};

module.exports = {
  novoItemPedido,
  novoItemPedidoInteraction,
  editarItemPedidoInteraction,
  deleteItemPedidoInteraction,
};
