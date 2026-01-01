const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Configuration OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Vérification de la clé API au démarrage
console.log('🚀 Démarrage du serveur...');
console.log('🔑 Vérification de la clé OpenAI...');

if (!process.env.OPENAI_API_KEY) {
    console.error('❌ ERREUR: La clé API OpenAI n\'est pas configurée!');
    console.error('💡 Veuillez définir la variable d\'environnement OPENAI_API_KEY');
    process.exit(1);
}

// Tester la connexion à OpenAI
async function testOpenAIConnection() {
    try {
        console.log('🌐 Test de la connexion à l\'API OpenAI...');
        const response = await openai.models.list();
        console.log('✅ Connexion à OpenAI réussie!');
        console.log(`📊 ${response.data.length} modèles disponibles`);
        console.log('🎯 Le serveur est prêt à répondre aux questions!');
    } catch (error) {
        console.error('❌ Erreur de connexion à OpenAI:', error.message);
        if (error.code === 'invalid_api_key') {
            console.error('🔑 Clé API invalide! Vérifiez votre configuration.');
        }
        process.exit(1);
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Endpoint pour poser des questions
app.post('/api/ask', async (req, res) => {
    const question = req.body.question;
    
    if (!question || question.trim() === '') {
        return res.status(400).json({ 
            error: '❌ La question ne peut pas être vide' 
        });
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
                {
                    role: "user",
                    content: question
                }
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        const answer = completion.choices[0].message.content;
        console.log('✅ Réponse reçue d\'OpenAI');
        console.log(`📤 Envoi de la réponse: "${answer.substring(0, 50)}..."`);

        res.json({ answer });

    } catch (error) {
        console.error('❌ Erreur lors de l\'appel à OpenAI:', error.message);
        
        if (error.code === 'insufficient_quota') {
            return res.status(429).json({ 
                error: '💰 Quota dépassé. Vérifiez votre solde OpenAI.' 
            });
        } else if (error.code === 'invalid_api_key') {
            return res.status(401).json({ 
                error: '🔑 Clé API invalide.' 
            });
        }
        
        res.status(500).json({ 
            error: '⛔ Une erreur s\'est produite. Veuillez réessayer.' 
        });
    }
});

// Démarrage du serveur
app.listen(PORT, async () => {
    console.log(`🌐 Serveur démarré sur le port ${PORT}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    await testOpenAIConnection();
});
                       
