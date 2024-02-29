import { Injectable, Logger } from '@nestjs/common';
import { IntegrationApplicationException } from 'src/application/exception/integration-application.exception';
import { SendMessageCommandOutput } from '@aws-sdk/client-sqs';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { BuscarClientePorIdPedidoUsecase } from 'src/application/cliente/usecase/buscar-cliente-por-id-pedido.usecase';
import { PagamentoDto } from 'src/enterprise/pagamento/pagamento-dto';
import { EstadoPagamento } from 'src/enterprise/pagamento/estado-pagamento.enum';

@Injectable()
export class SesIntegration {
  private logger = new Logger(SesIntegration.name);

  private SES_SOURCE_EMAIL = process.env.SES_SOURCE_EMAIL;
  private SES_SUBJECT_PAGAMENTO_RECUSADO = 'Houve um problema na autorização de pagamento do seu Pedido';
  private SES_SUBJECT_PAGAMENTO_APROVADO = 'Pagamento autorizado com sucesso para o seu Pedido';

  constructor(private sesClient: SESClient, private buscarClientePorIdPedidoUsecase: BuscarClientePorIdPedidoUsecase) {}

  async sendEmailPagamento(pagamento: PagamentoDto): Promise<SendMessageCommandOutput> {
    return await this.buscarClientePorIdPedidoUsecase
      .buscarClientePorPedidoId(pagamento.pedidoId)
      .then(async (cliente) => {
        this.logger.log(`Enviando email de pedido para: ${cliente.email}. Pedido #${pagamento.pedidoId}`);

        const command = new SendEmailCommand({
          Source: this.SES_SOURCE_EMAIL,
          Destination: {
            ToAddresses: [cliente.email],
          },
          Message: {
            Subject: {
              Charset: 'UTF-8',
              Data:
                (pagamento.estadoPagamento === EstadoPagamento.CONFIRMADO
                  ? this.SES_SUBJECT_PAGAMENTO_APROVADO
                  : this.SES_SUBJECT_PAGAMENTO_RECUSADO) + `#${pagamento.pedidoId}`,
            },
            Body: {
              Text: {
                Charset: 'UTF-8',
                Data:
                  pagamento.estadoPagamento === EstadoPagamento.CONFIRMADO
                    ? `O pagamento no valor de ${pagamento.total} foi aprovado para o pedido #${pagamento.pedidoId}. Obrigado por realizar seu pedido conosco!`
                    : `O pagamento no valor de ${pagamento.total} foi recusado para o pedido #${pagamento.pedidoId}. Por favor, verifique os o motivo da recusa com a sua operadora de cartões.`,
              },
            },
          },
        });

        this.logger.debug(
          `Invocando SendMessageCommand para solicitação de pagamento do pedido: ${JSON.stringify(command)}`,
        );

        return await this.sesClient
          .send(command)
          .then((response) => {
            this.logger.log(`Resposta do envio de email: ${JSON.stringify(response)}`);
            return response;
          })
          .catch((error) => {
            this.logger.error(
              `Erro ao enciar email para notificação de pagamento recusado: ${JSON.stringify(
                error,
              )} - Command: ${JSON.stringify(command)}`,
            );
            throw new IntegrationApplicationException('Não foi possível enviar email para o cliente.');
          });
      });
  }
}
