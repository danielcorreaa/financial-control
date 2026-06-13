---
description: Inicia o servidor de desenvolvimento do frontend (Vite na porta 5173) e abre o app no navegador. Requer o backend Spring Boot rodando na porta 8080.
---

Inicie o servidor de desenvolvimento do frontend deste projeto.

Passos:
1. Entre na pasta `frontend/` do projeto
2. Execute `npm run dev` para iniciar o Vite na porta 5173
3. Informe ao usuário que o app estará disponível em http://localhost:5173
4. Lembre que o backend Spring Boot precisa estar rodando em http://localhost:8080 (execute `./mvnw spring-boot:run` na raiz do projeto em outro terminal)
5. Use a skill `verify` se o usuário quiser confirmar que o app está funcionando no navegador
