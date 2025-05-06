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


  nothing added to commit but untracked files present (use "git add" to track)
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd> git add .
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd> git commit -m "bookingformjs mongo"
[main 65373df] bookingformjs mongo
 1 file changed, 28 insertions(+)
 create mode 100644 javascript/bookingform.js
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd> git push origin main
Enumerating objects: 6, done.
Counting objects: 100% (6/6), done.
Delta compression using up to 12 threads
Compressing objects: 100% (4/4), done.
Writing objects: 100% (4/4), 725 bytes | 725.00 KiB/s, done.
Total 4 (delta 2), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
To https://github.com/jah-navii/ServiceSphere-FSD.git
   24b1aa1..65373df  main -> main
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd>



