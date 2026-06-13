---
description: Comita as mudanças atuais no git com mensagem gerada automaticamente
---

# Skill: /commit

Quando o usuário invoca `/commit`, execute este fluxo completo de commit git:

## 1 — Inspecionar o estado atual

Execute em paralelo:
- `git status` para ver arquivos modificados/novos
- `git diff HEAD` para ver o conteúdo das mudanças
- `git log --oneline -5` para ver o estilo das mensagens anteriores

## 2 — Analisar e propor

Com base nas mudanças encontradas:
- Identifique o tipo: `feat`, `fix`, `style`, `refactor`, `docs`, `chore`, `ci`
- Escreva uma mensagem de commit em **português** no formato:
  ```
  tipo: descrição curta e clara (máx 72 chars)
  ```
- Se as mudanças forem complexas, adicione um corpo explicando o "por quê"

**Tipos:**
| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `style` | CSS, formatação visual, dark mode |
| `refactor` | Reorganização sem mudar comportamento |
| `docs` | Documentação, tutoriais, README |
| `chore` | Config, dependências, Dockerfile, CI |
| `ci` | Pipeline, deploy, variáveis de ambiente |

## 3 — Staged files

Adicione ao stage apenas os arquivos relevantes:
- **NÃO** adicione: `.env`, arquivos de segredo, binários grandes
- **NÃO** use `git add .` ou `git add -A` sem verificar antes
- Use `git add` com caminhos específicos por tipo de mudança

## 4 — Commit

Crie o commit com co-author:

```bash
git commit -m "$(cat <<'EOF'
tipo: mensagem aqui

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

## 5 — Confirmar

Rode `git log --oneline -1` e mostre o commit criado ao usuário.

---

## Regras importantes

- Se não houver mudanças, informe e não crie commit vazio
- Se o usuário passar argumentos (`/commit fix no dark mode`), use como dica para a mensagem
- **Nunca** use `--no-verify`, `--force` ou `--amend` sem o usuário pedir explicitamente
- Se um hook falhar, investigue e corrija antes de tentar novamente
