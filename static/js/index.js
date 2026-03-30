const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setHeaderState() {
  const header = document.querySelector(".site-header");
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 16);
}

function revealSections() {
  const revealTargets = document.querySelectorAll("[data-reveal]");

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.15
    }
  );

  revealTargets.forEach((element) => observer.observe(element));
}

function setupCopyButtons() {
  const buttons = document.querySelectorAll("[data-copy-target]");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const targetId = button.getAttribute("data-copy-target");
      const target = targetId ? document.getElementById(targetId) : null;

      if (!target) {
        return;
      }

      const previousLabel = button.textContent;

      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        button.dataset.copied = "true";
        button.textContent = "Copied";
      } catch (error) {
        button.textContent = "Retry";
        console.error("Clipboard copy failed.", error);
      }

      window.setTimeout(() => {
        button.dataset.copied = "false";
        button.textContent = previousLabel;
      }, 1600);
    });
  });
}

function setupSectionTracking() {
  const links = Array.from(document.querySelectorAll("[data-nav-link]"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        links.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${entry.target.id}`;
          if (isActive) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    {
      rootMargin: "-30% 0px -55% 0px",
      threshold: 0.1
    }
  );

  sections.forEach((section) => observer.observe(section));
}

document.addEventListener("DOMContentLoaded", () => {
  setHeaderState();
  revealSections();
  setupCopyButtons();
  setupSectionTracking();

  window.addEventListener("scroll", setHeaderState, { passive: true });
});
