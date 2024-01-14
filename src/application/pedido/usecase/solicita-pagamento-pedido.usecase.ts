import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { PagamentoIntegration } from 'src/integration/pagamento/pagamento.integration';
import { PagamentoDto } from 'src/enterprise/pagamento/pagamento-dto';

@Injectable()
export class SolicitaPagamentoPedidoUseCase {
  private logger = new Logger(SolicitaPagamentoPedidoUseCase.name);

  constructor(@Inject(PagamentoIntegration) private pagamentoIntegration: PagamentoIntegration) {}

  async solicitaPagamento(pedido: Pedido): Promise<PagamentoDto> {
    this.logger.log(`solicitaPagamento: pedido = ${JSON.stringify(pedido)}`);
    const pagamentoDto = await this.pagamentoIntegration.solicitaPagamentoPedido(pedido.id, pedido.total);
    this.logger.debug(`pagamentoDto = ${JSON.stringify(pagamentoDto)}`);
    return pagamentoDto;
  }
}
