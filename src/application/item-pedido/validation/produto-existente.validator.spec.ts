import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ProdutoExistentePedidoValidator } from './produto-existente.validator';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { ProdutoConstants } from 'src/shared/constants';
import { ItemPedido } from 'src/enterprise/item-pedido/model';
import { ProdutoIntegration } from 'src/integration/produto/produto.integration';
import { ProdutoDto } from 'src/enterprise/produto/produto-dto';
import { HttpModule } from '@nestjs/axios';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';
import { PedidoProviders } from 'src/application/pedido/providers/pedido.providers';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';

describe('ProdutoExistentePedidoValidator', () => {
  let validator: ProdutoExistentePedidoValidator;
  let produtoIntegration: ProdutoIntegration;

  const produto: ProdutoDto = {
    id: 1,
    nome: 'nome correto',
    idCategoriaProduto: 1,
    descricao: 'Teste',
    preco: 10,
    imagemBase64: '',
    ativo: true,
  };

  const itemPedido: ItemPedido = {
    pedidoId: 1,
    produtoId: 2,
    quantidade: 3,
    id: 123,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [
        ...IntegrationProviders,
        ...PedidoProviders,
        ...PersistenceInMemoryProviders,
        ProdutoExistentePedidoValidator,
        {
          provide: ProdutoConstants.IREPOSITORY,
          useValue: {
            findBy: jest.fn(() => {
              return Promise.resolve([produto]);
            }),
          },
        },
      ],
    }).compile();

    module.useLogger(false);

    produtoIntegration = module.get<ProdutoIntegration>(ProdutoIntegration);
    validator = module.get<ProdutoExistentePedidoValidator>(ProdutoExistentePedidoValidator);
  });

  describe('injeção de dependências', () => {
    it('deve existir instância de produtoIntegration definida', async () => {
      expect(produtoIntegration).toBeDefined();
    });
  });

  describe('validate', () => {
    it('deve validar pedido quando existir um produto', async () => {
      produtoIntegration.getProdutoById = jest.fn().mockImplementation(() => {
        Promise.resolve(produto);
      });
      const result = await validator.validate(itemPedido);

      expect(result).toBeTruthy();
    });

    it('não deve validar pedido quando não existir um produto', async () => {
      produtoIntegration.getProdutoById = jest.fn().mockImplementation(() => {
        throw new NaoEncontradoApplicationException('Pagamento não encontrado');
      });

      await expect(validator.validate(itemPedido)).rejects.toThrowError(ValidationException);
    });
  });
});
