const novoProduto = {
  nome: 'X Burguer',
  idCategoriaProduto: 1,
  descricao: 'X Burguer',
  preco: 10,
  imagemBase64: '',
  ativo: true,
};

const novoProdutoInteraction = {
  request: {
    method: 'POST',
    path: '/v1/produto',
    body: novoProduto,
  },
  response: {
    status: 200,
    body: {
      ...novoProduto,
      id: 1,
    },
  },
};

module.exports = {
  novoProduto,
  novoProdutoInteraction,
};
