import { Inject, Injectable, Logger } from '@nestjs/common';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IPedidoRepository } from 'src/enterprise/pedido/repository/pedido.repository.interface';
import { PedidoConstants } from 'src/shared/constants';

@Injectable()
export class BuscarTodosPedidosPorClienteIdUseCase {
  private logger = new Logger(BuscarTodosPedidosPorClienteIdUseCase.name);

  constructor(@Inject(PedidoConstants.IREPOSITORY) private repository: IPedidoRepository) {}

  async buscarTodosPedidosPorCliente(clienteId: number): Promise<Pedido[]> {
    const pedidos: Pedido[] = await this.repository.findBy({ clienteId: clienteId }).catch((error) => {
      this.logger.error(`Erro ao buscar pedidos com clienteId=${clienteId} no banco de dados: ${error}`);
      throw new ServiceException(`Erro ao buscar pedidos com clienteId=${clienteId} no banco de dados: ${error}`);
    });

    if (!pedidos.length) {
      this.logger.error(`Pedidos com clienteId=${clienteId} não encontrados`);
      throw new NaoEncontradoApplicationException(`Pedidos com clienteId=${clienteId} não encontrados`);
    }

    return pedidos;
  }
}
