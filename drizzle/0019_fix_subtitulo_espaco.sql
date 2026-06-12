-- Normaliza espaço após pontuação nos subtítulos (ex.: "distantes.Você" -> "distantes. Você").
-- Insere um espaço quando uma pontuação de fim de frase é seguida direto por maiúscula.
UPDATE "empreendimentos"
SET "subtitulo" = regexp_replace("subtitulo", '([.!?])([[:upper:]])', '\1 \2', 'g')
WHERE "subtitulo" ~ '[.!?][[:upper:]]';
