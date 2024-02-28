import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import * as process from 'process';
import { PagamentoDto } from 'src/enterprise/pagamento/pagamento-dto';
import { IntegrationApplicationException } from 'src/application/exception/integration-application.exception';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';

@Injectable()
export class PagamentoRestIntegration {
  private logger = new Logger(PagamentoRestIntegration.name);

  private MS_PAGAMENTO_URL = process.env.MS_PAGAMENTO_INTEGRATION_URL;

  constructor(private httpService: HttpService) {}

  async solicitaPagamentoPedido(pedidoId: number, totalPedido: number): Promise<PagamentoDto> {
    this.logger.debug(
      `solicitaPagamentoPedido: invocando serviço de integração em http://${this.MS_PAGAMENTO_URL}/v1/pagamento/solicitar para o pedido ${pedidoId}, com o total ${totalPedido}`,
    );
    const response = this.httpService
      .post(`http://${this.MS_PAGAMENTO_URL}/v1/pagamento/solicitar`, {
        pedidoId: pedidoId,
        totalPedido: totalPedido,
      })
      .pipe(map((res) => res.data.pagamento))
      .pipe(
        catchError((error) => {
          this.logger.error(`Erro ao solicitar pagamento: ${JSON.stringify(error)} `);
          throw new IntegrationApplicationException(
            'Não foi possível realizar a integração com o MS de Pagamento para solicitar o pagamento.',
          );
        }),
      );

    const pagamentoResponse = await lastValueFrom(response);

    this.logger.debug('pagamentoResponse: ' + JSON.stringify(pagamentoResponse));

    return pagamentoResponse;
  }

  async buscarPorPedidoId(pedidoId: number): Promise<PagamentoDto> {
    this.logger.debug(
      `buscarPorPedidoId: invocando serviço de integração em http://${this.MS_PAGAMENTO_URL}/v1/pagamento/estado para o pedido ${pedidoId}`,
    );
    const request = this.httpService
      .get(`http://${this.MS_PAGAMENTO_URL}/v1/pagamento/estado?pedidoId=${pedidoId}`)
      .pipe(map((res) => res.data))
      .pipe(
        catchError((error) => {
          this.logger.warn(`Houve um erro ao buscar pagamento por pedido id: ${pedidoId} - ${JSON.stringify(error)}`);
          const statusError = error?.response?.status ?? error?.status;
          if (statusError === HttpStatus.NOT_FOUND) {
            throw new NaoEncontradoApplicationException(`Pagamento para pedido de id ${pedidoId} não encontrado.`);
          }
          throw new IntegrationApplicationException(
            'Não foi possível realizar a integração com o MS de Pagamento para solicitar o pagamento.',
          );
        }),
      );

    const pagamentoResponse = await lastValueFrom(request);

    this.logger.debug('pagamentoResponse: ' + JSON.stringify(pagamentoResponse));

    return pagamentoResponse;
  }
}
