import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClienteConstants, PedidoConstants } from 'src/shared/constants';
import { BuscarClientePorCpfUseCase } from 'src/application/cliente/usecase/buscar-cliente-por-cpf.usecase';
import { BuscarTodosPedidosPorClienteIdUseCase } from 'src/application/pedido/usecase/buscar-todos-pedidos-por-cliente-id-usecase';
import { Cliente } from 'src/enterprise/cliente/model/cliente.model';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IPedidoRepository } from 'src/enterprise/pedido/repository/pedido.repository.interface';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { IRepository } from 'src/enterprise/repository/repository';

@Injectable()
export class DeletarClientePorCpfUseCase {
  private logger: Logger = new Logger(DeletarClientePorCpfUseCase.name);

  constructor(
    @Inject(ClienteConstants.IREPOSITORY) private clienteRepository: IRepository<Cliente>,
    @Inject(PedidoConstants.IREPOSITORY) private pedidoRepository: IPedidoRepository,
    @Inject(ClienteConstants.BUSCAR_CLIENTE_POR_CPF_USECASE)
    private buscarClientePorCpfUseCase: BuscarClientePorCpfUseCase,
    @Inject(PedidoConstants.BUSCAR_TODOS_PEDIDOS_POR_CLIENTE_ID)
    private buscarTodosPedidosPorClienteIdUseCase: BuscarTodosPedidosPorClienteIdUseCase,
  ) {}

  async deletarClientePorCpf(cpf: string): Promise<boolean> {
    try {
      const clienteParaDeletar: Cliente = await this.buscarClientePorCpfUseCase.buscarClientePorCpf(cpf);
      this.logger.debug(`Cliente encontrado para o CPF ${cpf}: ${JSON.stringify(clienteParaDeletar)}`);

      const pedidos: Pedido[] = await this.buscarTodosPedidosPorClienteIdUseCase.buscarTodosPedidosPorCliente(
        clienteParaDeletar.id,
      );
      this.logger.debug(`Pedidos encontrados para o cliente: ${JSON.stringify(pedidos)}`);

      for (const pedido of pedidos) {
        await this.trocarClienteDoPedido(clienteParaDeletar, pedido);
      }

      this.logger.debug(`Deletando cliente id ${clienteParaDeletar.id}`);
      await this.clienteRepository.delete(clienteParaDeletar.id);
      this.logger.debug(`Cliente id ${clienteParaDeletar.id} deletado`);

      this.logger.log(`Cliente id ${clienteParaDeletar.id}, CPF ${cpf}, deletado com sucesso`);
      return true;
    } catch (erro) {
      this.logger.error(`Erro ao deletar cliente com CPF ${cpf}: ${erro}`);
      throw erro;
    }
  }

  private async trocarClienteDoPedido(cliente: Cliente, pedido: Pedido): Promise<void> {
    pedido.clienteId = Cliente.ID_CLIENTE_DELETADO_LGPD;
    this.logger.debug(
      `Trocando cliente id ${cliente.id} para cliente deletado id ${Cliente.ID_CLIENTE_DELETADO_LGPD} no pedido: ${pedido.id}`,
    );

    this.logger.debug(`RODRIGO pedido.total é ${pedido.total}`);
    if (isNaN(pedido.total)) {
      this.logger.debug(`OTTERO entrou`);
      delete pedido.total;
    }

    this.logger.debug(`RODRIGO depois da deleção, pedido: ${JSON.stringify(pedido)}`);

    await this.pedidoRepository.edit(pedido).catch((error) => {
      this.logger.error(`Erro ao trocar cliente no pedido: ${error} `);
      throw new ServiceException(`Erro ao trocar cliente no pedido: ${error}`);
    });
  }
}
