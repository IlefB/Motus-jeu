const axios = require('axios');

async function getMotAleatoire(difficulty) {
  let length;
  switch (difficulty) {
    case 'facile':
      length = 4;
      break;
    case 'intermediaire':
      length = 6;
      break;
    case 'difficile':
      length = 8;
      break;
    default:
      length = 6;
  }

  try {
    const response = await axios.get(`https://trouve-mot.fr/api/size/${length}`);
    console.log("Réponse brute de l'API :", response.data);

    if (response.data && response.data.length > 0 && response.data[0].name) {
      return response.data[0].name.toUpperCase();
    } else {
      throw new Error("Mot non trouvé dans la réponse API");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du mot :", error.message);
    return null;
  }
}

module.exports = { getMotAleatoire };
