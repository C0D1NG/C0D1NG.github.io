const REPOSITORIES = [
  "C0D1NG/C0D1NG",
  "C0D1NG/Profile",
  "C0D1NG/Programming",
  "C0D1NG/Data-Structures",
  "C0D1NG/Algorithms",
  "C0D1NG/Development",
  "C0D1NG/Flutter",
  "C0D1NG/SwiftUI",
];

const getDefaultRepo = () => REPOSITORIES[0];

class ContributorManager {
  constructor() {
    this.defaultRepo = getDefaultRepo();
    this.currentRepo = this.defaultRepo;
    this.api = `https://api.github.com/repos/${this.currentRepo}/contributors`;
    this.repoApi = `https://api.github.com/repos/${this.currentRepo}`;
    this.contributors = [];
    this.repoInfo = {};
    this.loadingElement = document.getElementById("loading-state");
    this.errorElement = document.getElementById("error-state");
    this.containerElement = document.getElementById("coding");
    this.totalContributorsElement =
      document.getElementById("total-contributors");
    this.totalCommitsElement = document.getElementById("total-commits");
    this.repoSelector = document.getElementById("repo-select");
    this.repoStarsElement = document.getElementById("repo-stars");
    this.repoForksElement = document.getElementById("repo-forks");
    this.repoContributorsElement = document.getElementById("repo-contributors");
    this.repoDescriptionElement = document.getElementById("repo-description");
    this.init();
  }

  async init() {
    this.populateRepoSelector();
    this.setupRepoSelector();
    await this.fetchRepoInfo();
    await this.fetchContributors();
    this.setupScrollEffects();
    this.setupBackToTop();
    this.animateStats();
  }

  populateRepoSelector() {
    this.repoSelector.innerHTML = "";
    REPOSITORIES.forEach((repo, index) => {
      const option = document.createElement("option");
      option.value = repo;
      option.textContent = repo;
      if (index === 0) {
        option.selected = true;
      }
      this.repoSelector.appendChild(option);
    });
  }

  setupRepoSelector() {
    this.repoSelector.addEventListener("change", async (e) => {
      const selectedRepoId = e.target.value;
      if (
        selectedRepoId !== this.currentRepo &&
        REPOSITORIES.includes(selectedRepoId)
      ) {
        this.currentRepo = selectedRepoId;
        this.api = `https://api.github.com/repos/${this.currentRepo}/contributors`;
        this.repoApi = `https://api.github.com/repos/${this.currentRepo}`;
        this.repoSelector.disabled = true;
        this.repoSelector.classList.add("loading");
        try {
          await this.fetchRepoInfo();
          await this.fetchContributors();
        } finally {
          this.repoSelector.disabled = false;
          this.repoSelector.classList.remove("loading");
        }
      }
    });
  }

  async fetchRepoInfo() {
    try {
      const response = await fetch(this.repoApi);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.repoInfo = await response.json();
      this.updateRepoInfo();
    } catch (error) {
      console.error("Error fetching repository info:", error);
      this.showRepoInfoError();
    }
  }

  updateRepoInfo() {
    this.animateNumber(
      this.repoStarsElement,
      this.repoInfo.stargazers_count || 0
    );
    this.animateNumber(this.repoForksElement, this.repoInfo.forks_count || 0);
    const description =
      this.repoInfo.description || "No description available.";
    this.repoDescriptionElement.textContent = description;
    document.title = `${this.currentRepo} - C0D1NG Contributors`;
  }

  showRepoInfoError() {
    this.repoStarsElement.textContent = "?";
    this.repoForksElement.textContent = "?";
    this.repoContributorsElement.textContent = "?";
    this.repoDescriptionElement.textContent =
      "Unable to load repository information.";
  }

  async fetchContributors() {
    try {
      this.showLoading();
      const response = await fetch(this.api);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.contributors = await response.json();
      if (this.contributors && this.contributors.length > 0) {
        this.renderContributors();
        this.updateStats();
        this.hideLoading();
      } else {
        throw new Error("No contributors found");
      }
    } catch (error) {
      console.error("Error fetching contributors:", error);
      this.showError();
    }
  }

  showLoading() {
    this.loadingElement.style.display = "block";
    this.errorElement.classList.add("d-none");
    this.containerElement.innerHTML = "";
  }

  hideLoading() {
    this.loadingElement.style.display = "none";
  }

  showError() {
    this.loadingElement.style.display = "none";
    this.errorElement.classList.remove("d-none");
  }

  renderContributors() {
    const contributorsHtml = this.contributors
      .map((contributor, index) => {
        return `
          <div class="contributor-card" style="animation-delay: ${index * 0.1}s">
            <div class="card">
              <img src="${contributor.avatar_url}" alt="${contributor.login}'s avatar" class="contributor-avatar" loading="lazy">
              <h4 class="contributor-name">${contributor.login}</h4>
              <p class="contributor-stats">
                <span class="contribution-count">${contributor.contributions}</span>
                contribution${contributor.contributions !== 1 ? "s" : ""}
              </p>
              <a href="${contributor.html_url}" target="_blank" rel="noopener noreferrer" class="github-link"
                aria-label="View ${contributor.login}'s GitHub profile">
                <i class="fab fa-github"></i>
                View Profile
              </a>
            </div>
          </div>
        `;
      })
      .join("");
    this.containerElement.innerHTML = contributorsHtml;
    setTimeout(() => {
      document.querySelectorAll(".contributor-card").forEach((card) => {
        card.classList.add("animate-fade-in");
      });
    }, 100);
  }

  updateStats() {
    const totalContributors = this.contributors.length;
    const totalCommits = this.contributors.reduce(
      (sum, contributor) => sum + contributor.contributions,
      0
    );
    this.animateNumber(this.totalContributorsElement, totalContributors);
    this.animateNumber(this.totalCommitsElement, totalCommits);
    this.animateNumber(this.repoContributorsElement, totalContributors);
  }

  animateNumber(element, targetNumber) {
    const startNumber = 0;
    const duration = 2000;
    const startTime = performance.now();
    const updateNumber = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentNumber = Math.floor(
        startNumber + (targetNumber - startNumber) * easeOut
      );
      element.textContent = currentNumber.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };
    requestAnimationFrame(updateNumber);
  }

  animateStats() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".stat-item").forEach((stat) => {
      observer.observe(stat);
    });
  }

  setupScrollEffects() {
    const navbar = document.getElementById("mainNav");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) {
        navbar.style.background = "rgba(15, 15, 35, 0.95)";
        navbar.style.borderBottomColor = "rgba(255, 255, 255, 0.2)";
      } else {
        navbar.style.background = "rgba(255, 255, 255, 0.1)";
        navbar.style.borderBottomColor = "rgba(255, 255, 255, 0.1)";
      }
    });
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  setupBackToTop() {
    const backToTopButton = document.getElementById("back-to-top");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopButton.classList.add("show");
      } else {
        backToTopButton.classList.remove("show");
      }
    });
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loading");
  window.contributorManager = new ContributorManager();
  setTimeout(() => {
    document.body.classList.remove("loading");
  }, 500);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
  });
}