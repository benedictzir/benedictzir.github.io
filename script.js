document.documentElement.classList.add("js");
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const reduced = () => motionQuery.matches;
function syncMotion() {
  document.documentElement.dataset.motion = reduced() ? "reduced" : "full";
}
motionQuery.addEventListener("change", syncMotion);
syncMotion();

// Native details remain the no-JS fallback; only their inner sheet is animated.
const projectFolders = [...document.querySelectorAll(".project-folder")];
const folderControls = new Map();
for (const folder of projectFolders) {
  const summary = folder.querySelector("summary");
  const content = folder.querySelector(".folder-content");
  const sheet = document.createElement("div");
  sheet.className = "folder-content-inner";
  sheet.append(...content.childNodes);
  content.append(sheet);
  folder.dataset.enhanced = "";
  let animation = null;
  let desiredOpen = folder.open;
  function settle() {
    folder.open = desiredOpen;
    if (animation) {
      animation.onfinish = null;
      animation.cancel();
      animation = null;
    }
    content.style.removeProperty("overflow");
    folder.removeAttribute("data-closing");
  }
  function setOpen(open, animate = !reduced()) {
    const fromHeight = folder.open ? content.getBoundingClientRect().height : 0;
    const fromOpacity = folder.open
      ? parseFloat(getComputedStyle(content).opacity)
      : 0;
    if (animation) {
      animation.onfinish = null;
      animation.cancel();
      animation = null;
    }
    desiredOpen = open;
    if (!animate || (!folder.open && !open)) {
      settle();
      return;
    }
    folder.open = true;
    folder.toggleAttribute("data-closing", !open);
    content.style.overflow = "hidden";
    const toHeight = open ? sheet.getBoundingClientRect().height : 0;
    animation = content.animate(
      [
        {
          height: `${fromHeight}px`,
          opacity: fromOpacity,
          transform: `translateY(${fromHeight ? 0 : -6}px)`,
        },
        {
          height: `${toHeight}px`,
          opacity: open ? 1 : 0,
          transform: `translateY(${open ? 0 : -6}px)`,
        },
      ],
      { duration: 360, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" },
    );
    animation.onfinish = settle;
  }
  summary.addEventListener("click", (event) => {
    event.preventDefault();
    setOpen(animation ? !desiredOpen : !folder.open);
  });
  folderControls.set(folder, { settle, setOpen });
}
motionQuery.addEventListener("change", () => {
  if (reduced()) folderControls.forEach((control) => control.settle());
});
// Ink accents greet the visitor once; they never hold a folder's transform.
const playfulObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!reduced()) entry.target.classList.add("is-presented");
      playfulObserver.unobserve(entry.target);
    }
  },
  { threshold: 0.3 },
);
document
  .querySelectorAll(".work-star")
  .forEach((element) => playfulObserver.observe(element));
document.querySelector("#year").textContent = new Date().getFullYear();

const menuButton = document.querySelector(".menu-toggle"),
  menu = document.querySelector("#site-nav");
menuButton.hidden = false;
function closeMenu(restoreFocus = false) {
  menu.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener("click", () => {
  const open = menu.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.classList.contains("is-open"))
    closeMenu(true);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});

function openDestination(hash) {
  if (!hash || hash === "#") return;
  let destination;
  try {
    destination = document.querySelector(hash);
  } catch {
    return;
  }
  if (!destination) return;
  for (let node = destination; node; node = node.parentElement) {
    if (!(node instanceof HTMLDetailsElement)) continue;
    const control = folderControls.get(node);
    if (control) control.setOpen(true, false);
    else node.open = true;
  }
  if (destination.closest("[data-project]")?.hidden) setFilter("all");
}
document.querySelectorAll('a[href^="#"]').forEach((link) =>
  link.addEventListener("click", () => {
    openDestination(link.hash);
    closeMenu();
  }),
);
addEventListener("hashchange", () => openDestination(location.hash));
const filters = document.querySelector(".work-filters"),
  filterStatus = document.querySelector(".filter-status");
const projectCards = [...document.querySelectorAll("[data-project]")];
const filterMotions = new Map();
function stopFilterMotion() {
  filterMotions.forEach((animation) => animation.cancel());
  filterMotions.clear();
}
function setFilter(category) {
  const previous = new Map(
    projectCards
      .filter((card) => !card.hidden)
      .map((card) => [card, card.getBoundingClientRect()]),
  );
  stopFilterMotion();
  document
    .querySelectorAll("[data-filter]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.filter === category),
      ),
    );
  let count = 0;
  projectCards.forEach((project) => {
    project.hidden = category !== "all" && project.dataset.project !== category;
    if (!project.hidden) count++;
  });
  filterStatus.textContent = `${count} ${count === 1 ? "project" : "projects"} shown.`;
  if (reduced() || document.hidden) return;
  for (const card of projectCards.filter((item) => !item.hidden)) {
    const from = previous.get(card);
    const to = card.getBoundingClientRect();
    const dx = from ? from.left - to.left : 0;
    const dy = from ? from.top - to.top : 14;
    if (from && Math.abs(dx) + Math.abs(dy) < 1) continue;
    const animation = card.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)`, opacity: from ? 1 : 0.3 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 380, easing: "cubic-bezier(.22,1,.36,1)" },
    );
    filterMotions.set(card, animation);
    animation.onfinish = () => {
      if (filterMotions.get(card) === animation) filterMotions.delete(card);
    };
  }
}
filters.hidden = false;
filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (button) setFilter(button.dataset.filter);
});
openDestination(location.hash);
const navLinks = [...menu.querySelectorAll("a")];
const navTargets = navLinks.map((link) => document.querySelector(link.hash));
const navIndicator = document.createElement("span");
navIndicator.className = "nav-indicator";
navIndicator.setAttribute("aria-hidden", "true");
menu.append(navIndicator);
menu.dataset.indicator = "";
const timeline = document.querySelector(".experience-list");
const milestones = [...timeline.querySelectorAll(":scope > article")];
timeline.dataset.timeline = "";
const sticker = document.querySelector("[data-sticker-motion]");
sticker.hidden = false;
let stickerVisible = false;
let stickerPaused = false;
function syncSticker() {
  sticker.dataset.idle = String(
    stickerVisible && !stickerPaused && !reduced() && !document.hidden,
  );
  sticker.setAttribute("aria-pressed", String(stickerPaused));
  sticker.removeAttribute("title");
}
sticker.addEventListener("click", () => {
  stickerPaused = !stickerPaused;
  syncSticker();
});
new IntersectionObserver(
  ([entry]) => {
    stickerVisible = entry.isIntersecting;
    syncSticker();
  },
  { threshold: 0.1 },
).observe(sticker);

// A decorative loop supplements the complete, stationary technology inventory.
const techReel = document.querySelector("[data-tech-reel]");
let reelVisible = false;
let reelPaused = false;
const reelTrack = document.createElement("span");
reelTrack.className = "tech-reel-track";
reelTrack.setAttribute("aria-hidden", "true");
const reelGroup = document.createElement("span");
reelGroup.className = "tech-reel-group";
const reelNames = [
  "Python",
  "Java",
  "Django",
  "Spring Boot",
  "Flutter",
  "Node.js",
  "Godot",
  "Figma",
];
const inventory = [...document.querySelectorAll(".tech-inventory > li")];
for (const name of reelNames) {
  const original = inventory.find(
    (item) => item.querySelector("strong").textContent === name,
  );
  if (!original) continue;
  const chip = document.createElement("span");
  chip.className = "tech-reel-chip";
  const label = document.createElement("span");
  label.textContent = name;
  chip.append(original.querySelector("img").cloneNode(), label);
  reelGroup.append(chip);
}
reelTrack.append(reelGroup, reelGroup.cloneNode(true));
const reelWindow = document.createElement("span");
reelWindow.className = "tech-reel-window";
reelWindow.append(reelTrack);
techReel.append(reelWindow);
techReel.hidden = false;
function syncReel() {
  techReel.dataset.running = String(
    reelVisible && !reelPaused && !reduced() && !document.hidden,
  );
  techReel.setAttribute("aria-pressed", String(reelPaused));
  techReel.title = reelPaused
    ? "Resume moving tech icons"
    : "Pause moving tech icons";
}
techReel.addEventListener("click", () => {
  reelPaused = !reelPaused;
  syncReel();
});
new IntersectionObserver(
  ([entry]) => {
    reelVisible = entry.isIntersecting;
    syncReel();
  },
  { threshold: 0.1 },
).observe(techReel);

const milestoneObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.dataset.timelineSeen = "";
      milestoneObserver.unobserve(entry.target);
    }
  },
  { threshold: 0.15 },
);
milestones.forEach((row) => milestoneObserver.observe(row));

// Scroll reads are batched into one frame; nothing runs between scroll events.
let pageFrame = 0;
function updatePageMotion() {
  pageFrame = 0;
  if (document.hidden) return;
  const focusLine = Math.max(120, innerHeight * 0.24);
  let activeIndex = 0;
  navTargets.forEach((target, index) => {
    if (target && target.getBoundingClientRect().top <= focusLine)
      activeIndex = index;
  });
  navLinks.forEach((link, index) => {
    if (index === activeIndex) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  const navBox = menu.getBoundingClientRect();
  const activeBox = navLinks[activeIndex].getBoundingClientRect();
  const top = milestones[0].offsetTop + 35;
  const length = milestones.at(-1).offsetTop + 35 - top;
  const readLine = innerHeight * 0.68 - timeline.getBoundingClientRect().top;
  const progress = reduced()
    ? 1
    : Math.min(1, Math.max(0, (readLine - top) / Math.max(1, length)));
  const reached = milestones.map(
    (row) => reduced() || row.offsetTop + 35 <= readLine,
  );
  navIndicator.hidden = navBox.width === 0;
  if (navBox.width) {
    menu.style.setProperty("--nav-x", `${activeBox.left - navBox.left}px`);
    menu.style.setProperty("--nav-y", `${activeBox.bottom - navBox.top - 3}px`);
    menu.style.setProperty("--nav-width", `${activeBox.width}px`);
  }
  timeline.style.setProperty("--timeline-top", `${top}px`);
  timeline.style.setProperty("--timeline-length", `${length}px`);
  timeline.style.setProperty("--timeline-progress", progress);
  milestones.forEach((row, index) =>
    row.toggleAttribute("data-reached", reached[index]),
  );
}
function queuePageMotion() {
  if (!pageFrame && !document.hidden)
    pageFrame = requestAnimationFrame(updatePageMotion);
}
addEventListener("scroll", queuePageMotion, { passive: true });
addEventListener("resize", () => {
  stopFilterMotion();
  queuePageMotion();
});
menuButton.addEventListener("click", queuePageMotion);
motionQuery.addEventListener("change", () => {
  stopFilterMotion();
  syncSticker();
  syncReel();
  queuePageMotion();
});
document.addEventListener("visibilitychange", () => {
  syncSticker();
  syncReel();
  if (document.hidden) {
    stopFilterMotion();
    cancelAnimationFrame(pageFrame);
    pageFrame = 0;
  } else queuePageMotion();
});
const layoutObserver = new ResizeObserver(queuePageMotion);
layoutObserver.observe(timeline);
layoutObserver.observe(document.querySelector("main"));
document.fonts.ready.then(queuePageMotion);
queuePageMotion();
let toastTimer;
const toast = document.querySelector(".toast");
function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3500);
}
document.querySelectorAll("[data-copy]").forEach((button) => {
  button.hidden = false;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      notify(
        button.dataset.copy.includes("@")
          ? "Email address copied."
          : "Discord username copied.",
      );
    } catch {
      notify(`Copy manually: ${button.dataset.copy}`);
    }
  });
});

// A mailto handoff keeps delivery explicit: the visitor sends from their email app.
const emailForm = document.querySelector("#email-form");
const emailStatus = document.querySelector("#email-status");
const emailDraft = document.querySelector("[data-email-draft]");
emailForm.addEventListener("input", (event) => {
  event.target.setCustomValidity?.("");
  emailStatus.textContent = "";
  emailDraft.hidden = true;
});
emailForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = ["name", "email", "subject", "message"].map((name) =>
    emailForm.elements.namedItem(name),
  );
  for (const field of fields) {
    field.setCustomValidity(
      field.value.trim() ? "" : "Please fill out this field.",
    );
  }
  if (!emailForm.reportValidity()) return;
  const [name, email, subject, message] = fields.map((field) =>
    field.value.trim(),
  );
  const body = `${message}\n\nFrom: ${name}\nReply email: ${email}`;
  emailDraft.href = `mailto:benedictusziraluo@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  emailDraft.hidden = false;
  emailStatus.textContent =
    "Draft prepared. Send it from your email app. If it didn't open, use the link below or copy my email address above.";
  emailDraft.click();
});
