document.addEventListener("DOMContentLoaded", () => {
  let currentStep = 1
  const totalSteps = 12
  const demandeData = {}
  const uploadedFiles = {}
  const extractedData = {}

  // Elements
  const stepContents = document.querySelectorAll(".step-content")
  const stepItems = document.querySelectorAll(".step-item")

  // Initialize
  showStep(currentStep)

  function showStep(stepNumber) {
    // Hide all step contents
    stepContents.forEach((content) => content.classList.remove("active"))

    // Show current step content
    const currentContent = document.getElementById(getStepId(stepNumber))
    if (currentContent) {
      currentContent.classList.add("active")
    }

    // Update sidebar
    updateSidebar(stepNumber)

    // Setup step-specific logic
    setupStepLogic(stepNumber)
  }

  function getStepId(stepNumber) {
    const stepIds = [
      "step-projet",
      "step-piece-identite",
      "step-justificatif-revenus",
      "step-releves-bancaires",
      "step-etat-civil",
      "step-situation-familiale",
      "step-activite-pro",
      "step-revenus",
      "step-charges",
      "step-financement",
      "step-documents-projet",
      "step-confirmation",
    ]
    return stepIds[stepNumber - 1]
  }

  function updateSidebar(currentStepNumber) {
    stepItems.forEach((item, index) => {
      item.classList.remove("active", "completed", "disabled")

      if (index < currentStepNumber - 1) {
        item.classList.add("completed")
        item.querySelector("i").className = "fas fa-check-circle"
      } else if (index === currentStepNumber - 1) {
        item.classList.add("active")
        item.querySelector("i").className = "fas fa-circle"
      } else {
        item.classList.add("disabled")
        item.querySelector("i").className = "fas fa-circle"
      }
    })
  }

  function setupStepLogic(stepNumber) {
    const currentContent = document.getElementById(getStepId(stepNumber))
    if (!currentContent) return

    const nextBtn = currentContent.querySelector("#nextBtn")
    const prevBtn = currentContent.querySelector("#prevBtn")

    // Setup previous button
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (currentStep > 1) {
          currentStep--
          showStep(currentStep)
        }
      }
    }

    // Setup step-specific logic
    switch (stepNumber) {
      case 1:
        setupProjectStep(currentContent, nextBtn)
        break
      case 2:
        setupPieceIdentiteStep(currentContent, nextBtn)
        break
      case 3:
        setupJustificatifRevenusStep(currentContent, nextBtn)
        break
      case 4:
        setupRelevesBancairesStep(currentContent, nextBtn)
        break
      case 5:
        setupEtatCivilStep(currentContent, nextBtn)
        break
      case 6:
        setupSituationFamilialeStep(currentContent, nextBtn)
        break
      case 7:
        setupActiviteProStep(currentContent, nextBtn)
        break
      case 8:
        setupRevenusStep(currentContent, nextBtn)
        break
      case 9:
        setupChargesStep(currentContent, nextBtn)
        break
      case 10:
        setupFinancementStep(currentContent, nextBtn)
        break
      case 11:
        setupDocumentsProjetStep(currentContent, nextBtn)
        break
      case 12:
        showConfirmation()
        break
    }
  }

  function setupProjectStep(content, nextBtn) {
    const optionCards = content.querySelectorAll(".option-card")

    optionCards.forEach((card) => {
      card.onclick = () => {
        optionCards.forEach((c) => c.classList.remove("selected"))
        card.classList.add("selected")
        demandeData.typeProjet = card.dataset.option
        nextBtn.disabled = false
      }
    })

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupPieceIdentiteStep(content, nextBtn) {
    const fileInput = content.querySelector("#piece-identite")
    fileInput.setAttribute("accept", ".pdf,.jpg,.jpeg,.png")
    const uploadZone = content.querySelector(".upload-zone")
    const uploadedFiles = content.querySelector(".uploaded-files")
    const extractionStatus = content.querySelector(".extraction-status")
    const extractionProgress = content.querySelector(".extraction-progress")
    const extractionSuccess = content.querySelector(".extraction-success")
    const extractionError = content.querySelector(".extraction-error")

    // Click to upload
    uploadZone.onclick = () => fileInput.click()

    // Drag and drop
    uploadZone.ondragover = (e) => {
      e.preventDefault()
      uploadZone.classList.add("drag-over")
    }

    uploadZone.ondragleave = () => {
      uploadZone.classList.remove("drag-over")
    }

    uploadZone.ondrop = (e) => {
      e.preventDefault()
      uploadZone.classList.remove("drag-over")
      handleFiles(e.dataTransfer.files)
    }

    fileInput.onchange = (e) => {
      handleFiles(e.target.files)
    }

    function handleFiles(files) {
      if (files.length === 0) return

      // Clear previous files
      uploadedFiles.innerHTML = ""

      Array.from(files).forEach((file) => {
        // Store the file
        demandeData.pieceIdentite = file

        // Display the file
        const fileElement = document.createElement("div")
        fileElement.className = "uploaded-file"
        if (file.type === "application/pdf" || file.type.startsWith("image/")) {
          // Déterminer l'icône appropriée
          const fileIcon = file.type === "application/pdf" ? "fa-file-pdf" : "fa-file-image"
          const fileColor = file.type === "application/pdf" ? "dc2626" : "2563eb"

          fileElement.innerHTML = `
          <div class="file-info">
            <i class="fas ${fileIcon}"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <div class="file-status">
            <i class="fas fa-check-circle success-icon"></i>
            <span>Téléchargé avec succès</span>
          </div>
          <button class="remove-file">
            <i class="fas fa-times"></i>
          </button>
        `
        }
        uploadedFiles.appendChild(fileElement)

        // Add remove button functionality
        const removeBtn = fileElement.querySelector(".remove-file")
        removeBtn.onclick = () => {
          fileElement.remove()
          demandeData.pieceIdentite = null
          nextBtn.disabled = true
          extractionStatus.style.display = "none"
        }

        // Show extraction status
        extractionStatus.style.display = "block"
        extractionProgress.style.display = "block"
        extractionSuccess.style.display = "none"
        extractionError.style.display = "none"

        // Simulate extraction (in a real app, this would be an API call)
        setTimeout(() => {
          extractionProgress.style.display = "none"

          // Simulate successful extraction
          extractionSuccess.style.display = "block"

          // Store extracted data (simulated)
          extractedData.etatCivil = {
            nom: "DUPONT",
            prenom: "Jean",
            dateNaissance: "1985-06-15",
            lieuNaissance: "Paris",
            adresse: "123 Rue de la Paix",
            codePostal: "75001",
            commune: "Paris",
          }

          nextBtn.disabled = false
        }, 2000)
      })
    }

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupJustificatifRevenusStep(content, nextBtn) {
    const fileInput = content.querySelector("#avis-imposition")
    fileInput.setAttribute("accept", ".pdf,.jpg,.jpeg,.png")
    const uploadZone = content.querySelector(".upload-zone")
    const uploadedFiles = content.querySelector(".uploaded-files")
    const extractionStatus = content.querySelector(".extraction-status")
    const extractionProgress = content.querySelector(".extraction-progress")
    const extractionSuccess = content.querySelector(".extraction-success")
    const extractionError = content.querySelector(".extraction-error")

    // Click to upload
    uploadZone.onclick = () => fileInput.click()

    // Drag and drop
    uploadZone.ondragover = (e) => {
      e.preventDefault()
      uploadZone.classList.add("drag-over")
    }

    uploadZone.ondragleave = () => {
      uploadZone.classList.remove("drag-over")
    }

    uploadZone.ondrop = (e) => {
      e.preventDefault()
      uploadZone.classList.remove("drag-over")
      handleFiles(e.dataTransfer.files)
    }

    fileInput.onchange = (e) => {
      handleFiles(e.target.files)
    }

    function handleFiles(files) {
      if (files.length === 0) return

      // Clear previous files
      uploadedFiles.innerHTML = ""

      Array.from(files).forEach((file) => {
        // Store the file
        demandeData.avisImposition = file

        // Display the file
        const fileElement = document.createElement("div")
        fileElement.className = "uploaded-file"
        if (file.type === "application/pdf" || file.type.startsWith("image/")) {
          // Déterminer l'icône appropriée
          const fileIcon = file.type === "application/pdf" ? "fa-file-pdf" : "fa-file-image"
          const fileColor = file.type === "application/pdf" ? "dc2626" : "2563eb"

          fileElement.innerHTML = `
          <div class="file-info">
            <i class="fas ${fileIcon}"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <div class="file-status">
            <i class="fas fa-check-circle success-icon"></i>
            <span>Téléchargé avec succès</span>
          </div>
          <button class="remove-file">
            <i class="fas fa-times"></i>
          </button>
        `
        }
        uploadedFiles.appendChild(fileElement)

        // Add remove button functionality
        const removeBtn = fileElement.querySelector(".remove-file")
        removeBtn.onclick = () => {
          fileElement.remove()
          demandeData.avisImposition = null
          nextBtn.disabled = true
          extractionStatus.style.display = "none"
        }

        // Show extraction status
        extractionStatus.style.display = "block"
        extractionProgress.style.display = "block"
        extractionSuccess.style.display = "none"
        extractionError.style.display = "none"

        // Simulate extraction (in a real app, this would be an API call)
        setTimeout(() => {
          extractionProgress.style.display = "none"

          // Simulate successful extraction
          extractionSuccess.style.display = "block"

          // Store extracted data (simulated)
          extractedData.revenus = {
            salaireNet: 2500,
            revenuNetImposable: 30000,
            rfr: 28500,
            revenusValeursMobilieres: 1200,
            revenusImmobiliers: 0,
          }

          nextBtn.disabled = false
        }, 2000)
      })
    }

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupRelevesBancairesStep(content, nextBtn) {
    const fileInput = content.querySelector("#releves-bancaires")
    fileInput.setAttribute("accept", ".pdf,.jpg,.jpeg,.png")
    const uploadZone = content.querySelector(".upload-zone")
    const uploadedFiles = content.querySelector(".uploaded-files")
    const extractionStatus = content.querySelector(".extraction-status")
    const extractionProgress = content.querySelector(".extraction-progress")
    const extractionSuccess = content.querySelector(".extraction-success")
    const extractionError = content.querySelector(".extraction-error")

    // Click to upload
    uploadZone.onclick = () => fileInput.click()

    // Drag and drop
    uploadZone.ondragover = (e) => {
      e.preventDefault()
      uploadZone.classList.add("drag-over")
    }

    uploadZone.ondragleave = () => {
      uploadZone.classList.remove("drag-over")
    }

    uploadZone.ondrop = (e) => {
      e.preventDefault()
      uploadZone.classList.remove("drag-over")
      handleFiles(e.dataTransfer.files)
    }

    fileInput.onchange = (e) => {
      handleFiles(e.target.files)
    }

    function handleFiles(files) {
      if (files.length === 0) return

      // Store the files
      demandeData.relevesBancaires = []

      Array.from(files).forEach((file) => {
        // Store the file
        demandeData.relevesBancaires.push(file)

        // Display the file
        const fileElement = document.createElement("div")
        fileElement.className = "uploaded-file"
        if (file.type === "application/pdf" || file.type.startsWith("image/")) {
          // Déterminer l'icône appropriée
          const fileIcon = file.type === "application/pdf" ? "fa-file-pdf" : "fa-file-image"
          const fileColor = file.type === "application/pdf" ? "dc2626" : "2563eb"

          fileElement.innerHTML = `
          <div class="file-info">
            <i class="fas ${fileIcon}"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <div class="file-status">
            <i class="fas fa-check-circle success-icon"></i>
            <span>Téléchargé avec succès</span>
          </div>
          <button class="remove-file" data-filename="${file.name}">
            <i class="fas fa-times"></i>
          </button>
        `
        }
        uploadedFiles.appendChild(fileElement)

        // Add remove button functionality
        const removeBtn = fileElement.querySelector(".remove-file")
        removeBtn.onclick = () => {
          const filename = removeBtn.dataset.filename
          demandeData.relevesBancaires = demandeData.relevesBancaires.filter((f) => f.name !== filename)
          fileElement.remove()

          if (demandeData.relevesBancaires.length === 0) {
            nextBtn.disabled = true
            extractionStatus.style.display = "none"
          }
        }
      })

      if (demandeData.relevesBancaires.length > 0) {
        // Show extraction status
        extractionStatus.style.display = "block"
        extractionProgress.style.display = "block"
        extractionSuccess.style.display = "none"
        extractionError.style.display = "none"

        // Simulate extraction (in a real app, this would be an API call)
        setTimeout(() => {
          extractionProgress.style.display = "none"

          // Simulate successful extraction
          extractionSuccess.style.display = "block"

          // Store extracted data (simulated)
          extractedData.charges = {
            chargesCreditsConsommation: 150,
            chargesCreditsImmobiliers: 0,
            loyer: 850,
            impotRevenu: 200,
          }

          nextBtn.disabled = false
        }, 2000)
      }
    }

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupEtatCivilStep(content, nextBtn) {
    const requiredFields = [
      "nom",
      "prenom",
      "dateNaissance",
      "lieuNaissance",
      "adresse",
      "codePostal",
      "commune",
      "situationLogement",
      "email",
      "telephone",
    ]

    // Pre-fill form with extracted data
    if (extractedData.etatCivil) {
      const data = extractedData.etatCivil

      if (data.nom) content.querySelector("#nom").value = data.nom
      if (data.prenom) content.querySelector("#prenom").value = data.prenom
      if (data.dateNaissance) content.querySelector("#dateNaissance").value = data.dateNaissance
      if (data.lieuNaissance) content.querySelector("#lieuNaissance").value = data.lieuNaissance
      if (data.adresse) content.querySelector("#adresse").value = data.adresse
      if (data.codePostal) content.querySelector("#codePostal").value = data.codePostal
      if (data.commune) content.querySelector("#commune").value = data.commune
    }

    function checkForm() {
      const isValid = requiredFields.every((fieldId) => {
        const field = content.querySelector(`#${fieldId}`)
        return field && field.value.trim() !== ""
      })
      nextBtn.disabled = !isValid
    }

    requiredFields.forEach((fieldId) => {
      const field = content.querySelector(`#${fieldId}`)
      if (field) {
        field.addEventListener("input", () => {
          demandeData[fieldId] = field.value
          checkForm()
        })
        field.addEventListener("change", () => {
          demandeData[fieldId] = field.value
          checkForm()
        })
      }
    })

    // Check form initially
    checkForm()

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupSituationFamilialeStep(content, nextBtn) {
    const situationMatrimoniale = content.querySelector("#situationMatrimoniale")
    const dateMariagePacs = content.querySelector("#dateMariagePacs")
    const dateUnion = content.querySelector("#dateUnion")
    const nombreEnfants = content.querySelector("#nombreEnfants")
    const enfantsDetails = content.querySelector("#enfantsDetails")
    const enfantsContainer = content.querySelector("#enfantsContainer")

    function checkForm() {
      const isValid = situationMatrimoniale.value !== ""
      nextBtn.disabled = !isValid
    }

    situationMatrimoniale.addEventListener("change", () => {
      demandeData.situationMatrimoniale = situationMatrimoniale.value

      // Show/hide date field for married/PACS
      if (
        ["marie-communaute", "marie-separation", "marie-communaute-universelle", "pacs"].includes(
          situationMatrimoniale.value,
        )
      ) {
        dateMariagePacs.style.display = "block"
        dateUnion.required = true
      } else {
        dateMariagePacs.style.display = "none"
        dateUnion.required = false
      }

      checkForm()
    })

    dateUnion.addEventListener("change", () => {
      demandeData.dateUnion = dateUnion.value
    })

    nombreEnfants.addEventListener("change", () => {
      demandeData.nombreEnfants = nombreEnfants.value

      // Show/hide children details
      if (Number.parseInt(nombreEnfants.value) > 0) {
        enfantsDetails.style.display = "block"
        generateEnfantsFields(Number.parseInt(nombreEnfants.value), enfantsContainer)
      } else {
        enfantsDetails.style.display = "none"
        enfantsContainer.innerHTML = ""
      }
    })

    function generateEnfantsFields(count, container) {
      container.innerHTML = ""
      for (let i = 1; i <= count; i++) {
        const div = document.createElement("div")
        div.className = "form-group"
        div.innerHTML = `
          <label for="ageEnfant${i}">Âge de l'enfant ${i}</label>
          <input type="number" id="ageEnfant${i}" name="ageEnfant${i}" min="0" max="30">
        `
        container.appendChild(div)

        const input = div.querySelector("input")
        input.addEventListener("input", () => {
          if (!demandeData.agesEnfants) demandeData.agesEnfants = []
          demandeData.agesEnfants[i - 1] = Number.parseInt(input.value) || 0
        })
      }
    }

    // Check form initially
    checkForm()

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupActiviteProStep(content, nextBtn) {
    const situationProfessionnelle = content.querySelector("#situationProfessionnelle")
    const pourcentageDetention = content.querySelector("#pourcentageDetention")
    const dateFinContrat = content.querySelector("#dateFinContrat")
    const residenceFiscale = content.querySelector("#residenceFiscale")
    const paysResidence = content.querySelector("#paysResidence")

    const requiredFields = [
      "situationProfessionnelle",
      "dateDebutContrat",
      "nomEntreprise",
      "adresseEntreprise",
      "residenceFiscale",
    ]

    function checkForm() {
      const isValid = requiredFields.every((fieldId) => {
        const field = content.querySelector(`#${fieldId}`)
        return field && field.value.trim() !== ""
      })
      nextBtn.disabled = !isValid
    }

    situationProfessionnelle.addEventListener("change", () => {
      demandeData.situationProfessionnelle = situationProfessionnelle.value

      // Show percentage field for company managers
      if (situationProfessionnelle.value === "gerant") {
        pourcentageDetention.style.display = "block"
      } else {
        pourcentageDetention.style.display = "none"
      }

      // Show end date for temporary contracts
      if (["cdd", "interim"].includes(situationProfessionnelle.value)) {
        dateFinContrat.style.display = "block"
      } else {
        dateFinContrat.style.display = "none"
      }

      checkForm()
    })

    residenceFiscale.addEventListener("change", () => {
      demandeData.residenceFiscale = residenceFiscale.value

      if (residenceFiscale.value === "autre") {
        paysResidence.style.display = "block"
      } else {
        paysResidence.style.display = "none"
      }

      checkForm()
    })

    // Setup all field listeners
    requiredFields.forEach((fieldId) => {
      const field = content.querySelector(`#${fieldId}`)
      if (field) {
        field.addEventListener("input", () => {
          demandeData[fieldId] = field.value
          checkForm()
        })
        field.addEventListener("change", () => {
          demandeData[fieldId] = field.value
          checkForm()
        })
      }
    })

    // Optional fields
    const optionalFields = ["pourcentage", "dateFin", "pays"]
    optionalFields.forEach((fieldId) => {
      const field = content.querySelector(`#${fieldId}`)
      if (field) {
        field.addEventListener("input", () => {
          demandeData[fieldId] = field.value
        })
        field.addEventListener("change", () => {
          demandeData[fieldId] = field.value
        })
      }
    })

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupRevenusStep(content, nextBtn) {
    const situationPro = demandeData.situationProfessionnelle
    const beneficesGroup = content.querySelector("#beneficesGroup")

    // Show benefits field for non-salaried workers
    if (
      [
        "micro-entrepreneur",
        "independant-reglemente",
        "independant-non-reglemente",
        "commercant",
        "artisan",
        "agriculteur",
        "gerant",
      ].includes(situationPro)
    ) {
      beneficesGroup.style.display = "block"
    }

    const requiredFields = ["salaireNet", "revenuNetImposable", "rfr"]

    // Pre-fill form with extracted data
    if (extractedData.revenus) {
      const data = extractedData.revenus

      if (data.salaireNet) content.querySelector("#salaireNet").value = data.salaireNet
      if (data.revenuNetImposable) content.querySelector("#revenuNetImposable").value = data.revenuNetImposable
      if (data.rfr) content.querySelector("#rfr").value = data.rfr
      if (data.revenusValeursMobilieres)
        content.querySelector("#revenusValeursMobilieres").value = data.revenusValeursMobilieres
      if (data.revenusImmobiliers) content.querySelector("#revenusImmobiliers").value = data.revenusImmobiliers
    }

    function checkForm() {
      const isValid = requiredFields.every((fieldId) => {
        const field = content.querySelector(`#${fieldId}`)
        return field && field.value && Number.parseFloat(field.value) >= 0
      })
      nextBtn.disabled = !isValid
    }

    requiredFields.forEach((fieldId) => {
      const field = content.querySelector(`#${fieldId}`)
      if (field) {
        field.addEventListener("input", () => {
          demandeData[fieldId] = Number.parseFloat(field.value) || 0
          checkForm()
        })
      }
    })

    // Optional fields
    const optionalFields = [
      "benefices",
      "primes",
      "revenusValeursMobilieres",
      "dividendes",
      "revenusImmobiliers",
      "allocationsFamiliales",
      "pensionAlimentaire",
    ]

    optionalFields.forEach((fieldId) => {
      const field = content.querySelector(`#${fieldId}`)
      if (field) {
        field.addEventListener("input", () => {
          demandeData[fieldId] = Number.parseFloat(field.value) || 0
        })
      }
    })

    // Check form initially
    checkForm()

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupChargesStep(content, nextBtn) {
    const fields = [
      "chargesCreditsConsommation",
      "chargesCreditsImmobiliers",
      "pretsFamiliaux",
      "pensionAlimentaireVersee",
      "impotRevenu",
      "loyer",
      "chargesCPS",
    ]

    // Pre-fill form with extracted data
    if (extractedData.charges) {
      const data = extractedData.charges

      if (data.chargesCreditsConsommation)
        content.querySelector("#chargesCreditsConsommation").value = data.chargesCreditsConsommation
      if (data.chargesCreditsImmobiliers)
        content.querySelector("#chargesCreditsImmobiliers").value = data.chargesCreditsImmobiliers
      if (data.loyer) content.querySelector("#loyer").value = data.loyer
      if (data.impotRevenu) content.querySelector("#impotRevenu").value = data.impotRevenu
    }

    fields.forEach((fieldId) => {
      const field = content.querySelector(`#${fieldId}`)
      if (field) {
        field.addEventListener("input", () => {
          demandeData[fieldId] = Number.parseFloat(field.value) || 0
        })
      }
    })

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupFinancementStep(content, nextBtn) {
    const montantProjet = content.querySelector("#montantProjet")
    const apportPersonnel = content.querySelector("#apportPersonnel")
    const montantEmprunte = content.querySelector("#montantEmprunte")
    const dureeEmprunt = content.querySelector("#dureeEmprunt")

    function calculateMontantEmprunte() {
      const projet = Number.parseFloat(montantProjet.value) || 0
      const apport = Number.parseFloat(apportPersonnel.value) || 0
      const emprunt = Math.max(0, projet - apport)
      montantEmprunte.value = emprunt
      demandeData.montantEmprunte = emprunt
    }

    function checkForm() {
      const isValid =
        montantProjet.value &&
        apportPersonnel.value &&
        dureeEmprunt.value &&
        Number.parseFloat(montantProjet.value) > 0 &&
        Number.parseFloat(apportPersonnel.value) >= 0
      nextBtn.disabled = !isValid
    }

    montantProjet.addEventListener("input", () => {
      demandeData.montantProjet = Number.parseFloat(montantProjet.value) || 0
      calculateMontantEmprunte()
      checkForm()
    })

    apportPersonnel.addEventListener("input", () => {
      demandeData.apportPersonnel = Number.parseFloat(apportPersonnel.value) || 0
      calculateMontantEmprunte()
      checkForm()
    })

    dureeEmprunt.addEventListener("change", () => {
      demandeData.dureeEmprunt = Number.parseInt(dureeEmprunt.value) || 0
      checkForm()
    })

    // Optional fields
    const optionalFields = ["typeAmortissement", "assuranceEmprunteur"]
    optionalFields.forEach((fieldId) => {
      const field = content.querySelector(`#${fieldId}`)
      if (field) {
        field.addEventListener("change", () => {
          demandeData[fieldId] = field.value
        })
      }
    })

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupDocumentsProjetStep(content, nextBtn) {
    const fileInput = content.querySelector("#documents-projet")
    fileInput.setAttribute("accept", ".pdf,.jpg,.jpeg,.png")
    const uploadZone = content.querySelector(".upload-zone")
    const uploadedFiles = content.querySelector(".uploaded-files")

    // Click to upload
    uploadZone.onclick = () => fileInput.click()

    // Drag and drop
    uploadZone.ondragover = (e) => {
      e.preventDefault()
      uploadZone.classList.add("drag-over")
    }

    uploadZone.ondragleave = () => {
      uploadZone.classList.remove("drag-over")
    }

    uploadZone.ondrop = (e) => {
      e.preventDefault()
      uploadZone.classList.remove("drag-over")
      handleFiles(e.dataTransfer.files)
    }

    fileInput.onchange = (e) => {
      handleFiles(e.target.files)
    }

    function handleFiles(files) {
      if (files.length === 0) return

      // Store the files
      if (!demandeData.documentsProjet) {
        demandeData.documentsProjet = []
      }

      Array.from(files).forEach((file) => {
        // Store the file
        demandeData.documentsProjet.push(file)

        // Display the file
        const fileElement = document.createElement("div")
        fileElement.className = "uploaded-file"
        if (file.type === "application/pdf" || file.type.startsWith("image/")) {
          // Déterminer l'icône appropriée
          const fileIcon = file.type === "application/pdf" ? "fa-file-pdf" : "fa-file-image"
          const fileColor = file.type === "application/pdf" ? "dc2626" : "2563eb"

          fileElement.innerHTML = `
          <div class="file-info">
            <i class="fas ${fileIcon}"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <div class="file-status">
            <i class="fas fa-check-circle success-icon"></i>
            <span>Téléchargé avec succès</span>
          </div>
          <button class="remove-file" data-filename="${file.name}">
            <i class="fas fa-times"></i>
          </button>
        `
        }
        uploadedFiles.appendChild(fileElement)

        // Add remove button functionality
        const removeBtn = fileElement.querySelector(".remove-file")
        removeBtn.onclick = () => {
          const filename = removeBtn.dataset.filename
          demandeData.documentsProjet = demandeData.documentsProjet.filter((f) => f.name !== filename)
          fileElement.remove()
        }
      })

      // Enable next button if at least one document is uploaded
      if (demandeData.documentsProjet.length > 0) {
        nextBtn.disabled = false
      }
    }

    nextBtn.onclick = async () => {
      // Submit the demande
      await submitDemande()

      currentStep++
      showStep(currentStep)
    }
  }

  async function submitDemande() {
    try {
      const formData = new FormData()

      const csrfInput = document.querySelector('input[name="_csrf"]')
      if (csrfInput) {
        formData.append('_csrf', csrfInput.value)
      }

      // Ajoute tous les champs du formulaire présents dans le DOM
      const allInputs = document.querySelectorAll('input, select, textarea')
      allInputs.forEach(input => {
        if (input.name && input.type !== 'file' && !formData.has(input.name)) {
          formData.append(input.name, input.value)
        }
      })

      // Ajoute les fichiers depuis demandeData
      if (demandeData.documentsProjet) {
        demandeData.documentsProjet.forEach((file) => {
          formData.append('documentsProjet', file)
        })
      }
      if (demandeData.relevesBancaires) {
        demandeData.relevesBancaires.forEach((file) => {
          formData.append('relevesBancaires', file)
        })
      }
      if (demandeData.pieceIdentite) {
        formData.append('pieceIdentite', demandeData.pieceIdentite)
      }
      if (demandeData.avisImposition) {
        formData.append('avisImposition', demandeData.avisImposition)
      }

      const response = await fetch("/applicant/demande", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      demandeData.dossierNumber = result.dossierNumber
      demandeData.submissionDate = result.submissionDate
    } catch (error) {
      console.error("Erreur lors de la soumission:", error)
      // Generate fallback data
      console.log('errure lors de la soumission, données de secours générées')
      demandeData.dossierNumber = `NL-2024-${Math.random().toString().substr(2, 6)}`
      demandeData.submissionDate = new Date().toLocaleDateString("fr-FR")
    }
  }

  function showConfirmation() {
    // Display the dossier number and submission date
    document.getElementById("dossierNumber").textContent =
      demandeData.dossierNumber || `NL-2024-${Math.random().toString().substr(2, 6)}`
    document.getElementById("submissionDate").textContent =
      demandeData.submissionDate || new Date().toLocaleDateString("fr-FR")
  }

  // Handle keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.location.href = "/"
    }
  })
})
