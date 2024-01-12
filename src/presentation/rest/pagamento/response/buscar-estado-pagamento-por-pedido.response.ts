import { ApiProperty } from '@nestjs/swagger';
import { EstadoPagamento } from 'src/enterprise/pagamento/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';

export class BuscarEstadoPagamentoPedidoResponse {
   @ApiProperty({
      required: true,
      nullable: false,
      enum: EstadoPagamento,
      description: `${Object.values(EstadoPagamento)
         .filter((value) => typeof value === 'number')
         .map((value) => `${value}:${EstadoPagamento[value]}`)
         .join(', ')}`,
   })
   public estadoPagamento: EstadoPagamento;

   constructor(pagamento: Partial<Pagamento>) {
      this.estadoPagamento = pagamento.estadoPagamento;
   }
}
