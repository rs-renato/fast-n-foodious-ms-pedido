import { ItemPedido } from 'src/enterprise/item-pedido/model';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IService } from 'src/enterprise/service/service';
import { PagamentoDto } from 'src/enterprise/pagamento/pagamento-dto';

export type PedidoComDadosDePagamento = {
  pedido: Pedido;
  pagamento: PagamentoDto;
};

export interface IPedidoService extends IService<Pedido> {
  save(type: Pedido): Promise<Pedido>;
  edit(type: Pedido): Promise<Pedido>;
  delete(id: number): Promise<boolean>;
  findById(id: number, populaProdutoEmItemPedido?: boolean): Promise<Pedido>;
  findByIdEstadoDoPedido(pedidoId: number): Promise<{ estadoPedido: EstadoPedido }>;
  findAllByEstadoDoPedido(estado: EstadoPedido): Promise<Pedido[]>;
  listarPedidosPendentes(): Promise<Pedido[]>;
  listarPedidosNaoFinalizados(): Promise<Pedido[]>;
  checkout(id: number): Promise<PedidoComDadosDePagamento>;
  buscarItensPedidoPorPedidoId(pedidoId: number): Promise<ItemPedido[]>;
}
