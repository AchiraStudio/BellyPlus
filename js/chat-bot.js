async function sendMessage() {
      const input = document.getElementById("input");
      const text = input.value.trim();
      if (!text) return;

      addBubble(text, 'user');
      input.value = "";

      const res = await fetch("https://5ac9-180-252-173-42.ngrok-free.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text })
      });

      const data = await res.json();
      addBubble(data.response, 'bot');
    }

function addBubble(text, type) {
      const chat = document.getElementById("chat");
      const div = document.createElement("div");
      div.className = "bubble " + type;
      div.textContent = text;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    }