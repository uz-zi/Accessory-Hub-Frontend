<template>
  <div>
    <!-- ── Hero ─────────────────────────────────────────────────────────────── -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <span class="badge-pill mb-3 d-inline-block">New arrivals for 2025</span>
            <h1 class="display-4 fw-bold lh-1 mb-3">
              Elevate Your<br />
              <span style="color:var(--ah-primary)">Phone Experience</span>
            </h1>
            <p class="lead text-white-50 mb-4">
              Premium cases, chargers, earbuds and accessories for every device.
              Free shipping on orders over $50.
            </p>
            <div class="d-flex flex-wrap gap-3">
              <RouterLink :to="{ name: 'products' }" class="btn btn-primary btn-lg px-4">
                Shop Now <i class="bi bi-arrow-right ms-1"></i>
              </RouterLink>
              <RouterLink :to="{ name: 'products', query: { sort: 'newest' } }" class="btn btn-outline-light btn-lg px-4">
                New Arrivals
              </RouterLink>
            </div>
            <div class="d-flex gap-4 mt-4">
              <div class="text-center">
                <div class="fw-bold fs-4" style="color:var(--ah-primary)">5K+</div>
                <div class="text-white-50 small">Products</div>
              </div>
              <div class="text-center">
                <div class="fw-bold fs-4" style="color:var(--ah-primary)">50K+</div>
                <div class="text-white-50 small">Customers</div>
              </div>
              <div class="text-center">
                <div class="fw-bold fs-4" style="color:var(--ah-primary)">4.8★</div>
                <div class="text-white-50 small">Rating</div>
              </div>
            </div>
          </div>
          <div class="col-lg-6 text-center d-none d-lg-block">
            <img
              src="https://placehold.co/480x400/1a1a2e/6c63ff?text=Phone+Accessories"
              alt="Phone accessories hero"
              class="img-fluid rounded-3"
              style="max-height:400px;opacity:.9"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ── Trust bar ─────────────────────────────────────────────────────────── -->
    <section class="bg-light py-3 border-bottom">
      <div class="container">
        <div class="row g-3 text-center">
          <div class="col-6 col-md-3" v-for="item in trustItems" :key="item.icon">
            <div class="d-flex align-items-center justify-content-center gap-2">
              <i :class="`bi ${item.icon} text-primary fs-5`"></i>
              <span class="small fw-semibold">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Categories ─────────────────────────────────────────────────────────── -->
    <section class="py-5">
      <div class="container">
        <div class="text-center mb-4">
          <div class="divider-primary mx-auto"></div>
          <h2 class="section-title mb-1">Shop by Category</h2>
          <p class="text-muted">Find accessories made for your lifestyle</p>
        </div>
        <div class="row g-3">
          <div class="col-6 col-md-4 col-lg-2" v-for="cat in categories" :key="cat.slug">
            <RouterLink
              :to="{ name: 'products', query: { category: cat.slug } }"
              class="text-decoration-none"
            >
              <div class="category-tile text-center">
                <div class="tile-inner">
                  <div class="tile-icon">{{ cat.emoji }}</div>
                  <div class="fw-semibold small">{{ cat.name }}</div>
                </div>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Featured products ─────────────────────────────────────────────────── -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <div>
            <div class="divider-primary"></div>
            <h2 class="section-title mb-0">Featured Products</h2>
          </div>
          <RouterLink :to="{ name: 'products' }" class="btn btn-outline-primary btn-sm">
            View All <i class="bi bi-arrow-right ms-1"></i>
          </RouterLink>
        </div>

        <!-- Loading skeleton -->
        <div v-if="productsStore.loading" class="row g-3">
          <div class="col-6 col-md-4 col-lg-3" v-for="n in 8" :key="n">
            <div class="card border-0 shadow-sm h-100">
              <div class="bg-secondary placeholder-glow" style="aspect-ratio:1;border-radius:.75rem .75rem 0 0">
                <span class="placeholder w-100 h-100 d-block"></span>
              </div>
              <div class="card-body">
                <span class="placeholder col-8 d-block mb-2"></span>
                <span class="placeholder col-4"></span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="row g-3">
          <div class="col-6 col-md-4 col-lg-3" v-for="product in productsStore.featured" :key="product.id">
            <ProductCard :product="product" />
          </div>
        </div>
      </div>
    </section>

    <!-- ── Promo banner ──────────────────────────────────────────────────────── -->
    <section class="py-5">
      <div class="container">
        <div class="rounded-3 p-5 text-white text-center"
          style="background:linear-gradient(135deg,var(--ah-primary),#0f3460)">
          <h2 class="fw-bold mb-2">Get 20% Off Your First Order</h2>
          <p class="text-white-50 mb-4">Use code <code class="text-white bg-white bg-opacity-25 px-2 py-1 rounded">WELCOME20</code> at checkout</p>
          <RouterLink :to="{ name: 'products' }" class="btn btn-light btn-lg px-5">
            Shop Now
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ── New arrivals ──────────────────────────────────────────────────────── -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <div>
            <div class="divider-primary"></div>
            <h2 class="section-title mb-0">New Arrivals</h2>
          </div>
          <RouterLink :to="{ name: 'products', query: { sort: 'newest' } }" class="btn btn-outline-primary btn-sm">
            See All <i class="bi bi-arrow-right ms-1"></i>
          </RouterLink>
        </div>
        <div v-if="productsStore.loading" class="row g-3">
          <div class="col-6 col-md-4 col-lg-3" v-for="n in 4" :key="n">
            <div class="card border-0 shadow-sm placeholder-glow" style="height:260px">
              <span class="placeholder w-100 h-100"></span>
            </div>
          </div>
        </div>
        <div v-else class="row g-3">
          <div class="col-6 col-md-4 col-lg-3" v-for="product in newArrivals" :key="product.id">
            <ProductCard :product="product" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import ProductCard from '@/components/ProductCard.vue'

const productsStore = useProductsStore()

const categories = [
  { name: 'Cases',           slug: 'cases',             emoji: '📱' },
  { name: 'Chargers',        slug: 'chargers',           emoji: '⚡' },
  { name: 'Earbuds',         slug: 'earbuds',            emoji: '🎧' },
  { name: 'Screen Guards',   slug: 'screen-protectors',  emoji: '🛡️' },
  { name: 'Mounts',          slug: 'mounts',             emoji: '🚗' },
  { name: 'Cables',          slug: 'cables',             emoji: '🔌' },
]

const trustItems = [
  { icon: 'bi-truck',           label: 'Free Shipping $50+' },
  { icon: 'bi-arrow-return-left', label: '30-Day Returns'   },
  { icon: 'bi-shield-check',    label: '2-Year Warranty'    },
  { icon: 'bi-headset',         label: '24/7 Support'       },
]

const newArrivals = computed(() =>
  [...(productsStore.featured || [])].slice(0, 4)
)

onMounted(async () => {
  await Promise.all([
    productsStore.fetchFeatured(),
    productsStore.fetchCategories()
  ])
})
</script>
