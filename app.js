const habits = [
    {
      name: "Workout 15 mins",
      id: "workout",
      identity: "I am someone who moves every day",
      streak: 0,
      lastDone: null
    },
    {
      name: "Eat 1 whole foods meal",
      id: "wholefood",
      identity: "I am someone who eats clean",
      streak: 0,
      lastDone: null
    },
    {
      name: "Hair care 10 mins",
      id: "hair",
      identity: "I take care of myself",
      streak: 0,
      lastDone: null
    },
    {
      name: "Only smoke when drinking",
      id: "smoking",
      identity: "I only smoke socially",
      streak: 0,
      lastDone: null
    }
  ];
  
  const container = document.getElementById("habits-container");
  
  habits.forEach(habit => {
    const saved = localStorage.getItem(habit.id);
    if (saved) {
      const parsed = JSON.parse(saved);
      habit.streak = parsed.streak || 0;
      habit.lastDone = parsed.lastDone || null;
    }
  });
  
  function renderHabits() {
    container.innerHTML = "";
  
    habits.forEach(habit => {
      const div = document.createElement("div");
      div.className = "habit";
  
      div.innerHTML = `
        <div class="habit-left">
          <div class="habit-name">${habit.name}</div>
          <div class="habit-identity">${habit.identity}</div>
        </div>
        <div class="habit-right">
          <span class="streak-pill">${habit.streak} day${habit.streak === 1 ? "" : "s"}</span>
          <button onclick="logHabit('${habit.id}')">Log</button>
        </div>
      `;
  
      container.appendChild(div);
    });
  }
  
  function logHabit(id) {
    const habit = habits.find(h => h.id === id);
    const today = new Date().toDateString();
  
    if (habit.lastDone === today) {
      alert("Already logged today.");
      return;
    }
  
    habit.streak++;
    habit.lastDone = today;
  
    localStorage.setItem(
      habit.id,
      JSON.stringify({
        streak: habit.streak,
        lastDone: habit.lastDone
      })
    );
  
    alert(`${habit.identity} ✅`);
    renderHabits();
  }
  
  document.getElementById("weekly-review").addEventListener("click", () => {
    let review = "Weekly Habit Review:\n\n";
  
    habits.forEach(habit => {
      review += `${habit.name}: ${habit.streak} day${habit.streak === 1 ? "" : "s"}\n`;
    });
  
    alert(review);
  });
  
  renderHabits();
  
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
      .then(() => {
        console.log("Service Worker registered");
      })
      .catch(error => {
        console.error("Service Worker registration failed:", error);
      });
  }
  
  function sendNotification(title, body) {
    if (!("Notification" in window)) return;
  
    if (Notification.permission === "granted") {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) {
          registration.active.postMessage({
            title,
            options: {
              body,
              icon: "icon.png"
            }
          });
        }
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }
  