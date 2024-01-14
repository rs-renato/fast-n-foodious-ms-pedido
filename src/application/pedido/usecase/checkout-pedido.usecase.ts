import { Inject, Injectable, Logger } from '@nestjs/common';
import { BuscarItensPorPedidoIdUseCase } from 'src/application/pedido/usecase/buscar-itens-por-pedido-id.usecase';
import { EditarPedidoUseCase } from 'src/application/pedido/usecase/editar-pedido.usecase';
import { CheckoutPedidoValidator } from 'src/application/pedido/validation/checkout-pedido.validator';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { PedidoConstants, ProdutoConstants } from 'src/shared/constants';
import { ValidatorUtils } from 'src/shared/validator.utils';
import { PedidoComDadosDePagamento } from 'src/application/pedido/service/pedido.service.interface';
import { BuscarProdutoPorIdUseCase } from 'src/application/pedido/usecase/buscar-produto-por-id.usecase';
import { SolicitaPagamentoPedidoUseCase } from 'src/application/pedido/usecase/solicita-pagamento-pedido.usecase';

@Injectable()
export class CheckoutPedidoUseCase {
  private logger: Logger = new Logger(CheckoutPedidoUseCase.name);
  constructor(
    @Inject(ProdutoConstants.BUSCAR_PRODUTO_POR_ID_USECASE)
    private buscarProdutoPorIdUseCase: BuscarProdutoPorIdUseCase,
    @Inject(PedidoConstants.BUSCAR_ITENS_PEDIDO_POR_PEDIDO_ID_USECASE)
    private buscarItensPorPedidoIdUseCase: BuscarItensPorPedidoIdUseCase,
    @Inject(PedidoConstants.EDITAR_PEDIDO_USECASE) private editarPedidoUseCase: EditarPedidoUseCase,
    @Inject(PedidoConstants.SOLICITA_PAGAMENTO_PEDIDO_USECASE)
    private solicitaPagamentoPedidoUseCase: SolicitaPagamentoPedidoUseCase,
    @Inject(PedidoConstants.CHECKOUT_PEDIDO_VALIDATOR)
    private validators: CheckoutPedidoValidator[],
  ) {}

  async checkout(pedido: Pedido): Promise<PedidoComDadosDePagamento> {
    this.logger.log(`Checkout ativado para pedido = ${JSON.stringify(pedido)}`);
    await ValidatorUtils.executeValidators(this.validators, pedido);
    // listar items pedido
    const itemPedidos = await this.buscarItensPorPedidoIdUseCase.buscarItensPedidoPorPedidoId(pedido.id);
    // calcular o total do pedido
    let totalPedido = 0;
    for (const itemPedido of itemPedidos) {
      const produto = await this.buscarProdutoPorIdUseCase.buscarProdutoPorID(itemPedido.produtoId);
      totalPedido += itemPedido.quantidade * produto.preco;
    }
    pedido.total = totalPedido;

    // registra a necessidade de pagamento do pedido
    const pagamento = await this.solicitaPagamentoPedidoUseCase.solicitaPagamento(pedido);
    this.logger.debug(`pagamento: ${JSON.stringify(pagamento)}`);

    const pedidoRetornado = await this.editarPedidoUseCase.editarPedido(pedido);
    this.logger.debug(`pedidoRetornado: ${JSON.stringify(pedidoRetornado)}`);

    return {
      pedido: pedidoRetornado,
      pagamento,
    };
  }
}
