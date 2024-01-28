import { Inject, Logger } from "@nestjs/common";
import { ValidationException } from "src/enterprise/exception/validation.exception";
import { ItemPedido } from "src/enterprise/item-pedido/model";
import { EstadoPedido } from "src/enterprise/pedido/enum/estado-pedido.enum";
import { Pedido } from "src/enterprise/pedido/model/pedido.model";
import { IRepository } from "src/enterprise/repository/repository";
import { IValidator } from "src/enterprise/validation/validator";
import { ItemPedidoConstants, PedidoConstants } from "src/shared/constants";

export class CheckoutRealizadoItemValidator implements IValidator<ItemPedido> {
    private logger: Logger = new Logger(CheckoutRealizadoItemValidator.name);
    public static PEDIDO_EM_CHECKOUT_ERROR_MESSAGE = 'Não é operar um item de um pedido em checkout.';

    constructor(
        @Inject(PedidoConstants.IREPOSITORY) private repository: IRepository<Pedido>,
        @Inject(ItemPedidoConstants.IREPOSITORY) private itemPedidoRepository: IRepository<ItemPedido>) {}

    async validate(itemPedido: ItemPedido): Promise<boolean> {        
        this.logger.log(`Inicializando validação ${CheckoutRealizadoItemValidator.name} de checkout realizado. itemPedido: ${JSON.stringify(itemPedido)}`);

        if (itemPedido.id){
            itemPedido = await this.itemPedidoRepository.findBy({id: itemPedido.id})
                .then((itemPedidos) => itemPedidos[0])
        }

        return await this.repository.findBy({id: itemPedido.pedidoId})
            .then((pedidos) => pedidos[0])
            .then((pedido) => {
                if (pedido.estadoPedido === EstadoPedido.CHECKOUT){
                    this.logger.debug(`O estado do pedido não pode ser pago ou em checkout, mas é ${pedido.estadoPedido}`);
                    throw new ValidationException(CheckoutRealizadoItemValidator.PEDIDO_EM_CHECKOUT_ERROR_MESSAGE);
                }

                return true;
            });
    }
}