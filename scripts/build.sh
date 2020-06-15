#!/bin/bash

TSFILES=$(find src -name '*.ts' ! -name '*.test.ts')
BACKUP_EXT='.build.bak'

# https://github.com/google/clasp/blob/master/docs/typescript.md#modules-exports-and-imports
for f in $TSFILES; do
    sed --in-place="$BACKUP_EXT" 's/export namespace/namespace/; /import/d' "$f"
done

npx tsc --out dist/compiled.js --removeComments --target ES2019 --lib ESNext --moduleResolution Node $TSFILES

for f in $(find src -name "*.ts$BACKUP_EXT"); do 
    mv -- "$f" "${f%"$BACKUP_EXT"}"
done
