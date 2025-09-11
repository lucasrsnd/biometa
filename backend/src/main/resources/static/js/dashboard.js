document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  loadUserData();

  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("currentDate").textContent = now.toLocaleDateString(
    "pt-BR",
    options
  );
});

async function loadUserData() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("/api/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();

      document.getElementById(
        "userName"
      ).textContent = `${userData.firstName} ${userData.lastName}`;

      const initials =
        userData.firstName.charAt(0) + userData.lastName.charAt(0);
      document.getElementById("userAvatar").textContent = initials;

      document.getElementById(
        "userInfo"
      ).textContent = `${userData.firstName} ${userData.lastName}`;
    } else if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "login.html";
    } else {
      document.getElementById("errorMessage").textContent =
        "Erro ao carregar dados do usuário.";
    }
  } catch (error) {
    document.getElementById("errorMessage").textContent =
      "Erro de conexão. Tente novamente.";
  }
}
