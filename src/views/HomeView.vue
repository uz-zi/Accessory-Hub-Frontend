<template>
  <div class="home">

    <!-- ═══════════════════════════════════════════════════════════════
         HERO SLIDER
    ════════════════════════════════════════════════════════════════ -->
    <section
      class="hero-slider"
      @mouseenter="isPaused = true"
      @mouseleave="isPaused = false"
    >
      <!-- Track -->
      <div class="slider-track" :style="`transform:translateX(-${activeSlide * 100}%)`">
        <div
          v-for="(slide, i) in slides"
          :key="i"
          class="slider-slide"
          :class="{ active: activeSlide === i }"
          :style="`background-image:url(${slide.bg})`"
        >
          <div class="slide-overlay"></div>
          <div class="container h-100" style="position:relative;z-index:1">
            <div class="row h-100 align-items-center">
              <div class="col-lg-7 col-xl-6">
                <div class="slide-content">
                  <span class="slide-tag">{{ slide.tag }}</span>
                  <h1 class="slide-heading">{{ slide.heading }}</h1>
                  <p class="slide-desc">{{ slide.desc }}</p>
                  <div class="slide-actions">
                    <RouterLink :to="hpStore.slideLink(slide)" class="btn btn-primary btn-lg px-5 btn-glow">
                      {{ slide.cta }} <i class="bi bi-arrow-right ms-2"></i>
                    </RouterLink>
                    <RouterLink :to="{ name: 'products' }" class="btn btn-outline-light btn-lg px-4">
                      Browse All
                    </RouterLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Arrows -->
      <button class="slider-arrow slider-prev" @click="prev" aria-label="Previous slide">
        <i class="bi bi-chevron-left"></i>
      </button>
      <button class="slider-arrow slider-next" @click="next" aria-label="Next slide">
        <i class="bi bi-chevron-right"></i>
      </button>

      <!-- Dots -->
      <div class="slider-dots">
        <button
          v-for="(_, i) in slides"
          :key="i"
          :class="['slider-dot', { active: i === activeSlide }]"
          @click="go(i)"
          :aria-label="`Go to slide ${i + 1}`"
        ></button>
      </div>

      <!-- Progress bar -->
      <div class="slider-progress-wrap">
        <div
          class="slider-progress-bar"
          :key="activeSlide"
          :class="{ paused: isPaused }"
        ></div>
      </div>
    </section>


    <!-- ═══════════════════════════════════════════════════════════════
         TRUST STRIP
    ════════════════════════════════════════════════════════════════ -->
    <section class="trust-strip">
      <div class="container">
        <div class="trust-grid">
          <div
            v-for="(item, i) in trustItems"
            :key="item.icon"
            class="trust-item"
            :style="`--delay:${i * 0.1}s`"
            data-reveal
          >
            <div class="trust-icon-wrap">
              <i :class="`bi ${item.icon}`"></i>
            </div>
            <div class="trust-text">
              <div class="trust-label">{{ item.label }}</div>
              <div class="trust-sub">{{ item.sub }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- ═══════════════════════════════════════════════════════════════
         CATEGORIES — magazine bento grid
    ════════════════════════════════════════════════════════════════ -->
    <section class="section-pad">
      <div class="container">
        <div class="section-head text-center mb-5" data-reveal>
          <span class="eyebrow">Collections</span>
          <h2 class="section-h">Shop by Category</h2>
          <p class="section-sub">Handpicked accessories for every device and lifestyle</p>
        </div>

        <div class="cat-bento">
          <RouterLink
            v-for="(cat, i) in categories"
            :key="cat.slug"
            :to="{ name: 'products', query: { category: cat.slug } }"
            :class="`cat-card cat-card-${i + 1}`"
            :style="`background:${cat.bg}; --delay:${i * 0.08}s`"
            data-reveal
          >
            <div class="cat-glow"></div>
            <div class="cat-body">
              <span class="cat-emoji">{{ cat.emoji }}</span>
              <h3 class="cat-name">{{ cat.name }}</h3>
              <span class="cat-cta">Shop now <i class="bi bi-arrow-right"></i></span>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>


    <!-- ═══════════════════════════════════════════════════════════════
         FEATURED PRODUCTS
    ════════════════════════════════════════════════════════════════ -->
    <section class="section-pad section-alt">
      <div class="container">
        <div class="section-head-row mb-4">
          <div data-reveal>
            <span class="eyebrow">Handpicked</span>
            <h2 class="section-h mb-0">Featured Products</h2>
          </div>
          <RouterLink :to="{ name: 'products' }" class="btn btn-outline-primary" data-reveal>
            View All <i class="bi bi-arrow-right ms-1"></i>
          </RouterLink>
        </div>

        <div class="products-grid">
          <template v-if="productsStore.loading">
            <div v-for="n in 8" :key="n" class="skeleton-card">
              <div class="sk-img"></div>
              <div class="sk-line w-70 mt-3"></div>
              <div class="sk-line w-40 mt-2"></div>
            </div>
          </template>
          <template v-else>
            <div
              v-for="(product, i) in productsStore.featured"
              :key="product.id"
              data-reveal
              :style="`--delay:${i * 0.06}s`"
            >
              <ProductCard :product="product" />
            </div>
          </template>
        </div>
      </div>
    </section>


    <!-- ═══════════════════════════════════════════════════════════════
         PROMO SPLIT BANNER
    ════════════════════════════════════════════════════════════════ -->
    <section class="section-pad">
      <div class="container">
        <div class="promo-split" data-reveal>
          <!-- Left: image -->
          <div
            class="promo-img"
            style="background-image:url(https://picsum.photos/seed/phonepromo/800/600)"
          >
            <div class="promo-img-overlay"></div>
            <div class="promo-img-badge">
              <span class="badge-num">20%</span>
              <span class="badge-text">OFF</span>
            </div>
          </div>

          <!-- Right: text -->
          <div class="promo-body">
            <span class="eyebrow" style="color:var(--ah-primary)">Limited Time</span>
            <h2 class="promo-title">Get 20% Off<br/>Your First Order</h2>
            <p class="promo-sub">
              Premium phone accessories at unbeatable prices. Use the code below at checkout and start elevating your setup today.
            </p>
            <div class="promo-code-row">
              <span class="promo-code">WELCOME20</span>
              <button class="copy-btn" @click="copyCode" :title="copied ? 'Copied!' : 'Copy code'">
                <i :class="copied ? 'bi bi-check-lg' : 'bi bi-copy'"></i>
                {{ copied ? 'Copied' : 'Copy' }}
              </button>
            </div>
            <RouterLink :to="{ name: 'products' }" class="btn btn-primary btn-lg px-5 mt-4 btn-glow">
              Shop Now <i class="bi bi-arrow-right ms-2"></i>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>


    <!-- ═══════════════════════════════════════════════════════════════
         NEW ARRIVALS
    ════════════════════════════════════════════════════════════════ -->
    <section class="section-pad section-alt">
      <div class="container">
        <div class="section-head-row mb-4">
          <div data-reveal>
            <span class="eyebrow">Just In</span>
            <h2 class="section-h mb-0">New Arrivals</h2>
          </div>
          <RouterLink :to="{ name: 'products', query: { sort: 'newest' } }" class="btn btn-outline-primary" data-reveal>
            See All <i class="bi bi-arrow-right ms-1"></i>
          </RouterLink>
        </div>
        <div class="products-grid-4">
          <template v-if="productsStore.loading">
            <div v-for="n in 4" :key="n" class="skeleton-card">
              <div class="sk-img"></div>
              <div class="sk-line w-70 mt-3"></div>
              <div class="sk-line w-40 mt-2"></div>
            </div>
          </template>
          <template v-else>
            <div
              v-for="(product, i) in newArrivals"
              :key="product.id"
              data-reveal
              :style="`--delay:${i * 0.1}s`"
            >
              <ProductCard :product="product" />
            </div>
          </template>
        </div>
      </div>
    </section>


    <!-- ═══════════════════════════════════════════════════════════════
         STATS STRIP
    ════════════════════════════════════════════════════════════════ -->
    <section class="stats-strip" data-reveal>
      <div class="container">
        <div class="stats-grid">
          <div v-for="stat in bigStats" :key="stat.label" class="stat-item">
            <div class="stat-val">{{ stat.val }}</div>
            <div class="stat-lbl">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>


<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useHomepageStore } from '@/stores/homepage'
import ProductCard from '@/components/ProductCard.vue'

const productsStore = useProductsStore()

/* ── Data ── */
const hpStore    = useHomepageStore()
const slides     = computed(() => hpStore.slides)
const categories = computed(() => hpStore.categories)

const trustItems = [
  { icon: 'bi-truck',             label: 'Free Shipping',    sub: 'On orders over $50'  },
  { icon: 'bi-arrow-return-left', label: '30-Day Returns',   sub: 'Hassle-free returns'  },
  { icon: 'bi-shield-check',      label: '2-Year Warranty',  sub: 'Covered on all items' },
  { icon: 'bi-headset',           label: '24/7 Support',     sub: 'Always here to help'  },
]

const bigStats = [
  { val: '5,000+',  label: 'Products Available'  },
  { val: '50,000+', label: 'Happy Customers'      },
  { val: '4.8★',    label: 'Average Rating'       },
  { val: '120+',    label: 'Brands Stocked'        },
]

const newArrivals = computed(() =>
  [...(productsStore.featured || [])].slice(0, 4)
)

/* ── Hero Slider ── */
const activeSlide = ref(0)
const isPaused    = ref(false)
let   timerID     = null
const DURATION    = 5000

function go(i)  { activeSlide.value = i; resetTimer() }
function next() { activeSlide.value = (activeSlide.value + 1) % slides.value.length; resetTimer() }
function prev() { activeSlide.value = (activeSlide.value - 1 + slides.value.length) % slides.value.length; resetTimer() }

function startTimer() {
  timerID = setInterval(() => {
    if (!isPaused.value) next()
  }, DURATION)
}
function resetTimer() { clearInterval(timerID); startTimer() }

/* ── Copy promo code ── */
const copied = ref(false)
async function copyCode() {
  try {
    await navigator.clipboard.writeText('WELCOME20')
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {}
}

/* ── Scroll reveal ── */
let observer = null
function setupReveal() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target) }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    )
  }
  document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => observer.observe(el))
}

onMounted(async () => {
  startTimer()
  setTimeout(setupReveal, 60)
  await Promise.all([productsStore.fetchFeatured(), productsStore.fetchCategories()])
  await nextTick()
  setupReveal()
})

onUnmounted(() => { clearInterval(timerID); observer?.disconnect() })
</script>


<style scoped>
/* ═══════════════════════════════════════════════════
   HERO SLIDER
═══════════════════════════════════════════════════ */
.hero-slider {
  position: relative;
  overflow: hidden;
  height: 90vh;
  min-height: 560px;
  max-height: 800px;
  cursor: grab;
}
.hero-slider:active { cursor: grabbing; }

.slider-track {
  display: flex;
  height: 100%;
  transition: transform 0.75s cubic-bezier(0.77, 0, 0.175, 1);
}

.slider-slide {
  min-width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
}

.slide-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    rgba(10,10,26,.85) 0%,
    rgba(10,10,26,.60) 55%,
    rgba(10,10,26,.20) 100%
  );
}

/* Slide content — animates in when slide is active */
.slide-content {
  color: #fff;
  opacity: 0;
  transform: translateY(38px);
  transition: opacity 0.7s ease 0.35s, transform 0.7s ease 0.35s;
}
.slider-slide.active .slide-content {
  opacity: 1;
  transform: translateY(0);
}

.slide-tag {
  display: inline-block;
  background: rgba(108,99,255,.28);
  color: #c4b5fd;
  border: 1px solid rgba(108,99,255,.4);
  border-radius: 50px;
  padding: .3em 1em;
  font-size: .8rem;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  margin-bottom: 1.2rem;
}

.slide-heading {
  font-size: clamp(2rem, 5vw, 3.6rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1rem;
  white-space: pre-line;
}

.slide-desc {
  font-size: 1.05rem;
  color: rgba(255,255,255,.7);
  max-width: 500px;
  line-height: 1.65;
  margin-bottom: 1.5rem;
}

.slide-actions { display: flex; flex-wrap: wrap; gap: .75rem; }

/* Arrows */
.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 52px; height: 52px;
  border-radius: 50%;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.25);
  color: #fff;
  font-size: 1.25rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background .25s, transform .25s;
  backdrop-filter: blur(8px);
  z-index: 10;
}
.slider-arrow:hover {
  background: rgba(108,99,255,.6);
  transform: translateY(-50%) scale(1.08);
}
.slider-prev { left: 1.5rem; }
.slider-next { right: 1.5rem; }

/* Dots */
.slider-dots {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: .55rem;
  z-index: 10;
}
.slider-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,.4);
  border: none;
  cursor: pointer;
  transition: width .3s, background .3s;
}
.slider-dot.active {
  width: 28px;
  border-radius: 4px;
  background: var(--ah-primary);
}

/* Progress bar */
.slider-progress-wrap {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: rgba(255,255,255,.15);
  z-index: 10;
}
.slider-progress-bar {
  height: 100%;
  background: var(--ah-primary);
  width: 0%;
  animation: progressFill 5s linear forwards;
}
.slider-progress-bar.paused { animation-play-state: paused; }
@keyframes progressFill {
  from { width: 0%; }
  to   { width: 100%; }
}

/* Glow button */
.btn-glow {
  box-shadow: 0 0 20px rgba(108,99,255,.55);
  transition: color .15s, background-color .15s, border-color .15s, box-shadow .3s, transform .2s;
}
.btn-glow:hover {
  box-shadow: 0 0 36px rgba(108,99,255,.9);
  transform: translateY(-2px);
}


/* ═══════════════════════════════════════════════════
   TRUST STRIP
═══════════════════════════════════════════════════ */
.trust-strip {
  background: #fff;
  border-bottom: 1px solid var(--ah-border);
  padding: 1.6rem 0;
}
.trust-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.trust-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: .5rem 1rem;
  border-radius: var(--ah-radius);
  transition: background .2s;
}
.trust-item:hover { background: var(--ah-secondary); }
.trust-icon-wrap {
  width: 46px; height: 46px;
  border-radius: 50%;
  background: rgba(108,99,255,.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem;
  color: var(--ah-primary);
  flex-shrink: 0;
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), background .25s;
}
.trust-item:hover .trust-icon-wrap {
  transform: scale(1.12);
  background: rgba(108,99,255,.2);
}
.trust-label { font-weight: 700; font-size: .9rem; color: var(--ah-text); }
.trust-sub   { font-size: .78rem; color: var(--ah-muted); }


/* ═══════════════════════════════════════════════════
   TYPOGRAPHY HELPERS
═══════════════════════════════════════════════════ */
.section-pad { padding: 5rem 0; }
.section-alt { background: var(--ah-secondary); }

.eyebrow {
  display: inline-block;
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--ah-primary);
  margin-bottom: .5rem;
}
.section-h   { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; margin-bottom: .5rem; }
.section-sub { color: var(--ah-muted); max-width: 500px; margin: 0 auto; }

.section-head     { max-width: 600px; margin: 0 auto; }
.section-head-row { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }


/* ═══════════════════════════════════════════════════
   CATEGORY BENTO GRID
═══════════════════════════════════════════════════ */
.cat-bento {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: 280px 200px;
  gap: 1rem;
}

/* First card spans 2 rows — tall hero tile */
.cat-card-1 {
  grid-row: span 2;
}

.cat-card {
  position: relative;
  border-radius: 1.25rem;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
  text-decoration: none;
  transition: transform .3s cubic-bezier(.34,1.2,.64,1), box-shadow .3s;
}
.cat-card:hover {
  transform: translateY(-6px) scale(1.015);
  box-shadow: 0 20px 50px rgba(0,0,0,.25);
}
.cat-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,.1) 60%, transparent 100%);
  transition: opacity .3s;
}
.cat-card:hover .cat-glow { opacity: .85; }

.cat-body {
  position: relative;
  z-index: 1;
  color: #fff;
}
.cat-emoji {
  font-size: 2.4rem;
  display: block;
  margin-bottom: .5rem;
  transition: transform .3s cubic-bezier(.34,1.56,.64,1);
}
.cat-card:hover .cat-emoji { transform: scale(1.2) rotate(-8deg); }

.cat-name {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 .35rem;
  color: #fff;
}
.cat-cta {
  font-size: .82rem;
  color: rgba(255,255,255,.75);
  font-weight: 600;
  letter-spacing: .04em;
  display: flex;
  align-items: center;
  gap: .3rem;
  transition: gap .2s, color .2s;
}
.cat-card:hover .cat-cta { color: #fff; gap: .55rem; }

/* First large card gets bigger text */
.cat-card-1 .cat-emoji { font-size: 3.5rem; }
.cat-card-1 .cat-name  { font-size: 1.6rem; }
.cat-card-1 .cat-cta   { font-size: .9rem; }


/* ═══════════════════════════════════════════════════
   PRODUCTS GRID
═══════════════════════════════════════════════════ */
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}
.products-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

/* Skeletons */
.skeleton-card { border-radius: var(--ah-radius); overflow: hidden; }
.sk-img {
  width: 100%; aspect-ratio: 1;
  background: linear-gradient(90deg, #e2e2ef 25%, #f0f0f7 50%, #e2e2ef 75%);
  background-size: 200% 100%;
  border-radius: var(--ah-radius);
  animation: shimmer 1.5s infinite;
}
.sk-line {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, #e2e2ef 25%, #f0f0f7 50%, #e2e2ef 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.w-70 { width: 70%; }
.w-40 { width: 40%; }
@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}


/* ═══════════════════════════════════════════════════
   PROMO SPLIT BANNER
═══════════════════════════════════════════════════ */
.promo-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0,0,0,.15);
  min-height: 440px;
}

.promo-img {
  background-size: cover;
  background-position: center;
  position: relative;
}
.promo-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(108,99,255,.5), rgba(15,52,96,.7));
}
.promo-img-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
}
.badge-num {
  display: block;
  font-size: 5rem;
  font-weight: 900;
  line-height: 1;
  animation: badgePulse 2s ease-in-out infinite;
}
.badge-text {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: .2em;
  opacity: .85;
}
@keyframes badgePulse {
  0%, 100% { transform: scale(1);    }
  50%       { transform: scale(1.06); }
}

.promo-body {
  background: #fff;
  padding: 3.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.promo-title {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 800;
  line-height: 1.15;
  margin: .5rem 0 1rem;
}
.promo-sub {
  color: var(--ah-muted);
  line-height: 1.65;
  margin-bottom: 1.5rem;
}
.promo-code-row {
  display: flex;
  align-items: center;
  gap: .75rem;
}
.promo-code {
  font-family: monospace;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: .15em;
  background: var(--ah-secondary);
  border: 2px dashed var(--ah-primary);
  color: var(--ah-primary);
  padding: .55rem 1.2rem;
  border-radius: .6rem;
  animation: codeShimmer 2.5s ease-in-out infinite;
}
@keyframes codeShimmer {
  0%, 100% { background: var(--ah-secondary); }
  50%       { background: rgba(108,99,255,.1); }
}
.copy-btn {
  display: flex;
  align-items: center;
  gap: .35rem;
  padding: .55rem 1rem;
  border: 1px solid var(--ah-border);
  border-radius: .6rem;
  background: #fff;
  color: var(--ah-muted);
  font-size: .875rem;
  cursor: pointer;
  transition: all .2s;
}
.copy-btn:hover {
  border-color: var(--ah-primary);
  color: var(--ah-primary);
  background: rgba(108,99,255,.06);
}


/* ═══════════════════════════════════════════════════
   STATS STRIP
═══════════════════════════════════════════════════ */
.stats-strip {
  background: linear-gradient(135deg, var(--ah-dark) 0%, #16213e 60%, #0f3460 100%);
  padding: 4rem 0;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  text-align: center;
}
.stat-item {
  padding: 1rem;
}
.stat-val {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  color: var(--ah-primary);
  line-height: 1;
  margin-bottom: .35rem;
  background: linear-gradient(90deg, var(--ah-primary), #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.stat-lbl {
  color: rgba(255,255,255,.6);
  font-size: .9rem;
  font-weight: 500;
}


/* ═══════════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════════ */
[data-reveal] {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity .65s ease, transform .65s ease;
  transition-delay: var(--delay, 0s);
}
[data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0);
}


/* ═══════════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════════ */
@media (max-width: 1024px) {
  .products-grid   { grid-template-columns: repeat(3, 1fr); }
  .products-grid-4 { grid-template-columns: repeat(2, 1fr); }
  .cat-bento       { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 200px); }
  .cat-card-1      { grid-row: span 1; }
  .cat-card-1 .cat-emoji { font-size: 2.4rem; }
  .cat-card-1 .cat-name  { font-size: 1.15rem; }
  .stats-grid      { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .hero-slider          { height: 70vh; min-height: 420px; }
  .trust-grid           { grid-template-columns: repeat(2, 1fr); }
  .cat-bento            { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(3, 180px); }
  .cat-card-1           { grid-column: span 2; }
  .products-grid        { grid-template-columns: repeat(2, 1fr); }
  .products-grid-4      { grid-template-columns: repeat(2, 1fr); }
  .promo-split          { grid-template-columns: 1fr; }
  .promo-img            { min-height: 220px; }
  .promo-body           { padding: 2rem; }
  .slider-arrow         { width: 40px; height: 40px; font-size: 1rem; }
  .section-head-row     { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 480px) {
  .cat-bento       { grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, 150px); }
  .cat-card-1      { grid-column: span 2; }
  .trust-grid      { grid-template-columns: 1fr 1fr; }
  .stats-grid      { grid-template-columns: repeat(2, 1fr); }
}
</style>
