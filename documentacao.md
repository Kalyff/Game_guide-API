Documentação da API - Microsserviço de Guias e Comunidade

Este microsserviço é responsável por gerenciar o motor de fórum, wiki, walkthroughs, comentários e avaliações de jogos dentro da plataforma GameVerse.
⚙️ Configuração de Produção e Autenticação

    Base URL: http://localhost:3000 (ou a porta definida no ambiente de produção).
    Autenticação: As rotas protegidas exigem o envio de um JWT Token no cabeçalho da requisição através do formato Bearer Token.  
    Headers obrigatórios para rotas protegidas: 
    
    Authorization: Bearer <seu_token_jwt>
Content-Type: application/json

URL DE PRODUÇÃO: https://gameguide-api-production.up.railway.app/

---

## 🚀 Endpoints (Rotas da API)

### 1. Listar Todos os Jogos
Retorna a listagem de jogos disponíveis no catálogo para alimentar a interface.
* **Rota:** `GET /api/games`
* **Autenticação:** Pública (Não exige token).
* **Resposta de Sucesso (200 OK):**
```json
[
  {
    "id": "game1",
    "title": "Skyrim"
  }
]


2. Listar Guias de um Jogo Específico

Busca todos os tutoriais e walkthroughs atrelados a um jogo específico, permitindo filtros opcionais por categoria na query string (ex: ?category=Conquistas).

    Rota: GET /api/games/:gameId/guides

    Autenticação: Pública (Não exige token).

    Resposta de Sucesso (200 OK):

{
  "gameId": "game1",
  "count": 1,
  "guides": [
    {
      "id": "g1",
      "gameId": "game1",
      "userId": "user1",
      "title": "100% Conquistas - Skyrim",
      "content": "# Guia Completo\nAqui você encontra todos os segredos...",
      "category": "Conquistas",
      "tags": ["platinado", "skyrim", "rpg"],
      "views": 120,
      "rating": 45,
      "createdAt": "2026-05-30T14:35:36.123Z"
    }
  ]
}


3. Criar Novo Guia de Comunidade

Cria um novo tutorial atrelado a um jogo. O userId do autor é extraído de forma segura e automática de dentro do Token JWT pelo middleware de autenticação.  

    Rota: POST /api/guides

    Autenticação: PROTEGIDA (Exige Bearer Token JWT).  

    Corpo da Requisição (Payload JSON):

    {
  "gameId": "game1",
  "title": "Guia Definitivo de Sobrevivência",
  "content": "# Introdução\nComo sobreviver aos primeiros níveis facilmente.",
  "category": "Walkthrough",
  "tags": ["dicas", "iniciantes"]
}

Resposta de Sucesso (201 Created):

{
  "message": "Guia criado com sucesso!",
  "guide": {
    "id": "g1780110875361",
    "gameId": "game1",
    "userId": "user123",
    "title": "Guia Definitivo de Sobrevivência",
    "content": "# Introdução\nComo sobreviver aos primeiros níveis facilmente.",
    "category": "Walkthrough",
    "tags": ["dicas", "iniciantes"],
    "views": 0,
    "rating": 0,
    "createdAt": "2026-05-30T14:35:36.123Z"
  }
}


4. Buscar Detalhes de um Guia (Contabilizar Visualização)

Busca o conteúdo em Markdown completo de um guia específico. Cada chamada bem-sucedida a esta rota incrementa automaticamente o contador de views do guia em +1.

    Rota: GET /api/guides/:id

    Autenticação: Pública (Não exige token).

    Resposta de Sucesso (200 OK):

  {
  "id": "g1",
  "gameId": "game1",
  "userId": "user1",
  "title": "100% Conquistas - Skyrim",
  "content": "# Guia Completo\nAqui você encontra todos os segredos...",
  "category": "Conquistas",
  "tags": ["platinado", "skyrim"],
  "views": 121,
  "rating": 45,
  "createdAt": "2026-05-30T14:35:36.123Z"
}  


5. Computar Voto / Avaliação no Guia

Computa upvotes ou downvotes enviados pela comunidade para alimentar o ranqueamento de relevância.

    Rota: POST /api/guides/:id/vote

    Autenticação: PROTEGIDA (Exige Bearer Token JWT).  

    Corpo da Requisição (Payload JSON):

    {
  "voteType": "upvote" // Aceita "upvote" ou "downvote"
}

Resposta de Sucesso (200 OK):

{
  "message": "Voto computado com sucesso!",
  "rating": 46
}


6. Adicionar Comentário no Guia

Insere uma nova discussão ou comentário em formato de texto para debate público em uma publicação existente.

    Rota: POST /api/guides/:id/comments

    Autenticação: PROTEGIDA (Exige Bearer Token JWT).  

    Corpo da Requisição (Payload JSON):

    {
  "content": "Muito bom esse tutorial, me ajudou bastante!"
}


Resposta de Sucesso (201 Created):

{
  "message": "Comentário adicionado!",
  "comment": {
    "id": "c1580214",
    "guideId": "g1",
    "userId": "user123",
    "content": "Muito bom esse tutorial, me ajudou bastante!",
    "createdAt": "2026-05-30T14:40:00.000Z"
  }
}


🛑 Tratamento de Erros Padrão (Códigos HTTP)

    401 Unauthorized: Retornado quando o Token JWT não é enviado, está mal formatado ou expirou.

 { "error": "Token não fornecido. Acesso não autorizado." }   

 *   **`400 Bad Request`**: Parâmetros obrigatórios ausentes na criação do payload de guias ou comentários.
    ```json
    { "error": "Parâmetros obrigatórios ausentes." }


  404 Not Found: Tentativa de buscar ou interagir com um ID de guia inexistente.
  
  { "error": "Guia não encontrado." }


  -------