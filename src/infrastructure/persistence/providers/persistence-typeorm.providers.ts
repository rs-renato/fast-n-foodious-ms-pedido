import { Provider } from '@nestjs/common';

import { ClienteConstants, ItemPedidoConstants, PedidoConstants } from 'src/shared/constants';

import { ClienteTypeormRepository } from 'src/infrastructure/persistence/cliente/repository/cliente-typeorm.repository';
import { ItemPedidoTypeormRepository } from 'src/infrastructure/persistence/item-pedido/repository/item-pedido-typeorm.repository';
import { PedidoTypeormRepository } from 'src/infrastructure/persistence/pedido/repository/pedido-typeorm.repository';

export const PersistenceTypeOrmProviders: Provider[] = [
   { provide: ClienteConstants.IREPOSITORY, useClass: ClienteTypeormRepository },
   { provide: PedidoConstants.IREPOSITORY, useClass: PedidoTypeormRepository },
   { provide: ItemPedidoConstants.IREPOSITORY, useClass: ItemPedidoTypeormRepository },
];
