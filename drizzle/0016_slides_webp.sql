-- Slides otimizados: png/jpg foram convertidos para .webp em /public/slides.
-- Atualiza as referências dos slides para a extensão .webp.
UPDATE "hero_slides"
SET "imagem" = regexp_replace("imagem", '\.(png|jpe?g)$', '.webp')
WHERE "imagem" ~* '\.(png|jpe?g)$';
