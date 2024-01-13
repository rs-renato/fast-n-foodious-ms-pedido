import { Body, Controller, Inject, Logger, Post, Put, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { IItemPedidoService } from 'src/application/item-pedido/service/item-pedido.service.interface';
import { BaseRestApi } from 'src/presentation/rest/base.api';
import { SalvarItemPedidoResponse, SalvarItemPedidoRequest } from 'src/presentation/rest/item-pedido';
import { EditarItemPedidoRequest } from 'src/presentation/rest/item-pedido/request/editar-item-pedido.request';
import { EditarItemPedidoResponse } from 'src/presentation/rest/item-pedido/response/editar-item-pedido.response';
import { ItemPedidoConstants } from 'src/shared/constants';

@Controller('v1/item')
@ApiTags('Item')
export class ItemPedidoRestApi extends BaseRestApi {
  private logger: Logger = new Logger(ItemPedidoRestApi.name);

  constructor(@Inject(ItemPedidoConstants.ISERVICE) private service: IItemPedidoService) {
    super();
  }

  @Post()
  @ApiOperation({
    summary: 'Adiciona um novo item de pedido',
    description: 'Adiciona um novo item de pedido, identificado pelo id produto, id do pedido e quantidade',
  })
  @ApiCreatedResponse({ description: 'Item do pedido adicionado com sucesso', type: SalvarItemPedidoResponse })
  async salvar(@Body() item: SalvarItemPedidoRequest): Promise<SalvarItemPedidoResponse> {
    this.logger.debug(`Criando Novo Pedido Request: ${JSON.stringify(item)}`);

    return await this.service.save(item).then((itemAdicionado) => {
      this.logger.log(`Pedido gerado com sucesso: ${itemAdicionado.id}}`);
      return new SalvarItemPedidoResponse(itemAdicionado);
    });
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Edita um item do pedido',
    description: 'Edita um item do pedido, identificado pelo id do item vinculado ao id do pedido e id do produto',
  })
  @ApiOkResponse({ description: 'Item do pedido editado com sucesso', type: EditarItemPedidoResponse })
  async editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: EditarItemPedidoRequest,
  ): Promise<EditarItemPedidoResponse> {
    this.logger.debug(`Editando item do pedido request: ${JSON.stringify(request)}`);

    return await this.service
      .edit({
        ...request,
        id,
      })
      .then((itemPedido) => {
        this.logger.log(`Item do pedido editado com sucesso: ${itemPedido.id}`);
        return new EditarItemPedidoResponse(itemPedido);
      });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Exclui um item do pedido',
    description: 'Exclui um item de um pedido especificado pelo id',
  })
  @ApiOkResponse({ description: 'Item do pedido excluido com sucesso', type: Boolean })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    this.logger.debug(`Excluindo item do pedido id: ${id}`);

    return await this.service.delete(id).then((result) => {
      this.logger.log(`Item do pedido excluido com sucesso: ${id}}`);
      return result;
    });
  }
}
