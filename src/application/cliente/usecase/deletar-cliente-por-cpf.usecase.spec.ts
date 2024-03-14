import { Test, TestingModule } from '@nestjs/testing';
import { ClienteProviders } from 'src/application/cliente/providers/cliente.providers';
import { BuscarClientePorCpfUseCase } from 'src/application/cliente/usecase/buscar-cliente-por-cpf.usecase';
import { ClienteIdentificado } from 'src/enterprise/cliente/model/cliente-identificado.model';
import { Cliente } from 'src/enterprise/cliente/model/cliente.model';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { ClienteConstants, PedidoConstants } from 'src/shared/constants';
import { DeletarClientePorCpfUseCase } from 'src/application/cliente/usecase/deletar-cliente-por-cpf.usecase';
import { PedidoProviders } from 'src/application/pedido/providers/pedido.providers';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { BuscarTodosPedidosPorClienteIdUseCase } from 'src/application/pedido/usecase/buscar-todos-pedidos-por-cliente-id-usecase';
import { IRepository } from 'src/enterprise/repository/repository';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { SqsIntegration } from 'src/integration/sqs/sqs.integration';
import { SendMessageCommandOutput } from '@aws-sdk/client-sqs';

describe('DeletarClientePorCpfUseCase', () => {
  let pedidoRepository: IRepository<Pedido>;
  let deletarClientePorCpfUseCase: DeletarClientePorCpfUseCase;
  let buscarClientePorCpfUseCase: BuscarClientePorCpfUseCase;
  let buscarTodosPedidosPorClienteIdUseCase: BuscarTodosPedidosPorClienteIdUseCase;
  let clienteSqsIntegration: SqsIntegration;

  const clienteId1: Cliente = {
    id: 1,
    nome: 'John Doe',
    email: 'johndoe@example.com',
    cpf: '25634428777',
  };

  const pedidoDoClienteId1: Pedido = {
    id: 1,
    clienteId: 1,
    dataInicio: '2023-08-26',
    estadoPedido: EstadoPedido.EM_PREPARACAO,
    ativo: true,
    total: 50.0,
  };

  const snsIntegrationResponse: SendMessageCommandOutput = {
    $metadata: {
      httpStatusCode: 200,
      requestId: '12345',
    },
  };

  const pedidos: Pedido[] = [pedidoDoClienteId1];

  beforeEach(async () => {
    // Configuração do módulo de teste
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [
        ...ClienteProviders,
        ...PedidoProviders,
        ...IntegrationProviders,
        ...PersistenceInMemoryProviders,

        {
          provide: PedidoConstants.IREPOSITORY,
          useValue: {
            edit: jest.fn(() => Promise.resolve()),
          },
        },
      ],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    pedidoRepository = module.get<IRepository<Pedido>>(PedidoConstants.IREPOSITORY);
    deletarClientePorCpfUseCase = module.get<DeletarClientePorCpfUseCase>(
      ClienteConstants.DELETAR_CLIENTE_POR_CPF_USECASE,
    );
    buscarClientePorCpfUseCase = module.get<BuscarClientePorCpfUseCase>(
      ClienteConstants.BUSCAR_CLIENTE_POR_CPF_USECASE,
    );
    buscarTodosPedidosPorClienteIdUseCase = module.get<BuscarTodosPedidosPorClienteIdUseCase>(
      PedidoConstants.BUSCAR_TODOS_PEDIDOS_POR_CLIENTE_ID_USECASE,
    );
    clienteSqsIntegration = module.get<SqsIntegration>(SqsIntegration);
  });

  describe('deletarClientePorCpf', () => {
    it('deve deletar um cliente existente por CPF com sucesso', async () => {
      jest.spyOn(buscarClientePorCpfUseCase, 'buscarClientePorCpf').mockResolvedValue(clienteId1);
      jest.spyOn(buscarTodosPedidosPorClienteIdUseCase, 'buscarTodosPedidosPorCliente').mockResolvedValue(pedidos);
      jest.spyOn(pedidoRepository, 'edit').mockResolvedValue(pedidoDoClienteId1);
      jest.spyOn(clienteSqsIntegration, 'sendLgpdProtocoloDelecao').mockResolvedValue(snsIntegrationResponse);

      const result = await deletarClientePorCpfUseCase.deletarClientePorCpf(clienteId1.cpf);

      expect(result).toBeTruthy();
    });

    it('nao deve deletar um cliente em caso de erro', async () => {
      jest
        .spyOn(buscarClientePorCpfUseCase, 'buscarClientePorCpf')
        .mockRejectedValue(new ServiceException('any error'));
      await expect(deletarClientePorCpfUseCase.deletarClientePorCpf(clienteId1.cpf)).rejects.toThrow(ServiceException);
    });
  });
});
