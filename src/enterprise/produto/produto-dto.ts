export class ProdutoDto {
   constructor(
      public nome: string,
      public idCategoriaProduto: number,
      public descricao: string,
      public preco: number,
      public imagemBase64: string,
      public ativo: boolean,
      public id: number,
   ) {}

   static fromJson(json: any) {
       return new ProdutoDto(
         json.nome,
         json.idCategoriaProduto,
         json.descricao,
         json.preco,
         json.imagemBase64,
         json.ativo,
         json.id,
      );
   }
}
