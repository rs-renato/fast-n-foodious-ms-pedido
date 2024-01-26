import { Inject, Injectable, Logger } from '@nestjs/common';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IPedidoRepository } from 'src/enterprise/pedido/repository/pedido.repository.interface';
import { PedidoConstants } from 'src/shared/constants';
import { ProdutoIntegration } from '../../../integration/produto/produto.integration';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';
import { IntegrationApplicationException } from 'src/application/exception/integration-application.exception';

@Injectable()
export class BuscarPedidoPorIdUseCase {
  private logger = new Logger(BuscarPedidoPorIdUseCase.name);

  constructor(
    @Inject(PedidoConstants.IREPOSITORY) private repository: IPedidoRepository,
    @Inject(ProdutoIntegration) private produtoIntegration: ProdutoIntegration,
  ) {}

  async buscarPedidoPorId(id: number): Promise<Pedido> {
    const pedidos = await this.repository
      .find({
        where: [{ id }],
        relations: ['itensPedido'],
      })
      .catch((error) => {
        const errorMessage = `Erro ao consultar pedido no banco de dados: ${error}`;
        this.logger.error(errorMessage);
        throw new ServiceException(errorMessage);
      });

      if (!pedidos.length) {
        this.logger.error(`Pedido id=${id} não encontrado`);
        throw new NaoEncontradoApplicationException(`Pedido não encontrado: ${id}`);
      }
  
     return await this.produtoIntegration.populaProdutoEmItemPedido(pedidos[0])
      .catch((error) => {
        this.logger.error(`Erro ao popular detalhes do pedido id=${id}: ${JSON.stringify(error)}`);
        throw new IntegrationApplicationException(`Houve um erro ao consultar detalhes do pedido: ${id}`);
      });
  }
}
