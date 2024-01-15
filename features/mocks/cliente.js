const novoCliente = {
  nome: 'Benjamin',
  email: 'benjamin@test.com',
  cpf: '54462836510',
};

const novoClienteInteraction = {
  request: {
    method: 'POST',
    path: '/v1/cliente',
    body: novoCliente,
  },
  response: {
    status: 201,
    body: {
      ...novoCliente,
      id: 1,
    },
  },
};

module.exports = {
  novoCliente,
  novoClienteInteraction,
};
