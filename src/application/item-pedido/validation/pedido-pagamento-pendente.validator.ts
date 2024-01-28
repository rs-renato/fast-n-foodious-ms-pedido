import { Inject, Logger } from '@nestjs/common';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { ItemPedido } from 'src/enterprise/item-pedido/model';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { IValidator } from 'src/enterprise/validation/validator';
import { ItemPedidoConstants, PedidoConstants } from 'src/shared/constants';

export class PedidoPagamentoPendenteValidator implements IValidator<ItemPedido> {
  private logger: Logger = new Logger(PedidoPagamentoPendenteValidator.name);
  public static PEDIDO_PAGO_OU_CHECKOUT_ERROR_MESSAGE = 'Não é operar um item de um pedido pago ou em checkout.';

  constructor(
    @Inject(PedidoConstants.IREPOSITORY) private repository: IRepository<Pedido>,
    @Inject(ItemPedidoConstants.IREPOSITORY) private itemPedidoRepository: IRepository<ItemPedido>,
  ) {}

  async validate(itemPedido: ItemPedido): Promise<boolean> {
    this.logger.log(
      `Inicializando validação ${
        PedidoPagamentoPendenteValidator.name
      } de pagamento pendente. itemPedido: ${JSON.stringify(itemPedido)}`,
    );

    if (itemPedido.id) {
      itemPedido = await this.itemPedidoRepository.findBy({ id: itemPedido.id }).then((itemPedidos) => itemPedidos[0]);
    }

    await this.repository
      .findBy({ id: itemPedido.pedidoId })
      .then((pedidos) => pedidos[0])
      .then((pedido) => {
        if (pedido.estadoPedido !== EstadoPedido.PAGAMENTO_PENDENTE && pedido.estadoPedido !== EstadoPedido.CHECKOUT) {
          this.logger.debug(`O estado do pedido não pode ser pago ou em checkout, mas é ${pedido.estadoPedido}`);
          throw new ValidationException(PedidoPagamentoPendenteValidator.PEDIDO_PAGO_OU_CHECKOUT_ERROR_MESSAGE);
        }
      });

    return true;
  }
}
