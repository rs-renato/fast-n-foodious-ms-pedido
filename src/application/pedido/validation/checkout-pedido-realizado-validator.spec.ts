import { Test, TestingModule } from '@nestjs/testing';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { PagamentoConstants } from 'src/shared/constants';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { DateUtils } from 'src/shared/date.utils';
import { CheckoutPedidoRealizadoValidator } from 'src/application/pedido/validation/checkout-pedido-realizado-validator';
import { EstadoPagamento } from 'src/enterprise/pagamento/estado-pagamento.enum';
import { PagamentoDto } from 'src/enterprise/pagamento/pagamento-dto';
import { HttpModule } from '@nestjs/axios';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { PagamentoIntegration } from 'src/integration/pagamento/pagamento.integration';
import { NotFoundException } from '@nestjs/common';

describe('CheckoutPedidoRealizadoValidator', () => {
  let validator: CheckoutPedidoRealizadoValidator;
  let pagamentoIntegration: PagamentoIntegration;

  const pagamento: PagamentoDto = {
    pedidoId: 1,
    transacaoId: '123-abc',
    estadoPagamento: EstadoPagamento.PENDENTE,
    total: 100,
    dataHoraPagamento: new Date(),
    id: 1,
  };

  beforeEach(async () => {
    // Configuração do módulo de teste
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        ...IntegrationProviders,
        CheckoutPedidoRealizadoValidator,
        // Mock do repositório de Pagamento
        {
          provide: PagamentoConstants.IREPOSITORY,
          useValue: {
            findBy: jest.fn(() => {
              // Retorna um pagamento vazio, simulando que não foi encontrado nenhum pagamento para o pedido
              return Promise.resolve([]);
            }),
          },
        },
      ],
    }).compile();

    // Obtém a instância do validator e do repositório a partir do módulo de teste
    validator = module.get<CheckoutPedidoRealizadoValidator>(CheckoutPedidoRealizadoValidator);
    pagamentoIntegration = module.get<PagamentoIntegration>(PagamentoIntegration);
  });

  describe('validate', () => {
    it('deve passar na validação quando não há pagamento registrado para o pedido', async () => {
      const pedido: Pedido = {
        id: 1,
        clienteId: 1,
        dataInicio: DateUtils.toString(new Date()),
        estadoPedido: EstadoPedido.RECEBIDO,
        ativo: true,
      };

      pagamentoIntegration.buscarPorPedidoId = jest.fn(() => {
        throw new NotFoundException('Pagamento não encontrado');
      });

      const isValid = await validator.validate(pedido);
      expect(isValid).toBeTruthy();
    });

    it('deve lançar uma exceção de validação quando há pagamento registrado para o pedido', async () => {
      const pedido: Pedido = {
        id: 1,
        clienteId: 1,
        dataInicio: DateUtils.toString(new Date()),
        estadoPedido: EstadoPedido.RECEBIDO,
        ativo: true,
      };

      // Mock para retornar um pagamento, simulando que o pedido já realizou checkout
      pagamentoIntegration.buscarPorPedidoId = jest.fn(() => {
        return Promise.resolve(pagamento);
      });

      // O validator deve lançar uma exceção de validação
      await expect(validator.validate(pedido)).rejects.toThrowError(ValidationException);
    });
  });
});
