import { Inject, Injectable, Logger } from '@nestjs/common';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IPedidoRepository } from 'src/enterprise/pedido/repository/pedido.repository.interface';
import { PedidoConstants } from 'src/shared/constants';
import { ProdutoIntegration } from '../../../integration/produto/produto.integration';

@Injectable()
export class BuscarPedidoPorIdUseCase {
  private logger = new Logger(BuscarPedidoPorIdUseCase.name);

  constructor(
    @Inject(PedidoConstants.IREPOSITORY) private repository: IPedidoRepository,
    @Inject(ProdutoIntegration) private produtoIntegration: ProdutoIntegration,
  ) {}

  async buscarPedidoPorId(id: number): Promise<Pedido> {
    return await this.repository
      .find({
        where: [{ id }],
        relations: ['itensPedido'],
      })
      .then((pedidos) => {
        if (pedidos === undefined || pedidos.length === 0) {
          return pedidos[0];
        }
        return this.produtoIntegration.insereProdutoEmItemPedido(pedidos[0]);
      })
      .catch((error) => {
        const errorMessage = `Erro ao consultar pedido no banco de dados: ${error}`;

        this.logger.error(errorMessage);
        throw new ServiceException(errorMessage);
      });
  }
}
