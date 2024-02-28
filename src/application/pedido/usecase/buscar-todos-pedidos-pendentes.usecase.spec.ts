import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PedidoProviders } from 'src/application/pedido/providers/pedido.providers';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IPedidoRepository } from 'src/enterprise/pedido/repository/pedido.repository.interface';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { PedidoConstants } from 'src/shared/constants';
import { BuscarTodosPedidosPendentesUseCase } from './buscar-todos-pedidos-pendentes.usecase';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { HttpModule } from '@nestjs/axios';
import { ClienteProviders } from 'src/application/cliente/providers/cliente.providers';

describe('BuscarTodosPedidosPendentesUseCase', () => {
  let useCase: BuscarTodosPedidosPendentesUseCase;
  let repository: IPedidoRepository;

  const pedidoPendente1: Pedido = {
    id: 1,
    clienteId: 101,
    dataInicio: '2023-08-26',
    estadoPedido: EstadoPedido.PAGAMENTO_PENDENTE,
    ativo: true,
    total: 50.0,
  };

  const pedidoPendente2: Pedido = {
    id: 2,
    clienteId: 102,
    dataInicio: '2023-08-26',
    estadoPedido: EstadoPedido.PAGAMENTO_PENDENTE,
    ativo: true,
    total: 75.0,
  };

  const pedidosPendentesMock: Pedido[] = [pedidoPendente1, pedidoPendente2];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [...PedidoProviders, ...IntegrationProviders, ...ClienteProviders, ...PersistenceInMemoryProviders],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    useCase = module.get<BuscarTodosPedidosPendentesUseCase>(PedidoConstants.BUSCAR_TODOS_PEDIDOS_PENDENTES_USECASE);
    repository = module.get<IPedidoRepository>(PedidoConstants.IREPOSITORY);
  });

  describe('buscarTodosPedidosPendentes', () => {
    it('deve buscar todos os pedidos pendentes com sucesso', async () => {
      jest.spyOn(repository, 'listarPedidosPendentes').mockResolvedValue(pedidosPendentesMock);

      const result = await useCase.buscarTodosPedidosPendentes();

      expect(result).toEqual(pedidosPendentesMock);
    });

    it('deve lançar uma ServiceException em caso de erro no repositório', async () => {
      const error = new Error('Erro no repositório');
      jest.spyOn(repository, 'listarPedidosPendentes').mockRejectedValue(error);

      await expect(useCase.buscarTodosPedidosPendentes()).rejects.toThrowError(ServiceException);
    });
  });
});
