#!/bin/bash

esbuild \
  httpdocs/assets/blog.js \
  httpdocs/assets/blog.css \
  --format=esm \
  --bundle \
  --minify \
  --legal-comments=none \
  --external:"/assets/fonts/*" \
  --outdir=httpdocs/build \
  --servedir=httpdocs \
  --serve-fallback=httpdocs/index.html \
  --watch
