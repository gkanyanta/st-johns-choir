#!/bin/bash
# Generate PWA icons using a simple SVG
SVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="64" fill="#2563eb"/><text x="256" y="340" font-family="Arial" font-size="280" font-weight="bold" fill="white" text-anchor="middle">♫</text></svg>'

echo "$SVG" > icon.svg
# If you have ImageMagick: convert icon.svg -resize 192x192 icon-192x192.png
# If you have ImageMagick: convert icon.svg -resize 512x512 icon-512x512.png
echo "Place icon-192x192.png and icon-512x512.png in this directory"
