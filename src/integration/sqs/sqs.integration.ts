import { Injectable, Logger } from '@nestjs/common';
import * as process from 'process';
import { IntegrationApplicationException } from 'src/application/exception/integration-application.exception';
import {
  DeleteMessageCommand,
  DeleteMessageCommandOutput,
  Message,
  ReceiveMessageCommand,
  SQSClient,
  SendMessageCommand,
  SendMessageCommandOutput,
} from '@aws-sdk/client-sqs';
import { setTimeout } from 'timers/promises';
import { BuscarPedidoPorIdUseCase, EditarPedidoUseCase } from 'src/application/pedido/usecase';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { SesIntegration } from 'src/integration/ses/ses.integration';
import { getEstadoPagamentoFromValue } from 'src/enterprise/pagamento/estado-pagamento.enum';

@Injectable()
export class SqsIntegration {
  private logger = new Logger(SqsIntegration.name);

  private SQS_PREPARACAO_PEDIDO_REQ_URL = process.env.SQS_PREPARACAO_PEDIDO_REQ_URL;
  private SQS_SOLICITAR_PAGAMENTO_REQ_URL = process.env.SQS_SOLICITAR_PAGAMENTO_REQ_URL;
  private SQS_WEBHOOK_PAGAMENTO_CONFIRMADO_RES_URL = process.env.SQS_WEBHOOK_PAGAMENTO_CONFIRMADO_RES_URL;
  private SQS_WEBHOOK_PAGAMENTO_REJEITADO_RES_URL = process.env.SQS_WEBHOOK_PAGAMENTO_REJEITADO_RES_URL;

  private SQS_MAX_NUMBER_MESSAGES = 1;
  private SQS_WAIT_TIME_SECONDS = 5;
  private SQS_VISIBILITY_TIMEOUT = 5;
  private SQS_CONSUMER_TIMEOUT = 5000;

  constructor(
    private sqsClient: SQSClient,
    private sesIntegration: SesIntegration,
    private editarPedidoUseCase: EditarPedidoUseCase,
    private buscarPedidoPorIdUseCase: BuscarPedidoPorIdUseCase,
  ) {}

  startReceiveEstadoPagamentoPedido(): void {
    (async (): Promise<void> => {
      while (true) {
        await this.receiveEstadoPagamentoPedidoConfirmado()
          .then(async (messages) => {
            for (const message of messages) {
              await this.atualizaEstadoPedido(message, EstadoPedido.RECEBIDO).then(() => {
                this.sendPreparacaoPedido(message).then(() => {
                  this.deleteEstadoPagamentoPedidoConfirmado(message);
                  this.enviaEmailNotificacao(message);
                });
              });
            }
          })
          .catch(async (err) => {
            this.logger.error(
              `receiveEstadoPagamentoPedidoConfirmado: Erro ao consumir a mensagem da fila: ${JSON.stringify(err)}`,
            );
            await setTimeout(this.SQS_CONSUMER_TIMEOUT);
          });
      }
    })();

    (async (): Promise<void> => {
      while (true) {
        await this.receiveEstadoPagamentoPedidoRejeitado()
          .then(async (messages) => {
            for (const message of messages) {
              await this.atualizaEstadoPedido(message, EstadoPedido.PAGAMENTO_PENDENTE).then(() => {
                this.deleteEstadoPagamentoPedidoRejeitado(message);
                this.enviaEmailNotificacao(message);
              });
            }
          })
          .catch(async (err) => {
            this.logger.error(
              `receiveEstadoPagamentoPedidoConfirmado: Erro ao consumir a mensagem da fila: ${JSON.stringify(err)}`,
            );
            await setTimeout(this.SQS_CONSUMER_TIMEOUT);
          });
      }
    })();
  }

  private async enviaEmailNotificacao(message: Message): Promise<void> {
    const body = JSON.parse(message.Body);
    this.sesIntegration
      .sendEmailPagamento({
        id: body.pagamento.id,
        pedidoId: body.pagamento.pedidoId,
        dataHoraPagamento: body.pagamento.dataHoraPagamento,
        estadoPagamento: getEstadoPagamentoFromValue(body.pagamento.estadoPagamento),
        total: body.pagamento.total,
        transacaoId: body.pagamento.transacaoId,
      })
      .catch((error) => {
        this.logger.error(
          `Houve um erro no envio de email de notificação de resultado de pagamento: ${JSON.stringify(error)}`,
        );
      });
  }

  private async atualizaEstadoPedido(message: Message, estadoPedido: EstadoPedido): Promise<Pedido> {
    this.logger.log(`mensagem consumida: ${JSON.stringify(message)}`);
    const body = JSON.parse(message.Body);
    return await this.buscarPedidoPorIdUseCase
      .buscarPedidoPorId(body.pagamento.pedidoId)
      .then((pedido) => {
        pedido.estadoPedido = estadoPedido;
        return this.editarPedidoUseCase.editarPedido(pedido);
      })
      .catch((error) => {
        this.logger.error(`Houve um erro ao atualizar o estado do pedido: ${error}`);
        throw new IntegrationApplicationException('Não foi possível atualizar o estado do pedido');
      });
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

    this.logger.log(`Invocando SendMessageCommand para solicitação de pagamento do pedido: ${JSON.stringify(command)}`);

    return await this.sqsClient
      .send(command)
      .then((response) => {
        this.logger.log(`Resposta do publish na fila de solicitação de pagamento: ${JSON.stringify(response)}`);
        return response;
      })
      .catch((error) => {
        this.logger.error(
          `Erro ao publicar solicitação de pagamento: ${JSON.stringify(error)} - Command: ${JSON.stringify(command)}`,
        );
        throw new IntegrationApplicationException('Não foi possível solicitar o pagamento.');
      });
  }

  private async sendPreparacaoPedido(message: Message): Promise<SendMessageCommandOutput> {
    const body = JSON.parse(message.Body);
    const pedidoId = body.pagamento.pedidoId;

    return await this.buscarPedidoPorIdUseCase.buscarPedidoPorId(pedidoId).then(async (pedido) => {
      const command = new SendMessageCommand({
        MessageGroupId: 'preparacao-pedido',
        MessageDeduplicationId: `${pedidoId}`,
        QueueUrl: this.SQS_PREPARACAO_PEDIDO_REQ_URL,
        MessageBody: JSON.stringify({
          pedido: pedido,
        }),
      });

      this.logger.log(
        `Invocando SendMessageCommand para solicitação de preparação do pedido: ${JSON.stringify(command)}`,
      );

      return await this.sqsClient
        .send(command)
        .then((response) => {
          this.logger.log(`Resposta do publish na fila de preparação de pedido: ${JSON.stringify(response)}`);
          return response;
        })
        .catch((error) => {
          this.logger.error(
            `Erro ao publicar solicitação de preparação do pedido: ${JSON.stringify(error)} - Command: ${JSON.stringify(
              command,
            )}`,
          );
          throw new IntegrationApplicationException('Não foi possível solicitar a preparação do pedido.');
        });
    });
  }

  private async receiveEstadoPagamentoPedidoConfirmado(): Promise<Message[]> {
    return this.receiveEstadoPagamentoPedido(this.SQS_WEBHOOK_PAGAMENTO_CONFIRMADO_RES_URL);
  }

  private async receiveEstadoPagamentoPedidoRejeitado(): Promise<Message[]> {
    return this.receiveEstadoPagamentoPedido(this.SQS_WEBHOOK_PAGAMENTO_REJEITADO_RES_URL);
  }

  private async receiveEstadoPagamentoPedido(QueueUrl: string): Promise<Message[]> {
    const command = new ReceiveMessageCommand({
      AttributeNames: ['CreatedTimestamp'],
      MessageAttributeNames: ['All'],
      QueueUrl: QueueUrl,
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
        return response.Messages || [];
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

  private async deleteEstadoPagamentoPedidoConfirmado(message: Message): Promise<DeleteMessageCommandOutput> {
    return this.deleteEstadoPagamentoPedido(message, this.SQS_WEBHOOK_PAGAMENTO_CONFIRMADO_RES_URL);
  }

  private async deleteEstadoPagamentoPedidoRejeitado(message: Message): Promise<DeleteMessageCommandOutput> {
    return this.deleteEstadoPagamentoPedido(message, this.SQS_WEBHOOK_PAGAMENTO_REJEITADO_RES_URL);
  }

  private async deleteEstadoPagamentoPedido(message: Message, QueueUrl: string): Promise<DeleteMessageCommandOutput> {
    this.logger.log(`Deletando mensagem da fila: ${JSON.stringify(message)}`);
    const command = new DeleteMessageCommand({
      QueueUrl: QueueUrl,
      ReceiptHandle: message.ReceiptHandle,
    });
    this.logger.log(
      `Invocando DeleteMessageCommandOutput para remoção de mensagem de estado de pagamento do pedido: ${JSON.stringify(
        command,
      )}`,
    );

    return await this.sqsClient.send(command).catch((error) => {
      this.logger.error(
        `Erro ao deletar da fila o estado de pagamento do pedido: ${JSON.stringify(error)} - Command: ${JSON.stringify(
          command,
        )}`,
      );
      throw new IntegrationApplicationException('Não foi possível deletar o estado de pagamento do pedido da fila.');
    });
  }
}
