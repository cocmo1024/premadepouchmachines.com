(() => {
  "use strict";

  const CONTACT_EMAIL = window.CONTACT_EMAIL || "info@szcomo.com";
  const LEAD_ENDPOINT = window.LEAD_ENDPOINT || "";
  const RFQ_CONTEXT_KEY = "ppm:rfq-context:v1";
  const FIRST_TOUCH_KEY = "ppm:first-touch:v1";
  const MIN_FORM_DWELL_MS = 1500;
  const ATTRIBUTION_FIELDS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "gbraid",
    "wbraid",
  ];
  const LEGACY_QUERY_FIELDS = ["machine", "product", "source", "q"];

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const form = document.querySelector("[data-lead-form]");
  const statusEl = document.querySelector("[data-form-status]");
  const mobileRfq = document.querySelector(".mobile-rfq");
  const mobileContactBar = document.querySelector(".mobile-contact-bar");
  const languageSwitchers = document.querySelectorAll("[data-language-switcher]");
  const emailCopyTriggers = document.querySelectorAll("[data-copy-email]");
  const catalogSearch = document.querySelector("[data-catalog-search]");
  const catalogSearchInput = document.querySelector("[data-catalog-search-input]");
  const catalogSearchStatus = document.querySelector("[data-catalog-search-status]");
  const catalogCards = document.querySelectorAll("[data-catalog-card]");
  const topicSearch = document.querySelector("[data-topic-search]");
  const topicSearchInput = document.querySelector("[data-topic-search-input]");
  const topicSearchStatus = document.querySelector("[data-topic-search-status]");
  const topicCards = document.querySelectorAll("[data-topic-card]");
  const documentLanguage = (document.documentElement.lang || "en").toLowerCase().split("-")[0];

  const SEARCH_COPY = {
    en: {
      machines: (count) => `${count} machine pages available.`,
      machineMatches: (count, query) => `${count} matching machine pages for “${query}”.`,
      topics: (count) => `${count} topic pages available.`,
      topicMatches: (count, query) => `${count} matching topic pages for “${query}”.`,
    },
    es: {
      machines: (count) => `${count} páginas de máquinas disponibles.`,
      machineMatches: (count, query) => `${count} páginas de máquinas coinciden con “${query}”.`,
      topics: (count) => `${count} páginas temáticas disponibles.`,
      topicMatches: (count, query) => `${count} páginas temáticas coinciden con “${query}”.`,
    },
    fr: {
      machines: (count) => `${count} pages machines disponibles.`,
      machineMatches: (count, query) => `${count} pages machines correspondent à « ${query} ».`,
      topics: (count) => `${count} pages thématiques disponibles.`,
      topicMatches: (count, query) => `${count} pages thématiques correspondent à « ${query} ».`,
    },
    de: {
      machines: (count) => `${count} Maschinenseiten verfügbar.`,
      machineMatches: (count, query) => `${count} Maschinenseiten passen zu „${query}“.`,
      topics: (count) => `${count} Themenseiten verfügbar.`,
      topicMatches: (count, query) => `${count} Themenseiten passen zu „${query}“.`,
    },
    pt: {
      machines: (count) => `${count} páginas de máquinas disponíveis.`,
      machineMatches: (count, query) => `${count} páginas de máquinas correspondem a “${query}”.`,
      topics: (count) => `${count} páginas temáticas disponíveis.`,
      topicMatches: (count, query) => `${count} páginas temáticas correspondem a “${query}”.`,
    },
    ru: {
      machines: (count) => `Доступно страниц оборудования: ${count}.`,
      machineMatches: (count, query) => `Найдено страниц оборудования по запросу «${query}»: ${count}.`,
      topics: (count) => `Доступно тематических страниц: ${count}.`,
      topicMatches: (count, query) => `Найдено тематических страниц по запросу «${query}»: ${count}.`,
    },
    ar: {
      machines: (count) => `${count} صفحة آلات متاحة.`,
      machineMatches: (count, query) => `${count} صفحة آلات مطابقة لعبارة «${query}».`,
      topics: (count) => `${count} صفحة موضوع متاحة.`,
      topicMatches: (count, query) => `${count} صفحة موضوع مطابقة لعبارة «${query}».`,
    },
  };

  const FORM_FALLBACK_COPY = {
    en: { idle: "Send RFQ", sending: "Preparing RFQ…", success: "RFQ received.", mailto: "Your email application is opening with the RFQ prepared. Review it and press Send.", failed: "Direct delivery is unavailable, so an email draft has been prepared.", blocked: "Please review the required fields and try again." },
    es: { idle: "Enviar RFQ", sending: "Preparando RFQ…", success: "RFQ recibido.", mailto: "Se abre su correo con el RFQ preparado. Revíselo y pulse Enviar.", failed: "La entrega directa no está disponible; se preparó un borrador de correo.", blocked: "Revise los campos obligatorios e inténtelo de nuevo." },
    fr: { idle: "Envoyer le RFQ", sending: "Préparation du RFQ…", success: "RFQ reçu.", mailto: "Votre messagerie s'ouvre avec le RFQ préparé. Vérifiez puis envoyez.", failed: "L'envoi direct est indisponible ; un brouillon d'e-mail a été préparé.", blocked: "Vérifiez les champs obligatoires puis réessayez." },
    de: { idle: "RFQ senden", sending: "RFQ wird vorbereitet…", success: "RFQ empfangen.", mailto: "Ihr E-Mail-Programm öffnet den vorbereiteten RFQ. Prüfen und senden Sie ihn.", failed: "Direkte Zustellung ist nicht verfügbar; ein E-Mail-Entwurf wurde vorbereitet.", blocked: "Bitte Pflichtfelder prüfen und erneut versuchen." },
    pt: { idle: "Enviar RFQ", sending: "Preparando RFQ…", success: "RFQ recebido.", mailto: "Seu e-mail abrirá com o RFQ preparado. Revise e envie.", failed: "A entrega direta está indisponível; um rascunho de e-mail foi preparado.", blocked: "Revise os campos obrigatórios e tente novamente." },
    ru: { idle: "Отправить RFQ", sending: "Подготовка RFQ…", success: "RFQ получен.", mailto: "Открывается почта с подготовленным RFQ. Проверьте и отправьте.", failed: "Прямая отправка недоступна; подготовлен черновик письма.", blocked: "Проверьте обязательные поля и повторите." },
    ar: { idle: "إرسال RFQ", sending: "جارٍ إعداد RFQ…", success: "تم استلام RFQ.", mailto: "سيُفتح بريدك مع RFQ جاهز. راجعه ثم اضغط إرسال.", failed: "الإرسال المباشر غير متاح، لذلك تم إعداد مسودة بريد.", blocked: "راجع الحقول المطلوبة وحاول مرة أخرى." },
  };
  const MAILTO_COPY = {
    en: {
      subject: "RFQ",
      heading: "New RFQ from premadepouchmachines.com",
      fields: ["Name", "Email", "Company", "Country / region", "Phone / WhatsApp", "Machine interest", "Product", "Package format", "Fill weight / volume", "Package dimensions", "Target good output", "RFQ source", "First-touch page", "First-touch referrer", "Page language", "Privacy acknowledgement"],
      campaign: "First-touch campaign",
      notes: "Project notes",
      acknowledged: "Confirmed",
    },
    es: {
      subject: "Solicitud RFQ",
      heading: "Nueva solicitud RFQ desde premadepouchmachines.com",
      fields: ["Nombre", "Correo electrónico", "Empresa", "País / región", "Teléfono / WhatsApp", "Máquina de interés", "Producto", "Formato de empaque", "Peso / volumen de llenado", "Dimensiones del empaque", "Producción útil objetivo", "Origen del RFQ", "Página del primer contacto", "Referencia del primer contacto", "Idioma de la página", "Confirmación de privacidad"],
      campaign: "Campaña del primer contacto",
      notes: "Notas del proyecto",
      acknowledged: "Confirmada",
    },
    fr: {
      subject: "Demande RFQ",
      heading: "Nouvelle demande RFQ depuis premadepouchmachines.com",
      fields: ["Nom", "E-mail", "Société", "Pays / région", "Téléphone / WhatsApp", "Machine recherchée", "Produit", "Format du pack", "Poids / volume de remplissage", "Dimensions du pack", "Débit utile cible", "Source du RFQ", "Page du premier contact", "Référent du premier contact", "Langue de la page", "Confirmation de confidentialité"],
      campaign: "Campagne du premier contact",
      notes: "Notes du projet",
      acknowledged: "Confirmée",
    },
    de: {
      subject: "RFQ-Anfrage",
      heading: "Neue RFQ-Anfrage von premadepouchmachines.com",
      fields: ["Name", "E-Mail", "Unternehmen", "Land / Region", "Telefon / WhatsApp", "Maschineninteresse", "Produkt", "Packungsformat", "Füllgewicht / Volumen", "Packungsabmessungen", "Ziel-Gutausstoß", "RFQ-Quelle", "Erstkontaktseite", "Erstkontakt-Referrer", "Seitensprache", "Datenschutzbestätigung"],
      campaign: "Erstkontakt-Kampagne",
      notes: "Projektangaben",
      acknowledged: "Bestätigt",
    },
    pt: {
      subject: "Solicitação RFQ",
      heading: "Nova solicitação RFQ de premadepouchmachines.com",
      fields: ["Nome", "E-mail", "Empresa", "País / região", "Telefone / WhatsApp", "Máquina de interesse", "Produto", "Formato da embalagem", "Peso / volume de envase", "Dimensões da embalagem", "Produção útil alvo", "Origem do RFQ", "Página do primeiro contato", "Referência do primeiro contato", "Idioma da página", "Confirmação de privacidade"],
      campaign: "Campanha do primeiro contato",
      notes: "Notas do projeto",
      acknowledged: "Confirmada",
    },
    ru: {
      subject: "Запрос RFQ",
      heading: "Новый запрос RFQ с premadepouchmachines.com",
      fields: ["Имя", "Эл. почта", "Компания", "Страна / регион", "Телефон / WhatsApp", "Интересующая машина", "Продукт", "Формат упаковки", "Вес / объем дозы", "Размеры упаковки", "Целевой годный выпуск", "Источник RFQ", "Страница первого контакта", "Источник перехода", "Язык страницы", "Подтверждение конфиденциальности"],
      campaign: "Кампания первого контакта",
      notes: "Описание проекта",
      acknowledged: "Подтверждено",
    },
    ar: {
      subject: "طلب عرض RFQ",
      heading: "طلب RFQ جديد من premadepouchmachines.com",
      fields: ["الاسم", "البريد الإلكتروني", "الشركة", "الدولة / المنطقة", "الهاتف / واتساب", "الآلة المطلوبة", "المنتج", "شكل العبوة", "وزن / حجم التعبئة", "أبعاد العبوة", "الإنتاج الجيد المستهدف", "مصدر RFQ", "صفحة الزيارة الأولى", "مصدر الإحالة الأول", "لغة الصفحة", "تأكيد الخصوصية"],
      campaign: "حملة الزيارة الأولى",
      notes: "ملاحظات المشروع",
      acknowledged: "تم التأكيد",
    },
  };

  const COPY_FEEDBACK = {
    en: { copied: "Copied", blocked: "Copy blocked", hint: "Click to copy", short: "Copy" },
    es: { copied: "Copiado", blocked: "Copia bloqueada", hint: "Clic para copiar", short: "Copiar" },
    fr: { copied: "Copié", blocked: "Copie bloquée", hint: "Cliquer pour copier", short: "Copier" },
    de: { copied: "Kopiert", blocked: "Kopieren blockiert", hint: "Zum Kopieren klicken", short: "Kopieren" },
    pt: { copied: "Copiado", blocked: "Cópia bloqueada", hint: "Clique para copiar", short: "Copiar" },
    ru: { copied: "Скопировано", blocked: "Копирование заблокировано", hint: "Нажмите, чтобы скопировать", short: "Копировать" },
    ar: { copied: "تم النسخ", blocked: "تعذر النسخ", hint: "انقر للنسخ", short: "نسخ" },
  };

  const LEGACY_SELECTOR_VALUES = {
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

  function getLanguageCopy(collection) {
    return collection[documentLanguage] || collection.en;
  }

  function storageGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function storageRemove(key) {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Storage can be unavailable in privacy-restricted browsing contexts.
    }
  }

  function parseStoredObject(key) {
    const stored = storageGet(key);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch {
      storageRemove(key);
      return null;
    }
  }

  function truncate(value, maxLength = 500) {
    return String(value || "").trim().slice(0, maxLength);
  }

  function sanitizedDocumentUrl(value = window.location.href) {
    try {
      const url = new URL(value, window.location.href);
      url.search = "";
      url.hash = "";
      return url.toString();
    } catch {
      return "";
    }
  }

  function captureFirstTouch(url) {
    const stored = parseStoredObject(FIRST_TOUCH_KEY);
    if (stored) return stored;

    const firstTouch = {
      page_url: sanitizedDocumentUrl(url),
      page_title: truncate(document.title, 240),
      referrer: document.referrer ? sanitizedDocumentUrl(document.referrer) : "",
      language: truncate(document.documentElement.lang || "en", 16),
    };

    ATTRIBUTION_FIELDS.forEach((field) => {
      firstTouch[field] = truncate(url.searchParams.get(field), 500);
    });

    storageSet(FIRST_TOUCH_KEY, JSON.stringify(firstTouch));
    return firstTouch;
  }

  function normalizeRfqContext(context = {}) {
    return {
      machine: truncate(context.machine, 240),
      product: truncate(context.product, 300),
      source: truncate(context.source, 300),
    };
  }

  function hasRfqContext(context) {
    return Boolean(context?.machine || context?.product || context?.source);
  }

  function saveRfqContext(context) {
    const normalized = normalizeRfqContext(context);
    if (!hasRfqContext(normalized)) return normalized;
    storageSet(RFQ_CONTEXT_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function getRfqContext() {
    return normalizeRfqContext(parseStoredObject(RFQ_CONTEXT_KEY) || {});
  }

  function removeLegacyQueryParameters(url) {
    let changed = false;
    LEGACY_QUERY_FIELDS.forEach((field) => {
      if (url.searchParams.has(field)) {
        url.searchParams.delete(field);
        changed = true;
      }
    });
    if (!changed) return;
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    try {
      window.history.replaceState(window.history.state, "", nextUrl);
    } catch {
      // URL cleanup is a crawl-efficiency enhancement, not a reason to break the page.
    }
  }

  const initialUrl = new URL(window.location.href);
  const initialSearchQuery = initialUrl.searchParams.get("q") || "";
  const firstTouch = captureFirstTouch(initialUrl);
  const legacyRfqContext = normalizeRfqContext({
    machine: initialUrl.searchParams.get("machine"),
    product: initialUrl.searchParams.get("product"),
    source: initialUrl.searchParams.get("source"),
  });
  if (hasRfqContext(legacyRfqContext)) saveRfqContext(legacyRfqContext);
  removeLegacyQueryParameters(initialUrl);

  function emitEvent(eventName, detail = {}) {
    const payload = {
      event: eventName,
      page_path: window.location.pathname,
      language: documentLanguage,
      ...detail,
    };

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
    }

    try {
      document.dispatchEvent(new CustomEvent("ppm:analytics", { detail: payload }));
    } catch {
      // Analytics must never block navigation or form delivery.
    }
  }

  let rfqStartEmitted = false;
  function emitRfqStart(origin) {
    if (rfqStartEmitted) return;
    rfqStartEmitted = true;
    emitEvent("rfq_start", { origin: truncate(origin, 80) });
  }

  function setHeaderState() {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
    mobileRfq?.classList.toggle("is-visible", window.scrollY > 620);
    mobileContactBar?.classList.toggle("is-visible", window.scrollY > 360);
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
      if (event.target instanceof Element && event.target.closest("a")) closeMenu();
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
      if (event.target instanceof Element && event.target.closest("a")) {
        closeLanguageSwitchers();
        closeMenu();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    if (!event.target.closest("[data-language-switcher]")) closeLanguageSwitchers();

    const rfqTrigger = event.target.closest("[data-rfq-context]");
    if (rfqTrigger) {
      saveRfqContext({
        machine: rfqTrigger.dataset.rfqMachine,
        product: rfqTrigger.dataset.rfqProduct,
        source: rfqTrigger.dataset.rfqSource || window.location.pathname,
      });
      emitRfqStart(rfqTrigger.dataset.track || "contextual_rfq");
    }

    const trackedElement = event.target.closest("[data-track]");
    const whatsappLink = event.target.closest('a[href*="wa.me/"], a[href*="whatsapp.com/"]');
    if (whatsappLink) {
      emitEvent("whatsapp_click", {
        placement: truncate(trackedElement?.dataset.track || whatsappLink.className || "link", 100),
      });
    } else if (trackedElement && !trackedElement.matches("[data-copy-email]")) {
      emitEvent("cta_click", { cta: truncate(trackedElement.dataset.track, 100) });
      if (trackedElement.dataset.track?.includes("rfq")) {
        emitRfqStart(trackedElement.dataset.track);
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLanguageSwitchers();
      closeMenu();
    }
  });

  document.querySelectorAll(".spec-tab").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
    button.removeAttribute("aria-selected");

    button.addEventListener("click", () => {
      const dataValues = {
        package: button.dataset.specPackage,
        dosing: button.dataset.specDosing,
        fit: button.dataset.specFit,
        evidence: button.dataset.specEvidence,
      };
      const hasDataValues = Object.values(dataValues).some(Boolean);
      const values = hasDataValues ? dataValues : LEGACY_SELECTOR_VALUES[button.dataset.spec];
      if (!values) return;

      document.querySelectorAll(".spec-tab").forEach((tab) => {
        const isActive = tab === button;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-pressed", String(isActive));
        tab.removeAttribute("aria-selected");
      });

      Object.entries(values).forEach(([field, value]) => {
        const node = document.querySelector(`[data-spec-field="${field}"]`);
        if (node && value) node.textContent = value;
      });

      emitEvent("selector_change", { selection: truncate(button.dataset.spec, 40) });
    });
  });

  function formToObject(formElement) {
    return Object.fromEntries(new FormData(formElement).entries());
  }

  function buildMailto(data) {
    const copy = getLanguageCopy(MAILTO_COPY);
    const [name, email, company, country, phone, machine, product, packageFormat, fill, dimensions, speed, source, page, referrer, language, privacy] = copy.fields;
    const subject = encodeURIComponent(`${copy.subject}: ${data.machine || "Packaging machine"}${data.product ? ` - ${data.product}` : ""}`);
    const campaign = ATTRIBUTION_FIELDS
      .filter((field) => data[field])
      .map((field) => `${field}: ${data[field]}`);
    const body = encodeURIComponent(
      [
        copy.heading,
        "",
        `${name}: ${data.name || ""}`,
        `${email}: ${data.email || ""}`,
        `${company}: ${data.company || ""}`,
        `${country}: ${data.country || ""}`,
        `${phone}: ${data.phone || ""}`,
        `${machine}: ${data.machine || ""}`,
        `${product}: ${data.product || ""}`,
        `${packageFormat}: ${data.package || ""}`,
        `${fill}: ${data.fill || ""}`,
        `${dimensions}: ${data.dimensions || ""}`,
        `${speed}: ${data.speed || ""}`,
        `${source}: ${data.rfq_source || ""}`,
        `${page}: ${data.page_url || ""}`,
        `${referrer}: ${data.referrer || ""}`,
        `${language}: ${data.language || documentLanguage}`,
        `${privacy}: ${data.privacy_acknowledged === "yes" ? copy.acknowledged : ""}`,
        ...(campaign.length ? ["", `${copy.campaign}:`, ...campaign] : []),
        "",
        `${copy.notes}:`,
        data.message || "",
      ].join("\n"),
    );

    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  async function copyTextToClipboard(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Fall through to the legacy copy path.
      }
    }

    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.top = "-999px";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    if (!copied) throw new Error("Clipboard copy failed");
  }

  function setCopyFeedback(trigger, state) {
    const copy = getLanguageCopy(COPY_FEEDBACK);
    const status = trigger.querySelector("[data-copy-status]");
    trigger.classList.toggle("is-copied", state === "copied");

    if (status) {
      if (!status.dataset.copyOriginalText) status.dataset.copyOriginalText = status.textContent;
      status.textContent = copy[state];
      return;
    }

    if (!trigger.dataset.copyOriginalText) trigger.dataset.copyOriginalText = trigger.textContent;
    trigger.textContent = copy[state];
  }

  function resetCopyFeedback(trigger) {
    const status = trigger.querySelector("[data-copy-status]");
    trigger.classList.remove("is-copied");

    if (status) {
      status.textContent = status.dataset.copyOriginalText || (status.classList.contains("copy-hint") ? getLanguageCopy(COPY_FEEDBACK).hint : getLanguageCopy(COPY_FEEDBACK).short);
      return;
    }

    if (trigger.dataset.copyOriginalText) trigger.textContent = trigger.dataset.copyOriginalText;
  }

  emailCopyTriggers.forEach((trigger) => {
    trigger.addEventListener("click", async (event) => {
      const email = trigger.dataset.copyEmail || CONTACT_EMAIL;
      event.preventDefault();

      try {
        await copyTextToClipboard(email);
        setCopyFeedback(trigger, "copied");
        emitEvent("email_copy", { outcome: "success" });
        window.setTimeout(() => resetCopyFeedback(trigger), 1600);
      } catch {
        setCopyFeedback(trigger, "blocked");
        emitEvent("email_copy", { outcome: "blocked" });
        window.setTimeout(() => resetCopyFeedback(trigger), 2200);
      }
    });
  });

  function setFormField(name, value) {
    if (!form || !value) return;
    const field = form.elements.namedItem(name);
    if (!field || typeof field.value === "undefined") return;
    field.value = value;
  }

  function applyRfqContext() {
    if (!form) return;
    const context = getRfqContext();
    const machineField = form.elements.namedItem("machine");
    const productField = form.elements.namedItem("product");

    if (context.machine && machineField && !machineField.value) {
      if (machineField instanceof HTMLSelectElement) {
        const existing = [...machineField.options].find(
          (option) => option.value === context.machine || option.textContent.trim() === context.machine,
        );
        if (existing) {
          machineField.value = existing.value;
        } else {
          machineField.add(new Option(context.machine, context.machine, true, true), 0);
          machineField.value = context.machine;
        }
      } else {
        machineField.value = context.machine;
      }
    }

    if (context.product && productField && !productField.value) productField.value = context.product;
    setFormField("rfq_source", context.source);
  }

  function applyAttribution() {
    if (!form) return;
    ["page_url", "page_title", "referrer", "language", ...ATTRIBUTION_FIELDS].forEach((field) => {
      setFormField(field, firstTouch[field]);
    });
  }

  applyRfqContext();
  applyAttribution();

  function normalizeSearchTerm(value) {
    return String(value || "").trim().toLocaleLowerCase(document.documentElement.lang || undefined);
  }

  function applyCatalogSearch(query) {
    if (!catalogSearchInput || !catalogCards.length) return;
    const term = normalizeSearchTerm(query);
    let visible = 0;

    catalogCards.forEach((card) => {
      const haystack = normalizeSearchTerm(card.dataset.search || card.textContent);
      const match = !term || haystack.includes(term);
      card.hidden = !match;
      if (match) visible += 1;
    });

    if (catalogSearchStatus) {
      const copy = getLanguageCopy(SEARCH_COPY);
      catalogSearchStatus.textContent = term
        ? copy.machineMatches(visible, query.trim())
        : copy.machines(catalogCards.length);
    }
  }

  function applyTopicSearch(query) {
    if (!topicSearchInput || !topicCards.length) return;
    const term = normalizeSearchTerm(query);
    let visible = 0;

    topicCards.forEach((card) => {
      const haystack = normalizeSearchTerm(card.dataset.search || card.textContent);
      const match = !term || haystack.includes(term);
      card.hidden = !match;
      if (match) visible += 1;
    });

    if (topicSearchStatus) {
      const copy = getLanguageCopy(SEARCH_COPY);
      topicSearchStatus.textContent = term
        ? copy.topicMatches(visible, query.trim())
        : copy.topics(topicCards.length);
    }
  }

  if (catalogSearch && catalogSearchInput) {
    catalogSearchInput.value = initialSearchQuery;
    applyCatalogSearch(initialSearchQuery);
    catalogSearchInput.addEventListener("input", () => applyCatalogSearch(catalogSearchInput.value));
    catalogSearch.addEventListener("submit", (event) => {
      event.preventDefault();
      applyCatalogSearch(catalogSearchInput.value);
    });
  }

  if (topicSearch && topicSearchInput) {
    topicSearchInput.value = initialSearchQuery;
    applyTopicSearch(initialSearchQuery);
    topicSearchInput.addEventListener("input", () => applyTopicSearch(topicSearchInput.value));
    topicSearch.addEventListener("submit", (event) => {
      event.preventDefault();
      applyTopicSearch(topicSearchInput.value);
    });
  }

  if (form && statusEl) {
    form.hidden = false;
    const submitButton = form.querySelector("button[type='submit']");
    const fallbackCopy = getLanguageCopy(FORM_FALLBACK_COPY);
    const formCopy = {
      idle: form.dataset.labelIdle || submitButton?.textContent || fallbackCopy.idle,
      sending: form.dataset.labelSending || fallbackCopy.sending,
      success: form.dataset.statusSuccess || fallbackCopy.success,
      mailto: form.dataset.statusMailto || fallbackCopy.mailto,
      failed: form.dataset.statusFailed || fallbackCopy.failed,
      blocked: form.dataset.statusBlocked || fallbackCopy.blocked,
    };
    const formReadyAt = Date.now();
    let invalidEventPending = false;

    form.addEventListener("focusin", () => emitRfqStart("form_interaction"), { once: true });
    form.addEventListener(
      "invalid",
      () => {
        statusEl.textContent = formCopy.blocked;
        if (!invalidEventPending) {
          invalidEventPending = true;
          emitEvent("rfq_blocked", { reason: "validation" });
          window.setTimeout(() => {
            invalidEventPending = false;
          }, 250);
        }
      },
      true,
    );

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      emitRfqStart("form_submit");

      if (!form.checkValidity()) {
        statusEl.textContent = formCopy.blocked;
        form.reportValidity();
        return;
      }

      const honeypot = form.elements.namedItem("website");
      if ((honeypot?.value || "").trim() || Date.now() - formReadyAt < MIN_FORM_DWELL_MS) {
        statusEl.textContent = formCopy.blocked;
        emitEvent("rfq_blocked", { reason: honeypot?.value ? "honeypot" : "minimum_dwell" });
        return;
      }

      applyRfqContext();
      applyAttribution();
      const data = formToObject(form);
      delete data.website;
      ["page_url", "page_title", "referrer", "language", ...ATTRIBUTION_FIELDS].forEach((field) => {
        if (!data[field]) data[field] = firstTouch[field] || "";
      });
      const context = getRfqContext();
      if (!data.rfq_source) data.rfq_source = context.source;

      statusEl.textContent = "";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = formCopy.sending;
      }

      try {
        if (LEAD_ENDPOINT) {
          emitEvent("rfq_submit_attempt", { delivery: "endpoint" });
          const response = await fetch(LEAD_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              source: "premadepouchmachines.com",
              first_touch: firstTouch,
              rfq_context: context,
            }),
          });

          if (!response.ok) throw new Error(`Lead endpoint returned ${response.status}`);

          let responseData = {};
          try {
            const responseText = await response.text();
            responseData = responseText ? JSON.parse(responseText) : {};
          } catch {
            responseData = {};
          }
          if (responseData.success === false || responseData.ok === false) {
            throw new Error("Lead endpoint did not confirm delivery");
          }

          const reference = truncate(
            responseData.reference || responseData.lead_id || responseData.leadId || responseData.id,
            120,
          );
          statusEl.textContent = `${formCopy.success}${reference ? ` [ID: ${reference}]` : ""}`;
          emitEvent("rfq_submit_success", { delivery: "endpoint", reference_present: Boolean(reference) });
          form.reset();
          storageRemove(RFQ_CONTEXT_KEY);
          applyAttribution();
          return;
        }

        window.location.href = buildMailto(data);
        statusEl.textContent = formCopy.mailto;
        emitEvent("rfq_mailto_fallback", { reason: "endpoint_not_configured" });
      } catch {
        window.location.href = buildMailto(data);
        statusEl.textContent = formCopy.failed;
        emitEvent("rfq_submit_failed", { delivery: "endpoint" });
        emitEvent("rfq_mailto_fallback", { reason: "endpoint_failed" });
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = formCopy.idle;
        }
      }
    });
  }
})();
