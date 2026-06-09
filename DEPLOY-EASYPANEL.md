# Deploy do Benx no EasyPanel

Stack: Next.js 15 (app) + PostgreSQL + Redis + MinIO. Tudo via **um** serviço Compose.

## Passos

1. **EasyPanel > seu projeto > + Service > Compose.**
2. Em **Source**, conecte o GitHub `joaoterceiro/benx` (branch `main`).
3. Em **Compose file**, cole o conteúdo de [`easypanel-compose.yml`](./easypanel-compose.yml)
   (ou aponte o caminho para esse arquivo do repo).
4. Aba **Environment**, defina (troque os segredos):
   ```
   POSTGRES_PASSWORD=<senha forte>
   MINIO_USER=benxminio
   MINIO_PASSWORD=<senha forte>
   ADMIN_EMAIL=admin@benx.com.br
   ADMIN_SENHA=<senha forte do admin>
   SITE_URL=https://www.seudominio.com.br
   S3_PUBLIC_ENDPOINT=https://midia.seudominio.com.br
   RUN_SEED=true          # só no 1º deploy; remova depois
   ```
5. Aba **Domains**:
   - `www.seudominio.com.br` -> serviço **app**, porta **3000**
   - `midia.seudominio.com.br` -> serviço **minio**, porta **9000**
     (a URL da mídia é assinada com esse host; sem ele, as imagens não carregam)
6. **Deploy.** No boot o container roda as migrations e, se `RUN_SEED=true`, o seed
   inicial (admin + dados base). Depois do 1º deploy, mude `RUN_SEED=false` e re-deploy.

## Atualizações
Cada `git push` na branch `main` -> **Deploy** no EasyPanel reconstrói e sobe a nova versão.
As migrations novas são aplicadas automaticamente no boot.

## Notas
- O bucket `benx-midia` é criado automático (download público) pelo serviço `minio-init`.
- Sem `S3_PUBLIC_ENDPOINT` (domínio público do MinIO), o app sobe mas as mídias
  não abrem no navegador (URL assinada apontaria para host interno).
- Segredos ficam só no EasyPanel (Environment); o `.env` não vai para o Git.
