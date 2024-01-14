import { Module } from '@nestjs/common';

import { ClienteService } from 'src/application/cliente/service/cliente.service';
import { ItemPedidoService } from 'src/application/item-pedido/service/item-pedido.service';
import { PedidoService } from 'src/application/pedido/service/pedido.service';
import { ClienteProviders } from 'src/application/cliente/providers/cliente.providers';
import { PedidoProviders } from 'src/application/pedido/providers/pedido.providers';
import { ItemPedidoProviders } from 'src/application/item-pedido/providers/item-pedido.providers';
import { ClienteConstants, PedidoConstants, ItemPedidoConstants } from 'src/shared/constants';
import { IntegrationProviders } from '../integration/providers/integration.providers';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [...ClienteProviders, ...PedidoProviders, ...ItemPedidoProviders, ...IntegrationProviders],
  exports: [
    { provide: ClienteConstants.ISERVICE, useClass: ClienteService },
    { provide: PedidoConstants.ISERVICE, useClass: PedidoService },
    { provide: ItemPedidoConstants.ISERVICE, useClass: ItemPedidoService },
  ],
})
export class ApplicationModule {}
