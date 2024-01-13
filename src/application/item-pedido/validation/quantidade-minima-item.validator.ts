import { Injectable, Logger } from '@nestjs/common';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { ItemPedido } from 'src/enterprise/item-pedido/model';
import { AddItemPedidoValidator } from 'src/application/item-pedido/validation/add-item-pedido.validator';

@Injectable()
export class QuantidadeMinimaItemValidator implements AddItemPedidoValidator {
  public static ERROR_MESSAGE = 'A quantidade mínima para um produto deve ser maior que zero';

  private logger = new Logger(QuantidadeMinimaItemValidator.name);

  async validate({ quantidade, pedidoId, produtoId }: ItemPedido): Promise<boolean> {
    this.logger.log(
      `Inicializando validação ${QuantidadeMinimaItemValidator.name} para quantidade mínima de um item do pedido.`,
    );

    if (quantidade > 0) {
      this.logger.debug(
        `${QuantidadeMinimaItemValidator.name} finalizado com sucesso do produto: ${produtoId} ao pedido: ${pedidoId}`,
      );

      return true;
    }

    this.logger.error(`Quantidade mínima de um novo item inválida: ${quantidade}`);
    throw new ValidationException(QuantidadeMinimaItemValidator.ERROR_MESSAGE);
  }
}
