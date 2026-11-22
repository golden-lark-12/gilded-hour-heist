// Entrypoint. One job: hand the game in — copy game/ and screenshots/
// from this repository into the output directory and write the dossier
// the kit library builds from them, byte for byte, deterministically.

import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
};

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outputDir, caps);
writeFileSync(join(outputDir, 'dossier.json'), dossier);

// Sanity echo for local runs: the dossier must stay inside its cap.
const dossierJson = readFileSync(join(outputDir, 'dossier.json'));
if (dossierJson.length > 1536 * 1024) {
  throw new Error(`dossier.json is ${dossierJson.length} bytes, over the 1.5 MiB cap`);
}
console.log(`wrote ${outputDir}/dossier.json (${dossierJson.length} bytes)`);
