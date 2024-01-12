import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CheckoutPedidoValidator } from 'src/application/pedido/validation/checkout-pedido.validator';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { PagamentoIntegration } from 'src/integration/pagamento/pagamento.integration';
import { PagamentoDto } from 'src/enterprise/pagamento/pagamento-dto';

@Injectable()
export class CheckoutPedidoRealizadoValidator implements CheckoutPedidoValidator {
   public static CHECKOUT_JA_REALIZADO_ERROR_MESSAGE = 'Pedido informado já realizou checkout';

   private logger: Logger = new Logger(CheckoutPedidoRealizadoValidator.name);

   constructor(@Inject(PagamentoIntegration) private pagamentoIntegration: PagamentoIntegration) {}

   async validate({ id }: Pedido): Promise<boolean> {
      this.logger.log(
         `Inicializando validação ${CheckoutPedidoRealizadoValidator.name} para realizar o checkout para o pedido com id: ${id}`,
      );

      let pagamentoDto: PagamentoDto;
      try {
         pagamentoDto = await this.pagamentoIntegration.buscarPorPedidoId(id);
         this.logger.debug(`PagamentoDto: ${JSON.stringify(pagamentoDto)}`);
      } catch (error) {
         if (error instanceof NotFoundException) {
            this.logger.debug(`O pedido ${id} ainda não realizou checkout`);
            return true;
         }
         this.logger.error(`Erro ao buscar pagamento por pedido id: ${JSON.stringify(error)} `);
         throw error;
      }
      this.logger.debug(`O pedido ${id} já realizou checkout (Pagamento: ${pagamentoDto.estadoPagamento})`);
      throw new ValidationException(CheckoutPedidoRealizadoValidator.CHECKOUT_JA_REALIZADO_ERROR_MESSAGE);
   }
}
