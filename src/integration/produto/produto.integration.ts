import { NotFoundException, ServiceUnavailableException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { ProdutoDto } from 'src/enterprise/produto/produto-dto';
import * as process from 'process';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';

@Injectable()
export class ProdutoIntegration {
   private logger = new Logger(ProdutoIntegration.name);

   private MS_PRODUTO_URL = process.env.MS_PRODUTO_INTEGRATION_URL;

   constructor(private httpService: HttpService) {}

   async getProdutoById(id: number): Promise<ProdutoDto> {
      this.logger.debug(
         `getProdutoById: invocando serviço de integração em http://${this.MS_PRODUTO_URL}/v1/produto/${id}`,
      );
      const request = this.httpService
         .get(`http://${this.MS_PRODUTO_URL}/v1/produto/${id}`)
         .pipe(map((res) => res.data))
         .pipe(
            catchError((error) => {
               const statusError = error.response.status;
               if (statusError === 404) {
                  throw new NotFoundException(`Produto ${id} não encontrado.`);
               }
               throw new ServiceUnavailableException(
                  'Não foi possível realizar a integração com o MS de Produto para buscar o produto.',
               );
            }),
         );

      const produtoByIdResponse = await lastValueFrom(request);

      const produtoDto = ProdutoDto.fromJson(produtoByIdResponse);

      this.logger.debug('produtoByIdResponse: ' + JSON.stringify(produtoByIdResponse));
      this.logger.debug('ProdutoDTO: ' + JSON.stringify(produtoDto));

      return produtoDto;
   }

   async insereProdutosEmItensPedido(pedidos: Pedido[]): Promise<Pedido[]> {
      for (const pedido of pedidos) {
         for (const item of pedido.itensPedido) {
            item.produto = await this.getProdutoById(item.produtoId);
         }
      }
      return pedidos;
   }

   async insereProdutoEmItemPedido(pedido: Pedido): Promise<Pedido> {
      const pedidoParametro = [pedido];
      const pedidos = await this.insereProdutosEmItensPedido(pedidoParametro);
      return pedidos[0];
   }

   // async editarProduto(produtoDto: ProdutoDto): Promise<void> {
   //    const produtoModificadoParaRecebido = {
   //       clienteId: produtoDto.clienteId,
   //       dataInicio: produtoDto.dataInicio,
   //       estadoProduto: produtoDto.estadoProduto,
   //       ativo: produtoDto.ativo,
   //    };
   //
   //    this.logger.debug(
   //       `editarProduto: invocando serviço de integração em http://${this.MS_PRODUTO_URL}/v1/produto/${produtoDto.id}`,
   //    );
   //    const request = this.httpService
   //       .put(`http://${this.MS_PRODUTO_URL}/v1/produto/${produtoDto.id}`, produtoModificadoParaRecebido)
   //       .pipe(map((res) => res.data))
   //       .pipe(
   //          catchError(() => {
   //             throw new ServiceUnavailableException(
   //                'Não foi possível realizar a integração com o MS de Produto para editar o produto.',
   //             );
   //          }),
   //       );
   //
   //    await lastValueFrom(request);
   // }
}
