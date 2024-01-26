import { Inject, Injectable, Logger } from '@nestjs/common';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IPedidoRepository } from 'src/enterprise/pedido/repository/pedido.repository.interface';
import { PedidoConstants } from 'src/shared/constants';
import { ProdutoIntegration } from '../../../integration/produto/produto.integration';

@Injectable()
export class BuscarTodosPedidosPendentesUseCase {
  private logger = new Logger(BuscarTodosPedidosPendentesUseCase.name);

  constructor(
    @Inject(PedidoConstants.IREPOSITORY) private repository: IPedidoRepository,
    @Inject(ProdutoIntegration) private produtoIntegration: ProdutoIntegration,
  ) {}

  async buscarTodosPedidosPendentes(): Promise<Pedido[]> {
    const pedidos = await this.repository.listarPedidosPendentes().catch((error) => {
      this.logger.error(`Erro ao buscar pedidos pendentes de pagamento no banco de dados: ${error}`);
      throw new ServiceException(`Erro ao buscar pedidos pendentes de pagamento no banco de dados: ${error}`);
    });

    return this.produtoIntegration.populaProdutosEmItensPedido(pedidos);
  }
}
