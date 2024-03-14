import { Test, TestingModule } from '@nestjs/testing';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { ItemPedido } from 'src/enterprise/item-pedido/model';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { IValidator } from 'src/enterprise/validation/validator';
import { PedidoPagamentoPendenteValidator } from './pedido-pagamento-pendente.validator';
import { PedidoConstants, ItemPedidoConstants } from 'src/shared/constants';

describe('PedidoPagamentoPendenteValidator', () => {
  let validator: IValidator<ItemPedido>;
  let pedidoRepository: IRepository<Pedido>;

  const mockedPedido: Pedido = {
    id: 1,
    clienteId: 1,
    dataInicio: '2023-08-30',
    estadoPedido: EstadoPedido.PAGAMENTO_PENDENTE,
    ativo: true,
    total: 100.0,
    itensPedido: [],
  };

  const mockedItemPedido: ItemPedido = {
    id: 1,
    pedidoId: 1,
    produtoId: 1,
    quantidade: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoPagamentoPendenteValidator,
        {
          provide: PedidoConstants.IREPOSITORY,
          useValue: {
            findBy: jest.fn().mockResolvedValue([mockedPedido]),
          },
        },
        {
          provide: ItemPedidoConstants.IREPOSITORY,
          useValue: {
            findBy: jest.fn().mockResolvedValue([mockedItemPedido]),
          },
        },
      ],
    }).compile();

    validator = module.get<IValidator<ItemPedido>>(PedidoPagamentoPendenteValidator);
    pedidoRepository = module.get<IRepository<Pedido>>(PedidoConstants.IREPOSITORY);
  });

  describe('validate', () => {
    it('should throw ValidationException if pedido is not in PAGAMENTO_PENDENTE no CHECKOUT', async () => {
      mockedPedido.estadoPedido = EstadoPedido.RECEBIDO;
      jest.spyOn(pedidoRepository, 'findBy').mockResolvedValue([mockedPedido]);

      await expect(validator.validate(mockedItemPedido)).rejects.toThrowError(ValidationException);
    });

    it('should not throw ValidationException if pedido is in CHECKOUT', async () => {
      mockedPedido.estadoPedido = EstadoPedido.CHECKOUT;
      jest.spyOn(pedidoRepository, 'findBy').mockResolvedValue([mockedPedido]);

      await expect(validator.validate(mockedItemPedido)).resolves.toBe(true);
    });

    it('should not throw ValidationException if pedido is in PAGAMENTO_PENDENTE', async () => {
      mockedPedido.estadoPedido = EstadoPedido.PAGAMENTO_PENDENTE;
      jest.spyOn(pedidoRepository, 'findBy').mockResolvedValue([mockedPedido]);

      await expect(validator.validate(mockedItemPedido)).resolves.toBe(true);
    });
  });
});
