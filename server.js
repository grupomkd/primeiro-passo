const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();

app.use(cors());
app.use(express.json());

const SHEET_ID = '1OSy9zP1ErG3GqvR9oaxOdNeI0BPQ9ngLCx6P2vHgj8E';

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

app.post('/sync', async (req, res) => {
  try {
    const { cadastros, checkins, ranking } = req.body;
    const sheets = await getSheets();

    if (cadastros) {
      const rows = [['Timestamp','Nome completo','Telefone / WhatsApp','E-mail','Data de nascimento','Quem te indicou?','Como conheceu o Primeiro Passo?']];
      cadastros.forEach(c => rows.push([c.timestamp||'', c.nome||'', c.telefone||'', c.email||'', c.nascimento||'', c.indicadoPor||'', c.comoConheceu||'']));
      await sheets.spreadsheets.values.update({ spreadsheetId: SHEET_ID, range: 'Respostas Cadastro!A1', valueInputOption: 'RAW', requestBody: { values: rows } });
    }

    if (checkins) {
      const rows = [['Timestamp','Nome completo','Telefone']];
      checkins.forEach(c => rows.push([c.timestamp||'', c.nome||'', c.telefone||'']));
      await sheets.spreadsheets.values.update({ spreadsheetId: SHEET_ID, range: 'Respostas Check-in!A1', valueInputOption: 'RAW', requestBody: { values: rows } });
    }

    if (ranking) {
      const rows = [['Nome','Total de caminhadas','Ultima presenca','Status','Indicado por']];
      ranking.forEach(r => rows.push([r.nome||'', r.total||0, r.ultima||'', r.status||'', r.indicadoPor||'']));
      await sheets.spreadsheets.values.update({ spreadsheetId: SHEET_ID, range: 'Ranking!A1', valueInputOption: 'RAW', requestBody: { values: rows } });
    }

    res.json({ ok: true });
  } catch(e) {
    console.error(e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/ping', (req, res) => res.json({ ok: true }));

app.listen(3001, () => console.log('Backend rodando na porta 3001'));
