/* ============================================================
   PALMOLAND — app.js
   Drives the whole page from data.json. Zero backend.
   ============================================================ */
(function () {
  "use strict";

  var $ = function (sel) { return document.querySelector(sel); };

  var reduceMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var cop = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  });

  function fmt(value) { return cop.format(Math.round(value)); }

  function fmtDate(iso) {
    var d = new Date(iso + "T12:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- Count-up animation ---------------- */
  function countUp(el, target, formatter, duration) {
    if (reduceMotion || duration <= 0) {
      el.textContent = formatter(target);
      return;
    }
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3); /* easeOutCubic */
      el.textContent = formatter(target * eased);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = formatter(target);
    }
    requestAnimationFrame(step);
  }

  /* ---------------- Confetti ---------------- */
  function confetti() {
    if (reduceMotion) return;
    var canvas = document.createElement("canvas");
    canvas.id = "confetti-canvas";
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.scale(dpr, dpr);

    var colors = ["#39ffb4", "#ff3ea5", "#3ee0ff", "#ffd166"];
    var emojis = ["🌴", "🎧", "🎉", "💿"];
    var parts = [];
    var i;
    for (i = 0; i < 90; i++) {
      parts.push({
        x: W / 2 + (Math.random() - 0.5) * 140,
        y: H * 0.62,
        vx: (Math.random() - 0.5) * 11,
        vy: -(6 + Math.random() * 9),
        size: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[i % colors.length],
        emoji: Math.random() < 0.14 ? emojis[i % emojis.length] : null,
        life: 1
      });
    }

    var startTs = null;
    var DURATION = 1600;

    function frame(ts) {
      if (!startTs) startTs = ts;
      var elapsed = ts - startTs;
      ctx.clearRect(0, 0, W, H);
      var j, p;
      for (j = 0; j < parts.length; j++) {
        p = parts[j];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; /* gravity */
        p.vx *= 0.99;
        p.rot += p.vr;
        p.life = Math.max(0, 1 - elapsed / DURATION);
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.emoji) {
          ctx.font = "18px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(p.emoji, 0, 0);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }
        ctx.restore();
      }
      if (elapsed < DURATION) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(frame);
  }

  /* ---------------- Patrocinadores ---------------- */
  function avatarInner(entry, cls) {
    if (entry.photo) {
      var img = document.createElement("img");
      img.src = entry.photo;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.onerror = function () {
        /* fall back to emoji if the photo is missing */
        var span = document.createElement("span");
        span.textContent = entry.emoji || "🎧";
        img.replaceWith(span);
      };
      return img;
    }
    var span = document.createElement("span");
    span.textContent = entry.emoji || "🎧";
    return span;
  }

  function entryNode(entry, opts) {
    var wrap = document.createElement("div");
    wrap.className = "entry";
    wrap.style.animationDelay = ((opts && opts.delay) || 0) + "ms";

    if (opts && opts.rank) {
      var rank = document.createElement("span");
      rank.className = "entry-rank";
      rank.textContent = opts.rank;
      wrap.appendChild(rank);
    }

    var avatar = document.createElement("span");
    avatar.className = "entry-avatar";
    avatar.appendChild(avatarInner(entry));
    wrap.appendChild(avatar);

    var main = document.createElement("span");
    main.className = "entry-main";
    var name = document.createElement("span");
    name.className = "entry-name";
    name.textContent = entry.name;
    var date = document.createElement("span");
    date.className = "entry-date";
    date.textContent = fmtDate(entry.date);
    main.appendChild(name);
    main.appendChild(document.createElement("br"));
    main.appendChild(date);
    wrap.appendChild(main);

    var amount = document.createElement("span");
    amount.className = "entry-amount";
    amount.textContent = fmt(entry.amount);
    wrap.appendChild(amount);

    return wrap;
  }

  /* ---------------- Participants render ---------------- */
  function renderParticipants(participants) {
    var countEl = $("#patro-count");
    var podiumEl = $("#podium");
    var rankEl = $("#rank-list");
    var recentEl = $("#recent-list");
    countEl.textContent = participants.length;

    if (!participants.length) {
      podiumEl.outerHTML = '<p class="empty-note" id="podium">Aún no hay aportes… ¡sé el primero en quedar en la historia! 💪</p>';
      rankEl.outerHTML = "";
      recentEl.innerHTML = '<p class="empty-note">Nadie ha aportado todavía. El primero se lleva la gloria eterna. 👑</p>';
      return;
    }

    var byAmount = participants.slice().sort(function (a, b) { return b.amount - a.amount; });
    var byDate = participants.slice().sort(function (a, b) {
      if (a.date === b.date) return a.name.localeCompare(b.name, "es");
      return a.date < b.date ? 1 : -1;
    });

    /* Podium: visual order 2nd, 1st, 3rd */
    var medals = ["🥇", "🥈", "🥉"];
    var classes = ["p1 podium-order-1", "p2 podium-order-2", "p3 podium-order-3"];
    var podiumHtml = "";
    for (var i = 0; i < Math.min(3, byAmount.length); i++) {
      var p = byAmount[i];
      podiumHtml +=
        '<div class="podium-slot ' + classes[i] + '">' +
        '<div class="podium-avatar"></div>' +
        '<div class="podium-name">' + esc(p.name) + "</div>" +
        '<div class="podium-amount">' + fmt(p.amount) + "</div>" +
        '<div class="podium-base">' + medals[i] + "</div>" +
        "</div>";
    }
    podiumEl.innerHTML = podiumHtml;
    /* avatars inserted as nodes so photo fallback works */
    var podiumAvatars = podiumEl.querySelectorAll(".podium-avatar");
    for (var j = 0; j < podiumAvatars.length; j++) {
      podiumAvatars[j].appendChild(avatarInner(byAmount[j]));
    }

    /* Ranked list from 4th place */
    rankEl.innerHTML = "";
    if (byAmount.length > 3) {
      byAmount.slice(3).forEach(function (p, idx) {
        var li = document.createElement("li");
        li.appendChild(entryNode(p, { rank: idx + 4, delay: 260 + idx * 90 }));
        rankEl.appendChild(li);
      });
    } else {
      rankEl.innerHTML = '<li style="list-style:none"><p class="empty-note">Solo hay podio por ahora. Muevo el cue. 🎧</p></li>';
    }

    /* Recent */
    recentEl.innerHTML = "";
    byDate.forEach(function (p, idx) {
      var li = document.createElement("li");
      li.appendChild(entryNode(p, { delay: idx * 90 }));
      recentEl.appendChild(li);
    });
  }

  /* ---------------- Tabs ---------------- */
  function initTabs() {
    var tabTop = $("#tab-top");
    var tabRecent = $("#tab-recent");
    var viewTop = $("#view-top");
    var viewRecent = $("#view-recent");
    var tabs = $(".tabs");
    if (!tabTop || !tabRecent || !viewTop || !viewRecent || !tabs) return;

    function select(isTop) {
      tabTop.classList.toggle("active", isTop);
      tabRecent.classList.toggle("active", !isTop);
      tabTop.setAttribute("aria-selected", String(isTop));
      tabRecent.setAttribute("aria-selected", String(!isTop));
      viewTop.hidden = !isTop;
      viewRecent.hidden = isTop;
      tabs.classList.toggle("moved", !isTop);
    }

    tabTop.addEventListener("click", function () { select(true); });
    tabRecent.addEventListener("click", function () { select(false); });
  }

  /* ---------------- Share / copy ---------------- */
  function initShare() {
    var url = location.href.split("#")[0];
    var wa = $("#btn-wa");
    if (wa) {
      wa.href = "https://wa.me/?text=" +
        encodeURIComponent("🌴 ¡Ya aporté para Palmoland! Sumate vos también: " + url);
    }

    var copyBtn = $("#btn-copy");
    var feedback = $("#copy-feedback");
    if (!copyBtn || !feedback) return;

    function done() {
      feedback.textContent = "¡Copiado! ✅";
      setTimeout(function () { feedback.textContent = ""; }, 2200);
    }

    copyBtn.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function () { fallbackCopy(url, done); });
      } else {
        fallbackCopy(url, done);
      }
    });
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* no-op */ }
    ta.remove();
  }

  /* ---------------- Main render ---------------- */
  function render(data) {
    var goal = data.goalTotal || 2000000;
    var participants = data.participants || [];
    var total = participants.reduce(function (sum, p) { return sum + (Number(p.amount) || 0); }, 0);
    var pct = Math.min(100, (total / goal) * 100);
    var remaining = Math.max(0, goal - total);

    /* Progress bar */
    var bar = $("#main-bar");
    var fill = $("#bar-fill");
    var statTotal = $("#stat-total");
    var statRemaining = $("#stat-remaining");
    var statPct = $("#stat-pct");
    var statCount = $("#stat-count");

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        fill.style.width = pct + "%";
      });
    });
    bar.setAttribute("aria-valuenow", String(Math.round(pct)));

    countUp(statTotal, total, fmt, 1200);
    countUp(statPct, pct, function (v) { return Math.round(v) + "%"; }, 1200);
    statRemaining.textContent = remaining > 0 ? fmt(remaining) : "¡Meta cumplida! 🎉";
    countUp(statCount, participants.length, function (v) { return String(Math.round(v)); }, 900);

    if (total >= goal) {
      var banner = $("#goal-banner");
      banner.classList.remove("hidden");
    }

    /* Milestones */
    var m1 = (data.milestones && data.milestones[0]) || { amount: 1000000, label: "Reservar la finca" };
    var m2 = (data.milestones && data.milestones[1]) || { amount: goal, label: "Palmoland completo" };
    var milestones = [m1, m2];
    var m1Reached = total >= m1.amount;

    milestones.forEach(function (m, idx) {
      var sub = Math.min(100, (total / m.amount) * 100);
      var subbar = $("#subbar-" + idx);
      var amountEl = $("#milestone-amount-" + idx);
      var stateEl = $("#milestone-state-" + idx);
      var card = $("#milestone-" + idx);

      requestAnimationFrame(function () {
        requestAnimationFrame(function () { subbar.style.width = sub + "%"; });
      });
      amountEl.textContent = fmt(Math.min(total, m.amount)) + " de " + fmt(m.amount);
      stateEl.textContent = total >= m.amount ? "¡Lograda! ✅" : "En camino";

      if (total >= m.amount && card) card.classList.add("unlocked");
    });

    /* Milestone 1 pin */
    if (m1Reached) {
      var pinIcon = $("#pin-icon");
      var pinLabel = $(".pin-label");
      bar.classList.add("unlocked");
      if (pinIcon) pinIcon.textContent = "✅";
      if (pinLabel) pinLabel.textContent = "¡Finca reservada! 🌴";
      setTimeout(confetti, reduceMotion ? 0 : 1400);
    }

    renderParticipants(participants);
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    initTabs();
    initShare();

    /* Secondary pages (e.g. aportar.html) only reuse tabs/share — no data to render */
    if (!$("#main-bar")) return;

    fetch("data.json?v=" + Date.now())
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(render)
      .catch(function (err) {
        console.error("Palmoland: no pudimos cargar data.json", err);
        var stats = document.querySelector(".progress-card");
        if (stats) {
          stats.insertAdjacentHTML(
            "afterbegin",
            '<p class="empty-note">🙈 No pudimos cargar los datos. Refresca la página o avísale al admin.</p>'
          );
        }
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
