const express = require('express');
const cors = require('cors');
const { getMotAleatoire } = require('./utils/motService');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = require('./db');
const bcrypt = require('bcrypt'); // aussi, installe bcrypt si ce n'est pas fait

// Importer les routes auth
const authRoutes = require('./routes/auth');

// Utiliser les routes auth sous le préfixe /auth
app.use('/auth', authRoutes);


// Mot secret temporaire
let motSecret = '';

// Endpoint pour obtenir un mot aléatoire
app.get('/mot', async (req, res) => {
  try {
    motSecret = await getMotAleatoire();
    console.log('Mot généré:', motSecret);
    res.json({ mot: motSecret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la génération du mot.' });
  }
});

// Endpoint pour vérifier la proposition
app.post('/verifier', (req, res) => {
  const proposition = req.body.proposition.toUpperCase();
  const resultat = [];

  for (let i = 0; i < proposition.length; i++) {
    const lettre = proposition[i];
    if (motSecret[i] === lettre) {
      resultat.push({ lettre, etat: 'correct' });
    } else if (motSecret.includes(lettre)) {
      resultat.push({ lettre, etat: 'existe' });
    } else {
      resultat.push({ lettre, etat: 'absent' });
    }
  }

  res.json({ resultat });
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); 
    res.json({ message: 'الاتصال بقاعدة البيانات ناجح', time: result.rows[0].now });
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
    res.status(500).json({ error: 'حدث خطأ في الاتصال بقاعدة البيانات' });
  }
});

app.get('/jeu/:difficulty', async (req, res) => {
  const difficulty = req.params.difficulty.toLowerCase();
  const validDifficulties = ['facile', 'intermediaire', 'difficile'];

  if (!validDifficulties.includes(difficulty)) {
    return res.status(400).json({ error: 'Difficulté invalide' });
  }

  try {
    const mot = await getMotAleatoire(difficulty);
    res.json({ mot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});
