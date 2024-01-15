-- Criação de banco de dados
CREATE DATABASE IF NOT EXISTS FAST_N_FOODIOUS;

-- Configuração de permissão para usuário da aplicação
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX, REFERENCES ON FAST_N_FOODIOUS.* TO 'fnf_user'@'%';
FLUSH PRIVILEGES;

USE FAST_N_FOODIOUS;

--
-- CRIAÇÃO DE TABELAS
--

-- Tabela cliente
CREATE TABLE IF NOT EXISTS CLIENTE (
                                       ID INT AUTO_INCREMENT PRIMARY KEY,
                                       NOME VARCHAR(255) NOT NULL,
                                       EMAIL VARCHAR(255) NOT NULL,
                                       CPF VARCHAR(11) NOT NULL
);

-- indexes para tabela CLIENTE
CREATE UNIQUE INDEX cliente_email_idx ON CLIENTE(EMAIL);
CREATE UNIQUE INDEX cliente_cpf_idx ON CLIENTE(CPF);

-- Tabela PEDIDO
CREATE TABLE IF NOT EXISTS PEDIDO (
                                       ID INT AUTO_INCREMENT PRIMARY KEY,
                                       PEDIDO_CLIENTE_ID INT NOT NULL, CONSTRAINT FK_PEDIDO_CLIENTE_ID FOREIGN KEY (PEDIDO_CLIENTE_ID) REFERENCES CLIENTE(ID),
                                       DATA_INICIO VARCHAR(255) NOT NULL,
                                       ESTADO_PEDIDO INT NOT NULL,
                                       ATIVO BOOLEAN NOT NULL DEFAULT TRUE,
                                       TOTAL DECIMAL(8,2) NULL
);

-- Tabela ITEMS DE PEDIDO
CREATE TABLE IF NOT EXISTS ITEM_PEDIDO (
                                       ID INT AUTO_INCREMENT PRIMARY KEY,
                                       PEDIDO_ID INT NOT NULL, CONSTRAINT FK_PEDIDO_ID FOREIGN KEY (PEDIDO_ID) REFERENCES PEDIDO(ID),
                                       PRODUTO_ID INT NOT NULL, CONSTRAINT FK_PRODUTO_ID FOREIGN KEY (PRODUTO_ID) REFERENCES PRODUTO(ID),
                                       QUANTIDADE INT NOT NULL
);
