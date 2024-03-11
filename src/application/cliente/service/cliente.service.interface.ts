import { ClienteIdentificado } from 'src/enterprise/cliente/model/cliente-identificado.model';
import { Cliente } from 'src/enterprise/cliente/model/cliente.model';
import { IService } from 'src/enterprise/service/service';
import { ClienteDeletado } from 'src/enterprise/cliente/model/cliente-deletado.model';

export interface IClienteService extends IService<Cliente> {
  save(type: Cliente): Promise<Cliente>;
  findByCpf(cpf: string): Promise<Cliente>;
  identifyByCpf(cpf: string): Promise<ClienteIdentificado>;
  deletarByCpf(cpf: string): Promise<ClienteDeletado>;
}
