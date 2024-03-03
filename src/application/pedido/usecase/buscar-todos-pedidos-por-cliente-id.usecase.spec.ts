import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PedidoProviders } from 'src/application/pedido/providers/pedido.providers';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IPedidoRepository } from 'src/enterprise/pedido/repository/pedido.repository.interface';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { PedidoConstants } from 'src/shared/constants';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { HttpModule } from '@nestjs/axios';
import { ClienteProviders } from 'src/application/cliente/providers/cliente.providers';
import { BuscarTodosPedidosPorClienteIdUseCase } from 'src/application/pedido/usecase/buscar-todos-pedidos-por-cliente-id-usecase';

describe('BuscarTodosPedidosPorClienteIdUseCase', () => {
  let buscarTodosPedidosPorClienteIdUseCase: BuscarTodosPedidosPorClienteIdUseCase;
  let repository: IPedidoRepository;

  const pedidoDoClienteId1: Pedido = {
    id: 1,
    clienteId: 1,
    dataInicio: '2023-08-26',
    estadoPedido: EstadoPedido.EM_PREPARACAO,
    ativo: true,
    total: 50.0,
  };

  const pedidos: Pedido[] = [pedidoDoClienteId1];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [...PedidoProviders, ...IntegrationProviders, ...ClienteProviders, ...PersistenceInMemoryProviders],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    buscarTodosPedidosPorClienteIdUseCase = module.get<BuscarTodosPedidosPorClienteIdUseCase>(
      PedidoConstants.BUSCAR_TODOS_PEDIDOS_POR_CLIENTE_ID_USECASE,
    );
    repository = module.get<IPedidoRepository>(PedidoConstants.IREPOSITORY);
  });

  describe('buscar todos os pedidos por cliente id', () => {
    it('deve buscar todos os pedidos por cliente id com sucesso', async () => {
      jest.spyOn(repository, 'findBy').mockResolvedValue(pedidos);

      const result = await buscarTodosPedidosPorClienteIdUseCase.buscarTodosPedidosPorCliente(1);

      expect(result).toEqual(pedidos);
    });

    it('deve lançar uma ServiceException em caso de erro no repositório', async () => {
      const error = new Error('Erro no repositório');
      jest.spyOn(repository, 'findBy').mockRejectedValue(error);

      await expect(buscarTodosPedidosPorClienteIdUseCase.buscarTodosPedidosPorCliente(1)).rejects.toThrowError(
        ServiceException,
      );
    });
  });
});
