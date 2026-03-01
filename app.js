const STORAGE_KEY = "daily-systems-v1";

const defaultHabits = [
  {
    id: "workout",
    name: "Workout 15 Minutes per Day",
    identity: "I am someone who moves every day",
    cue: "Noon Monday to Friday. On weekends, whenever I do not have housework or I am baby-free.",
    cueVisibility: "Keep workout clothes visible and easy to grab.",
    craving: "I want to feel strong and look better.",
    attractivenessLever: "Looking better and feeling less flabby.",
    responseMini: "Change into workout clothes.",
    responseFull: "Do the workout.",
    frictionReduction: "Keep workout clothes accessible and pack the bag the night before work.",
    rewardImmediate: "Bragging to Keely and getting to eat something satiating.",
    rewardTracking: "Log it in the app and acknowledge the benefits."
  },
  {
    id: "wholefood",
    name: "Eat 1 Whole Foods Meal per Day",
    identity: "I am someone who eats clean",
    cue: "Lunch or meal prep time.",
    cueVisibility: "Use a notepad or chalkboard in the kitchen to plan meals.",
    craving: "I want more energy.",
    attractivenessLever: "More energy and an immediate sense of doing something good for myself.",
    responseMini: "Have a piece of fruit.",
    responseFull: "Eat one full whole-food meal.",
    frictionReduction: "Keep a list of easy meal options ready.",
    rewardImmediate: "Allow a small treat food.",
    rewardTracking: "Log it in the app and acknowledge the benefits."
  },
  {
    id: "hair",
    name: "Hair Care 10 Minutes per Day",
    identity: "I take care of myself",
    cue: "Part of my morning routine, especially after showering.",
    cueVisibility: "Keep hair tools visible and easy to access.",
    craving: "I want to maintain good hair for a long time.",
    attractivenessLever: "Looking better and younger.",
    responseMini: "Brush.",
    responseFull: "Do the full 10 minutes of hair care.",
    frictionReduction: "Watch YouTube while doing it.",
    rewardImmediate: "Play a game, guitar, or watch YouTube afterwards.",
    rewardTracking: "Log it in the app."
  }
];

let state = loadState();

const container = document.getElementById("habits-container");
const weeklyReviewButton = document.getElementById("weekly-review");
const toast = document.getElementById("toast");

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultHabits.map(habit => ({
      ...habit,
      streak: 0,
      lastCompleted: null,
      logs: [],
      startedToday: false,
      startedAt: null,
      expanded: false
    }));
  }

  try {
    const saved = JSON.parse(raw);

    return defaultHabits.map(defaultHabit => {
      const existing = saved.find(item => item.id === defaultHabit.id);

      return {
        ...defaultHabit,
        streak: existing?.streak || 0,
        lastCompleted: existing?.lastCompleted || null,
        logs: Array.isArray(existing?.logs) ? existing.logs : [],
        startedToday: isSameDay(existing?.startedAt, getTodayISO()),
        startedAt: isSameDay(existing?.startedAt, getTodayISO()) ? existing.startedAt : null,
        expanded: false
      };
    });
  } catch (error) {
    console.error("Failed to parse saved state:", error);

    return defaultHabits.map(habit => ({
      ...habit,
      streak: 0,
      lastCompleted: null,
      logs: [],
      startedToday: false,
      startedAt: null,
      expanded: false
    }));
  }
}

function saveState() {
  const toSave = state.map(habit => ({
    id: habit.id,
    streak: habit.streak,
    lastCompleted: habit.lastCompleted,
    logs: habit.logs,
    startedAt: habit.startedAt
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

function getTodayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
}

function getYesterdayISO() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
}

function isSameDay(dateA, dateB) {
  if (!dateA || !dateB) return false;
  return dateA === dateB;
}

function getLast7DaysCount(logs) {
  const today = new Date();
  const cutoff = new Date();
  cutoff.setDate(today.getDate() - 6);

  return logs.filter(log => {
    const logDate = new Date(`${log}T12:00:00`);
    return logDate >= cutoff && logDate <= today;
  }).length;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast._timeout);
  showToast._timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function startHabit(id) {
  const habit = state.find(item => item.id === id);
  if (!habit) return;

  const today = getTodayISO();

  habit.startedToday = true;
  habit.startedAt = today;

  saveState();
  renderHabits();

  showToast(`Start with this: ${habit.responseMini}`);
}

function completeHabit(id) {
  const habit = state.find(item => item.id === id);
  if (!habit) return;

  const today = getTodayISO();
  const yesterday = getYesterdayISO();

  if (habit.lastCompleted === today) {
    showToast("Already completed today.");
    return;
  }

  if (habit.lastCompleted === yesterday) {
    habit.streak += 1;
  } else {
    habit.streak = 1;
  }

  habit.lastCompleted = today;
  habit.startedToday = false;
  habit.startedAt = null;

  if (!habit.logs.includes(today)) {
    habit.logs.push(today);
  }

  habit.logs = habit.logs.sort();

  saveState();
  renderHabits();

  showToast(`Done. ${habit.identity}`);
}

function toggleDetails(id) {
  state = state.map(habit => {
    if (habit.id === id) {
      return { ...habit, expanded: !habit.expanded };
    }
    return habit;
  });

  renderHabits();
}

function showWeeklyReview() {
  const lines = state.map(habit => {
    const count = getLast7DaysCount(habit.logs);
    return `${habit.name}: ${count} / 7 completions`;
  });

  showToast(`7-day review — ${lines.join(" • ")}`);
}

function renderHabits() {
  container.innerHTML = "";

  state.forEach(habit => {
    const completedToday = habit.lastCompleted === getTodayISO();
    const last7 = getLast7DaysCount(habit.logs);

    const card = document.createElement("article");
    card.className = "habit-card";

    card.innerHTML = `
      <div class="habit-top">
        <div class="habit-header">
          <div class="habit-title-wrap">
            <h2 class="habit-name">${escapeHtml(habit.name)}</h2>
            <p class="habit-identity">${escapeHtml(habit.identity)}</p>
          </div>

          <div class="status-pills">
            <span class="pill">${habit.streak} day${habit.streak === 1 ? "" : "s"}</span>
            <span class="pill ${completedToday ? "success" : ""}">
              ${completedToday ? "Done today" : `${last7}/7 this week`}
            </span>
          </div>
        </div>

        <div class="quick-lines">
          <div class="quick-line">
            <span class="quick-label">Cue</span>
            <span class="quick-text">${escapeHtml(habit.cue)}</span>
          </div>
          <div class="quick-line">
            <span class="quick-label">Start with</span>
            <span class="quick-text">${escapeHtml(habit.responseMini)}</span>
          </div>
        </div>

        <div class="habit-actions">
          <button class="secondary-button" data-action="start" data-id="${habit.id}">Start</button>
          <button class="secondary-button" data-action="complete" data-id="${habit.id}">Complete</button>
          <button class="ghost-button" data-action="toggle" data-id="${habit.id}">
            ${habit.expanded ? "Hide details" : "Show details"}
          </button>
        </div>

        ${
          habit.startedToday && !completedToday
            ? `
              <div class="start-message">
                <div class="start-message-title">In motion</div>
                <p>
                  ${escapeHtml(habit.responseMini)} Then: ${escapeHtml(habit.responseFull)}
                </p>
              </div>
            `
            : ""
        }
      </div>

      ${
        habit.expanded
          ? `
            <div class="habit-details">
              <div class="details-grid">
                <div class="detail-box">
                  <h3>Cue Visibility</h3>
                  <p>${escapeHtml(habit.cueVisibility)}</p>
                </div>
                <div class="detail-box">
                  <h3>Craving</h3>
                  <p>${escapeHtml(habit.craving)}</p>
                </div>
                <div class="detail-box">
                  <h3>Attractiveness Lever</h3>
                  <p>${escapeHtml(habit.attractivenessLever)}</p>
                </div>
                <div class="detail-box">
                  <h3>Standard Response</h3>
                  <p>${escapeHtml(habit.responseFull)}</p>
                </div>
                <div class="detail-box">
                  <h3>Ease / Friction Reduction</h3>
                  <p>${escapeHtml(habit.frictionReduction)}</p>
                </div>
                <div class="detail-box">
                  <h3>Immediate Reward</h3>
                  <p>${escapeHtml(habit.rewardImmediate)}</p>
                </div>
                <div class="detail-box">
                  <h3>Tracking Reward</h3>
                  <p>${escapeHtml(habit.rewardTracking)}</p>
                </div>
              </div>
            </div>
          `
          : ""
      }
    `;

    container.appendChild(card);
  });

  bindActions();
}

function bindActions() {
  const buttons = container.querySelectorAll("button[data-action]");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const { action, id } = button.dataset;

      if (action === "start") startHabit(id);
      if (action === "complete") completeHabit(id);
      if (action === "toggle") toggleDetails(id);
    });
  });
}

weeklyReviewButton.addEventListener("click", showWeeklyReview);

renderHabits();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(error => {
      console.error("Service worker registration failed:", error);
    });
  });
}
