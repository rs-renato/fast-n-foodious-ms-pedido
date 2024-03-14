import { Inject, Injectable, Logger } from '@nestjs/common';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';
import { Cliente } from 'src/enterprise/cliente/model/cliente.model';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { ClienteConstants, PedidoConstants } from 'src/shared/constants';

@Injectable()
export class BuscarClientePorIdPedidoUsecase {
  private logger: Logger = new Logger(BuscarClientePorIdPedidoUsecase.name);

  constructor(
    @Inject(PedidoConstants.IREPOSITORY) private pedidoRepository: IRepository<Pedido>,
    @Inject(ClienteConstants.IREPOSITORY) private clienteRepository: IRepository<Cliente>,
  ) {}

  async buscarClientePorPedidoId(pedidoId: number): Promise<Cliente> {
    this.logger.log(`Realizando consulta de cliente para o pedido: ${pedidoId}`);
    const pedidos = await this.pedidoRepository.findBy({ id: pedidoId }).catch((error) => {
      this.logger.error(`Erro ao buscar cliente do pedido: ${error} `);
      throw new ServiceException(`Houve um erro ao obter dados do cliente: ${error}`);
    });

    if (!pedidos.length) {
      this.logger.error(`Pedido id=${pedidoId} não encontrado`);
      throw new NaoEncontradoApplicationException(`Pedido não encontrado: ${pedidoId}`);
    }

    return this.clienteRepository.findBy({ id: pedidos[0].clienteId }).then((clientes) => {
      this.logger.log(`Cliente ${clientes[0].email} encontrado para o pedido #${pedidoId}`);
      return clientes[0];
    });
  }
}
