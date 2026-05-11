<template>
  <div class="container text-center py-5 mt-5">
    <div class="py-5">
      <div style="font-size:6rem;line-height:1">🔌</div>
      <h1 class="display-1 fw-bold" style="color:var(--ah-primary)">404</h1>
      <h2 class="fw-bold mb-3">Page Not Found</h2>
      <p class="text-muted mb-4 fs-5">
        Looks like this page went missing — like a charging cable before a long flight.
      </p>
      <div class="d-flex justify-content-center gap-3 flex-wrap">
        <RouterLink :to="{ name: 'home' }" class="btn btn-primary btn-lg px-5">
          <i class="bi bi-house me-2"></i>Go Home
        </RouterLink>
        <RouterLink :to="{ name: 'products' }" class="btn btn-outline-primary btn-lg px-5">
          <i class="bi bi-bag me-2"></i>Shop Now
        </RouterLink>
      </div>
    </div>
  </div>
</template>
