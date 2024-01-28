import { Test, TestingModule } from '@nestjs/testing';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { ItemPedido } from 'src/enterprise/item-pedido/model';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { IValidator } from 'src/enterprise/validation/validator';
import { CheckoutRealizadoItemValidator } from './checkout-realizado-item.validator';
import { PedidoConstants, ItemPedidoConstants } from 'src/shared/constants';

describe('CheckoutRealizadoItemValidator', () => {
  let validator: IValidator<ItemPedido>;
  let pedidoRepository: IRepository<Pedido>;
  let itemPedidoRepository: IRepository<ItemPedido>;

  const mockedPedido: Pedido = {
    id: 1,
    clienteId: 1,
    dataInicio: '2023-08-30',
    estadoPedido: EstadoPedido.CHECKOUT,
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
        CheckoutRealizadoItemValidator,
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

    validator = module.get<IValidator<ItemPedido>>(CheckoutRealizadoItemValidator);
    pedidoRepository = module.get<IRepository<Pedido>>(PedidoConstants.IREPOSITORY);
    itemPedidoRepository = module.get<IRepository<ItemPedido>>(ItemPedidoConstants.IREPOSITORY);
  });

  describe('validate', () => {
    it('should throw ValidationException if pedido is in CHECKOUT state', async () => {
      mockedPedido.estadoPedido = EstadoPedido.CHECKOUT;
      jest.spyOn(pedidoRepository, 'findBy').mockResolvedValue([mockedPedido]);

      await expect(validator.validate(mockedItemPedido)).rejects.toThrowError(ValidationException);
    });

    it('should not throw ValidationException if pedido is not in CHECKOUT state', async () => {
      mockedPedido.estadoPedido = EstadoPedido.PAGAMENTO_PENDENTE;
      jest.spyOn(pedidoRepository, 'findBy').mockResolvedValue([mockedPedido]);

      await expect(validator.validate(mockedItemPedido)).resolves.toBe(true);
    });
  });
});
