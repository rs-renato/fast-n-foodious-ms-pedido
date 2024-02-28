import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';
import { Cliente } from 'src/enterprise/cliente/model/cliente.model';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { BuscarClientePorIdPedidoUsecase } from './buscar-cliente-por-id-pedido.usecase';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { PedidoConstants, ClienteConstants } from 'src/shared/constants';

describe('BuscarClientePorIdPedidoUsecase', () => {
  let useCase: BuscarClientePorIdPedidoUsecase;
  let pedidoRepository: IRepository<Pedido>;

  const mockedPedido: Pedido = {
    id: 1,
    clienteId: 1,
    dataInicio: '2023-08-30',
    estadoPedido: EstadoPedido.PAGAMENTO_PENDENTE,
    ativo: true,
    total: 100.0,
  };

  const mockedCliente: Cliente = {
    id: 1,
    nome: 'Cliente Teste',
    email: 'cliente@teste.com',
    cpf: '25634428777',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarClientePorIdPedidoUsecase,
        {
          provide: PedidoConstants.IREPOSITORY,
          useValue: {
            findBy: jest.fn().mockResolvedValue([mockedPedido]),
          },
        },
        {
          provide: ClienteConstants.IREPOSITORY,
          useValue: {
            findBy: jest.fn().mockResolvedValue([mockedCliente]),
          },
        },
        Logger,
      ],
    }).compile();

    useCase = module.get<BuscarClientePorIdPedidoUsecase>(BuscarClientePorIdPedidoUsecase);
    pedidoRepository = module.get<IRepository<Pedido>>(PedidoConstants.IREPOSITORY);
  });

  describe('buscarClientePorPedidoId', () => {
    it('should return the client for the given order ID', async () => {
      const cliente = await useCase.buscarClientePorPedidoId(1);
      expect(cliente).toEqual(mockedCliente);
    });

    it('should throw NaoEncontradoApplicationException if order is not found', async () => {
      jest.spyOn(pedidoRepository, 'findBy').mockResolvedValue([]);
      await expect(useCase.buscarClientePorPedidoId(2)).rejects.toThrowError(NaoEncontradoApplicationException);
    });

    it('should throw ServiceException if an error occurs while fetching data', async () => {
      jest.spyOn(pedidoRepository, 'findBy').mockRejectedValue(new Error('Internal Server Error'));
      await expect(useCase.buscarClientePorPedidoId(1)).rejects.toThrowError(ServiceException);
    });
  });
});
