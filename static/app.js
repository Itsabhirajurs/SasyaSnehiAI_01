/* ============================================================
   Sashyasnehi AI — Shared App JavaScript
   Dark Mode · Animated Background · Left/Right Drawer Panels · i18n
   ============================================================ */

// ── Dark Mode ────────────────────────────────────────────────────────────────
(function initDarkMode() {
  const STORAGE_KEY = 'sashya-theme';
  const saved = localStorage.getItem(STORAGE_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    if (btn) btn.innerHTML = theme === 'dark' ? '&#9728;&#65039;' : '&#127769;';
  }

  window.toggleTheme = function () {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  };

  document.addEventListener('DOMContentLoaded', () => { applyTheme(saved); });
})();


// ── Animated Floating Background ─────────────────────────────────────────────
(function initParticles() {
  const EMOJIS = ['🌿','🌾','🌱','🍅','🥔','🌽','🍎','🧅','🌻','🌸','🍃','🌳','🥦','🌶️','🧄','🫛','🌼','🍃','🌾','🌿'];
  const COUNT = 20;
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.className = 'bg-particles';
    container.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(container, document.body.firstChild);
    for (let i = 0; i < COUNT; i++) {
      const span = document.createElement('span');
      span.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const dur = 18 + Math.random() * 24;
      span.style.cssText = `left:${Math.random()*98}%;font-size:${16+Math.random()*24}px;animation-duration:${dur}s;animation-delay:${-(Math.random()*dur)}s;`;
      container.appendChild(span);
    }
  });
})();


// ── i18n — Full UI Translation Dictionary ───────────────────────────────────
window.I18N = {
  English: {
    'nav.home':'Home','nav.community':'Community','nav.market':'Market','nav.fertilizer':'Fertilizer','nav.cultivation':'Cultivation','nav.analyze':'Analyze Crop',
    'nav.about':'About','nav.new-analysis':'New Analysis',
    'footer.home':'Home',
    'upload.h1':'Analyze Your Crop','upload.h1-sub':'Upload a leaf image and fill in your farm details for a complete AI advisory.','upload.image-title':'Crop Image *','upload.drop-browse':'Click to browse','upload.drop-or':'or drag & drop your leaf image here','upload.drop-note':'JPG, PNG, WEBP — max 10 MB','upload.farm':'Farm Details','upload.soil':'Soil Type','upload.select':'— Select —','upload.soil-clay':'Clay','upload.soil-sandy':'Sandy','upload.soil-loamy':'Loamy','upload.soil-silty':'Silty','upload.watering':'Watering Frequency','upload.watering-ph':'e.g., daily / 3× a week','upload.tilling':'Tilling Information','upload.optional':'(optional)','upload.tilling-ph':'e.g., deep ploughing monthly','upload.language':'Preferred Language','upload.chems':'Previously Used Chemicals','upload.chems-label':'Chemical Names','upload.comma-opt':'(comma-separated, optional)','upload.chems-ph':'e.g., chlorpyrifos, imidacloprid, glyphosate','upload.soiltest':'Soil Test Results','upload.soiltest-ph':'e.g., pH 6.5, NPK 120-60-40, EC 0.8 dS/m','upload.location':'Location (for weather risk)','upload.use-location':'Use My Location','upload.loc-status':'Location not captured — weather risk will use defaults.','upload.back':'← Back','upload.run':'Run Analysis','upload.geo-not-supported':'Geolocation not supported in this browser.','upload.geo-detecting':'Detecting location…','upload.geo-captured':'✔ Coordinates captured','upload.geo-address':'✔ Location:','upload.geo-fail':'Unable to get location. Continuing without it.',
    'hero.title':'Sashyasnehi AI','hero.tagline':'AI-powered crop disease detection & smart advisory for Indian farmers — instant, multilingual, free.',
    'hero.badge1':'🤖 MobileNetV2 AI','hero.badge2':'🌦 Weather Risk','hero.badge3':'⚗️ Chemical Safety','hero.badge4':'💬 Gemini Chat','hero.badge5':'🌐 Hindi · Kannada · English','hero.badge6':'📈 ML Market Prices','hero.badge7':'🏛 Govt Schemes',
    'hero.cta':'Start Analysis →','hero.scroll':'↓ Scroll',
    'alerts.heading':'🚨 Active Disease Alerts','alerts.sub':'Current crop disease advisories from ICAR and State Agriculture Departments.',
    'alerts.card1.crop':'Tomato','alerts.card1.title':'Late Blight Alert — South Karnataka','alerts.card1.desc':'High humidity & cool nights favour Phytophthora infestans. Apply Mancozeb or Metalaxyl at 7-day intervals.',
    'alerts.card2.crop':'Wheat','alerts.card2.title':'Yellow Rust Warning — Punjab & Haryana','alerts.card2.desc':'Stripe rust (Puccinia striiformis) reported in early-sown plots. Apply Propiconazole 25 EC at flag-leaf stage.',
    'alerts.card3.crop':'Potato','alerts.card3.title':'Early Blight Incidence — UP & Bihar','alerts.card3.desc':'Warm days followed by wet nights increasing Alternaria solani spread. Use Chlorothalonil 75 WP preventively.',
    'features.heading':'What Sashyasnehi Does','features.sub':'Eight intelligent modules working together for complete crop health insight.',
    'features.f1.title':'Disease Detection','features.f1.desc':'MobileNetV2 transfer learning identifies crop diseases from leaf photos with 93%+ accuracy on PlantVillage.',
    'features.f2.title':'Severity Estimation','features.f2.desc':'HSV colour analysis measures infected area percentage and classifies as Mild, Moderate, or Severe.',
    'features.f3.title':'Weather Risk Scoring','features.f3.desc':'Live OpenWeather data — humidity, temperature, rain probability — adjusts overall disease risk score dynamically.',
    'features.f4.title':'Chemical Safety','features.f4.desc':'Cross-checks past chemicals against a safety database, flags hazards and suggests safer bio-alternatives.',
    'features.f5.title':'Smart Advisory','features.f5.desc':'Rule-based engine generates contextual treatment steps, watering advice and soil-specific guidance.',
    'features.f6.title':'Gemini AI Chat','features.f6.desc':'Ask follow-up questions in your language. Google Gemini answers with farm-specific context in real time.',
    'features.f7.title':'Market Prices','features.f7.desc':'Live mandi prices from 1,000+ APMCs with ML-predicted next-week trends using Ridge regression models (R²=0.95).',
    'features.f8.title':'Govt Schemes','features.f8.desc':'PM-KISAN, PMFBY, eNAM and state schemes matched to your crop and location instantly.',
    'steps.heading':'How It Works','steps.sub':'Four simple steps to a full crop health report.',
    'steps.s1.title':'Upload Image','steps.s1.desc':'Take a close-up photo of the diseased leaf and upload it.',
    'steps.s2.title':'Fill Details','steps.s2.desc':'Add chemicals used, soil type, watering habits and optional location.',
    'steps.s3.title':'AI Analyzes','steps.s3.desc':'Disease model, severity engine and weather risk all process in seconds.',
    'steps.s4.title':'Get Advisory','steps.s4.desc':'Read detailed treatment advice and chat with Gemini for follow-up help.',
    'stats.diseases':'Crop Diseases','stats.modules':'AI Modules','stats.accuracy':'Model Accuracy','stats.languages':'Languages','stats.priceModels':'Price Models','stats.cost':'Cost to Use',
    'calendar.heading':'📅 Seasonal Crop Calendar — India','calendar.sub':'What to sow and harvest each season for optimal yield.',
    'calendar.kharif.badge':'Kharif (Jun–Oct)','calendar.kharif.title':'Sow & Grow','calendar.kharif.rice':'Rice (Paddy)','calendar.kharif.cotton':'Cotton','calendar.kharif.maize':'Maize / Corn','calendar.kharif.groundnut':'Groundnut','calendar.kharif.sugarcane':'Sugarcane','calendar.kharif.soybeans':'Soybeans',
    'calendar.rabi.badge':'Rabi (Nov–Mar)','calendar.rabi.title':'Sow & Grow','calendar.rabi.wheat':'Wheat','calendar.rabi.mustard':'Mustard','calendar.rabi.chickpea':'Gram / Chickpea','calendar.rabi.peas':'Peas','calendar.rabi.barley':'Barley','calendar.rabi.potato':'Potato',
    'calendar.zaid.badge':'Zaid (Mar–Jun)','calendar.zaid.title':'Sow & Grow','calendar.zaid.watermelon':'Watermelon','calendar.zaid.muskmelon':'Muskmelon','calendar.zaid.cucumber':'Cucumber','calendar.zaid.bittergourd':'Bitter Gourd','calendar.zaid.fodder':'Fodder Crops','calendar.zaid.moong':'Moong Dal',
    'calendar.year.badge':'Year-Round','calendar.year.title':'Vegetables','calendar.year.tomato':'Tomato','calendar.year.onion':'Onion','calendar.year.capsicum':'Capsicum / Pepper','calendar.year.brinjal':'Brinjal','calendar.year.chilli':'Chilli','calendar.year.greens':'Leafy Greens',
    'tips.heading':'💡 Quick Farming Tips','tips.sub':'Science-backed practices for healthier crops.',
    'tips.t1.title':'Spray in the Morning','tips.t1.desc':'Apply fungicides/insecticides early morning (6–9 AM) when wind is calm, temperatures are low, and drift is minimal.',
    'tips.t2.title':'Drip Over Flood Irrigation','tips.t2.desc':'Drip irrigation saves 40–50% water, reduces humidity near plants and significantly decreases fungal disease incidence.',
    'tips.t3.title':'Crop Rotation Matters','tips.t3.desc':'Rotating tomato with non-solanaceous crops breaks pest cycles. Never plant tomato after tomato or potato consecutively.',
    'tips.t4.title':'Soil Testing Every Season','tips.t4.desc':'Test NPK, pH and micronutrients before each crop. Blind fertilizer use is the #1 cause of toxicity and yield losses.',
    'tips.t5.title':'Scout Weekly for Pests','tips.t5.desc':'Walk your fields every 7 days. Early detection of pest eggs on leaf undersides prevents 80% of chemical interventions.',
    'tips.t6.title':'Neem Oil as First Defense','tips.t6.desc':'Neem oil at 2–3 mL/L works against 200+ pest species, is safe for bees and humans, and resists resistance build-up.',
    'cta.heading':'Ready to diagnose your crop?','cta.sub':'Upload a leaf photo and get a full AI-powered advisory in under 10 seconds — completely free.',
    'cta.btn1':'🧬 Analyze My Crop','cta.btn2':'💬 Join Community',
    'footer.text':'Sashyasnehi AI © 2025 · Built with Flask, TensorFlow & Gemini','footer.community':'Community','footer.market':'Market','footer.about':'About',
    'community.title':'Farmer Community','community.sub':'Discuss crop diseases, share experiences, and help each other.','community.ask':'+ Ask a Question','community.stat.posts':'Posts','community.stat.replies':'Replies','community.stat.solved':'Solved','community.search':'🔍 Search discussions...','community.allPlants':'All Plants','community.allStates':'All States','community.filter':'Filter','community.by':'by','community.views':'views','community.solved':'✓ Solved','community.replies':'replies','community.empty':'No discussions yet. Start the first one!','footer.home':'Home',
    'market.title':'Market Price Analysis','market.sub':'Real-time market prices from AgMarknet (data.gov.in) with ML trend prediction.','market.allStates':'All States','market.refresh':'Refresh','market.kpi.avg':'Avg Price / Quintal','market.kpi.min':'Min Price','market.kpi.max':'Max Price','market.kpi.median':'Median Price','market.kpi.trend':'Market Trend','market.kpi.prediction':'ML Prediction (Next Week)','market.kpi.predictionShort':'Predicted (Next Week)','market.dataSource':'Data source:','market.model':'Prediction model:','market.history':'Price History','market.table.market':'Market','market.table.state':'District / State','market.table.min':'Min (₹)','market.table.max':'Max (₹)','market.table.modal':'Modal (₹)','market.empty':'Market data is currently unavailable.','market.emptyHint':'Add DATA_GOV_API_KEY to your .env file','market.footer':'Market data from',
    'result.h1':'Analysis Report',
    'result.h1-sub':'Full AI advisory based on your uploaded image and farm details.',
    'result.forecast-title':'7-Day Forecast for','result.panel-advisory':'Crop Advisory —','result.spray-window':'Best spray window:','result.spray-ok':'Spray OK','result.spray-no':'No Spray','result.weather-unavailable':'Weather forecast unavailable.','result.weather-add-key':'Add OPENWEATHER_API_KEY and fetch location on the upload page.',
    'result.disease-detection':'Disease Detection',
    'result.label-plant':'Plant','result.label-disease':'Detected Disease',
    'result.label-confidence':'Model Confidence','result.label-severity':'Severity',
    'result.env-risk':'Environmental Risk','result.label-risk':'Risk Level:',
    'result.label-humidity':'Humidity','result.label-temp':'Temperature',
    'result.label-rain':'Rain Probability',
    'result.advisory':'Crop Advisory',
    'result.h3-summary':'Summary','result.h3-causes':'Possible Causes',
    'result.h3-actions':'Recommended Actions',
    'result.chemicals':'Chemical Safety Analysis',
    'result.chem-avoid':'Chemicals to Avoid','result.chem-alt':'Safer Alternatives',
    'result.community-title':'Similar Issues in Community',
    'result.post-issue':'Post This Issue',
    'result.view-discussions':'View All Discussions','result.community-empty':'No community discussions yet for this crop/disease. Be the first to post!',
    'result.market-title':'Market Prices','result.mkt-avg':'Avg Price','result.mkt-trend':'Trend','result.mkt-predict':'Predicted (next wk)','result.live-market':'Live Market Rates','result.market-full':'Full Market Analysis','result.market-unavailable':'Market data unavailable.',
    'result.schemes-title':'Farmer Schemes','result.schemes-unavailable':'Govt schemes data unavailable.',
    'result.weather-missing':'Weather data unavailable — add OPENWEATHER_API_KEY and fetch location for live scoring.',
    'result.severe-title':'Severe Case — Find Nearby Help','result.severe-text':'Severity is high. Consider consulting an agricultural expert near you.','result.btn-nursery':'Nearby Nursery','result.btn-consultant':'Agriculture Consultant',
    'result.chat-desc1':'Conversation with Gemini AI in',
    'result.chat-title':'Ask AI About Your Crop',
    'result.chat-desc2':'Ask follow-up questions — it remembers the whole chat.',
    'result.chat-send':'Send',
    'result.chat-placeholder':'Ask anything... e.g. How often should I spray?',
    'result.new-analysis':'← New Analysis','result.home-btn':'Home',
    'panel.insights':'Farm Insights','panel.weather':'Weather',
    'panel.market-tab':'Market','panel.schemes':'Schemes',
    'news.title':'Farming News & Updates',
    'dtab.news':'NEWS','dtab.insights':'INSIGHTS',
    'fert.title':'Fertilizer Calculator','fert.badge':'Offline-ready','fert.desc':'Realistic NPK splits for major crops with current retail price benchmarks (Govt controlled MRP, Feb 2026).','fert.inputs':'Inputs','fert.input.crop':'Crop','fert.input.soil':'Soil Type','fert.input.area':'Area (acre)','fert.input.yield':'Target Yield (t/ha, optional)','fert.btn.calc':'Calculate','fert.btn.reset':'Reset','fert.rec.title':'Recommendation','fert.rec.npk':'NPK need (kg/acre)','fert.rec.mix':'Product mix','fert.rec.cost':'Estimated cost','fert.rec.split':'Application split','fert.rec.notes':'Notes','fert.table.title':'Retail benchmarks (Govt MRP / common market)','fert.table.head.product':'Product','fert.table.head.npk':'N-P-K%','fert.table.head.bag':'Bag size','fert.table.head.price':'Price (₹/bag)','fert.product.urea':'Urea','fert.product.dap':'DAP','fert.product.mop':'MOP','fert.product.mop.full':'MOP (Muriate of Potash)','fert.product.ssp':'SSP (Single Super Phosphate)','fert.error.area':'Enter area','fert.cost.text':'≈ ₹{cost} for {area} acre','fert.split.text':'Basal: 50% N + 100% P + 50% K. Topdress N at 30-35 DAS and panicle/flowering.','fert.ssp.note':'Add 1 bag SSP if sulfur-deficient.','fert.word.bags':'bags','fert.cost.unit.acre':'acre','fert.soil.loam':'Loam','fert.soil.clay':'Clay','fert.soil.sandy':'Sandy','fert.crop.rice':'Rice','fert.crop.wheat':'Wheat','fert.crop.maize':'Maize','fert.crop.tomato':'Tomato','fert.crop.potato':'Potato','fert.crop.cotton':'Cotton','fert.note.rice':'Transplanted rice, irrigated.','fert.note.wheat':'Timely sown, irrigated.','fert.note.maize':'Hybrid maize, medium fertility.','fert.note.tomato':'Open-field, staking advised.','fert.note.potato':'Irrigated, neutral pH.','fert.note.cotton':'Bt cotton, irrigated.',
    'cult.title':'Crop Playbooks','cult.badge':'Field-ready','cult.desc':'Region-aware sowing windows, seed rates, spacing, fertilizer splits, irrigation, and pest watch. Data reflects typical 2025-26 practices in India.','cult.find.title':'Find crops for your location','cult.find.state':'State','cult.find.district':'District','cult.find.taluk':'Taluk','cult.find.statePh':'e.g., Karnataka','cult.find.districtPh':'optional','cult.find.talukPh':'optional','cult.find.button':'Suggest crops','cult.find.offlineNote':'Offline heuristic by state; no external API calls.','cult.loc.title':'Location suitability','cult.loc.addState.label':'Add a state','cult.loc.addState.value':'Enter state to see tailored crops.','cult.loc.noMatch.label':'No exact match','cult.loc.noMatch.value':'Showing generic playbooks. Try entering the full state name.','cult.loc.how':'How it works','cult.loc.how.desc':'Offline suitability by state/soil-climate heuristic. No external APIs used (API servers unavailable).','cult.badge.match':'Fits your location','cult.badge.guide':'Field guide','cult.label.sowing':'Sowing:','cult.label.seed':'Seed rate:','cult.label.spacing':'Spacing:','cult.label.fert':'Fertilizer:','cult.label.irrigation':'Irrigation:','cult.label.pest':'Pest watch:',
    'cult.crop.rice.name':'Rice (Kharif)','cult.crop.rice.regions':'Punjab, Haryana, UP, Bihar, AP, TN','cult.crop.rice.window':'Nursery: June 10-30 · Transplant: July 1-20','cult.crop.rice.seed':'6-8 kg/acre (nursery)','cult.crop.rice.spacing':'20x15 cm (SRI 25x25 cm)','cult.crop.rice.fert':'NPK 40:20:20 kg/acre; Basal 50% N + full P+K; topdress N at 25 & 45 DAT','cult.crop.rice.irrigation':'Puddled, 2-5 cm water; shift to AWD after tillering','cult.crop.rice.pest':'Stem borer, BPH, blast; spray only on ETL; rotate actives',
    'cult.crop.wheat.name':'Wheat (Rabi)','cult.crop.wheat.regions':'Punjab, Haryana, UP, MP','cult.crop.wheat.window':'Nov 10-30 (timely), Dec 1-15 (late)','cult.crop.wheat.seed':'40-45 kg/acre (HD varieties)','cult.crop.wheat.spacing':'22.5 cm row; 18 cm for late sowing','cult.crop.wheat.fert':'NPK 45:20:20 kg/acre; 50% N basal, 50% N at crown root (21 DAS)','cult.crop.wheat.irrigation':'CRI (21 DAS) critical; then tillering, jointing, booting, milking','cult.crop.wheat.pest':'Rusts (yellow/leaf), aphids; prophylactic monitoring',
    'cult.crop.maize.name':'Maize (Kharif)','cult.crop.maize.regions':'Karnataka, Maharashtra, Telangana, MP','cult.crop.maize.window':'Jun 15-Jul 15; Rabi maize in AP/TS: Oct 15-Nov 15','cult.crop.maize.seed':'8-10 kg/acre hybrids','cult.crop.maize.spacing':'60x20 cm','cult.crop.maize.fert':'NPK 50:25:25 kg/acre; 50% N basal, 25% at V6, 25% at VT','cult.crop.maize.irrigation':'Maize is sensitive at tasseling-silking; avoid standing water','cult.crop.maize.pest':'FAW scouting twice weekly; use pheromone traps; rotate modes',
    'cult.crop.tomato.name':'Tomato (Open field)','cult.crop.tomato.regions':'Karnataka, AP, Telangana, Maharashtra','cult.crop.tomato.window':'Nursery: Nov-Jan or Jun-Jul; Transplant 25-30 days','cult.crop.tomato.seed':'25-30 g/acre nursery','cult.crop.tomato.spacing':'90x45 cm (staked) or 60x45 cm','cult.crop.tomato.fert':'NPK 60:30:40 kg/acre; split N and K in 4-5 fertigation doses','cult.crop.tomato.irrigation':'Maintain moist soil; drip preferred; avoid waterlogging','cult.crop.tomato.pest':'Tuta absoluta, fruit borer, early/late blight; yellow sticky traps',
    'cult.crop.potato.name':'Potato','cult.crop.potato.regions':'UP, Punjab, Gujarat, WB','cult.crop.potato.window':'Planting Oct 25-Dec 10 (North); Sept 15-Oct 15 (Hills)','cult.crop.potato.seed':'6-8 q/acre (30-40 mm seed tubers)','cult.crop.potato.spacing':'60x20 cm (ridge)','cult.crop.potato.fert':'NPK 65:30:50 kg/acre; 50% N basal, 50% N at earthing-up','cult.crop.potato.irrigation':'Light irrigation after planting, then at sprout, tuber set, bulking','cult.crop.potato.pest':'Late blight watch (40-45 DAP); aphids, cutworms',
    'cult.crop.cotton.name':'Cotton (Bt)','cult.crop.cotton.regions':'Maharashtra, Gujarat, Telangana, AP','cult.crop.cotton.window':'Jun 15-Jul 15 (rainfed); irrigated up to Aug 1','cult.crop.cotton.seed':'450-600 g/acre (BG-II hybrids)','cult.crop.cotton.spacing':'120x45 cm (narrow) or 150x60 cm (wide)','cult.crop.cotton.fert':'NPK 50:25:25 kg/acre; N split 3 doses: sowing, square, boll set','cult.crop.cotton.irrigation':'Critical at square formation and boll development','cult.crop.cotton.pest':'Pink bollworm: pheromone traps, timely harvest, avoid ratoon',
    'cult.state.punjab.note':'Canal irrigation suits rice-wheat; good winter chill for wheat.','cult.state.haryana.note':'Rice-wheat rotation fits irrigation; monitor groundwater.','cult.state.uttarpradesh.note':'Alluvial soils, irrigation; potato belt in western/central UP.','cult.state.bihar.note':'Gangetic plains; high humidity favors rice kharif, wheat rabi.','cult.state.andhrapradesh.note':'Delta irrigation and black soils suit rice/cotton; maize and tomato common in rabi.','cult.state.telangana.note':'Black soils and rainfed kharif; maize and cotton dominant.','cult.state.karnataka.note':'Diverse zones; maize/tomato belts in south, cotton in north.','cult.state.tamilnadu.note':'Multiple seasons with irrigation; tomato belts in Krishnagiri/Dharmapuri.','cult.state.maharashtra.note':'Vidarbha/Marathwada cotton; maize/tomato in irrigated pockets.','cult.state.gujarat.note':'Black soils suit cotton; wheat in irrigated rabi.','cult.state.westbengal.note':'Humid rice belts; Nadia/Hooghly potato hubs.','cult.state.madhyapradesh.note':'Central Indian black soils for maize; wheat in irrigated rabi.','cult.state.kerala.note':'Limited paddy pockets; high rainfall favors wetland rice.',
    'about.title':'About Sashyasnehi AI','about.tagline':'An intelligent, open-source crop advisory system for Indian farmers — built with transfer learning, real-time weather data and multilingual AI.','about.overview.title':'Project Overview','about.overview.body':'Sashyasnehi AI (meaning "Friend of Crops" in Odia) is a modular web-based advisory system that combines deep learning plant disease classification with contextual environmental risk, chemical safety analysis, and multilingual AI guidance. The goal is to put expert-level crop health analysis into the hands of every farmer — for free, in their language, with no technical knowledge required.','about.tech.title':'Technology Stack','about.model.title':'AI Model Architecture','about.model.desc':'The disease classifier uses MobileNetV2 as a frozen feature extractor (pretrained on ImageNet), with a custom classification head:','about.model.step.in':'Input: 224x224 RGB leaf image, preprocessed with MobileNetV2 normalisation','about.model.step.bk':'Base: MobileNetV2 frozen (87 layers, 2.2M params) — ImageNet weights','about.model.step.hd':'Head: GlobalAveragePooling2D → Dropout(0.3) → Dense(128, ReLU) → Softmax(N)','about.model.step.tr':'Training: Adam (lr=1e-4), categorical crossentropy, EarlyStopping + ReduceLROnPlateau','about.model.step.cl':'Classes: Tomato Early/Late Blight, Potato Early/Late Blight, Pepper Bacterial Spot, Tomato Healthy','about.modules.title':'System Modules','about.modules.01':'model_loader.py — Singleton TF model service, loads once, serves predictions','about.modules.02':'severity.py — HSV colour masking: yellow + brown + dark ranges → infected pixel percentage','about.modules.03':'weather.py — OpenWeather free-tier API: humidity, temperature, rain probability risk formula','about.modules.04':'chemical_safety.py — JSON knowledge base lookup: bee toxicity, soil microbe impact, human health risk','about.modules.05':'advisory.py — Rule-based engine: severity x risk x soil type → actionable treatment plan','about.modules.06':'llm_service.py — Google Gemini with auto-failover across 34 available models; offline fallback mode','about.modules.07':'app.py — Flask orchestration layer: routes, image save, module pipeline, JSON chat endpoint','about.diseases.title':'Supported Crop Diseases','about.data.title':'Data & Privacy','about.data.body':'Uploaded images are stored locally in static/uploads/ and are not transmitted to any external server. Location data (if provided) is used only for a single OpenWeather API call during the analysis request and is not stored. API keys are kept in a local .env file and never exposed in the browser.','about.cta.try':'Try It Now','about.cta.back':'← Back to Home','about.footer':'Sashyasnehi AI © 2025 · Built with Flask, TensorFlow & Gemini',
  },
  Hindi: {
    'nav.home':'होम','nav.community':'समुदाय','nav.market':'बाज़ार','nav.fertilizer':'उर्वरक','nav.cultivation':'खेती सुझाव','nav.analyze':'फसल विश्लेषण',
  'nav.about':'हमारे बारे में','nav.new-analysis':'नया विश्लेषण',
    'footer.home':'होम',
    'upload.h1':'अपनी फसल का विश्लेषण करें','upload.h1-sub':'पत्ती की तस्वीर अपलोड करें और पूरा AI परामर्श पाने के लिए खेत विवरण भरें।','upload.image-title':'फसल छवि *','upload.drop-browse':'ब्राउज़ करें','upload.drop-or':'या अपनी पत्ती की छवि यहाँ ड्रैग और ड्रॉप करें','upload.drop-note':'JPG, PNG, WEBP — अधिकतम 10 MB','upload.farm':'खेत विवरण','upload.soil':'मिट्टी का प्रकार','upload.select':'— चुनें —','upload.soil-clay':'चिकनी','upload.soil-sandy':'रेतीली','upload.soil-loamy':'दोमट','upload.soil-silty':'गादयुक्त','upload.watering':'सिंचाई आवृत्ति','upload.watering-ph':'जैसे, दैनिक / सप्ताह में 3 बार','upload.tilling':'जुताई जानकारी','upload.optional':'(वैकल्पिक)','upload.tilling-ph':'जैसे, मासिक गहरी जुताई','upload.language':'पसंदीदा भाषा','upload.chems':'पहले उपयोग किए रसायन','upload.chems-label':'रसायन नाम','upload.comma-opt':'(अल्पविराम से अलग, वैकल्पिक)','upload.chems-ph':'जैसे, क्लोरोपायरिफॉस, इमिडाक्लोप्रिड, ग्लाइफोसेट','upload.soiltest':'मिट्टी परीक्षण परिणाम','upload.soiltest-ph':'जैसे, pH 6.5, NPK 120-60-40, EC 0.8 dS/m','upload.location':'स्थान (मौसम जोखिम हेतु)','upload.use-location':'मेरा स्थान उपयोग करें','upload.loc-status':'स्थान कैप्चर नहीं हुआ — मौसम जोखिम डिफ़ॉल्ट पर रहेगा।','upload.back':'← वापस','upload.run':'विश्लेषण चलाएँ','upload.geo-not-supported':'यह ब्राउज़र जियोलोकेशन समर्थित नहीं करता।','upload.geo-detecting':'स्थान खोज रहा है…','upload.geo-captured':'✔ स्थानांक कैप्चर किए गए','upload.geo-address':'✔ स्थान:','upload.geo-fail':'स्थान नहीं मिल सका। इसके बिना जारी है।',
    'hero.title':'सश्‍यस्नेही AI','hero.tagline':'भारतीय किसानों के लिए AI संचालित फसल रोग पहचान और स्मार्ट सलाह — तुरंत, बहुभाषी, मुफ्त।',
    'hero.badge1':'🤖 मोबाइलनेटV2 AI','hero.badge2':'🌦 मौसम जोखिम','hero.badge3':'⚗️ रासायनिक सुरक्षा','hero.badge4':'💬 जेमिनी चैट','hero.badge5':'🌐 हिंदी · कन्नड़ · अंग्रेज़ी','hero.badge6':'📈 एमएल बाज़ार मूल्य','hero.badge7':'🏛 सरकारी योजनाएँ',
    'hero.cta':'विश्लेषण शुरू करें →','hero.scroll':'↓ स्क्रॉल करें',
    'alerts.heading':'🚨 सक्रिय रोग अलर्ट','alerts.sub':'आईसीएआर और राज्य कृषि विभागों से वर्तमान फसल रोग सलाह।',
    'alerts.card1.crop':'टमाटर','alerts.card1.title':'लेट ब्लाइट अलर्ट — दक्षिण कर्नाटक','alerts.card1.desc':'उच्च आर्द्रता और ठंडी रातें Phytophthora infestans को बढ़ावा देती हैं। 7 दिन के अंतराल पर मैनकोजेब या मेटालैक्सिल छिड़कें।',
    'alerts.card2.crop':'गेहूं','alerts.card2.title':'पीला रतुआ चेतावनी — पंजाब और हरियाणा','alerts.card2.desc':'स्ट्राइप रस्ट (Puccinia striiformis) शुरुआती बोआई में रिपोर्ट। फ्लैग-लीफ स्टेज पर प्रोपीकोनाज़ोल 25 EC छिड़कें।',
    'alerts.card3.crop':'आलू','alerts.card3.title':'अर्ली ब्लाइट घटना — यूपी और बिहार','alerts.card3.desc':'गर्म दिन और गीली रातें Alternaria solani का फैलाव बढ़ाती हैं। क्लोरोथैलोनिल 75 WP रोकथाम हेतु छिड़कें।',
    'features.heading':'Sashyasnehi क्या करता है','features.sub':'आठ बुद्धिमान मॉड्यूल मिलकर पूर्ण फसल स्वास्थ्य अंतर्दृष्टि देते हैं।',
    'features.f1.title':'रोग पहचान','features.f1.desc':'MobileNetV2 ट्रांसफर लर्निंग पत्ती की तस्वीरों से फसल रोग 93%+ सटीकता से पहचानता है।',
    'features.f2.title':'गंभीरता आकलन','features.f2.desc':'HSV रंग विश्लेषण संक्रमित क्षेत्र प्रतिशत मापता है और हल्का, मध्यम या गंभीर वर्गीकृत करता है।',
    'features.f3.title':'मौसम जोखिम स्कोरिंग','features.f3.desc':'लाइव OpenWeather डेटा — आर्द्रता, तापमान, वर्षा संभावना — समग्र रोग जोखिम स्कोर को गतिशील रूप से समायोजित करता है।',
    'features.f4.title':'रासायनिक सुरक्षा','features.f4.desc':'पिछले रसायनों को सुरक्षा डेटाबेस से क्रॉस-चेक कर खतरों को चिन्हित करता है और सुरक्षित जैव विकल्प सुझाता है।',
    'features.f5.title':'स्मार्ट सलाह','features.f5.desc':'नियम-आधारित इंजन उपचार चरण, सिंचाई सलाह और मिट्टी-विशिष्ट मार्गदर्शन बनाता है।',
    'features.f6.title':'जेमिनी AI चैट','features.f6.desc':'अपनी भाषा में फॉलो-अप प्रश्न पूछें। गूगल जेमिनी खेत-संदर्भित उत्तर रीयल-टाइम में देता है।',
    'features.f7.title':'बाज़ार मूल्य','features.f7.desc':'1,000+ एपीएमसी से लाइव मंडी मूल्य, रिज रिग्रेशन (R²=0.95) से अगले सप्ताह के पूर्वानुमान।',
    'features.f8.title':'सरकारी योजनाएँ','features.f8.desc':'PM-KISAN, PMFBY, eNAM और राज्य योजनाएँ आपकी फसल और लोकेशन से तुरंत मिलती हैं।',
    'steps.heading':'कैसे काम करता है','steps.sub':'पूरा फसल स्वास्थ्य रिपोर्ट पाने के चार सरल चरण।',
    'steps.s1.title':'चित्र अपलोड करें','steps.s1.desc':'बीमार पत्ती की क्लोज़-अप फोटो लें और अपलोड करें।',
    'steps.s2.title':'विवरण भरें','steps.s2.desc':'उपयोग किए रसायन, मिट्टी प्रकार, सिंचाई आदतें और वैकल्पिक लोकेशन जोड़ें।',
    'steps.s3.title':'AI विश्लेषण','steps.s3.desc':'रोग मॉडल, गंभीरता इंजन और मौसम जोखिम कुछ ही सेकंड में प्रक्रिया करते हैं।',
    'steps.s4.title':'सलाह प्राप्त करें','steps.s4.desc':'विस्तृत उपचार सलाह पढ़ें और फॉलो-अप के लिए जेमिनी से चैट करें।',
    'stats.diseases':'फसल रोग','stats.modules':'AI मॉड्यूल','stats.accuracy':'मॉडल सटीकता','stats.languages':'भाषाएँ','stats.priceModels':'मूल्य मॉडल','stats.cost':'उपयोग लागत',
    'calendar.heading':'📅 मौसमी फसल कैलेंडर — भारत','calendar.sub':'सर्वोत्तम पैदावार के लिए हर मौसम में क्या बोएँ और क्या काटें।',
    'calendar.kharif.badge':'खरीफ (जून–अक्टूबर)','calendar.kharif.title':'बोएँ और बढ़ाएँ','calendar.kharif.rice':'धान (चावल)','calendar.kharif.cotton':'कपास','calendar.kharif.maize':'मक्का / कॉर्न','calendar.kharif.groundnut':'मूंगफली','calendar.kharif.sugarcane':'गन्ना','calendar.kharif.soybeans':'सोयाबीन',
    'calendar.rabi.badge':'रबी (नवंबर–मार्च)','calendar.rabi.title':'बोएँ और बढ़ाएँ','calendar.rabi.wheat':'गेहूं','calendar.rabi.mustard':'सरसों','calendar.rabi.chickpea':'चना / काबुली चना','calendar.rabi.peas':'मटर','calendar.rabi.barley':'जौ','calendar.rabi.potato':'आलू',
    'calendar.zaid.badge':'ज़ैद (मार्च–जून)','calendar.zaid.title':'बोएँ और बढ़ाएँ','calendar.zaid.watermelon':'तरबूज','calendar.zaid.muskmelon':'खरबूजा','calendar.zaid.cucumber':'खीरा','calendar.zaid.bittergourd':'करेला','calendar.zaid.fodder':'चारा फसलें','calendar.zaid.moong':'मूंग दाल',
    'calendar.year.badge':'सालभर','calendar.year.title':'सब्ज़ियाँ','calendar.year.tomato':'टमाटर','calendar.year.onion':'प्याज़','calendar.year.capsicum':'शिमला मिर्च / कैप्सिकम','calendar.year.brinjal':'बैंगन','calendar.year.chilli':'मिर्च','calendar.year.greens':'हरी पत्तेदार सब्ज़ियाँ',
    'tips.heading':'💡 त्वरित खेती सुझाव','tips.sub':'स्वस्थ फसलों के लिए विज्ञान-आधारित अभ्यास।',
    'tips.t1.title':'सुबह स्प्रे करें','tips.t1.desc':'कीटनाशक/फफूंदनाशी सुबह 6–9 बजे लगाएँ जब हवा शांत हो, तापमान कम हो और ड्रिफ्ट न्यूनतम हो।',
    'tips.t2.title':'फ्लड के बजाय ड्रिप','tips.t2.desc':'ड्रिप सिंचाई 40–50% पानी बचाती है, पौधों के पास आर्द्रता कम करती है और फफूंद रोग घटाती है।',
    'tips.t3.title':'फसल चक्रण ज़रूरी','tips.t3.desc':'टमाटर को गैर-सोलानेसी फसलों के साथ घुमाने से कीट चक्र टूटते हैं। लगातार टमाटर या आलू न लगाएँ।',
    'tips.t4.title':'हर सीज़न मिट्टी जांच','tips.t4.desc':'हर फसल से पहले NPK, pH और सूक्ष्म पोषक तत्व जाँचें। बिना परीक्षण उर्वरक डालना विषाक्तता और पैदावार हानि का मुख्य कारण है।',
    'tips.t5.title':'साप्ताहिक कीट सर्वे','tips.t5.desc':'हर 7 दिन खेत में चलें। पत्तियों की निचली सतह पर अंडों की शुरुआती पहचान 80% रासायनिक हस्तक्षेप रोकती है।',
    'tips.t6.title':'पहला बचाव नीम तेल','tips.t6.desc':'2–3 mL/L नीम तेल 200+ कीट प्रजातियों पर काम करता है, मधुमक्खियों और मनुष्यों के लिए सुरक्षित है और प्रतिरोध बनना धीमा करता है।',
    'cta.heading':'क्या आप अपनी फसल का निदान करने के लिए तैयार हैं?','cta.sub':'एक पत्ती फोटो अपलोड करें और 10 सेकंड के भीतर पूरी AI सलाह मुफ्त पाएं।',
    'cta.btn1':'🧬 मेरी फसल का विश्लेषण','cta.btn2':'💬 समुदाय से जुड़ें',
    'footer.text':'Sashyasnehi AI © 2025 · Flask, TensorFlow और Gemini से निर्मित','footer.community':'समुदाय','footer.market':'बाज़ार','footer.about':'हमारे बारे में','footer.home':'होम',
    'community.title':'किसान समुदाय','community.sub':'फसल रोगों पर चर्चा करें, अनुभव साझा करें और एक-दूसरे की मदद करें।','community.ask':'+ एक प्रश्न पूछें','community.stat.posts':'पोस्ट','community.stat.replies':'जवाब','community.stat.solved':'सुलझे','community.search':'🔍 चर्चा खोजें...','community.allPlants':'सभी फसलें','community.allStates':'सभी राज्य','community.filter':'फ़िल्टर','community.by':'द्वारा','community.views':'व्यू','community.solved':'✓ सुलझा','community.replies':'जवाब','community.empty':'अभी कोई चर्चा नहीं है। पहली शुरू करें!','market.title':'बाज़ार मूल्य विश्लेषण','market.sub':'AgMarknet (data.gov.in) से वास्तविक समय कीमतें और एमएल ट्रेंड भविष्यवाणी।','market.allStates':'सभी राज्य','market.refresh':'रिफ्रेश','market.kpi.avg':'औसत मूल्य / क्विंटल','market.kpi.min':'न्यूनतम मूल्य','market.kpi.max':'अधिकतम मूल्य','market.kpi.median':'माध्य मूल्य','market.kpi.trend':'बाज़ार रुझान','market.kpi.prediction':'एमएल भविष्यवाणी (अगला सप्ताह)','market.kpi.predictionShort':'अगले सप्ताह का अनुमान','market.dataSource':'डेटा स्रोत:','market.model':'प्रेडिक्शन मॉडल:','market.history':'मूल्य इतिहास','market.table.market':'मंडी','market.table.state':'ज़िला / राज्य','market.table.min':'न्यूनतम (₹)','market.table.max':'अधिकतम (₹)','market.table.modal':'मोडल (₹)','market.empty':'बाज़ार डेटा उपलब्ध नहीं है।','market.emptyHint':'अपनी .env में DATA_GOV_API_KEY जोड़ें','market.footer':'बाज़ार डेटा स्रोत',
    'result.h1':'विश्लेषण रिपोर्ट',
    'result.h1-sub':'आपकी अपलोड की गई छवि और खेत विवरण के आधार पर AI सलाह।',
    'result.forecast-title':'7-दिवसीय पूर्वानुमान','result.panel-advisory':'फसल सलाह —','result.spray-window':'श्रेष्ठ स्प्रे समय:','result.spray-ok':'स्प्रे ठीक','result.spray-no':'स्प्रे न करें','result.weather-unavailable':'मौसम पूर्वानुमान उपलब्ध नहीं।','result.weather-add-key':'OPENWEATHER_API_KEY जोड़ें और अपलोड पेज पर लोकेशन प्राप्त करें।',
    'result.disease-detection':'रोग पहचान',
    'result.label-plant':'पौधा','result.label-disease':'पहचानी गई बीमारी',
    'result.label-confidence':'मॉडल विश्वास','result.label-severity':'गंभीरता',
    'result.env-risk':'पर्यावरण जोखिम','result.label-risk':'जोखिम स्तर:',
    'result.label-humidity':'आर्द्रता','result.label-temp':'तापमान',
    'result.label-rain':'वर्षा संभावना',
    'result.advisory':'फसल सलाह',
    'result.h3-summary':'सारांश','result.h3-causes':'संभावित कारण',
    'result.h3-actions':'अनुशंसित कार्रवाई',
    'result.chemicals':'रासायनिक सुरक्षा विश्लेषण','result.chem-avoid':'बचने वाले रसायन','result.chem-alt':'सुरक्षित विकल्प',
    'result.community-title':'समुदाय में समान समस्याएं',
    'result.post-issue':'यह समस्या पोस्ट करें',
    'result.view-discussions':'सभी चर्चाएँ देखें','result.community-empty':'इस फसल/रोग के लिए अभी चर्चाएँ नहीं हैं। पहला पोस्ट करें!','result.market-title':'बाज़ार मूल्य','result.mkt-avg':'औसत मूल्य','result.mkt-trend':'रुझान','result.mkt-predict':'अनुमान (अगला सप्ताह)','result.live-market':'लाइव बाज़ार दरें','result.market-full':'पूर्ण बाज़ार विश्लेषण','result.market-unavailable':'बाज़ार डेटा उपलब्ध नहीं।','result.schemes-title':'किसान योजनाएँ','result.schemes-unavailable':'सरकारी योजनाओं का डेटा उपलब्ध नहीं।','result.weather-missing':'मौसम डेटा उपलब्ध नहीं — OPENWEATHER_API_KEY जोड़ें और लोकेशन प्राप्त करें।','result.severe-title':'गंभीर मामला — नज़दीकी मदद लें','result.severe-text':'गंभीरता अधिक है। पास के कृषि विशेषज्ञ से सलाह लें।','result.btn-nursery':'नज़दीकी नर्सरी','result.btn-consultant':'कृषि सलाहकार',
    'result.chat-desc1':'Gemini AI वार्तालाप भाषा',
    'result.chat-title':'AI से अपनी फसल के बारे में पूछें',
    'result.chat-desc2':'अनुवर्ती प्रश्न पूछें — यह पूरी चैट याद रखता है।',
    'result.chat-send':'भेजें',
    'result.chat-placeholder':'कुछ भी पूछें... जैसे कितनी बार स्प्रे करूं?',
    'result.new-analysis':'← नया विश्लेषण','result.home-btn':'होम',
    'panel.insights':'खेत की जानकारी','panel.weather':'मौसम',
    'panel.market-tab':'बाज़ार','panel.schemes':'योजनाएं',
    'news.title':'कृषि समाचार',
    'dtab.news':'समाचार','dtab.insights':'जानकारी',
    'fert.title':'उर्वरक कैलकुलेटर','fert.badge':'ऑफ़लाइन तैयार','fert.desc':'मुख्य फसलों के लिए यथार्थवादी NPK विभाजन, वर्तमान खुदरा मूल्य (सरकारी नियंत्रित MRP, फरवरी 2026) के साथ।','fert.inputs':'इनपुट','fert.input.crop':'फसल','fert.input.soil':'मिट्टी का प्रकार','fert.input.area':'क्षेत्रफल (एकड़)','fert.input.yield':'लक्ष्य उपज (टन/हेक्टेयर, वैकल्पिक)','fert.btn.calc':'गणना करें','fert.btn.reset':'रीसेट','fert.rec.title':'सिफारिश','fert.rec.npk':'NPK आवश्यकता (किग्रा/एकड़)','fert.rec.mix':'उत्पाद मिश्रण','fert.rec.cost':'अनुमानित लागत','fert.rec.split':'प्रयोग विभाजन','fert.rec.notes':'नोट','fert.table.title':'खुदरा मानक (सरकारी MRP / सामान्य बाजार)','fert.table.head.product':'उत्पाद','fert.table.head.npk':'N-P-K%','fert.table.head.bag':'बैग आकार','fert.table.head.price':'मूल्य (₹/बैग)','fert.product.urea':'यूरिया','fert.product.dap':'DAP','fert.product.mop':'MOP','fert.product.mop.full':'MOP (म्यूरिएट ऑफ पोटाश)','fert.product.ssp':'SSP (सिंगल सुपर फॉस्फेट)','fert.error.area':'क्षेत्रफल दर्ज करें','fert.cost.text':'≈ ₹{cost} / {area} एकड़','fert.split.text':'बेसल: 50% N + 100% P + 50% K। 30-35 DAS और पैनिकल/फूल पर N शीर्ष ड्रेस करें।','fert.ssp.note':'यदि सल्फर की कमी हो तो 1 बैग SSP जोड़ें।','fert.word.bags':'बैग','fert.cost.unit.acre':'एकड़','fert.soil.loam':'दोमट','fert.soil.clay':'चिकनी','fert.soil.sandy':'बालू','fert.crop.rice':'धान','fert.crop.wheat':'गेहूं','fert.crop.maize':'मक्का','fert.crop.tomato':'टमाटर','fert.crop.potato':'आलू','fert.crop.cotton':'कपास','fert.note.rice':'रोपाई किया हुआ धान, सिंचित।','fert.note.wheat':'समय पर बोआई, सिंचित।','fert.note.maize':'हाइब्रिड मक्का, मध्यम उर्वरता।','fert.note.tomato':'खुले खेत, सहारा देना बेहतर।','fert.note.potato':'सिंचित, तटस्थ pH।','fert.note.cotton':'बीटी कपास, सिंचित।',
    'cult.title':'फसल प्लेबुक्स','cult.badge':'मैदान-तैयार','cult.desc':'क्षेत्र-आधारित बोआई खिड़कियाँ, बीज दर, दूरी, उर्वरक विभाजन, सिंचाई और कीट निगरानी। डेटा 2025-26 की सामान्य भारतीय प्रथाओं को दर्शाता है।','cult.find.title':'अपने स्थान के लिए फसलें खोजें','cult.find.state':'राज्य','cult.find.district':'ज़िला','cult.find.taluk':'तहसील','cult.find.statePh':'जैसे, कर्नाटक','cult.find.districtPh':'वैकल्पिक','cult.find.talukPh':'वैकल्पिक','cult.find.button':'फसलें सुझाएँ','cult.find.offlineNote':'राज्य-आधारित ऑफ़लाइन अनुमिति; कोई बाहरी API कॉल नहीं।','cult.loc.title':'स्थान उपयुक्तता','cult.loc.addState.label':'राज्य जोड़ें','cult.loc.addState.value':'अनुकूलित फसलें देखने के लिए राज्य दर्ज करें।','cult.loc.noMatch.label':'सटीक मेल नहीं','cult.loc.noMatch.value':'सामान्य प्लेबुक दिखा रहे हैं। पूर्ण राज्य नाम दर्ज करने का प्रयास करें।','cult.loc.how':'कैसे काम करता है','cult.loc.how.desc':'राज्य/मिट्टी-जलवायु अनुमिति द्वारा ऑफ़लाइन उपयुक्तता। कोई बाहरी API (सर्वर अनुपलब्ध) नहीं।','cult.badge.match':'आपके स्थान के अनुकूल','cult.badge.guide':'फील्ड गाइड','cult.label.sowing':'बोआई:','cult.label.seed':'बीज दर:','cult.label.spacing':'दूरी:','cult.label.fert':'उर्वरक:','cult.label.irrigation':'सिंचाई:','cult.label.pest':'कीट निगरानी:',
    'cult.crop.rice.name':'धान (खरीफ)','cult.crop.rice.regions':'पंजाब, हरियाणा, यूपी, बिहार, एपी, तमिलनाडु','cult.crop.rice.window':'नर्सरी: 10-30 जून · रोपाई: 1-20 जुलाई','cult.crop.rice.seed':'6-8 किग्रा/एकड़ (नर्सरी)','cult.crop.rice.spacing':'20x15 सेमी (SRI 25x25 सेमी)','cult.crop.rice.fert':'NPK 40:20:20 किग्रा/एकड़; बेसल 50% N + पूरा P+K; N टॉपड्रेस 25 और 45 DAT','cult.crop.rice.irrigation':'कीचड़युक्त, 2-5 सेमी पानी; टिलरिंग के बाद AWD अपनाएँ','cult.crop.rice.pest':'स्टेम बोरर, BPH, ब्लास्ट; ETL पर ही स्प्रे, सक्रिय तत्व बदलें',
    'cult.crop.wheat.name':'गेहूं (रबी)','cult.crop.wheat.regions':'पंजाब, हरियाणा, यूपी, एमपी','cult.crop.wheat.window':'10-30 नवंबर (समय पर), 1-15 दिसंबर (देर)','cult.crop.wheat.seed':'40-45 किग्रा/एकड़ (HD किस्में)','cult.crop.wheat.spacing':'22.5 सेमी कतार; देर बोआई में 18 सेमी','cult.crop.wheat.fert':'NPK 45:20:20 किग्रा/एकड़; 50% N बेसल, 50% N क्राउन रूट (21 DAS) पर','cult.crop.wheat.irrigation':'CRI (21 DAS) महत्वपूर्ण; फिर टिलरिंग, ज्वाइंटिंग, बूटिंग, मिल्किंग','cult.crop.wheat.pest':'रस्ट (पीला/पत्ता), एफिड; नियमित निगरानी',
    'cult.crop.maize.name':'मक्का (खरीफ)','cult.crop.maize.regions':'कर्नाटक, महाराष्ट्र, तेलंगाना, एमपी','cult.crop.maize.window':'15 जून-15 जुलाई; एपी/टीएस रबी मक्का: 15 अक्टूबर-15 नवंबर','cult.crop.maize.seed':'8-10 किग्रा/एकड़ हाइब्रिड','cult.crop.maize.spacing':'60x20 सेमी','cult.crop.maize.fert':'NPK 50:25:25 किग्रा/एकड़; 50% N बेसल, 25% V6 पर, 25% VT पर','cult.crop.maize.irrigation':'टैसलिंग-सिल्किंग पर संवेदनशील; पानी जमा न होने दें','cult.crop.maize.pest':'FAW के लिए सप्ताह में दो बार स्काउटिंग; फेरोमोन ट्रैप; मोड बदलें',
    'cult.crop.tomato.name':'टमाटर (खुले खेत)','cult.crop.tomato.regions':'कर्नाटक, एपी, तेलंगाना, महाराष्ट्र','cult.crop.tomato.window':'नर्सरी: नव.-जन. या जून-जुलाई; रोपाई 25-30 दिन','cult.crop.tomato.seed':'25-30 ग्राम/एकड़ नर्सरी','cult.crop.tomato.spacing':'90x45 सेमी (सहारा) या 60x45 सेमी','cult.crop.tomato.fert':'NPK 60:30:40 किग्रा/एकड़; N और K को 4-5 फर्टिगेशन खुराक में बाँटें','cult.crop.tomato.irrigation':'मिट्टी नम रखें; ड्रिप बेहतर; जलभराव से बचें','cult.crop.tomato.pest':'ट्यूटा, फ्रूट बोरर, अर्ली/लेट ब्लाइट; पीले स्टिकी ट्रैप',
    'cult.crop.potato.name':'आलू','cult.crop.potato.regions':'यूपी, पंजाब, गुजरात, पश्चिम बंगाल','cult.crop.potato.window':'रोपण 25 अक्टूबर-10 दिसंबर (उत्तर); 15 सित.-15 अक्टूबर (पहाड़)','cult.crop.potato.seed':'6-8 क्विंटल/एकड़ (30-40 मिमी बीज कंद)','cult.crop.potato.spacing':'60x20 सेमी (मेड़)','cult.crop.potato.fert':'NPK 65:30:50 किग्रा/एकड़; 50% N बेसल, 50% N गुड़ाई पर','cult.crop.potato.irrigation':'रोपण के बाद हल्की सिंचाई, फिर अंकुर, कंद सेट, बल्किंग पर','cult.crop.potato.pest':'लेट ब्लाइट निगरानी (40-45 DAP); एफिड, कटवर्म',
    'cult.crop.cotton.name':'कपास (बीटी)','cult.crop.cotton.regions':'महाराष्ट्र, गुजरात, तेलंगाना, एपी','cult.crop.cotton.window':'15 जून-15 जुलाई (वर्षा आधारित); सिंचित में 1 अगस्त तक','cult.crop.cotton.seed':'450-600 ग्राम/एकड़ (BG-II हाइब्रिड)','cult.crop.cotton.spacing':'120x45 सेमी (संकीर्ण) या 150x60 सेमी (चौड़ा)','cult.crop.cotton.fert':'NPK 50:25:25 किग्रा/एकड़; N को 3 खुराक में बाँटें: बुवाई, स्क्वायर, बॉल सेट','cult.crop.cotton.irrigation':'स्क्वायर निर्माण और बॉल विकास पर महत्वपूर्ण','cult.crop.cotton.pest':'पिंक बॉलवार्म: फेरोमोन ट्रैप, समय पर कटाई, रैटून न रखें',
    'cult.state.punjab.note':'नहर सिंचाई धान-गेहूं के लिए अनुकूल; गेहूं के लिए अच्छा सर्दी तापमान।','cult.state.haryana.note':'धान-गेहूं चक्र सिंचाई में फिट; भूजल की निगरानी करें।','cult.state.uttarpradesh.note':'दोमट/आलuvial मिट्टी, सिंचाई; पश्चिम/केंद्रीय यूपी आलू पट्टी।','cult.state.bihar.note':'गंगetic मैदान; उच्च आर्द्रता खरीफ धान, रबी गेहूं को बढ़ावा देती है।','cult.state.andhrapradesh.note':'डेल्टा सिंचाई और काली मिट्टी धान/कपास के लिए; रबी में मक्का और टमाटर सामान्य।','cult.state.telangana.note':'काली मिट्टी और वर्षा आधारित खरीफ; मक्का और कपास प्रमुख।','cult.state.karnataka.note':'विविध क्षेत्र; दक्षिण में मक्का/टमाटर, उत्तर में कपास।','cult.state.tamilnadu.note':'सिंचाई के साथ कई सीजन; कृष्णगिरि/धर्मपुरी में टमाटर बेल्ट।','cult.state.maharashtra.note':'विदर्भ/मराठवाड़ा कपास; सिंचित जेबों में मक्का/टमाटर।','cult.state.gujarat.note':'काली मिट्टी कपास के लिए उपयुक्त; सिंचित रबी में गेहूं।','cult.state.westbengal.note':'आर्द्र धान बेल्ट; नादिया/हुगली आलू केंद्र।','cult.state.madhyapradesh.note':'काली मिट्टी मक्का के लिए; सिंचित रबी में गेहूं।','cult.state.kerala.note':'सीमित धान क्षेत्र; भारी वर्षा गीली भूमि धान को बढ़ावा देती है।',
    'about.title':'सश्‍यस्नेही AI के बारे में','about.tagline':'भारतीय किसानों के लिए बुद्धिमान, मुक्त स्रोत फसल सलाह प्रणाली — ट्रांसफर लर्निंग, वास्तविक समय मौसम डेटा और बहुभाषी AI से निर्मित।','about.overview.title':'परियोजना अवलोकन','about.overview.body':'सश्‍यस्नेही AI (ओड़िया में "फ्रेंड ऑफ क्रॉप्स") एक मॉड्यूलर वेब-आधारित सलाह प्रणाली है जो डीप लर्निंग पादप रोग वर्गीकरण को पर्यावरणीय जोखिम, रासायनिक सुरक्षा विश्लेषण और बहुभाषी AI मार्गदर्शन के साथ जोड़ती है। लक्ष्य है हर किसान के हाथ में विशेषज्ञ स्तर का फसल स्वास्थ्य विश्लेषण देना — मुफ्त, उनकी भाषा में, बिना तकनीकी ज्ञान के।','about.tech.title':'प्रौद्योगिकी स्टैक','about.model.title':'AI मॉडल आर्किटेक्चर','about.model.desc':'रोग क्लासिफायर MobileNetV2 (ImageNet प्रीट्रेन) को फ्रीज़्ड फीचर एक्सट्रैक्टर के रूप में उपयोग करता है, कस्टम क्लासिफिकेशन हेड के साथ:','about.model.step.in':'इनपुट: 224x224 RGB पत्ती छवि, MobileNetV2 नार्मलाइजेशन के साथ','about.model.step.bk':'बेस: MobileNetV2 फ्रीज़ (87 लेयर, 2.2M पैरामीटर) — ImageNet वेट्स','about.model.step.hd':'हेड: GlobalAveragePooling2D → Dropout(0.3) → Dense(128, ReLU) → Softmax(N)','about.model.step.tr':'प्रशिक्षण: Adam (lr=1e-4), कैटेगोरिकल क्रॉसएंट्रॉपी, EarlyStopping + ReduceLROnPlateau','about.model.step.cl':'क्लास: टमाटर अर्ली/लेट ब्लाइट, आलू अर्ली/लेट ब्लाइट, मिर्च बैक्टीरियल स्पॉट, स्वस्थ टमाटर','about.modules.title':'सिस्टम मॉड्यूल','about.modules.01':'model_loader.py — एकल TF मॉडल सेवा, एक बार लोड होकर भविष्यवाणी सर्व करता है','about.modules.02':'severity.py — HSV रंग मास्किंग: पीला + भूरा + गहरा रेंज → संक्रमित पिक्सेल प्रतिशत','about.modules.03':'weather.py — OpenWeather नि:शुल्क API: आर्द्रता, तापमान, वर्षा संभावना जोखिम सूत्र','about.modules.04':'chemical_safety.py — JSON नॉलेज बेस खोज: मधुमक्खी विषाक्तता, मिट्टी सूक्ष्मजीव प्रभाव, मानव स्वास्थ्य जोखिम','about.modules.05':'advisory.py — नियम-आधारित इंजन: गंभीरता × जोखिम × मिट्टी प्रकार → क्रियात्मक उपचार योजना','about.modules.06':'llm_service.py — Google Gemini, 34 मॉडलों पर ऑटो-फ़ेलओवर; ऑफ़लाइन फॉलबैक मोड','about.modules.07':'app.py — Flask ऑर्केस्ट्रेशन लेयर: रूट, छवि सहेजना, मॉड्यूल पाइपलाइन, JSON चैट एंडपॉइंट','about.diseases.title':'समर्थित फसल रोग','about.data.title':'डेटा और गोपनीयता','about.data.body':'अपलोड की गई छवियां static/uploads/ में लोकल स्टोर होती हैं और किसी बाहरी सर्वर पर नहीं भेजी जातीं। लोकेशन डेटा (यदि दिया) केवल विश्लेषण अनुरोध के दौरान एक OpenWeather API कॉल के लिए उपयोग होता है और सहेजा नहीं जाता। API कुंजियां लोकल .env में रखी जाती हैं और ब्राउज़र में कभी प्रदर्शित नहीं होतीं।','about.cta.try':'अभी आज़माएँ','about.cta.back':'← होम पर वापस','about.footer':'Sashyasnehi AI © 2025 · Flask, TensorFlow और Gemini से निर्मित',
  },
  Kannada: {
    'nav.home':'ಮನೆ','nav.community':'ಸಮುದಾಯ','nav.market':'ಮಾರುಕಟ್ಟೆ','nav.fertilizer':'ರಸಗೊಬ್ಬರ','nav.cultivation':'ಕೃಷಿ ಸಲಹೆ','nav.analyze':'ಬೆಳೆ ವಿಶ್ಲೇಷಣೆ',
  'nav.about':'ನಮ್ಮ ಬಗ್ಗೆ','nav.new-analysis':'ಹೊಸ ವಿಶ್ಲೇಷಣೆ',
    'footer.home':'ಮನೆ',
    'upload.h1':'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ','upload.h1-sub':'ಎಲೆ ಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಪೂರ್ಣ AI ಸಲಹೆಗೆ ಹೊಲ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.','upload.image-title':'ಬೆಳೆ ಚಿತ್ರ *','upload.drop-browse':'ಬ್ರೌಸ್ ಮಾಡಿ','upload.drop-or':'ಅಥವಾ ಎಲೆ ಚಿತ್ರವನ್ನು ಇಲ್ಲಿ ಡ್ರ್ಯಾಗ್ ಮತ್ತು ಡ್ರಾಪ್ ಮಾಡಿ','upload.drop-note':'JPG, PNG, WEBP — ಗರಿಷ್ಠ 10 MB','upload.farm':'ಹೊಲ ವಿವರಗಳು','upload.soil':'ಮಣ್ಣಿನ ಪ್ರಕಾರ','upload.select':'— ಆಯ್ಕೆ —','upload.soil-clay':'ಕಳ್ಮಣ್ಣು','upload.soil-sandy':'ಮರಳು','upload.soil-loamy':'ಲೋಮಿ','upload.soil-silty':'ಗದ್ದಲು','upload.watering':'ನೀರಾವರಿ ಅವಧಿ','upload.watering-ph':'ಉದಾ., ದಿನವೂ / ವಾರಕ್ಕೆ 3 ಬಾರಿ','upload.tilling':'ಕರಡು/ಕುಟ್ಟುವ ಮಾಹಿತಿ','upload.optional':'(ಐಚ್ಛಿಕ)','upload.tilling-ph':'ಉದಾ., ತಿಂಗಳಿಗೆ ಒಂದು ಬಾರಿ ಆಳವಾದ ಕರಡು','upload.language':'ಆಯಿತ ಭಾಷೆ','upload.chems':'ಹಿಂದೆ ಬಳಸಿದ ರಾಸಾಯನಿಕಗಳು','upload.chems-label':'ರಾಸಾಯನಿಕ ಹೆಸರುಗಳು','upload.comma-opt':'(ಅಲ್ಪವಿರಾಮ ಬೇರ್ಪಡಿಸಿ, ಐಚ್ಛಿಕ)','upload.chems-ph':'ಉದಾ., ಕ್ಲೋರೊಪೈರಿಫಾಸ್, ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್, ಗ್ಲೈಫೋಸೆಟ್','upload.soiltest':'ಮಣ್ಣಿನ ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶ','upload.soiltest-ph':'ಉದಾ., pH 6.5, NPK 120-60-40, EC 0.8 dS/m','upload.location':'ಸ್ಥಳ (ಹವಾಮಾನ ಅಪಾಯಕ್ಕಾಗಿ)','upload.use-location':'ನನ್ನ ಸ್ಥಳ ಬಳಸು','upload.loc-status':'ಸ್ಥಳ ಸಿಕ್ಕಿಲ್ಲ — ಹವಾಮಾನ ಅಪಾಯ ಡಿಫಾಲ್ಟ್ ಬಳಸುತ್ತದೆ.','upload.back':'← ಹಿಂದಕ್ಕೆ','upload.run':'ವಿಶ್ಲೇಷಣೆ ನಡೆಸಿ','upload.geo-not-supported':'ಈ ಬ್ರೌಸರ್ ಜಿಯೋಲೆಕೆಷನ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.','upload.geo-detecting':'ಸ್ಥಳ ಪತ್ತೆಹಚ್ಚುತ್ತಿದೆ…','upload.geo-captured':'✔ ಸ್ಥಳಾಂಶ ಹಿಡಿಯಲಾಗಿದೆ','upload.geo-address':'✔ ಸ್ಥಳ:','upload.geo-fail':'ಸ್ಥಳ ಸಿಗಲಿಲ್ಲ. ಇದರಿಲ್ಲದೆ ಮುಂದುವರೆಯಲಾಗುತ್ತಿದೆ.',
    'hero.title':'ಸಸ್ಯಸ್ನೇಹಿ AI','hero.tagline':'ಭಾರತೀಯ ರೈತರಿಗೆ AI ಚಾಲಿತ ಬೆಳೆಯ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಸ್ಮಾರ್ಟ್ ಸಲಹೆ — ಕ್ಷಣಿಕ, ಬಹುಭಾಷಿ, ಉಚಿತ.',
    'hero.badge1':'🤖 ಮೊಬೈಲ್‌ನೆಟ್V2 AI','hero.badge2':'🌦 ಹವಾಮಾನ ಅಪಾಯ','hero.badge3':'⚗️ ರಾಸಾಯನಿಕ ಸುರಕ್ಷತೆ','hero.badge4':'💬 ಜೆಮಿನಿ ಚಾಟ್','hero.badge5':'🌐 ಹಿಂದಿ · ಕನ್ನಡ · ಇಂಗ್ಲಿಷ್','hero.badge6':'📈 ಎಂಎಲ್ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು','hero.badge7':'🏛 ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
    'hero.cta':'ವಿಶ್ಲೇಷಣೆ ಪ್ರಾರಂಭಿಸಿ →','hero.scroll':'↓ ಸ್ಕ್ರೋಲ್ ಮಾಡಿ',
    'alerts.heading':'🚨 ಸಕ್ರಿಯ ರೋಗ ಎಚ್ಚರಿಕೆಗಳು','alerts.sub':'ಐಸಿಎಆರ್ ಮತ್ತು ರಾಜ್ಯ ಕೃಷಿ ಇಲಾಖೆಗಳಿಂದ ಪ್ರಸ್ತುತ ಬೆಳೆಯ ರೋಗ ಸಲಹೆಗಳು.',
    'alerts.card1.crop':'ಟೊಮೆಟೊ','alerts.card1.title':'ಲೇಟ್ಬ್ಲೈಟ್ ಎಚ್ಚರಿಕೆ — ದಕ್ಷಿಣ ಕರ್ನಾಟಕ','alerts.card1.desc':'ಹೆಚ್ಚಿನ ತೇವಾಂಶ ಮತ್ತು ಚಳಿ ರಾತ್ರಿ Phytophthora infestans ವೃದ್ಧಿಗೆ ಕಾರಣ. 7 ದಿನಗಳ ಅಂತರದಲ್ಲಿ ಮ್ಯಾಂಕೋಜೆಬ್ ಅಥವಾ ಮೆಟಾಲ್ಯಾಕ್ಸಿಲ್ ಸಿಂಪಡಿಸಿ.',
    'alerts.card2.crop':'ಗೋಧಿ','alerts.card2.title':'ಹಳದಿ ಕಳಪೆ ಎಚ್ಚರಿಕೆ — ಪಂಜಾಬ್ ಮತ್ತು ಹರಿಯಾಣ','alerts.card2.desc':'ಸ್ಟ್ರೈಪ್ ರಸ್ಟ್ (Puccinia striiformis) ಶಿಘ್ರ ಬಿತ್ತನೆ ಹೊಲಗಳಲ್ಲಿ ವರದಿ. ಫ್ಲ್ಯಾಗ್-ಲೀಫ್ ಹಂತದಲ್ಲಿ ಪ್ರೊಪಿಕೊನಾಜೋಲ್ 25 EC ಸಿಂಪಡಿಸಿ.',
    'alerts.card3.crop':'ಆಲೂಗಡ್ಡೆ','alerts.card3.title':'ಆರ್ಲಿ ಬ್ಲೈಟ್ ಸಂಭವ — ಉತ್ತರ ಪ್ರದೇಶ ಮತ್ತು ಬಿಹಾರ','alerts.card3.desc':'ಬಿಸಿ ದಿನಗಳು ಮತ್ತು ತೇವ ರಾತ್ರಿ Alternaria solani ಹರಡುವಿಕೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತವೆ. ತಡೆಗಟ್ಟಲು ಕ್ಲೋರೋಥಾಲೊನಿಲ್ 75 WP ಬಳಸಿ.',
    'features.heading':'Sashyasnehi ಏನು ಮಾಡುತ್ತದೆ','features.sub':'ಎಂಟು ಬುದ್ಧಿವಂತ ಮಾಪಕಗಳು ಸೇರಿ ಸಂಪೂರ್ಣ ಬೆಳೆ ಆರೋಗ್ಯ ಒಳನೋಟ ನೀಡುತ್ತವೆ.',
    'features.f1.title':'ರೋಗ ಪತ್ತೆ','features.f1.desc':'MobileNetV2 ಟ್ರಾನ್ಸ್‌ಫರ್ ಲರ್ನಿಂಗ್ ಎಲೆ ಫೋಟೋಗಳಿಂದ ಬೆಳೆಯ ರೋಗಗಳನ್ನು 93%+ ಶುದ್ಧತೆಯಿಂದ ಗುರುತಿಸುತ್ತದೆ.',
    'features.f2.title':'ತೀವ್ರತೆ ಅಂದಾಜು','features.f2.desc':'HSV ಬಣ್ಣ ವಿಶ್ಲೇಷಣೆ ಸೋಂಕಿತ ಭಾಗದ ಶೇಕಡಾವಾರು ಅಳೆಯುತ್ತದೆ ಮತ್ತು ಸ್ವಲ್ಪ, ಮಧ್ಯಮ ಅಥವಾ ಗಂಭೀರ ಎಂದು ವರ್ಗಿಸುತ್ತದೆ.',
    'features.f3.title':'ಹವಾಮಾನ ಅಪಾಯ ಅಂಕ','features.f3.desc':'ಲೈವ್ OpenWeather ಡೇಟಾ — ತೇವಾಂಶ, ತಾಪಮಾನ, ಮಳೆ ಸಾಧ್ಯತೆ — ಒಟ್ಟು ರೋಗ ಅಪಾಯ ಅಂಕವನ್ನು ಚುರುಕಾಗಿ ಸರಿಹೊಂದುತ್ತದೆ.',
    'features.f4.title':'ರಾಸಾಯನಿಕ ಸುರಕ್ಷತೆ','features.f4.desc':'ಹಿಂದಿನ ರಾಸಾಯನಿಕಗಳನ್ನು ಸುರಕ್ಷತಾ ಡೇಟಾಬೇಸ್‌ನೊಂದಿಗೆ ಕ್ರಾಸ್‌ಚೆಕ್ ಮಾಡಿ ಅಪಾಯ ಸೂಚಿಸುತ್ತದೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಜೈವ ಪರ್ಯಾಯಗಳನ್ನು ಸಲಹೆ ನೀಡುತ್ತದೆ.',
    'features.f5.title':'ಸ್ಮಾರ್ಟ್ ಸಲಹೆ','features.f5.desc':'ನಿಯಮಾಧಾರಿತ ಎಂಜಿನ್ ಚಿಕಿತ್ಸೆ ಹಂತಗಳು, ನೀರಾವರಿ ಸಲಹೆ ಮತ್ತು ಮಣ್ಣಿನ-ನಿರ್ದಿಷ್ಟ ಮಾರ್ಗದರ್ಶನ ರಚಿಸುತ್ತದೆ.',
    'features.f6.title':'ಜೆಮಿನಿ AI ಚಾಟ್','features.f6.desc':'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮುಂದಿನ ಪ್ರಶ್ನೆಗಳು ಕೇಳಿ. ಗೂಗಲ್ ಜೆಮಿನಿ ತಕ್ಷಣವೇ ಹೊಲ-ಸಂದರ್ಭದ ಉತ್ತರ ನೀಡುತ್ತದೆ.',
    'features.f7.title':'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು','features.f7.desc':'1,000+ APMC ಗಳಿಂದ ಲೈವ್ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು, ರಿಡ್ಜ್ ರಿಗ್ರೆಷನ್ (R²=0.95) ಮೂಲಕ ಮುಂದಿನ ವಾರದ ಪೂರ್ವಾನುಮಾನ.',
    'features.f8.title':'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು','features.f8.desc':'PM-KISAN, PMFBY, eNAM ಮತ್ತು ರಾಜ್ಯ ಯೋಜನೆಗಳು ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ಸ್ಥಳಕ್ಕೆ ತಕ್ಷಣ ಜೋಡಿಸುತ್ತವೆ.',
    'steps.heading':'ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ','steps.sub':'ಪೂರ್ಣ ಬೆಳೆ ಆರೋಗ್ಯ ವರದಿಗೆ ನಾಲ್ಕು ಸರಳ ಹಂತಗಳು.',
    'steps.s1.title':'ಚಿತ್ರ ಅಪ್ಲೋಡ್','steps.s1.desc':'ರೋಗಗ್ರಸ್ಥ ಎಲೆಯ ಕ್ಲೋಸ್-ಅಪ್ ಫೋಟೋ ತೆಗೆಯಿಸಿ ಅಪ್ಲೋಡ್ ಮಾಡಿ.',
    'steps.s2.title':'ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ','steps.s2.desc':'ಬಳಸಿದ ರಾಸಾಯನಿಕಗಳು, ಮಣ್ಣಿನ ಪ್ರಕಾರ, ನೀರಾವರಿ ಪದ್ಧತಿ ಮತ್ತು ಐಚ್ಛಿಕ ಸ್ಥಳ ಸೇರಿಸಿ.',
    'steps.s3.title':'AI ವಿಶ್ಲೇಷಿಸುತ್ತದೆ','steps.s3.desc':'ರೋಗ ಮಾದರಿ, ತೀವ್ರತೆ ಎಂಜಿನ್ ಮತ್ತು ಹವಾಮಾನ ಅಪಾಯ ಕ್ಷಣಗಳಲ್ಲಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುತ್ತವೆ.',
    'steps.s4.title':'ಸಲಹೆ ಪಡೆಯಿರಿ','steps.s4.desc':'ವಿಸ್ತೃತ ಚಿಕಿತ್ಸೆ ಸಲಹೆ ಓದಿ ಮತ್ತು ಮುಂದಿನ ಸಹಾಯಕ್ಕೆ ಜೆಮಿನಿಯೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ.',
    'stats.diseases':'ಬೆಳೆ ರೋಗಗಳು','stats.modules':'AI ಘಟಕಗಳು','stats.accuracy':'ಮಾದರಿ ಶುದ್ಧತೆ','stats.languages':'ಭಾಷೆಗಳು','stats.priceModels':'ಬೆಲೆ ಮಾದರಿಗಳು','stats.cost':'ಬಳಕೆಯ ವೆಚ್ಚ',
    'calendar.heading':'📅 ಋತುಮಾನ ಬೆಳೆಯ ಕ್ಯಾಲೆಂಡರ್ — ಭಾರತ','calendar.sub':'ಅತ್ಯುತ್ತಮ ಫಲಕ್ಕಾಗಿ ಪ್ರತೀ ಋತುವಿನಲ್ಲಿ ಏನು ಬಿತ್ತಬೇಕು, ಏನು ಕೊಯ್ಲು ಮಾಡಬೇಕು.',
    'calendar.kharif.badge':'ಖರೀಫ್ (ಜೂನ್–ಅಕ್ಟೋ)','calendar.kharif.title':'ಬಿತ್ತಿಸಿ & ಬೆಳೆಸಿ','calendar.kharif.rice':'ಅಕ್ಕಿ (ಧಾನ್ಯ)','calendar.kharif.cotton':'ಕಾಪಸ್','calendar.kharif.maize':'ಜೋಳ / ಮಾಯ್ಸ್','calendar.kharif.groundnut':'ಕಡಲೆ (ಕಡಲೆಕಾಯಿ)','calendar.kharif.sugarcane':'ಕರಿಬೇಲು','calendar.kharif.soybeans':'ಸೋಯಾಬೀನ್',
    'calendar.rabi.badge':'ರಬಿ (ನವೆಂ–ಮಾರ್ಚ್)','calendar.rabi.title':'ಬಿತ್ತಿಸಿ & ಬೆಳೆಸಿ','calendar.rabi.wheat':'ಗೋಧಿ','calendar.rabi.mustard':'ಸಾಸಿವೆ','calendar.rabi.chickpea':'ಕಡಲೆ / ಚೆಕ್ಕೆಕಾಳು','calendar.rabi.peas':'ಬಟಾಣಿ','calendar.rabi.barley':'ಜೋ','calendar.rabi.potato':'ಆಲೂಗಡ್ಡೆ',
    'calendar.zaid.badge':'ಜೈದ್ (ಮಾರ್ಚ್–ಜೂನ್)','calendar.zaid.title':'ಬಿತ್ತಿಸಿ & ಬೆಳೆಸಿ','calendar.zaid.watermelon':'ಕಲ್ಲಂಗಡಿ','calendar.zaid.muskmelon':'ಕರಬೂಜಾ','calendar.zaid.cucumber':'ಸೌತೆಕಾಯಿ','calendar.zaid.bittergourd':'ಹಾಗಲಕಾಯಿ','calendar.zaid.fodder':'ಮೇವು ಬೆಳೆಗಳು','calendar.zaid.moong':'ಹೆಸರುಕಾಳು',
    'calendar.year.badge':'ವರ್ಷಪೂರ್ತಿ','calendar.year.title':'ತರಕಾರಿಗಳು','calendar.year.tomato':'ಟೊಮೆಟೊ','calendar.year.onion':'ಈರುಳ್ಳಿ','calendar.year.capsicum':'ಶಿಮ್ಲಾ ಮೆಣಸಿನಕಾಯಿ','calendar.year.brinjal':'ಬದನೇಕಾಯಿ','calendar.year.chilli':'ಮೆಣಸಿನಕಾಯಿ','calendar.year.greens':'ಹಸಿರು ಎಲೆ ತರಕಾರಿಗಳು',
    'tips.heading':'💡 ತ್ವರಿತ ಕೃಷಿ ಸಲಹೆಗಳು','tips.sub':'ಆರೋಗ್ಯಕರ ಬೆಳೆಗಳಿಗಾಗಿ ವಿಜ್ಞಾನ ಆಧಾರಿತ ಅಭ್ಯಾಸಗಳು.',
    'tips.t1.title':'ಬೆಳಿಗ್ಗೆ ಸಿಂಪಡಿಸಿ','tips.t1.desc':'ಹುಳುನಾಶಕ/ಶಿಲೀಂಧ್ರನಾಶಕಗಳನ್ನು ಬೆಳಿಗ್ಗೆ 6–9ಕ್ಕೆ ಸಿಂಪಡಿಸಿ; ಗಾಳಿ ಶಾಂತ, ತಾಪಮಾನ ಕಡಿಮೆ, ಹರಿವು ಕಡಿಮೆ.',
    'tips.t2.title':'ಫ್ಲಡ್ ಬದಲು ಡ್ರಿಪ್','tips.t2.desc':'ಡ್ರಿಪ್ ನೀರಾವರಿ 40–50% ನೀರು ಉಳಿಸುತ್ತದೆ, ಸಸ್ಯಗಳ ಹತ್ತಿರ ತೇವಾಂಶ ಕಡಿಮೆ ಮಾಡಿ ಫಂಗಲ್ ರೋಗಗಳನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.',
    'tips.t3.title':'ಬೆಳೆ ಪರಿವರ್ತನೆ ಮುಖ್ಯ','tips.t3.desc':'ಟೊಮೆಟೊವನ್ನು ಅಸೋಲನೇಸಿಯಸ್ ಬೆಳೆಗಳೊಂದಿಗೆ ತಿರುಗಿಸುವುದು ಕೀಟ ಚಕ್ರ ಮುರಿಯುತ್ತದೆ. ನಿರಂತರ ಟೊಮೆಟೊ/ಆಲೂ ಬಿತ್ತಬೇಡಿ.',
    'tips.t4.title':'ಪ್ರತಿ ಸೀಸನ್ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ','tips.t4.desc':'ಪ್ರತಿ ಬೆಳೆಗೂ ಮೊದಲು NPK, pH ಮತ್ತು ಸೂಕ್ಷ್ಮ ಪೋಷಕಗಳ ಪರೀಕ್ಷೆ ಮಾಡಿ. ಅಂದಾಜು ಗೊಬ್ಬರವೇ ವಿಷ ಮತ್ತು ಉತ್ಪಾದನ ಹಾನಿಗೆ ಕಾರಣ.',
    'tips.t5.title':'ವಾರದ ಕೀಟ ವೀಕ್ಷಣೆ','tips.t5.desc':'ಪ್ರತಿ 7 ದಿನವೂ ಹೊಲ ಸುತ್ತಾಡಿ. ಎಲೆಯ ಕೆಳಭಾಗದ ಅಂಡೆಗಳ ಮುಂಚಿತ ಪತ್ತೆ 80% ರಾಸಾಯನಿಕ ಹಸ್ತಕ್ಷೇಪ ತಡೆಯುತ್ತದೆ.',
    'tips.t6.title':'ಮೊದಲ ರಕ್ಷಣೆ ನೀಮ್ ಎಣ್ಣೆ','tips.t6.desc':'2–3 mL/L ನೀಮ್ ಎಣ್ಣೆ 200+ ಕೀಟ ಪ್ರಭೇದಗಳ ಮೇಲೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ, ಜೇನು ಮತ್ತು ಮನುಷ್ಯರಿಗೆ ಸುರಕ್ಷಿತ, ಪ್ರತಿರೋಧ ನಿರ್ಮಾಣವನ್ನು ನಿಧಾನಗೊಳಿಸುತ್ತದೆ.',
    'cta.heading':'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ರೋಗನಿರ್ಣಯಕ್ಕೆ ಸಿದ್ಧವೇ?','cta.sub':'ಒಂದು ಎಲೆ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ, 10 ಸೆಕೆಂಡ್ ಒಳಗೆ ಪೂರ್ಣ AI ಸಲಹೆ ಉಚಿತವಾಗಿ ಪಡೆಯಿರಿ.',
    'cta.btn1':'🧬 ನನ್ನ ಬೆಳೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ','cta.btn2':'💬 ಸಮುದಾಯ ಸೇರಿ',
    'footer.text':'Sashyasnehi AI © 2025 · Flask, TensorFlow ಮತ್ತು Gemini ನಲ್ಲಿ ನಿರ್ಮಿತ','footer.community':'ಸಮುದಾಯ','footer.market':'ಮಾರುಕಟ್ಟೆ','footer.about':'ನಮ್ಮ ಬಗ್ಗೆ','footer.home':'ಮನೆ',
    'community.title':'ರೈತರ ಸಮುದಾಯ','community.sub':'ಬೆಳೆ ರೋಗಗಳನ್ನು ಚರ್ಚಿಸಿ, ಅನುಭವ ಹಂಚಿಕೊಳ್ಳಿ ಮತ್ತು ಪರಸ್ಪರ ಸಹಾಯ ಮಾಡಿ.','community.ask':'+ ಒಂದು ಪ್ರಶ್ನೆ ಕೇಳಿ','community.stat.posts':'ಪೋಸ್ಟ್‌ಗಳು','community.stat.replies':'ಪ್ರತಿಕ್ರಿಯೆಗಳು','community.stat.solved':'ಪರಿಹರಿಸಲಾಗಿದೆ','community.search':'🔍 ಚರ್ಚೆಗಳನ್ನು ಹುಡುಕಿ...','community.allPlants':'ಎಲ್ಲಾ ಬೆಳೆಗಳು','community.allStates':'ಎಲ್ಲಾ ರಾಜ್ಯಗಳು','community.filter':'ಫಿಲ್ಟರ್','community.by':'ರಿಂದ','community.views':'ವೀಕ್ಷಣೆಗಳು','community.solved':'✓ ಪರಿಹರಿಸಲಾಗಿದೆ','community.replies':'ಪ್ರತಿಕ್ರಿಯೆಗಳು','community.empty':'ಇನ್ನೂ ಯಾವುದೇ ಚರ್ಚೆಗಳಿಲ್ಲ. ಮೊದಲದನ್ನು ಪ್ರಾರಂಭಿಸಿ!','market.title':'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ವಿಶ್ಲೇಷಣೆ','market.sub':'AgMarknet (data.gov.in) ನಿಂದ ರಿಯಲ್-ಟೈಮ್ ಬೆಲೆಗಳು ಮತ್ತು ML ಟ್ರೆಂಡ್ ಪೂರ್ವಾನುಮಾನ.','market.allStates':'ಎಲ್ಲಾ ರಾಜ್ಯಗಳು','market.refresh':'ರಿಫ್ರೆಶ್','market.kpi.avg':'ಸರಾಸರಿ ಬೆಲೆ / ಕ್ವಿಂಟಾಲ್','market.kpi.min':'ಕನಿಷ್ಠ ಬೆಲೆ','market.kpi.max':'ಗರಿಷ್ಠ ಬೆಲೆ','market.kpi.median':'ಮಧ್ಯಮ ಬೆಲೆ','market.kpi.trend':'ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿ','market.kpi.prediction':'ML ಊಹೆ (ಮುಂದಿನ ವಾರ)','market.kpi.predictionShort':'ಮುಂದಿನ ವಾರದ ಅಂದಾಜು','market.dataSource':'ಮಾಹಿತಿ ಮೂಲ:','market.model':'ಪ್ರಿಡಿಕ್ಷನ್ ಮಾದರಿ:','market.history':'ಬೆಲೆ ಇತಿಹಾಸ','market.table.market':'ಮಾರುಕಟ್ಟೆ','market.table.state':'ಜಿಲ್ಲೆ / ರಾಜ್ಯ','market.table.min':'ಕನಿಷ್ಠ (₹)','market.table.max':'ಗರಿಷ್ಠ (₹)','market.table.modal':'ಮೋಡಲ್ (₹)','market.empty':'ಮಾರುಕಟ್ಟೆ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.','market.emptyHint':'ನಿಮ್ಮ .env ಗೆ DATA_GOV_API_KEY ಸೇರಿಸಿ','market.footer':'ಮಾರುಕಟ್ಟೆ ಡೇಟಾ ಮೂಲ',
    'result.h1':'ವಿಶ್ಲೇಷಣೆ ವರದಿ',
    'result.h1-sub':'ನಿಮ್ಮ ಅಪ್ಲೋಡ್ ಮಾಡಿದ ಚಿತ್ರ ಮತ್ತು ಜಮೀನಿನ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ AI ಸಲಹೆ.',
    'result.forecast-title':'7 ದಿನಗಳ ಪೂರ್ವಾನುಮಾನ','result.panel-advisory':'ಬೆಳೆ ಸಲಹೆ —','result.spray-window':'ಉತ್ತಮ ಸಿಂಪಡಣೆ ಸಮಯ:','result.spray-ok':'ಸಿಂಪಡಿಸಬಹುದು','result.spray-no':'ಸಿಂಪಡಿಸಬೇಡಿ','result.weather-unavailable':'ಹವಾಮಾನ ಪೂರ್ವಾನುಮಾನ ಲಭ್ಯವಿಲ್ಲ.','result.weather-add-key':'OPENWEATHER_API_KEY ಸೇರಿಸಿ ಮತ್ತು ಅಪ್ಲೋಡ್ ಪುಟದಲ್ಲಿ ಸ್ಥಳ ಪಡೆಯಿರಿ.',
    'result.disease-detection':'ರೋಗ ಪತ್ತೆ',
    'result.label-plant':'ಸಸ್ಯ','result.label-disease':'ಪತ್ತೆಯಾದ ರೋಗ',
    'result.label-confidence':'ಮಾದರಿ ವಿಶ್ವಾಸ','result.label-severity':'ತೀವ್ರತೆ',
    'result.env-risk':'ಪರಿಸರ ಅಪಾಯ','result.label-risk':'ಅಪಾಯ ಮಟ್ಟ:',
    'result.label-humidity':'ತೇವಾಂಶ','result.label-temp':'ತಾಪಮಾನ',
    'result.label-rain':'ಮಳೆ ಸಂಭಾವ್ಯತೆ',
    'result.advisory':'ಬೆಳೆ ಸಲಹೆ',
    'result.h3-summary':'ಸಾರಾಂಶ','result.h3-causes':'ಸಂಭವನೀಯ ಕಾರಣಗಳು',
    'result.h3-actions':'ಶಿಫಾರಸು ಕ್ರಮಗಳು',
    'result.chemicals':'ರಾಸಾಯನಿಕ ಸುರಕ್ಷತೆ ವಿಶ್ಲೇಷಣೆ','result.chem-avoid':'ತಪ್ಪಿಸಬೇಕಾದ ರಾಸಾಯನಿಕಗಳು','result.chem-alt':'ಭದ್ರ ಪರ್ಯಾಯಗಳು',
    'result.community-title':'ಸಮುದಾಯದಲ್ಲಿ ಇದೇ ರೀತಿಯ ಸಮಸ್ಯೆಗಳು',
    'result.post-issue':'ಈ ಸಮಸ್ಯೆ ಪೋಸ್ಟ್ ಮಾಡಿ',
    'result.view-discussions':'ಎಲ್ಲಾ ಚರ್ಚೆಗಳನ್ನು ನೋಡಿ','result.community-empty':'ಈ ಬೆಳೆ/ರೋಗಕ್ಕಾಗಿ ಚರ್ಚೆಗಳು ಇಲ್ಲ. ಮೊದಲ ಪೋಸ್ಟ್ ಮಾಡಿ!','result.market-title':'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು','result.mkt-avg':'ಸರಾಸರಿ ಬೆಲೆ','result.mkt-trend':'ಪ್ರವೃತ್ತಿ','result.mkt-predict':'ಅಂದಾಜು (ಮುಂದಿನ ವಾರ)','result.live-market':'ಲೈವ್ ಮಾರುಕಟ್ಟೆ ದರಗಳು','result.market-full':'ಪೂರ್ಣ ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ','result.market-unavailable':'ಮಾರುಕಟ್ಟೆ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.','result.schemes-title':'ರೈತ ಯೋಜನೆಗಳು','result.schemes-unavailable':'ಸರ್ಕಾರಿ ಯೋಜನೆ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.','result.weather-missing':'ಹವಾಮಾನ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ — OPENWEATHER_API_KEY ಸೇರಿಸಿ ಮತ್ತು ಸ್ಥಳ ಪಡೆಯಿರಿ.','result.severe-title':'ಗಂಭೀರ ಸ್ಥಿತಿ — ನೆರೆಯ ಸಹಾಯ','result.severe-text':'ಗಂಭೀರತೆ ಹೆಚ್ಚು. ಸಮೀಪದ ಕೃಷಿ ತಜ್ಞರಿಂದ ಸಲಹೆ ಪಡೆಯಿರಿ.','result.btn-nursery':'ಸಮೀಪದ ನರ್ಸರಿ','result.btn-consultant':'ಕೃಷಿ ಸಲಹೆಗಾರ',
    'result.chat-desc1':'Gemini AI ಸಂಭಾಷಣೆ ಭಾಷೆ',
    'result.chat-title':'AI ಅನ್ನು ನಿಮ್ಮ ಬೆಳೆ ಬಗ್ಗೆ ಕೇಳಿ',
    'result.chat-desc2':'ಅನುಸರಣ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ — ಅದು ಇಡೀ ಚಾಟ್ ನೆನಪಿಟ್ಟುಕೊಳ್ಳುತ್ತದೆ.',
    'result.chat-send':'ಕಳುಹಿಸಿ',
    'result.chat-placeholder':'ಏನಾದರೂ ಕೇಳಿ... ಉದಾ. ಎಷ್ಟು ಬಾರಿ ಸ್ಪ್ರೇ ಮಾಡಬೇಕು?',
    'result.new-analysis':'← ಹೊಸ ವಿಶ್ಲೇಷಣೆ','result.home-btn':'ಮನೆ',
    'panel.insights':'ಜಮೀನಿನ ಮಾಹಿತಿ','panel.weather':'ಹವಾಮಾನ',
    'panel.market-tab':'ಮಾರುಕಟ್ಟೆ','panel.schemes':'ಯೋಜನೆಗಳು',
    'news.title':'ಕೃಷಿ ಸುದ್ದಿ',
    'dtab.news':'ಸುದ್ದಿ','dtab.insights':'ಮಾಹಿತಿ',
    'fert.title':'ರಸಗೊಬ್ಬರ ಕ್ಯಾಲ್ಕುಲೇಟರ್','fert.badge':'ಆಫ್‌ಲೈನ್ ಸಿದ್ಧ','fert.desc':'ಪ್ರಮುಖ ಬೆಳೆಗಳಿಗೆ ವಾಸ್ತವವಾದ NPK ಹಂಚಿಕೆ, ಪ್ರಸ್ತುತ ಚಿಲ್ಲರೆ ಬೆಲೆಗಳು (ಸರಕಾರ ನಿಯಂತ್ರಿತ MRP, ಫೆಬ್ರವರಿ 2026).','fert.inputs':'ಇನ್‌ಪುಟ್','fert.input.crop':'ಬೆಳೆ','fert.input.soil':'ಮಣ್ಣಿನ ಪ್ರಕಾರ','fert.input.area':'ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)','fert.input.yield':'ಗುರಿ ಉತ್ಪಾದನೆ (ಟನ್/ಹೆಕ್ಟೇರ್, ಐಚ್ಛಿಕ)','fert.btn.calc':'ಲೆಕ್ಕಿಸಿ','fert.btn.reset':'ರಿಸೆಟ್','fert.rec.title':'ಶಿಫಾರಸು','fert.rec.npk':'NPK ಅಗತ್ಯ (ಕಿ.ಗ್ರಾಂ/ಎಕರೆ)','fert.rec.mix':'ಉತ್ಪನ್ನ ಮಿಶ್ರಣ','fert.rec.cost':'ಅಂದಾಜು ವೆಚ್ಚ','fert.rec.split':'ಅಪ್ಲಿಕೇಶನ್ ವಿಭಾಗ','fert.rec.notes':'ಸೂಚನೆಗಳು','fert.table.title':'ಚಿಲ್ಲರೆ ಮಾನದಂಡ (ಸರ್ಕಾರಿ MRP / ಸಾಮಾನ್ಯ ಮಾರುಕಟ್ಟೆ)','fert.table.head.product':'ಉತ್ಪನ್ನ','fert.table.head.npk':'N-P-K%','fert.table.head.bag':'ಚೀಲ ಗಾತ್ರ','fert.table.head.price':'ಬೆಲೆ (₹/ಚೀಲ)','fert.product.urea':'ಯೂರಿಯಾ','fert.product.dap':'DAP','fert.product.mop':'MOP','fert.product.mop.full':'MOP (ಮ್ಯೂರಿಯೇಟ್ ಆಫ್ ಪೊಟಾಶ್)','fert.product.ssp':'SSP (ಸಿಂಗಲ್ ಸೂಪರ್ ಫಾಸ್ಫೇಟ್)','fert.error.area':'ವಿಸ್ತೀರ್ಣ ನಮೂದಿಸಿ','fert.cost.text':'≈ ₹{cost} / {area} ಎಕರೆ','fert.split.text':'ಬೇಸಲ್: 50% N + 100% P + 50% K. 30-35 DAS ಮತ್ತು ಪ್ಯಾನಿಕಲ್/ಪೂಷ್ಪ ಹಂತದಲ್ಲಿ N ಟಾಪ್‌ಡ್ರೆಸ್ ಮಾಡಿ.','fert.ssp.note':'ಸಲ್ಫರ್ ಕೊರತೆಯಿದ್ದರೆ 1 ಚೀಲ SSP ಸೇರಿಸಿ.','fert.word.bags':'ಚೀಲಗಳು','fert.cost.unit.acre':'ಎಕರೆ','fert.soil.loam':'ಲೋಮ್','fert.soil.clay':'ಕಳ್ಮಣ್ಣು','fert.soil.sandy':'ಮರಳು','fert.crop.rice':'ಅಕ್ಕಿ','fert.crop.wheat':'ಗೋಧಿ','fert.crop.maize':'ಜೋಳ','fert.crop.tomato':'ಟೊಮೆಟೊ','fert.crop.potato':'ಆಲೂಗಡ್ಡೆ','fert.crop.cotton':'ಕಾಪಾಸ್','fert.note.rice':'ರೋಪಿತ ಅಕ್ಕಿ, ನೀರಾವರಿ.','fert.note.wheat':'ಸಮಯಕ್ಕೆ ಬಿತ್ತನೆ, ನೀರಾವರಿ.','fert.note.maize':'ಹೈಬ್ರಿಡ್ ಜೋಳ, ಮಧ್ಯಮ ಫಲವತ್ತತೆ.','fert.note.tomato':'ಮುಕ್ತ ಕ್ಷೇತ್ರ, ಕಂಬ ಕೊಡು.','fert.note.potato':'ನೀರಾವರಿ, ನ್ಯೂಟ್ರಲ್ pH.','fert.note.cotton':'ಬಿಟಿ ಕಾಪಾಸ್, ನೀರಾವರಿ.',
    'cult.title':'ಬೆಳೆ ಪ್ಲೇಬುಕ್‌ಗಳು','cult.badge':'ಕ್ಷೇತ್ರ-ಸಿದ್ಧ','cult.desc':'ಪ್ರಾಂತ ಆಧಾರಿತ ಬಿತ್ತನೆ ಸಮಯ, ಬೀಜ ದರ, ಅಂತರ, ರಸಗೊಬ್ಬರ ಹಂಚಿಕೆ, ನೀರಾವರಿ ಮತ್ತು ಕೀಟ ವೀಕ್ಷಣೆ. ಡೇಟಾ 2025-26ರ ಭಾರತೀಯ ಪದ್ಧತಿಯನ್ನು ಪ್ರತಿಬಿಂಬಿಸುತ್ತದೆ.','cult.find.title':'ನಿಮ್ಮ ಸ್ಥಳಕ್ಕೆ ಸೂಕ್ತ ಬೆಳೆಗಳನ್ನು ಹುಡುಕಿ','cult.find.state':'ರಾಜ್ಯ','cult.find.district':'ಜಿಲ್ಲೆ','cult.find.taluk':'ತಾಲೂಕು','cult.find.statePh':'ಉದಾ., ಕರ್ನಾಟಕ','cult.find.districtPh':'ಐಚ್ಛಿಕ','cult.find.talukPh':'ಐಚ್ಛಿಕ','cult.find.button':'ಬೆಳೆಗಳನ್ನು ಸೂಚಿಸಿ','cult.find.offlineNote':'ರಾಜ್ಯ ಆಧಾರಿತ ಆಫ್‌ಲೈನ್ ಹೂರಣ; ಯಾವುದೇ ಬಾಹ್ಯ API ಕರೆಗಳಿಲ್ಲ.','cult.loc.title':'ಸ್ಥಳ ಸೂಕ್ತತೆ','cult.loc.addState.label':'ರಾಜ್ಯ ಸೇರಿಸಿ','cult.loc.addState.value':'ನಿಮ್ಮಿಗೆ ಸರಿಹೊಂದಿದ ಬೆಳೆಗಳನ್ನು ನೋಡಲು ರಾಜ್ಯ ನಮೂದಿಸಿ.','cult.loc.noMatch.label':'ನಿಖರ ಹೊಂದಿಕೆ ಇಲ್ಲ','cult.loc.noMatch.value':'ಸಾಮಾನ್ಯ ಪ್ಲೇಬುಕ್ ತೋರಿಸುತ್ತಿದೆ. ಪೂರ್ಣ ರಾಜ್ಯ ಹೆಸರು ಪ್ರಯತ್ನಿಸಿ.','cult.loc.how':'ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ','cult.loc.how.desc':'ರಾಜ್ಯ/ಮಣ್ಣು-ಹವಾಮಾನ ಹೂರಣದ ಆಫ್‌ಲೈನ್ ಸೂಕ್ತತೆ. ಯಾವುದೇ ಬಾಹ್ಯ API (ಸರ್ವರ್ ಲಭ್ಯವಿಲ್ಲ).','cult.badge.match':'ನಿಮ್ಮ ಸ್ಥಳಕ್ಕೆ ಹೊಂದಿದೆ','cult.badge.guide':'ಕ್ಷೇತ್ರ ಮಾರ್ಗದರ್ಶಿ','cult.label.sowing':'ಬಿತ್ತನೆ:','cult.label.seed':'ಬೀಜ ದರ:','cult.label.spacing':'ಅಂತರ:','cult.label.fert':'ರಸಗೊಬ್ಬರ:','cult.label.irrigation':'ನೀರಾವರಿ:','cult.label.pest':'ಕೀಟ ವೀಕ್ಷಣೆ:',
    'cult.crop.rice.name':'ಅಕ್ಕಿ (ಖರೀಫ್)','cult.crop.rice.regions':'ಪಂಜಾಬ್, ಹರಿಯಾಣ, ಯುಪಿ, ಬಿಹಾರ, ಎಪಿ, ತಮಿಳುನಾಡು','cult.crop.rice.window':'ನರ್ಸರಿ: ಜೂನ್ 10-30 · ರೋಪಣೆ: ಜುಲೈ 1-20','cult.crop.rice.seed':'6-8 ಕಿ.ಗ್ರಾಂ/ಎಕರೆ (ನರ್ಸರಿ)','cult.crop.rice.spacing':'20x15 ಸೆಂ (SRI 25x25 ಸೆಂ)','cult.crop.rice.fert':'NPK 40:20:20 ಕಿ.ಗ್ರಾಂ/ಎಕರೆ; ಬೇಸಲ್ 50% N + ಸಂಪೂರ್ಣ P+K; N ಟಾಪ್‌ಡ್ರೆಸ್ 25 ಮತ್ತು 45 DAT','cult.crop.rice.irrigation':'ಪಡ್ಡೆ, 2-5 ಸೆಂ ನೀರು; ಟಿಲ್ಲರಿಂಗ್ ಬಳಿಕ AWD','cult.crop.rice.pest':'ಸ್ಟೆಮ್ ಬೋರರ್, BPH, ಬ್ಲಾಸ್ಟ್; ETL ನಲ್ಲಿ ಮಾತ್ರ ಸಿಂಪಡಿಸಿ; ಕ್ರಿಯಾ ಗುಂಪು ಬದಲಿಸಿ',
    'cult.crop.wheat.name':'ಗೋಧಿ (ರಬಿ)','cult.crop.wheat.regions':'ಪಂಜಾಬ್, ಹರಿಯಾಣ, ಯುಪಿ, ಎಂಪಿ','cult.crop.wheat.window':'ನವೆಂ 10-30 (ಸಮಯಕ್ಕೆ), ಡಿಸೆಂ 1-15 (ದೇರಿಯಲ್ಲಿ)','cult.crop.wheat.seed':'40-45 ಕಿ.ಗ್ರಾಂ/ಎಕರೆ (HD ಜಾತಿಗಳು)','cult.crop.wheat.spacing':'22.5 ಸೆಂ ಸಾಲು; ದೇರಿಯಲ್ಲಿ 18 ಸೆಂ','cult.crop.wheat.fert':'NPK 45:20:20 ಕಿ.ಗ್ರಾಂ/ಎಕರೆ; 50% N ಬೇಸಲ್, 50% N ಕ್ರೌನ್ ರೂಟ್ (21 DAS) ನಲ್ಲಿ','cult.crop.wheat.irrigation':'CRI (21 DAS) ಮುಖ್ಯ; ನಂತರ ಟಿಲ್ಲರಿಂಗ್, ಜಾಯಿಂಟಿಂಗ್, ಬೂಟಿಂಗ್, ಮಿಲ್ಕಿಂಗ್','cult.crop.wheat.pest':'ರಸ್ಟ್ (ಹಳದಿ/ಎಲೆ), ಆಫಿಡ್; ನಿಯಮಿತ ವೀಕ್ಷಣೆ',
    'cult.crop.maize.name':'ಜೋಳ (ಖರೀಫ್)','cult.crop.maize.regions':'ಕರ್ನಾಟಕ, ಮಹಾರಾಷ್ಟ್ರ, ತೆಲಂಗಾಣ, ಎಂಪಿ','cult.crop.maize.window':'ಜೂನ್ 15-ಜುಲೈ 15; ಎಪಿ/ಟಿಎಸ್ ರಬಿ ಜೋಳ: ಅಕ್ಟೋ 15-ನವ್ 15','cult.crop.maize.seed':'8-10 ಕಿ.ಗ್ರಾಂ/ಎಕರೆ ಹೈಬ್ರಿಡ್','cult.crop.maize.spacing':'60x20 ಸೆಂ','cult.crop.maize.fert':'NPK 50:25:25 ಕಿ.ಗ್ರಾಂ/ಎಕರೆ; 50% N ಬೇಸಲ್, 25% V6 ನಲ್ಲಿ, 25% VT ನಲ್ಲಿ','cult.crop.maize.irrigation':'ಟ್ಯಾಸಿಲಿಂಗ್-ಸಿಲ್ಕಿಂಗ್‌ನಲ್ಲಿ ಸಂವೇದನಶೀಲ; ನಿಂತ ನೀರು ಬಿಡಬೇಡಿ','cult.crop.maize.pest':'FAW ಗೆ ವಾರಕ್ಕೆ ಎರಡು ಬಾರಿ ವೀಕ್ಷಣೆ; ಫೆರೋಮೋನ್ ಟ್ರಾಪ್; ಕ್ರಿಯಾಮೋಡ್ ಬದಲಿಸಿ',
    'cult.crop.tomato.name':'ಟೊಮೆಟೊ (ಮುಕ್ತ ಕ್ಷೇತ್ರ)','cult.crop.tomato.regions':'ಕರ್ನಾಟಕ, ಎಪಿ, ತೆಲಂಗಾಣ, ಮಹಾರಾಷ್ಟ್ರ','cult.crop.tomato.window':'ನರ್ಸರಿ: ನವೆಂ-ಜನವರಿ ಅಥವಾ ಜೂನ್-ಜುಲೈ; ರೋಪಣೆ 25-30 ದಿನ','cult.crop.tomato.seed':'25-30 ಗ್ರಾಂ/ಎಕರೆ ನರ್ಸರಿ','cult.crop.tomato.spacing':'90x45 ಸೆಂ (ಸಹಾರಾ) ಅಥವಾ 60x45 ಸೆಂ','cult.crop.tomato.fert':'NPK 60:30:40 ಕಿ.ಗ್ರಾಂ/ಎಕರೆ; N ಮತ್ತು K ಅನ್ನು 4-5 ಫರ್ಟಿಗೇಷನ್ ಡೋಸ್‌ಗಳಲ್ಲಿ ವಿಭಜಿಸಿ','cult.crop.tomato.irrigation':'ಮಣ್ಣನ್ನು ತೇವವಾಗಿಡಿ; ಡ್ರಿಪ್ ಉತ್ತಮ; ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿ','cult.crop.tomato.pest':'ಟ್ಯೂಟಾ, ಫ್ರೂಟ್ ಬೋರರ್, ಅEarly/late blight; ಯೆಲ್ಲೋ ಸ್ಟಿಕ್ಕಿ ಟ್ರಾಪ್',
    'cult.crop.potato.name':'ಆಲೂಗಡ್ಡೆ','cult.crop.potato.regions':'ಯುಪಿ, ಪಂಜಾಬ್, ಗುಜರಾತ್, ಪಶ್ಚಿಮ ಬಂಗಾಳ','cult.crop.potato.window':'ನೆಡುವಿಕೆ ಅಕ್ಟೋ 25-ಡಿಸೆ 10 (ಉತ್ತರ); ಸೆಪ್ಟೆಂ 15-ಅಕ್ಟೋ 15 (ಹಿಲ್)','cult.crop.potato.seed':'6-8 ಕ್ವಿಂಟಲ್/ಎಕರೆ (30-40 ಮಿಮೀ ಬೀಜ ಕಂದ)','cult.crop.potato.spacing':'60x20 ಸೆಂ (ರೆಜ್)','cult.crop.potato.fert':'NPK 65:30:50 ಕಿ.ಗ್ರಾಂ/ಎಕರೆ; 50% N ಬೇಸಲ್, 50% N ಇರ್ಥಿಂಗ್-ಅಪ್‌ನಲ್ಲಿ','cult.crop.potato.irrigation':'ನೆಡುವ ಬಳಿಕ ಹಗುರ ನೀರಾವರಿ, ನಂತರ ಅಂಕುರ, ಕಂದ ಸೆಟ್, ಬಲ್ಕಿಂಗ್‌ನಲ್ಲಿ','cult.crop.potato.pest':'ಲೆಟ್ ಬ್ಲೈಟ್ ವೀಕ್ಷಣೆ (40-45 DAP); ಆಫಿಡ್, ಕಟರ್ ಹುಳು',
    'cult.crop.cotton.name':'ಕಾಪಾಸ್ (ಬಿಟಿ)','cult.crop.cotton.regions':'ಮಹಾರಾಷ್ಟ್ರ, ಗುಜರಾತ್, ತೆಲಂಗಾಣ, ಎಪಿ','cult.crop.cotton.window':'ಜೂನ್ 15-ಜುಲೈ 15 (ವರ್ಷಾಧಾರಿತ); ನೀರಾವರಿಯಲ್ಲಿ ಆಗಸ್ಟ್ 1 ವರೆಗೆ','cult.crop.cotton.seed':'450-600 ಗ್ರಾಂ/ಎಕರೆ (BG-II ಹೈಬ್ರಿಡ್)','cult.crop.cotton.spacing':'120x45 ಸೆಂ (ಸಂಕುಲ) ಅಥವಾ 150x60 ಸೆಂ (ವಿಸ್ತಾರ)','cult.crop.cotton.fert':'NPK 50:25:25 ಕಿ.ಗ್ರಾಂ/ಎಕರೆ; N ಮೂರು ಡೋಸ್: ಬಿತ್ತನೆ, ಸ್ಕ್ವೇರ್, ಬೋಲ್ ಸೆಟ್','cult.crop.cotton.irrigation':'ಸ್ಕ್ವೇರ್ ರಚನೆ ಮತ್ತು ಬೋಲ್ ಅಭಿವೃದ್ಧಿಯಲ್ಲಿ ಮುಖ್ಯ','cult.crop.cotton.pest':'ಪಿಂಕ್ ಬೋಲ್‌ವೋರ್ಮ್: ಫೆರೋಮೋನ್ ಟ್ರಾಪ್, ಸಮಯಕ್ಕೆ ಕೊಯ್ಲು, ರಟೂನ್ ಬೇಡ',
    'cult.state.punjab.note':'ಕ್ಯಾನಲ್ ನೀರಾವರಿ ಅಕ್ಕಿ-ಗೋಧಿಗೆ ಸೂಕ್ತ; ಗೋಧಿಗೆ ಉತ್ತಮ ಚಳಿ.','cult.state.haryana.note':'ಅಕ್ಕಿ-ಗೋಧಿ ಚಕ್ರ ನೀರಾವರಿಗೆ ಸರಿಹೊಂದುತ್ತದೆ; ಭೂಗರ್ಭಜಲವನ್ನು ಗಮನಿಸಿ.','cult.state.uttarpradesh.note':'ಆಲುವಿಯಲ್ ಮಣ್ಣು, ನೀರಾವರಿ; ಪಶ್ಚಿಮ/ಮಧ್ಯ ಯುಪಿ ಆಲೂಗಡ್ಡೆ ಬೆಲ್ಟ್.','cult.state.bihar.note':'ಗಂಗಾ ಮೈದಾನ; ಹೆಚ್ಚು ತೇವಾಂಶ ಖರೀಫ್ ಅಕ್ಕಿ, ರಬಿ ಗೋಧಿಗೆ ಅನುಕೂಲ.','cult.state.andhrapradesh.note':'ಡೆಲ್ಟಾ ನೀರಾವರಿ ಮತ್ತು ಕಪ್ಪು ಮಣ್ಣು ಅಕ್ಕಿ/ಕಾಪಾಸ್‌ಗೆ ಸೂಕ್ತ; ರಬಿಯಲ್ಲಿ ಜೋಳ, ಟೊಮೆಟೊ ಸಾಮಾನ್ಯ.','cult.state.telangana.note':'ಕಪ್ಪು ಮಣ್ಣು, ವರ್ಷಾಧಾರಿತ ಖರೀಫ್; ಜೋಳ ಮತ್ತು ಕಾಪಾಸ್ ಮುಖ್ಯ.','cult.state.karnataka.note':'ವೈವಿಧ್ಯ ಪ್ರದೇಶ; ದಕ್ಷಿಣದಲ್ಲಿ ಜೋಳ/ಟೊಮೆಟೊ, ಉತ್ತರದಲ್ಲಿ ಕಾಪಾಸ್.','cult.state.tamilnadu.note':'ನೀರಾವರಿಯೊಂದಿಗೆ ಅನೇಕ ಋತುಗಳು; ಕೃಷ್ಣಗಿರಿ/ಧರ್ಮಪುರಿಯಲ್ಲಿ ಟೊಮೆಟೊ ಬೆಲ್ಟ್.','cult.state.maharashtra.note':'ವಿದರ್ಭ/ಮರಾಠವಾಡ ಕಾಪಾಸ್; ನೀರಾವರಿ ಜೇಬುಗಳಲ್ಲಿ ಜೋಳ/ಟೊಮೆಟೊ.','cult.state.gujarat.note':'ಕಪ್ಪು ಮಣ್ಣು ಕಾಪಾಸ್‌ಗೆ; ನೀರಾವರಿ ರಬಿಯಲ್ಲಿ ಗೋಧಿ.','cult.state.westbengal.note':'ಆದ್ರ ಅಕ್ಕಿ ಬೆಲ್ಟ್; ನಾದಿಯಾ/ಹೂಘ್ಲಿ ಆಲೂಗಡ್ಡೆ ಕೇಂದ್ರ.','cult.state.madhyapradesh.note':'ಕಪ್ಪು ಮಣ್ಣು ಜೋಳಕ್ಕೆ; ನೀರಾವರಿ ರಬಿಯಲ್ಲಿ ಗೋಧಿ.','cult.state.kerala.note':'ಕಡಿಮೆ ಅಕ್ಕಿ ಪ್ರದೇಶ; ಹೆಚ್ಚಿನ ಮಳೆ ತೇವ ಕ್ಷೇತ್ರ ಅಕ್ಕಿಗೆ ಅನುಕೂಲ.',
    'about.title':'ಸಸ್ಯಸ್ನೇಹಿ AI ಬಗ್ಗೆ','about.tagline':'ಭಾರತೀಯ ರೈತರಿಗೆ ಬುದ್ಧಿವಂತ, ಮುಕ್ತ ಮೂಲದ ಬೆಳೆ ಸಲಹೆ ವ್ಯವಸ್ಥೆ — ಟ್ರಾನ್ಸ್‌ಫರ್ ಲರ್ನಿಂಗ್, ನೈಜ ಕಾಲದ ಹವಾಮಾನ ಡೇಟಾ ಮತ್ತು ಬಹುಭಾಷಾ AI ಆಧಾರಿತ.','about.overview.title':'ಪ್ರಾಜೆಕ್ಟ್ ಅವಲೋಕನ','about.overview.body':'ಸಸ್ಯಸ್ನೇಹಿ AI (ಒಡಿಯಾದಲ್ಲಿ "Friend of Crops") ಒಂದು ಮಾಯ ಅಂಕಿಗೆ ವೇಬ್ ಆಧಾರಿತ ಸಲಹೆ ವ್ಯವಸ್ಥೆ, ಇದು ಡೀಪ್ ಲರ್ನಿಂಗ್ ಸಸ್ಯ ರೋಗ ವರ್ಗೀಕರಣವನ್ನು ಪರಿಸರ ಅಪಾಯ, ರಸಾಯನಿಕ ಸುರಕ್ಷತೆ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಬಹುಭಾಷಾ AI ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ ಸಂಯೋಜಿಸುತ್ತದೆ. ಗುರಿ: ಪ್ರತಿಯೊಬ್ಬ ರೈತನಿಗೂ ತಜ್ಞ ಮಟ್ಟದ ಬೆಳೆ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಉಚಿತವಾಗಿ, ಅವರ ಭಾಷೆಯಲ್ಲಿ, ತಾಂತ್ರಿಕ ಜ್ಞಾನವಿಲ್ಲದೆ ನೀಡುವುದು.','about.tech.title':'ತಂತ್ರಜ್ಞಾನ ಸ್ಟ್ಯಾಕ್','about.model.title':'AI ಮಾದರಿ ವಿನ್ಯಾಸ','about.model.desc':'ರೋಗ ವರ್ಗೀಕರಣ MobileNetV2 (ImageNet ಪೂರ್ವ ತರಬೇತಿ) ಯನ್ನು ಫ್ರೀಜ್ ಮಾಡಿದ ವೈಶಿಷ್ಟ್ಯ ಎಕ್ಸ್ಟ್ರಾಕ್ಟರ್ ಆಗಿ, ಕಸ್ಟಮ್ ಕ್ಲಾಸ್ ಹೆಡ್‌ೊಂದಿಗೆ ಬಳಸುತ್ತದೆ:','about.model.step.in':'ಇನ್‌ಪುಟ್: 224x224 RGB ಎಲೆ ಚಿತ್ರ, MobileNetV2 ನಾರ್ಮಲೈಸ್','about.model.step.bk':'ಬೇಸ್: MobileNetV2 ಫ್ರೀಜ್ (87 ಲೇಯರ್, 2.2M ಪ್ಯಾರಾಮ್) — ImageNet ವೇಟ್','about.model.step.hd':'ಹೆಡ್: GlobalAveragePooling2D → Dropout(0.3) → Dense(128, ReLU) → Softmax(N)','about.model.step.tr':'ತರಬೇತಿ: Adam (lr=1e-4), ಕೇಟಗರಿಕಲ್ ಕ್ರಾಸ್‌ಎಂಟ್ರೋಪಿ, EarlyStopping + ReduceLROnPlateau','about.model.step.cl':'ವರ್ಗಗಳು: ಟೊಮೆಟೊ ಅEarly/late blight, ಆಲೂಗಡ್ಡೆ ಅEarly/late blight, ಮೆಣಸಿನ ಬ್ಯಾಕ್ಟೀರಿಯಲ್ ಸ್ಪಾಟ್, ಆರೋಗ್ಯಕರ ಟೊಮೆಟೊ','about.modules.title':'ಸಿಸ್ಟಮ್ ಮೋಡ್ಯೂಲ್','about.modules.01':'model_loader.py — ಸಿಂಗಲ್ TF ಮಾದರಿ ಸೇವೆ, ಒಂದು ಬಾರಿ ಲೋಡ್, ಪ್ರಿಡಿಕ್‌ಷನ್ ಸರ್ವ್','about.modules.02':'severity.py — HSV ಬಣ್ಣ ಮಾಸ್ಕಿಂಗ್: ಹಳದಿ + ಕಂದು + ಗಾಢ → ಸೋಂಕಿತ ಪಿಕ್ಸೆಲ್ ಶೇಕಡಾ','about.modules.03':'weather.py — OpenWeather ಉಚಿತ API: ತೇವಾಂಶ, ತಾಪಮಾನ, ಮಳೆ ಸಾಧ್ಯತೆ ಅಪಾಯ ಸೂತ್ರ','about.modules.04':'chemical_safety.py — JSON ಜ್ಞಾನಕೋಶ ಹುಡುಕಾಟ: ಜೇನು ವಿಷ, ಮಣ್ಣಿನ ಸೂಕ್ಷ್ಮಜೀವ ಪ್ರಭಾವ, ಮಾನವ ಆರೋಗ್ಯ ಅಪಾಯ','about.modules.05':'advisory.py — ನಿಯಮ ಎಂಜಿನ್: ತೀವ್ರತೆ × ಅಪಾಯ × ಮಣ್ಣು ಪ್ರಕಾರ → ಕ್ರಮಬದ್ಧ ಚಿಕಿತ್ಸೆ','about.modules.06':'llm_service.py — Google Gemini, 34 ಮಾದರಿಗಳಲ್ಲಿ ಆಟೋ-ಫೇಲ್‌ಓವರ್; ಆಫ್‌ಲೈನ್ ಫಾಲ್‌ಬ್ಯಾಕ್','about.modules.07':'app.py — Flask ಆಯೋಜನೆ: ರೂಟ್, ಚಿತ್ರ ಸಂಗ್ರಹ, ಮೋಡ್ಯೂಲ್ ಪೈಪ್‌ಲೈನ್, JSON ಚಾಟ್ ಎಂಡ್‌ಪಾಯಿಂಟ್','about.diseases.title':'ಬೆಂಬಲಿತ ಬೆಳೆ ರೋಗಗಳು','about.data.title':'ಡೇಟಾ ಮತ್ತು ಗೌಪ್ಯತೆ','about.data.body':'ಅಪ್ಲೋಡ್ ಚಿತ್ರಗಳು static/uploads/ ನಲ್ಲಿ ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಯುತ್ತವೆ ಮತ್ತು ಯಾವುದೇ ಬಾಹ್ಯ ಸರ್ವರ್‌ಗೆ ಕಳುಹಿಸಲಾಗುವುದಿಲ್ಲ. ಸ್ಥಳ ಮಾಹಿತಿ (ಇದಿದ್ದರೆ) ವಿಶ್ಲೇಷಣೆಯ ವಿನಂತಿಯಲ್ಲಿ ಒಂದೇ OpenWeather API ಕರೆಗಾಗಿ ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ ಮತ್ತು ಉಳಿಸಲಾಗುವುದಿಲ್ಲ. API ಕೀಗಳು ಸ್ಥಳೀಯ .env ನಲ್ಲಿ ಇಡಲ್ಪಟ್ಟಿವೆ ಮತ್ತು ಬ್ರೌಸರ್‌ನಲ್ಲಿ ತೋರಿಸಲಾಗುವುದಿಲ್ಲ.','about.cta.try':'ಈಗ ಪ್ರಯತ್ನಿಸಿ','about.cta.back':'← ಮನೆಗೆ ಹಿಂತಿರುಗಿ','about.footer':'Sashyasnehi AI © 2025 · Flask, TensorFlow ಮತ್ತು Gemini ನಲ್ಲಿ ನಿರ್ಮಿತ',
  }
};

// Helper to fetch current language dictionary
window.getI18nDict = function(lang) {
  const chosen = lang || localStorage.getItem('lang') || 'English';
  return window.I18N[chosen] || window.I18N['English'];
};

// Applies i18n to all [data-i18n] elements and special dynamic targets
window.applyI18n = function(lang) {
  const dict = window.I18N[lang] || window.I18N['English'];
  // All data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] == null) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = dict[key];
    } else {
      el.textContent = dict[key];
    }
  });
  // Panel tab buttons (store original English label to remap correctly)
  const tabMap = {'Weather':'panel.weather','Market':'panel.market-tab','Schemes':'panel.schemes'};
  document.querySelectorAll('.ptab').forEach(tab => {
    const orig = tab.dataset.origLabel || tab.textContent.trim();
    tab.dataset.origLabel = orig;
    if (tabMap[orig] && dict[tabMap[orig]]) tab.textContent = dict[tabMap[orig]];
  });
  // News panel header title
  const newsTitle = document.getElementById('newsPanelTitle');
  if (newsTitle && dict['news.title']) newsTitle.textContent = dict['news.title'];
  // Insights panel header span
  const insightsHeader = document.querySelector('.side-panel-header > span');
  if (insightsHeader && dict['panel.insights']) insightsHeader.textContent = dict['panel.insights'];
  // Drawer tab labels
  const newsLbl = document.getElementById('newsTabLabel');
  if (newsLbl && dict['dtab.news']) newsLbl.textContent = dict['dtab.news'];
  const insightsLbl = document.getElementById('insightsTabLabel');
  if (insightsLbl && dict['dtab.insights']) insightsLbl.textContent = dict['dtab.insights'];
  // Chat input placeholder & send button
  const chatInput = document.getElementById('chatInput');
  if (chatInput && dict['result.chat-placeholder']) chatInput.placeholder = dict['result.chat-placeholder'];
  const chatSend = document.getElementById('chatSendBtn');
  if (chatSend && dict['result.chat-send']) chatSend.textContent = dict['result.chat-send'];
};


// ── LEFT DRAWER — Farming News Panel ────────────────────────────────────────
(function initNewsDrawer() {
  let scrollTimer = null;
  let panel = null;
  let open = false;

  function esc(s) {
    return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function buildPanel() {
    const ov = document.createElement('div');
    ov.id = 'newsOverlay'; ov.className = 'news-overlay';
    ov.addEventListener('click', closeNews);
    document.body.appendChild(ov);

    panel = document.createElement('aside');
    panel.id = 'newsPanel'; panel.className = 'news-panel';
    panel.innerHTML = `
      <div class="news-panel-header">
        <span id="newsPanelTitle">&#128240; Farming News &amp; Updates</span>
        <button class="news-close-btn" onclick="window._closeNews()" title="Close">&times;</button>
      </div>
      <div class="news-scroll" id="newsScroll">
        <div class="news-loading">Loading latest farming news...</div>
      </div>`;
    document.body.appendChild(panel);
  }

  function openNews() {
    open = true; window._newsOpen = true;
    if (!panel) buildPanel();
    panel.classList.add('open');
    document.getElementById('newsOverlay').classList.add('active');
    const tab = document.getElementById('newsDrawerTab');
    if (tab) tab.classList.add('panel-open');
    loadNews();
  }

  function closeNews() {
    open = false; window._newsOpen = false;
    if (panel) panel.classList.remove('open');
    const ov = document.getElementById('newsOverlay');
    if (ov) ov.classList.remove('active');
    const tab = document.getElementById('newsDrawerTab');
    if (tab) tab.classList.remove('panel-open');
    if (scrollTimer) { clearInterval(scrollTimer); scrollTimer = null; }
  }

  window._openNews = openNews;
  window._closeNews = closeNews;
  window._newsOpen = false;

  function startScroll() {
    if (scrollTimer) clearInterval(scrollTimer);
    const el = document.getElementById('newsScroll');
    if (!el) return;
    scrollTimer = setInterval(() => {
      el.scrollTop += 1;
      if (el.scrollTop >= el.scrollHeight / 2) el.scrollTop = 0;
    }, 28);
  }

  function loadNews() {
    const el = document.getElementById('newsScroll');
    if (!el) return;
    if (el.dataset.loaded === '1') { startScroll(); return; }
    fetch('/api/news')
      .then(r => r.json())
      .then(items => {
        if (!items || !items.length) throw new Error('empty');
        const all = [...items, ...items];
        el.innerHTML = all.map(n => `
          <a class="news-item" href="${esc(n.link||'#')}" target="_blank" rel="noopener noreferrer">
            <div class="news-item-title">${esc(n.title)}</div>
            <div class="news-item-meta">
              <span class="news-src">${esc(n.source||'')}</span>
              ${n.date?`<span class="news-date">${esc(String(n.date).slice(0,10))}</span>`:''}
            </div>
          </a>`).join('');
        el.dataset.loaded = '1';
        el.scrollTop = 0;
        startScroll();
      })
      .catch(() => { el.innerHTML = '<div class="news-empty">Could not load news.</div>'; });
  }

  document.addEventListener('DOMContentLoaded', () => {
    buildPanel();
    // Create left-edge drawer tab
    const tab = document.createElement('button');
    tab.id = 'newsDrawerTab';
    tab.className = 'drawer-tab drawer-tab-left';
    tab.setAttribute('aria-label', 'Toggle farming news');
    tab.innerHTML = `
      <span class="dtab-arrow" id="newsArrow">&#9660;</span>
      <span class="dtab-icon">&#128240;</span>
      <span class="dtab-label" id="newsTabLabel">NEWS</span>`;
    tab.addEventListener('click', () => { open ? closeNews() : openNews(); });
    document.body.appendChild(tab);
  });
})();


// ── RIGHT DRAWER — Farm Insights (result.html only) ──────────────────────────
(function initInsightsDrawer() {
  document.addEventListener('DOMContentLoaded', () => {
    const sidePanel = document.getElementById('sidePanel');
    if (!sidePanel) return;

    const tab = document.createElement('button');
    tab.id = 'insightsDrawerTab';
    tab.className = 'drawer-tab drawer-tab-right';
    tab.setAttribute('aria-label', 'Toggle farm insights');
    tab.innerHTML = `
      <span class="dtab-label" id="insightsTabLabel">INSIGHTS</span>
      <span class="dtab-icon">&#127807;</span>
      <span class="dtab-arrow" id="insightsArrow">&#9660;</span>`;
    tab.addEventListener('click', () => {
      if (window.togglePanel) window.togglePanel();
    });
    document.body.appendChild(tab);

    // Sync open/close state of right tab with sidePanel state
    new MutationObserver(() => {
      tab.classList.toggle('panel-open', sidePanel.classList.contains('open'));
    }).observe(sidePanel, { attributes: true, attributeFilter: ['class'] });
  });
})();


// ── Language switcher (non-result pages) ───────────────────────────────────
(function initGlobalLangSwitcher(){
  document.addEventListener('DOMContentLoaded', () => {
    const sels = Array.from(document.querySelectorAll('.lang-switcher'));
    if (!sels.length) return;
    const saved = localStorage.getItem('lang') || 'English';
    sels.forEach(sel => {
      if (saved) sel.value = saved;
      if (!sel.dataset.bound) {
        sel.dataset.bound = '1';
        sel.addEventListener('change', () => {
          const lang = sel.value || 'English';
          localStorage.setItem('lang', lang);
          if (window.applyI18n) window.applyI18n(lang);
          window.dispatchEvent(new CustomEvent('lang:changed', { detail: lang }));
        });
      }
    });
    if (saved && saved !== 'English' && window.applyI18n) {
      window.applyI18n(saved);
    }
    window.dispatchEvent(new CustomEvent('lang:changed', { detail: saved || 'English' }));
  });
})();
