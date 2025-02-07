import * as THREE from "https://cdn.skypack.dev/three@0.136";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js";

import { FirstPersonControls } from "https://cdn.skypack.dev/three@0.136/examples/jsm/controls/FirstPersonControls.js";

const KEYS = {
  a: 65,
  s: 83,
  w: 87,
  d: 68,
};

function clamp(x, a, b) {
  return Math.min(Math.max(x, a), b);
}

class InputController {
  constructor(target) {
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
  }

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
}

class FirstPersonCamera {
  constructor(camera, objects) {
    this.camera_ = camera;
    this.input_ = new InputController();
    this.rotation_ = new THREE.Quaternion();
    this.translation_ = new THREE.Vector3(0, 2, 0);
    this.phi_ = 0;
    this.phiSpeed_ = 8;
    this.theta_ = 0;
    this.thetaSpeed_ = 5;
    this.headBobActive_ = false;
    this.headBobTimer_ = 0;
    this.objects_ = objects;
    this.raycaster = new THREE.Raycaster();
    this.updateHeadBob_ = this.updateHeadBob_.bind(this); // Bind the method

    this.footstepAudioFiles = [
      "audio/footstep_1.mp3",
      "audio/footstep_2.mp3",
      "audio/footstep_3.mp3",
      "audio/footstep_4.mp3",
      "audio/footstep_5.mp3",
      "audio/footstep_6.mp3",
      "audio/footstep_7.mp3",
      "audio/footstep_8.mp3",
      "audio/footstep_9.mp3",
      "audio/footstep_10.mp3",
      "audio/footstep_11.mp3",
      "audio/footstep_12.mp3",
      "audio/footstep_13.mp3",
      "audio/footstep_14.mp3",
      "audio/footstep_15.mp3",
    ];
    this.lastStepTime = 0;
    this.isMoving = false; // Track if a movement key is pressed

    // Default movement speed
    this.movementSpeed_ = 3;

    // Create audio elements
    this.footstepAudio = new Audio();
    this.backgroundMusic = new Audio("audio/forest.mp3");
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.7;

    // Initialize the slider change listener
    this.initializeMovementSpeedSlider();
  }

  // Initialize movement speed slider event listener
  initializeMovementSpeedSlider() {
    const movementSpeedSlider = document.getElementById("movementSpeedSlider");
    const movementSpeedValue = document.getElementById("movementSpeedValue");

    if (!movementSpeedSlider || !movementSpeedValue) {
      console.error("Slider or value element not found!");
      return;
    }

    movementSpeedSlider.addEventListener("input", (event) => {
      // Update movement speed
      this.movementSpeed_ = parseFloat(event.target.value);

      // Debug the speed change
      //console.log(`Updated Movement Speed: ${this.movementSpeed_}`);

      // Update the displayed value for current speed
      movementSpeedValue.textContent = this.movementSpeed_;
    });
  }

  update(timeElapsedS) {
    this.updateRotation_(timeElapsedS);
    this.updateCamera_(timeElapsedS);
    this.updateTranslation_(timeElapsedS);
    this.updateHeadBob_(timeElapsedS);
    this.input_.update(timeElapsedS);
  }

  updateTranslation_(timeElapsedS) {
    const moveDirection = new THREE.Vector3();

    if (this.input_.moveForward) moveDirection.z -= 1;
    if (this.input_.moveBackward) moveDirection.z += 1;
    if (this.input_.moveLeft) moveDirection.x -= 1;
    if (this.input_.moveRight) moveDirection.x += 1;

    moveDirection.normalize();

    // Debug the movement speed
    //console.log(`Movement Speed: ${this.movementSpeed_}`);

    // Apply speed and time elapsed
    moveDirection.multiplyScalar(this.movementSpeed_ * timeElapsedS);

    console.log(
      `Move Direction: ${moveDirection.x}, ${moveDirection.y}, ${moveDirection.z}`
    );

    this.camera_.position.add(moveDirection);
  }

  updateCamera_(_) {
    // Check if there are objects for raycasting
    if (this.objects_ && this.objects_.length > 0) {
      //console.log("Objects for raycasting: ", this.objects_);

      // Set up raycasting: Ray origin and direction
      this.raycaster.ray.origin.copy(this.camera_.position);
      this.raycaster.ray.direction.set(0, -2, 0).normalize(); // Ray goes downward

      // Check the positions and scales of objects for raycasting
      this.objects_.forEach((obj) => {
        //console.log("Object position: ", obj.position);
        //console.log("Object scale: ", obj.scale);
        if (obj.geometry) {
          obj.geometry.computeBoundingBox(); // Ensure bounding box is calculated
          //console.log("Bounding box: ", obj.geometry.boundingBox);
        }
      });

      // Perform raycasting
      const intersects = this.raycaster.intersectObjects(this.objects_, true); // With recursion
      //console.log("Raycasting results: ", intersects);

      // If there's an intersection, move the camera
      if (intersects.length > 0) {
        const heightAboveGround = 2;
        let groundHeight = intersects[0].point.y + heightAboveGround;
        //console.log("ground height", groundHeight);
        // Apply head bobbing offset
        let headBobOffset = Math.sin(this.headBobTimer_ * 5) * 2;
        this.camera_.position.y = groundHeight + headBobOffset;

        //console.log("Camera position Y: ", this.camera_.position.y);
        this.lastValidHeight = this.camera_.position.y + headBobOffset;
        //console.log("lastValidHeight", this.lastValidHeight);
      } else {
        // console.warn("No intersections found.");
        this.camera_.position.y = this.lastValidHeight; // Fallback to last valid height
      }
    } else {
      //console.warn("No objects found for raycasting");
      this.camera_.position.y = this.lastValidHeight; // Fallback
    }

    // Mute or unmute background music based on camera height

    // Update camera translation based on the translation vector
    this.camera_.position.copy(this.translation_);
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.rotation_);

    const dir = forward.clone();
    forward.multiplyScalar(100);
    forward.add(this.translation_);

    let closest = forward;
    const result = new THREE.Vector3();
    const ray = new THREE.Ray(this.translation_, dir);
    for (let i = 0; i < this.objects_.length; ++i) {
      if (ray.intersectBox(this.objects_[i].geometry.boundingBox, result)) {
        if (result.distanceTo(ray.origin) < closest.distanceTo(ray.origin)) {
          closest = result.clone();
        }
      }
    }

    this.camera_.lookAt(closest);
  }
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
  }

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
  }

  adjustCameraYPosition() {
    // Check if there are objects for raycasting
    if (this.objects_ && this.objects_.length > 0) {
      //console.log("Objects for raycasting: ", this.objects_);

      // Set up raycasting: Ray origin and direction
      this.raycaster.ray.origin.copy(this.camera_.position);
      this.raycaster.ray.direction.set(0, -2, 0).normalize(); // Ray goes downward

      // Check the positions and scales of objects for raycasting
      this.objects_.forEach((obj) => {
        //console.log("Object position: ", obj.position);
        //console.log("Object scale: ", obj.scale);
        if (obj.geometry) {
          obj.geometry.computeBoundingBox(); // Ensure bounding box is calculated
          //console.log("Bounding box: ", obj.geometry.boundingBox);
        }
      });

      // Perform raycasting
      const intersects = this.raycaster.intersectObjects(this.objects_, true); // With recursion
      //console.log("Raycasting results: ", intersects);

      // If there's an intersection, move the camera
      if (intersects.length > 0) {
        const heightAboveGround = 3;
        let groundHeight = intersects[0].point.y + heightAboveGround;
        // console.log("ground height", groundHeight);
        // Apply head bobbing offset
        let headBobOffset = Math.sin(this.headBobTimer_ * 10) * 0.08;
        this.camera_.position.y = groundHeight + headBobOffset;

        // console.log("Camera position Y: ", this.camera_.position.y);
        this.lastValidHeight = this.camera_.position.y + headBobOffset;
        // console.log("lastValidHeight", this.lastValidHeight);
      } else {
        // console.warn("No intersections found.");
        this.camera_.position.y = this.lastValidHeight; // Fallback to last valid height
      }
    } else {
      //console.warn("No objects found for raycasting");
      this.camera_.position.y = this.lastValidHeight; // Fallback
    }
  }

  updateRotation_(timeElapsedS) {
    const xh = this.input_.current_.mouseXDelta / window.innerWidth;
    const yh = this.input_.current_.mouseYDelta / window.innerHeight;

    this.phi_ += -xh * this.phiSpeed_;
    this.theta_ = clamp(
      this.theta_ + -yh * this.thetaSpeed_,
      -Math.PI / 3,
      Math.PI / 3
    );

    const qx = new THREE.Quaternion();
    qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
    const qz = new THREE.Quaternion();
    qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta_);

    const q = new THREE.Quaternion();
    q.multiply(qx);
    q.multiply(qz);

    this.rotation_.copy(q);
  }
}

class FirstPersonCameraDemo {
  constructor() {
    this.initialize_();
  }

  initialize_() {
    this.initializeRenderer_();
    this.initializeLights_();
    this.initializeScene_();
    this.initializePostFX_();
    this.initializeDemo_();

    this.previousRAF_ = null;
    this.raf_();
    this.onWindowResize_();
  }

  initializeDemo_() {
    // this.controls_ = new FirstPersonControls(
    //     this.camera_, this.threejs_.domElement);
    // this.controls_.lookSpeed = 0.8;
    // this.controls_.movementSpeed = 5;

    this.fpsCamera_ = new FirstPersonCamera(this.camera_, this.objects_);
  }

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

    // Initial FOV and Camera setup
    const initialFov = 60;
    const aspect = window.innerWidth / window.innerHeight; // Use dynamic aspect ratio
    const near = 1.0;
    const far = 1000.0;
    this.camera_ = new THREE.PerspectiveCamera(initialFov, aspect, near, far);
    this.camera_.position.set(0, 2, 0);

    this.scene_ = new THREE.Scene();

    this.uiCamera_ = new THREE.OrthographicCamera(
      -1,
      1,
      1 * aspect,
      -1 * aspect,
      1,
      1000
    );
    this.uiScene_ = new THREE.Scene();

    // Handle FOV slider change
    const fovSlider = document.getElementById("fovSlider");
    fovSlider.addEventListener("input", (event) => {
      const newFov = parseFloat(event.target.value);
      this.updateFov(newFov);
    });
  }

  updateFov(fov) {
    // Update the camera's FOV and adjust the projection matrix
    this.camera_.fov = fov;
    this.camera_.updateProjectionMatrix();
    const fovValue = document.getElementById("fovValue");
    //console.log(fov);
    // Update the displayed value for current speed
    fovValue.textContent = fov;
  }

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
      }

      // Select a random index from the available indices
      const randomIndex =
        availableIndexes[Math.floor(Math.random() * availableIndexes.length)];

      // Update the last two indices and store them in localStorage
      secondLastModelIndex = lastModelIndex;
      lastModelIndex = randomIndex;

      // Save the updated indices to localStorage
      localStorage.setItem("lastModelIndex", lastModelIndex);
      localStorage.setItem("secondLastModelIndex", secondLastModelIndex);

      return randomIndex;
    }

    // Use the modified randomness function
    const randomModelConfig = glbModels[getRandomModelIndex()];

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(randomModelConfig.path, (gltf) => {
      const model = gltf.scene;
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Add the mesh directly to this.objects_
          this.objects_.push(child);
        }
      });
      this.scene_.add(model);

      this.playBackgroundMusic(randomModelConfig.audio);

      // Set the position and scale from the model configuration
      model.position.copy(randomModelConfig.position);
      model.scale.copy(randomModelConfig.scale);

      // Display the credit in the #worldInfoText div
      const creditDivWorld = document.getElementById("wordlInfoTextWorld");
      const creditDivAudio = document.getElementById("wordlInfoTextAudio");

      //console.log(creditDivWorld);
      //console.log(creditDivAudio);

      if (creditDivWorld) {
        creditDivWorld.innerHTML = `${randomModelConfig.credit}`;
      }

      //console.log(`${randomModelConfig.credit}`);
      //console.log(`${randomModelConfig.AudioCredit}`);
      if (creditDivAudio) {
        creditDivAudio.innerHTML = `${randomModelConfig.AudioCredit}`;
      }
    });

    // Initialize this.objects_ as an empty array
    this.objects_ = [];

    this.initEscapeKeyListener();
    this.initializeMusicVolumeSlider();

    // Initialize the click listener to start audio playback
    this.initClickListener();
  }

  initializeMusicVolumeSlider() {
    const musicVolumeSlider = document.getElementById("musicVolumeSlider");

    musicVolumeSlider.addEventListener("input", (event) => {
      const volume = parseFloat(event.target.value); // Get the slider value
      this.setMusicVolume(volume); // Update the volume
    });
  }

  setMusicVolume(volume) {
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = volume; // Set the new volume
      // console.log("Background music volume set to: ", volume);
      const volumeValue = document.getElementById("volumeValue");
      //console.log(volume);
      const volumePercentage = (volume * 100).toFixed(0);
      // Update the displayed value for current speed
      volumeValue.textContent = volumePercentage;
    }
  }
  playBackgroundMusic(audioPath) {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause(); // Stop any currently playing music
      this.backgroundMusic.currentTime = 0; // Reset the audio to the start
    }

    this.backgroundMusic = new Audio(audioPath); // Create a new audio instance
    this.backgroundMusic.loop = true; // Set to loop

    // Set initial volume from the slider value
    const initialVolume = parseFloat(
      document.getElementById("musicVolumeSlider").value
    );
    this.backgroundMusic.volume = initialVolume; // Set the initial volume
    this.backgroundMusic.play(); // Start playing the new background music

    //console.log(
    // "Playing background music at volume: ",
    // this.backgroundMusic.volume
    //);
  }

  initEscapeKeyListener() {
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        console.log("Escape pressed for audio");

        // Mute all audio elements when Escape key is pressed
        document.querySelectorAll("audio").forEach((audio) => {
          audio.muted = true;
          console.log("Audio muted");
        });

        // Also, mute the background music if it's playing
        if (this.backgroundMusic) {
          this.backgroundMusic.muted = true; // Mute the specific background music
          console.log("Background music muted");
        }
      }
    });
  }

  // Initialize the click listener to start audio playback
  initClickListener() {
    document.addEventListener("click", () => {
      this.backgroundMusic.muted = false; // Mute the specific background music

      // Check if background music is not already playing
      if (this.backgroundMusic && this.backgroundMusic.paused) {
        console.log("Audio playing on click...");
        this.backgroundMusic.play(); // Play the background music
      }
    });
  }

  initializeLights_() {
    // Remove the spotlight setup
    // const distance = 50.0;
    // const angle = Math.PI / 4.0;
    // const penumbra = 0.5;
    // const decay = 1.0;

    // const light = new THREE.SpotLight(
    //   0xffffff,
    //   100.0,
    //   distance,
    //   angle,
    //   penumbra,
    //   decay
    // );
    // light.castShadow = true;
    // light.shadow.bias = -0.00001;
    // light.shadow.mapSize.width = 4096;
    // light.shadow.mapSize.height = 4096;
    // light.shadow.camera.near = 1;
    // light.shadow.camera.far = 100;

    // light.position.set(25, 25, 0);
    // light.lookAt(0, 0, 0);
    // this.scene_.add(light);

    // Add pure white ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5); // White color, intensity 1
    this.scene_.add(ambientLight);

    const upColour = 0xffff80;
    const downColour = 0x808080;
    const hemiLight = new THREE.HemisphereLight(upColour, downColour, 0.5);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 4, 0);
    this.scene_.add(hemiLight);
  }

  initializePostFX_() {}

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
  }

  step_(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;

    // this.controls_.update(timeElapsedS);
    this.fpsCamera_.update(timeElapsedS);
  }
}

window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    console.log("ecp pressed in game");

    // Determine the target origin dynamically based on the environment
    let targetOrigin = "";

    if (
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "localhost"
    ) {
      targetOrigin = "http://127.0.0.1:5501/projects.html";
    } else {
      targetOrigin = "https://quentinhenry.com/projects.html";
    }

    // Send the message to the parent window
    window.parent.postMessage("escape", targetOrigin);
  }
});

let _APP = null;

window.addEventListener("DOMContentLoaded", () => {
  _APP = new FirstPersonCameraDemo();
});

let introdiv = document.getElementById("intro");

let endintro = function () {
  introdiv.className = "clicked";
};

if (introdiv) {
  // Check if the element exists
  introdiv.onclick = endintro;
}

// Listen for the Escape key press inside the embed (game)

// Listen for clicks inside the embed content
document.addEventListener("click", function () {
  // Send a message to the parent window (where the embed is embedded)
  window.parent.postMessage({ type: "enterFullscreen" }, "*");
});

window.addEventListener("message", function (event) {
  // Ensure the message is from a trusted origin
  if (
    event.origin === "http://127.0.0.1:5501" ||
    event.origin === "https://quentinhenry.com"
  ) {
    // Handle the 'pauseBackgroundMusic' message
    if (event.data === "pauseBackgroundMusic") {
      console.log("Received pauseBackgroundMusic message. Pausing the audio.");
      pauseBackgroundMusic(); // Pause the background music
    }
  } else {
    console.warn("Untrusted message origin:", event.origin);
  }
});
