import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execSync } from 'node:child_process';

const cwd = process.cwd();

function parseArgs(argv) {
  const args = {
    threshold: 70,
    maxChars: 180000,
    output: 'SEGUIMIENTO_AUTO_HANDOFF.md',
    phase: 'Fase en curso',
    source: '',
    usage: Number.NaN,
    force: false,
    next: ''
  };

  argv.forEach((raw) => {
    if (raw === '--force') args.force = true;
    else if (raw.startsWith('--threshold=')) args.threshold = Number(raw.split('=')[1]);
    else if (raw.startsWith('--max-chars=')) args.maxChars = Number(raw.split('=')[1]);
    else if (raw.startsWith('--output=')) args.output = raw.split('=')[1] || args.output;
    else if (raw.startsWith('--phase=')) args.phase = raw.split('=')[1] || args.phase;
    else if (raw.startsWith('--source=')) args.source = raw.split('=')[1] || '';
    else if (raw.startsWith('--usage=')) args.usage = Number(raw.split('=')[1]);
    else if (raw.startsWith('--next=')) args.next = raw.split('=')[1] || '';
  });

  return args;
}

function safeExec(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

function estimateUsage(args) {
  if (Number.isFinite(args.usage) && args.usage >= 0) {
    return Math.min(100, Math.max(0, args.usage));
  }

  if (!args.source) return Number.NaN;
  const sourcePath = path.isAbsolute(args.source) ? args.source : path.join(cwd, args.source);
  if (!fs.existsSync(sourcePath)) return Number.NaN;

  const text = fs.readFileSync(sourcePath, 'utf8');
  const pct = (text.length / Math.max(1, args.maxChars)) * 100;
  return Math.min(100, Math.max(0, pct));
}

function formatListBlock(items, fallback) {
  if (!items.length) return `- ${fallback}`;
  return items.map((item) => `- ${item}`).join('\n');
}

function buildHandoffMarkdown({ args, usage, statusShort, stagedShort, lastCommits }) {
  const now = new Date();
  const timestamp = now.toISOString();
  const prompt = `Continuemos desde \`${args.output}\`. Retoma ${args.phase} y ejecuta el siguiente bloque con QA antes de avanzar.`;
  const nextLine = args.next || 'Continuar con el siguiente bloque pendiente del plan.';

  return [
    '# Handoff automatico de sesion',
    '',
    `Generado automaticamente: ${timestamp}`,
    `Uso de contexto estimado: ${Number(usage).toFixed(2)}% (umbral ${args.threshold}%)`,
    '',
    '## Estado rapido',
    `- Proyecto: \`${cwd}\``,
    `- Fase: **${args.phase}**`,
    `- Proximo paso recomendado: ${nextLine}`,
    '',
    '## Cambios en git (working tree)',
    formatListBlock(statusShort, 'Sin cambios detectados por git status --short'),
    '',
    '## Cambios staged',
    formatListBlock(stagedShort, 'Sin cambios staged actualmente'),
    '',
    '## Ultimos commits',
    formatListBlock(lastCommits, 'Sin historial disponible'),
    '',
    '## Prompt de continuidad',
    '```text',
    prompt,
    '```',
    '',
    '## Notas',
    '- Este archivo se genera cuando el uso estimado supera el umbral.',
    '- Si deseas forzar la generacion en cualquier momento, usa --force.'
  ].join('\n');
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  const usage = estimateUsage(args);

  if (!Number.isFinite(usage) && !args.force) {
    process.stdout.write('[handoff:auto] No se pudo estimar uso. Usa --usage=NN o --source=archivo y --max-chars=NN.\n');
    process.exit(2);
  }

  if (!args.force && usage < args.threshold) {
    process.stdout.write(`[handoff:auto] Uso ${usage.toFixed(2)}% < umbral ${args.threshold}%. No se genera handoff.\n`);
    process.exit(0);
  }

  const statusShortRaw = safeExec('git status --short');
  const stagedShortRaw = safeExec('git diff --cached --name-only');
  const lastCommitsRaw = safeExec('git log -5 --pretty=format:%h%x20%s');

  const statusShort = statusShortRaw ? statusShortRaw.split(/\r?\n/).filter(Boolean) : [];
  const stagedShort = stagedShortRaw ? stagedShortRaw.split(/\r?\n/).filter(Boolean) : [];
  const lastCommits = lastCommitsRaw ? lastCommitsRaw.split(/\r?\n/).filter(Boolean) : [];

  const markdown = buildHandoffMarkdown({ args, usage: Number.isFinite(usage) ? usage : 0, statusShort, stagedShort, lastCommits });
  const outputPath = path.isAbsolute(args.output) ? args.output : path.join(cwd, args.output);
  fs.writeFileSync(outputPath, markdown, 'utf8');

  process.stdout.write(`[handoff:auto] Archivo generado: ${outputPath}\n`);
  process.stdout.write(`[handoff:auto] Prompt: Continuemos desde ${args.output}\n`);
}

run();
