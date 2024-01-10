import { Inject, Injectable, Logger } from '@nestjs/common';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { Produto } from 'src/enterprise/produto/model/produto.model';
import { ItemPedido } from 'src/enterprise/item-pedido/model';
import { AddItemPedidoValidator } from 'src/application/item-pedido/validation/add-item-pedido.validator';
import { IRepository } from 'src/enterprise/repository/repository';
import { ProdutoConstants } from 'src/shared/constants';
import { ProdutoIntegration } from 'src/integration/produto/produto.integration';

@Injectable()
export class ProdutoInativoPedidoValidator implements AddItemPedidoValidator {
   public static ERROR_MESSAGE = 'O produto está inativo';

   private logger: Logger = new Logger(ProdutoInativoPedidoValidator.name);

   constructor(@Inject(ProdutoIntegration) private produtoIntegration: ProdutoIntegration) {}

   async validate({ produtoId }: ItemPedido): Promise<boolean> {
      this.logger.log(
         `Inicializando validação ${ProdutoInativoPedidoValidator.name} para criar o pedido com o produto: ${produtoId}`,
      );

      const produtoDto = await this.produtoIntegration.getProdutoById(produtoId);
      this.logger.debug(`Produto retornado: ${JSON.stringify(produtoDto)}`);

      if (produtoDto.ativo) {
         return true;
      }

      throw new ValidationException(ProdutoInativoPedidoValidator.ERROR_MESSAGE);
   }
}
