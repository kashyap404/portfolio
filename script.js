(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme toggle ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var STORAGE_KEY = "kashyap-site-theme";

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (savedTheme) applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var effectiveDark = current ? current === "dark" : systemDark;
      var next = effectiveDark ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    });
  }

  /* ---------- typing intro ---------- */
  var typedEl = document.getElementById("typed");
  var bootOutput = document.getElementById("bootOutput");
  var COMMAND = "whoami";

  function typeText(el, text, speed, cb) {
    if (prefersReduced) { el.textContent = text; if (cb) cb(); return; }
    var i = 0;
    (function step() {
      el.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) {
        setTimeout(step, speed);
      } else if (cb) {
        cb();
      }
    })();
  }

  if (typedEl && bootOutput) {
    function runBoot() {
      typeText(typedEl, COMMAND, 90, function () {
        setTimeout(function () {
          bootOutput.innerHTML =
            '<div>kashyap agarwal</div><div class="role">EE undergrad, VJTI</div>';
        }, 250);
      });
    }
    runBoot();
  }

  /* ---------- scrollspy ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab[data-target]"));
  var sections = tabs
    .map(function (t) { return document.getElementById(t.dataset.target); })
    .filter(Boolean);

  if (sections.length > 0) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var tab = tabs.find(function (t) { return t.dataset.target === entry.target.id; });
          if (!tab) return;
          if (entry.isIntersecting) {
            tabs.forEach(function (t) { t.classList.remove("active"); });
            tab.classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll("section:not(.in-view)");
  if (revealTargets.length > 0) {
    var reveal = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealTargets.forEach(function (s) { reveal.observe(s); });
  }

  /* ---------- pipeline progress nav (Idea 1) ---------- */
  var stepTitles = document.querySelectorAll('.step-title');
  var pipelineNavItems = document.querySelectorAll('.pipeline-nav-item');
  
  if (stepTitles.length > 0 && pipelineNavItems.length > 0) {
    var stepSpy = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            pipelineNavItems.forEach(function(item) {
              if (item.getAttribute('href') === '#' + id) {
                item.classList.add('active');
              } else {
                item.classList.remove('active');
              }
            });
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    stepTitles.forEach(function(title) { stepSpy.observe(title); });
  }

  /* ---------- blog scroll-tied progress animation ---------- */
  function updateScrollAnimations() {
    var containers = document.querySelectorAll('.token-list, .ast-svg-container');
    var wh = window.innerHeight || document.documentElement.clientHeight;
    
    containers.forEach(function(container) {
      var rect = container.getBoundingClientRect();
      
      var start = wh * 0.75;
      var end = wh * 0.25;
      
      var progress = (start - rect.top) / (start - end);
      progress = Math.max(0, Math.min(1, progress));
      
      var items = container.querySelectorAll('.token, .ast-node, .ast-edge');
      var visibleCount = Math.floor(progress * items.length);
      
      items.forEach(function(item, i) {
        if (i < visibleCount) {
          item.classList.add('visible');
        } else {
          item.classList.remove('visible');
        }
      });
    });
  }

  if (prefersReduced) {
    document.querySelectorAll('.token, .ast-node, .ast-edge').forEach(function(el) {
      el.classList.add('visible');
    });
  } else {
    var ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          updateScrollAnimations();
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateScrollAnimations();
  }

  /* ---------- cross-referencing hover (Idea 3) ---------- */
  var refElements = document.querySelectorAll('[data-ref]');
  refElements.forEach(function(el) {
    el.addEventListener('mouseover', function() {
      var ref = el.getAttribute('data-ref');
      document.querySelectorAll('[data-ref="' + ref + '"]').forEach(function(match) {
        match.classList.add('highlight-ref');
      });
    });
    el.addEventListener('mouseout', function() {
      var ref = el.getAttribute('data-ref');
      document.querySelectorAll('[data-ref="' + ref + '"]').forEach(function(match) {
        match.classList.remove('highlight-ref');
      });
    });
  });

  /* ---------- clock + uptime ---------- */
  var clockEl = document.getElementById("clock");
  var uptimeEl = document.getElementById("uptime");
  
  if (clockEl && uptimeEl) {
    var start = Date.now();
    function pad(n) { return String(n).padStart(2, "0"); }

    function tick() {
      var now = new Date();
      clockEl.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
      var elapsed = Math.floor((Date.now() - start) / 1000);
      var m = Math.floor(elapsed / 60), s = elapsed % 60;
      uptimeEl.textContent = "uptime " + (m ? m + "m " : "") + s + "s";
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- interactive terminal ---------- */
  var termLog = document.getElementById("termLog");
  var termInput = document.getElementById("termInput");

  if (termLog && termInput) {
    var COMMANDS = {
      help: function () {
        return [
          "available commands:",
          "  about      : who i am",
          "  projects   : what i've built",
          "  now        : what i'm working on",
          "  contact    : how to reach me",
          "  banner     : reprint the header",
          "  clear      : clear this terminal",
          "  sudo ...   : nice try"
        ].join("\n");
      },
      about: function () {
        return "EE undergrad at VJTI. into computer architecture, compilers, LLVM internals.\noutside of tech, i really enjoy video editing and cooking.";
      },
      projects: function () {
        return "BlazeScript is a programming language with its frontend written from scratch\nin C++ and its backend powered by LLVM. github.com/kashyap404/BlazeScript";
      },
      now: function () {
        return "Thinking about a compact, structured way to represent hardware designs.\nThe goal is a format an LLM agent can parse in a fraction of the tokens raw\nVerilog takes. Still early, reading up on Google XLS, HLS, and Cornell CAPRA.";
      },
      contact: function () {
        return "github.com/kashyap404\nlinkedin.com/in/kashyap-agarwal-04642b395";
      },
      banner: function () {
        return "kashyap agarwal\nEE undergrad, VJTI";
      },
      whoami: function () {
        return "kashyap agarwal";
      },
      clear: function () {
        termLog.innerHTML = "";
        return null;
      }
    };

    function printLine(text, cls) {
      var div = document.createElement("div");
      div.className = "term-line" + (cls ? " " + cls : "");
      div.textContent = text;
      termLog.appendChild(div);
      termLog.scrollTop = termLog.scrollHeight;
    }

    function runCommand(raw) {
      var input = raw.trim();
      if (!input) return;

      var echo = document.createElement("div");
      echo.className = "term-line echo";
      echo.textContent = input;
      termLog.appendChild(echo);

      var cmd = input.split(/\s+/)[0].toLowerCase();

      if (cmd === "sudo") {
        printLine("nice try. permission denied.", "err");
      } else if (COMMANDS[cmd]) {
        var out = COMMANDS[cmd]();
        if (out) printLine(out);
      } else {
        printLine("command not found: " + cmd + " (try 'help')", "err");
      }

      termLog.scrollTop = termLog.scrollHeight;
    }

    var history = [];
    var historyIndex = -1;

    termInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var val = termInput.value;
        if (val.trim()) {
          history.push(val);
          historyIndex = history.length;
        }
        runCommand(val);
        termInput.value = "";
      } else if (e.key === "ArrowUp") {
        if (historyIndex > 0) {
          historyIndex--;
          termInput.value = history[historyIndex];
          setTimeout(function () { termInput.selectionStart = termInput.selectionEnd = termInput.value.length; });
        }
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (historyIndex < history.length - 1) {
          historyIndex++;
          termInput.value = history[historyIndex];
        } else {
          historyIndex = history.length;
          termInput.value = "";
        }
        e.preventDefault();
      }
    });

    var termElement = document.getElementById("term");
    if (termElement) {
      termElement.addEventListener("click", function () {
        termInput.focus();
      });
    }
  }

  /* smooth-scroll fallback for the "now" jump link inside prose */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    });
  });
})();