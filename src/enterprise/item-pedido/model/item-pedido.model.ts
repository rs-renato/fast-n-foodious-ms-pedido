import { Produto } from 'src/enterprise/produto/model/produto.model';
import { ProdutoDto } from '../../produto/produto-dto';

export class ItemPedido {
   constructor(
      public pedidoId: number,
      public produtoId: number,
      public quantidade: number,
      public id?: number,
      public produto?: ProdutoDto, // public produto?: Produto,
   ) {}
}
