# Guia de Commits

Este documento descreve as convenções e boas práticas para fazer commits neste projeto.

## Padrão de Mensagens de Commit

O projeto utiliza o **Conventional Commits** com validação automática através do Commitlint e Husky.

### Estrutura da Mensagem

```
<tipo>: <descrição curta>

[corpo opcional]

[rodapé opcional]
```

### Tipos Permitidos

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Apenas mudanças na documentação
- **style**: Mudanças que não afetam o código (espaços, formatação, ponto e vírgula, etc)
- **refactor**: Mudança de código que não corrige bug nem adiciona funcionalidade
- **test**: Adiciona ou modifica testes
- **chore**: Mudanças em ferramentas, configurações, dependências, etc
- **perf**: Mudanças que melhoram performance

### Regras

1. **Tipo obrigatório**: A mensagem deve começar com um dos tipos acima
2. **Descrição clara**: Seja conciso mas descritivo
3. **Idioma**: Use português para as mensagens
4. **Letra minúscula**: O tipo deve estar em minúsculo
5. **Sem ponto final**: Não coloque ponto final na descrição

## Exemplos

### ✅ Commits Corretos

```bash
# Nova funcionalidade
git commit -m "feat: adiciona endpoint de perfil nutricional"

# Correção de bug
git commit -m "fix: corrige erro ao salvar usuário sem email"

# Documentação
git commit -m "docs: atualiza README com instruções de deploy"

# Alteração de estilo/formatação
git commit -m "style: formata código do AuthService"

# Refatoração
git commit -m "refactor: simplifica lógica de validação de senha"

# Testes
git commit -m "test: adiciona testes para LoginRegisterService"

# Configurações/dependências
git commit -m "chore: atualiza dependências do projeto"
git commit -m "chore: remove pasta dist do controle de versão"

# Performance
git commit -m "perf: otimiza query de busca de usuários"
```

### ❌ Commits Incorretos

```bash
# Sem tipo
git commit -m "adiciona nova funcionalidade"

# Tipo inválido
git commit -m "feature: adiciona login"

# Tipo em maiúscula
git commit -m "FEAT: adiciona perfil"

# Com ponto final
git commit -m "feat: adiciona perfil."
```

## Processo de Commit

### 1. Verifique as mudanças

```bash
git status
```

### 2. Adicione os arquivos

```bash
# Adicionar arquivos específicos
git add caminho/do/arquivo.ts

# Adicionar todos os arquivos modificados
git add .
```

### 3. Faça o commit

```bash
git commit -m "tipo: descrição da mudança"
```

### 4. Validação Automática

Ao fazer o commit, o Husky executará automaticamente:

1. **Lint-staged**: Verifica e formata os arquivos
2. **Commitlint**: Valida a mensagem do commit

Se houver erro, o commit será rejeitado e você precisará corrigir.

### 5. Envie para o repositório

```bash
# Primeira vez enviando a branch
git push -u origin nome-da-branch

# Próximos pushes
git push
```

## Fluxo Completo

```bash
# 1. Verificar mudanças
git status

# 2. Adicionar arquivos
git add backend/src/auth/Auth.Service.ts

# 3. Fazer commit com mensagem adequada
git commit -m "feat: adiciona autenticação JWT"

# 4. Push para o repositório
git push
```

## Dicas

- **Commits pequenos**: Faça commits frequentes e pequenos
- **Uma mudança por commit**: Não misture funcionalidades diferentes
- **Descrição clara**: Alguém deve entender o que foi feito só lendo a mensagem
- **Presente do indicativo**: Use "adiciona" ao invés de "adicionado" ou "adicionando"

## Problemas Comuns

### Commit rejeitado por mensagem inválida

```bash
Error: commit message does not follow conventional commits
```

**Solução**: Refaça o commit com a mensagem correta:

```bash
git commit --amend -m "feat: mensagem correta"
```

### Lint-staged falhou

```bash
Error: Linting failed
```

**Solução**: Corrija os erros apontados e tente novamente:

```bash
git add .
git commit -m "sua mensagem"
```

## Referências

- [Conventional Commits](https://www.conventionalcommits.org/pt-br/)
- [Commitlint](https://commitlint.js.org/)
- [Husky](https://typicode.github.io/husky/)
