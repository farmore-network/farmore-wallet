/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RESOLVER_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
