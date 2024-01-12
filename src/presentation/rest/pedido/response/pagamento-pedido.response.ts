import { ApiProperty } from '@nestjs/swagger';
import { EstadoPagamento } from 'src/enterprise/pagamento/estado-pagamento.enum';
import { PagamentoDto } from 'src/enterprise/pagamento/pagamento-dto';

export class PagamentoPedidoResponse {
   @ApiProperty({
      required: true,
      nullable: false,
      description: 'Transacao ID (simulacao de retorno de um ID de transacao por uma API de terceiros)',
   })
   public transacaoId: string;

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

   constructor(pagamento: PagamentoDto) {
      this.transacaoId = pagamento.transacaoId;
      this.estadoPagamento = pagamento.estadoPagamento;
   }
}
