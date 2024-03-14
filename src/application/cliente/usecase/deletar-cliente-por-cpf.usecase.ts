import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClienteConstants, PedidoConstants } from 'src/shared/constants';
import { BuscarClientePorCpfUseCase } from 'src/application/cliente/usecase/buscar-cliente-por-cpf.usecase';
import { BuscarTodosPedidosPorClienteIdUseCase } from 'src/application/pedido/usecase/buscar-todos-pedidos-por-cliente-id-usecase';
import { Cliente } from 'src/enterprise/cliente/model/cliente.model';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IPedidoRepository } from 'src/enterprise/pedido/repository/pedido.repository.interface';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { IRepository } from 'src/enterprise/repository/repository';
import { ClienteDeletado } from 'src/enterprise/cliente/model/cliente-deletado.model';
import { DateUtils } from 'src/shared';
import { v4 as uuidv4 } from 'uuid';
import { SqsIntegration } from 'src/integration/sqs/sqs.integration';

@Injectable()
export class DeletarClientePorCpfUseCase {
  private logger: Logger = new Logger(DeletarClientePorCpfUseCase.name);

  constructor(
    @Inject(ClienteConstants.IREPOSITORY) private clienteRepository: IRepository<Cliente>,
    @Inject(PedidoConstants.IREPOSITORY) private pedidoRepository: IPedidoRepository,
    @Inject(ClienteConstants.BUSCAR_CLIENTE_POR_CPF_USECASE)
    private buscarClientePorCpfUseCase: BuscarClientePorCpfUseCase,
    @Inject(PedidoConstants.BUSCAR_TODOS_PEDIDOS_POR_CLIENTE_ID_USECASE)
    private buscarTodosPedidosPorClienteIdUseCase: BuscarTodosPedidosPorClienteIdUseCase,
    @Inject(SqsIntegration) private clienteSnsIntegration: SqsIntegration,
  ) {}

  async deletarClientePorCpf(cpf: string): Promise<ClienteDeletado> {
    try {
      const clienteParaDeletar: Cliente = await this.buscarClientePorCpfUseCase.buscarClientePorCpf(cpf);
      this.logger.debug(`Cliente encontrado para o CPF ${cpf}: ${JSON.stringify(clienteParaDeletar)}`);
      const clienteDeletado = await this.deletarCliente(clienteParaDeletar);
      this.logger.log(`Cliente id ${clienteParaDeletar.id}, CPF ${cpf}, deletado com sucesso`);
      return clienteDeletado;
    } catch (erro) {
      this.logger.error(`Erro ao deletar cliente com CPF ${cpf}: ${erro}`);
      throw erro;
    }
  }

  private async deletarCliente(clienteParaDeletar: Cliente): Promise<ClienteDeletado> {
    const protocolo = uuidv4();
    const dataDelecao = DateUtils.toString(new Date());

    await this.registrarHistoricoDelecao(protocolo, dataDelecao, clienteParaDeletar.id);
    await this.transferirPedidosParaClienteLgpd(clienteParaDeletar);
    await this.removerClienteDaDatabase(clienteParaDeletar.id);

    return new ClienteDeletado(protocolo, dataDelecao);
  }

  private async removerClienteDaDatabase(id: number): Promise<void> {
    this.logger.debug(`Deletando cliente id ${id}`);
    await this.clienteRepository.delete(id);
    this.logger.debug(`Cliente id ${id} deletado`);
  }

  private async transferirPedidosParaClienteLgpd(clienteParaDeletar: Cliente): Promise<void> {
    const pedidos: Pedido[] = await this.buscarTodosPedidosPorClienteIdUseCase.buscarTodosPedidosPorCliente(
      clienteParaDeletar.id,
    );
    this.logger.debug(`Pedidos encontrados para o cliente: ${JSON.stringify(pedidos)}`);

    for (const pedido of pedidos) {
      await this.transferirClienteDoPedido(clienteParaDeletar, pedido);
    }
  }

  private async registrarHistoricoDelecao(protocolo: string, dataDelecao: string, id: number): Promise<void> {
    const snsResponse = await this.clienteSnsIntegration.sendLgpdProtocoloDelecao(protocolo, dataDelecao, id);
    this.logger.debug(`SNS response: ${JSON.stringify(snsResponse)}`);
  }

  private async transferirClienteDoPedido(cliente: Cliente, pedido: Pedido): Promise<void> {
    pedido.clienteId = Cliente.ID_CLIENTE_DELETADO_LGPD;
    this.logger.debug(
      `Trocando cliente id ${cliente.id} para cliente deletado id ${Cliente.ID_CLIENTE_DELETADO_LGPD} no pedido: ${pedido.id}`,
    );

    if (isNaN(pedido.total)) {
      delete pedido.total;
    }

    await this.pedidoRepository.edit(pedido).catch((error) => {
      this.logger.error(`Erro ao trocar cliente no pedido: ${error} `);
      throw new ServiceException(`Erro ao trocar cliente no pedido: ${error}`);
    });
  }
}
