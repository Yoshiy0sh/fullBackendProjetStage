const mongoose = require('mongoose')

const applicantSchema = new mongoose.Schema({
        // Personal Information
        personalInfo: {
            lastName: { type: String },            // nom
            firstName: { type: String },           // prenom
            dateOfBirth: { type: Date },           // dateNaissance
            placeOfBirth: { type: String },        // lieuNaissance
            maritalStatus: { type: String },       // situationMatrimoniale
            unionDate: { type: String },           // dateUnion (string to allow empty)
            numberOfChildren: { type: Number },    // nombreEnfants
        },

        // Contact Details
        contact: {
            address: { type: String },             // adresse
            postalCode: { type: String },          // codePostal
            city: { type: String },                // commune
            email: { type: String },               // email
            phone: { type: String },               // telephone
        },

        // Housing
        housing: {
            housingSituation: { type: String },    // situationLogement
            rent: { type: Number },                // loyer
            cpsCharges: { type: Number },          // chargesCPS
        },

        // Employment
        employment: {
            professionalStatus: { type: String },  // situationProfessionnelle
            percentage: { type: String },          // pourcentage
            contractStartDates: { type: Date },    // dateDebutContrat
            contractEndDate: { type: String },     // dateFin
            companyNames: { type: String },        // nomEntreprise
            companyAddresses: { type: String },    // adresseEntreprise
            taxResidence: { type: String },        // residenceFiscale
            country: { type: String },             // pays
        },

        // Income
        income: {
            netSalary: { type: Number },           // salaireNet
            netTaxableIncome: { type: Number },    // revenuNetImposable
            referenceTaxIncome: { type: Number },  // rfr
            businessProfits: { type: String },     // benefices
            bonuses: { type: Number },             // primes
            financialIncome: { type: Number },     // revenusValeursMobilieres
            dividends: { type: Number },           // dividendes
            realEstateIncome: { type: Number },    // revenusImmobiliers
            familyAllowances: { type: Number },    // allocationsFamiliales
            receivedAlimony: { type: Number },     // pensionAlimentaire
        },

        // Expenses
        expenses: {
            consumerLoanPayments: { type: Number },     // chargesCreditsConsommation
            mortgagePayments: { type: Number },         // chargesCreditsImmobiliers
            familyLoans: { type: Number },              // pretsFamiliaux
            paidAlimony: { type: Number },              // pensionAlimentaireVersee
            incomeTax: { type: Number },                // impotRevenu
        },

        identityCard: {
            data: Buffer,
            contentType: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    },
        {
            timestamps: true
        }
    )

module.exports = mongoose.model('Applicant',applicantSchema)