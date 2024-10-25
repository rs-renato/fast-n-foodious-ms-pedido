import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
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
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';
import { PagamentoRestIntegration } from 'src/integration/pagamento/pagamento.rest.integration';
import { PedidoProviders } from 'src/application/pedido/providers/pedido.providers';
import { ClienteProviders } from 'src/application/cliente/providers/cliente.providers';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';

describe('CheckoutPedidoRealizadoValidator', () => {
  let validator: CheckoutPedidoRealizadoValidator;
  let pagamentoRestIntegration: PagamentoRestIntegration;

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
      imports: [HttpModule, ConfigModule],
      providers: [
        ...IntegrationProviders,
        ...PedidoProviders,
        ...ClienteProviders,
        ...PersistenceInMemoryProviders,
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
    pagamentoRestIntegration = module.get<PagamentoRestIntegration>(PagamentoRestIntegration);
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

      pagamentoRestIntegration.buscarPorPedidoId = jest.fn(() => {
        throw new NaoEncontradoApplicationException('Pagamento não encontrado');
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
      pagamentoRestIntegration.buscarPorPedidoId = jest.fn(() => {
        return Promise.resolve(pagamento);
      });

      // O validator deve lançar uma exceção de validação
      await expect(validator.validate(pedido)).rejects.toThrowError(ValidationException);
    });
  });
});
