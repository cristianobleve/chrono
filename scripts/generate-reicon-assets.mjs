import * as reicon from 'reicon';
import fs from 'fs';
import path from 'path';

const iconDefs = {
  book: { fn: reicon.Book, color: '#a1a1aa' },
  bot: { fn: reicon.Sparkle, color: '#a78bfa' },
  clock: { fn: reicon.Clock, color: '#f472b6' },
  code: { fn: reicon.Code, color: '#3b82f6' },
  command: { fn: reicon.Command, color: '#38bdf8' },
  cpu: { fn: reicon.Cpu, color: '#22d3ee' },
  database: { fn: reicon.Database, color: '#34d399' },
  globe: { fn: reicon.Globe, color: '#2dd4bf' },
  kanban: { fn: reicon.Kanban, color: '#818cf8' },
  layers: { fn: reicon.Layers, color: '#60a5fa' },
  milestone: { fn: reicon.Flag, color: '#c084fc' },
  server: { fn: reicon.Server, color: '#6366f1' },
  shield: { fn: reicon.ShieldCheck, color: '#34d399' },
  sliders: { fn: reicon.Slider, color: '#f59e0b' },
  target: { fn: reicon.Target, color: '#fbbf24' },
  terminal: { fn: reicon.BrowserTerminal, color: '#4ade80' }
};

for (const [name, { fn, color }] of Object.entries(iconDefs)) {
  let svg = fn.toSvg({ size: 20, color });
  svg = svg.replaceAll('fill="currentColor"', `fill="${color}"`);
  svg = svg.replaceAll('stroke="currentColor"', `stroke="${color}"`);
  const filePath = path.join('assets', 'icons', `${name}.svg`);
  fs.writeFileSync(filePath, svg, 'utf-8');
  console.log(`Generated ${filePath}`);
}
