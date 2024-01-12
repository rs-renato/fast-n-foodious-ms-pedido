import { ServiceUnavailableException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import * as process from 'process';
import { PagamentoDto } from 'src/enterprise/pagamento/pagamento-dto';

@Injectable()
export class PagamentoIntegration {
   private logger = new Logger(PagamentoIntegration.name);

   private MS_PAGAMENTO_URL = process.env.MS_PAGAMENTO_INTEGRATION_URL;

   constructor(private httpService: HttpService) {}

   async solicitaPagamentoPedido(pedidoId: number, totalPedido: number): Promise<PagamentoDto> {
      this.logger.debug(
         `solicitaPagamentoPedido: invocando serviço de integração em http://${this.MS_PAGAMENTO_URL}/v1/pagamento/solicitar`,
      );
      const request = this.httpService
         .post(`http://${this.MS_PAGAMENTO_URL}/v1/pagamento/solicitar`, {
            pedidoId: pedidoId,
            totalPedido: totalPedido,
         })
         .pipe(map((res) => res.data))
         .pipe(
            catchError((error) => {
               this.logger.error(`Erro ao solicitar pagamento: ${JSON.stringify(error)} `);
               throw new ServiceUnavailableException(
                  'Não foi possível realizar a integração com o MS de Pagamento para solicitar o pagamento.',
               );
            }),
         );

      const pagamentoResponse = await lastValueFrom(request);

      this.logger.debug('pagamentoResponse: ' + JSON.stringify(pagamentoResponse));

      return pagamentoResponse;
   }
}
