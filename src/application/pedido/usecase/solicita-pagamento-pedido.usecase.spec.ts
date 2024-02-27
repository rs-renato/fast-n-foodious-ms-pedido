import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PedidoProviders } from 'src/application/pedido/providers/pedido.providers';
import { EstadoPagamento } from 'src/enterprise/pagamento/estado-pagamento.enum';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { PagamentoDto } from 'src/enterprise/pagamento/pagamento-dto';
import { SolicitaPagamentoPedidoUseCase } from 'src/application/pedido/usecase/solicita-pagamento-pedido.usecase';
import { PedidoConstants } from 'src/shared/constants';
import { HttpModule } from '@nestjs/axios';
import { IntegrationApplicationException } from 'src/application/exception/integration-application.exception';
import { SendMessageCommandOutput } from '@aws-sdk/client-sqs';
import { SqsIntegration } from 'src/integration/sqs/sqs.integration';

describe('SolicitaPagamentoPedidoUseCase', () => {
  let useCase: SolicitaPagamentoPedidoUseCase;
  let pagamentoSqsIntegration: SqsIntegration;

  const pedido: Pedido = {
    id: 1,
    clienteId: 1,
    dataInicio: '2023-08-30',
    estadoPedido: EstadoPedido.PAGAMENTO_PENDENTE,
    ativo: true,
    total: 10,
  };

  const pagamento: PagamentoDto = {
    dataHoraPagamento: new Date(),
    estadoPagamento: EstadoPagamento.PENDENTE,
    pedidoId: 1,
    total: 10,
    transacaoId: '123456-abcdef',
    id: 1,
  };

  const output: SendMessageCommandOutput = {
    $metadata: {
      httpStatusCode: 200,
      requestId: '12345',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [...PedidoProviders, ...IntegrationProviders, ...PersistenceInMemoryProviders],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    useCase = module.get<SolicitaPagamentoPedidoUseCase>(PedidoConstants.SOLICITA_PAGAMENTO_PEDIDO_USECASE);
    pagamentoSqsIntegration = module.get<SqsIntegration>(SqsIntegration);
  });

  describe('SolicitaPagamentoPedidoUseCase', () => {
    it('deve realizar o pagamento do pedido e gerar o id de mensagem', async () => {
      jest.spyOn(pagamentoSqsIntegration, 'sendSolicitaPagamentoPedido').mockResolvedValue(output);

      const response = await useCase.solicitaPagamento(pedido);

      expect(response).toEqual(output);
    });

    it('deve lançar uma ServiceException em caso de erro no repositório', async () => {
      const error = new IntegrationApplicationException('Erro');
      jest.spyOn(pagamentoSqsIntegration, 'sendSolicitaPagamentoPedido').mockRejectedValue(error);

      await expect(useCase.solicitaPagamento(pedido)).rejects.toThrowError(IntegrationApplicationException);
    });
  });
});
