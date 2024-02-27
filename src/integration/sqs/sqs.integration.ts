import { Injectable, Logger } from '@nestjs/common';
import * as process from 'process';
import { IntegrationApplicationException } from 'src/application/exception/integration-application.exception';
import {
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  SQSClient,
  SendMessageCommand,
  SendMessageCommandOutput,
} from '@aws-sdk/client-sqs';
import { setTimeout } from 'timers/promises';
import { BuscarPedidoPorIdUseCase, EditarPedidoUseCase } from 'src/application/pedido/usecase';
import { EstadoPagamento } from 'src/enterprise/pagamento/estado-pagamento.enum';
import { PagamentoDto } from 'src/enterprise/pagamento/pagamento-dto';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';

@Injectable()
export class SqsIntegration {
  private logger = new Logger(SqsIntegration.name);

  private SQS_SOLICITAR_PAGAMENTO_REQ_URL = process.env.SQS_SOLICITAR_PAGAMENTO_REQ_URL;
  private SQS_WEBHOOK_PAGAMENTO_CONFIRMADO_RES_URL = process.env.SQS_WEBHOOK_PAGAMENTO_CONFIRMADO_RES_URL;
  private SQS_MAX_NUMBER_MESSAGES = 1;
  private SQS_WAIT_TIME_SECONDS = 20;
  private SQS_VISIBILITY_TIMEOUT = 20;
  private SQS_CONSUMER_TIMEOUT = 5000;

  constructor(
    private sqsClient: SQSClient,
    private editarPedidoUseCase: EditarPedidoUseCase,
    private buscarPedidoPorIdUseCase: BuscarPedidoPorIdUseCase,
  ) {}

  start(): void {
    (async () => {
      while (true) {
        await this.receiveEstadoPagamentoPedido()
          .then((messages) => {
            if (messages) {
              messages.forEach((message) => {
                this.logger.log(`mensagem consumida: ${JSON.stringify(message)}`);
                const body = JSON.parse(message.Body);
                this.buscarPedidoPorIdUseCase.buscarPedidoPorId(body.pagamento.pedidoId).then((pedido) => {
                  pedido.estadoPedido = EstadoPedido.RECEBIDO;
                  this.editarPedidoUseCase.editarPedido(pedido);
                });
              });
            }
          })
          .catch(async (err) => {
            this.logger.error(
              `receiveEstadoPagamentoPedido: Erro ao consumir a mensagem da fila: ${JSON.stringify(err)}`,
            );
            await setTimeout(this.SQS_CONSUMER_TIMEOUT);
          });
      }
    })();
  }

  async sendSolicitaPagamentoPedido(pedidoId: number, totalPedido: number): Promise<SendMessageCommandOutput> {
    const command = new SendMessageCommand({
      MessageGroupId: 'solicitar-pagamento',
      MessageDeduplicationId: `${pedidoId}`,
      QueueUrl: this.SQS_SOLICITAR_PAGAMENTO_REQ_URL,
      MessageBody: JSON.stringify({
        pedidoId: pedidoId,
        totalPedido: totalPedido,
      }),
    });

    this.logger.debug(
      `Invocando SendMessageCommand para solicitação de pagamento do pedido: ${JSON.stringify(command)}`,
    );

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

  async receiveEstadoPagamentoPedido(): Promise<Message[]> {
    const command = new ReceiveMessageCommand({
      AttributeNames: ['CreatedTimestamp'],
      MessageAttributeNames: ['All'],
      QueueUrl: this.SQS_WEBHOOK_PAGAMENTO_CONFIRMADO_RES_URL,
      MaxNumberOfMessages: this.SQS_MAX_NUMBER_MESSAGES,
      WaitTimeSeconds: this.SQS_WAIT_TIME_SECONDS,
      VisibilityTimeout: this.SQS_VISIBILITY_TIMEOUT,
    });

    this.logger.debug(
      `Invocando ReceiveMessageCommand para obtenção de estado de pagamento do pedido: ${JSON.stringify(command)}`,
    );

    return await this.sqsClient
      .send(command)
      .then((response) => {
        this.logger.debug(`Resposta do receive message da fila: ${JSON.stringify(response)}`);
        return response.Messages;
      })
      .then(async (messages) => {
        if (messages && messages.length) {
          this.logger.debug(`Deletando mensagem da fila: ${JSON.stringify(messages)}`);
          const command = new DeleteMessageCommand({
            QueueUrl: this.SQS_WEBHOOK_PAGAMENTO_CONFIRMADO_RES_URL,
            ReceiptHandle: messages[0].ReceiptHandle,
          });
          this.logger.debug(
            `Invocando DeleteMessageCommand para remoção de mensagem de estado de pagamento do pedido: ${JSON.stringify(
              command,
            )}`,
          );
          await this.sqsClient.send(command);
        }
        return messages;
      })
      .catch((error) => {
        this.logger.error(
          `Erro ao processar solicitação de estado de pagamento do pedido: ${JSON.stringify(
            error,
          )} - Command: ${JSON.stringify(command)}`,
        );
        throw new IntegrationApplicationException(
          'Não foi possível processar a solicitação de estado de pagamento do pedido.',
        );
      });
  }
}
