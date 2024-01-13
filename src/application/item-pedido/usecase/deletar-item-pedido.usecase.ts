import { Inject, Injectable, Logger } from '@nestjs/common';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { ItemPedido } from 'src/enterprise/item-pedido/model';
import { IRepository } from 'src/enterprise/repository/repository';
import { ItemPedidoConstants } from 'src/shared/constants';
import { EditarItemPedidoValidator } from 'src/application/item-pedido/validation';
import { ValidatorUtils } from 'src/shared/validator.utils';

@Injectable()
export class DeletarItemPedidoUseCase {
  private logger = new Logger(DeletarItemPedidoUseCase.name);

  constructor(
    @Inject(ItemPedidoConstants.IREPOSITORY) private repository: IRepository<ItemPedido>,
    @Inject(ItemPedidoConstants.EDITAR_ITEM_PEDIDO_VALIDATOR)
    private editarValidators: EditarItemPedidoValidator[],
  ) {}

  async deletarItemPedido(id: number): Promise<boolean> {
    await ValidatorUtils.executeValidators(this.editarValidators, { id });

    return await this.repository.delete(id).catch((error) => {
      this.logger.error(`Erro ao deletar no banco de dados: ${error} `);
      throw new ServiceException(`Houve um erro ao deletar o item do pedido: ${error}`);
    });
  }
}
