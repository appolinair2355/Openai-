const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// 🔍 DIAGNOSTIC : Vérifier les fichiers au démarrage
console.log('📁 Vérification des fichiers dans le répertoire de déploiement...');
const deployDir = __dirname;
console.log('📍 Répertoire de déploiement:', deployDir);

const requiredFiles = ['index.html', 'client.js', 'server.js', 'package.json'];
requiredFiles.forEach(file => {
    const filePath = path.join(deployDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} trouvé`);
    } else {
        console.error(`❌ ${file} MANQUANT !`);
    }
});

// Configuration OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(deployDir)); // Utiliser le répertoire absolu

// Route principale - VERSION ROBUSTE
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    console.log('📄 Tentative d\'envoi de:', indexPath);
    
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        console.error('❌ index.html introuvable!');
        res.status(500).send(`
            <h1>❌ Erreur de déploiement</h1>
            <p>index.html non trouvé dans ${__dirname}</p>
            <p>Fichiers présents: ${fs.readdirSync(__dirname).join(', ')}</p>
        `);
    }
});

// Endpoint pour poser des questions
app.post('/api/ask', async (req, res) => {
    const question = req.body.question;
    
    if (!question || question.trim() === '') {
        return res.status(400).json({ error: '❌ La question ne peut pas être vide' });
    }

    console.log(`📥 Question reçue: "${question.substring(0, 50)}..."`);

    try {
        console.log('🔄 Envoi de la requête à OpenAI...');
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Vous êtes un assistant utile et intelligent qui répond en français de manière claire et détaillée."
                },
                { role: "user", content: question }
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        const answer = completion.choices[0].message.content;
        console.log('✅ Réponse reçue et envoyée au client');
        res.json({ answer });

    } catch (error) {
        console.error('❌ Erreur OpenAI:', error.message);
        
        if (error.code === 'insufficient_quota') {
            res.status(429).json({ error: '💰 Quota OpenAI dépassé' });
        } else if (error.code === 'invalid_api_key') {
            res.status(401).json({ error: '🔑 Clé API invalide' });
        } else {
            res.status(500).json({ error: '⛔ Erreur serveur' });
        }
    }
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🌐 Serveur démarré sur le port ${PORT}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
});

// Tester la connexion OpenAI
async function testOpenAI() {
    try {
        console.log('🧪 Test de connexion OpenAI...');
        await openai.models.list();
        console.log('✅ OPENAI CONNECTÉ ET FONCTIONNEL!');
    } catch (error) {
        console.error('❌ Erreur de connexion OpenAI:', error.message);
    }
}
testOpenAI();

