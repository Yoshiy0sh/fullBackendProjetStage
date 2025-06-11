// Mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
  const navMenu = document.querySelector(".nav-menu")

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active")
    })
  }

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]')
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const targetId = this.getAttribute("href")
      const targetSection = document.querySelector(targetId)

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Newsletter form submission
  const newsletterForm = document.querySelector(".newsletter-form")
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault()
      const email = this.querySelector('input[type="email"]').value

      if (email) {
        alert("Merci pour votre inscription à notre newsletter !")
        this.reset()
      }
    })
  }

  // Simulation form submission
  const simulationForm = document.querySelector(".simulation-form")
  if (simulationForm) {
    simulationForm.addEventListener("submit", function (e) {
      e.preventDefault()
      const montant = this.querySelector("#montant").value
      const duree = this.querySelector("#duree").value

      if (montant && duree) {
        alert("Simulation en cours... Vous allez être redirigé vers les résultats.")
      }
    })
  }

  // Add scroll effect to header
  window.addEventListener("scroll", () => {
    const header = document.querySelector(".header")
    if (window.scrollY > 100) {
      header.style.background = "rgba(255, 255, 255, 0.95)"
      header.style.backdropFilter = "blur(10px)"
    } else {
      header.style.background = "#fff"
      header.style.backdropFilter = "none"
    }
  })

  // Renegotiation button redirection
  const renegotiationButtons = document.querySelectorAll(".renegotiation-btn")
  renegotiationButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "/renegociation"
    })
  })
})
