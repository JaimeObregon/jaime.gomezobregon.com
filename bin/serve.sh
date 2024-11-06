#!/bin/bash

esbuild \
  httpdocs/modules/website.js \
  httpdocs/styles/website.css \
  --format=esm \
  --bundle \
  --minify \
  --legal-comments=none \
  --external:"/fonts/*" \
  --outdir=httpdocs/build \
  --servedir=httpdocs \
  --serve-fallback=httpdocs/index.html \
  --watch
