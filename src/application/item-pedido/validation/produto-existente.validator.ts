import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { ItemPedido } from 'src/enterprise/item-pedido/model';
import { AddItemPedidoValidator } from 'src/application/item-pedido/validation/add-item-pedido.validator';
import { ProdutoIntegration } from 'src/integration/produto/produto.integration';

@Injectable()
export class ProdutoExistentePedidoValidator implements AddItemPedidoValidator {
   public static ERROR_MESSAGE = 'Código de produto inexistente';

   private logger: Logger = new Logger(ProdutoExistentePedidoValidator.name);

   constructor(@Inject(ProdutoIntegration) private produtoIntegration: ProdutoIntegration) {}

   async validate({ produtoId }: ItemPedido): Promise<boolean> {
      this.logger.log(
         `Inicializando validação ${ProdutoExistentePedidoValidator.name} para criar o pedido com o produto: ${produtoId}`,
      );

      try {
         const produtoDto = await this.produtoIntegration.getProdutoById(produtoId);
         this.logger.debug(
            `${ProdutoExistentePedidoValidator.name} finalizado com sucesso para produto: ${JSON.stringify(
               produtoDto,
            )}`,
         );
         return true;
      } catch (error) {
         if (error instanceof NotFoundException) {
            throw new ValidationException(ProdutoExistentePedidoValidator.ERROR_MESSAGE);
         }
         this.logger.debug(`${ProdutoExistentePedidoValidator.name} finalizado com erro: ${error}`);
         throw error;
      }
   }
}
