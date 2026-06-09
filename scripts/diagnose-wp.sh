#!/usr/bin/env bash
# Diagnostico rapido do WordPress do Benx.
# Rode local. Revela o que a REST API expoe antes de escrever os crawlers.
#
#   chmod +x diagnose-wp.sh && ./diagnose-wp.sh

BASE="https://benx.olivecomunicacao.com.br"
OUT="docs/diagnose"
mkdir -p "$OUT"

echo "== 1. A REST API responde? =="
curl -s -o "$OUT/root.json" -w "  status: %{http_code}\n" "$BASE/wp-json/"

echo "== 2. Quais tipos (CPTs) estao registrados? =="
# Aqui aparecem os CPTs do JetEngine (imoveis, empreendimentos, etc)
curl -s "$BASE/wp-json/wp/v2/types" -o "$OUT/types.json" \
  -w "  status: %{http_code}\n"
echo "  CPTs encontrados:"
cat "$OUT/types.json" | python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join('   - '+k+'  ('+v.get('rest_base','?')+')' for k,v in d.items()))" 2>/dev/null || echo "   (instale python3 ou inspecione $OUT/types.json na mao)"

echo "== 3. Paginas e posts (contagem) =="
for t in pages posts; do
  total=$(curl -s -I "$BASE/wp-json/wp/v2/$t?per_page=1" | grep -i "x-wp-total" | tr -d '\r' | awk '{print $2}')
  echo "  $t: ${total:-?}"
done

echo "== 4. Sitemap disponivel? =="
for sm in sitemap_index.xml wp-sitemap.xml sitemap.xml; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/$sm")
  echo "  /$sm -> $code"
done

echo "== 5. Meta fields do JetEngine aparecem na REST? =="
echo "  Pegando 1 item do primeiro CPT custom para inspecionar campos..."
echo "  (verifique em $OUT/types.json o rest_base e rode:)"
echo "   curl -s \"$BASE/wp-json/wp/v2/SEU_CPT?per_page=1\" | python3 -m json.tool"
echo ""
echo "Se 'meta' vier vazio ou ausente nos itens, os campos do JetEngine"
echo "(area, dormitorios, progresso de obra) estao protegidos: vamos extrair"
echo "via render HTML no crawl-render.ts."
echo ""
echo "Resultados crus salvos em $OUT/"
