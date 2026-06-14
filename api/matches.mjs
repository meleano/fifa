const OF_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const FLAGS = {
  'Mexico':'🇲🇽','South Africa':'🇿🇦','South Korea':'🇰🇷','Czech Republic':'🇨🇿',
  'Canada':'🇨🇦','Bosnia & Herzegovina':'🇧🇦','Qatar':'🇶🇦','Switzerland':'🇨🇭',
  'Brazil':'🇧🇷','Morocco':'🇲🇦','Haiti':'🇭🇹','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'USA':'🇺🇸','Paraguay':'🇵🇾','Australia':'🇦🇺','Turkey':'🇹🇷',
  'Germany':'🇩🇪','Curaçao':'🇨🇼','Ivory Coast':'🇨🇮','Ecuador':'🇪🇨',
  'Netherlands':'🇳🇱','Japan':'🇯🇵','Sweden':'🇸🇪','Tunisia':'🇹🇳',
  'Belgium':'🇧🇪','Egypt':'🇪🇬','Iran':'🇮🇷','New Zealand':'🇳🇿',
  'Spain':'🇪🇸','Cape Verde':'🇨🇻','Saudi Arabia':'🇸🇦','Uruguay':'🇺🇾',
  'France':'🇫🇷','Senegal':'🇸🇳','Iraq':'🇮🇶','Norway':'🇳🇴',
  'Argentina':'🇦🇷','Algeria':'🇩🇿','Austria':'🇦🇹','Jordan':'🇯🇴',
  'Portugal':'🇵🇹','DR Congo':'🇨🇩','Uzbekistan':'🇺🇿','Colombia':'🇨🇴',
  'England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Croatia':'🇭🇷','Ghana':'🇬🇭','Panama':'🇵🇦',
};

const ROUND_MAP = {
  'Matchday 1':'group','Matchday 2':'group','Matchday 3':'group',
  'Matchday 4':'group','Matchday 5':'group','Matchday 6':'group',
  'Matchday 7':'group','Matchday 8':'group','Matchday 9':'group',
  'Matchday 10':'group','Matchday 11':'group','Matchday 12':'group',
  'Matchday 13':'group','Matchday 14':'group','Matchday 15':'group',
  'Matchday 16':'group','Matchday 17':'group',
  'Round of 32':'r32','Round of 16':'r16',
  'Quarter-final':'qf','Semi-final':'sf',
  'Match for third place':'3rd','Final':'final',
};

function flag(name) {
  return FLAGS[name] || '🏳️';
}

function parseScore(s) {
  if (!s || !s.ft || s.ft.length < 2) return null;
  return [s.ft[0], s.ft[1]];
}

function parseDate(date, time) {
  if (!date) return null;
  let t = '19:00:00Z';
  if (time) {
    const parts = time.split(' ');
    if (parts.length > 0) t = parts[0] + ':00Z';
  }
  try {
    return new Date(date + 'T' + t).toISOString();
  } catch { return null; }
}

function groupLetter(g) {
  if (!g) return '?';
  const m = g.match(/Group\s+(\w)/);
  return m ? m[1] : '?';
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const res = await fetch(OF_URL, {
      headers: { 'User-Agent': 'FIFA2026-MediaCenter/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    const raw = await res.json();
    const matches = raw.matches || [];

    let counter = 0;
    const teamGroup = {};

    const transformed = matches.map(m => {
      counter++;
      const group = groupLetter(m.group);
      const round = ROUND_MAP[m.round] || 'group';

      if (group !== '?' && round === 'group') {
        if (!teamGroup[m.team1]) teamGroup[m.team1] = group;
        if (!teamGroup[m.team2]) teamGroup[m.team2] = group;
      }

      const score = parseScore(m.score);
      const played = score !== null;

      return {
        id: 'M' + counter,
        group,
        round,
        home: m.team1,
        away: m.team2,
        hf: flag(m.team1),
        af: flag(m.team2),
        date: parseDate(m.date, m.time),
        venue: m.ground || m.location || 'Por definir',
        played,
        homeScore: played ? score[0] : null,
        awayScore: played ? score[1] : null,
      };
    });

    const groups = {};
    const groupNames = 'ABCDEFGHIJKL';
    for (const g of groupNames) {
      const teams = Object.entries(teamGroup)
        .filter(([, grp]) => grp === g)
        .map(([name]) => ({ n: name, f: flag(name) }));
      if (teams.length) groups[g] = { teams };
    }

    const activeGroupNames = Object.keys(groups);

    return new Response(JSON.stringify({
      groups,
      groupNames: activeGroupNames,
      matches: transformed,
      results: transformed.filter(m => m.played),
      updated: new Date().toISOString(),
      source: 'openfootball',
    }), {
      status: 200,
      headers: {
        ...CORS,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
}
