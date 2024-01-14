Feature: Pedido
  Teste de integracao com endpoint /v1/pedido

  Scenario: Cadastrar um novo pedido
    When Nos solicitamos a criacao de um novo pedido com os dados:
      |     clienteId     | estadoPedido   |  ativo  |
      |          1        |      0         |   true  |
    Then Deve ser criado com sucesso

  Scenario: Consultar um pedido cadastrado
    When Nos solicitamos a consulta do pedido com id '1'
    Then Deve ser retornado com sucesso
    And O pedido deve conter os dados:
      | id |     clienteId     |  estadoPedido   |  ativo  |
      |  1 |          1        |       0         |   true  |
  
  Scenario: Editar um pedido cadastrado
    When Nos solicitamos a edicao de um pedido com os dados:
      | id |     clienteId     |  estadoPedido   |  ativo  |
      |  1 |          1        |       1         |   true  |
    Then Deve ser editado com sucesso

  Scenario: Listar todos os pedidos (recebidos, em preparacao e pronto)
    Given Nos temos pedidos cadastrados com estado recebido, em preparacao e pronto
    When Nos solicitamos todos os pedidos
    Then Os pedidos devem ser apresentados na ordem esperada

  Scenario: Listar todos os pedidos pendentes
    When Nos solicitamos todos os pedidos pendentes
    Then Os pedidos pendentes devem ser listados com os dados:
      | id |     clienteId     |   estadoPedido   |  ativo  |
      |  1 |          1        |        1         |   true  |
      |  2 |          1        |        2         |   true  |

  Scenario: Listar estado do pedido
    When Nos solicitamos o estado do pedido de id '1'
    Then O pedido deve retornar com o estado 1

  Scenario: Checkout do pedido
    When Nos solicitamos o checkout do pedido de id 1
    Then O pedido deve retornar com o id da transacao
