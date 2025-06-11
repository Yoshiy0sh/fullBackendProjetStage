document.addEventListener("DOMContentLoaded", () => {
  let currentStep = 1
  const totalSteps = 6
  const demandeData = {}
  const uploadedFiles = {}

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
      "step-informations",
      "step-situation",
      "step-situation-pro",
      "step-finances",
      "step-documents",
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
        setupInformationsStep(currentContent, nextBtn)
        break
      case 3:
        setupSituationStep(currentContent, nextBtn)
        break
      case 4:
        setupSituationProStep(currentContent, nextBtn)
        break
      case 5:
        setupFinancesStep(currentContent, nextBtn)
        break
      case 6:
        setupDocumentsStep(currentContent, nextBtn)
        break
      case 7:
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
        demandeData.projet = card.dataset.option
        nextBtn.disabled = false
      }
    })

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupInformationsStep(content, nextBtn) {
    const ageInput = content.querySelector("#age")
    const situationSelect = content.querySelector("#situation")

    function checkForm() {
      const isValid = ageInput.value && situationSelect.value
      nextBtn.disabled = !isValid
    }

    ageInput.oninput = () => {
      demandeData.age = Number.parseInt(ageInput.value)
      checkForm()
    }

    situationSelect.onchange = () => {
      demandeData.situation = situationSelect.value
      checkForm()
    }

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupSituationStep(content, nextBtn) {
    const optionCards = content.querySelectorAll(".option-card")

    optionCards.forEach((card) => {
      card.onclick = () => {
        optionCards.forEach((c) => c.classList.remove("selected"))
        card.classList.add("selected")
        demandeData.profession = card.dataset.option
        nextBtn.disabled = false
      }
    })

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupSituationProStep(content, nextBtn) {
    const revenusInput = content.querySelector("#revenus")
    const chargesInput = content.querySelector("#charges")

    function checkForm() {
      const isValid = revenusInput.value && chargesInput.value
      nextBtn.disabled = !isValid
    }

    revenusInput.oninput = () => {
      demandeData.revenus = Number.parseInt(revenusInput.value)
      checkForm()
    }

    chargesInput.oninput = () => {
      demandeData.charges = Number.parseInt(chargesInput.value)
      checkForm()
    }

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupFinancesStep(content, nextBtn) {
    const apportInput = content.querySelector("#apport")
    const dureeSelect = content.querySelector("#duree")

    function checkForm() {
      const isValid = apportInput.value && dureeSelect.value
      nextBtn.disabled = !isValid
    }

    apportInput.oninput = () => {
      demandeData.apport = Number.parseInt(apportInput.value)
      checkForm()
    }

    dureeSelect.onchange = () => {
      demandeData.duree = Number.parseInt(dureeSelect.value)
      checkForm()
    }

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function setupDocumentsStep(content, nextBtn) {
    const fileInputs = content.querySelectorAll('input[type="file"]')

    fileInputs.forEach((input) => {
      const uploadZone = input.nextElementSibling
      // const filesContainer = uploadZone.nextElementSibling
      const filesContainer = document.getElementById(`files-${input.id.replace('bulletins-salaire', 'bulletins').replace('avis-imposition', 'avis').replace('justificatifs-revenus', 'revenus')}`)

      // Click to upload
      uploadZone.onclick = () => input.click()

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
        handleFiles(input.id, e.dataTransfer.files, filesContainer)
      }

      input.onchange = (e) => {
        handleFiles(input.id, e.target.files, filesContainer)
      }
    })

    function handleFiles(inputId, files, container) {
      console.log('Handling files for input:')
      if (!uploadedFiles[inputId]) {
        uploadedFiles[inputId] = []
      }

      Array.from(files).forEach((file) => {
        if (file.type === "application/pdf") {
          uploadedFiles[inputId].push(file)
          displayFile(file, container, inputId)
        } else {
          alert("Seuls les fichiers PDF sont acceptés")
        }
      })
      
      checkDocumentsForm()
    }

    function displayFile(file, container, inputId) {
      const fileElement = document.createElement("div")
      fileElement.className = "uploaded-file"
      fileElement.innerHTML = `
        <div class="file-info">
          <i class="fas fa-file-pdf"></i>
          <span class="file-name">${file.name}</span>
          <span class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
        <button class="remove-file" onclick="removeFile('${inputId}', '${file.name}', this)">
          <i class="fas fa-times"></i>
        </button>
      `
      container.appendChild(fileElement)
    }

    window.removeFile = (inputId, fileName, button) => {
      uploadedFiles[inputId] = uploadedFiles[inputId].filter((file) => file.name !== fileName)
      button.parentElement.remove()
      checkDocumentsForm()
    }

    function checkDocumentsForm() {
      // Require at least bulletins de salaire and avis d'imposition
      const hasBulletins = uploadedFiles["bulletins-salaire"] && uploadedFiles["bulletins-salaire"].length > 0
      const hasAvis = uploadedFiles["avis-imposition"] && uploadedFiles["avis-imposition"].length > 0

      nextBtn.disabled = !(hasBulletins && hasAvis)
    }

    nextBtn.onclick = async () => {
      // Here you would typically upload files to server
      // For now, we'll just simulate the upload
      demandeData.documents = uploadedFiles

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
      formData.append('_csrf',csrfInput.value)

      for (const [key, value] of Object.entries(demandeData)) {
        if (key !== "documents") {
          formData.append(key, value);
        }
      }

      if (demandeData.documents) {
        for (const [inputId, files] of Object.entries(demandeData.documents)) {
          files.forEach((file) => {
            formData.append(inputId, file);
          });
        }
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
