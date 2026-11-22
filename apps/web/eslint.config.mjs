import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  ...nextVitals,
  ...nextTypescript,
  {
    // Dívida técnica rastreada: tipar as respostas da API e remover os `any` restantes.
    rules: { '@typescript-eslint/no-explicit-any': 'warn' },
  },
];

export default config;
