import { Inject, Injectable, Logger } from '@nestjs/common';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IPedidoRepository } from 'src/enterprise/pedido/repository/pedido.repository.interface';
import { PedidoConstants } from 'src/shared/constants';

@Injectable()
export class BuscarTodosPedidosPorClienteIdUseCase {
  private logger = new Logger(BuscarTodosPedidosPorClienteIdUseCase.name);

  constructor(@Inject(PedidoConstants.IREPOSITORY) private repository: IPedidoRepository) {}

  async buscarTodosPedidosPorCliente(clienteId: number): Promise<Pedido[]> {
    return await this.repository.findBy({ clienteId: clienteId }).catch((error) => {
      this.logger.error(`Erro ao buscar pedidos com clienteId=${clienteId} no banco de dados: ${error}`);
      throw new ServiceException(`Erro ao buscar pedidos com clienteId=${clienteId} no banco de dados: ${error}`);
    });
  }
}
