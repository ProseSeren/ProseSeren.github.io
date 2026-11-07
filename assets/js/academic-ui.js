/**
 * academic-ui.js — Interactive Motion & Visual Engine for Qisong Zhang's Academic Homepage
 * Integrates:
 *  1. Canvas-UI WebGL2 Shaders (DavidHDev/canvas-ui: ForceField hexagonal lattice & 3D WaveGrid)
 *  2. Typewriter Greeting (bilingual EN/ZH cycling)
 *  3. Spring Physics Engine (Hooke's law velocity-preserving spring for selectable logos)
 *  4. Stagger Cascade Orchestrator (IntersectionObserver + filter re-trigger)
 *  5. Skeleton Shimmer Loader & Split-Screen Research Showcase Controller
 *  6. Astryx Theme Manager (Stone Light / Obsidian Dark) + Uiverse Spotlight Cards
 */
(function () {
  "use strict";

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ========================================================================
     1. Astryx Theme Manager (Light Stone / Dark Obsidian)
     ======================================================================== */
  const THEME_KEY = "astryx_academic_theme";
  function initTheme() {
    updateThemeButtons(document.documentElement.dataset.theme || "light");

    document.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-action='toggle-theme']");
      if (!btn) return;
      const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem(THEME_KEY, next); } catch {}
      updateThemeButtons(next);
    });
    document.addEventListener("languagechange", function () {
      updateThemeButtons(document.documentElement.dataset.theme || "light");
    });
  }

  function updateThemeButtons(theme) {
    document.querySelectorAll("[data-action='toggle-theme']").forEach(function (btn) {
      const label = btn.querySelector(".theme-label");
      const isZh = document.documentElement.classList.contains("lang-zh-active");
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      btn.setAttribute("aria-label", isZh ? "切换浅深色主题" : "Toggle light and dark appearance");
      if (label) {
        label.textContent = theme === "dark" ? (isZh ? "暗曜模式" : "Obsidian") : (isZh ? "暖石学术" : "Stone");
      }
    });
  }

  /* ========================================================================
     2. Typewriter Effect on the "Hello" Greeting Bar
     ======================================================================== */
  const TYPEWRITER_PHRASES = {
    en: [
      "building goal-driven self-evolving visual data engines (DataEvolver).",
      "engineering 3D failure-to-data closed-loop harnesses (DataRSI).",
      "optimizing rectified-flow diffusion trajectories via RLHF (Traj-MCPO).",
      "aligning structured multi-panel visual narratives (Panel2Page).",
      "decoupling 3D geometric rotation & scene residuals (GeoEdit++)."
    ],
    zh: [
      "构建目标驱动的可控视觉数据自演化系统 (DataEvolver)。",
      "研发失败驱动模型进化的 3D 合成数据闭环 (DataRSI)。",
      "探索整流流扩散模型轨迹级边际一致策略优化 (Traj-MCPO)。",
      "提出结构化视觉叙事与全景分镜对齐框架 (Panel2Page)。",
      "打造渐进式残差课程学习与 3D 几何图像编辑系统 (GeoEdit++)。"
    ]
  };

  function initTypewriter() {
    const el = document.getElementById("hero-typewriter-text");
    if (!el) return;

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let paused = false;
    let timer = null;

    const bar = el.closest(".typewriter-bar");
    if (bar) {
      bar.addEventListener("mouseenter", function () { paused = true; });
      bar.addEventListener("mouseleave", function () { paused = false; });
    }

    function getLang() {
      return document.documentElement.classList.contains("lang-zh-active") ? "zh" : "en";
    }

    function step() {
      const lang = getLang();
      const list = TYPEWRITER_PHRASES[lang] || TYPEWRITER_PHRASES.en;
      const currentPhrase = list[phraseIdx % list.length];

      if (reducedMotionQuery.matches) {
        el.textContent = currentPhrase;
        timer = setTimeout(step, 3500);
        return;
      }

      if (paused) {
        timer = setTimeout(step, 180);
        return;
      }

      if (!deleting) {
        charIdx = Math.min(charIdx + 1, currentPhrase.length);
        el.textContent = currentPhrase.slice(0, charIdx);
        if (charIdx >= currentPhrase.length) {
          deleting = true;
          timer = setTimeout(step, 2100);
          return;
        }
        timer = setTimeout(step, lang === "zh" ? 55 : 32);
      } else {
        charIdx = Math.max(charIdx - 1, 0);
        el.textContent = currentPhrase.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % list.length;
          timer = setTimeout(step, 260);
          return;
        }
        timer = setTimeout(step, lang === "zh" ? 24 : 16);
      }
    }

    step();

    // Reset immediately when language switches
    document.addEventListener("languagechange", function () {
      clearTimeout(timer);
      charIdx = 0;
      deleting = false;
      step();
    });
  }

  /* ========================================================================
     3. Spring Physics Engine for Selectable Logos & Filter Badges
        (Hooke's law: F = -k * x - c * v, stiffness=280, damping=16, mass=1)
     ======================================================================== */
  function attachSpringPhysics(el) {
    const state = {
      x: 0, y: 0, scale: 1,
      vx: 0, vy: 0, vs: 0,
      tx: 0, ty: 0, ts: 1,
      raf: 0
    };
    const stiffness = 280;
    const damping = 16;
    const dt = 1 / 60;

    function tick() {
      const fx = -stiffness * (state.x - state.tx) - damping * state.vx;
      const fy = -stiffness * (state.y - state.ty) - damping * state.vy;
      const fs = -stiffness * (state.scale - state.ts) - damping * state.vs;

      state.vx += fx * dt;
      state.vy += fy * dt;
      state.vs += fs * dt;

      state.x += state.vx * dt;
      state.y += state.vy * dt;
      state.scale += state.vs * dt;

      el.style.transform =
        "translate3d(" + state.x.toFixed(2) + "px, " + state.y.toFixed(2) + "px, 0) scale(" + state.scale.toFixed(4) + ")";

      const settled =
        Math.abs(state.x - state.tx) < 0.05 &&
        Math.abs(state.y - state.ty) < 0.05 &&
        Math.abs(state.scale - state.ts) < 0.002 &&
        Math.abs(state.vx) < 0.05 &&
        Math.abs(state.vy) < 0.05 &&
        Math.abs(state.vs) < 0.002;

      if (!settled) {
        state.raf = requestAnimationFrame(tick);
      } else {
        state.x = state.tx;
        state.y = state.ty;
        state.scale = state.ts;
        el.style.transform =
          state.tx === 0 && state.ty === 0 && state.ts === 1
            ? ""
            : "translate3d(" + state.tx + "px, " + state.ty + "px, 0) scale(" + state.ts + ")";
        state.raf = 0;
      }
    }

    function impulse(tx, ty, ts, boostScale) {
      if (reducedMotionQuery.matches) return;
      state.tx = tx;
      state.ty = ty;
      state.ts = ts;
      if (boostScale) state.vs += boostScale;
      if (!state.raf) state.raf = requestAnimationFrame(tick);
    }

    el.addEventListener("pointerenter", function () {
      impulse(0, -3, 1.05, 0.8);
    });

    el.addEventListener("pointermove", function (e) {
      if (reducedMotionQuery.matches) return;
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.18;
      const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.22 - 2;
      impulse(dx, dy, 1.05, 0);
    });

    el.addEventListener("pointerdown", function () {
      impulse(0, 1, 0.93, -1.6);
    });

    el.addEventListener("pointerup", function () {
      impulse(0, -2, 1.06, 2.2);
    });

    el.addEventListener("pointerleave", function () {
      impulse(0, 0, 1.0, 0);
    });
  }

  function initSpringLogos() {
    const pills = document.querySelectorAll(".spring-logo-pill");
    pills.forEach(function (pill) {
      pill.setAttribute("aria-pressed", String(pill.classList.contains("is-selected")));
      attachSpringPhysics(pill);
      pill.addEventListener("click", function () {
        const filterTag = pill.getAttribute("data-filter-tag") || "all";
        const already = pill.classList.contains("is-selected") && filterTag !== "all";
        pills.forEach(function (p) { p.classList.remove("is-selected"); });

        const nextTag = already ? "all" : filterTag;
        if (nextTag === "all") {
          const allPill = document.querySelector(".spring-logo-pill[data-filter-tag='all']");
          if (allPill) allPill.classList.add("is-selected");
        } else {
          pill.classList.add("is-selected");
        }
        applyTagFilter(nextTag);
      });
    });
  }

  /* ========================================================================
     4. Stagger Cascade Orchestrator & Publication Filter
     ======================================================================== */
  function assignStaggerIndices(containerSelector, itemSelector) {
    document.querySelectorAll(containerSelector).forEach(function (container) {
      const items = container.querySelectorAll(itemSelector);
      let visibleIdx = 0;
      items.forEach(function (item) {
        if (!item.hidden) {
          item.style.setProperty("--stagger-index", String(visibleIdx));
          visibleIdx++;
        }
      });
    });
  }

  function initStaggerObserver() {
    assignStaggerIndices("[data-stagger-group]", ".stagger-item");

    if (!("IntersectionObserver" in window) || reducedMotionQuery.matches) {
      document.querySelectorAll(".stagger-item").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    );

    document.querySelectorAll(".stagger-item").forEach(function (el) {
      observer.observe(el);
    });
    // Fallback so full-page captures or deep-link jumps never leave items hidden
    setTimeout(function () {
      document.querySelectorAll(".stagger-item").forEach(function (el) {
        if (!el.hidden) el.classList.add("is-visible");
      });
    }, 650);
  }

  function replayStaggerAndSkeleton() {
    // 1. Trigger Skeleton Shimmer on Showcase & Pub Thumbs
    const stageFrame = document.getElementById("showcase-figure-frame");
    if (stageFrame) {
      stageFrame.classList.add("is-loading");
      setTimeout(function () {
        stageFrame.classList.remove("is-loading");
      }, 620);
    }

    document.querySelectorAll(".skeleton-card").forEach(function (card) {
      card.classList.add("is-loading");
      setTimeout(function () {
        card.classList.remove("is-loading");
      }, 580);
    });

    // 2. Replay Stagger Cascade on visible items
    const items = document.querySelectorAll(".stagger-item");
    items.forEach(function (el) {
      el.classList.remove("is-visible");
    });
    assignStaggerIndices("[data-stagger-group]", ".stagger-item");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        items.forEach(function (el) {
          if (!el.hidden) el.classList.add("is-visible");
        });
      });
    });
  }

  function applyTagFilter(tag) {
    // Sync filter buttons in Publications section
    document.querySelectorAll("[data-pub-filter]").forEach(function (btn) {
      const match = btn.getAttribute("data-pub-filter") === tag;
      btn.classList.toggle("active", match);
      btn.setAttribute("aria-pressed", match ? "true" : "false");
    });
    document.querySelectorAll(".spring-logo-pill").forEach(function (pill) {
      const selected = pill.getAttribute("data-filter-tag") === tag;
      pill.classList.toggle("is-selected", selected);
      pill.setAttribute("aria-pressed", String(selected));
    });

    const cards = document.querySelectorAll("[data-work-tags]");
    cards.forEach(function (card) {
      const tags = (card.getAttribute("data-work-tags") || "").split(/\s+/);
      const show = tag === "all" || tags.indexOf(tag) !== -1;
      card.hidden = !show;
      card.classList.remove("is-visible");
    });

    assignStaggerIndices("[data-stagger-group]", ".stagger-item");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        cards.forEach(function (card) {
          if (!card.hidden) card.classList.add("is-visible");
        });
      });
    });
  }

  /* ========================================================================
     5. Split-Screen Research Showcase Controller (with Skeleton Shimmer)
     ======================================================================== */
  const SHOWCASE_DATA = {
    dataevolver: {
      venueEn: "KDD 2026 Wksp Oral · BAAI 2026 · ICASSP 2027 Submitted",
      venueZh: "KDD 2026 Workshop Oral · BAAI 2026 · ICASSP 2027 在投",
      titleEn: "DataEvolver / DataRSI",
      titleZh: "DataEvolver / DataRSI",
      descEn: "One research line combines goal-driven visual data generation, quality diagnosis, and failure-to-data evolution. Qwen-Image, SAM3, Hunyuan3D 2.1, and Blender form the asset pipeline; a 24-action repair controller adapts data to viewpoint-specific failures.",
      descZh: "同一条研究主线覆盖目标驱动的视觉数据生成、质量诊断与失败驱动的数据演化。Qwen-Image、SAM3、Hunyuan3D 2.1 与 Blender 组成资产流水线，24 类动作控制器修复特定视角下的缺陷。",
      aiImage: "images/showcase_dataevolver_datarsi.png",
      artifactImage: "images/datarsi_bench_comparison.png",
      captionEn: "AI-generated concept illustration.",
      captionZh: "AI 生成的概念示意图。",
      artifactCaptionEn: "DataRSI-Bench qualitative comparison from the existing research materials.",
      artifactCaptionZh: "现有研究材料中的 DataRSI-Bench 定性对比图。",
      metrics: [
        { val: "16.79 dB (+1.03)", lblEn: "SpatialEdit PSNR vs Public LoRA", lblZh: "SpatialEdit PSNR 较基线增益" },
        { val: "14.36 dB (+1.54)", lblEn: "DataRSI-Bench PSNR vs Base", lblZh: "DataRSI-Bench PSNR 较 Base 增益" },
        { val: "0.7223 SSIM", lblEn: "DataRSI-Bench · 384 pairs", lblZh: "DataRSI-Bench · 384 对样本" }
      ],
      links: [
        { label: "arXiv:2605.01789", url: "https://arxiv.org/abs/2605.01789" },
        { label: "GitHub Repo", url: "https://github.com/PRIS-CV/DataEvolver" },
        { label: "Project Page", url: "https://pris-cv.github.io/DataEvolver/" },
        { label: "OpenReview", url: "https://openreview.net/forum?id=8ppusILCIH" },
        { label: "Method PDF", url: "files/method_overview.pdf" },
        { label: "DataRSI PDF", url: "files/dataevolver_self_evolution.pdf" }
      ]
    },
    trajmcpo: {
      venueEn: "ACM MM 2026 (Accepted · CCF-A) · Second Author",
      venueZh: "ACM MM 2026 已录用（CCF-A）· 第二作者",
      titleEn: "Traj-MCPO: Trajectory-wise Marginal Consistent Policy Optimization",
      titleZh: "Traj-MCPO：整流流扩散模型轨迹级边际一致策略优化",
      descEn: "Resolves the ODE-SDE marginal distribution mismatch and coarse scalar reward granularity in Rectified Flow diffusion RLHF post-training. Introduces length-normalized trajectory likelihood ratios and trajectory-level clipping objectives to suppress multi-step integration drift across Qwen-Image and FLUX backbones.",
      descZh: "针对整流流（Rectified Flow）扩散模型 RLHF 后训练中 ODE-SDE 边际分布不匹配与标量奖励粒度过粗难题，提出长度归一化轨迹似然比与轨迹级截断（Clipping）目标，显著抑制长步数积分漂移，在 Qwen-Image 与 FLUX 基座上全面超越 DanceGRPO 与 MixGRPO。",
      aiImage: "images/showcase_traj_mcpo.png",
      artifactImage: "images/showcase_traj_mcpo.png",
      captionEn: "AI-generated concept illustration of Traj-MCPO.",
      captionZh: "AI 生成的 Traj-MCPO 概念示意图。",
      metrics: [
        { val: "83.2%", lblEn: "Instruction Alignment Preference Rate", lblZh: "指令对齐人类偏好胜率" },
        { val: "75.0%", lblEn: "Visual Quality Preference Rate", lblZh: "图像美学与质量偏好胜率" },
        { val: "CCF-A", lblEn: "Accepted at ACM Multimedia 2026", lblZh: "ACM MM 2026 正式录用" }
      ],
      links: [
        { label: "Open-Source Code", url: "https://github.com/Kamisato520/Traj-MCPO-Trajectory-wise-Marginal-Consistent-Policy-Optimization" }
      ]
    },
    panel2page: {
      venueEn: "Under review · Second author",
      venueZh: "在审 · 第二作者",
      titleEn: "Panel2Page: Structured Visual Narrative Generation with Omni-Panel Alignment",
      titleZh: "Panel2Page：融合全景分镜对齐的结构化视觉叙事生成",
      descEn: "A single-stage dual-process framework for multi-panel comic page generation. Injects global layout composition priors via Page-Level SFT and aligns text prompts, temporal event sequences, and cross-view character identity via Omni-Panel Alignment (OPA) with zero extra inference overhead.",
      descZh: "针对复杂视觉叙事（漫画整页生成）中全局排版构图与跨分镜局部语义协同的痛点，提出单阶段双过程框架：通过页面级 SFT 注入全局结构先验，并设计全景分镜对齐（OPA）无缝融合文本感知、事件时序与角色跨视图一致性（零额外推理开销）。",
      aiImage: "images/showcase_panel2page.png",
      artifactImage: "images/showcase_panel2page.png",
      captionEn: "AI-generated concept illustration of Panel2Page.",
      captionZh: "AI 生成的 Panel2Page 概念示意图。",
      metrics: [
        { val: "20,000 Pairs", lblEn: "Curated Prompt-Page Training Corpus", lblZh: "高质量 Prompt-Page 叙事数据集" },
        { val: "320 Pages", lblEn: "Complex Multi-Panel Layout Benchmark", lblZh: "复杂分镜结构评测基准" },
        { val: "+0 ms", lblEn: "Extra Inference Overhead from OPA", lblZh: "OPA 策略额外推理开销" }
      ],
      links: [
        { label: "OpenReview Forum", url: "https://openreview.net/forum?id=oVLrUiY4wY" }
      ]
    },
    geoedit: {
      venueEn: "IEEE TMM (Under Review · CCF-A) & TeleStudio Production",
      venueZh: "IEEE TMM 在审（CCF-A）& TeleStudio 工业级平台上线",
      titleEn: "GeoEdit++: Residual-Conditioned 3D Rotation & Multi-Task Editing LoRA",
      titleZh: "GeoEdit++：残差条件三维旋转参考与多任务几何编辑系统",
      descEn: "Two-stage geometry-texture decoupled Preset LoRA curriculum on 30B Qwen-Image-Edit: Stage 1 learns explicit 3D rotation geometry on white backgrounds (Rank=128); Stage 2 freezes the base and trains a lightweight residual LoRA (Rank=64) for natural scene boundary and lighting fusion (+50% efficiency), unified via 6-stage Additive Rehearsal across 30°–180°.",
      descZh: "基于 Qwen-Image-Edit 大模型提出二阶段几何与纹理分离训练范式（Preset LoRA）：一阶段（Rank=128）在白底环境显式学习三维旋转几何变换；二阶段（Rank=64）专精复杂自然背景边缘融合与光影协调（训练效率提升 50%），结合 6 阶段增量数据重放（30°–180°），11 个模型在 TeleStudio 平台规模化上线。",
      aiImage: "images/showcase_geoedit_pp.png",
      artifactImage: "images/showcase_geoedit_pp.png",
      captionEn: "AI-generated concept illustration of GeoEdit++.",
      captionZh: "AI 生成的 GeoEdit++ 概念示意图。",
      metrics: [
        { val: "11 LoRAs", lblEn: "30°–180° Models Live on TeleStudio", lblZh: "TeleStudio 规模化上线分角度模型" },
        { val: "+50% Speed", lblEn: "Preset LoRA Two-Stage Training Efficiency", lblZh: "二阶段残差课程学习训练效率提升" },
        { val: "16× H100", lblEn: "3-Cluster Distributed Training & Serving", lblZh: "3 集群 16 卡 H100 分布式编排" }
      ],
      links: [
        { label: "Rotation Comparison PDF", url: "files/dataevolver_rotation_comparison.pdf" }
      ]
    }
  };

  let activeShowcaseKey = "dataevolver";
  let activeVisualMode = "ai"; // "ai" | "artifact"
  let showcaseTimer = null;

  function renderShowcase(key, visualMode, withSkeleton) {
    const item = SHOWCASE_DATA[key];
    if (!item) return;
    clearTimeout(showcaseTimer);
    activeShowcaseKey = key;
    activeVisualMode = item.aiImage === item.artifactImage ? "ai" : (visualMode || activeVisualMode);

    const isZh = document.documentElement.classList.contains("lang-zh-active");
    const frame = document.getElementById("showcase-figure-frame");
    const img = document.getElementById("showcase-main-img");
    const venueEl = document.getElementById("showcase-stage-venue");
    const titleEl = document.getElementById("showcase-stage-title");
    const descEl = document.getElementById("showcase-stage-desc");
    const capEl = document.getElementById("showcase-stage-caption");
    const metricsContainer = document.getElementById("showcase-stage-metrics");
    const linksContainer = document.getElementById("showcase-stage-links");

    document.querySelectorAll(".showcase-tab-card").forEach(function (btn) {
      const active = btn.getAttribute("data-showcase-key") === key;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
      btn.tabIndex = active ? 0 : -1;
    });

    document.querySelectorAll(".stage-mode-btn").forEach(function (btn) {
      const m = btn.getAttribute("data-visual-mode");
      btn.classList.toggle("active", m === activeVisualMode);
      btn.setAttribute("aria-pressed", String(m === activeVisualMode));
      btn.hidden = m === "artifact" && item.aiImage === item.artifactImage;
    });
    const panel = document.getElementById("showcase-panel");
    if (panel) panel.setAttribute("aria-labelledby", "tab-" + key);

    const targetSrc = activeVisualMode === "artifact" ? item.artifactImage : item.aiImage;

    function updateTextAndDOM() {
      if (venueEl) venueEl.textContent = isZh ? item.venueZh : item.venueEn;
      if (titleEl) titleEl.textContent = isZh ? item.titleZh : item.titleEn;
      if (descEl) descEl.textContent = isZh ? item.descZh : item.descEn;
      if (capEl) capEl.textContent = activeVisualMode === "artifact"
        ? (isZh ? item.artifactCaptionZh : item.artifactCaptionEn)
        : (isZh ? item.captionZh : item.captionEn);

      if (metricsContainer) {
        metricsContainer.innerHTML = item.metrics
          .map(function (m) {
            return (
              '<div class="stage-metric-box">' +
              '<div class="stage-metric-val">' + m.val + "</div>" +
              '<div class="stage-metric-lbl">' + (isZh ? m.lblZh : m.lblEn) + "</div>" +
              "</div>"
            );
          })
          .join("");
      }

      if (linksContainer) {
        linksContainer.innerHTML = item.links
          .map(function (l) {
            return (
              '<a class="stage-link-chip" href="' + l.url + '" target="_blank" rel="noopener">' +
              "<span>" + l.label + "</span><span>↗</span></a>"
            );
          })
          .join("");
      }

      if (!reducedMotionQuery.matches) {
        [titleEl, descEl, metricsContainer, linksContainer].forEach(function (element, index) {
          if (!element) return;
          element.getAnimations().forEach(function (animation) { animation.cancel(); });
          element.animate(
            [
              { opacity: 0, transform: "translateY(8px)" },
              { opacity: 1, transform: "translateY(0)" }
            ],
            { duration: 340, delay: index * 35, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
          );
        });
      }
    }

    if (withSkeleton && frame && img && !reducedMotionQuery.matches) {
      frame.classList.add("is-loading");
      updateTextAndDOM();
      showcaseTimer = setTimeout(function () {
        img.src = targetSrc;
        img.alt = isZh ? item.titleZh : item.titleEn;
        if (img.complete) {
          frame.classList.remove("is-loading");
        } else {
          img.onload = function () { frame.classList.remove("is-loading"); };
          img.onerror = function () { frame.classList.remove("is-loading"); };
        }
      }, 240);
    } else {
      if (img) {
        img.src = targetSrc;
        img.alt = isZh ? item.titleZh : item.titleEn;
      }
      updateTextAndDOM();
      if (frame) frame.classList.remove("is-loading");
    }
  }

  function initShowcase() {
    const list = document.querySelector(".split-left-list");
    if (list && "IntersectionObserver" in window && !reducedMotionQuery.matches) {
      const observer = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) {
          list.classList.add("is-visible");
          observer.disconnect();
        }
      }, { threshold: 0.05 });
      observer.observe(list);
    }

    const tabs = Array.from(document.querySelectorAll(".showcase-tab-card"));
    tabs.forEach(function (card, index) {
      card.addEventListener("click", function () {
        const key = card.getAttribute("data-showcase-key");
        if (key) renderShowcase(key, activeVisualMode, true);
      });
      card.addEventListener("keydown", function (event) {
        let next = index;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        tabs[next].focus();
        tabs[next].click();
      });
    });

    document.querySelectorAll(".stage-mode-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const mode = btn.getAttribute("data-visual-mode");
        if (mode) renderShowcase(activeShowcaseKey, mode, true);
      });
    });

    // Re-render showcase labels when language toggles
    document.addEventListener("languagechange", function () {
      renderShowcase(activeShowcaseKey, activeVisualMode, false);
    });

    renderShowcase("dataevolver", "ai", false);
  }

  /* ========================================================================
     6. Uiverse Spotlight Card Tracking & Lightbox Modal
     ======================================================================== */
  function initSpotlightAndLightbox() {
    document.querySelectorAll(".spotlight-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", (e.clientX - rect.left) + "px");
        card.style.setProperty("--mouse-y", (e.clientY - rect.top) + "px");
      });
    });

    const backdrop = document.getElementById("academic-lightbox");
    const lightImg = document.getElementById("academic-lightbox-img");
    if (!backdrop || !lightImg) return;

    document.querySelectorAll("[data-lightbox-src], .stage-figure-frame img, .pub-thumb-box img").forEach(function (image) {
      image.tabIndex = 0;
      image.setAttribute("role", "button");
    });

    document.addEventListener("click", function (e) {
      const zoomTarget = e.target.closest("[data-lightbox-src], .stage-figure-frame img, .pub-thumb-box img");
      if (zoomTarget) {
        const src = zoomTarget.getAttribute("data-lightbox-src") || zoomTarget.getAttribute("src");
        if (src) {
          lightImg.src = src;
          lightImg.alt = zoomTarget.alt || "Research figure";
          zoomTarget.focus();
          backdrop.showModal();
        }
        return;
      }
      if (e.target === backdrop || e.target.closest(".lightbox-close")) {
        backdrop.close();
      }
    });

    document.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-lightbox-src], .stage-figure-frame img, .pub-thumb-box img")) {
        e.preventDefault();
        e.target.click();
      }
    });
  }

  /* ========================================================================
     7. DavidHDev/canvas-ui WebGL2 Shader Engine (ForceField & 3D WaveGrid)
        Adapted from DavidHDev/canvas-ui ForceFieldVanilla.ts & GridVanilla.ts
     ======================================================================== */
  function initCanvasUI() {
    const canvas = document.getElementById("canvas-ui-webgl");
    if (!canvas) return;

    let mode = reducedMotionQuery.matches ? "off" : "forcefield"; // "forcefield" | "wavegrid" | "off"
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: true, depth: false });

    const VERT_SRC = `#version 300 es
    precision highp float;
    layout(location = 0) in vec2 aPos;
    out vec2 vUv;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }`;

    // Combines DavidHDev/canvas-ui hexCell + snoise ForceField & roundedBox WaveGrid in one switchable shader
    const FRAG_SRC = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 outColor;

    uniform vec2 uResolution;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uHit[6]; // xy = pos in px, z = hit timestamp
    uniform int uMode;    // 1 = ForceField Hex Lattice, 2 = 3D WaveGrid Tiles
    uniform float uDark;  // 0.0 = Stone Light, 1.0 = Obsidian Dark

    // DavidHDev/canvas-ui hexCell SDF
    vec4 hexCell(vec2 p) {
      const vec2 s = vec2(1.0, 1.7320508);
      vec4 hC = floor(vec4(p, p - vec2(0.5, 1.0)) / s.xyxy) + 0.5;
      vec4 h = vec4(p - hC.xy * s, p - (hC.zw + 0.5) * s);
      bool first = dot(h.xy, h.xy) < dot(h.zw, h.zw);
      vec2 local = first ? h.xy : h.zw;
      vec2 id = first ? hC.xy : hC.zw + 0.5;
      vec2 cell = abs(local);
      float d = max(dot(cell, s * 0.5), cell.x);
      return vec4(d, 0.5 - d, id);
    }

    // DavidHDev/canvas-ui roundedBox SDF
    float roundedBox(vec2 p, vec2 b, float r) {
      vec2 q = abs(p) - b + r;
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }

    float hash21(vec2 p) {
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }

    void main() {
      vec2 pos = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
      float minDim = min(uResolution.x, uResolution.y);

      // Compute ripple wave energy from cursor hits + ambient wave
      float rippleEnergy = 0.0;
      for (int i = 0; i < 6; i++) {
        float age = uTime - uHit[i].z;
        if (age > 0.0 && age < 2.4) {
          float dist = length(pos - uHit[i].xy) / max(minDim, 1.0);
          float front = age * 0.48;
          float ring = exp(-pow((dist - front) / 0.045, 2.0)) * exp(-age * 1.35);
          rippleEnergy += ring * (0.65 + 0.35 * cos(dist * 38.0 - age * 14.0));
        }
      }

      float mouseDist = length(pos - uMouse);
      float hoverField = exp(-pow(mouseDist / 260.0, 2.0));

      vec3 accentA = mix(vec3(0.76, 0.25, 0.05), vec3(0.98, 0.57, 0.24), uDark); // Terracotta
      vec3 accentB = mix(vec3(0.06, 0.46, 0.43), vec3(0.18, 0.83, 0.75), uDark); // Teal

      if (uMode == 1) {
        // Mode 1: DavidHDev/canvas-ui Hexagonal ForceField
        float scale = 46.0;
        vec4 hc = hexCell(pos / scale);
        float edgeDist = hc.y;
        float cellRand = hash21(hc.zw);
        float pulse = 0.5 + 0.5 * sin(uTime * 1.4 + cellRand * 6.2831);

        float line = smoothstep(0.055, 0.012, edgeDist);
        float activeGlow = clamp(hoverField * 1.15 + rippleEnergy * 1.6, 0.0, 1.4);
        float baseGrid = 0.115 + 0.055 * pulse;

        vec3 col = mix(accentA, accentB, 0.45 + 0.45 * sin(cellRand * 4.0 + uTime * 0.5));
        float alpha = (line * (baseGrid + activeGlow * 0.65) + activeGlow * 0.15 * (1.0 - edgeDist));
        alpha *= smoothstep(0.0, 0.15, vUv.y);
        outColor = vec4(col * alpha, alpha);
      } else {
        // Mode 2: DavidHDev/canvas-ui 3D Perspective WaveGrid Tiles
        float tilePx = 72.0;
        vec2 idx = floor(pos / tilePx);
        vec2 center = (idx + 0.5) * tilePx;
        float wave = sin(idx.x * 0.45 + uTime * 1.6) * cos(idx.y * 0.45 + uTime * 1.2) * 0.35;
        float lift = clamp(wave * 0.25 + hoverField * 0.75 + rippleEnergy * 1.2, -1.0, 1.0);

        vec2 local = pos - center - vec2(0.0, -lift * 9.0);
        float sd = roundedBox(local, vec2(tilePx * 0.44), 10.0);
        float border = smoothstep(2.0, 0.0, abs(sd));
        float fill = smoothstep(1.0, -1.0, sd) * clamp(abs(lift) * 0.22, 0.015, 0.20);

        vec3 col = mix(accentB, accentA, clamp(lift * 0.7 + 0.3, 0.0, 1.0));
        float alpha = border * (0.08 + clamp(abs(lift), 0.0, 1.0) * 0.35) + fill;
        outColor = vec4(col * alpha, alpha);
      }
    }`;

    function compileShader(type, src) {
      if (!gl) return null;
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    }

    let prog = null;
    let vao = null;
    const locs = {};

    if (gl) {
      const vs = compileShader(gl.VERTEX_SHADER, VERT_SRC);
      const fs = compileShader(gl.FRAGMENT_SHADER, FRAG_SRC);
      if (vs && fs) {
        prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          vao = gl.createVertexArray();
          gl.bindVertexArray(vao);
          const buf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
          gl.enableVertexAttribArray(0);
          gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

          locs.uResolution = gl.getUniformLocation(prog, "uResolution");
          locs.uTime = gl.getUniformLocation(prog, "uTime");
          locs.uMouse = gl.getUniformLocation(prog, "uMouse");
          locs.uHit = gl.getUniformLocation(prog, "uHit");
          locs.uMode = gl.getUniformLocation(prog, "uMode");
          locs.uDark = gl.getUniformLocation(prog, "uDark");
        } else {
          prog = null;
        }
      }
    }

    const mouse = { x: -9999, y: -9999 };
    const hits = new Float32Array(18); // 6 * vec3(x, y, t)
    let hitCursor = 0;
    const startTime = performance.now();
    let rafId = 0;

    function spawnHit(x, y) {
      const t = (performance.now() - startTime) * 0.001;
      const base = (hitCursor % 6) * 3;
      hits[base] = x;
      hits[base + 1] = y;
      hits[base + 2] = t;
      hitCursor++;
    }

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener("resize", resize);
    resize();

    // Seed initial gentle ambient wave in the center-right
    setTimeout(function () {
      spawnHit(canvas.width * 0.65, canvas.height * 0.35);
    }, 300);

    const hero = canvas.closest(".hero-section") || document.body;
    hero.addEventListener("pointermove", function (e) {
      const rect = canvas.getBoundingClientRect();
      const dpr = canvas.width / Math.max(rect.width, 1);
      mouse.x = (e.clientX - rect.left) * dpr;
      mouse.y = (e.clientY - rect.top) * dpr;
    });

    hero.addEventListener("pointerdown", function (e) {
      const rect = canvas.getBoundingClientRect();
      const dpr = canvas.width / Math.max(rect.width, 1);
      spawnHit((e.clientX - rect.left) * dpr, (e.clientY - rect.top) * dpr);
    });

    function renderLoop() {
      if (mode === "off" || !prog || !gl) {
        if (gl) {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        rafId = 0;
        return;
      }

      const t = (performance.now() - startTime) * 0.001;
      const isDark = document.documentElement.getAttribute("data-theme") === "dark" ? 1.0 : 0.0;

      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      gl.uniform2f(locs.uResolution, canvas.width, canvas.height);
      gl.uniform1f(locs.uTime, t);
      gl.uniform2f(locs.uMouse, mouse.x, mouse.y);
      gl.uniform3fv(locs.uHit, hits);
      gl.uniform1i(locs.uMode, mode === "forcefield" ? 1 : 2);
      gl.uniform1f(locs.uDark, isDark);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(renderLoop);
    }

    function setCanvasMode(nextMode) {
      mode = nextMode;
      document.querySelectorAll("[data-canvas-mode]").forEach(function (btn) {
        const active = btn.getAttribute("data-canvas-mode") === mode;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
      if (mode === "off") {
        canvas.style.opacity = "0";
      } else {
        canvas.style.opacity = "0.88";
        if (!rafId) rafId = requestAnimationFrame(renderLoop);
      }
    }

    document.querySelectorAll("[data-canvas-mode]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setCanvasMode(btn.getAttribute("data-canvas-mode") || "forcefield");
      });
    });

    if (mode !== "off") {
      rafId = requestAnimationFrame(renderLoop);
    }
  }

  function initShowcaseCanvas() {
    const canvas = document.getElementById("showcase-canvas");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const panel = canvas.parentElement;
    let width = 0;
    let height = 0;
    let frameId = 0;
    let pointerX = 0.65;
    let pointerY = 0.5;

    function resize() {
      const bounds = panel.getBoundingClientRect();
      const density = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      const dark = document.documentElement.dataset.theme === "dark";
      const centerX = width * (reducedMotionQuery.matches ? 0.65 : pointerX);
      const centerY = height * (reducedMotionQuery.matches ? 0.5 : pointerY);
      const columns = Math.max(6, Math.floor(width / 58));
      const rows = Math.max(2, Math.min(4, Math.floor((height - 56) / 46)));
      const count = columns * rows;
      const topicOffset = Math.max(0, ["dataevolver", "trajmcpo", "panel2page", "geoedit"].indexOf(activeShowcaseKey)) * 2.5;
      const time = reducedMotionQuery.matches ? 0 : performance.now() * 0.0007;

      context.lineWidth = 0.8;
      const xStep = Math.min(64, (width - 48) / Math.max(columns - 1, 1));
      const yStep = rows > 1 ? Math.min(58, (height - 82) / (rows - 1)) : 0;
      const gridWidth = xStep * (columns - 0.5);
      const startX = Math.max(24, (width - gridWidth) / 2);
      const startY = 56 + Math.max(12, (height - 56 - yStep * (rows - 1)) / 2);
      const nodes = [];

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const index = row * columns + column;
          const x = startX + column * xStep + (row % 2 ? xStep / 2 : 0);
          const baseY = startY + row * yStep;
          const proximity = Math.exp(-(Math.pow(x - centerX, 2) + Math.pow(baseY - centerY, 2)) / Math.pow(Math.max(width * 0.28, 1), 2));
          const pulsePosition = (time * 5.5 + topicOffset) % count;
          const pulse = Math.exp(-Math.pow((index - pulsePosition) / 1.2, 2));
          const energy = proximity * 0.65 + pulse * 0.35;
          const lift = Math.sin(index * 0.65 + time * 2.4) * 4 + proximity * (centerY - baseY) * 0.06;
          const size = 8 + energy * 5 + Math.sin(index * 0.65 + time * 2.4) * 0.8;
          nodes.push({ x, y: baseY + lift, size, energy, row, column });
        }
      }

      nodes.forEach(function (node, index) {
        context.strokeStyle = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(24, 24, 27, 0.10)";
        if (node.column < columns - 1) {
          const next = nodes[index + 1];
          context.beginPath();
          context.moveTo(node.x + node.size, node.y);
          context.lineTo(next.x - next.size, next.y);
          context.stroke();
        }
        if (node.row < rows - 1) {
          const next = nodes[index + columns];
          context.beginPath();
          context.moveTo(node.x, node.y + node.size);
          context.lineTo(next.x, next.y - next.size);
          context.stroke();
        }
      });

      nodes.forEach(function (node) {
        const energy = node.energy;
        context.beginPath();
        for (let corner = 0; corner < 6; corner++) {
          const angle = Math.PI / 3 * corner - Math.PI / 6;
          const pointX = node.x + Math.cos(angle) * node.size;
          const pointY = node.y + Math.sin(angle) * node.size;
          if (corner === 0) context.moveTo(pointX, pointY);
          else context.lineTo(pointX, pointY);
        }
        context.closePath();
        context.fillStyle = dark ? "rgba(251, 146, 60, " + (0.04 + energy * 0.22) + ")" : "rgba(194, 65, 12, " + (0.04 + energy * 0.22) + ")";
        context.strokeStyle = dark ? "rgba(45, 212, 191, " + (0.18 + energy * 0.56) + ")" : "rgba(15, 118, 110, " + (0.18 + energy * 0.56) + ")";
        context.fill();
        context.stroke();

        context.beginPath();
        context.arc(node.x, node.y, 1 + energy * 1.6, 0, Math.PI * 2);
        context.fillStyle = dark ? "rgba(251, 146, 60, " + (0.18 + energy * 0.65) + ")" : "rgba(194, 65, 12, " + (0.18 + energy * 0.65) + ")";
        context.fill();
      });

      if (!reducedMotionQuery.matches && !document.hidden) frameId = requestAnimationFrame(draw);
      else frameId = 0;
    }

    panel.addEventListener("pointermove", function (event) {
      const bounds = panel.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width;
      pointerY = (event.clientY - bounds.top) / bounds.height;
    });
    panel.addEventListener("pointerleave", function () {
      pointerX = 0.65;
      pointerY = 0.5;
    });
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(function () {
        resize();
        if (reducedMotionQuery.matches) draw();
      });
      observer.observe(panel);
    } else {
      window.addEventListener("resize", function () {
        resize();
        if (reducedMotionQuery.matches) draw();
      });
    }
    document.addEventListener("click", function (event) {
      if (reducedMotionQuery.matches && event.target.closest("[data-action='toggle-theme']")) draw();
    });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && !reducedMotionQuery.matches && !frameId) frameId = requestAnimationFrame(draw);
    });
    reducedMotionQuery.addEventListener("change", function () {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      draw();
    });
    resize();
    draw();
  }

  /* ========================================================================
     9. Bootstrapping All Modules on DOMContentLoaded
     ======================================================================== */
  document.addEventListener("DOMContentLoaded", function () {
    document.documentElement.classList.remove("no-js");
    initTheme();
    initTypewriter();
    initSpringLogos();
    initStaggerObserver();
    initShowcase();
    initSpotlightAndLightbox();
    initCanvasUI();
    initShowcaseCanvas();

    // Publication Filter Buttons
    document.querySelectorAll("[data-pub-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const tag = btn.getAttribute("data-pub-filter") || "all";
        applyTagFilter(tag);
      });
    });

    // Replay Skeleton & Stagger Demo Button
    document.querySelectorAll("[data-action='replay-motion']").forEach(function (btn) {
      btn.addEventListener("click", function () {
        replayStaggerAndSkeleton();
      });
    });
  });
})();
