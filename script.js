const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;

// API configuration
const API_KEY = "AIzaSyC3yPFozzx8VW0FM7CZiyqddRchvyawVoc"; // Your API key here
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

/**
 * Cr e un  l ment <li> de chat avec le message et la classe donn s
 * @param {String} message - Message  afficher dans le <li>
 * @param {String} className - Nom de la classe CSS, "outgoing" ou "incoming"
 * @returns {Element} El ment <li> de chat
 */
const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let chatContent = className === "outgoing" 
    ? `<p></p>` 
    : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi; 
}

/**
 * G n re une r ponse en appelant l'API de generateContent
 * @param {Element} chatElement - El ment <li> de la chatbox qui contient le message de l'utilisateur
 * @returns {Promise<void>}
 */

/**
 * G n re une r ponse en appelant l'API de generateContent
 * @param {Element} chatElement - El ment <li> de la chatbox qui contient le message de l'utilisateur
 * @returns {Promise<void>}
 */
const generateResponse = async (chatElement) => {
  const messageElement = chatElement.querySelector("p");
  const context = "Je suis un assistant pour la microfinance FTSL, prêt à vous aider avec vos préoccupations.";

  /**
   * R qu te de l'API generateContent
   * @see https://cloud.google.com/ai-platform/docs/reference/rest/v1/projects/predict#Request
   */
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      contents: [{ 
        role: "user", 
        parts: [{ text: `${context} ${userMessage}` }] // Ajout du contexte au message de l'utilisateur
      }] 
    }),
  }

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    
    /**
     * La r ponse est sous la forme d'un tableau de suggestions
     * Le premier l ment du tableau est la r ponse la plus probable
     * La r ponse est format e sous forme de texte HTML
     * On enl ve les balises <p> inutiles et on remplace les balises <strong> par des balises <b>
     */
    messageElement.textContent = data.candidates[0].content.parts[0].text
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  } catch (error) {
    messageElement.classList.add("error");
    messageElement.textContent = "Désolé, une erreur est survenue. Veuillez réessayer plus tard."; // Message d'erreur amélioré
  } finally {
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }
}

/**
 * G n re le message de l'utilisateur et appelle la fonction generateResponse
 * si le message n'est pas vide
 * @returns {void}
 */
const handleChat = () => {
  userMessage = chatInput.value.trim(); // R cup re le message de l'utilisateur et enlever les espaces
  if (!userMessage) return;

  // Vider la zone de texte et r initialiser la hauteur
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  // Ajouter le message de l'utilisateur  la chatbox
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  // Appeler la fonction generateResponse apr s un d lai
  setTimeout(() => {
    // Cr er un l ment <li> pour le message "Thinking..."
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
}

chatInput.addEventListener("input", () => {
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
