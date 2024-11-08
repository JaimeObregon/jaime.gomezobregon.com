#!/bin/bash

yarn || exit 1

rsync -a --delete httpdocs/ build/

esbuild \
  httpdocs/modules/website.js \
  httpdocs/styles/website.css \
  --format=esm \
  --bundle \
  --minify \
  --legal-comments=none \
  --external:"/fonts/*" \
  --outdir=build/assets

jq --compact-output '.items[]' httpdocs/index.json | while IFS= read -r item; do
  eval "$(echo "$item" | jq -r '@sh "id=\(.id) url=\(.url) title=\(.title) language=\(.language) content_text=\(.content_text) date_published=\(.date_published)"')"

  mkdir -p "build/$id"

  metadata=$(
    printf '<title>%s</title>\' "$title"
    printf '<meta name="description" content="%s" />' "$content_text"
    printf '<meta property="og:title" content="%s" />' "$title"
    printf '<meta property="og:type" content="article" />'
    printf '<meta property="og:description" content="%s" />' "$content_text"
    printf '<meta property="og:image" content="https://jaime.gomezobregon.com/posts/%s/poster.png" />' "$id"
    printf '<meta property="og:url" content="https://jaime.gomezobregon.com" />'
    printf '<meta property="og:site_name" content="Jaime Gómez-Obregón" />'
    printf '<meta property="article:published_time" content="%s" />' "$date_published"
    printf '<meta name="twitter:card" content="summary_large_image" />'
    printf '<meta name="twitter:site" content="@JaimeObregon" />'
    printf '<meta name="twitter:creator" content="@JaimeObregon" />'
    printf '<meta name="twitter:image" content="https://jaime.gomezobregon.com/posts/%s/poster.png" />' "$id"
    printf '<meta name="twitter:image:alt" content="%s" />' "$title"
    )

  sed -e '/METADATA_BEGIN/,/METADATA_END/d' \
      -e "/<\/head>/i\\
$metadata" httpdocs/index.html \
      > "build/$id/index.html"
done
