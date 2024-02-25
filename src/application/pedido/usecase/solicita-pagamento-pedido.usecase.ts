import { SendMessageCommandOutput } from '@aws-sdk/client-sqs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { PagamentoSqsIntegration } from 'src/integration/pagamento/pagamento.sqs.integration';

@Injectable()
export class SolicitaPagamentoPedidoUseCase {
  private logger = new Logger(SolicitaPagamentoPedidoUseCase.name);

  constructor(@Inject(PagamentoSqsIntegration) private pagamentoSnsIntegration: PagamentoSqsIntegration) {}

  async solicitaPagamento(pedido: Pedido): Promise<SendMessageCommandOutput> {
    this.logger.log(`solicitaPagamento: pedido = ${JSON.stringify(pedido)}`);
    const response = await this.pagamentoSnsIntegration.publishSolicitaPagamentoPedido(pedido.id, pedido.total);
    this.logger.debug(`requestId = ${JSON.stringify(response.$metadata)}`);
    return response;
  }
}
