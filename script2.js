const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable pour stocker le message de l'utilisateur
const inputInitHeight = chatInput.scrollHeight;

// Configuration de l'API
const API_KEY =
  "YOUR_OPENAI_API"; // Remplace par ta clé API OpenAI
const API_URL = "https://api.openai.com/v1/completions";

const createChatLi = (message, className) => {
  // Crée un élément <li> de chat avec le message et la classe donnés
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let chatContent =
    className === "outgoing"
      ? `<p></p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi; // retourne l'élément <li> de chat
};

const generateResponse = async (chatElement) => {
  const messageElement = chatElement.querySelector("p");

  // Définition des propriétés et du message pour la requête API
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: userMessage,
      max_tokens: 150,
      temperature: 0.7,
    }),
  };

  // Envoi de la requête POST à l'API, récupération de la réponse et mise à jour du texte
  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Récupère le texte de réponse de l'API et met à jour l'élément message
    messageElement.textContent = data.choices[0].text.trim();
  } catch (error) {
    // Gestion des erreurs
    messageElement.classList.add("error");
    messageElement.textContent = "Erreur : " + error.message;
  } finally {
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }
};

const handleChat = () => {
  userMessage = chatInput.value.trim(); // Récupère le message saisi par l'utilisateur et supprime les espaces inutiles
  if (!userMessage) return;

  // Vide la zone de texte et réinitialise la hauteur
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  // Ajoute le message de l'utilisateur dans la chatbox
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    // Affiche le message "Réfléchit..." en attendant la réponse
    const incomingChatLi = createChatLi("Réfléchit...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
};

chatInput.addEventListener("input", () => {
  // Ajuste la hauteur de la zone de texte en fonction de son contenu
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // Si la touche Enter est pressée sans la touche Shift et que la largeur de la fenêtre
  // est supérieure à 800px, gère le chat
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () =>
  document.body.classList.remove("show-chatbot")
);
chatbotToggler.addEventListener("click", () =>
  document.body.classList.toggle("show-chatbot")
);
