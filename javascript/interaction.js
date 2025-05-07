// Wait for the DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Get references to DOM elements
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const sendButton = document.getElementById('send-button');
    
    // Function to send a message
    function sendMessage() {
      // Check if the input is empty
      if (chatInput.value.trim() === '') return;
      
      // Get current time
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Create the message element
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', 'provider');
      
      // Set the HTML content of the message
      messageElement.innerHTML = `
        <img src="profile-picture.png" alt="Avatar" class="avatar">
        <div class="message-content">
          <p>${chatInput.value}</p>
          <span class="message-time">${currentTime}</span>
        </div>
      `;
      
      // Add the message to the chat container
      chatMessages.appendChild(messageElement);
      
      // Clear the input field
      chatInput.value = '';
      
      // Scroll to the bottom of the chat
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to send a service update
    function sendUpdate(update) {
      // Get current time
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Create the message element
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', 'provider');
      
      // Set the HTML content of the message
      messageElement.innerHTML = `
        <img src="profile-picture.png" alt="Avatar" class="avatar">
        <div class="message-content">
          <p>${update}</p>
          <span class="message-time">${currentTime}</span>
        </div>
      `;
      
      // Add the message to the chat container
      chatMessages.appendChild(messageElement);
      
      // Scroll to the bottom of the chat
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Add click event listener to the send button
    sendButton.addEventListener('click', sendMessage);
    
    // Add keypress event listener to the input field
    chatInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        sendMessage();
      }
    });
    
    // Make sendUpdate function available globally for the button onclick handlers
    window.sendUpdate = sendUpdate;
  });

