interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string;
  readonly VITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
