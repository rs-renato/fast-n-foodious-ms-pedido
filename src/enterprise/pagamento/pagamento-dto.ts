import { EstadoPagamento } from 'src/enterprise/pagamento/estado-pagamento.enum';

export class PagamentoDto {
  constructor(
    public id: number,
    public pedidoId: number,
    public transacaoId: string,
    public estadoPagamento: EstadoPagamento,
    public total: number,
    public dataHoraPagamento: Date,
  ) {}
}
