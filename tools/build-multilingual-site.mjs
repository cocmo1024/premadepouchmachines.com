import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MACHINE_PAGES, STATIC_SEO_PAGES } from "../content/seo-machines.mjs";
import { localizedMachine } from "../content/machine-localization.mjs";
import {
  BASE_URL,
  COPY,
  LANGUAGES,
  LASTMOD,
  PILLAR_PAGES,
  absoluteUrl,
  categoryFor,
  copyFor,
  localizedPath,
  normalizePath,
} from "../content/i18n.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSET_VERSION = "20260618g";
const HERO_IMAGE = "public/assets/brochure/rotary-premade-line-hero.png";
const DEFAULT_SOCIAL_IMAGE = "public/assets/brochure/rotary-premade-line.jpg";
const DISALLOWED = [
  ["Q", "i", "n", "d", "i", "a", "n"].join(""),
  String.fromCharCode(0x94a6, 0x5178),
  ["Q", "D", "-"].join(""),
];

const NON_DEFAULT_LANGUAGES = LANGUAGES.filter((lang) => lang.code !== "en");
const REMOVED_LOCALE_DIRS = [String.fromCharCode(0x7a, 0x68)];
const ROUTES = [
  ...STATIC_SEO_PAGES,
  ...MACHINE_PAGES.map((item) => ({
    path: `/machines/${item.slug}.html`,
    priority: "0.78",
    changefreq: "monthly",
  })),
];

const HOME_CARDS = [
  { key: "premade", metric: "8-station", options: ["scale", "auger", "pump", "nitrogen"] },
  { key: "vffs", metric: "10-80 bags/min", options: ["multi-head scale", "auger", "roll film", "coder"] },
  { key: "teaCoffee", metric: "1-15g", options: ["ultrasonic", "outer envelope", "tag", "nitrogen"] },
  { key: "sachet", metric: "4-12 lanes", options: ["granule", "powder", "liquid", "stick pack"] },
  { key: "specialty", metric: "vacuum / flow pack", options: ["shrink", "overwrap", "candy", "rice"] },
  { key: "filling", metric: "5-5000g", options: ["cup", "capsule", "carton", "case"] },
];

const GUIDE_CARDS = [
  {
    title: "Start with product behavior",
    text: "Free-flowing granules, dusty powders, viscous sauces, fragile tea, hardware kits and regular solid goods each need a different dosing and sealing strategy.",
  },
  {
    title: "Then choose package economics",
    text: "Finished pouches support premium retail appearance. Roll film VFFS and sachet machines usually reduce film cost. Flow wrap and shrink machines fit regular solids and bundles.",
  },
  {
    title: "Confirm the automation boundary",
    text: "A single machine can solve primary packing. A production line adds feeding, weighing, coding, checking, cartoning, case forming, sealing and conveyor logic.",
  },
  {
    title: "Build the RFQ around evidence",
    text: "Useful quotations need product photos, fill weight, pouch or film samples, target output, voltage, compressed air, footprint and downstream packing requirements.",
  },
];

const APPLICATION_CLUSTERS = [
  {
    title: "Food, snacks and grains",
    text: "Premade pouch, VFFS, vacuum and filling systems for rice, beans, roasted nuts, frozen food, puffed food, biscuits, seeds and retail dry food packs.",
  },
  {
    title: "Powder and seasoning",
    text: "Auger, screw feeding, dust control and powder filling choices for flour, milk powder, protein powder, seasoning, solid beverages and chemical powders.",
  },
  {
    title: "Tea, coffee and beverage packs",
    text: "Triangle tea bags, thread-and-tag tea bags, drip coffee inner/outer envelopes and compact beverage packs with ultrasonic sealing and small-dose filling.",
  },
  {
    title: "Liquid, sauce and paste",
    text: "Pump-filled sachets, premade pouches, PE film packs, stand-up pouch capping systems and bottle filling lines for liquids, sauces, oils and daily chemical products.",
  },
  {
    title: "Regular solids and secondary packs",
    text: "Flow wrapping, shrink packing, transparent film overwrapping, cartoning, case forming and case sealing for retail multipacks and logistics-ready cartons.",
  },
  {
    title: "Hardware and mixed small parts",
    text: "Counting, multi-material filling, screw packing and kit packaging pages cover quantity control, mixed accessories and small industrial parts.",
  },
];

const SPEC_REFERENCE_LINES = [
  ["Premade pouch systems", "Finished pouches, W100-350mm and L150-480mm reference range, up to 60 bags/min on selected small formats."],
  ["VFFS roll-film systems", "Bag size around L80-450mm and W80-350mm by frame, electronic scale, cup, auger or pump dosing."],
  ["Sachet and stick pack", "Small-dose formats from 1-100g reference range, single lane, double line, multi-line and round-corner options."],
  ["Tea and drip coffee", "1-15g beverage formats with ultrasonic sealing, outer envelopes, thread/tag, nitrogen and small-dose accuracy choices."],
  ["Flow wrap and shrink", "Top-feed, bottom-feed, reciprocating, pillow line and shrink configurations for regular solids and grouped packs."],
  ["Filling and downstream lines", "Semi-auto fillers through full granule, powder, liquid, cartoning and case-packing production lines."],
];

const HOME_DETAIL_COPY = {
  en: {
    guideCards: GUIDE_CARDS,
    applicationClusters: APPLICATION_CLUSTERS,
    specReferenceLines: SPEC_REFERENCE_LINES,
    form: ["Name", "Email", "Company", "Machine interest", "Product", "Target output", "Project notes"],
  },
  es: {
    guideCards: [
      ["Empiece por el producto", "Gránulos, polvos, salsas, té, kits y sólidos regulares requieren dosificación, sellado y manejo distintos."],
      ["Defina la economía del empaque", "El pouch terminado mejora la presencia en anaquel; VFFS y sachet suelen reducir el costo de film."],
      ["Fije el límite de automatización", "Una máquina resuelve el empaque primario; una línea añade alimentación, control, cartón, cajas y transporte."],
      ["Prepare un RFQ con evidencia", "Buenas cotizaciones necesitan fotos, muestras, peso, salida objetivo, voltaje, aire y espacio disponible."],
    ],
    applicationClusters: [
      ["Alimentos, snacks y granos", "Sistemas premade pouch, VFFS, vacío y llenado para arroz, frijoles, nueces, congelados, semillas y packs retail."],
      ["Polvos y sazonadores", "Opciones con sinfín, alimentación por tornillo y control de polvo para harina, leche en polvo, proteína, condimentos y químicos."],
      ["Té, café y bebidas", "Bolsas piramidales, té con hilo, drip coffee y sobres con sellado ultrasónico y dosificación pequeña."],
      ["Líquidos, salsas y pastas", "Sachets con bomba, pouches, PE film, tapado de pouch y líneas de llenado para aceites, salsas y químicos diarios."],
      ["Sólidos regulares y empaque secundario", "Flow pack, shrink, sobreenvoltura, cartón y cajas para multipacks retail y logística."],
      ["Hardware y piezas mixtas", "Conteo, multi-material, tornillos y kits con control de cantidad y mezcla de accesorios."],
    ],
    specReferenceLines: [
      ["Sistemas premade pouch", "Pouches terminados, rango W100-350mm y L150-480mm, hasta 60 bolsas/min en formatos pequeños seleccionados."],
      ["VFFS con roll film", "Tamaños aprox. L80-450mm y W80-350mm; báscula, vaso, sinfín o bomba según producto."],
      ["Sachet y stick pack", "Dosis pequeñas 1-100g; una línea, doble línea, multi-línea y esquinas redondas."],
      ["Té y drip coffee", "Formatos 1-15g con ultrasonido, sobre exterior, hilo/etiqueta, nitrógeno y precisión de dosis."],
      ["Flow pack y shrink", "Alimentación superior/inferior, movimiento reciprocante, pillow line y shrink para sólidos y grupos."],
      ["Llenado y final de línea", "Desde llenadoras semi-auto hasta líneas completas de gránulo, polvo, líquido, cartón y cajas."],
    ],
    form: ["Nombre", "Email", "Empresa", "Máquina de interés", "Producto", "Producción objetivo", "Notas del proyecto"],
  },
  fr: {
    guideCards: [
      ["Commencer par le produit", "Granulés, poudres, sauces, thé, kits et solides réguliers imposent des choix de dosage, scellage et convoyage."],
      ["Définir l'économie du pack", "Le sachet préformé valorise le rayon; VFFS et sachet réduisent souvent le coût du film."],
      ["Fixer le périmètre d'automation", "Une machine couvre le primaire; une ligne ajoute alimentation, contrôle, cartonnage, caisse et convoyage."],
      ["Construire le RFQ sur preuves", "Un devis utile demande photos, échantillons, poids, cadence, tension, air et espace disponible."],
    ],
    applicationClusters: [
      ["Aliments, snacks et céréales", "Systèmes pouch, VFFS, vide et remplissage pour riz, haricots, noix, surgelés, graines et packs retail."],
      ["Poudres et assaisonnements", "Vis sans fin, alimentation par vis et contrôle poussière pour farine, lait, protéines, épices et poudres chimiques."],
      ["Thé, café et boissons", "Sachets pyramide, fil/étiquette, drip coffee et enveloppes avec ultrason et petites doses précises."],
      ["Liquides, sauces et pâtes", "Sachets pompe, pouches, film PE, bouchage et lignes de remplissage pour huiles, sauces et produits chimiques courants."],
      ["Solides réguliers et secondaire", "Flow pack, shrink, suremballage, cartonnage et caisses pour multipacks retail et logistique."],
      ["Quincaillerie et pièces mixtes", "Comptage, multi-matière, visserie et kits avec contrôle quantité et accessoires mélangés."],
    ],
    specReferenceLines: [
      ["Systèmes pouch préformé", "Sachets finis, plage W100-350mm et L150-480mm, jusqu'à 60 sachets/min sur petits formats sélectionnés."],
      ["VFFS à film en rouleau", "Formats env. L80-450mm et W80-350mm; balance, godet, vis ou pompe selon produit."],
      ["Sachet et stick pack", "Petites doses 1-100g; une voie, double voie, multi-voies et coins arrondis."],
      ["Thé et drip coffee", "Formats 1-15g avec ultrason, enveloppe extérieure, fil/étiquette, azote et précision de dosage."],
      ["Flow pack et shrink", "Alimentation haut/bas, mouvement alternatif, ligne pillow et shrink pour solides et lots."],
      ["Remplissage et aval", "De la remplisseuse semi-auto aux lignes granulé, poudre, liquide, cartonnage et caisse."],
    ],
    form: ["Nom", "Email", "Entreprise", "Machine recherchée", "Produit", "Cadence cible", "Notes projet"],
  },
  de: {
    guideCards: [
      ["Mit dem Produkt beginnen", "Granulat, Pulver, Saucen, Tee, Kits und reguläre Feststoffe brauchen unterschiedliche Dosier-, Siegel- und Handlingkonzepte."],
      ["Packökonomie festlegen", "Fertigbeutel stärken die Regalwirkung; VFFS und Sachet senken oft die Folienkosten."],
      ["Automationsgrenze klären", "Eine Maschine löst Primärverpackung; eine Linie ergänzt Zuführung, Kontrolle, Karton, Case und Fördertechnik."],
      ["RFQ mit Fakten erstellen", "Gute Angebote benötigen Fotos, Muster, Gewicht, Zielleistung, Spannung, Druckluft und verfügbare Fläche."],
    ],
    applicationClusters: [
      ["Lebensmittel, Snacks und Getreide", "Pouch-, VFFS-, Vakuum- und Füllsysteme für Reis, Bohnen, Nüsse, Tiefkühlware, Saaten und Retail-Packs."],
      ["Pulver und Gewürze", "Schnecke, Zuführung und Staubkontrolle für Mehl, Milchpulver, Protein, Gewürze und chemische Pulver."],
      ["Tee, Kaffee und Getränke", "Pyramidenbeutel, Faden/Etikett, Drip Coffee und Umschläge mit Ultraschall und Kleindosierung."],
      ["Flüssigkeiten, Saucen und Pasten", "Pumpensachets, Pouches, PE-Film, Verschluss und Fülllinien für Öle, Saucen und Alltagschemie."],
      ["Regelmäßige Feststoffe und Sekundärpack", "Flowpack, Shrink, Overwrapping, Kartonierung und Cases für Retail-Multipacks und Logistik."],
      ["Hardware und gemischte Kleinteile", "Zählen, Multi-Material, Schrauben und Kits mit Mengen- und Zubehörkontrolle."],
    ],
    specReferenceLines: [
      ["Premade-Pouch-Systeme", "Fertigbeutel, Referenz W100-350mm und L150-480mm, bis 60 Beutel/min auf ausgewählten Kleinformaten."],
      ["VFFS Rollenfilm", "Format ca. L80-450mm und W80-350mm; Waage, Becher, Schnecke oder Pumpe je nach Produkt."],
      ["Sachet und Stickpack", "Kleindosen 1-100g; einbahnig, zweibahnig, mehrbahnig und Rund-Ecken-Optionen."],
      ["Tee und Drip Coffee", "1-15g Formate mit Ultraschall, Außenumschlag, Faden/Etikett, Stickstoff und Dosiergenauigkeit."],
      ["Flowpack und Shrink", "Top-/Bottom-Feed, Hubbewegung, Pillow-Linie und Shrink für Feststoffe und Gruppen."],
      ["Füllung und End-of-Line", "Von Semi-Auto-Füllern bis zu Granulat-, Pulver-, Flüssig-, Kartonier- und Case-Linien."],
    ],
    form: ["Name", "E-Mail", "Unternehmen", "Maschineninteresse", "Produkt", "Zielausstoß", "Projektnotizen"],
  },
  pt: {
    guideCards: [
      ["Comece pelo produto", "Grânulos, pós, molhos, chá, kits e sólidos regulares exigem dosagem, selagem e manuseio diferentes."],
      ["Defina a economia da embalagem", "Pouch pronto valoriza o varejo; VFFS e sachê normalmente reduzem custo de filme."],
      ["Fixe o limite de automação", "Uma máquina resolve a embalagem primária; uma linha adiciona alimentação, controle, cartucho, caixa e transporte."],
      ["Monte o RFQ com evidências", "Boas cotações precisam de fotos, amostras, peso, produção alvo, tensão, ar e área disponível."],
    ],
    applicationClusters: [
      ["Alimentos, snacks e grãos", "Sistemas pouch, VFFS, vácuo e envase para arroz, feijão, castanhas, congelados, sementes e packs de varejo."],
      ["Pós e temperos", "Rosca, alimentação por parafuso e controle de pó para farinha, leite em pó, proteína, temperos e químicos."],
      ["Chá, café e bebidas", "Sachês piramidais, fio/etiqueta, drip coffee e envelopes com ultrassom e pequenas doses precisas."],
      ["Líquidos, molhos e pastas", "Sachês com bomba, pouches, filme PE, tampas e linhas de envase para óleos, molhos e químicos diários."],
      ["Sólidos regulares e secundário", "Flow pack, shrink, sobreenvoltura, cartucho e caixas para multipacks e logística."],
      ["Hardware e peças mistas", "Contagem, multi-material, parafusos e kits com controle de quantidade e acessórios mistos."],
    ],
    specReferenceLines: [
      ["Sistemas premade pouch", "Pouches prontos, referência W100-350mm e L150-480mm, até 60 bolsas/min em pequenos formatos selecionados."],
      ["VFFS com filme em bobina", "Formato aprox. L80-450mm e W80-350mm; balança, copo, rosca ou bomba por produto."],
      ["Sachê e stick pack", "Pequenas doses 1-100g; uma linha, dupla linha, multilinhas e cantos arredondados."],
      ["Chá e drip coffee", "Formatos 1-15g com ultrassom, envelope externo, fio/etiqueta, nitrogênio e precisão."],
      ["Flow pack e shrink", "Alimentação superior/inferior, movimento alternado, linha pillow e shrink para sólidos e grupos."],
      ["Envase e final de linha", "De envasadoras semi-auto a linhas de grânulo, pó, líquido, cartucho e caixas."],
    ],
    form: ["Nome", "Email", "Empresa", "Máquina de interesse", "Produto", "Produção alvo", "Notas do projeto"],
  },
  ru: {
    guideCards: [
      ["Начните с продукта", "Гранулы, порошки, соусы, чай, наборы и твердые изделия требуют разных решений по дозированию, запайке и подаче."],
      ["Определите экономику упаковки", "Готовый пакет усиливает вид на полке; VFFS и саше часто снижают расход пленки."],
      ["Зафиксируйте границу автоматизации", "Одна машина закрывает первичную упаковку; линия добавляет подачу, контроль, короб, кейс и транспорт."],
      ["Соберите RFQ на фактах", "Для точного предложения нужны фото, образцы, вес дозы, целевая скорость, напряжение, воздух и площадь."],
    ],
    applicationClusters: [
      ["Еда, снеки и зерновые", "Pouch, VFFS, вакуум и фасовка для риса, бобов, орехов, заморозки, семян и розничных пакетов."],
      ["Порошки и специи", "Шнек, винтовая подача и пылеудаление для муки, молока, протеина, специй и химических порошков."],
      ["Чай, кофе и напитки", "Пирамидальные пакеты, нить/ярлык, drip coffee и конверты с ультразвуком и малой дозой."],
      ["Жидкости, соусы и пасты", "Саше с насосом, pouches, PE-пленка, укупорка и линии розлива для масел, соусов и бытовой химии."],
      ["Регулярные твердые продукты", "Flow pack, shrink, overwrap, картонатор и короба для retail multipack и логистики."],
      ["Метизы и смешанные детали", "Счет, multi-material, винты и наборы с контролем количества и смешанных аксессуаров."],
    ],
    specReferenceLines: [
      ["Системы premade pouch", "Готовые пакеты, ориентир W100-350mm и L150-480mm, до 60 пакетов/мин на малых форматах."],
      ["VFFS с рулонной пленкой", "Размер около L80-450mm и W80-350mm; весы, стакан, шнек или насос по продукту."],
      ["Саше и stick pack", "Малые дозы 1-100g; одна линия, двойная линия, мультилиния и круглые углы."],
      ["Чай и drip coffee", "Форматы 1-15g с ультразвуком, внешним конвертом, нитью/ярлыком, азотом и точностью."],
      ["Flow pack и shrink", "Верхняя/нижняя подача, возвратно-поступательное движение, pillow line и shrink для твердых продуктов."],
      ["Фасовка и конец линии", "От полуавтоматических дозаторов до линий гранул, порошков, жидкостей, картонов и коробов."],
    ],
    form: ["Имя", "Email", "Компания", "Интересующая машина", "Продукт", "Целевая скорость", "Заметки проекта"],
  },
  ar: {
    guideCards: [
      ["ابدأ من المنتج", "الحبيبات والمساحيق والصلصات والشاي والأطقم والمواد الصلبة تحتاج جرعات ولحام ومناولة مختلفة."],
      ["حدد اقتصاد العبوة", "الكيس الجاهز يعزز مظهر البيع، بينما VFFS والساشيه يخفضان غالباً تكلفة الفيلم."],
      ["حدد مستوى الأتمتة", "آلة واحدة تغطي التعبئة الأولية، والخط يضيف التغذية والفحص والكرتنة والصناديق والنقل."],
      ["ابن RFQ على بيانات", "العرض الدقيق يحتاج صوراً، عينات، وزن تعبئة، إنتاجية، جهد، هواء مضغوط ومساحة متاحة."],
    ],
    applicationClusters: [
      ["الأغذية والسناكس والحبوب", "أنظمة pouch وVFFS والفاكيوم والتعبئة للأرز، البقول، المكسرات، المجمدات، البذور وعبوات التجزئة."],
      ["المساحيق والتوابل", "لولب، تغذية بالبرغي وتحكم بالغبار للدقيق، الحليب، البروتين، التوابل والمساحيق الكيميائية."],
      ["الشاي والقهوة والمشروبات", "أكياس هرمية، خيط/بطاقة، drip coffee وأظرف مع لحام فوق صوتي وجرعات صغيرة دقيقة."],
      ["السوائل والصلصات والمعاجين", "ساشيه بمضخة، pouches، فيلم PE، أغطية وخطوط تعبئة للزيوت والصلصات والمواد اليومية."],
      ["مواد صلبة وتغليف ثانوي", "Flow pack وshrink وoverwrap والكرتنة والصناديق لعبوات التجزئة واللوجستيات."],
      ["المعادن والقطع المختلطة", "عد، multi-material، براغي وأطقم مع تحكم في الكمية والملحقات المختلطة."],
    ],
    specReferenceLines: [
      ["أنظمة premade pouch", "أكياس جاهزة، مرجع W100-350mm وL150-480mm، حتى 60 كيس/دقيقة في بعض الأحجام الصغيرة."],
      ["VFFS بفيلم رول", "حجم تقريبي L80-450mm وW80-350mm؛ ميزان، كوب، لولب أو مضخة حسب المنتج."],
      ["ساشيه وstick pack", "جرعات صغيرة 1-100g؛ خط واحد، خط مزدوج، خطوط متعددة وخيار الزوايا الدائرية."],
      ["الشاي وdrip coffee", "أحجام 1-15g مع لحام فوق صوتي، ظرف خارجي، خيط/بطاقة، نيتروجين ودقة جرعة."],
      ["Flow pack وshrink", "تغذية علوية/سفلية، حركة ترددية، خط pillow وshrink للمواد الصلبة والمجموعات."],
      ["التعبئة ونهاية الخط", "من آلات نصف أوتوماتيكية إلى خطوط حبيبات، مساحيق، سوائل، كرتنة وصناديق."],
    ],
    form: ["الاسم", "البريد الإلكتروني", "الشركة", "الآلة المطلوبة", "المنتج", "الإنتاجية المطلوبة", "ملاحظات المشروع"],
  },
};

const PILLAR_TEXT = {
  premade: {
    en: ["Rotary premade pouch systems for stand-up pouches, zipper pouches and shaped bags.", "Best for retail packs where pouch appearance and flexible dosing matter."],
    es: ["Sistemas rotativos para pouches stand-up, zipper y bolsas con forma.", "Ideales para envases retail donde la apariencia y la dosificación flexible importan."],
    fr: ["Systèmes rotatifs pour sachets stand-up, zippés et formes spéciales.", "Adaptés aux packs retail où l'apparence et le dosage flexible sont essentiels."],
    de: ["Rotative Systeme für Standbodenbeutel, Zipper-Beutel und Formbeutel.", "Ideal für Retail-Packs mit hoher Beuteloptik und flexibler Dosierung."],
    pt: ["Sistemas rotativos para pouches stand-up, zipper e formatos especiais.", "Indicados para embalagens de varejo com aparência premium e dosagem flexível."],
    ru: ["Ротационные системы для stand-up пакетов, zipper-пакетов и фигурных форматов.", "Подходят для розничной упаковки, где важны внешний вид и гибкое дозирование."],
    ar: ["أنظمة دوارة للأكياس القائمة وأكياس السحاب والأشكال الخاصة.", "مناسبة لعبوات البيع بالتجزئة عندما يكون الشكل والجرعات المرنة مهمين."],
  },
  vffs: {
    en: ["Roll-film vertical form fill seal systems for snacks, powders, frozen food and granules.", "Use when film economy, pillow bags and high-throughput commodity packing are priorities."],
    es: ["Sistemas verticales VFFS con roll film para snacks, polvos, congelados y gránulos.", "Adecuados cuando importan el costo del film, bolsas tipo almohada y alta producción."],
    fr: ["Systèmes VFFS à film en rouleau pour snacks, poudres, surgelés et granulés.", "À choisir pour l'économie de film, les sachets coussin et les cadences élevées."],
    de: ["Vertikale VFFS-Systeme mit Rollenfilm für Snacks, Pulver, Tiefkühlkost und Granulate.", "Geeignet bei Filmökonomie, Kissenbeuteln und hohem Durchsatz."],
    pt: ["Sistemas VFFS com filme em bobina para snacks, pós, congelados e grânulos.", "Use quando economia de filme, pillow bag e alta produção forem prioridades."],
    ru: ["Вертикальные VFFS-системы с рулонной пленкой для снеков, порошков, заморозки и гранул.", "Выбирайте для экономии пленки, pillow bag и высокой производительности."],
    ar: ["أنظمة VFFS بفيلم رول للوجبات الخفيفة والمساحيق والمجمدات والحبيبات.", "اختيار مناسب عند أهمية اقتصاد الفيلم وأكياس الوسادة والإنتاج العالي."],
  },
  teaCoffee: {
    en: ["Dedicated tea and coffee machines for triangle bags, drip coffee and inner/outer envelopes.", "Built around aroma protection, tag/thread handling and clean small-dose sealing."],
    es: ["Máquinas para té y café: bolsas piramidales, drip coffee y sobres internos/externos.", "Diseñadas para aroma, etiqueta/hilo y sellado limpio de dosis pequeñas."],
    fr: ["Machines dédiées au thé et café: sachets pyramide, drip coffee et enveloppes.", "Conçues pour l'arôme, étiquette/fil et scellage propre de petites doses."],
    de: ["Spezialmaschinen für Tee und Kaffee: Pyramidenbeutel, Drip Coffee und Innen/Außenbeutel.", "Ausgelegt auf Aromaschutz, Tag/Faden und saubere Kleindosierung."],
    pt: ["Máquinas para chá e café: sachês piramidais, drip coffee e envelopes internos/externos.", "Focadas em aroma, etiqueta/fio e selagem limpa de pequenas doses."],
    ru: ["Машины для чая и кофе: пирамидальные пакетики, drip coffee и внутренние/внешние пакеты.", "Ориентированы на аромат, ярлык/нить и чистую запайку малых доз."],
    ar: ["ماكينات للشاي والقهوة: أكياس هرمية، قهوة مقطرة وأكياس داخلية/خارجية.", "مصممة لحماية النكهة والتعامل مع الخيط والبطاقة ولحام الجرعات الصغيرة."],
  },
  sachet: {
    en: ["Sachet, stick pack and multi-lane systems for powder, granule, liquid and sauce.", "Useful for high-SKU small-dose products and high-output parallel lanes."],
    es: ["Sistemas sachet, stick pack y multilínea para polvo, gránulo, líquido y salsa.", "Útiles para dosis pequeñas, muchos SKU y producción paralela."],
    fr: ["Systèmes sachet, stick pack et multilignes pour poudre, granulé, liquide et sauce.", "Adaptés aux petites doses, nombreux SKU et cadences parallèles."],
    de: ["Sachet-, Stickpack- und Mehrbahn-Systeme für Pulver, Granulat, Flüssigkeit und Sauce.", "Für kleine Dosierungen, viele SKU und parallele Hochleistung."],
    pt: ["Sistemas sachê, stick pack e multilinhas para pó, grânulo, líquido e molho.", "Úteis para pequenas doses, muitos SKUs e produção paralela."],
    ru: ["Саше, stick pack и многоручьевые системы для порошков, гранул, жидкостей и соусов.", "Подходят для малых доз, большого числа SKU и высокой параллельной выработки."],
    ar: ["أنظمة ساشيه وستيك باك ومتعددة المسارات للمسحوق والحبيبات والسوائل والصلصات.", "مناسبة للجرعات الصغيرة وعدد كبير من المنتجات والإنتاج المتوازي."],
  },
  specialty: {
    en: ["Vacuum, flow wrapping, shrink sealing and overwrapping for specialty product protection.", "Covers rice bricks, candy, regular objects, boxed products and secondary retail packs."],
    es: ["Vacío, flow pack, termoencogible y sobreenvoltura para protección especial.", "Cubre arroz compacto, dulces, objetos regulares, cajas y packs retail secundarios."],
    fr: ["Vide, flow pack, shrink et suremballage pour protection produit spécialisée.", "Couvre riz compact, confiserie, objets réguliers, boîtes et packs retail secondaires."],
    de: ["Vakuum, Flowpack, Schrumpfen und Overwrapping für spezielle Produktschutzaufgaben.", "Für Reisblöcke, Süßwaren, regelmäßige Produkte, Boxen und Sekundärpacks."],
    pt: ["Vácuo, flow pack, shrink e sobreenvoltura para proteção especial.", "Atende arroz compacto, doces, objetos regulares, caixas e packs secundários."],
    ru: ["Вакуум, flow pack, термоусадка и overwrapping для специализированной защиты.", "Для рисовых брикетов, конфет, регулярных изделий, коробок и вторичной упаковки."],
    ar: ["فاكيوم وفلو باك وانكماش وتغليف خارجي لحماية المنتجات الخاصة.", "يغطي أرزاً مضغوطاً وحلوى ومنتجات منتظمة وصناديق وعبوات تجزئة ثانوية."],
  },
  filling: {
    en: ["Filling, sealing, cartoning, case opening and case sealing lines for downstream automation.", "Connect primary packs to retail cartons, shipping cases and e-commerce logistics."],
    es: ["Líneas de llenado, sellado, encartonado, armado y cierre de cajas.", "Conectan el empaque primario con cartones retail, cajas de envío y e-commerce."],
    fr: ["Lignes de remplissage, scellage, cartonnage, formage et fermeture de caisses.", "Relient l'emballage primaire aux cartons retail, caisses d'expédition et e-commerce."],
    de: ["Abfüll-, Siegel-, Kartonier-, Case-Erector- und Verschließlinien.", "Verbinden Primärpacks mit Retail-Kartons, Versandcases und E-Commerce-Logistik."],
    pt: ["Linhas de envase, selagem, cartuchamento, abertura e fechamento de caixas.", "Conectam embalagem primária a cartuchos, caixas de envio e logística e-commerce."],
    ru: ["Линии фасовки, запайки, картонаторов, формирования и заклейки коробов.", "Соединяют первичную упаковку с розничными коробками, транспортной тарой и e-commerce."],
    ar: ["خطوط تعبئة ولحام وكرتنة وفتح وإغلاق الصناديق.", "تربط العبوة الأساسية بالكرتون التجاري وصناديق الشحن ولوجستيات التجارة الإلكترونية."],
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function json(value) {
  return JSON.stringify(value, null, 2).replaceAll("</", "<\\/");
}

function routeToFile(langCode, routePath) {
  const normalized = normalizePath(routePath);
  if (langCode === "en") {
    if (normalized === "/") return path.join(ROOT, "index.html");
    return path.join(ROOT, normalized.slice(1));
  }

  const withoutSlash = normalized === "/" ? "index.html" : normalized.slice(1);
  return path.join(ROOT, langCode, withoutSlash);
}

function localizedHref(langCode, routePath, hash = "") {
  return `${localizedPath(langCode, routePath)}${hash}`;
}

function alternateTags(routePath) {
  return [
    ...LANGUAGES.map((lang) => `    <link rel="alternate" hreflang="${lang.hreflang}" href="${absoluteUrl(lang.code, routePath)}" />`),
    `    <link rel="alternate" hreflang="x-default" href="${absoluteUrl("en", routePath)}" />`,
  ].join("\n");
}

function languageSwitcher(langCode, routePath) {
  const current = LANGUAGES.find((lang) => lang.code === langCode) || LANGUAGES[0];
  const copy = copyFor(langCode);
  return `<div class="language-switcher" data-language-switcher>
          <button class="language-toggle" type="button" aria-label="${escapeAttr(copy.nav.language)}" aria-haspopup="true" aria-expanded="false" data-language-toggle>
            <span class="language-code">${escapeHtml(current.short)}</span>
            <span class="language-chevron" aria-hidden="true"></span>
          </button>
          <div class="language-menu" data-language-menu>
            ${LANGUAGES.map(
              (lang) => `<a href="${localizedHref(lang.code, routePath)}" hreflang="${lang.hreflang}" lang="${lang.htmlLang || lang.code}"${lang.code === langCode ? ' aria-current="true" class="is-active"' : ""}>
              <span>${escapeHtml(lang.nativeName)}</span>
              <small>${escapeHtml(lang.short)}</small>
            </a>`,
            ).join("\n            ")}
          </div>
        </div>`;
}

function nav(langCode, routePath) {
  const copy = copyFor(langCode);
  return `<header class="site-header" data-header>
      <a class="brand" href="${localizedHref(langCode, "/", "#top")}" aria-label="${escapeAttr(copy.nav.homeLabel)}">
        <span class="brand-mark">PPM</span>
        <span class="brand-text">Premade Pouch Machines</span>
      </a>
      <button class="menu-toggle" type="button" aria-label="${escapeAttr(copy.nav.openNav)}" aria-expanded="false" data-menu-toggle>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav class="site-nav" data-nav aria-label="${escapeAttr(copy.nav.openNav)}">
        <a href="${localizedHref(langCode, "/", "#products")}">${escapeHtml(copy.nav.machines)}</a>
        <a href="${localizedHref(langCode, "/machine-index.html")}">${escapeHtml(copy.nav.catalog)}</a>
        <a href="${localizedHref(langCode, "/", "#guide")}">${escapeHtml(copy.nav.guide)}</a>
        <a href="${localizedHref(langCode, "/", "#applications")}">${escapeHtml(copy.nav.applications)}</a>
        <a href="${localizedHref(langCode, "/", "#specs")}">${escapeHtml(copy.nav.specs)}</a>
        <a href="${localizedHref(langCode, "/", "#faq")}">${escapeHtml(copy.nav.faq)}</a>
        <a href="${localizedHref(langCode, "/", "#quote")}" class="nav-quote">${escapeHtml(copy.nav.quote)}</a>
        ${languageSwitcher(langCode, routePath)}
      </nav>
    </header>`;
}

function footer(langCode) {
  const copy = copyFor(langCode);
  return `<footer class="site-footer">
      <div>
        <strong>Premade Pouch Machines</strong>
        <p>${escapeHtml(copy.home.description)}</p>
      </div>
      <div class="footer-links">
        <a href="${localizedHref(langCode, "/machine-index.html")}">${escapeHtml(copy.nav.seoLibrary)}</a>
        <a href="${localizedHref(langCode, "/premade-pouch-packaging-machine.html")}">${escapeHtml(categoryFor(langCode, "Premade pouch machines"))}</a>
        <a href="${localizedHref(langCode, "/vertical-form-fill-seal-machine.html")}">VFFS</a>
        <a href="${localizedHref(langCode, "/", "#quote")}">RFQ</a>
      </div>
    </footer>`;
}

function pageHead({ langCode, routePath, title, description, image = DEFAULT_SOCIAL_IMAGE, type = "website", jsonLd = null }) {
  const copy = copyFor(langCode);
  const canonical = absoluteUrl(langCode, routePath);
  const imageUrl = image.startsWith("http") ? image : `${BASE_URL}/${image}`;
  return `<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeAttr(description.slice(0, 300))}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${canonical}" />
${alternateTags(routePath)}
    <link rel="preload" as="image" href="/${escapeAttr(image)}" />
    <meta property="og:locale" content="${escapeAttr(copy.locale)}" />
    <meta property="og:title" content="${escapeAttr(title)}" />
    <meta property="og:description" content="${escapeAttr(description.slice(0, 300))}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(title)}" />
    <meta name="twitter:description" content="${escapeAttr(description.slice(0, 220))}" />
    <meta name="twitter:image" content="${imageUrl}" />
    ${jsonLd ? `<script type="application/ld+json">${json(jsonLd)}</script>` : ""}
    <link rel="stylesheet" href="/styles.css?v=${ASSET_VERSION}" />
  </head>`;
}

function relatedFor(item) {
  const sameCategory = MACHINE_PAGES.filter((candidate) => candidate.category === item.category && candidate.slug !== item.slug);
  const fallback = MACHINE_PAGES.filter((candidate) => candidate.slug !== item.slug);
  return [...sameCategory, ...fallback].slice(0, 4);
}

const CATEGORY_DEFAULTS = {
  "Premade pouch machines": {
    packageStyles: ["stand-up pouch", "zipper pouch", "flat pouch", "special shaped pouch"],
    materials: ["finished composite pouch", "foil laminate pouch", "paper composite pouch"],
    workflow: ["Finished pouch feeding", "Pouch opening", "Filling or dosing", "Heat sealing", "Shaping", "Output"],
    lineFit: "Best when pouch appearance, zipper formats and finished-bag flexibility are more important than roll-film economy.",
  },
  "Vertical form fill seal machines": {
    packageStyles: ["pillow bag", "gusset bag", "block-bottom bag", "roll-film pouch"],
    materials: ["OPP/PE", "PET/PE", "OPP/CPP", "foil laminate roll film"],
    workflow: ["Product lifting", "Dosing", "Film forming", "Filling", "Vertical and horizontal sealing", "Cutting and output"],
    lineFit: "Best when film economy, continuous output and roll-film purchasing are the primary project drivers.",
  },
  "Tea and coffee packaging machines": {
    packageStyles: ["triangle tea bag", "flat tea bag", "drip coffee bag", "outer envelope"],
    materials: ["nylon mesh", "non-woven fabric", "corn fiber", "filter paper", "outer envelope film"],
    workflow: ["Small-dose measuring", "Inner bag forming", "Ultrasonic or heat sealing", "Outer envelope packing", "Counting and output"],
    lineFit: "Best for aroma-sensitive small-dose beverage products that need clean sealing and retail-ready outer packs.",
  },
  "Sachet and stick pack machines": {
    packageStyles: ["sachet", "stick pack", "three-side seal bag", "back seal bag", "round-corner sachet"],
    materials: ["heat-seal roll film", "foil laminate film", "composite sachet film"],
    workflow: ["Film unwinding", "Bag forming", "Dosing", "Sealing", "Cutting", "Counting"],
    lineFit: "Best for small-dose SKUs, samples and high-output portion packs.",
  },
  "Flow wrapping machines": {
    packageStyles: ["pillow pack", "flow wrap", "regular-object wrap", "tray pack"],
    materials: ["OPP", "CPP", "laminated flow-wrap film"],
    workflow: ["Product infeed", "Film forming", "Longitudinal sealing", "End sealing", "Cutting", "Output"],
    lineFit: "Best for regular solids, bakery items, trays and retail products that move continuously on a conveyor.",
  },
  "Filling and sealing machines": {
    packageStyles: ["bottle", "jar", "can", "cup", "stand-up pouch"],
    materials: ["container-specific seals", "lids", "caps", "food-grade contact parts"],
    workflow: ["Container feeding", "Positioning", "Filling", "Sealing or capping", "Coding", "Output"],
    lineFit: "Best when the container format is fixed and the core challenge is accurate filling, capping or sealing.",
  },
  "Complete filling lines": {
    packageStyles: ["bottle", "can", "carton", "shipping case", "integrated production line"],
    materials: ["project-specific primary and secondary packaging materials"],
    workflow: ["Feeding", "Filling", "Capping or sealing", "Inspection", "Labeling", "Cartoning or case packing"],
    lineFit: "Best for factories planning a connected line rather than a standalone packaging machine.",
  },
};

function fallbackMachineLabel(copy, key, fallback) {
  return copy.machine[key] || COPY.en.machine[key] || fallback;
}

function uniqueList(values) {
  return [...new Set(values.filter(Boolean))];
}

function homeDetailFor(langCode) {
  return HOME_DETAIL_COPY[langCode] || HOME_DETAIL_COPY.en;
}

function formatTemplate(template, values) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function defaultFor(item) {
  return CATEGORY_DEFAULTS[item.category] || {
    packageStyles: ["custom package format", "retail pack", "industrial pack"],
    materials: ["project-specific packaging materials"],
    workflow: ["Feeding", "Dosing", "Packing", "Sealing", "Output"],
    lineFit: "Best fit depends on the product behavior, target package and automation boundary.",
  };
}

function galleryFor(item) {
  return uniqueList([item.image, ...(item.gallery || [])]).slice(0, 4);
}

function specLookup(item, patterns) {
  const found = item.specs.find(([label]) => patterns.some((pattern) => label.toLowerCase().includes(pattern)));
  return found ? found[1] : "";
}

function snapshotFor(item, langCode) {
  const labels = copyFor(langCode).machine.snapshotLabels || COPY.en.machine.snapshotLabels;
  const defaults = defaultFor(item);
  return [
    [labels[0], item.applications.slice(0, 4).join(", ")],
    [labels[1], (item.packageStyles || defaults.packageStyles).slice(0, 4).join(", ")],
    [labels[2], specLookup(item, ["speed", "output", "production"]) || "Project-specific after product and pack testing"],
    [labels[3], specLookup(item, ["dosing", "filling", "measuring", "weighing"]) || item.options.slice(0, 3).join(", ")],
  ];
}

function workflowFor(item) {
  const defaults = defaultFor(item);
  const process = specLookup(item, ["process", "workflow", "line process"]);
  if (item.workflow?.length) return item.workflow;
  if (process) return process.split(/,| and |;/).map((part) => part.trim()).filter(Boolean).slice(0, 7);
  return defaults.workflow;
}

function applicationSentence(application, localizedCategory, langCode) {
  const template = copyFor(langCode).machine.applicationTemplate || COPY.en.machine.applicationTemplate;
  return formatTemplate(template, {
    application,
    category: localizedCategory.toLowerCase(),
  });
}

function rfqDetailsFor(item, langCode = "en") {
  const machineCopy = copyFor(langCode).machine;
  return [
    `${machineCopy.rfqProducts}: ${item.applications.slice(0, 5).join(", ")}.`,
    `${machineCopy.rfqPackage}: ${(item.packageStyles || defaultFor(item).packageStyles).slice(0, 4).join(", ")}.`,
    `${machineCopy.rfqOptions}: ${item.options.slice(0, 6).join(", ")}.`,
    machineCopy.rfqEvidence,
  ];
}

function localizedItemFor(item, langCode) {
  const defaults = defaultFor(item);
  const completeItem = {
    ...item,
    packageStyles: item.packageStyles || defaults.packageStyles,
    materials: item.materials || defaults.materials,
    workflow: workflowFor(item),
  };
  return localizedMachine(completeItem, langCode, categoryFor(langCode, item.category));
}

function machineJsonLd(item, related, langCode) {
  const copy = copyFor(langCode);
  const routePath = `/machines/${item.slug}.html`;
  const url = absoluteUrl(langCode, routePath);
  const home = absoluteUrl(langCode, "/");
  const library = absoluteUrl(langCode, "/machine-index.html");
  const gallery = galleryFor(item);
  const localized = localizedItemFor(item, langCode);
  const questions =
    localized.faqQuestions || {
      products: `What products fit ${localized.title}?`,
      options: `What options can be added to ${localized.title}?`,
      rfq: `What information is needed before quoting ${localized.title}?`,
    };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: localized.title,
        description: localized.summary,
        inLanguage: copy.htmlLang,
        isPartOf: { "@id": `${home}#website` },
      },
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: localized.title,
        category: categoryFor(langCode, item.category),
        description: `${localized.summary} ${copy.machine.descriptionSuffix}`,
        image: gallery.map((image) => `${BASE_URL}/${image}`),
        brand: { "@type": "Brand", name: "Premade Pouch Machines" },
        additionalProperty: [
          ...localized.specs.map(([name, value]) => ({ "@type": "PropertyValue", name, value })),
          { "@type": "PropertyValue", name: copy.machine.applications, value: localized.applications.join(", ") },
          { "@type": "PropertyValue", name: copy.machine.options, value: localized.options.join(", ") },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: home },
          { "@type": "ListItem", position: 2, name: copy.nav.seoLibrary, item: library },
          { "@type": "ListItem", position: 3, name: localized.title, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: questions.products,
            acceptedAnswer: { "@type": "Answer", text: localized.summary },
          },
          {
            "@type": "Question",
            name: questions.options,
            acceptedAnswer: { "@type": "Answer", text: localized.options.join(", ") },
          },
          {
            "@type": "Question",
            name: questions.rfq,
            acceptedAnswer: { "@type": "Answer", text: rfqDetailsFor(localized, langCode).join(" ") },
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#related-machines`,
        name: copy.machine.related,
        itemListElement: related.map((candidate, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: localizedItemFor(candidate, langCode).title,
          url: absoluteUrl(langCode, `/machines/${candidate.slug}.html`),
        })),
      },
    ],
  };
}

function machinePage(item, langCode) {
  const copy = copyFor(langCode);
  const routePath = `/machines/${item.slug}.html`;
  const related = relatedFor(item);
  const localizedCategory = categoryFor(langCode, item.category);
  const localized = localizedItemFor(item, langCode);
  const title = `${localized.title} | ${copy.machine.titleSuffix}`;
  const description = `${localized.summary} ${copy.machine.descriptionSuffix}`;
  const gallery = galleryFor(item);
  const snapshot = snapshotFor(localized, langCode);
  const workflow = localized.workflow;
  const packageStyles = localized.packageStyles;
  const materials = localized.materials;
  const productBehavior = localized.productBehavior || copy.machine.productBehaviorFallback;
  const lineFit = localized.lineFit || copy.machine.lineFitFallback;

  return `<!doctype html>
<html lang="${copy.htmlLang}" dir="${LANGUAGES.find((lang) => lang.code === langCode).dir}">
  ${pageHead({ langCode, routePath, title, description, image: item.image, type: "article", jsonLd: machineJsonLd(item, related, langCode) })}
  <body>
    ${nav(langCode, routePath)}
    <main class="article-main">
      <section class="article-hero">
        <div class="article-hero-copy">
          <p class="section-kicker">${escapeHtml(localizedCategory)}</p>
          <h1>${escapeHtml(localized.h1)}</h1>
          <p>${escapeHtml(description)}</p>
        </div>
        <div class="article-hero-media">
          <img src="/${escapeAttr(item.image)}" alt="${escapeAttr(localized.title)}" />
        </div>
      </section>

      <article class="article-body">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="${localizedHref(langCode, "/")}">Home</a>
          <span>/</span>
          <a href="${localizedHref(langCode, "/machine-index.html")}">${escapeHtml(copy.nav.seoLibrary)}</a>
          <span>/</span>
          <span>${escapeHtml(localized.title)}</span>
        </nav>

        <p class="article-lede">${escapeHtml(copy.machine.lede)}</p>

        <div class="keyword-cloud" aria-label="${escapeAttr(copy.machine.keywordLabel)}">
          ${item.keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("\n          ")}
        </div>

        <div class="machine-snapshot" aria-label="${escapeAttr(copy.machine.overview)}">
          ${snapshot
            .map(
              ([label, value]) => `<div>
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </div>`,
            )
            .join("\n          ")}
        </div>

        <h2>${escapeHtml(copy.machine.overview)}</h2>
        <p>${escapeHtml(localized.summary)} ${escapeHtml(productBehavior)}</p>

        ${
          gallery.length > 1
            ? `<div class="machine-gallery" aria-label="Machine visuals">
          ${gallery
            .map(
              (image, index) => `<figure>
            <img src="/${escapeAttr(image)}" alt="${escapeAttr(`${localized.title} visual ${index + 1}`)}" loading="${index === 0 ? "eager" : "lazy"}" />
          </figure>`,
            )
            .join("\n          ")}
        </div>`
            : ""
        }

        <h2>${escapeHtml(copy.machine.applications)}</h2>
        <div class="article-card-grid three">
          ${localized.applications
            .map(
              (application) => `<div class="content-card">
            <h3>${escapeHtml(application)}</h3>
            <p>${escapeHtml(applicationSentence(application, localizedCategory, langCode))}</p>
          </div>`,
            )
            .join("\n          ")}
        </div>

        <h2>${escapeHtml(copy.machine.configuration)}</h2>
        <div class="process-flow">
          ${workflow.map((step, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(step)}</strong></div>`).join("\n          ")}
        </div>

        <h2>${escapeHtml(copy.machine.engineering)}</h2>
        <div class="engineering-grid">
          <div class="content-card">
            <h3>${escapeHtml(copy.machine.packageFormats)}</h3>
            <ul>${packageStyles.map((style) => `<li>${escapeHtml(style)}</li>`).join("")}</ul>
          </div>
          <div class="content-card">
            <h3>${escapeHtml(copy.machine.compatibleMaterials)}</h3>
            <ul>${materials.map((material) => `<li>${escapeHtml(material)}</li>`).join("")}</ul>
          </div>
          <div class="content-card">
            <h3>${escapeHtml(copy.machine.lineFitHeading)}</h3>
            <p>${escapeHtml(lineFit)}</p>
          </div>
        </div>

        <h2>${escapeHtml(copy.machine.technical)}</h2>
        <div class="article-table">
          <div class="row head">
            <span>${escapeHtml(copy.machine.parameter)}</span>
            <span>${escapeHtml(copy.machine.value)}</span>
          </div>
          ${localized.specs
            .map(
              ([label, value]) => `<div class="row">
            <span>${escapeHtml(label)}</span>
            <span>${escapeHtml(value)}</span>
          </div>`,
            )
            .join("\n          ")}
        </div>

        <h2>${escapeHtml(copy.machine.features)}</h2>
        <div class="content-columns">
          <div class="content-card">
            <h3>${escapeHtml(copy.machine.features)}</h3>
            <ul>${localized.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}</ul>
          </div>
          <div class="content-card">
            <h3>${escapeHtml(copy.machine.options)}</h3>
            <ul>${localized.options.map((option) => `<li>${escapeHtml(option)}</li>`).join("")}</ul>
          </div>
        </div>

        <h2>${escapeHtml(copy.machine.checklist)}</h2>
        <div class="rfq-detail-grid">
          ${rfqDetailsFor(localized, langCode).map((line) => `<p>${escapeHtml(line)}</p>`).join("\n          ")}
        </div>
        <ul>${copy.machine.checklistItems.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>

        <h2>${escapeHtml(copy.machine.related)}</h2>
        ${localized.relatedIntro ? `<p>${escapeHtml(localized.relatedIntro)}</p>` : ""}
        <div class="article-card-grid">
          ${related
            .map((candidate) => {
              const relatedItem = localizedItemFor(candidate, langCode);
              return `<a class="content-card related-card" href="${localizedHref(langCode, `/machines/${candidate.slug}.html`)}">
            <h3>${escapeHtml(relatedItem.title)}</h3>
            <p>${escapeHtml(relatedItem.summary)}</p>
          </a>`;
            })
            .join("\n          ")}
        </div>

        <div class="article-cta">
          <div>
            <h2>${escapeHtml(copy.machine.quoteHeading)}</h2>
            <p>${escapeHtml(copy.machine.quoteText)}</p>
          </div>
          <a class="button button-primary" href="${localizedHref(langCode, "/", "#quote")}">${escapeHtml(copy.machine.request)}</a>
        </div>
      </article>
    </main>
    ${footer(langCode)}
    <script src="/script.js?v=${ASSET_VERSION}"></script>
  </body>
</html>`;
}

function pillarPage(page, langCode) {
  const copy = copyFor(langCode);
  const routePath = page.path;
  const title = `${categoryFor(langCode, page.category)} | ${copy.machine.titleSuffix}`;
  const [summary, secondary] = PILLAR_TEXT[page.key][langCode] || PILLAR_TEXT[page.key].en;
  const related = MACHINE_PAGES.filter((item) => item.image === page.image || item.category === page.category).slice(0, 6);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(langCode, routePath)}#page`,
    name: title,
    description: `${summary} ${secondary}`,
    inLanguage: copy.htmlLang,
  };

  return `<!doctype html>
<html lang="${copy.htmlLang}" dir="${LANGUAGES.find((lang) => lang.code === langCode).dir}">
  ${pageHead({ langCode, routePath, title, description: `${summary} ${secondary}`, image: page.image, type: "article", jsonLd })}
  <body>
    ${nav(langCode, routePath)}
    <main class="article-main">
      <section class="article-hero">
        <div class="article-hero-copy">
          <p class="section-kicker">${escapeHtml(categoryFor(langCode, page.category))}</p>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(summary)}</p>
        </div>
        <div class="article-hero-media">
          <img src="/${escapeAttr(page.image)}" alt="${escapeAttr(categoryFor(langCode, page.category))}" />
        </div>
      </section>

      <article class="article-body">
        <p class="article-lede">${escapeHtml(secondary)}</p>
        <h2>${escapeHtml(copy.machine.applications)}</h2>
        <div class="article-card-grid three">
          ${HOME_CARDS.find((card) => card.key === page.key).options
            .map(
              (option) => `<div class="content-card">
            <h3>${escapeHtml(option)}</h3>
            <p>${escapeHtml(copy.home.guideText)}</p>
          </div>`,
            )
            .join("\n          ")}
        </div>
        <h2>${escapeHtml(copy.machine.related)}</h2>
        <div class="seo-page-grid">
          ${related
            .map((item) => {
              const relatedItem = localizedItemFor(item, langCode);
              return `<a class="content-card seo-page-card" href="${localizedHref(langCode, `/machines/${item.slug}.html`)}">
            <span>${escapeHtml(categoryFor(langCode, item.category))}</span>
            <h3>${escapeHtml(relatedItem.title)}</h3>
            <p>${escapeHtml(relatedItem.summary)}</p>
          </a>`;
            })
            .join("\n          ")}
        </div>
      </article>
    </main>
    ${footer(langCode)}
    <script src="/script.js?v=${ASSET_VERSION}"></script>
  </body>
</html>`;
}

function homeJsonLd(langCode) {
  const copy = copyFor(langCode);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${absoluteUrl(langCode, "/")}#organization`,
        name: "Premade Pouch Machines",
        url: absoluteUrl(langCode, "/"),
        email: "sales@premadepouchmachines.com",
        description: copy.home.description,
      },
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl(langCode, "/")}#website`,
        url: absoluteUrl(langCode, "/"),
        name: "Premade Pouch Machines",
        inLanguage: copy.htmlLang,
      },
      {
        "@type": "ItemList",
        "@id": `${absoluteUrl(langCode, "/")}#machine-catalog`,
        name: copy.home.portfolioTitle,
        itemListElement: PILLAR_PAGES.map((page, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: categoryFor(langCode, page.category),
          url: absoluteUrl(langCode, page.path),
        })),
      },
    ],
  };
}

function homePage(langCode) {
  const copy = copyFor(langCode);
  const lang = LANGUAGES.find((item) => item.code === langCode);
  const routePath = "/";
  const homeDetail = homeDetailFor(langCode);
  const categoryCount = new Set(MACHINE_PAGES.map((item) => item.category)).size;
  const proofMetrics = [String(MACHINE_PAGES.length), String(categoryCount), String(LANGUAGES.length), "60"];
  return `<!doctype html>
<html lang="${copy.htmlLang}" dir="${lang.dir}">
  ${pageHead({ langCode, routePath, title: copy.home.title, description: copy.home.description, jsonLd: homeJsonLd(langCode) })}
  <body>
    <a class="skip-link" href="#quote">${escapeHtml(copy.home.primaryCta)}</a>
    ${nav(langCode, routePath)}
    <main id="top">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-machine" aria-hidden="true">
          <img src="/${escapeAttr(HERO_IMAGE)}" alt="" width="1406" height="794" />
        </div>
        <div class="hero-panel" aria-hidden="true"></div>
        <div class="hero-content">
          <p class="eyebrow">${escapeHtml(copy.home.eyebrow)}</p>
          <h1 id="hero-title">${escapeHtml(copy.home.h1)}</h1>
          <p class="hero-lede">${escapeHtml(copy.home.lede)}</p>
          <div class="hero-actions" aria-label="Conversion actions">
            <a class="button button-primary" href="#quote">${escapeHtml(copy.home.primaryCta)}</a>
            <a class="button button-secondary" href="#products">${escapeHtml(copy.home.secondaryCta)}</a>
          </div>
          <div class="hero-tags" aria-label="Key machine capabilities">
            <span>${escapeHtml(categoryFor(langCode, "Premade pouch machines"))}</span>
            <span>${escapeHtml(categoryFor(langCode, "Vertical form fill seal machines"))}</span>
            <span>${escapeHtml(categoryFor(langCode, "Filling, cartoning and case lines"))}</span>
          </div>
        </div>
      </section>

      <section class="proof-strip" aria-label="Factory proof points">
        ${proofMetrics.map(
          (metric, index) => `<div><strong>${metric}</strong><span>${escapeHtml(copy.home.proof[index])}</span></div>`,
        ).join("")}
      </section>

      <section class="section products-section" id="products" aria-labelledby="products-title">
        <div class="section-heading">
          <div>
            <p class="section-kicker">${escapeHtml(copy.home.machinePortfolio)}</p>
            <h2 id="products-title">${escapeHtml(copy.home.portfolioTitle)}</h2>
          </div>
          <p>${escapeHtml(copy.home.portfolioText)}</p>
        </div>
        <div class="product-grid">
          ${PILLAR_PAGES.map((page) => {
            const [summary] = PILLAR_TEXT[page.key][langCode] || PILLAR_TEXT[page.key].en;
            const card = HOME_CARDS.find((item) => item.key === page.key);
            return `<a class="product-card" href="${localizedHref(langCode, page.path)}">
            <div class="product-media">
              <img src="/${escapeAttr(page.image)}" alt="${escapeAttr(categoryFor(langCode, page.category))}" />
            </div>
            <div class="product-body">
              <span class="product-tag">${escapeHtml(card.metric)}</span>
              <h3>${escapeHtml(categoryFor(langCode, page.category))}</h3>
              <p>${escapeHtml(summary)}</p>
            </div>
          </a>`;
          }).join("\n          ")}
        </div>
      </section>

      <section class="section catalog-section" id="catalog" aria-labelledby="catalog-title">
        <div class="section-heading compact">
          <p class="section-kicker">${escapeHtml(copy.nav.seoLibrary)}</p>
          <h2 id="catalog-title">${escapeHtml(copy.home.catalogTitle)}</h2>
          <p>${escapeHtml(copy.home.catalogText)}</p>
          <a class="button button-primary" href="${localizedHref(langCode, "/machine-index.html")}">${escapeHtml(copy.nav.catalog)}</a>
        </div>
        <div class="catalog-depth">
          <div><strong>${MACHINE_PAGES.length}</strong><span>${escapeHtml(copy.home.catalogDepth[0])}</span></div>
          <div><strong>${new Set(MACHINE_PAGES.map((item) => item.category)).size}</strong><span>${escapeHtml(copy.home.catalogDepth[1])}</span></div>
          <div><strong>7</strong><span>${escapeHtml(copy.home.catalogDepth[2])}</span></div>
        </div>
      </section>

      <section class="section guide-section" id="guide" aria-labelledby="guide-title">
        <div class="section-heading">
          <div>
            <p class="section-kicker">${escapeHtml(copy.nav.guide)}</p>
            <h2 id="guide-title">${escapeHtml(copy.home.guideTitle)}</h2>
          </div>
          <p>${escapeHtml(copy.home.guideText)}</p>
        </div>
        <div class="guide-grid">
          ${homeDetail.guideCards.map(
            (card, index) => `<article>
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(card.title || card[0])}</h3>
            <p>${escapeHtml(card.text || card[1])}</p>
          </article>`,
          ).join("\n          ")}
        </div>
      </section>

      <section class="section applications-section" id="applications" aria-labelledby="applications-title">
        <div class="section-heading compact">
          <p class="section-kicker">${escapeHtml(copy.nav.applications)}</p>
          <h2 id="applications-title">${escapeHtml(copy.home.portfolioTitle)}</h2>
        </div>
        <div class="application-grid">
          ${homeDetail.applicationClusters.map(
            (item) => `<article>
            <h3>${escapeHtml(item.title || item[0])}</h3>
            <p>${escapeHtml(item.text || item[1])}</p>
          </article>`,
          ).join("\n          ")}
        </div>
      </section>

      <section class="section specs-section" id="specs" aria-labelledby="specs-title">
        <div class="section-heading compact">
          <p class="section-kicker">${escapeHtml(copy.nav.specs)}</p>
          <h2 id="specs-title">${escapeHtml(copy.home.specsTitle)}</h2>
        </div>
        <div class="article-table">
          <div class="row head"><span>${escapeHtml(copy.machine.parameter)}</span><span>${escapeHtml(copy.machine.value)}</span></div>
          ${homeDetail.specReferenceLines.map(([label, value]) => `<div class="row"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`).join("\n          ")}
        </div>
      </section>

      <section class="section faq-section" id="faq" aria-labelledby="faq-title">
        <div class="section-heading compact">
          <p class="section-kicker">${escapeHtml(copy.nav.faq)}</p>
          <h2 id="faq-title">${escapeHtml(copy.home.faqTitle)}</h2>
        </div>
        <div class="faq-grid">
          ${copy.machine.checklistItems.slice(0, 4).map((item) => `<article><h3>${escapeHtml(copy.machine.checklist)}</h3><p>${escapeHtml(item)}</p></article>`).join("")}
        </div>
      </section>

      <section class="quote-section" id="quote" aria-labelledby="quote-title">
        <div class="quote-copy">
          <p class="section-kicker">RFQ</p>
          <h2 id="quote-title">${escapeHtml(copy.home.quoteTitle)}</h2>
          <p>${escapeHtml(copy.home.quoteText)}</p>
        </div>
        <form class="quote-form" data-lead-form>
          <label><span>${escapeHtml(homeDetail.form[0])}</span><input name="name" type="text" required /></label>
          <label><span>${escapeHtml(homeDetail.form[1])}</span><input name="email" type="email" required /></label>
          <label><span>${escapeHtml(homeDetail.form[2])}</span><input name="company" type="text" /></label>
          <label><span>${escapeHtml(homeDetail.form[3])}</span><select name="machine">${PILLAR_PAGES.map((page) => `<option>${escapeHtml(categoryFor(langCode, page.category))}</option>`).join("")}</select></label>
          <label><span>${escapeHtml(homeDetail.form[4])}</span><input name="product" type="text" /></label>
          <label><span>${escapeHtml(homeDetail.form[5])}</span><input name="speed" type="text" /></label>
          <label class="full"><span>${escapeHtml(homeDetail.form[6])}</span><textarea name="message" rows="5"></textarea></label>
          <button class="button button-primary full" type="submit">${escapeHtml(copy.nav.quote)}</button>
          <p class="form-status full" data-form-status role="status"></p>
        </form>
      </section>
    </main>
    ${footer(langCode)}
    <a class="mobile-rfq" href="#quote">RFQ</a>
    <script src="/script.js?v=${ASSET_VERSION}"></script>
  </body>
</html>`;
}

function hubPage(langCode) {
  const copy = copyFor(langCode);
  const routePath = "/machine-index.html";
  const groups = [...new Set(MACHINE_PAGES.map((item) => item.category))].map((category) => ({
    category,
    items: MACHINE_PAGES.filter((item) => item.category === category),
  }));
  const itemList = MACHINE_PAGES.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: localizedItemFor(item, langCode).title,
    url: absoluteUrl(langCode, `/machines/${item.slug}.html`),
  }));

  return `<!doctype html>
<html lang="${copy.htmlLang}" dir="${LANGUAGES.find((lang) => lang.code === langCode).dir}">
  ${pageHead({
    langCode,
    routePath,
    title: copy.hub.title,
    description: copy.hub.description,
    jsonLd: { "@context": "https://schema.org", "@type": "ItemList", "@id": `${absoluteUrl(langCode, routePath)}#machine-library`, name: copy.hub.title, itemListElement: itemList },
  })}
  <body>
    ${nav(langCode, routePath)}
    <main class="article-main">
      <section class="article-hero seo-library-hero">
        <div class="article-hero-copy">
          <p class="section-kicker">${escapeHtml(copy.nav.seoLibrary)}</p>
          <h1>${escapeHtml(copy.hub.h1)}</h1>
          <p>${escapeHtml(copy.hub.lede)}</p>
        </div>
        <div class="seo-library-panel" aria-label="Machine catalog statistics">
          <div><strong>${MACHINE_PAGES.length}</strong><span>${escapeHtml(copy.hub.statPages)}</span></div>
          <div><strong>${groups.length}</strong><span>${escapeHtml(copy.hub.statCategories)}</span></div>
          <div><strong>100+</strong><span>${escapeHtml(copy.hub.statIntent)}</span></div>
        </div>
      </section>

      <section class="article-body">
        ${groups
          .map(
            (group) => `<h2>${escapeHtml(categoryFor(langCode, group.category))}</h2>
        <div class="seo-page-grid">
          ${group.items
            .map((item) => {
              const localized = localizedItemFor(item, langCode);
              return `<a class="content-card seo-page-card" href="${localizedHref(langCode, `/machines/${item.slug}.html`)}">
            <span>${escapeHtml(categoryFor(langCode, item.category))}</span>
            <h3>${escapeHtml(localized.title)}</h3>
            <p>${escapeHtml(localized.summary)}</p>
            <small>${escapeHtml(item.keywords.slice(0, 3).join(" | "))}</small>
          </a>`;
            })
            .join("\n          ")}
        </div>`,
          )
          .join("\n\n        ")}
      </section>
    </main>
    ${footer(langCode)}
    <script src="/script.js?v=${ASSET_VERSION}"></script>
  </body>
</html>`;
}

function sitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${ROUTES.flatMap((entry) =>
  LANGUAGES.map(
    (lang) => `  <url>
    <loc>${absoluteUrl(lang.code, entry.path)}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
${LANGUAGES.map((alternate) => `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${absoluteUrl(alternate.code, entry.path)}" />`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl("en", entry.path)}" />
  </url>`,
  ),
).join("\n")}
</urlset>
`;
}

function validateNoDisallowed(filePath, html) {
  for (const token of DISALLOWED) {
    if (html.includes(token)) {
      throw new Error(`Disallowed token "${token}" found in ${filePath}`);
    }
  }
}

function writeRoute(langCode, routePath, html) {
  const filePath = routeToFile(langCode, routePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  validateNoDisallowed(filePath, html);
  fs.writeFileSync(filePath, html, "utf8");
  return filePath;
}

function removeOldLocaleDirs() {
  const englishMachineDir = path.join(ROOT, "machines");
  if (fs.existsSync(englishMachineDir)) fs.rmSync(englishMachineDir, { recursive: true, force: true });
  for (const lang of NON_DEFAULT_LANGUAGES) {
    const dir = path.join(ROOT, lang.code);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }
  for (const code of REMOVED_LOCALE_DIRS) {
    const dir = path.join(ROOT, code);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }
}

function build() {
  removeOldLocaleDirs();

  for (const lang of LANGUAGES) {
    writeRoute(lang.code, "/", homePage(lang.code));
    writeRoute(lang.code, "/machine-index.html", hubPage(lang.code));
    for (const page of PILLAR_PAGES) writeRoute(lang.code, page.path, pillarPage(page, lang.code));
    for (const item of MACHINE_PAGES) writeRoute(lang.code, `/machines/${item.slug}.html`, machinePage(item, lang.code));
  }

  const sitemapPath = path.join(ROOT, "sitemap.xml");
  fs.writeFileSync(sitemapPath, sitemap(), "utf8");

  const generatedCount = ROUTES.length * LANGUAGES.length;
  console.log(`Generated ${generatedCount} multilingual pages and sitemap.xml`);
}

build();
