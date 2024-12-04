class ChatbotComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isOpen = false;
    this.isTyping = false;
    this.mapCounter = 0;
    this.messageHistory = [];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.loadGoogleMapsScript();
  }

  loadGoogleMapsScript() {
    if (!document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  parseMarkdown(text) {
    // Procesamos los saltos de línea básicos
    text = text.replace(/\n/g, '<br>');
  
    if (text.includes('<br>')) {
      const lines = text.split('<br>');
      let formattedText = '';
      let isInUnorderedList = false;
      let isInOrderedList = false;
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Verificar si es un elemento de lista numerada (ahora capturamos el número)
        const orderedMatch = trimmedLine.match(/^(\d+)\.\s(.+)/);
        // Verificar si es un elemento de lista con guiones
        const unorderedMatch = trimmedLine.startsWith('-');
  
        if (orderedMatch) {
          if (!isInOrderedList) {
            // Iniciar nueva lista ordenada
            formattedText += '<ol>';
            isInOrderedList = true;
          }
          // Usar el número original de la lista
          formattedText += `<li value="${orderedMatch[1]}">${orderedMatch[2]}</li>`;
        } else if (unorderedMatch) {
          if (isInOrderedList) {
            // Si estábamos en una lista ordenada, cerrarla
            formattedText += '</ol>';
            isInOrderedList = false;
          }
          if (!isInUnorderedList) {
            // Iniciar nueva lista no ordenada
            formattedText += '<ul>';
            isInUnorderedList = true;
          }
          formattedText += `<li>${trimmedLine.substring(1).trim()}</li>`;
        } else {
          // Cerrar cualquier lista abierta
          if (isInOrderedList) {
            formattedText += '</ol>';
            isInOrderedList = false;
          }
          if (isInUnorderedList) {
            formattedText += '</ul>';
            isInUnorderedList = false;
          }
          formattedText += line;
        }
      });
  
      // Cerrar listas si el texto terminó y aún estaban abiertas
      if (isInOrderedList) {
        formattedText += '</ol>';
      }
      if (isInUnorderedList) {
        formattedText += '</ul>';
      }
  
      text = formattedText;
    }
  
    // Procesamos otros elementos de Markdown
    text = text
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="chat-link">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
    return text;
  }

  parseCoordinates(text) {
    const latitudeMatch = text.match(/Latitud:\s*(-?\d+(\.\d+)?)/);
    const longitudeMatch = text.match(/Longitud:\s*(-?\d+(\.\d+)?)/);

    if (latitudeMatch && longitudeMatch) {
      const latitude = parseFloat(latitudeMatch[1]);
      const longitude = parseFloat(longitudeMatch[1]);
      return { latitude, longitude };
    }

    return null;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --primary-color: #009de0;
          --secondary-color: #f5f8ff;
          --text-color: #333333;
          --background-color: #ffffff;
          --message-bg-user: #009de0;
          --message-bg-bot: #f0f4f8;
          --shadow-color: rgba(0, 0, 0, 0.1);
          --transition: all 0.3s ease;
          position: fixed;
          bottom: 20px;
          right: 20px;
          font-family: 'Segoe UI', 'Roboto', sans-serif;
          z-index: 1000;
          pointer-events: none;
        }

        .message-footer {
          margin-top: 8px;
          padding-left: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .feedback-text {
          color: #666;
          font-size: 12px;
        }

        .feedback-buttons {
          display: flex;
          gap: 8px;
        }

        .feedback-button {
          background: none;
          border: none;
          padding: 6px;
          cursor: pointer;
          border-radius: 4px;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .feedback-button:hover {
          background-color: #f5f5f5;
        }

        .feedback-button.selected {
          color: var(--primary-color);
          background-color: rgba(0, 157, 224, 0.1);
        }

        .feedback-button.like.selected {
          color: #52c41a;
          background-color: rgba(82, 196, 26, 0.1);
        }

        .feedback-button.dislike.selected {
          color: #ff4d4f;
          background-color: rgba(255, 77, 79, 0.1);
        }

        .message-wrapper {
          position: relative;
          flex-grow: 1;
        }

        .message-controls {
          position: absolute;
          right: -30px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .message-wrapper:hover .message-controls {
          opacity: 1;
        }

        .dislike-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #666;
          transition: color 0.2s ease;
        }

        .dislike-button:hover {
          color: #ff4d4f;
        }

        .feedback-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          opacity: 0;
          animation: modalFadeIn 0.3s ease forwards;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          position: relative;
          transform: translateY(20px);
          animation: modalSlideIn 0.3s ease forwards;
        }

        .modal-header {
          padding: 20px 24px 10px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          color: #666;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-description {
          color: #666;
          margin: 0 0 20px 0;
          font-size: 14px;
        }

        .feedback-section {
          margin-bottom: 24px;
        }

        .feedback-section label {
          display: block;
          font-weight: 500;
          margin-bottom: 12px;
          color: #333;
        }

        .feedback-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }

        .feedback-option {
          width: 100%;
          background: none;
          border: 1px solid #e8e8e8;
          border-radius: 6px;
          padding: 12px 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #333;
          box-sizing: border-box;
          font-size: 14px;
        }

        .feedback-option:hover {
          background-color: #f5f8ff;
          border-color: var(--primary-color);
        }

        .feedback-option.selected {
          background-color: #e6f7ff;
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        #feedback-text {
          width: 100%;
          height: 80px;
          padding: 12px;
          border: 1px solid #e8e8e8;
          border-radius: 6px;
          font-family: inherit;
          font-size: 14px;
          resize: none;
          box-sizing: border-box;
          margin-top: 8px;
        }

        #feedback-text:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(0, 157, 224, 0.1);
        }

        .modal-footer {
          padding: 16px 24px;
          margin-top: -34px;
        }

        .submit-button {
          width: 100%;
          background-color: var(--primary-color);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .submit-button:disabled {
          background-color: #e8e8e8;
          cursor: not-allowed;
        }

        .submit-button:not(:disabled):hover {
          background-color: #40a9ff;
        }

        .modal-closing {
          animation: modalFadeOut 0.3s ease forwards;
        }

        .modal-closing .modal-content {
          animation: modalSlideOut 0.3s ease forwards;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            transform: translateY(20px);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes modalFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes modalSlideOut {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(20px);
          }
        }
        .notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 12px 24px;
          border-radius: 8px;
          color: white;
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }

        .notification.success {
          background-color: #52c41a;
        }

        .notification.error {
          background-color: #ff4d4f;
        }

        @keyframes slideIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        #chat-container {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          overflow: hidden;
          width: 380px;
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.1),
            0 0 60px rgba(0, 157, 224, 0.1);
          transition: var(--transition);
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          pointer-events: none;
        }

        #chat-container.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        #chat-header {
          background: linear-gradient(135deg, var(--primary-color), #40a9ff);
          color: var(--background-color);
          padding: 20px;
          font-weight: 600;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }

        #chat-header .minimize-icon {
          width: 18px;
          height: 18px;
          fill: var(--background-color);
          transition: transform 0.3s ease;
        }

        #chat-header:hover .minimize-icon {
          transform: translateY(2px);
        }

        #chat-messages {
          height: 400px;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scroll-behavior: smooth;
        }

        #chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        #chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        #chat-messages::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }

        .message {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 12px;
          line-height: 1.4;
          font-size: 14px;
          transition: var(--transition);
          animation: messageAppear 0.3s ease forwards;
        }

        @keyframes messageAppear {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .user-message {
          background-color: var(--message-bg-user);
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }

        .bot-message-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-bottom: 15px;
        }
        .bot-message-group {
          display: flex;
          align-items: flex-end;
        }
        .bot-avatar {
          width: 30px;
          height: 30px;
          margin-right: 10px;
          flex-shrink: 0;
        }
        .bot-message {
          background-color: var(--message-bg-bot);
          color: var(--text-color);
          border-bottom-left-radius: 4px;
        }
        .bot-message a {
          color: var(--primary-color);
          text-decoration: none;
        }
        .bot-message a:hover {
          text-decoration: underline;
        }

        .chat-link {
          color: var(--primary-color);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }

        .chat-link:hover {
          color: #40a9ff;
          text-decoration: underline;
        }

        #input-container {
          display: flex;
          gap: 10px;
          padding: 20px;
          background-color: var(--secondary-color);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        #user-input {
          flex-grow: 1;
          border: 2px solid rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          background: white;
        }

        #user-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(0, 157, 224, 0.1);
        }

        #send-button, #record-button {
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 12px;
          width: 44px;
          height: 44px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        #send-button:hover, #record-button:hover {
          background: #40a9ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 157, 224, 0.3);
        }

        #send-button svg, #record-button svg {
          width: 20px;
          height: 20px;
          fill: white;
        }

        #chat-icon {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--primary-color), #40a9ff);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 157, 224, 0.3);
          transition: all 0.3s ease;
          pointer-events: auto;
          animation: pulseAnimation 2s infinite;
        }

        #chat-icon svg {
          width: 35px;
          height: 35px;
          fill: var(--background-color);
          margin-top: 5px;
        }

        .bot-avatar svg .st0 { display: none; }
        .bot-avatar svg .st1 { display: inline; fill: #009DE0; }
        .bot-avatar svg .st2 { display: inline; }
        .bot-avatar svg .st3 { fill: #99A2AC; }
        .bot-avatar svg .st4 { fill: #009DE0; }

        @keyframes pulseAnimation {
          0% {
            box-shadow: 0 4px 20px rgba(0, 157, 224, 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 4px 30px rgba(0, 157, 224, 0.4);
            transform: scale(1.05);
          }
          100% {
            box-shadow: 0 4px 20px rgba(0, 157, 224, 0.3);
            transform: scale(1);
          }
        }

        #chat-icon:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(0, 157, 224, 0.4);
        }

        .typing-indicator {
          background-color: var(--message-bg-bot);
          border-radius: 18px;
          padding: 10px 14px;
          display: inline-block;
          align-self: flex-start;
          margin-bottom: 15px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          margin-right: 5px;
          display: inline-block;
          animation: typingBounce 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) { animation-delay: 0s; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }

        .map-container {
          width: 80%;
          height: 230px;
          margin: 20px 0px 10px 40px;
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }

        .hidden {
          display: none !important;
        }
      </style>
      <div id="chat-icon">
        <svg viewBox="180 50 270 270" xmlns="http://www.w3.org/2000/svg">
          <g>
            <path class="st4" d="M429.8,164.5c0-62.8-50.9-113.8-113.8-113.8c-28.8,0-55,10.7-75,28.3c54.4,48.5,121.5,86.4,187,105.6 C429.2,178,429.8,171.3,429.8,164.5z"/>
            <path class="st4" d="M202.9,176.2c5.9,57.3,54.3,102.1,113.2,102.1c41.5,0,77.7-22.2,97.6-55.3c-1.6,0-3.2,0-4.9,0 C369.9,223,287.3,217.4,202.9,176.2z"/>
            <g>
              <path class="st3" d="M435.1,195.5c-3-0.8-5.9-1.7-8.9-2.6c0-0.1,0-0.2,0.1-0.2c-11.6-3.4-23.2-7.3-34.9-11.8 c-0.3-0.1-0.6-0.2-0.9-0.4c-3.5-1.4-6.9-2.7-10.4-4.2c-51.7-21.6-102.4-53.4-145.2-91.7c-2.1-1.9-4.2-3.8-6.3-5.8 c-20,18.7-35.4,58.4-36.5,79.9c-0.1,1.1-0.1,2.2,0,3.3c0.6,0.3,1.1,0.6,1.7,0.9l0.2-0.5c2.7,1.5,5.5,2.8,8.2,4.2 c92.3,46.3,183.2,48.8,215.9,47.9c5.8-0.2,9.8-0.4,11.7-0.6l0,0.1c0.1,0,0.2,0,0.3,0c0.2-0.5,0.5-1.2,0.8-1.9 C432.6,208.1,434.8,201,435.1,195.5L435.1,195.5z"/>
            </g>
          </g>
        </svg>
      </div>
      <div id="chat-container">
        <div id="chat-header">
          <span>Asistente Virtual</span>
          <svg class="minimize-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13H5v-2h14v2z"/>
          </svg>
        </div>
        <div id="chat-messages"></div>
        <div id="input-container">
          <input type="text" id="user-input" placeholder="Escribe tu mensaje...">
          <button id="record-button">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm4.5-3c0 2.21-1.79 4-4 4s-4-1.79-4-4H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-1.5zM12 18c-3.31 0-6-2.69-6-6H4c0 3.87 3.13 7 7 7s7-3.13 7-7h-2c0 3.31-2.69 6-6 6z"/>
            </svg>
          </button>
          <button id="send-button">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const sendButton = this.shadowRoot.getElementById('send-button');
    const userInput = this.shadowRoot.getElementById('user-input');
    const chatIcon = this.shadowRoot.getElementById('chat-icon');
    const chatHeader = this.shadowRoot.getElementById('chat-header');
    const recordButton = this.shadowRoot.getElementById('record-button');
    
    sendButton.addEventListener('click', () => this.sendMessage());
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    chatIcon.addEventListener('click', () => this.toggleChat());
    chatHeader.addEventListener('click', () => this.toggleChat());
    recordButton.addEventListener('click', () => this.startRecording());
  }

  toggleChat() {
    const chatIcon = this.shadowRoot.getElementById('chat-icon');
    const chatContainer = this.shadowRoot.getElementById('chat-container');
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      chatIcon.classList.add('hidden');
      chatContainer.classList.add('visible');
      this.style.pointerEvents = 'auto';
    } else {
      chatIcon.classList.remove('hidden');
      chatContainer.classList.remove('visible');
      this.style.pointerEvents = 'none';
    }
  }

  sendMessage() {
    const userInput = this.shadowRoot.getElementById('user-input');
    const message = userInput.value.trim();
    if (message) {
      this.addMessage('Usuario', message);
      userInput.value = '';
      this.showTypingIndicator();
      this.dispatchEvent(new CustomEvent('message-sent', { detail: message }));
    }
  }

  startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Lo siento, tu navegador no soporta reconocimiento de voz.");
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = true; // Permitir resultados intermedios
    recognition.maxAlternatives = 1;
  
    const userInput = this.shadowRoot.getElementById('user-input');
    let currentTranscript = ''; // Mantener el texto que se va acumulando
    let isFinalResult = false;
  
    recognition.onstart = () => {
      console.log("Grabando...");
      userInput.placeholder = "Grabando... hable ahora";
      currentTranscript = ''; // Reiniciar el texto cuando se inicie la grabación
    };
  
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
  
      // Procesar los resultados intermedios y finales
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          isFinalResult = true;
        } else {
          interimTranscript += transcript;
        }
      }
  
      // Actualizar el texto acumulado y mostrar animación letra por letra
      const combinedTranscript = finalTranscript || interimTranscript;
      if (combinedTranscript !== currentTranscript) {
        this.animateTextAppearance(userInput, currentTranscript, combinedTranscript);
        currentTranscript = combinedTranscript;
      }
    };
  
    recognition.onend = () => {
      console.log("Grabación terminada.");
      userInput.placeholder = "Escribe tu mensaje...";
  
      // Esperar un momento para asegurarse de que se ha terminado completamente de hablar
      setTimeout(() => {
        if (isFinalResult) {
          // Enviar el mensaje automáticamente si se ha reconocido algo final
          const message = userInput.value.trim();
          if (message) {
            this.addMessage('Usuario', message);
            userInput.value = '';
            this.showTypingIndicator();
            this.dispatchEvent(new CustomEvent('message-sent', { detail: message }));
          }
        } else {
          console.log("No se detectó un resultado final adecuado.");
        }
      }, 500); // Ajusta el retraso según sea necesario
    };
  
    recognition.onerror = (event) => {
      console.error("Error en reconocimiento de voz:", event.error);
      alert("Error en reconocimiento de voz: " + event.error);
      userInput.placeholder = "Escribe tu mensaje...";
    };
  
    recognition.start();
  }
  
  animateTextAppearance(inputElement, currentText, newText) {
    // Detener cualquier animación anterior
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
  
    let currentLength = currentText.length;
    const targetLength = newText.length;
  
    const addNextCharacter = () => {
      if (currentLength < targetLength) {
        // Añadir el siguiente carácter
        inputElement.value = newText.slice(0, currentLength + 1);
        currentLength++;
        this.typingTimeout = setTimeout(addNextCharacter, 50); // Ajusta la velocidad si es necesario
      }
    };
  
    addNextCharacter();
  }  

  addMessage(sender, text, type = 'normal') {
    const messages = this.shadowRoot.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    const messageId = Date.now().toString();
    
    // Guardar todos los mensajes en el historial
    this.messageHistory = this.messageHistory || [];
    this.messageHistory.push({
        id: messageId,
        sender,
        text,
        type,  // Podemos guardar el tipo también para referencia
        timestamp: new Date().toISOString()
    });

    // Si es un mensaje del bot, asociarlo con el último mensaje del usuario
    if (sender === 'Bot' && this.messageHistory.length > 1) {
        const lastUserMessage = this.messageHistory
            .slice()
            .reverse()
            .find(msg => msg.sender === 'Usuario');
        if (lastUserMessage) {
            this.messageHistory[this.messageHistory.length - 1].userQuery = lastUserMessage;
        }
    }
    
    if (sender === 'Usuario') {
        messageElement.classList.add('message', 'user-message');
        messageElement.textContent = text;
        messages.appendChild(messageElement);
    } else {
        const botMessageContainer = document.createElement('div');
        botMessageContainer.classList.add('bot-message-container');
        
        const botMessageGroup = document.createElement('div');
        botMessageGroup.classList.add('bot-message-group');
        
        const botAvatar = document.createElement('div');
        botAvatar.classList.add('bot-avatar');
        botAvatar.innerHTML = `
            <svg viewBox="180 50 270 270" xmlns="http://www.w3.org/2000/svg">
                <g>
                    <path class="st4" d="M429.8,164.5c0-62.8-50.9-113.8-113.8-113.8c-28.8,0-55,10.7-75,28.3c54.4,48.5,121.5,86.4,187,105.6 C429.2,178,429.8,171.3,429.8,164.5z"/>
                    <path class="st4" d="M202.9,176.2c5.9,57.3,54.3,102.1,113.2,102.1c41.5,0,77.7-22.2,97.6-55.3c-1.6,0-3.2,0-4.9,0 C369.9,223,287.3,217.4,202.9,176.2z"/>
                    <g>
                        <path class="st3" d="M435.1,195.5c-3-0.8-5.9-1.7-8.9-2.6c0-0.1,0-0.2,0.1-0.2c-11.6-3.4-23.2-7.3-34.9-11.8 c-0.3-0.1-0.6-0.2-0.9-0.4c-3.5-1.4-6.9-2.7-10.4-4.2c-51.7-21.6-102.4-53.4-145.2-91.7c-2.1-1.9-4.2-3.8-6.3-5.8 c-20,18.7-35.4,58.4-36.5,79.9c-0.1,1.1-0.1,2.2,0,3.3c0.6,0.3,1.1,0.6,1.7,0.9l0.2-0.5c2.7,1.5,5.5,2.8,8.2,4.2 c92.3,46.3,183.2,48.8,215.9,47.9c5.8-0.2,9.8-0.4,11.7-0.6l0,0.1c0.1,0,0.2,0,0.3,0c0.2-0.5,0.5-1.2,0.8-1.9 C432.6,208.1,434.8,201,435.1,195.5L435.1,195.5z"/>
                    </g>
                </g>
            </svg>
        `;
        
        messageElement.classList.add('message', 'bot-message');
        messageElement.innerHTML = this.parseMarkdown(text);

        // Agregar event listeners a todos los enlaces dentro del mensaje
        const links = messageElement.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const url = link.getAttribute('href');
                if (url) {
                    this.openPDFInNewTab(url);
                }
            });
        });

        botMessageGroup.appendChild(botAvatar);
        botMessageGroup.appendChild(messageElement);
        botMessageContainer.appendChild(botMessageGroup);
        
        // Solo agregar el footer para mensajes normales
        if (type === 'normal') {
            const messageFooter = document.createElement('div');
            messageFooter.classList.add('message-footer');
            
            const feedbackText = document.createElement('div');
            feedbackText.classList.add('feedback-text');
            feedbackText.textContent = 'Generada por IA. Verifica que la información sea correcta.';
            
            const feedbackButtons = document.createElement('div');
            feedbackButtons.classList.add('feedback-buttons');
            
            feedbackButtons.innerHTML = `
                <button class="feedback-button like" data-message-id="${messageId}" title="Me fue útil">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                </button>
                <button class="feedback-button dislike" data-message-id="${messageId}" title="No me fue útil">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                    </svg>
                </button>
            `;

            messageFooter.appendChild(feedbackText);
            messageFooter.appendChild(feedbackButtons);
            
            // Agregar event listeners para los botones de feedback
            const likeButton = feedbackButtons.querySelector('.like');
            const dislikeButton = feedbackButtons.querySelector('.dislike');
            
            likeButton.addEventListener('click', () => {
                likeButton.classList.add('selected');
                dislikeButton.classList.remove('selected');
            });
            
            dislikeButton.addEventListener('click', () => {
                dislikeButton.classList.add('selected');
                likeButton.classList.remove('selected');
                this.handleDislike(messageId, text);
            });

            botMessageContainer.appendChild(messageFooter);
        }
        
        const coordinates = this.parseCoordinates(text);
        if (coordinates) {
            const mapContainer = document.createElement('div');
            mapContainer.classList.add('map-container');
            mapContainer.id = `map-${this.mapCounter++}`;
            botMessageContainer.appendChild(mapContainer);
            this.initMap(mapContainer.id, coordinates.latitude, coordinates.longitude);
        }
        
        messages.appendChild(botMessageContainer);
    }
    
    messages.scrollTop = messages.scrollHeight;
  }

handleDislike(messageId, messageText) {
    // Encontrar el mensaje del bot y su pregunta asociada
    const botMessage = this.messageHistory.find(msg => msg.id === messageId);
    const userQuery = botMessage?.userQuery?.text || 'No disponible';

    const feedbackModal = document.createElement('div');
    feedbackModal.classList.add('feedback-modal');
    feedbackModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Dejar comentarios</h2>
          <button class="close-button">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-description">
            Estamos trabajando para mejorar la calidad de las respuestas.
            Puedes colaborar respondiendo las preguntas a continuación:
          </p>

          <div class="feedback-section">
            <label>¿Qué tenía de malo la respuesta que recibiste?</label>
            <div class="feedback-options">
              <button class="feedback-option" data-reason="irrelevant">
                No se relacionaba con mi pregunta
              </button>
              <button class="feedback-option" data-reason="inappropriate">
                La respuesta fue ofensiva o inapropiada
              </button>
              <button class="feedback-option" data-reason="unhelpful">
                No me fue útil
              </button>
            </div>
          </div>

          <div class="feedback-section">
            <label>¿Cuál hubiera sido una mejor respuesta? (opcional)</label>
            <textarea id="feedback-text" placeholder="Escribe tus comentarios aquí..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="submit-button" disabled>Enviar</button>
        </div>
      </div>
    `;

    this.shadowRoot.appendChild(feedbackModal);

    const closeButton = feedbackModal.querySelector('.close-button');
    const submitButton = feedbackModal.querySelector('.submit-button');
    const options = feedbackModal.querySelectorAll('.feedback-option');
    const textArea = feedbackModal.querySelector('#feedback-text');
    let selectedReason = null;

    const closeModal = () => {
      feedbackModal.classList.add('modal-closing');
      setTimeout(() => {
        feedbackModal.remove();
      }, 300);
    };

    feedbackModal.addEventListener('click', (e) => {
      if (e.target === feedbackModal) {
        closeModal();
      }
    });

    closeButton.addEventListener('click', closeModal);

    options.forEach(option => {
      option.addEventListener('click', () => {
        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedReason = option.dataset.reason;
        submitButton.disabled = false;
      });
    });

    submitButton.addEventListener('click', async () => {
      if (!selectedReason) return;
      submitButton.disabled = true;
    
      try {
        closeModal();

        const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Si necesitas autenticación, agrega el header aquí
            // 'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            userQuery,
            botResponse: messageText,
            reason: selectedReason,
            comment: textArea.value || null
          })
        });
    
        if (!response.ok) {
          throw new Error('Error al enviar feedback');
        }
    
        const data = await response.json();
        if (data.status === 'success') {
          this.showNotification('Gracias por tus comentarios');
        } else {
          throw new Error('Error en la respuesta del servidor');
        }
      } catch (error) {
        console.error('Error:', error);
        this.showNotification('Error al enviar los comentarios', 'error');
      } finally {
        closeModal();
      }
    });
}

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    this.shadowRoot.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  async openPDFInNewTab(url) {
    try {
      // Mostrar algún tipo de indicador de carga si lo deseas
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Abrir en nueva pestaña
      window.open(blobUrl, '_blank');
      
      // Liberar el objeto URL después de un tiempo
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error('Error al abrir el PDF:', error);
      // Puedes mostrar un mensaje de error al usuario si lo deseas
      alert('No se pudo abrir el documento. Por favor, inténtalo de nuevo.');
    }
  }

  showTypingIndicator() {
    if (!this.isTyping) {
      const messages = this.shadowRoot.getElementById('chat-messages');
      const typingIndicator = document.createElement('div');
      typingIndicator.classList.add('typing-indicator');
      typingIndicator.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(typingIndicator);
      messages.scrollTop = messages.scrollHeight;
      this.isTyping = true;
    }
  }

  hideTypingIndicator() {
    if (this.isTyping) {
      const messages = this.shadowRoot.getElementById('chat-messages');
      const typingIndicator = messages.querySelector('.typing-indicator');
      if (typingIndicator) {
        messages.removeChild(typingIndicator);
      }
      this.isTyping = false;
    }
  }

  addBotResponse(text, type = 'normal') {
    this.hideTypingIndicator();
    this.addMessage('Bot', text, type);
  }

  initMap(containerId, lat, lng) {
    // Esperar a que la API de Google Maps esté cargada
    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkGoogleMaps);
        
        /* eslint-disable no-undef */
        const map = new google.maps.Map(this.shadowRoot.getElementById(containerId), {
          center: { lat, lng },
          zoom: 15
        });
        
        new google.maps.Marker({
          position: { lat, lng },
          map: map
        });
        /* eslint-enable no-undef */
      }
    }, 100);
  }
}

customElements.define('chatbot-component', ChatbotComponent);