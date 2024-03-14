import { ApiProperty } from '@nestjs/swagger';
import { ClienteDeletado } from 'src/enterprise/cliente/model/cliente-deletado.model';

export class DeletarClientePorCpfResponse {
  @ApiProperty({ required: true, nullable: false, description: 'Protocolo de deleção' })
  public protocolo: string;

  @ApiProperty({ required: true, nullable: false, description: 'Data da deleção', pattern: 'yyyy-MM-dd' })
  public dataDelecao: string;

  constructor(clienteDeletado: ClienteDeletado) {
    this.protocolo = clienteDeletado.protocolo;
    this.dataDelecao = clienteDeletado.dataDelecao;
  }
}
