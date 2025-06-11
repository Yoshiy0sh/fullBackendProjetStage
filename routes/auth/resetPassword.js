const express = require('express')
const router = express.Router()

//utils import
const { generateCsrfToken } = require('../../utils/csrf')

router.route('/send-code')
    .get((req, res) => {
        res.locals.csrfToken = generateCsrfToken(req)
        res.render('auth/resetPassword/send-code')
    })
    .post((req,res) => {
        const { email } = req.body;
        // Génère un code aléatoire
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        // Stocke le code en session ou en base (ici en session pour l'exemple)
        req.session.resetCode = code;
        req.session.resetEmail = email;
        // Envoie le code par mail (à implémenter)
        // await sendMail(email, code);
        console.log(`Code envoyé à ${email} : ${code}`);
        res.json({ csrfToken : generateCsrfToken(req) });
    })

router.post('/verify-code', (req, res) => {
    const { code } = req.body;
    if (req.session.resetCode && code === req.session.resetCode) {
        // Code correct, autoriser la suite (ex: afficher formulaire de nouveau mot de passe)
        res.send('Code correct ! (à compléter)');
    } else {
        res.status(400).send('Code incorrect');
    }
});


module.exports = router