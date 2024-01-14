const { getCurrentDate, getEstadoDoPedido } = require('../step_definitions/utils');

const novoPedido = {
  dataInicio: getCurrentDate(),
  clienteId: 1,
  estadoPedido: 0,
  ativo: true,
};

const pedido1 = {
  ...novoPedido,
  id: 1,
};

const pedido2 = {
  ...novoPedido,
  id: 2,
};

const pedidoEditado1 = {
  ...pedido1,
  estadoPedido: getEstadoDoPedido('EM PREPARACAO'),
};

const pedidoEditado2 = {
  ...pedido2,
  estadoPedido: getEstadoDoPedido('PRONTO'),
};

const novoPedidoInteraction = {
  request: {
    method: 'POST',
    path: '/v1/pedido',
    body: novoPedido,
  },
  response: {
    onCall: {
      0: {
        status: 201,
        body: pedido1,
      },
      1: {
        status: 201,
        body: pedido1,
      },
      2: {
        status: 201,
        body: pedido2,
      },
      // item-pedido
      3: {
        status: 201,
        body: pedido1,
      },
    },
  },
};

const checkoutPedidoInteraction = {
  request: {
    strict: false,
    method: 'POST',
    path: '/v1/pedido/checkout/1',
  },
  response: {
    status: 200,
    body: {
      pagamento: {
        transacaoId: 'alguma-transacaoId',
      },
    },
  },
};

const getPedidoPorIdInteraction = {
  request: {
    strict: false,
    method: 'GET',
    path: '/v1/pedido/1',
  },
  response: {
    status: 200,
    body: pedido1,
  },
};

const getTodosOsPedidosInteraction = {
  request: {
    method: 'GET',
    path: '/v1/pedido',
  },
  response: {
    status: 200,
    body: [pedidoEditado2, pedidoEditado1],
  },
};

const getTodosOsPedidosPendentesInteraction = {
  request: {
    method: 'GET',
    path: '/v1/pedido/pendentes',
  },
  response: {
    status: 200,
    body: [
      {
        ...pedido1,
        estadoPedido: getEstadoDoPedido('RECEBIDO'),
      },
      {
        ...pedido2,
        estadoPedido: getEstadoDoPedido('EM PREPARACAO'),
      },
    ],
  },
};

const editarPedido1Interaction = {
  request: {
    method: 'PUT',
    path: '/v1/pedido/1',
  },
  response: {
    status: 200,
    body: pedidoEditado1,
  },
};

const editarPedido2Interaction = {
  request: {
    method: 'PUT',
    path: '/v1/pedido/2',
  },
  response: {
    status: 200,
    body: pedidoEditado2,
  },
};

const getEstadoDoPedidoInteraction = {
  request: {
    method: 'GET',
    path: '/v1/pedido/1/estado',
  },
  response: {
    status: 200,
    body: {
      estadoPedido: 1,
    },
  },
};

const getEstadoDoPedidoRejeitadoInteraction = {
  request: {
    method: 'GET',
    path: '/v1/pedido/2/estado',
  },
  response: {
    status: 200,
    body: {
      estadoPedido: 0,
    },
  },
};

module.exports = {
  checkoutPedidoInteraction,
  editarPedido1Interaction,
  editarPedido2Interaction,
  getEstadoDoPedidoInteraction,
  getEstadoDoPedidoRejeitadoInteraction,
  getPedidoPorIdInteraction,
  getTodosOsPedidosInteraction,
  getTodosOsPedidosPendentesInteraction,
  novoPedido,
  novoPedidoInteraction,
  pedido1,
  pedido2,
  pedidoEditado1,
  pedidoEditado2,
};
