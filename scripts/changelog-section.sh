#!/usr/bin/env bash
# Extrai do CHANGELOG.md (formato Keep a Changelog) a seção de uma versão.
# Uso: changelog-section.sh 1.2.0 [CHANGELOG.md]  -> imprime o corpo da seção, sem o título.
set -euo pipefail
version="${1:?uso: changelog-section.sh <versão> [arquivo]}"
file="${2:-CHANGELOG.md}"
section="$(awk -v v="$version" '
  /^## \[/ { if (found) exit; if (index($0, "## [" v "]") == 1) { found = 1; next } }
  found { print }
' "$file")"
if [ -z "$(printf '%s' "$section" | tr -d '[:space:]')" ]; then
  echo "seção [$version] não encontrada ou vazia em $file" >&2
  exit 1
fi
printf '%s\n' "$section"
