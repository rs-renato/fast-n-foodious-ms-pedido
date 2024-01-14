import { Entity, Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PedidoEntity } from '../../pedido/entity/pedido.entity';

@Entity({ name: 'ITEM_PEDIDO' })
export class ItemPedidoEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'PEDIDO_ID' })
  pedidoId: number;

  @Column({ name: 'PRODUTO_ID' })
  produtoId: number;

  @Column({ name: 'QUANTIDADE' })
  quantidade: number;

  @ManyToOne(() => PedidoEntity, (pedido) => pedido.itensPedido)
  @JoinColumn({ name: 'PEDIDO_ID' })
  pedido?: PedidoEntity;
}
