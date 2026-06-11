-- Usuario admin inicial (idempotente). Necessario porque o seed (db:seed) so roda
-- com RUN_SEED=true; via migration ele sempre existe apos um banco novo.
-- Senha: benx1234 (TROCAR no admin apos o primeiro login).
INSERT INTO "usuarios" ("nome","email","senha_hash","papel")
VALUES ('Administrador','admin@benx.com.br','a9c43025c1969f2065357d43ec5c86cd:4865d3147a0d2e7b385dd5daf1430fff53d83fca14dd04e14091a2a0da2a8482986ec3022165857c417f5b5c28221f87a3cd43d6b2b77b1a9e4c312da8a24e13','admin')
ON CONFLICT ("email") DO NOTHING;
