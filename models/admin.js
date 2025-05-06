const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  raisonSociale: {
    type: String,
    required: true,
  },
  numeroSIREN: {
    type: number, //deviendra sans doute un string si il y a des lettres
    //comme dans un IBAN
    required: true,
  },
  extraitKbis: {
    data: Buffer,
    contentType: String,
    required: true,
  },
  adresseSiegeSocial: {
    type: String,
    required: true,
  },
  nomRepresentantLegal: {
    type: String,
    required: true,
  },
  prenomRepresentantLegal: {
    type: String,
    required: true,
  },
  justificatifIdentite: {
    data: Buffer,
    contentType: String,
    required: true,
  },
  numeroRCS: {
    type: Number
  },
  preuveAgrementACPR: {
    data: Buffer,
    contentType: String,
    required: true,
  },
  nomCommercial: {
    type: String,
  },
  codeAPE_NAF: {
    type: String,
  },
  identifiantSWIFT_BIC: {
    type: String,
  },
  rib_iban: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Admin', adminSchema);
