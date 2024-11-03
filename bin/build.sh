#!/bin/bash

yarn || exit 1

cp -aR httpdocs httpdocs/build

esbuild \
  httpdocs/assets/blog.js \
  httpdocs/assets/blog.css \
  --format=esm \
  --bundle \
  --minify \
  --legal-comments=none \
  --external:"/assets/fonts/*" \
  --outdir=httpdocs/build

# Esta es la semántica de `sed` para el entorno Linux de Netlify.
# La semántica de `sed` en macOS es diferente.
sed -E "s/\/assets\/(blog\.(css|js))/\/build\/\1/" -i httpdocs/index.html
