import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ItemPedidoProviders } from 'src/application/item-pedido/providers/item-pedido.providers';
import { PedidoProviders } from 'src/application/pedido/providers/pedido.providers';
import { BuscarItensPorPedidoIdUseCase } from 'src/application/pedido/usecase/buscar-itens-por-pedido-id.usecase';
import { EditarPedidoUseCase } from 'src/application/pedido/usecase/editar-pedido.usecase';
import { Cliente } from 'src/enterprise/cliente/model/cliente.model';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { ItemPedido } from 'src/enterprise/item-pedido/model/item-pedido.model';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { ClienteConstants, PedidoConstants, ProdutoConstants } from 'src/shared/constants';
import { CheckoutPedidoUseCase } from './checkout-pedido.usecase';
import { BuscarProdutoPorIdUseCase } from 'src/application/pedido/usecase/buscar-produto-por-id.usecase';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { HttpModule } from '@nestjs/axios';
import { ProdutoIntegration } from 'src/integration/produto/produto.integration';
import { ProdutoDto } from 'src/enterprise/produto/produto-dto';
import { PedidoComDadosDePagamento } from 'src/application/pedido/service/pedido.service.interface';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';
import { PagamentoRestIntegration } from 'src/integration/pagamento/pagamento.rest.integration';
import { SqsIntegration } from 'src/integration/sqs/sqs.integration';
import { SendMessageCommandOutput } from '@aws-sdk/client-sqs';

describe('CheckoutPedidoUseCase', () => {
  let useCase: CheckoutPedidoUseCase;
  let buscarItensPorPedidoIdUseCase: BuscarItensPorPedidoIdUseCase;
  let buscarProdutoPorIdUseCase: BuscarProdutoPorIdUseCase;
  let editarPedidoUseCase: EditarPedidoUseCase;
  let clienteRepository: IRepository<Cliente>;
  let pagamentoSqsIntegration: SqsIntegration;
  let pagamentoRestIntegration: PagamentoRestIntegration;
  let produtoIntegration: ProdutoIntegration;

  const itemPedidoMock: ItemPedido = {
    pedidoId: 1,
    produtoId: 1,
    quantidade: 2,
    id: 1,
  };

  const pedido: Pedido = {
    id: 1,
    clienteId: 101,
    dataInicio: '2023-08-26',
    estadoPedido: EstadoPedido.PAGAMENTO_PENDENTE,
    ativo: true,
    itensPedido: [itemPedidoMock],
  };

  const expectedCheckoutPedido = {
    pedido,
    pagamento: undefined,
    // pagamento: {
    //   dataHoraPagamento: undefined,
    //   estadoPagamento: 0,
    //   id: 1,
    //   pedidoId: 1,
    //   total: 20,
    //   transacaoId: '863c99369e3d033aa1f080419d0502b226b3718945ba425481c9f565a85be8c8',
    // },
  };

  const produto: ProdutoDto = {
    id: 1,
    nome: 'Produto Teste',
    idCategoriaProduto: 1,
    descricao: 'Descrição do Produto Teste',
    preco: 10.0,
    imagemBase64: 'Imagem em base64',
    ativo: true,
  };

  const cliente: Cliente = {
    id: 1,
    nome: 'Teste',
    email: 'teste@teste.com',
    cpf: '25634428777',
  };

  const output: SendMessageCommandOutput = {
    $metadata: {
      httpStatusCode: 200,
      requestId: '12345',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [
        ...PedidoProviders,
        ...ItemPedidoProviders,
        ...IntegrationProviders,
        ...PersistenceInMemoryProviders,

        // Mock do serviço IRepository<Cliente>
        {
          provide: ClienteConstants.IREPOSITORY,
          useValue: {
            findBy: jest.fn(() => Promise.resolve([cliente])),
          },
        },
        // Mock do serviço IRepository<Pedido>
        {
          provide: PedidoConstants.IREPOSITORY,
          useValue: {
            findBy: jest.fn(() => Promise.resolve([pedido])),
            edit: jest.fn(() => Promise.resolve(pedido)),
          },
        },
      ],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    useCase = module.get<CheckoutPedidoUseCase>(PedidoConstants.CHECKOUT_PEDIDO_USECASE);
    buscarItensPorPedidoIdUseCase = module.get<BuscarItensPorPedidoIdUseCase>(
      PedidoConstants.BUSCAR_ITENS_PEDIDO_POR_PEDIDO_ID_USECASE,
    );
    buscarProdutoPorIdUseCase = module.get<BuscarProdutoPorIdUseCase>(ProdutoConstants.BUSCAR_PRODUTO_POR_ID_USECASE);
    editarPedidoUseCase = module.get<EditarPedidoUseCase>(PedidoConstants.EDITAR_PEDIDO_USECASE);
    clienteRepository = module.get<IRepository<Cliente>>(ClienteConstants.IREPOSITORY);
    pagamentoSqsIntegration = module.get<SqsIntegration>(SqsIntegration);
    pagamentoRestIntegration = module.get<PagamentoRestIntegration>(PagamentoRestIntegration);
    produtoIntegration = module.get<ProdutoIntegration>(ProdutoIntegration);
  });

  async function fazCheckout(): Promise<PedidoComDadosDePagamento> {
    jest.spyOn(buscarItensPorPedidoIdUseCase, 'buscarItensPedidoPorPedidoId').mockResolvedValue([itemPedidoMock]);
    jest.spyOn(buscarProdutoPorIdUseCase, 'buscarProdutoPorID').mockResolvedValue(produto);
    jest.spyOn(editarPedidoUseCase, 'editarPedido').mockResolvedValue(pedido);

    pagamentoRestIntegration.buscarPorPedidoId = jest.fn(() => {
      throw new NaoEncontradoApplicationException('Pagamento não encontrado');
    });

    jest.spyOn(produtoIntegration, 'getProdutoById').mockResolvedValue(produto);

    jest.spyOn(pagamentoSqsIntegration, 'sendSolicitaPagamentoPedido').mockResolvedValue(output);

    return await useCase.checkout(pedido);
  }

  describe('checkout', () => {
    it('deve realizar o checkout do pedido com sucesso', async () => {
      const result = await fazCheckout();

      expect(result).toEqual(expectedCheckoutPedido);
    });

    it('deve calcular corretamente o total do pedido', async () => {
      const result = await fazCheckout();

      expect(result.pedido.total).toEqual(itemPedidoMock.quantidade * produto.preco);
    });

    it('deve lançar uma ValidationException se o cliente do pedido não existir', async () => {
      jest.spyOn(clienteRepository, 'findBy').mockResolvedValue([]);
      jest.spyOn(buscarItensPorPedidoIdUseCase, 'buscarItensPedidoPorPedidoId').mockResolvedValue([itemPedidoMock]);
      jest.spyOn(buscarProdutoPorIdUseCase, 'buscarProdutoPorID').mockResolvedValue(produto);
      jest.spyOn(editarPedidoUseCase, 'editarPedido').mockResolvedValue(pedido);

      const pedidoInvalido = { ...pedido, clienteId: 999 };

      await expect(useCase.checkout(pedidoInvalido)).rejects.toThrowError(ValidationException);
    });
  });
});
