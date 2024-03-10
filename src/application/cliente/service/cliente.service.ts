import { Inject, Injectable } from '@nestjs/common';
import { IClienteService } from 'src/application/cliente/service/cliente.service.interface';
import { ClienteIdentificado } from 'src/enterprise/cliente/model/cliente-identificado.model';
import { Cliente } from 'src/enterprise/cliente/model/cliente.model';
import { ClienteConstants } from 'src/shared/constants';
import { BuscarClientePorCpfUseCase } from 'src/application/cliente/usecase/buscar-cliente-por-cpf.usecase';
import { SalvarClienteUseCase } from 'src/application/cliente/usecase/salvar-cliente.usecase';
import { IdentificarClienteUseCase } from 'src/application/cliente/usecase/identificar-cliente-por-cpf.usecase';
import { DeletarClientePorCpfUseCase } from 'src/application/cliente/usecase/deletar-cliente-por-cpf.usecase';
import { ClienteDeletado } from 'src/enterprise/cliente/model/cliente-deletado.model';

@Injectable()
export class ClienteService implements IClienteService {
  constructor(
    @Inject(ClienteConstants.BUSCAR_CLIENTE_POR_CPF_USECASE) private buscarUsecase: BuscarClientePorCpfUseCase,
    @Inject(ClienteConstants.SALVAR_CLIENTE_USECASE) private salvarUsecase: SalvarClienteUseCase,
    @Inject(ClienteConstants.IDENTIFICAR_CLIENTE_POR_CPF_USECASE)
    private identificarUsecase: IdentificarClienteUseCase,
    @Inject(ClienteConstants.DELETAR_CLIENTE_POR_CPF_USECASE)
    private deletarClientePorCpfUseCase: DeletarClientePorCpfUseCase,
  ) {}

  async findByCpf(cpf: string): Promise<Cliente> {
    return await this.buscarUsecase.buscarClientePorCpf(cpf);
  }

  async save(cliente: Cliente): Promise<Cliente> {
    return await this.salvarUsecase.salvarCliente(cliente);
  }

  async identifyByCpf(cpf: string): Promise<ClienteIdentificado> {
    return await this.identificarUsecase.identificarClientePorCpf(cpf);
  }

  async deletarByCpf(cpf: string): Promise<ClienteDeletado> {
    return await this.deletarClientePorCpfUseCase.deletarClientePorCpf(cpf);
  }
}
