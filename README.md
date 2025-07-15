# Sistema de Reserva de Mesas em Tempo Real

Este é um projeto full-stack que implementa um sistema de reserva de mesas em tempo real. A plataforma permite que múltiplos usuários, logados em suas contas, interajam simultaneamente com um mapa de mesas compartilhado. Todas as ações, como selecionar ou liberar uma mesa, são refletidas instantaneamente para todos os participantes conectados, graças ao uso de WebSockets para a comunicação.

A lógica de negócio é centrada em um sistema de créditos, onde os usuários utilizam diferentes tipos de crédito para selecionar e comprar mesas, que podem ser simples ou duplas.

## Stack Técnico

*   **Backend**: Node.js, Express.js, TypeScript, WebSockets (biblioteca `ws`)
*   **Frontend**: React, TypeScript, HTML5, CSS3
*   **Banco de Dados**: MongoDB (NoSQL)
*   **Autenticação**: Tokens JWT (JSON Web Tokens)

---

## Lógica da Aplicação

O sistema opera com base em um conjunto de regras que definem como os usuários interagem com as mesas e gerenciam seus créditos.

### 1. Usuários e Créditos

*   Existem dois tipos de usuários: **Usuário Normal** e **Administrador**.
*   O acesso é feito via login (`id-casa`, `senha`). Novos usuários começam com **2 Créditos Normais** e **0 Créditos Especiais**.
*   **Crédito Normal**: Usado para selecionar mesas temporariamente. É um recurso consumível e reembolsável.
*   **Crédito Especial**: Usado para comprar mesas diretamente. É ganho ao confirmar a compra de mesas selecionadas.

### 2. O Mapa e os Estados das Mesas

O mapa é uma matriz de mesas, onde cada mesa pode ser **Simples ("S")** ou **Dupla ("D")**. O estado de cada mesa é comunicado visualmente através de um sistema de cores, que depende do status, do tipo e de quem realizou a ação.

| Status da Mesa                      | Tipo    | Cor          | Interação                                   |
| ----------------------------------- | ------- | ------------ | ------------------------------------------- |
| **Livre**                           | -       | **Branco**   | Clicável (se o usuário tiver créditos)      |
| **Selecionada pelo usuário atual**  | Simples | **Azul Claro** | Clicável para liberar ou transformar em dupla |
|                                     | Dupla   | **Azul Escuro**| Clicável para liberar                       |
| **Comprada pelo usuário atual**     | Simples | **Verde Claro**| Clicável para liberar                       |
|                                     | Dupla   | **Verde Escuro**| Clicável para liberar                       |
| **Selecionada por outro usuário**   | Simples | **Amarelo Claro**| Não interativa                              |
|                                     | Dupla   | **Amarelo Escuro**| Não interativa                              |
| **Comprada por outro usuário**      | Simples | **Cinza Claro**| Não interativa                              |
|                                     | Dupla   | **Cinza Escuro**| Não interativa                              |

### 3. Regras de Interação (Cliques nas Mesas)

A ação de um clique em uma mesa depende do estado dela e do saldo de créditos do usuário. O sistema segue uma máquina de estados bem definida:

*   **Clicar em uma Mesa Livre (Branca):**
    *   Se o usuário tiver **Crédito Especial**, a mesa se torna **Comprada ("S", Verde Claro)** e 1 Crédito Especial é gasto.
    *   Caso contrário, se tiver **Crédito Normal**, a mesa se torna **Selecionada ("S", Azul Claro)** e 1 Crédito Normal é gasto.
    *   Se não tiver nenhum dos créditos, nada acontece.

*   **Clicar em uma Mesa Selecionada "S" (Azul Claro) pelo próprio usuário:**
    *   Se o usuário tiver **Crédito Normal**, a mesa é transformada em **Dupla ("D", Azul Escuro)**, gastando mais 1 Crédito Normal.
    *   Se não tiver Crédito Normal, a seleção é cancelada: a mesa fica **Livre (Branca)** e o usuário recebe **1 Crédito Normal** de volta.

*   **Clicar em uma Mesa Selecionada "D" (Azul Escuro):**
    *   A seleção é cancelada: a mesa fica **Livre (Branca)** e o usuário recebe **2 Créditos Normais** de volta.

*   **Clicar em uma Mesa Comprada (Verde):**
    *   A compra é desfeita: a mesa fica **Livre (Branca)** e o respectivo valor em **Créditos Especiais** é devolvido (1 para "S", 2 para "D").

### 4. Ações Especiais

*   **Comprar Mesas:**
    *   O usuário pode confirmar a compra de todas as suas mesas selecionadas (azuis) através de um pop-up.
    *   Ao confirmar, as mesas mudam de **Selecionada (Azul)** para **Comprada (Verde)**.
    *   O usuário ganha **1 Crédito Especial** para cada Crédito Normal gasto na seleção (1 para mesa "S", 2 para mesa "D").

*   **Logout:**
    *   Se o usuário tiver mesas selecionadas (azuis), um pop-up de confirmação aparece, avisando sobre a perda das seleções.
    *   Se confirmado, as mesas selecionadas voltam ao estado **Livre**, os **Créditos Normais** correspondentes são reembolsados, e a sessão é encerrada. Mesas compradas (verdes) não são afetadas.

---

## Arquitetura da Aplicação: Backend vs. Frontend

A aplicação é dividida em duas partes distintas que se comunicam via API REST (para autenticação) e WebSockets (para interações em tempo real).

### Backend (A Fonte da Verdade)

O backend, construído com Node.js e Express, é o cérebro da aplicação. Suas responsabilidades são:

*   **Gerenciar a Lógica de Negócio:** Implementa todas as regras de interação, a máquina de estados das mesas e a gestão de créditos.
*   **Ser a Autoridade Central:** O servidor é a única fonte da verdade para o estado do mapa. Nenhuma lógica de jogo é executada no cliente.
*   **Comunicação em Tempo Real:** Mantém um servidor WebSocket. Ele recebe eventos simples dos clientes (ex: `{"evento": "cliqueMesa", "idMesa": "A1"}`) e, após processar a ação, transmite (**broadcast**) o estado atualizado do mapa para **todos** os clientes conectados.
*   **Persistência de Dados:** Conecta-se ao MongoDB para armazenar e atualizar informações de usuários, mesas e seus estados de forma atômica, prevenindo conflitos e condições de corrida (`race conditions`).
*   **Autenticação e Segurança:** Gerencia o registro, login e logout de usuários, emitindo e validando tokens JWT para proteger as rotas e identificar os usuários nas conexões WebSocket.

### Frontend (A Interface Reativa)

O frontend, construído com React, é a camada de apresentação visual e de interação. Suas responsabilidades são:

*   **Renderizar a Interface:** Exibe o mapa de mesas, o saldo de créditos e outros elementos da UI com base nos dados recebidos do servidor.
*   **Gerenciar a Conexão WebSocket:** Estabelece e mantém a conexão com o servidor WebSocket, ouvindo por mensagens de atualização do mapa.
*   **Reagir a Mudanças de Estado:** Quando recebe uma mensagem de `atualizacaoMapa` do backend, o frontend redesenha a interface para refletir o novo estado, aplicando as cores e textos corretos ("S" ou "D") a cada mesa.
*   **Enviar Intenções do Usuário:** Captura as ações do usuário (como cliques em mesas) e as envia como mensagens simples ao backend, sem processar nenhuma regra complexa.
*   **Orquestrar a Experiência do Usuário:** Lida com a exibição de formulários de login/registro e pop-ups modais para confirmações, interagindo com a API do backend quando necessário.
