<template>
  <div>
    <div class="row h-100 g-0" style="padding-top: 130px">
    <div class="col-sm-12 col-md-8 col-lg-6 mx-auto my-auto">
      <div class="card p-4 p-md-5">
        <div class="d-flex align-items-center justify-content-center mb-4">
          
          <img src="/logoPlaceholder.jpg" 
              alt="Logo WaveForm" 
              class="me-2" 
              style="height: 40px; width: auto; padding-right: 10px;">

          <h1 class="h1 mb-0 fw-bold">WaveForm</h1>
          
        </div>
        <h1 class="h4 text-center mb-4">Logar como ouvinte</h1>

        <!-- Google sign-in button (custom class for global styling) -->
        <div class="text-center mb-3">
          <button class="btn btn-primary btn-google d-inline-flex align-items-center justify-content-center gap-2">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 18px; height: 18px;">
            <span>Sign in with Google</span>
          </button>
        </div>
      <div class="form-check" style="display:flex; justify-content: center;">
        <input class="form-check-input" type="checkbox" value="" id="checkDefault">
        <label class="form-check-label" for="checkDefault">
           Manter-se conectado?
        </label>
      </div>
    </div>
  </div>
</div>
</div>
</template>