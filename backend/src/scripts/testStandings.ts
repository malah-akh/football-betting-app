import axios from 'axios';
import 'dotenv/config';

async function main() {
  const client = axios.create({
    baseURL: 'https://v3.football.api-sports.io',
    headers: { 'x-apisports-key': process.env.SPORTS_API_KEY }
  });

  // Try Premier League directly - we know the season format
  console.log('Testing Premier League (39) with season 2025...');
  const standingsRes = await client.get('/standings', { params: { league: 39, season: 2025 } });

  if (standingsRes.data?.response?.[0]?.league?.standings) {
    const standings = standingsRes.data.response[0].league.standings.flat();
    console.log(`Found ${standings.length} teams`);
    for (const s of standings.slice(0, 5)) {
      console.log(`- ${s.team.name} (ID: ${s.team.id}): Form = ${s.form || 'N/A'}`);
    }
  } else {
    console.log('No standings for 2025, trying 2024...');
    const standingsRes2 = await client.get('/standings', { params: { league: 39, season: 2024 } });
    if (standingsRes2.data?.response?.[0]?.league?.standings) {
      const standings = standingsRes2.data.response[0].league.standings.flat();
      console.log(`Found ${standings.length} teams with season 2024`);
      for (const s of standings.slice(0, 5)) {
        console.log(`- ${s.team.name}: Form = ${s.form || 'N/A'}`);
      }
    }
  }
}

main().catch(console.error);
