<template>
  <div class="row h-100 g-0">
    <div class="col-sm-12 col-md-8 col-lg-6 mx-auto my-auto">
      <div class="card p-4 p-md-5">
        <h1 class="h4 text-center mb-4">Crie sua Conta de Artista</h1>

        <!-- Google sign-in button (custom class for global styling) -->
        <div class="text-center mb-3">
          <button class="btn btn-primary btn-google d-inline-flex align-items-center justify-content-center gap-2">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 18px; height: 18px;">
            <span>Sign in with Google</span>
          </button>
        </div>

        <p class="text-center mb-0">
          Já tem uma conta?
          <router-link to="/artista/login">Entrar</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
