Feature: Item de Pedido
  Teste de integracao com endpoint /v1/item

  Scenario: Adicionar um item ao pedido
    Given Nos temos um produto cadastrado
    And Temos um cliente cadastrado
    And Temos um pedido criado
    When Nos adicionamos o item cadastrado ao pedido
    Then Deve ser adicionado com sucesso

  Scenario: Editar um item ao pedido
    Given Nos temos um item adicionado
    When Nos alteramos a quantidade desse item para 2
    Then Deve ser editado com sucesso

  Scenario: Remover um item do pedido
    Given Nos temos um item adicionado
    When Nos removemos este item
    Then Deve ser removido com sucesso