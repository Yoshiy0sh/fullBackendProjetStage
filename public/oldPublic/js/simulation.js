document.addEventListener("DOMContentLoaded", () => {
  let currentStep = 1
  const totalSteps = 5
  const simulationData = {}

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
      "step-resultats",
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
        showResults()
        break
    }
  }

  function setupProjectStep(content, nextBtn) {
    const optionCards = content.querySelectorAll(".option-card")

    optionCards.forEach((card) => {
      card.onclick = () => {
        optionCards.forEach((c) => c.classList.remove("selected"))
        card.classList.add("selected")
        simulationData.projet = card.dataset.option
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
      simulationData.age = Number.parseInt(ageInput.value)
      checkForm()
    }

    situationSelect.onchange = () => {
      simulationData.situation = situationSelect.value
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
        simulationData.profession = card.dataset.option
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
      simulationData.revenus = Number.parseInt(revenusInput.value)
      checkForm()
    }

    chargesInput.oninput = () => {
      simulationData.charges = Number.parseInt(chargesInput.value)
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
      simulationData.apport = Number.parseInt(apportInput.value)
      checkForm()
    }

    dureeSelect.onchange = () => {
      simulationData.duree = Number.parseInt(dureeSelect.value)
      checkForm()
    }

    nextBtn.onclick = () => {
      currentStep++
      showStep(currentStep)
    }
  }

  function showResults() {
    // Calculate loan amount based on simulation data
    const { revenus, charges, apport, duree, age, profession } = simulationData

    // Simple loan calculation logic
    const netIncome = revenus - charges
    const maxMonthlyPayment = netIncome * 0.33 // 33% debt-to-income ratio

    // Interest rate based on profession and age
    let interestRate = 1.5 // Base rate
    if (profession === "fonctionnaire") interestRate -= 0.2
    if (profession === "cdi") interestRate -= 0.1
    if (age < 30) interestRate -= 0.1

    // Calculate maximum loan amount
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = duree * 12
    const maxLoanAmount = Math.floor(
      (maxMonthlyPayment * (1 - Math.pow(1 + monthlyRate, -numberOfPayments))) / monthlyRate,
    )

    const totalLoanCapacity = maxLoanAmount + apport

    // Display results
    document.getElementById("loanAmount").textContent = new Intl.NumberFormat("fr-FR").format(totalLoanCapacity) + " €"
    document.getElementById("monthlyPayment").textContent =
      new Intl.NumberFormat("fr-FR").format(Math.floor(maxMonthlyPayment)) + " €"
    document.getElementById("interestRate").textContent = interestRate.toFixed(2) + "%"
    document.getElementById("loanDuration").textContent = duree + " ans"
  }

  // Handle keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.location.href = "/"
    }
  })
})
