# **Sistema de Reserva de Mesas em Tempo Real**

Este é um projeto full-stack que implementa um sistema de seleção de mesas em tempo real, permitindo que múltiplos utilizadores interajam com um mapa partilhado de forma simultânea. A aplicação é construída com React no frontend e Node.js/Express no backend, utilizando WebSockets para a comunicação em tempo real.

## **Lógica de Negócio**

O conceito central da aplicação é um "mapa de mesas" onde os utilizadores podem selecionar e reservar lugares usando um sistema de créditos.

* **Sistema de Créditos:** Cada utilizador começa com um número pré-definido de créditos. Estes créditos são a "moeda" usada para selecionar mesas no mapa.  
* **Seleção de Mesas:**  
  * Clicar numa mesa **livre** (branca) consome um crédito e marca a mesa como **selecionada** para aquele utilizador.  
  * Clicar novamente na sua própria mesa selecionada devolve a mesa ao estado **livre** e restitui o crédito ao utilizador.  
  * O objetivo final (não totalmente implementado) seria um botão "Comprar" que transformaria as mesas selecionadas em mesas **compradas** (verdes), finalizando a reserva.  
* **Interação em Tempo Real:** A principal característica é a simultaneidade. Quando um utilizador seleciona uma mesa, essa mudança é refletida instantaneamente nos ecrãs de **todos** os outros utilizadores conectados. A mesa aparecerá como selecionada por outro utilizador (amarela), impedindo a seleção por duas pessoas ao mesmo tempo.  
* **Gestão de Sessão e Consistência:**  
  * **Logout Explícito:** Se um utilizador clica em "Logout", o sistema garante que todas as mesas que ele tinha no estado "selecionada" sejam automaticamente devolvidas ao estado "livre", e os créditos correspondentes são restituídos à sua conta.  
  * **Desconexão Inesperada:** Para garantir a justiça e a disponibilidade das mesas, o sistema deteta se um utilizador simplesmente fechou o browser ou perdeu a ligação. Nesse caso, o backend executa a mesma rotina de limpeza do logout, libertando as mesas e devolvendo os créditos automaticamente.

## **Descrição Técnica**

A aplicação segue uma arquitetura moderna e desacoplada, com uma clara separação de responsabilidades entre o backend e o frontend.

### **Backend**

O backend é construído em Node.js e é responsável pela lógica de negócio, gestão de dados e comunicação em tempo real.

* **Stack:** Node.js, Express.js, TypeScript, MongoDB, Mongoose, WebSockets (ws).  
* **Arquitetura:** A estrutura segue o padrão MVC (Model-View-Controller) com uma camada de Serviços, promovendo a separação de interesses.  
  * **models/**: Define os schemas de dados para o Mongoose.  
    * user.model.ts: Estrutura do documento do utilizador (nome, idCasa, email, senha, créditos).  
    * table.model.ts: Estrutura do documento da mesa (posição, status, tipo, ownerId).  
  * **services/**: Contém a lógica de negócio principal, desacoplada de HTTP ou WebSockets.  
    * auth.service.ts: Lida com o registo, login e, crucialmente, a lógica de releaseUserTablesOnLogout, que utiliza **transações do MongoDB** para garantir que a devolução de créditos e a libertação de mesas aconteçam de forma atómica (ou tudo ou nada).  
    * table.service.ts: Contém a lógica de negócio para o clique numa mesa.  
    * websocket.service.ts: Centraliza a gestão das ligações WebSocket ativas e a função de broadcastMapUpdate.  
  * **controllers/**: Fazem a ponte entre os pedidos e os serviços.  
    * auth.controller.ts: Recebe os pedidos HTTP das rotas, chama os serviços de autenticação e envia a resposta.  
    * websocket.controller.ts: Orquestra o que acontece quando uma nova ligação WebSocket é estabelecida (on('connection')) e quando ela é terminada (on('close')). É no evento on('close') que a lógica de limpeza por desconexão inesperada é acionada.  
  * **routes/**: Define os endpoints da API REST.  
    * auth.routes.ts: Mapeia as URLs (/register, /login, /logout) para os seus respetivos controladores.  
  * **middleware/**: Funções que processam os pedidos antes de chegarem aos controladores.  
    * auth.middleware.ts: Protege rotas (como /logout) verificando a validade do token JWT enviado no cabeçalho Authorization.

### **Frontend**

O frontend é uma Single-Page Application (SPA) construída com React, focada em reatividade e numa boa experiência de utilizador.

* **Stack:** React, TypeScript.  
* **Arquitetura:** A estrutura é baseada em componentes, com uma gestão de estado clara e uma camada de serviços para a comunicação com a API.  
  * **pages/**: Componentes que representam as "telas" principais da aplicação.  
    * LoginPage.tsx: Responsável pelo formulário de login e registo.  
    * MapPage.tsx: Ecrã principal que orquestra a exibição do mapa de mesas e o modal de confirmação de logout.  
  * **components/**: Componentes reutilizáveis que formam as páginas.  
    * Header.tsx, TableGrid.tsx, Table.tsx: Componentes visuais para o mapa.  
    * ConfirmationModal.tsx: Um modal genérico e reutilizável que pede a confirmação do utilizador para ações importantes.  
  * **contexts/**: Utiliza a Context API do React para a gestão de estado global.  
    * AuthContext.tsx: Mantém o estado de autenticação (token, idCasa) e fornece as funções login e logout para toda a aplicação. A função logout foi implementada para primeiro chamar a API do backend antes de limpar os dados locais.  
    * WebSocketContext.tsx: Gere o estado recebido via WebSocket (a lista de mesas, os créditos) e fornece-o aos componentes que precisam de ser atualizados em tempo real.  
  * **hooks/**: Hooks customizados para encapsular lógicas complexas.  
    * useWebSocket.ts: Isola toda a lógica de ligação, receção e envio de mensagens WebSocket. Isto torna os componentes que o usam muito mais limpos, pois não precisam de se preocupar com os detalhes da gestão da ligação.  
  * **api/**: Camada de serviço para a comunicação com o backend.  
    * authService.ts: Centraliza todas as chamadas fetch relacionadas com a autenticação (loginUser, registerUser, logoutUser). Isto desacopla os componentes da lógica de rede, facilitando a manutenção.

## **Como Executar o Projeto**

### **Pré-requisitos**

* Node.js (versão 16 ou superior)  
* npm ou yarn  
* Uma instância do MongoDB a correr (localmente ou na nuvem)

### **Backend**

1. Navegue para a pasta do projeto backend.  
2. Instale as dependências:  
   npm install

3. Crie um arquivo .env na raiz da pasta do backend com o seguinte conteúdo, substituindo pelos seus valores:  
   PORT=8080  
   MONGODB\_URI=mongodb://localhost:27017/table-reservation  
   JWT\_SECRET=o\_seu\_segredo\_super\_secreto

4. Execute o servidor em modo de desenvolvimento:  
   npm run dev

   O servidor estará a correr em http://localhost:8080.

### **Frontend**

1. Navegue para a pasta do projeto frontend.  
2. Instale as dependências:  
   npm install

3. Execute a aplicação React:  
   npm start

   A aplicação abrirá no seu browser, geralmente em http://localhost:3000.