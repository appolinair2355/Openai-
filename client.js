// Configuration
const API_URL = window.location.origin + '/api/ask';

// Éléments DOM
const questionInput = document.getElementById('question');
const searchBtn = document.getElementById('searchBtn');
const btnText = document.getElementById('btnText');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultSection = document.getElementById('resultSection');
const resultContent = document.getElementById('resultContent');
const typingIndicator = document.getElementById('typingIndicator');

// Gestionnaire d'événements pour Entrée
questionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        askQuestion();
    }
});

// Fonction principale
async function askQuestion() {
    const question = questionInput.value.trim();
    
    if (!question) {
        alert('⚠️ Veuillez entrer une question!');
        questionInput.focus();
        return;
    }

    // Désactiver le bouton
    searchBtn.disabled = true;
    btnText.textContent = '⏳ Traitement...';

    // Masquer les résultats précédents
    resultSection.style.display = 'none';
    
    // Afficher la barre de progression
    progressContainer.style.display = 'block';
    simulateProgress();

    // Afficher l'indicateur de frappe
    typingIndicator.style.display = 'block';

    try {
        console.log('📤 Envoi de la question au serveur...');
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de la requête');
        }

        // Afficher la réponse
        displayResult(data.answer);

    } catch (error) {
        console.error('❌ Erreur:', error);
        displayResult(`⛔ Erreur: ${error.message}\n\n💡 Vérifiez les logs du serveur pour plus de détails.`, true);
    } finally {
        // Réactiver le bouton
        searchBtn.disabled = false;
        btnText.textContent = '🚀 Envoyer la question';
        progressContainer.style.display = 'none';
        progressFill.style.width = '0%';
        typingIndicator.style.display = 'none';
    }
}

// Simulation de la barre de progression
function simulateProgress() {
    const steps = [
        { progress: 10, text: '📝 Analyse de la question...' },
        { progress: 30, text: '🌐 Connexion à OpenAI...' },
        { progress: 60, text: '🤖 Génération de la réponse...' },
        { progress: 90, text: '📤 Réception des données...' },
    ];

    let currentStep = 0;
    
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            progressFill.style.width = step.progress + '%';
            progressText.textContent = step.text;
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 800);
}

// Affichage du résultat avec animation
function displayResult(text, isError = false) {
    resultContent.textContent = text;
    
    if (isError) {
        resultContent.style.borderLeftColor = '#e74c3c';
        resultContent.style.background = '#fdf2f2';
    } else {
        resultContent.style.borderLeftColor = '#667eea';
        resultContent.style.background = '#f8f9fa';
    }

    resultSection.style.display = 'block';
    
    // Animation de fade in du texte
    resultContent.style.opacity = '0';
    setTimeout(() => {
        resultContent.style.transition = 'opacity 0.5s ease';
        resultContent.style.opacity = '1';
    }, 100);

    // Scroll automatique vers le résultat
    setTimeout(() => {
        resultSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 300);
}

// Auto-resize du textarea
questionInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.max(120, this.scrollHeight) + 'px';
});

// Focus au chargement
window.addEventListener('load', () => {
    questionInput.focus();
});
