import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { DateUtils } from 'src/shared/date.utils';
import { CheckoutPedidoQuantidadeDeItensValidator } from 'src/application/pedido/validation/checkout-pedido-quantidade-de-itens-validator';
import { HttpModule } from '@nestjs/axios';

describe('CheckoutPedidoQuantidadeDeItensValidator', () => {
  let validator: CheckoutPedidoQuantidadeDeItensValidator;

  beforeEach(async () => {
    // Configuração do módulo de teste
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [CheckoutPedidoQuantidadeDeItensValidator],
    }).compile();

    // Obtém a instância do validator
    validator = module.get<CheckoutPedidoQuantidadeDeItensValidator>(CheckoutPedidoQuantidadeDeItensValidator);
  });

  describe('validate', () => {
    it('deve lançar uma exceção de validação quando nao há itens adicionados ao pedido', async () => {
      const pedido: Pedido = {
        id: 1,
        clienteId: 1,
        dataInicio: DateUtils.toString(new Date()),
        estadoPedido: EstadoPedido.RECEBIDO,
        ativo: true,
      };

      // O validator deve lançar uma exceção de validação
      await expect(validator.validate(pedido)).rejects.toThrowError(ValidationException);
    });

    it('deve passar na validação quando não há pagamento registrado para o pedido', async () => {
      const pedido: Pedido = {
        id: 1,
        clienteId: 1,
        dataInicio: DateUtils.toString(new Date()),
        estadoPedido: EstadoPedido.RECEBIDO,
        ativo: true,
        itensPedido: [
          {
            pedidoId: 1,
            produtoId: 1,
            quantidade: 10,
            id: 1,
          },
        ],
      };

      const isValid = await validator.validate(pedido);
      expect(isValid).toBeTruthy();
    });
  });
});
