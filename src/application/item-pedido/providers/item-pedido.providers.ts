import { Provider } from '@nestjs/common';

import { ItemPedidoService } from 'src/application/item-pedido/service/item-pedido.service';
import { ItemPedido } from 'src/enterprise/item-pedido/model';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import {
  QuantidadeMinimaItemValidator,
  ItemPedidoExistenteValidator,
  AddItemPedidoValidator,
  EditarItemPedidoValidator,
  PedidoExistenteValidator,
  ProdutoExistentePedidoValidator,
} from 'src/application/item-pedido/validation';
import { IRepository } from 'src/enterprise/repository/repository';
import { ItemPedidoConstants, PedidoConstants } from 'src/shared/constants';
import { SalvarItemPedidoUseCase } from 'src/application/item-pedido/usecase/salvar-item-pedido.usecase';
import { EditarItemPedidoUseCase } from 'src/application/item-pedido/usecase/editar-item-pedido.usecase';
import { DeletarItemPedidoUseCase } from 'src/application/item-pedido/usecase/deletar-item-pedido.usecase';
import { ProdutoInativoPedidoValidator } from 'src/application/item-pedido/validation/produto-inativo.validator';
import { ProdutoIntegration } from 'src/integration/produto/produto.integration';
import { PedidoPagamentoPendenteValidator } from 'src/application/item-pedido/validation/pedido-pagamento-pendente.validator';
import { CheckoutRealizadoItemValidator } from 'src/application/item-pedido/validation/checkout-realizado-item.validator';

export const ItemPedidoProviders: Provider[] = [
  { provide: ItemPedidoConstants.ISERVICE, useClass: ItemPedidoService },
  {
    provide: ItemPedidoConstants.ADD_ITEM_PEDIDO_VALIDATOR,
    inject: [PedidoConstants.IREPOSITORY,
      ItemPedidoConstants.IREPOSITORY,
      ProdutoIntegration],
    useFactory: (
      pedidoRepository: IRepository<Pedido>,
      itemPedidoRepository: IRepository<ItemPedido>,
      produtoIntegration: ProdutoIntegration,
    ): AddItemPedidoValidator[] => [
      new QuantidadeMinimaItemValidator(),
      new PedidoExistenteValidator(pedidoRepository),
      new ProdutoExistentePedidoValidator(produtoIntegration),
      new ProdutoInativoPedidoValidator(produtoIntegration),
      new PedidoPagamentoPendenteValidator(pedidoRepository, itemPedidoRepository),
      new CheckoutRealizadoItemValidator(pedidoRepository, itemPedidoRepository),
    ],
  },
  {
    provide: ItemPedidoConstants.EDITAR_ITEM_PEDIDO_VALIDATOR,
    inject: [ItemPedidoConstants.IREPOSITORY,
      PedidoConstants.IREPOSITORY],
    useFactory: (repository: IRepository<ItemPedido>,
        pedidoRepository: IRepository<Pedido>,
      ): EditarItemPedidoValidator[] => [
      new ItemPedidoExistenteValidator(repository),
      new PedidoPagamentoPendenteValidator(pedidoRepository, repository),
      new CheckoutRealizadoItemValidator(pedidoRepository, repository),
    ],
  },
  {
    provide: ItemPedidoConstants.SALVAR_ITEM_PEDIDO_USECASE,
    inject: [ItemPedidoConstants.IREPOSITORY, ItemPedidoConstants.ADD_ITEM_PEDIDO_VALIDATOR],
    useFactory: (repository: IRepository<ItemPedido>, validators: AddItemPedidoValidator[]): SalvarItemPedidoUseCase =>
      new SalvarItemPedidoUseCase(repository, validators),
  },
  {
    provide: ItemPedidoConstants.EDITAR_ITEM_PEDIDO_USECASE,
    inject: [
      ItemPedidoConstants.IREPOSITORY,
      ItemPedidoConstants.ADD_ITEM_PEDIDO_VALIDATOR,
      ItemPedidoConstants.EDITAR_ITEM_PEDIDO_VALIDATOR,
    ],
    useFactory: (
      repository: IRepository<ItemPedido>,
      adicionarValidators: AddItemPedidoValidator[],
      editarValidators: EditarItemPedidoValidator[],
    ): EditarItemPedidoUseCase => new EditarItemPedidoUseCase(repository, adicionarValidators, editarValidators),
  },
  {
    provide: ItemPedidoConstants.DELETAR_ITEM_PEDIDO_USECASE,
    inject: [ItemPedidoConstants.IREPOSITORY, ItemPedidoConstants.EDITAR_ITEM_PEDIDO_VALIDATOR],
    useFactory: (
      repository: IRepository<ItemPedido>,
      editarValidators: EditarItemPedidoValidator[],
    ): DeletarItemPedidoUseCase => new DeletarItemPedidoUseCase(repository, editarValidators),
  },
];
