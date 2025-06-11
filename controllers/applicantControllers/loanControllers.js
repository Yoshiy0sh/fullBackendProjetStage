//models import
const Applicant = require('../../models/applicant')
const Loan = require('../../models/loan')

//utils import
const { generateCsrfToken } = require('../../utils/csrf')

function renderLoanIndex(req, res) {
    res.locals.csrfToken = generateCsrfToken(req);
    res.locals.firstNameLoan = req.session.firstName;
    res.locals.lastNameLoan = req.session.lastName;
    res.render('applicant/demande');
}

async function handleLoanSubmission(req, res) {
    try {
        console.log(req.body)
        console.log(req.files)
        //filling all fields of the new loan and applicant
        const applicantId = await completeApplicantFields(req)
        const loanNumber = await createLoan(req, applicantId)
        //sending response to ajax request
        res.json({
            dossierNumber: loanNumber,
            submissionDate: new Date().toLocaleDateString("fr-FR")
        })
    } catch (error) {
        console.error(error)
        res.status(500).send('Server error')
    }
}

//fill all fields in an applicant document from request body and files
async function completeApplicantFields(req) {
    try {
        //files are individually stored from the request
        const identityCard = req.files.find(file => file.fieldname === 'pieceIdentite')

        //The applicant was created in the registration process, so we find it by userId
        //then we update it with the new data
        const applicant = await Applicant.findOneAndUpdate(
            { user: req.session.userId },
            {
                personalInfo: {
                    lastName: req.body.lastNameLoan,
                    firstName: req.body.firstNameLoan,
                    dateOfBirth: req.body.dateDeNaissance,
                    placeOfBirth: req.body.placeOfBirth,
                    maritalStatus: req.body.maritalStatus,
                    unionDate: req.body.unionDate,
                    numberOfChildren: req.body.numberOfChildren,
                },
                contact: {
                    address: req.body.address,
                    postalCode: req.body.postalCode,
                    city: req.body.city,
                    email: req.body.email,
                    phone: req.body.phone,
                },
                housing: {
                    housingSituation: req.body.housingSituation,
                    rent: req.body.rent,
                    cpsCharges: req.body.cpsCharges,
                },
                employment: {
                    professionalStatus: req.body.professionalStatus,
                    percentage: req.body.percentage,
                    contractStartDates: req.body.contractStartDate,
                    contractEndDate: req.body.contractEndDate,
                    companyNames: req.body.companyName,
                    companyAddresses: req.body.companyAddress,
                    taxResidence: req.body.taxResidence,
                    country: req.body.country,
                },
                income: {
                    netSalary: req.body.netSalary,
                    netTaxableIncome: req.body.netTaxableIncome,
                    referenceTaxIncome: req.body.referenceTaxIncome,
                    businessProfits: req.body.businessProfits,
                    bonuses: req.body.bonuses,
                    financialIncome: req.body.financialIncome,
                    dividends: req.body.dividendes,
                    realEstateIncome: req.body.revenusImmobiliersLoan,
                    familyAllowances: req.body.allocationsFamilialesLoan,
                    receivedAlimony: req.body.pensionAlimentaireLoan,
                },
                expenses: {
                    consumerLoanPayments: req.body.chargesCreditsConsommationLoan,
                    mortgagePayments: req.body.chargesCreditsImmobiliersLoan,
                    familyLoans: req.body.pretsFamiliauxLoan,
                    paidAlimony: req.body.pensionAlimentaireVerseeLoan,
                    incomeTax: req.body.impotRevenuLoan,
                },
                identityCard: identityCard ? {
                    data: identityCard.buffer,
                    contentType: identityCard.mimetype
                } : undefined
            },
            { new: true, upsert: true }
        )
        if (!applicant) {
            console.error('Applicant not found or could not be created')
            return null
        } else {
            return applicant._id
        }
    } catch (error) {
        console.error('Error in completeApplicantFields:', error)
        return null
    }
}

async function createLoan(req, applicantId) {
    try {
        const loan = await Loan.create({
            applicant: applicantId,
            projectType: req.body.typeProjet,
            projectAmount: req.body.montantProjet,
            personalContribution: req.body.apportPersonnel,
            borrowedAmount: req.body.montantEmprunte,
            loanDuration: req.body.dureeEmprunt,
            amortizationType: req.body.typeAmortissement,
            borrowerInsurance: req.body.assuranceEmprunteur,
            state: 'pending'
        })
        
        console.log('type projet:', req.body.typeProjet)
        return loan.loanNumber
    } catch (error) {
        console.error(error)
        return null
    }
}

module.exports = {
    renderLoanIndex,
    handleLoanSubmission
};