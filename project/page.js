// Add base styles
const style = document.createElement("style");
style.textContent = `
  .menu-element {
    display: none;
    z-index: 1;
  }
  
  .intro-complete .menu-element {
    display: block;
  }
  
  #intro {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.0);
    pointer-events: none
  }
  
  #intro.clicked {
    display: none;
  }
  
  .terminal-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 70%; /* Reduce height to 70% */
    color: #00ff00;
    padding-bottom: 30vh; /* Add significant bottom padding */
    font-family: monospace;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start; /* Align content to top */
    white-space: pre;
    pointer-events: none;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;
document.head.appendChild(style);

// Element References
const buttons = {
  openMenuBtn: document.getElementById("openMenuBtn"),
  worldInfoButton: document.getElementById("worldInfoButton"),
  controlsButton: document.getElementById("controlsButton"),
  settingsButton: document.getElementById("settingsButton"),
  newWorldButton: document.getElementById("newWorldButton"),
};

const closeButtons = {
  worldInfoCloseMenuButton: document.getElementById("worldInfocloseMenuBtn"),
  controlsCloseMenuButton: document.getElementById("controlscloseMenuBtn"),
  settingsCloseMenuButton: document.getElementById("settingscloseMenuBtn"),
  bottomDrawerCloseMenuButton: document.getElementById("closeMenuBtn"),
};

// Terminal Implementation
function initializeTerminal() {
  const introDom = document.getElementById("intro");
  if (!introDom) return;

  const terminal = document.createElement("div");
  terminal.className = "terminal-content";
  introDom.appendChild(terminal);

  const codeSnippets = [
    `[SYSTEM] Initializing outdoor simulation environment...`,

    `[SYSTEM] Loading rendering engine...
// constructor(target) {
    this.target_ = target || document;
    this.isHoveringD = false; // Track if the mouse is over a 'D' element
    this.freezeFrame = false; // Condition to freeze frame movement
    this.initialize_();
  }

  initialize_() {
    this.current_ = {
      leftButton: false,
      rightButton: false,
      mouseXDelta: 0,
      mouseYDelta: 0,
      mouseX: 0,
      mouseY: 0,
    };
    this.previous_ = null;
    this.keys_ = {};
    this.previousKeys_ = {};

    this.target_.addEventListener(
      "mousedown",
      (e) => this.onMouseDown_(e),
      false
    );
    this.target_.addEventListener(
      "mousemove",
      (e) => this.onMouseMove_(e),
      false
    );
    this.target_.addEventListener("mouseup", (e) => this.onMouseUp_(e), false);
    this.target_.addEventListener("keydown", (e) => this.onKeyDown_(e), false);
    this.target_.addEventListener("keyup", (e) => this.onKeyUp_(e), false);

    // Add listeners for hover detection
    this.target_.addEventListener(
      "mouseover",
      (e) => this.onMouseOver_(e),
      false
    );
    this.target_.addEventListener(
      "mouseout",
      (e) => this.onMouseOut_(e),
      false
    );
  }`,
    `

  // Detect if the mouse is over an element with class 'D'
  onMouseOver_(e) {
    if (e.target && e.target.classList.contains("D")) {
      this.isHoveringD = true;
      this.freezeFrame = true; // Freeze the frame when hovering over 'D'
    }
  }

  // Reset hover state and unfreeze frame when the mouse leaves the 'D' element
  onMouseOut_(e) {
    if (e.target && e.target.classList.contains("D")) {
      this.isHoveringD = false;
      this.freezeFrame = false; // Unfreeze the frame when leaving 'D'
    }
  }

  onMouseMove_(e) {
    // Only update mouse movement if not hovering over a 'D' element
    if (this.isHoveringD) return;

    this.current_.mouseX = e.pageX - window.innerWidth / 2;
    this.current_.mouseY = e.pageY - window.innerHeight / 2;

    if (this.previous_ === null) {
      this.previous_ = { ...this.current_ };
    }

    this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
    this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;
  }

  onMouseDown_(e) {
    this.onMouseMove_(e);

    switch (e.button) {
      case 0: {
        this.current_.leftButton = true;
        break;
      }
      case 2: {
        this.current_.rightButton = true;
        break;
      }
    }
  }

  onMouseUp_(e) {
    this.onMouseMove_(e);

    switch (e.button) {
      case 0: {
        this.current_.leftButton = false;
        break;
      }
      case 2: {
        this.current_.rightButton = false;
        break;
      }
    }
  }

  onKeyDown_(e) {
    this.keys_[e.keyCode] = true;
  }

  onKeyUp_(e) {
    this.keys_[e.keyCode] = false;
  }

  key(keyCode) {
    return !!this.keys_[keyCode];
  }

  isReady() {
    return this.previous_ !== null;
  }

  update(_) {
    if (this.previous_ !== null) {
      if (!this.isHoveringD) {
        // Only update if not hovering over 'D'
        this.current_.mouseXDelta =
          this.current_.mouseX - this.previous_.mouseX;
        this.current_.mouseYDelta =
          this.current_.mouseY - this.previous_.mouseY;

        this.previous_ = { ...this.current_ };
      }

      // freeze any frame or object that follows the mouse
      if (this.freezeFrame) {
        // Freeze any positional changes tied to mouse
        // You can store the last known mouse position and use that to prevent movement
        this.current_.mouseXDelta = 0;
        this.current_.mouseYDelta = 0;
      }
    }
  }
}`,

    `[SYSTEM] Configuring camera...
    updateHeadBob_(timeElapsedS) {
        if (this.headBobActive_) {
          const wavelength = Math.PI;
          const nextStep =
            1 + Math.floor(((this.headBobTimer_ + 0.000001) * 10) / wavelength);
          const nextStepTime = (nextStep * wavelength) / 10;
          this.headBobTimer_ = Math.min(
            this.headBobTimer_ + timeElapsedS,
            nextStepTime
          );
    
          if (this.headBobTimer_ == nextStepTime) {
            this.headBobActive_ = false;
          }
        }
      }`,
    `
      playFootstepAudio(timeElapsedS) {
        const currentTime = Date.now();
    
        // Play footstep sound (750 ms)
        if (this.isMoving && currentTime - this.lastStepTime >= 750) {
          const randomIndex = Math.floor(
            Math.random() * this.footstepAudioFiles.length
          );
          const footstepAudio = new Audio(this.footstepAudioFiles[randomIndex]); // Select a random audio
          footstepAudio.currentTime = 0; // Reset audio to start
          footstepAudio.play();
          this.lastStepTime = currentTime;
        }
      }
      updateTranslation_(timeElapsedS) {
        // Calculate forward and strafe velocities based on input keys (W, A, S, D)
        const forwardVelocity =
          (this.input_.key(KEYS.w) ? 1 : 0) + (this.input_.key(KEYS.s) ? -1 : 0);
        const strafeVelocity =
          (this.input_.key(KEYS.a) ? 1 : 0) + (this.input_.key(KEYS.d) ? -1 : 0);
    
        // Update the movement state (whether the player is moving or not)
        if (forwardVelocity !== 0 || strafeVelocity !== 0) {
          this.isMoving = true;
          this.playFootstepAudio(timeElapsedS); // Play audio when moving
        } else {
          this.isMoving = false;
        }
    
        // Create a quaternion to rotate the movement vector based on the camera's orientation
        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
    
        // Create the movement vectors (forward and left)
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(qx);
        forward.multiplyScalar(
          forwardVelocity * timeElapsedS * this.movementSpeed_
        ); // Use movementSpeed_
    
        const left = new THREE.Vector3(-1, 0, 0);
        left.applyQuaternion(qx);
        left.multiplyScalar(strafeVelocity * timeElapsedS * this.movementSpeed_); // Use movementSpeed_
    
        // Add the movement vectors to the camera's translation
        this.translation_.add(forward);
        this.translation_.add(left);
    
        // After moving, adjust the camera's Y position based on the ground below
        this.adjustCameraYPosition();
    
        // Activate head bobbing if the player is moving
        if (forwardVelocity != 0 || strafeVelocity != 0) {
          this.headBobActive_ = true;
        }
      }
    
      handleKeyUp_(e) {
        if (
          e.keyCode === KEYS.w ||
          e.keyCode === KEYS.s ||
          e.keyCode === KEYS.a ||
          e.keyCode === KEYS.d
        ) {
          this.playFootstepAudio(); // Play final footstep sound on key release
        }
      }`,

    `[SYSTEM] Loading random environment...
    initializeRenderer_() {
        this.threejs_ = new THREE.WebGLRenderer({
          antialias: false,
        });
        this.threejs_.shadowMap.enabled = true;
        this.threejs_.shadowMap.type = THREE.PCFSoftShadowMap;
        this.threejs_.setPixelRatio(window.devicePixelRatio);
        this.threejs_.setSize(window.innerWidth, window.innerHeight);
        this.threejs_.physicallyCorrectLights = true;
        this.threejs_.outputEncoding = THREE.sRGBEncoding;
    
        document.body.appendChild(this.threejs_.domElement);
    
        window.addEventListener(
          "resize",
          () => {
            this.onWindowResize_();
          },
          false
        );
    `,

    `[SYSTEM] Initializing physics engine...
this.raycaster = new THREE.Raycaster();
this.raycaster.ray.direction.set(0, -1, 0);
this.objects_ = [];`,

    `[SYSTEM] Setting up environmental audio...
    initializeScene_() {
        this.scene_.background = new THREE.Color(0xffffff); // Set background to white
    
        const glbModels = [
          {
            path: "model/forestSnow.glb",
            position: new THREE.Vector3(0, -4, 0),
            scale: new THREE.Vector3(1, 1, 1),
            audio: "audio/forest.mp3",
            credit: "Rock terrain with melting snow - Lassi Kaukonen",
            AudioCredit: "winter-windy-forest.mp3 - Jonas_Jocys",
          },
          {
            path: "model/i_ergidali_i_hovi.glb",
            position: new THREE.Vector3(0, -4, 0),
            scale: new THREE.Vector3(2, 2, 2),
            audio: "audio/river-in-the-forest.mp3",
            credit: "Í Ergidali í Hovi - Helgi D. Michelsen",
            AudioCredit: "river-in-the-forest.mp3 - artembirdman",
          },
          {
            path: "model/eglise_saint-alain_le_vieux_lavaur_81.glb",
            position: new THREE.Vector3(1, -4, 1),
            scale: new THREE.Vector3(1, 1, 1),
            audio: "audio/ambience_farm.mp3",
            credit: "Eglise Saint-Alain le vieux - Archéomatique",
            AudioCredit: "ambience_farm_04.mp3 - BenDrain",
          },
    
          {
            path: "model/alvao1.glb",
            position: new THREE.Vector3(1, -10, 1),
            scale: new THREE.Vector3(1, 1, 1),
            audio: "audio/ambience_farm.mp3",
            credit: "Verifica Intersezione Fognatura Alveo - Giorgio Scioldo ",
            AudioCredit: "ambience_farm_04.mp3 - BenDrain",
          },
    
          {
            path: "model/suburb.glb",
            position: new THREE.Vector3(0, -20, 0),
            scale: new THREE.Vector3(1, 1, 1),
            audio:
              "audio/ambience-a-peaceful-afternoon-disrupted-by-noisy-aircraft-250100.mp3",
            credit: "Global manor July 23rd 2024 - mrwrightphoto",
            AudioCredit:
              "ambience-a-peaceful-afternoon-disrupted-by-noisy-aircraft-250100.mp3 - Fronbondi_Skegs",
          },
          {
            path: "model/2178_gordon_crossing_gallatin_tn.glb",
            position: new THREE.Vector3(1, -4, 1),
            scale: new THREE.Vector3(2, 2, 2),
            audio:
              "audio/greenfield-birds-suburban-sounds-in-the-background-16683.mp3",
            credit: "2178 Gordon Crossing Gallatin TN - mrwrightphoto",
            AudioCredit:
              "greenfield-birds-suburban-sounds-in-the-background-16683.mp3 - originalmaja",
          },
    
          {
            path: "model/port2.glb",
            position: new THREE.Vector3(1, -4, 1),
            scale: new THREE.Vector3(2, 2, 2),
            audio: "audio/a-quiet-seaside-seagulls-distant-17681.mp3",
            credit: "Port de Penn-Lann - dronemapping",
            AudioCredit: "a-quiet-seaside-seagulls-distant-17681.mp3",
          },
          {
            path: "model/calatrava_la_vieja_ciudad_real_spain.glb",
            position: new THREE.Vector3(1, -90, 1),
            scale: new THREE.Vector3(2.5, 2.5, 2.5),
            audio:
              "audio/sonido-ambiente-desierto-ambience-sound-desert-217122.mp3",
            credit:
              "Calatrava La Vieja (Ciudad Real, Spain) - Global Digital Heritage and GDH-Afrika ",
            AudioCredit:
              "sonido-ambiente-desierto-ambience-sound-desert-217122.mp3 - EstudioCoati",
          },
          {
            path: "model/track.glb",
            position: new THREE.Vector3(1, -10, 1),
            scale: new THREE.Vector3(1, 1, 1),
            audio:
              "audio/forest-ambiance-light-wind-birds-screeching-trees-158554.mp3",
            credit: "NCHS Track Simplified 3d Mesh - George",
            AudioCredit:
              "forest-ambiance-light-wind-birds-screeching-trees-158554.mp3",
          },
    
          {
            path: "model/stripmall.glb",
            position: new THREE.Vector3(40, -1, -200),
            scale: new THREE.Vector3(0.8, 0.8, 0.8),
            audio: "audio/athens-cicadas-19521.mp3",
            credit: "Foodland Shopping Center - johnnokomis",
            AudioCredit: "athens-cicadas.mp3 - jenkmasler",
          },
          {
            path: "model/soisson.glb",
            position: new THREE.Vector3(-20, -10, 1),
            scale: new THREE.Vector3(2, 2, 2),
            audio: "audio/summer-outdoors-nature-ambience-228110.mp3",
            credit:
              "Abbaye de Saint-Jean-des-Vignes - SOISSONS (02) - cabinet_houdry",
            AudioCredit: "summer-outdoors-nature-ambience-228110.mp3 - Alex_Jauk",
          },
          {
            path: "model/mine.glb",
            position: new THREE.Vector3(1, -1, 1),
            scale: new THREE.Vector3(1, 1, 1),
            audio:
              "audio/sonido-ambiente-desierto-ambience-sound-desert-217122.mp3",
            credit: "Magpie Mine - CT Aerial Surveys ",
            AudioCredit:
              "sonido-ambiente-desierto-ambience-sound-desert-217122.mp3 - EstudioCoati",
          },
          {
            path: "model/huntsville_fc.glb",
            position: new THREE.Vector3(1, -1, 1),
            scale: new THREE.Vector3(1, 1, 1),
            audio: "audio/quiet-city-square-night-19743.mp3",
            credit: "Huntsville FC Field at Joe Davis Stadium - johnnokomis",
            AudioCredit: "quiet-city-square-night.mp3 - ecfike",
          },
          {
            path: "model/ayuttha.glb",
            position: new THREE.Vector3(-150, -1, -60),
            scale: new THREE.Vector3(1, 1, 1),
            audio: "audio/cicadas-18654.mp3",
            credit: "Wat_Phra_Si_Sanphet.glb - Agisoft",
            AudioCredit: "cicadas.mp3 - nervousneal",
          },
    
          {
            path: "model/hightway.glb",
            position: new THREE.Vector3(1, -50, 1),
            scale: new THREE.Vector3(1, 1, 1),
            audio:
              "audio/sonido-ambiente-desierto-ambience-sound-desert-217122.mp3",
            credit: "Levantamento - LOHMM - Porto Real  - vivadrone",
            AudioCredit:
              "sonido-ambiente-desierto-ambience-sound-desert.mp3 - EstudioCoati",
          },
          {
            path: "model/construction.glb",
            position: new THREE.Vector3(-70, -10, -70),
            scale: new THREE.Vector3(2, 2, 2),
            audio: "audio/ambience-city-daytime-birds-traffic-61955.mp3",
            credit: "Construction Site .::RAWscan::. - Andrea Spognetta (Spogna) ",
            AudioCredit: "ambience-city-daytime-birds-traffic.mp3 - lwdickens",
          },
          {
            path: "model/leipzig.glb",
            position: new THREE.Vector3(-10, -10, 1),
            scale: new THREE.Vector3(2, 2, 2),
            audio: "audio/city-slums-ambience-at-night-55182.mp3",
            credit: "Leipzig industrial area - 333DDD",
            AudioCredit: "city-slums-ambience-at-night.mp3 - CaganCelik",
          },
    
          {
            path: "model/culdesac.glb",
            position: new THREE.Vector3(-21, -10, 1),
            scale: new THREE.Vector3(1, 1, 1),
            audio: "audio/summer-outdoors-nature-ambience-228110.mp3",
            credit: "Terreno en Cadereyta - ZUNUUM ",
            AudioCredit: "summer-outdoors-nature-ambience-228110.mp3 - Alex_Jauk",
          },
          {
            path: "model/zamek_j_zytkiewicz_low_poly.glb",
            position: new THREE.Vector3(-21, -20, 1),
            scale: new THREE.Vector3(10, 10, 10),
            audio: "audio/ambience-wind-blowing-through-trees-01-186986.mp3",
            credit: "Zamek J Zytkiewicz Low Poly - Robert Szymaniuk ",
            AudioCredit:
              "ambience-wind-blowing-through-trees-01-186986.mp3 - Traian1984",
          },
          {
            path: "model/d65136ffb80041cdbe3ad4f632482d7d.glb",
            position: new THREE.Vector3(-21, -10, 1),
            scale: new THREE.Vector3(1, 1, 1),
            audio:
              "audio/sonido-ambiente-desierto-ambience-sound-desert-217122.mp3",
            credit: "矢作川 - m-kato1007",
            AudioCredit:
              "sonido-ambiente-desierto-ambience-sound-desert-217122.mp3 - EstudioCoati",
          },
          {
            path: "model/cistercian_abbey_of_belapatfalva_hungary.glb",
            position: new THREE.Vector3(-21, -20, 20),
            scale: new THREE.Vector3(2, 2, 2),
            audio: "audio/late-summer-forest-september-28th-2019-17768.mp3",
            credit: "Cistercian Abbey of Bélapátfalva, Hungary - droneheli.hu",
            AudioCredit: "late-summer-forest-september-28th-2019.mp3 - kvgarlic",
          },
    
          // future model configurations
        ];
    
        let lastModelIndex = localStorage.getItem("lastModelIndex")
          ? parseInt(localStorage.getItem("lastModelIndex"))
          : null;
        let secondLastModelIndex = localStorage.getItem("secondLastModelIndex")
          ? parseInt(localStorage.getItem("secondLastModelIndex"))
          : null;
    
        function getRandomModelIndex() {
          let availableIndexes = [];
    
          // Collect all indices except for the last two
          for (let i = 0; i < glbModels.length; i++) {
            if (i !== lastModelIndex && i !== secondLastModelIndex) {
              availableIndexes.push(i);
            }
          }`,
    `initializePostFX_() {}

          onWindowResize_() {
            this.camera_.aspect = window.innerWidth / window.innerHeight;
            this.camera_.updateProjectionMatrix();
        
            this.uiCamera_.left = -this.camera_.aspect;
            this.uiCamera_.right = this.camera_.aspect;
            this.uiCamera_.updateProjectionMatrix();
        
            this.threejs_.setSize(window.innerWidth, window.innerHeight);
          }
        
          raf_() {
            requestAnimationFrame((t) => {
              if (this.previousRAF_ === null) {
                this.previousRAF_ = t;
              }
        
              this.step_(t - this.previousRAF_);
              this.threejs_.autoClear = true;
              this.threejs_.render(this.scene_, this.camera_);
              this.threejs_.autoClear = false;
              this.threejs_.render(this.uiScene_, this.uiCamera_);
              this.previousRAF_ = t;
              this.raf_();
            });
          }`,

    `[SYSTEM] All systems initialized.
[SYSTEM] Ready for simulation.

Controls:

***************************
W,A,S,D Keys - Movement
Mouse - Look around
***************************

Click to Start Audio

go outside? [Y/N]: `,
  ];

  let currentSnippet = 0;
  let displayedText = "";
  let inputEnabled = false;

  function endintro() {
    document.body.classList.add("intro-complete");
    introDom.className = "clicked";
    document.removeEventListener("keypress", handleInput);
  }

  function handleInput(e) {
    if (!inputEnabled) return;

    if (e.key.toLowerCase() === "y") {
      inputEnabled = false;
      setTimeout(() => {
        terminal.style.opacity = "0";
        terminal.style.transition = "opacity 0.5s";
        setTimeout(endintro, 500);
      }, 100);
    } else if (e.key.toLowerCase() === "n") {
      displayedText += "\nSimulation declined. Press Y to proceed...\n";
      terminal.textContent = displayedText;
    }
  }

  function addNextSnippet() {
    if (currentSnippet >= codeSnippets.length) {
      const cursor = document.createElement("span");
      cursor.style.cssText = `
        display: inline-block;
        width: 8px;
        height: 16px;
        background: #00ff00;
        animation: blink 1s infinite;
        margin-left: 4px;
      `;
      cursor.textContent = "_";
      terminal.appendChild(cursor);
      inputEnabled = true;
      return;
    }

    displayedText += codeSnippets[currentSnippet] + "\n\n";
    terminal.textContent = displayedText;
    currentSnippet++;
    terminal.scrollTop = terminal.scrollHeight;

    // Create variable delays based on the content
    let delay;
    const currentText = codeSnippets[currentSnippet - 1];

    if (currentText.startsWith("[SYSTEM]")) {
      // Longer delay after system messages (500ms to 1000ms)
      delay = Math.random() * 100 + 500;
    } else if (currentText.includes("...")) {
      // Medium delay after loading messages (300ms to 800ms)
      delay = Math.random() * 100 + 300;
    } else {
      // Shorter delay for code snippets (50ms to 200ms)
      delay = Math.random() * 150 + 50;
    }

    setTimeout(addNextSnippet, delay);
  }

  document.addEventListener("keypress", handleInput);
  addNextSnippet();
}

// Initialize terminal
initializeTerminal();

// Menu System Integration
function initializeMenuSystem() {
  // First, check if elements exist
  const menuSystem = document.getElementById("menuSystem");
  const mainMenu = document.getElementById("mainMenu");
  const openMenuBtn = document.getElementById("openMenuBtn");

  if (!menuSystem || !mainMenu || !openMenuBtn) {
    console.warn("Menu elements not found, skipping menu initialization");
    return;
  }

  const submenus = document.querySelectorAll(".submenu");
  let activeSubmenu = null;

  // Open main menu
  let isHandlingClick = false;

  // At the top of your initializeMenuSystem function
  let menuState = false; // Track menu state
  let isProcessingClick = false; // Prevent multiple rapid clicks

  function toggleMenu() {
    if (isProcessingClick) return; // Prevent multiple toggles
    isProcessingClick = true;

    menuState = !menuState; // Toggle state
    console.log("Toggling menu to:", menuState);

    mainMenu.style.display = menuState ? "block" : "none";

    if (!menuState) {
      closeAllSubmenus();
    }

    // Reset processing flag after a delay
    setTimeout(() => {
      isProcessingClick = false;
    }, 200);
  }

  // Remove all existing click handlers from the button
  openMenuBtn.replaceWith(openMenuBtn.cloneNode(true));

  // Get fresh reference to the new button
  const newOpenMenuBtn = document.getElementById("openMenuBtn");

  // Add single click handler
  newOpenMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleMenu();
  });

  // Remove any other click handlers that might be on the button
  openMenuBtn.removeEventListener("mousedown", () => {});

  // Handle submenu buttons
  document.querySelectorAll("[data-submenu]").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent event bubbling
      const submenuId = this.dataset.submenu + "Menu";
      const submenu = document.getElementById(submenuId);

      if (!submenu) return;

      if (activeSubmenu) {
        activeSubmenu.style.display = "none";
      }

      if (activeSubmenu !== submenu) {
        submenu.style.display = "block";
        activeSubmenu = submenu;
      } else {
        activeSubmenu = null;
      }
    });
  });

  // Volume slider specific handling
  const volumeSlider = document.getElementById("musicVolumeSlider");
  if (volumeSlider) {
    // Convert 0-100 range to 0-1 for audio
    volumeSlider.addEventListener("input", function () {
      const normalizedValue = this.value / 100;
      // If you have a reference to your audio element or system, update it here
      // audioElement.volume = normalizedValue;
    });
  }

  // Handle close buttons
  document.querySelectorAll(".close-button").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent event bubbling
      const menu = this.closest(".menu-window");
      if (!menu) return;

      menu.style.display = "none";
      if (menu === mainMenu) {
        closeAllSubmenus();
      }
    });
  });

  // Close menus when clicking outside
  document.addEventListener("click", function (event) {
    if (menuSystem && !menuSystem.contains(event.target)) {
      if (mainMenu) mainMenu.style.display = "none";
      closeAllSubmenus();
    }
  });

  function closeAllSubmenus() {
    submenus.forEach((submenu) => {
      submenu.style.display = "none";
    });
    activeSubmenu = null;
  }

  // Add drag functionality
  document.querySelectorAll(".title-bar").forEach((titleBar) => {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    titleBar.addEventListener("mousedown", dragStart);

    function dragStart(e) {
      if (!titleBar.parentElement) return;

      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === titleBar) {
        isDragging = true;
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", dragEnd);
      }
    }

    function drag(e) {
      if (isDragging && titleBar.parentElement) {
        e.preventDefault();
        e.stopPropagation();

        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, titleBar.parentElement);
      }
    }

    function setTranslate(xPos, yPos, el) {
      if (el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
      }
    }

    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;

      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", dragEnd);
    }
  });
}

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize menu system
  initializeMenuSystem();
});

// If your page is loading elements dynamically, you might also want:
window.addEventListener("load", function () {
  initializeMenuSystem();
});

// Call this after initializeMenuSystem
debugMenuButton();
