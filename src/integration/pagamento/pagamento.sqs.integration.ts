import { Injectable, Logger } from '@nestjs/common';
import * as process from 'process';
import { IntegrationApplicationException } from 'src/application/exception/integration-application.exception';
import { SQSClient, SendMessageCommand, SendMessageCommandOutput } from '@aws-sdk/client-sqs';

@Injectable()
export class PagamentoSqsIntegration {
  private logger = new Logger(PagamentoSqsIntegration.name);

  private SQS_SOLICITAR_PAGAMENTO_REQ_URL = process.env.SQS_SOLICITAR_PAGAMENTO_REQ_URL;

  constructor(private sqsClient: SQSClient) {}

  async publishSolicitaPagamentoPedido(pedidoId: number, totalPedido: number): Promise<SendMessageCommandOutput> {
    this.logger.debug(
      `publishSolicitaPagamentoPedido: invocando serviço de integração em ${this.SQS_SOLICITAR_PAGAMENTO_REQ_URL} para o pedido ${pedidoId}, com o total ${totalPedido}`,
    );

    const command = new SendMessageCommand({
      MessageGroupId: 'solicitar-pagamento',
      MessageDeduplicationId: `${pedidoId}`,
      QueueUrl: this.SQS_SOLICITAR_PAGAMENTO_REQ_URL,
      MessageBody: JSON.stringify({
        pedidoId: pedidoId,
        totalPedido: totalPedido,
      }),
    });

    return await this.sqsClient
      .send(command)
      .then((response) => {
        this.logger.log(`Resposta do publish na fila: ${JSON.stringify(response)}`);
        return response;
      })
      .catch((error) => {
        this.logger.error(
          `Erro ao publicar solicitação de pagamento: ${JSON.stringify(error)} - Command: ${JSON.stringify(command)}`,
        );
        throw new IntegrationApplicationException('Não foi possível solicitar o pagamento.');
      });
  }
}
