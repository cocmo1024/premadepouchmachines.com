const CONTACT_EMAIL = window.CONTACT_EMAIL || "sales@premadepouchmachines.com";
const LEAD_ENDPOINT = window.LEAD_ENDPOINT || "";

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const form = document.querySelector("[data-lead-form]");
const statusEl = document.querySelector("[data-form-status]");
const mobileRfq = document.querySelector(".mobile-rfq");
const languageSwitchers = document.querySelectorAll("[data-language-switcher]");

const specs = {
  pouch: {
    speed: "Up to 60 bags/min",
    size: "W100-350mm, L150-480mm",
    fill: "1.5kg to 5kg range by model",
    fit: "Granules, powders, liquids and sauces",
  },
  vffs: {
    speed: "25-80 bags/min by bag width",
    size: "W80-350mm, L80-450mm",
    fill: "Scale, auger, cup or pump dosing",
    fit: "Snacks, powder, frozen food and pillow bags",
  },
  specialty: {
    speed: "Project-specific output range",
    size: "Tea, coffee, stick pack and filling formats",
    fill: "Counting, ultrasonic, vacuum and filling modules",
    fit: "Coffee, tea, hardware, rice, grains and secondary packs",
  },
};

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
  mobileRfq?.classList.toggle("is-visible", window.scrollY > 620);
}

function closeMenu() {
  if (!nav || !menuToggle) return;
  nav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function openMenu() {
  if (!nav || !menuToggle) return;
  nav.classList.add("is-open");
  document.body.classList.add("menu-open");
  menuToggle.setAttribute("aria-expanded", "true");
}

function closeLanguageSwitchers(except = null) {
  languageSwitchers.forEach((switcher) => {
    if (switcher === except) return;
    switcher.classList.remove("is-open");
    switcher.querySelector("[data-language-toggle]")?.setAttribute("aria-expanded", "false");
  });
}

window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("hashchange", () => {
  closeMenu();
  closeLanguageSwitchers();
});
setHeaderState();
closeMenu();
closeLanguageSwitchers();

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    if (nav.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });
}

languageSwitchers.forEach((switcher) => {
  const toggle = switcher.querySelector("[data-language-toggle]");
  const menu = switcher.querySelector("[data-language-menu]");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = !switcher.classList.contains("is-open");
    closeLanguageSwitchers(switcher);
    switcher.classList.toggle("is-open", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeLanguageSwitchers();
      closeMenu();
    }
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-language-switcher]")) closeLanguageSwitchers();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLanguageSwitchers();
    closeMenu();
  }
});

document.querySelectorAll(".spec-tab").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.spec;
    const next = specs[key];
    if (!next) return;

    document.querySelectorAll(".spec-tab").forEach((tab) => {
      const isActive = tab === button;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    Object.entries(next).forEach(([field, value]) => {
      const node = document.querySelector(`[data-spec-field="${field}"]`);
      if (node) node.textContent = value;
    });
  });
});

function formToObject(formElement) {
  return Object.fromEntries(new FormData(formElement).entries());
}

function buildMailto(data) {
  const subject = encodeURIComponent(`RFQ: ${data.machine || "Packaging machine"} - ${data.product || ""}`);
  const body = encodeURIComponent(
    [
      "New RFQ from premadepouchmachines.com",
      "",
      `Name: ${data.name || ""}`,
      `Email: ${data.email || ""}`,
      `Company: ${data.company || ""}`,
      `Machine interest: ${data.machine || ""}`,
      `Product: ${data.product || ""}`,
      `Target output: ${data.speed || ""}`,
      "",
      "Project notes:",
      data.message || "",
    ].join("\n"),
  );

  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

if (form && statusEl) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = formToObject(form);
    const submitButton = form.querySelector("button[type='submit']");

    statusEl.textContent = "";
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      if (LEAD_ENDPOINT) {
        const response = await fetch(LEAD_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, source: "premadepouchmachines.com" }),
        });

        if (!response.ok) {
          throw new Error(`Lead endpoint returned ${response.status}`);
        }

        statusEl.textContent = "RFQ sent. We will reply with the recommended machine scope.";
        form.reset();
        return;
      }

      window.location.href = buildMailto(data);
      statusEl.textContent = `Opening your email client. Send the prepared RFQ to ${CONTACT_EMAIL}.`;
    } catch (error) {
      window.location.href = buildMailto(data);
      statusEl.textContent = `The direct submission failed, so an email draft was prepared for ${CONTACT_EMAIL}.`;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send RFQ";
    }
  });
}
