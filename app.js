// Habits setup
const habits = [
    { name: "Workout 15 mins", id: "workout", identity: "I am someone who moves every day", streak: 0, lastDone: null },
    { name: "Eat 1 whole foods meal", id: "wholefood", identity: "I am someone who eats clean", streak: 0, lastDone: null },
    { name: "Hair care 10 mins", id: "hair", identity: "I take care of myself", streak: 0, lastDone: null },
    { name: "Only smoke when drinking", id: "smoking", identity: "I only smoke socially", streak: 0, lastDone: null }
  ];
  
  const container = document.getElementById('habits-container');
  
  // Load habits from localStorage
  habits.forEach(habit => {
    const saved = localStorage.getItem(habit.id);
    if(saved) habit.streak = JSON.parse(saved).streak;
    if(saved) habit.lastDone = JSON.parse(saved).lastDone;
  });
  
  function renderHabits() {
    container.innerHTML = '';
    habits.forEach(habit => {
      const div = document.createElement('div');
      div.className = 'habit';
      div.innerHTML = `
        <span>${habit.name}</span>
        <div>
          <span class="streak">${habit.streak} ✅</span>
          <button onclick="logHabit('${habit.id}')">Log</button>
        </div>
      `;
      container.appendChild(div);
    });
  }
  
  function logHabit(id){
    const habit = habits.find(h => h.id === id);
    const today = new Date().toDateString();
  
    if(habit.lastDone === today) return alert("Already logged today!");
  
    habit.streak++;
    habit.lastDone = today;
  
    // Save to localStorage
    localStorage.setItem(habit.id, JSON.stringify({streak: habit.streak, lastDone: habit.lastDone}));
  
    alert(`${habit.identity} ✅`);
    renderHabits();
  }
  
  // Weekly review button
  document.getElementById('weekly-review').addEventListener('click', () => {
    let review = "Weekly Habit Review:\n";
    habits.forEach(h => {
      review += `${h.name}: ${h.streak} days logged\n`;
    });
    alert(review);
  });
  
  // Initial render
  renderHabits();
  
  // Register service worker for notifications
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('service-worker.js').then(() => {
      console.log('Service Worker registered');
    });
  }
  function sendNotification(title, body){
    if(Notification.permission === 'granted'){
      navigator.serviceWorker.ready.then(reg => {
        reg.active.postMessage({
          title: title,
          options: { body: body, icon: 'icon.png' }
        });
      });
    } else {
      Notification.requestPermission();
    }
  }
  
  // Example: sendNotification("Time to work out!", "Let's do 15 mins of movement today!");
  