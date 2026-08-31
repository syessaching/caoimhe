/* ---------- content: edit these two arrays ---------- */
const SERVICES = [
  { num: "01", title: "Project management", desc: "Boards, tasks and timelines kept current so the team always knows what is next." },
  { num: "02", title: "Data & reporting",   desc: "Clean, accurate records and the reports that get pulled from them." },
  { num: "03", title: "SQL query",          desc: "Writing and refining SQL queries that pull the exact data your team needs, fast." },
  { num: "04", title: "Database management & governance", desc: "Keeping databases clean, structured and documented so your data stays trustworthy." },
  { num: "05", title: "Automation",         desc: "Zapier and Make flows that remove the repetitive steps from your process." },
  { num: "06", title: "Tech support",       desc: "First line of defense when software breaks or a tool stops behaving." },
  { num: "07", title: "Customer support",   desc: "Tickets answered promptly, with the tone and detail your customers expect." },
  { num: "08", title: "Inbox & calendar",   desc: "Triage, scheduling and follow-ups handled so nothing important sits unread." }
];

const STACK = [
  { label: "COMMUNICATION",            tools: ["Slack", "Zoom", "Google Workspace"] },
  { label: "PROJECT MANAGEMENT",       tools: ["ClickUp", "Asana", "Notion", "Trello"] },
  { label: "AUTOMATION",               tools: ["Zapier", "Make"] },
  { label: "SUPPORT & CRM",            tools: ["Zendesk", "Intercom", "HubSpot"] },
  { label: "SPREADSHEETS & REPORTING", tools: ["Excel", "Power Query", "Pivot Tables", "Google Sheets", "Airtable"] },
  { label: "BI & DASHBOARDS",          tools: ["Power BI", "DAX", "DOMO", "Tableau"] },
  { label: "DATABASES",                tools: ["SQL", "Snowflake", "Postgres"] },
  { label: "DATA GOVERNANCE",          tools: ["Data Governance", "Data Privacy", "Data Management", "Data Dictionary"] }
];

const PHRASES = ["Chezza", "your data wrangler", "your Automation Specialist", "your ops person", "your systems nerd"];

/* ---------- render lists ---------- */
document.getElementById("services-grid").innerHTML = SERVICES.map(s => `
  <div class="service">
    <div class="num">${s.num}</div>
    <h3>${s.title}</h3>
    <p>${s.desc}</p>
  </div>`).join("");

document.getElementById("tools-grid").innerHTML = STACK.map(c => `
  <div>
    <h3>${c.label}</h3>
    <div class="chips">${c.tools.map(t => `<span class="chip">${t}</span>`).join("")}</div>
  </div>`).join("");

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- typing rotation ---------- */
(function () {
  const el = document.getElementById("typed");
  let pi = 0, ci = 0, erasing = false;
  (function tick() {
    const word = PHRASES[pi];
    let delay = 95;
    if (!erasing) {
      ci++;
      if (ci >= word.length) { erasing = true; delay = 1900; }
    } else {
      ci--; delay = 45;
      if (ci <= 0) { erasing = false; pi = (pi + 1) % PHRASES.length; delay = 420; }
    }
    el.textContent = PHRASES[pi].slice(0, Math.max(ci, 0));
    setTimeout(tick, delay);
  })();
})();

/* ---------- paper toss game ---------- */
(function () {
  const canvas = document.getElementById("toss-canvas");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("toss-score");
  const W = canvas.width, H = canvas.height;

  const floorY = H - 22;
  const startPos = { x: 34, y: floorY - 10 };
  const can = { x: W - 82, y: floorY - 58, width: 52, height: 52 };
  const ballRadius = 8;
  const gravity = 0.42;

  let ball = { ...startPos };
  let vel = { x: 0, y: 0 };
  let mode = "idle"; // idle | aiming | flying | result
  let aimPoint = null;
  let attempts = 0, makes = 0;
  let resultText = "";

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  }

  function drawCan() {
    ctx.fillStyle = "oklch(87% 0.07 352)";
    ctx.fillRect(can.x - 4, can.y - 8, can.width + 8, 8);
    ctx.beginPath();
    ctx.moveTo(can.x + 4, can.y);
    ctx.lineTo(can.x + can.width - 4, can.y);
    ctx.lineTo(can.x + can.width - 10, can.y + can.height);
    ctx.lineTo(can.x + 10, can.y + can.height);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "oklch(18% 0.01 250)";
    ctx.lineWidth = 2;
    [1, 2].forEach(i => {
      const lx = can.x + (can.width / 3) * i;
      ctx.beginPath();
      ctx.moveTo(lx, can.y + 6);
      ctx.lineTo(lx - 3, can.y + can.height - 6);
      ctx.stroke();
    });
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "oklch(64% 0.15 352)";
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "oklch(100% 0 0 / 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, floorY + ballRadius);
    ctx.lineTo(W, floorY + ballRadius);
    ctx.stroke();
    drawCan();
    if (mode === "aiming" && aimPoint) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "oklch(87% 0.07 352)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ball.x, ball.y);
      ctx.lineTo(aimPoint.x, aimPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    drawBall();
    if (mode === "result") {
      ctx.fillStyle = "oklch(87% 0.07 352)";
      ctx.font = "700 15px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(resultText, W / 2, 22);
    }
  }

  function updateScore() {
    scoreEl.textContent = `${makes} / ${attempts}`;
  }

  function resetBall() {
    ball = { ...startPos };
    vel = { x: 0, y: 0 };
    mode = "idle";
    draw();
  }

  function step() {
    if (mode !== "flying") return;
    const prevY = ball.y;
    vel.y += gravity;
    ball.x += vel.x;
    ball.y += vel.y;

    // the ball must actually pass through the can's opening: its full width has to
    // clear the inner rim, and it has to be falling through the opening's y-band,
    // not just brushing the can anywhere along its body.
    const innerMargin = 11;
    const openingBand = 16;
    const withinOpeningX = ball.x - ballRadius > can.x + innerMargin && ball.x + ballRadius < can.x + can.width - innerMargin;
    const crossedOpening = prevY <= can.y + openingBand && ball.y > can.y && ball.y <= can.y + openingBand;
    const madeIt = withinOpeningX && crossedOpening && vel.y > 0;

    if (madeIt) {
      makes++; attempts++; updateScore();
      resultText = "nice! 🎉";
      mode = "result";
      draw();
      setTimeout(resetBall, 700);
      return;
    }
    if (ball.y - ballRadius > floorY || ball.x - ballRadius > W || ball.x + ballRadius < 0) {
      attempts++; updateScore();
      resultText = "try again";
      mode = "result";
      draw();
      setTimeout(resetBall, 600);
      return;
    }
    draw();
    requestAnimationFrame(step);
  }

  canvas.addEventListener("pointerdown", e => {
    if (mode !== "idle") return;
    e.preventDefault();
    mode = "aiming";
    canvas.setPointerCapture(e.pointerId);
    aimPoint = getPos(e);
    draw();
  });
  canvas.addEventListener("pointermove", e => {
    if (mode !== "aiming") return;
    e.preventDefault();
    aimPoint = getPos(e);
    draw();
  });
  canvas.addEventListener("pointerup", e => {
    if (mode !== "aiming") return;
    e.preventDefault();
    const end = getPos(e);
    const dx = end.x - ball.x, dy = end.y - ball.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 14) { mode = "idle"; draw(); return; }
    const power = Math.min(dist, 150) / 150;
    const speed = 6 + power * 9;
    vel.x = (dx / dist) * speed;
    vel.y = (dy / dist) * speed;
    mode = "flying";
    requestAnimationFrame(step);
  });

  updateScore();
  draw();
})();

/* ---------- toss dock toggle ---------- */
(function () {
  const dock = document.getElementById("toss-dock");
  const tab = document.getElementById("toss-tab");
  tab.addEventListener("click", () => {
    const collapsed = dock.classList.toggle("collapsed");
    tab.setAttribute("aria-expanded", String(!collapsed));
  });
})();

/* ---------- deter casual photo saving ---------- */
(function () {
  const photo = document.querySelector(".about-photo");
  if (!photo) return;
  photo.addEventListener("contextmenu", e => e.preventDefault());
  photo.addEventListener("dragstart", e => e.preventDefault());
})();
