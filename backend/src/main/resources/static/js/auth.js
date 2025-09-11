document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});

async function handleRegister(e) {
  e.preventDefault();

  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const gender = document.getElementById("gender").value;
  const birthDate = document.getElementById("birthDate").value;
  const country = document.getElementById("country").value;
  const height = document.getElementById("height").value;
  const weight = document.getElementById("weight").value;

  const userData = {
    firstName,
    lastName,
    email,
    password,
    gender,
    birthDate,
    country,
    height: height ? parseFloat(height) : null,
    weight: weight ? parseFloat(weight) : null,
  };

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      document.getElementById("successMessage").textContent =
        "Cadastro realizado com sucesso! Redirecionando para login...";
      document.getElementById("errorMessage").textContent = "";

      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      const error = await response.text();
      document.getElementById("errorMessage").textContent = error;
    }
  } catch (error) {
    document.getElementById("errorMessage").textContent =
      "Erro de conexão. Tente novamente.";
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        })
      );

      window.location.href = "dashboard.html";
    } else {
      const error = await response.text();
      document.getElementById("errorMessage").textContent = error;
    }
  } catch (error) {
    document.getElementById("errorMessage").textContent =
      "Erro de conexão. Tente novamente.";
  }
}
