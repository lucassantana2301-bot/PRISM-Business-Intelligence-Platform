# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adota o
[Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [1.0.0] - 2026-11-22

Primeira versão estável.

### Segurança

- Atualização para **Next.js 16** e **React 19**, eliminando a vulnerabilidade crítica do Next.js 14
  apontada pelo `npm audit` (0 vulnerabilidades conhecidas nas dependências após a atualização).
- **Validador de SQL**: a raiz da AST agora precisa ser uma consulta (`SELECT`/`UNION`/subconsulta); antes
  qualquer comando passava pela checagem estrutural. A lista de nós proibidos passou a ser resolvida por
  nome, o que corrige a quebra de toda validação com versões novas do `sqlglot` (`AlterTable` → `Alter`).
- **Ordenação na API Python** restrita às colunas projetadas pela consulta: o campo era interpolado direto no SQL.

### Corrigido

- Consultas por tempo ou dimensão que misturavam métricas de pedidos e de sessões referenciavam a tabela de
  sessões sem join; agora cada fonte é agregada separadamente e unida pelas chaves de agrupamento.
- Métricas sem suporte a agrupamento retornam erro claro em vez de erro de binder do DuckDB.
- Regras novas de hooks do React 19: estado derivado sem `useEffect`, leitura do `?q=` no servidor e render puro.

### Adicionado

- **CI** com lint, checagem de tipos, as 9 suítes de verificação, build de produção, auditoria de dependências,
  e ruff + pytest na API Python; **Dependabot** e release automática por versão.
- Testes pytest do validador de SQL e do motor analítico, incluindo regressões dos bugs acima.
- Licença MIT, guia de contribuição, política de segurança e templates de issue e PR.

[Não lançado]: https://github.com/lucassantana2301-bot/PRISM-Business-Intelligence-Platform/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/lucassantana2301-bot/PRISM-Business-Intelligence-Platform/releases/tag/v1.0.0
