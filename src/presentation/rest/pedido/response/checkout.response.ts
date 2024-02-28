import { ApiProperty } from '@nestjs/swagger';
import { PedidoComDadosDePagamento } from 'src/application/pedido/service/pedido.service.interface';
import { CheckoutPedidoResponse } from 'src/presentation/rest/pedido/response';
import { PagamentoPedidoResponse } from 'src/presentation/rest/pedido/response/pagamento-pedido.response';

export class CheckoutResponse {
  @ApiProperty({ required: true, nullable: false, description: 'Pedido do cliente' })
  public pedido: CheckoutPedidoResponse;

  @ApiProperty({ required: true, nullable: false, description: 'Dados do Pagamento do Pedido' })
  public pagamento: PagamentoPedidoResponse;

  constructor(checkout: PedidoComDadosDePagamento) {
    this.pedido = new CheckoutPedidoResponse(checkout.pedido);
    // this.pagamento = new PagamentoPedidoResponse(checkout.pagamento);
  }
}
