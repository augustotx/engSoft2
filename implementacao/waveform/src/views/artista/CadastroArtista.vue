<template>
  <div class = "container">
    <h1>Crie sua Conta de Artista</h1>
    <button class="google-btn">
    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo">
    <span>Sign in with Google</span>
  </button>
  <p class="login-text">
      Já tem uma conta?
      <router-link to="/artista/login">Entrar</router-link>
    </p>
  </div>
</template>

<style scoped>
.google-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  font-weight: 500;
  transition: box-shadow 0.2s ease;
}

.google-btn img {
  width: 18px;
  height: 18px;
}

.google-btn:hover {
  box-shadow: 0 0 10px purple;
}

.google-btn:active {
  transform: scale(0.98);
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
}

</style>