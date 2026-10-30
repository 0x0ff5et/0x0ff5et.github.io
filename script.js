/* 0x0ff5et.github.io shared script. Progress is stored in the visitor's browser only. */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- game config: add a slug here when you publish a new post ---- */
  var SLUGS = ["aws-iam-project", "aws-secrets-manager-project", "aws-security-monitoring-project"];
  var POST_XP = 100, STAGE_XP = 5, PER = 100;
  var TITLES = ["Recruit", "Scout", "Analyst", "Hunter", "Defender", "Root"];
  var BADGES = [
    { k: "hi", n: "Logged in", i: "1" },
    { k: "about", n: "Met the player", i: "@" },
    { k: "one", n: "First write-up", i: "★" },
    { k: "all", n: "All cleared", i: "✓" }
  ];

  /* ---- state ---- */
  var KEY = "0x0ff5et.save.v3";
  var S = { xp: 0, posts: {}, ach: [] };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || "{}"); for (var k in saved) S[k] = saved[k]; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function post(slug) { return S.posts[slug] || (S.posts[slug] = { st: [], done: 0, got: 0 }); }

  function toast(m) {
    var e = document.createElement("div"); e.className = "t"; e.textContent = m;
    $("#toast").appendChild(e); setTimeout(function () { e.remove(); }, 3000);
  }
  var shown = 0;
  function countTo(n) {
    var el = $("#xpn"), s = shown, t = performance.now(); shown = n;
    if (reduce) { el.textContent = n + " XP"; return; }
    (function f(now) { var p = Math.min((now - t) / 700, 1); el.textContent = Math.round(s + (n - s) * p) + " XP"; if (p < 1) requestAnimationFrame(f); })(t);
  }
  function render() {
    var lv = Math.floor(S.xp / PER) + 1, pct = S.xp % PER;
    $("#lv").textContent = "Lv " + lv + " " + TITLES[Math.min(lv - 1, TITLES.length - 1)];
    $("#fill").style.width = pct + "%";
    $("#bar").setAttribute("aria-valuenow", pct);
    countTo(S.xp);
    $$(".q").forEach(function (q) { q.classList.toggle("cleared", !!(S.posts[q.dataset.slug] && S.posts[q.dataset.slug].done)); });
    var b = $("#badges");
    if (b) b.innerHTML = BADGES.map(function (x) { return '<div class="bd ' + (S.ach.indexOf(x.k) > -1 ? "on" : "") + '"><span>' + x.i + "</span>" + x.n + "</div>"; }).join("");
  }
  function gain(n, why) {
    var before = Math.floor(S.xp / PER); S.xp += n; save(); render();
    if (n) toast("+" + n + " XP · " + why);
    if (Math.floor(S.xp / PER) > before) setTimeout(function () { toast("Level up!"); burst(); }, 450);
  }
  function badge(k, xp, why) {
    if (S.ach.indexOf(k) > -1) return;
    S.ach.push(k); save();
    if (xp) gain(xp, why); else { render(); toast("Badge · " + why); }
  }
  function doneCount() { return SLUGS.filter(function (s) { return S.posts[s] && S.posts[s].done; }).length; }

  /* ---- animated background and level-up confetti ---- */
  var c = $("#fx"), x = c.getContext("2d"), W, H, N = [], m = { x: -999, y: -999 }, B = [];
  function size() {
    W = c.width = innerWidth; H = c.height = innerHeight;
    N = Array.from({ length: Math.min(70, Math.floor(W / 18)) }, function () { return { x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 }; });
  }
  addEventListener("resize", size);
  addEventListener("pointermove", function (e) { m.x = e.clientX; m.y = e.clientY; });
  size();
  function burst() {
    if (reduce) return;
    for (var i = 0; i < 60; i++) B.push({ x: innerWidth - 80, y: innerHeight - 60, vx: (Math.random() - .8) * 9, vy: -Math.random() * 11 - 2, l: 1, c: ["#ffc02e", "#3ddc97", "#8b5cff"][i % 3] });
  }
  function draw() {
    x.clearRect(0, 0, W, H);
    N.forEach(function (a) {
      a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1;
      var dx = a.x - m.x, dy = a.y - m.y, d = Math.hypot(dx, dy); if (d < 120) { a.x += dx / d * 1.2; a.y += dy / d * 1.2; }
      x.fillStyle = "#3ddc9777"; x.fillRect(a.x, a.y, 2, 2);
    });
    for (var i = 0; i < N.length; i++) for (var j = i + 1; j < N.length; j++) {
      var d2 = Math.hypot(N[i].x - N[j].x, N[i].y - N[j].y);
      if (d2 < 110) { x.strokeStyle = "rgba(61,220,151," + (.14 * (1 - d2 / 110)) + ")"; x.beginPath(); x.moveTo(N[i].x, N[i].y); x.lineTo(N[j].x, N[j].y); x.stroke(); }
    }
    B.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.vy += .35; p.l -= .014; x.globalAlpha = Math.max(p.l, 0); x.fillStyle = p.c; x.fillRect(p.x, p.y, 6, 6); });
    x.globalAlpha = 1; B = B.filter(function (p) { return p.l > 0; });
    requestAnimationFrame(draw);
  }
  if (!reduce) draw();

  /* ---- post cards: tilt, filter, search ---- */
  $$(".q").forEach(function (q) {
    if (reduce) return;
    q.addEventListener("pointermove", function (e) {
      var r = q.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      q.style.setProperty("--ry", (px - .5) * 7 + "deg"); q.style.setProperty("--rx", (.5 - py) * 7 + "deg");
      q.style.setProperty("--mx", px * 100 + "%"); q.style.setProperty("--my", py * 100 + "%");
    });
    q.addEventListener("pointerleave", function () { q.style.setProperty("--rx", "0deg"); q.style.setProperty("--ry", "0deg"); });
  });
  $$(".tile").forEach(function (t) {
    t.addEventListener("pointermove", function (e) { var r = t.getBoundingClientRect(); t.style.setProperty("--mx", e.clientX - r.left + "px"); t.style.setProperty("--my", e.clientY - r.top + "px"); });
  });
  var fl = $("#filters");
  if (fl) {
    var tag = "All", tags = ["All"];
    $$(".q").forEach(function (q) { q.dataset.tags.split("|").forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); }); });
    var apply = function () {
      var term = ($("#search").value || "").toLowerCase(), n = 0;
      fl.innerHTML = tags.map(function (t) { return '<button class="chip" aria-pressed="' + (t === tag) + '" data-t="' + t + '">' + t + "</button>"; }).join("");
      $$(".q").forEach(function (q) {
        var ok = (tag === "All" || q.dataset.tags.split("|").indexOf(tag) > -1) && q.textContent.toLowerCase().indexOf(term) > -1;
        q.style.display = ok ? "" : "none"; if (ok) n++;
      });
      $("#empty").hidden = n > 0;
    };
    fl.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { tag = b.dataset.t; apply(); } });
    $("#search").addEventListener("input", apply); apply();
  }

  /* ---- hero typing ---- */
  var lead = $("#lead");
  if (lead) {
    if (reduce) lead.classList.add("done");
    else { var t = lead.dataset.text, i = 0; lead.textContent = ""; setTimeout(function f() { lead.textContent = t.slice(0, ++i); if (i < t.length) setTimeout(f, 22); else lead.classList.add("done"); }, 700); }
  }

  /* ---- article: stages, progress, completion ---- */
  var slug = document.body.dataset.post;
  if (slug) {
    var p = post(slug), stages = $$("h2.stage"), total = stages.length;
    var mark = function () {
      $$(".quest li").forEach(function (li) { li.classList.toggle("on", p.st.indexOf(li.dataset.s) > -1); });
      $("#stcount").textContent = p.st.length + " of " + total + " cleared";
    };
    mark();
    var check = function () {
      stages.forEach(function (st) {
        if (p.st.indexOf(st.id) > -1 || st.getBoundingClientRect().top > innerHeight * .65) return;
        p.st.push(st.id); p.got += STAGE_XP; mark(); gain(STAGE_XP, "Stage cleared");
      });
    };
    addEventListener("scroll", check, { passive: true }); check();
    new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting || p.done) return;
      check(); p.done = 1; var rest = Math.max(POST_XP - p.got, 0); save();
      gain(rest, "Quest complete"); badge("one", 0, "First write-up");
      if (doneCount() === SLUGS.length) badge("all", 0, "All cleared");
      render();
    }, { threshold: .6 }).observe($("#end"));
    var pr = $("#prog");
    addEventListener("scroll", function () { var h = document.documentElement; pr.style.width = Math.min(100, h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%"; }, { passive: true });

    $$(".code").forEach(function (box) {
      var b = document.createElement("button"); b.className = "copy"; b.type = "button"; b.textContent = "Copy";
      b.addEventListener("click", function () {
        var txt = $("code", box).textContent;
        (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { b.textContent = "Copied"; }, function () { b.textContent = "Press Ctrl+C"; });
        setTimeout(function () { b.textContent = "Copy"; }, 1600);
      });
      box.appendChild(b);
    });
    var lb = $("#lb");
    $$("figure img").forEach(function (im) { im.addEventListener("click", function () { $("img", lb).src = im.src; lb.hidden = false; }); });
    lb.addEventListener("click", function () { lb.hidden = true; });
    addEventListener("keydown", function (e) { if (e.key === "Escape") lb.hidden = true; });
  }

  var rs = $("#reset");
  if (rs) rs.addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Reset all XP, stages and badges?")) { S = { xp: 0, posts: {}, ach: [] }; save(); location.reload(); }
  });

  render();
  setTimeout(function () { badge("hi", 10, "Logged in"); }, 900);
  if (document.body.dataset.page === "about") setTimeout(function () { badge("about", 10, "Met the player"); }, 1200);
})();
