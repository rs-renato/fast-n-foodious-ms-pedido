export class Cliente {
  // Para deletar um cliente por razões de LGPD, primeiro é necessário remover sua associação com quaisquer pedidos que
  // estejam associados a ele.
  // Durante a criação do banco de dados, um cliente é criado com ID 1 para representar clientes que requisitaram que
  // seus dados fossem deletados do sistema.
  // Antes que a deleção do cliente seja realizada, é necessário que todos os pedidos associados a ele sejam atualizados
  // para referenciarem o cliente identificado por ID_CLIENTE_DELETADO_LGPD.
  public static readonly ID_CLIENTE_DELETADO_LGPD: number = 1;

  constructor(public nome: string, public email: string, public cpf: string, public id?: number) {}
}
