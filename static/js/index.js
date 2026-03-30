const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let scrollFrame = null;

function setHeaderState() {
  const header = document.querySelector(".site-header");
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 12);
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
      threshold: 0.14
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

      if (!target || !navigator.clipboard) {
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

function setupCaseCarousel() {
  const carousel = document.querySelector("[data-case-carousel]");
  if (!carousel) {
    return;
  }

  const triggers = Array.from(carousel.querySelectorAll("[data-case-trigger]"));
  const panels = Array.from(carousel.querySelectorAll("[data-case-panel]"));
  const status = carousel.querySelector("[data-case-status]");
  const previousButton = carousel.querySelector("[data-case-prev]");
  const nextButton = carousel.querySelector("[data-case-next]");

  if (!triggers.length || triggers.length !== panels.length) {
    return;
  }

  let activeIndex = 0;

  function activateCase(nextIndex) {
    activeIndex = (nextIndex + panels.length) % panels.length;

    triggers.forEach((trigger, index) => {
      const isActive = index === activeIndex;
      trigger.classList.toggle("is-active", isActive);
      trigger.setAttribute("aria-selected", isActive ? "true" : "false");
      trigger.tabIndex = isActive ? 0 : -1;

      if (isActive) {
        trigger.scrollIntoView({
          behavior: prefersReducedMotion.matches ? "auto" : "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    });

    panels.forEach((panel, index) => {
      const isActive = index === activeIndex;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
      if (isActive) {
        panel.style.removeProperty("display");
      } else {
        panel.style.display = "none";
      }
    });

    if (status) {
      status.textContent = `${activeIndex + 1} / ${panels.length}`;
    }
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => activateCase(index));
    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }

      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + direction + triggers.length) % triggers.length;
      activateCase(nextIndex);
      triggers[nextIndex].focus();
    });
  });

  previousButton?.addEventListener("click", () => activateCase(activeIndex - 1));
  nextButton?.addEventListener("click", () => activateCase(activeIndex + 1));
  activateCase(activeIndex);
}

function setupDemoVideo() {
  const video = document.getElementById("demo-video");
  const launch = document.querySelector("[data-video-launch]");
  const videoSource = video?.dataset.src;
  if (!video || !launch || !videoSource) {
    return;
  }

  function buildFreshSource() {
    const separator = videoSource.includes("?") ? "&" : "?";
    return `${videoSource}${separator}play=${Date.now()}`;
  }

  async function prepareVideoStart() {
    video.src = buildFreshSource();
    video.load();

    if (video.readyState < 1) {
      await new Promise((resolve) => {
        video.addEventListener("loadedmetadata", resolve, { once: true });
      });
    }

    try {
      video.currentTime = 0;
    } catch (error) {
      return;
    }

    if (video.seeking) {
      await new Promise((resolve) => {
        video.addEventListener("seeked", resolve, { once: true });
      });
    }
  }

  function resetVideo() {
    launch.hidden = false;
    video.pause();
    video.hidden = true;
    video.preload = "none";
    video.removeAttribute("src");
    video.load();
  }

  resetVideo();
  window.addEventListener("pageshow", resetVideo);

  launch.addEventListener("click", async () => {
    launch.hidden = true;
    video.hidden = false;
    await prepareVideoStart();

    try {
      await video.play();
    } catch (error) {
      video.pause();
    }
  });
}

function setupInterfaceLens() {
  const root = document.querySelector("[data-lens-root]"), image = root?.querySelector("[data-lens-image]"), lens = root?.querySelector("[data-lens]");
  if (!root || !image || !lens || !window.matchMedia("(hover: hover)").matches) {
    return;
  }

  const zoom = 2.35, radius = 88;
  const paintLens = (event) => {
    const bounds = image.getBoundingClientRect();
    const x = Math.min(bounds.width - radius, Math.max(radius, event.clientX - bounds.left));
    const y = Math.min(bounds.height - radius, Math.max(radius, event.clientY - bounds.top));
    lens.style.left = `${x}px`;
    lens.style.top = `${y}px`;
    lens.style.backgroundImage = `url("${image.currentSrc || image.src}")`;
    lens.style.backgroundSize = `${bounds.width * zoom}px ${bounds.height * zoom}px`;
    lens.style.backgroundPosition = `${radius - x * zoom}px ${radius - y * zoom}px`;
  };

  root.addEventListener("pointerenter", (event) => {
    root.classList.add("is-active");
    paintLens(event);
  });
  root.addEventListener("pointermove", paintLens);
  root.addEventListener("pointerleave", () => root.classList.remove("is-active"));
}

function handleScroll() {
  if (scrollFrame !== null) {
    return;
  }

  scrollFrame = window.requestAnimationFrame(() => {
    setHeaderState();
    scrollFrame = null;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setHeaderState();
  revealSections();
  setupCopyButtons();
  setupSectionTracking();
  setupCaseCarousel();
  setupDemoVideo();
  setupInterfaceLens();

  window.addEventListener("scroll", handleScroll, { passive: true });
});
