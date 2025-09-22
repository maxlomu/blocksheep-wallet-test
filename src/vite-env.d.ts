/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRIVY_APP_ID: string
  readonly VITE_RPC_PROVIDER: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
