import { Provider } from '@nestjs/common';

import { ClienteConstants, ItemPedidoConstants, PedidoConstants } from 'src/shared/constants';
import { ClienteMemoryRepository } from 'src/infrastructure/persistence/cliente/repository/cliente-memory.repository';
import { ItemPedidoMemoryRepository } from 'src/infrastructure/persistence/item-pedido/repository/item-pedido-memory.repository';
import { PedidoMemoryRepository } from 'src/infrastructure/persistence/pedido/repository/pedido-memory.repository';

export const PersistenceInMemoryProviders: Provider[] = [
   { provide: ClienteConstants.IREPOSITORY, useClass: ClienteMemoryRepository },
   { provide: PedidoConstants.IREPOSITORY, useClass: PedidoMemoryRepository },
   { provide: ItemPedidoConstants.IREPOSITORY, useClass: ItemPedidoMemoryRepository },
];
