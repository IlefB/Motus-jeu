const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db'); // adapte le chemin selon ta structure
const { getMotAleatoire } = require('../utils/motService');

const router = express.Router();

// ROUTE : Inscription d'un utilisateur
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );
    res.status(201).json({ message: "Utilisateur inscrit avec succès", user: result.rows[0] });
  } catch (err) {
    console.error('Erreur lors de l’inscription :', err);
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});

// ROUTE : Connexion d'un utilisateur
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    res.status(200).json({
      message: 'Connexion réussie !',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        score: user.score
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ROUTE : Ajouter des points au score actuel
router.post('/add-score', async (req, res) => {
  const { userId, points } = req.body;

  try {
    const userResult = await pool.query('SELECT score FROM users WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const currentScore = userResult.rows[0].score || 0;
    const newScore = currentScore + points;

    await pool.query('UPDATE users SET score = $1 WHERE id = $2', [newScore, userId]);

    res.status(200).json({ message: 'Score mis à jour.', newScore });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du score :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ✅ ROUTE : Mise à jour directe du score d’un utilisateur
router.put('/users/:id/score', async (req, res) => {
  console.log("req", req.params);
  const userId = req.params.id;
  console.log("userid", userId);

  const { score } = req.body;

  if (typeof score !== 'number') {
    return res.status(400).json({ message: 'Le score doit être un nombre.' });
  }

  try {
    const result = await pool.query('UPDATE users SET score = $1 WHERE id = $2 RETURNING *', [score, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.status(200).json({ message: 'Score mis à jour avec succès.', user: result.rows[0] });
  } catch (error) {
    console.error('Erreur lors de la mise à jour directe du score :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ✅ ROUTE : Classement des 3 meilleurs utilisateurs
router.get('/users/classement', async (req, res) => {
  try {
    const result = await pool.query('SELECT username AS nom, score FROM users ORDER BY score DESC LIMIT 3');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération du classement :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
