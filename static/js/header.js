(() => {
  const MOBILE_NAV_QUERY = "(max-width: 860px)";
  const TOP_REVEAL_OFFSET = 24;
  const HIDE_DELTA = 8;

  document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector(".site-nav");
    if (!header || !toggle || !nav) {
      return;
    }

    const mobileQuery = window.matchMedia(MOBILE_NAV_QUERY);
    const navLinks = Array.from(nav.querySelectorAll("a"));
    let lastScrollY = window.scrollY;
    let scrollFrame = null;

    const syncHeader = (forceReveal = false) => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      const hideOffset = header.offsetHeight + TOP_REVEAL_OFFSET;

      header.classList.toggle("is-scrolled", currentScrollY > 12);

      if (forceReveal || header.classList.contains("is-menu-open") || currentScrollY < TOP_REVEAL_OFFSET) {
        header.classList.remove("is-hidden");
        lastScrollY = currentScrollY;
        return;
      }

      if (Math.abs(delta) >= HIDE_DELTA) {
        if (delta > 0 && currentScrollY > hideOffset) {
          header.classList.add("is-hidden");
        } else if (delta < 0) {
          header.classList.remove("is-hidden");
        }
      }

      lastScrollY = currentScrollY;
    };

    const closeMenu = (restoreFocus = false) => {
      header.classList.remove("is-menu-open");
      toggle.setAttribute("aria-expanded", "false");
      if (restoreFocus) {
        toggle.focus();
      }
      syncHeader(true);
    };

    toggle.addEventListener("click", () => {
      const willOpen = !header.classList.contains("is-menu-open");
      header.classList.toggle("is-menu-open", willOpen);
      toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
      syncHeader(true);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileQuery.matches) {
          closeMenu();
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!mobileQuery.matches || !header.classList.contains("is-menu-open")) {
        return;
      }

      if (header.contains(event.target)) {
        return;
      }

      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.classList.contains("is-menu-open")) {
        closeMenu(true);
      }
    });

    const handleViewportChange = () => {
      if (!mobileQuery.matches) {
        closeMenu();
      } else {
        syncHeader(true);
      }
    };

    if ("addEventListener" in mobileQuery) {
      mobileQuery.addEventListener("change", handleViewportChange);
    } else {
      mobileQuery.addListener(handleViewportChange);
    }

    window.addEventListener("scroll", () => {
      if (scrollFrame !== null) {
        return;
      }

      scrollFrame = window.requestAnimationFrame(() => {
        syncHeader();
        scrollFrame = null;
      });
    }, { passive: true });

    syncHeader(true);
  });
})();
