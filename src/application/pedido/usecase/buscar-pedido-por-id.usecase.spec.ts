import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PedidoProviders } from 'src/application/pedido/providers/pedido.providers';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IPedidoRepository } from 'src/enterprise/pedido/repository/pedido.repository.interface';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { PedidoConstants } from 'src/shared/constants';
import { BuscarPedidoPorIdUseCase } from './buscar-pedido-por-id.usecase';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { HttpModule } from '@nestjs/axios';
import { ProdutoIntegration } from 'src/integration/produto/produto.integration';
import { IntegrationApplicationException } from 'src/application/exception/integration-application.exception';
import { ClienteProviders } from 'src/application/cliente/providers/cliente.providers';

describe('BuscarPedidoPorIdUseCase', () => {
  let useCase: BuscarPedidoPorIdUseCase;
  let repository: IPedidoRepository;
  let produtoIntegration: ProdutoIntegration;

  const pedidoId = 123;
  const pedidoMock: Pedido = {
    id: pedidoId,
    clienteId: 456,
    dataInicio: '2023-08-26',
    estadoPedido: EstadoPedido.EM_PREPARACAO,
    ativo: true,
    total: 100.0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [...PedidoProviders, ...IntegrationProviders, ...ClienteProviders, ...PersistenceInMemoryProviders],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    useCase = module.get<BuscarPedidoPorIdUseCase>(PedidoConstants.BUSCAR_PEDIDO_POR_ID_USECASE);
    repository = module.get<IPedidoRepository>(PedidoConstants.IREPOSITORY);
    produtoIntegration = module.get<ProdutoIntegration>(ProdutoIntegration);
  });

  describe('buscarPedidoPorId', () => {
    it('deve buscar um pedido por ID com sucesso', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([pedidoMock]);

      const result = await useCase.buscarPedidoPorId(pedidoId);

      expect(result).toEqual(pedidoMock);
    });

    it('deve buscar um pedido por ID com sucesso (sem itens)', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([pedidoMock]);

      const result = await useCase.buscarPedidoPorId(pedidoId, false);

      expect(result).toEqual(pedidoMock);
    });

    it('deve lançar uma ServiceException em caso de erro no repositório', async () => {
      const error = new Error('Erro no repositório');
      jest.spyOn(repository, 'find').mockRejectedValue(error);

      await expect(useCase.buscarPedidoPorId(pedidoId)).rejects.toThrowError(ServiceException);
    });

    it('deve lançar uma IntegrationApplicationException em caso de erro na integração', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([pedidoMock]);
      jest.spyOn(produtoIntegration, 'populaProdutoEmItemPedido').mockRejectedValue(new Error('any error'));

      await expect(useCase.buscarPedidoPorId(pedidoId)).rejects.toThrowError(IntegrationApplicationException);
    });
  });
});
