import { Test, TestingModule } from '@nestjs/testing';
import { PedidoProviders } from 'src/application/pedido/providers/pedido.providers';
import { EstadoPagamento } from 'src/enterprise/pagamento/estado-pagamento.enum';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { PagamentoDto } from 'src/enterprise/pagamento/pagamento-dto';
import { SolicitaPagamentoPedidoUseCase } from 'src/application/pedido/usecase/solicita-pagamento-pedido.usecase';
import { PagamentoIntegration } from 'src/integration/pagamento/pagamento.integration';
import { PedidoConstants } from 'src/shared/constants';
import { HttpModule } from '@nestjs/axios';
import { IntegrationApplicationException } from 'src/application/exception/integration-application.exception';

describe('SolicitaPagamentoPedidoUseCase', () => {
  let useCase: SolicitaPagamentoPedidoUseCase;
  let pagamentoIntegration: PagamentoIntegration;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [...PedidoProviders, ...IntegrationProviders, ...PersistenceInMemoryProviders],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    useCase = module.get<SolicitaPagamentoPedidoUseCase>(PedidoConstants.SOLICITA_PAGAMENTO_PEDIDO_USECASE);
    pagamentoIntegration = module.get<PagamentoIntegration>(PagamentoIntegration);
  });

  describe('SolicitaPagamentoPedidoUseCase', () => {
    it('deve realizar o pagamento do pedido e gerar o id de transação', async () => {
      jest.spyOn(pagamentoIntegration, 'solicitaPagamentoPedido').mockResolvedValue(pagamento);

      const pagamentoResponse = await useCase.solicitaPagamento(pedido);

      expect(pagamentoResponse.pedidoId).toEqual(pedido.id);
    });

    it('deve lançar uma ServiceException em caso de erro no repositório', async () => {
      const error = new IntegrationApplicationException('Erro');
      jest.spyOn(pagamentoIntegration, 'solicitaPagamentoPedido').mockRejectedValue(error);

      await expect(useCase.solicitaPagamento(pedido)).rejects.toThrowError(IntegrationApplicationException);
    });
  });
});
