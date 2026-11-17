#!/bin/sh
# Download the Heart & Soul docs and rebuild src/data/hns.json. Run from the project root: npm run generate:nature-dex
set -e

DOCS=https://raw.githubusercontent.com/PokemonHnS-Development/pokehns-expansion-documentation/main
RAW=scripts/nature-dex/raw
mkdir -p "$RAW"

curl -sSfL -o "$RAW/pokedex.html" "$DOCS/pokedex.html"
curl -sSfL -o "$RAW/moves.html" "$DOCS/moves.html"
curl -sSfL -o "$RAW/showdown-pokedex.json" https://play.pokemonshowdown.com/data/pokedex.json

python3 -I scripts/nature-dex/extract_hns.py "$RAW/pokedex.html" "$RAW/moves.html" "$RAW/showdown-pokedex.json" src/data/hns.json
