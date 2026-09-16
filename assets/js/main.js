(function () {
  "use strict";

  var WHATSAPP_PHONE = "5511943157377";

  function buildWhatsAppUrl(message) {
    var text = encodeURIComponent(message);
    return "https://api.whatsapp.com/send/?phone=" + WHATSAPP_PHONE +
      "&text=" + text + "&type=phone_number&app_absent=0";
  }

  document.querySelectorAll("[data-wa-msg]").forEach(function (el) {
    el.setAttribute("href", buildWhatsAppUrl(el.getAttribute("data-wa-msg")));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var prefersReducedMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function createAutoplay(container, tick, delay) {
    if (prefersReducedMotion) return { restart: function () {} };
    var timer = null;
    var stop = function () {
      if (timer) { clearInterval(timer); timer = null; }
    };
    var start = function () {
      stop();
      timer = setInterval(tick, delay);
    };
    container.addEventListener("mouseenter", stop);
    container.addEventListener("mouseleave", start);
    container.addEventListener("focusin", stop);
    container.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    start();
    return { restart: start };
  }

  var filmstrip = document.querySelector("[data-filmstrip]");
  if (filmstrip) {
    var fViewport = filmstrip.querySelector(".filmstrip-viewport");
    var fSlides = Array.prototype.slice.call(filmstrip.querySelectorAll(".filmstrip-slide"));
    var fPrev = filmstrip.querySelector("[data-filmstrip-prev]");
    var fNext = filmstrip.querySelector("[data-filmstrip-next]");
    var fCurrent = filmstrip.querySelector("[data-filmstrip-current]");
    var fTotal = filmstrip.querySelector("[data-filmstrip-total]");

    if (fTotal) fTotal.textContent = fSlides.length;

    var fActiveIndex = 0;
    var setActive = function (index) {
      fActiveIndex = index;
      fSlides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      if (fCurrent) fCurrent.textContent = index + 1;
    };
    setActive(0);

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            setActive(fSlides.indexOf(entry.target));
          }
        });
      }, { root: fViewport, threshold: [0.6] });
      fSlides.forEach(function (slide) { observer.observe(slide); });
    }

    var scrollToSlide = function (index) {
      var clamped = Math.max(0, Math.min(fSlides.length - 1, index));
      var slide = fSlides[clamped];
      var target = slide.offsetLeft - (fViewport.clientWidth - slide.offsetWidth) / 2;
      fViewport.scrollTo({ left: target, behavior: "smooth" });
    };

    var fAutoplay = fSlides.length > 1
      ? createAutoplay(filmstrip, function () {
          scrollToSlide((fActiveIndex + 1) % fSlides.length);
        }, 4500)
      : { restart: function () {} };

    if (fPrev) fPrev.addEventListener("click", function () { scrollToSlide(fActiveIndex - 1); fAutoplay.restart(); });
    if (fNext) fNext.addEventListener("click", function () { scrollToSlide(fActiveIndex + 1); fAutoplay.restart(); });
  }

  var testimonial = document.querySelector("[data-testimonial]");
  if (testimonial) {
    var tTrack = testimonial.querySelector(".testimonial-track");
    var tSlides = Array.prototype.slice.call(testimonial.querySelectorAll(".testimonial-slide"));
    var tPrev = testimonial.querySelector("[data-testimonial-prev]");
    var tNext = testimonial.querySelector("[data-testimonial-next]");
    var tDotsWrap = testimonial.querySelector("[data-testimonial-dots]");
    var tIndex = 0;

    var tDots = tSlides.map(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "testimonial-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Depoimento " + (i + 1) + " de " + tSlides.length);
      dot.addEventListener("click", function () { goToTestimonial(i); tAutoplay.restart(); });
      if (tDotsWrap) tDotsWrap.appendChild(dot);
      return dot;
    });

    function goToTestimonial(index) {
      tIndex = (index + tSlides.length) % tSlides.length;
      tTrack.style.transform = "translateX(-" + (tIndex * 100) + "%)";
      tDots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === tIndex);
        dot.setAttribute("aria-selected", i === tIndex ? "true" : "false");
      });
    }
    goToTestimonial(0);

    var tAutoplay = tSlides.length > 1
      ? createAutoplay(testimonial, function () {
          goToTestimonial(tIndex + 1);
        }, 6000)
      : { restart: function () {} };

    if (tPrev) tPrev.addEventListener("click", function () { goToTestimonial(tIndex - 1); tAutoplay.restart(); });
    if (tNext) tNext.addEventListener("click", function () { goToTestimonial(tIndex + 1); tAutoplay.restart(); });
  }

  var yearEl = document.querySelector("[data-current-year]");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
