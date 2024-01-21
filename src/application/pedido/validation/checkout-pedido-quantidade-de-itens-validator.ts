import { Injectable, Logger } from '@nestjs/common';
import { CheckoutPedidoValidator } from 'src/application/pedido/validation/checkout-pedido.validator';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';

@Injectable()
export class CheckoutPedidoQuantidadeDeItensValidator implements CheckoutPedidoValidator {
  public static readonly CHECKOUT_PEDIDO_SEM_ITEMS = 'Pedido informado não possui itens';

  private logger: Logger = new Logger(CheckoutPedidoQuantidadeDeItensValidator.name);

  async validate({ id, itensPedido }: Pedido): Promise<boolean> {
    this.logger.log(
      `Inicializando validação ${CheckoutPedidoQuantidadeDeItensValidator.name} para realizar o checkout do pedido com id: ${id}`,
    );

    if (itensPedido?.length) return true;

    throw new ValidationException(CheckoutPedidoQuantidadeDeItensValidator.CHECKOUT_PEDIDO_SEM_ITEMS);
  }
}
