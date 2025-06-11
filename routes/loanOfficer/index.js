// routes/index.js
const express = require('express');
const router  = express.Router();
const auctions = require('../public/js/auctions');


// Pour lire les formulaires POST
router.use(express.urlencoded({ extended: true }));

/* ---------- Auth ---------- */
// page de connexion
router.get('/login', (req, res) => {
  res.render('pages/login', {
    title: 'Connexion',
    stylesheet: 'login.css',
    showSidebar: false
  });
});

// traitement du formulaire de login (dummy pour l’instant)
router.post('/login', (req, res) => {
  // TODO : vérifier le code d’accès côté serveur
  res.redirect('/dashboard');
});

/* ---------- Dashboard & sous-pages ---------- */
// Tableau de bord
router.get('/dashboard', (req, res) => {
  res.render('pages/dashboard', {
    title: 'Tableau de bord',
    stylesheet: 'dashboard.css',
    showSidebar: true
  });
});

// Mes enchères
router.get('/dashboard/my-auctions', (req, res) => {
  res.render('pages/my-auctions', {
    title: 'Mes enchères',
    stylesheet: 'my-auctions.css',
    showSidebar: true,
    auctions
  });
});

router.get('/dashboard/my-auctions/:id', (req, res) => {
  const auction = auctions.find(a => a.id == req.params.id);
  if (!auction) return res.status(404).send('Not found');
  res.render('pages/auction-detail', {
    title: 'Détail enchère',
    stylesheet: 'my-auctions.css',
    showSidebar: true,
    auction
  });
});

router.get('/dashboard/my-auctions/:id/edit', (req, res) => {
  const auction = auctions.find(a => a.id == req.params.id);
  if (!auction) return res.status(404).send('Not found');
  res.render('pages/auction-edit', {
    title: 'Modifier enchère',
    stylesheet: 'my-auctions.css',
    showSidebar: true,
    auction
  });
});

router.post('/dashboard/my-auctions/:id/edit', (req, res) => {
  const auction = auctions.find(a => a.id == req.params.id);
  if (!auction) return res.status(404).send('Not found');
  auction.yourRate = parseFloat(req.body.yourRate) || auction.yourRate;
  auction.fees = parseFloat(req.body.fees) || auction.fees;
  auction.insurance = parseFloat(req.body.insurance) || auction.insurance;
  res.redirect('/dashboard/my-auctions/' + auction.id);
});

// Recherche de prêts
router.get('/dashboard/search', (req, res) => {
  res.render('pages/search', {
    title: 'Recherche prêts',
    stylesheet: 'search.css',
    script: 'search.js',
    showSidebar: true
  });
});

// Rachat de prêts
router.get('/dashboard/refinance', (req, res) => {
  res.render('pages/refinance', {
    title: 'Rachat de prêts',
    stylesheet: 'refinance.css',
    script: 'refinance.js',
    showSidebar: true
  });
});

// Mon compte
router.get('/dashboard/account', (req, res) => {
  res.render('pages/account', {
    title: 'Mon compte',
    stylesheet: 'account.css',
    showSidebar: true
  });
});

// Paramètres
router.get('/dashboard/settings', (req, res) => {
  res.render('pages/settings', {
    title: 'Paramètres',
    stylesheet: 'settings.css',
    showSidebar: true
  });
});

module.exports = router;