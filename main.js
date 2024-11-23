import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import gsap from 'gsap';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // For high-DPI screens

// Set initial camera position
camera.position.z = 2;

let model;
// Load HDRI environment
new RGBELoader().load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_dusk_2_1k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;

  // Load GLTF model once HDRI is applied
  const loader = new GLTFLoader();
  loader.load('./DamagedHelmet.gltf', (gltf) => {
    model = gltf.scene;
    scene.add(model);
  }, undefined, (error) => {
    console.error(error);
  });
});

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Post-processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0004; // Adjust the shift amount for subtle effect
composer.addPass(rgbShiftPass);

// Update renderer and camera on window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Rotate model on mouse movement
window.addEventListener("mousemove", (e) => {
  if (model) {
    const rotationX = ((e.clientY / window.innerHeight) - 0.5) * Math.PI * 0.1;
    const rotationY = ((e.clientX / window.innerWidth) - 0.5) * Math.PI * 0.1;

    gsap.to(model.rotation, {
      x: rotationX,
      y: rotationY,
      duration: 0.5,
      ease: "power2.out"
    });
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  composer.render(); // Use composer to apply post-processing effects
}

animate();
