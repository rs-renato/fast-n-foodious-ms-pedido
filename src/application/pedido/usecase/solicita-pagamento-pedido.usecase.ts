import { SendMessageCommandOutput } from '@aws-sdk/client-sqs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { SqsIntegration } from 'src/integration/sqs/sqs.integration';

@Injectable()
export class SolicitaPagamentoPedidoUseCase {
  private logger = new Logger(SolicitaPagamentoPedidoUseCase.name);

  constructor(@Inject(SqsIntegration) private pagamentoSnsIntegration: SqsIntegration) {}

  async solicitaPagamento(pedido: Pedido): Promise<SendMessageCommandOutput> {
    this.logger.log(`solicitaPagamento: pedido = ${JSON.stringify(pedido)}`);
    const response = await this.pagamentoSnsIntegration.sendSolicitaPagamentoPedido(pedido.id, pedido.total);
    this.logger.debug(`requestId = ${JSON.stringify(response.$metadata)}`);
    return response;
  }
}
