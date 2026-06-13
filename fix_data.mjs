import fs from 'fs';

const path = 'E:\\FIFA\\index.html';

// Read current file
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Part 1: lines 1-565 (header, CSS, streams, proxy)
const part1 = lines.slice(0, 565).join('\n');

// Part 2: STATE section (from line 632) to end
const part2 = lines.slice(631).join('\n');

// Helper: regional indicator symbols
function flag(a, b) {
  return String.fromCodePoint(0x1F1E6 - 65 + a.charCodeAt(0)) +
         String.fromCodePoint(0x1F1E6 - 65 + b.charCodeAt(0));
}

// Subdivision flags for UK nations
const england = String.fromCodePoint(0x1F3F4, 0xE0067, 0xE0062, 0xE0065, 0xE006E, 0xE0067, 0xE007F);
const scotland = String.fromCodePoint(0x1F3F4, 0xE0067, 0xE0062, 0xE0073, 0xE0063, 0xE0074, 0xE007F);
const wales = String.fromCodePoint(0x1F3F4, 0xE0067, 0xE0062, 0xE0077, 0xE006C, 0xE0073, 0xE007F);

const F = flag;

const lines2 = [];
lines2.push('');
lines2.push('// ============================================================');
lines2.push('// DATOS REALES — Copa Mundial FIFA 2026');
lines2.push('// Fuente: https://fifa-world-cup-live-stream.vercel.app');
lines2.push('// ============================================================');
lines2.push('');
lines2.push("const GROUP_NAMES = ['A','B','C','D','E','F','G','H','I','J','K','L'];");
lines2.push('');
lines2.push('const GROUPS = {');
lines2.push(`  A:{teams:[{n:'México',f:'${F('M','X')}'},{n:'Sudáfrica',f:'${F('Z','A')}'},{n:'Corea del Sur',f:'${F('K','R')}'},{n:'República Checa',f:'${F('C','Z')}'}]},`);
lines2.push(`  B:{teams:[{n:'Canadá',f:'${F('C','A')}'},{n:'Bosnia y Herz.',f:'${F('B','A')}'},{n:'Catar',f:'${F('Q','A')}'},{n:'Suiza',f:'${F('C','H')}'}]},`);
lines2.push(`  C:{teams:[{n:'Brasil',f:'${F('B','R')}'},{n:'Marruecos',f:'${F('M','A')}'},{n:'Bélgica',f:'${F('B','E')}'},{n:'Perú',f:'${F('P','E')}'}]},`);
lines2.push(`  D:{teams:[{n:'Estados Unidos',f:'${F('U','S')}'},{n:'Paraguay',f:'${F('P','Y')}'},{n:'Croacia',f:'${F('H','R')}'},{n:'Ghana',f:'${F('G','H')}'}]},`);
lines2.push(`  E:{teams:[{n:'Argentina',f:'${F('A','R')}'},{n:'Suecia',f:'${F('S','E')}'},{n:'Uruguay',f:'${F('U','Y')}'},{n:'Escocia',f:'${scotland}'}]},`);
lines2.push(`  F:{teams:[{n:'Francia',f:'${F('F','R')}'},{n:'Australia',f:'${F('A','U')}'},{n:'Dinamarca',f:'${F('D','K')}'},{n:'Argelia',f:'${F('D','Z')}'}]},`);
lines2.push(`  G:{teams:[{n:'Alemania',f:'${F('D','E')}'},{n:'Japón',f:'${F('J','P')}'},{n:'Colombia',f:'${F('C','O')}'},{n:'Irán',f:'${F('I','R')}'}]},`);
lines2.push(`  H:{teams:[{n:'España',f:'${F('E','S')}'},{n:'Camerún',f:'${F('C','M')}'},{n:'Senegal',f:'${F('S','N')}'},{n:'Austria',f:'${F('A','T')}'}]},`);
lines2.push(`  I:{teams:[{n:'Inglaterra',f:'${england}'},{n:'Ecuador',f:'${F('E','C')}'},{n:'Gales',f:'${wales}'},{n:'Costa de Marfil',f:'${F('C','I')}'}]},`);
lines2.push(`  J:{teams:[{n:'Italia',f:'${F('I','T')}'},{n:'Arabia Saudita',f:'${F('S','A')}'},{n:'Ucrania',f:'${F('U','A')}'},{n:'Grecia',f:'${F('G','R')}'}]},`);
lines2.push(`  K:{teams:[{n:'Portugal',f:'${F('P','T')}'},{n:'Angola',f:'${F('A','O')}'},{n:'Corea del Norte',f:'${F('K','P')}'},{n:'Nigeria',f:'${F('N','G')}'}]},`);
lines2.push(`  L:{teams:[{n:'Países Bajos',f:'${F('N','L')}'},{n:'Túnez',f:'${F('T','N')}'},{n:'Chile',f:'${F('C','L')}'},{n:'Nueva Zelanda',f:'${F('N','Z')}'}]}`);
lines2.push('};');
lines2.push('');
lines2.push('// Partidos reales');
lines2.push('function match(id, group, round, home, away, hf, af, date, venue, played, hs, as) {');
lines2.push('  return { id, group, round, home, away, hf, af, date: new Date(date).toISOString(), venue, played,');
lines2.push('    homeScore: played ? hs : null, awayScore: played ? as : null };');
lines2.push('}');
lines2.push('');
lines2.push('const allMatches = [];');
lines2.push('const matchResults = [];');
lines2.push('');
lines2.push('// --- RESULTADOS (partidos ya jugados) ---');
lines2.push(`allMatches.push(match('A1','A','group','México','Sudáfrica','${F('M','X')}','${F('Z','A')}','2026-06-11T19:00:00Z','Estadio Azteca · 80,824',true,2,0));`);
lines2.push(`allMatches.push(match('A2','A','group','Corea del Sur','República Checa','${F('K','R')}','${F('C','Z')}','2026-06-12T02:00:00Z','Estadio Chivas · 44,985',true,2,1));`);
lines2.push(`allMatches.push(match('B1','B','group','Canadá','Bosnia y Herz.','${F('C','A')}','${F('B','A')}','2026-06-12T19:00:00Z','BMO Field · 43,002',true,1,1));`);
lines2.push(`allMatches.push(match('D1','D','group','Estados Unidos','Paraguay','${F('U','S')}','${F('P','Y')}','2026-06-13T01:00:00Z','SoFi Stadium · 70,492',true,4,1));`);
lines2.push('');
lines2.push('// --- PRÓXIMOS PARTIDOS ---');
lines2.push(`allMatches.push(match('B2','B','group','Catar','Suiza','${F('Q','A')}','${F('C','H')}','2026-06-13T19:00:00Z','',false));`);
lines2.push(`allMatches.push(match('C1','C','group','Brasil','Marruecos','${F('B','R')}','${F('M','A')}','2026-06-13T22:00:00Z','',false));`);
lines2.push(`allMatches.push(match('E1','E','group','Argentina','Suecia','${F('A','R')}','${F('S','E')}','2026-06-14T15:00:00Z','',false));`);
lines2.push(`allMatches.push(match('F1','F','group','Francia','Australia','${F('F','R')}','${F('A','U')}','2026-06-14T18:00:00Z','',false));`);
lines2.push(`allMatches.push(match('G1','G','group','Alemania','Japón','${F('D','E')}','${F('J','P')}','2026-06-15T19:00:00Z','',false));`);
lines2.push(`allMatches.push(match('H1','H','group','España','Camerún','${F('E','S')}','${F('C','M')}','2026-06-15T22:00:00Z','',false));`);
lines2.push(`allMatches.push(match('I1','I','group','Inglaterra','Ecuador','${england}','${F('E','C')}','2026-06-16T15:00:00Z','',false));`);
lines2.push(`allMatches.push(match('J1','J','group','Italia','Arabia Saudita','${F('I','T')}','${F('S','A')}','2026-06-16T18:00:00Z','',false));`);
lines2.push(`allMatches.push(match('K1','K','group','Portugal','Angola','${F('P','T')}','${F('A','O')}','2026-06-17T19:00:00Z','',false));`);
lines2.push(`allMatches.push(match('L1','L','group','Países Bajos','Túnez','${F('N','L')}','${F('T','N')}','2026-06-17T22:00:00Z','',false));`);
lines2.push(`allMatches.push(match('C2','C','group','Bélgica','Perú','${F('B','E')}','${F('P','E')}','2026-06-18T16:00:00Z','',false));`);
lines2.push(`allMatches.push(match('D2','D','group','Croacia','Ghana','${F('H','R')}','${F('G','H')}','2026-06-18T19:00:00Z','',false));`);
lines2.push(`allMatches.push(match('E2','E','group','Uruguay','Escocia','${F('U','Y')}','${scotland}','2026-06-19T14:00:00Z','',false));`);
lines2.push(`allMatches.push(match('F2','F','group','Dinamarca','Argelia','${F('D','K')}','${F('D','Z')}','2026-06-19T20:00:00Z','',false));`);
lines2.push(`allMatches.push(match('G2','G','group','Colombia','Irán','${F('C','O')}','${F('I','R')}','2026-06-20T17:00:00Z','',false));`);
lines2.push(`allMatches.push(match('H2','H','group','Senegal','Austria','${F('S','N')}','${F('A','T')}','2026-06-20T21:00:00Z','',false));`);
lines2.push(`allMatches.push(match('C3','C','group','Marruecos','Bélgica','${F('M','A')}','${F('B','E')}','2026-06-21T15:00:00Z','',false));`);
lines2.push(`allMatches.push(match('D3','D','group','Paraguay','Croacia','${F('P','Y')}','${F('H','R')}','2026-06-21T19:00:00Z','',false));`);
lines2.push(`allMatches.push(match('E3','E','group','Suecia','Uruguay','${F('S','E')}','${F('U','Y')}','2026-06-22T18:00:00Z','',false));`);
lines2.push(`allMatches.push(match('F3','F','group','Australia','Dinamarca','${F('A','U')}','${F('D','K')}','2026-06-22T21:00:00Z','',false));`);
lines2.push(`allMatches.push(match('G3','G','group','Japón','Colombia','${F('J','P')}','${F('C','O')}','2026-06-23T16:00:00Z','',false));`);
lines2.push(`allMatches.push(match('H3','H','group','Camerún','Senegal','${F('C','M')}','${F('S','N')}','2026-06-23T20:00:00Z','',false));`);
lines2.push(`allMatches.push(match('I2','I','group','Ecuador','Gales','${F('E','C')}','${wales}','2026-06-24T17:00:00Z','',false));`);
lines2.push(`allMatches.push(match('J2','J','group','Arabia Saudita','Ucrania','${F('S','A')}','${F('U','A')}','2026-06-24T21:00:00Z','',false));`);
lines2.push(`allMatches.push(match('K2','K','group','Corea del Norte','Nigeria','${F('K','P')}','${F('N','G')}','2026-06-25T15:00:00Z','',false));`);
lines2.push(`allMatches.push(match('L2','L','group','Túnez','Chile','${F('T','N')}','${F('C','L')}','2026-06-25T19:00:00Z','',false));`);
lines2.push('');
lines2.push('// Construir resultados desde partidos jugados');
lines2.push('allMatches.forEach(m=>{ if(m.played) matchResults.push({...m}); });');

const newSection = lines2.join('\n');
const fullContent = part1 + '\n' + newSection + '\n' + part2;
fs.writeFileSync(path, fullContent, 'utf8');

console.log('OK: ' + fullContent.length + ' chars, ' + fullContent.split('\n').length + ' lines');

// Verify no "????" remain
if (fullContent.includes('????')) {
  console.log('ERROR: ???? still present');
  process.exit(1);
}
