import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutPedidoValidoValidator } from 'src/application/pedido/validation/checkout-pedido-valido-validator.service';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { PedidoConstants } from 'src/shared/constants';

describe('CheckoutPedidoValidator', () => {
  let validator: CheckoutPedidoValidoValidator;
  let repository: IRepository<Pedido>;

  const pedido: Pedido = {
    id: 1,
    clienteId: 1,
    dataInicio: '2023-06-18',
    estadoPedido: EstadoPedido.PAGAMENTO_PENDENTE,
    ativo: true,
  };

  const pedidoSemId: Pedido = {
    clienteId: 1,
    dataInicio: '2023-06-18',
    estadoPedido: EstadoPedido.PAGAMENTO_PENDENTE,
    ativo: true,
  };

  beforeEach(async () => {
    // Configuração do módulo de teste
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutPedidoValidoValidator,
        // Mock do serviço IRepository<Pedido>
        {
          provide: PedidoConstants.IREPOSITORY,
          useValue: {
            findBy: jest.fn(() => {
              return Promise.resolve([pedido]);
            }),
          },
        },
      ],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    // Obtém a instância do serviço e repositório a partir do módulo de teste
    repository = module.get<IRepository<Pedido>>(PedidoConstants.IREPOSITORY);
    validator = module.get<CheckoutPedidoValidoValidator>(CheckoutPedidoValidoValidator);
  });

  describe('injeção de dependências', () => {
    it('deve existir instância de repositório definida', async () => {
      expect(repository).toBeDefined();
    });
  });

  describe('validate', () => {
    it('deve validar que o pedido existe ao realizar o checkout', async () => {
      await validator.validate(pedido).then((result) => {
        expect(result).toBeTruthy();
      });
    });

    it('não deve validar pedido quando id estiver vazio', async () => {
      await expect(validator.validate(pedidoSemId)).rejects.toThrowError(
        CheckoutPedidoValidoValidator.PEDIDO_INEXISTENTE_ERROR_MESSAGE,
      );
    });

    it('não deve validar pedido quando id não existir', async () => {
      pedido.id = 10000000;
      // mock repository to return empty array
      (repository.findBy as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve([]);
      });
      await expect(validator.validate(pedido)).rejects.toThrowError(
        CheckoutPedidoValidoValidator.PEDIDO_INEXISTENTE_ERROR_MESSAGE,
      );
    });
  });
});
