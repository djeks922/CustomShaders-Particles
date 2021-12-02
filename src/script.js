import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { AdditiveBlending } from "three";
import vertexShader from "./shaders/points_vertexShader.glsl";
import fragmentShader from "./shaders/points_fragmentShader.glsl";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
// const textureSize = {};

const textureLoader = new THREE.TextureLoader();
textureLoader.load(
  "/assets/eli2.jfif",
  (texture) => {
    const width = texture.image.width;
    const height = texture.image.height;
    const discard = true;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.format = THREE.RGBFormat;
    let numVisible;
    let numPoints;
    let originalColors = new Float32Array(4*width*height);
    let threshold = 0;
    const initPoints = (discard) => {
        numPoints = width * height;
        numVisible = numPoints;
        
        if (discard) {
          numVisible = 0;
          threshold = 22;
      
          const img = texture.image;
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
        //   console.log(ctx);
      
          canvas.width = width;
          canvas.height = height;
      
          ctx.scale(1, -1);
          ctx.drawImage(img, 0, 0, width, height*-1);
      
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        //   console.log(imgData);
          originalColors = Float32Array.from(imgData.data);
        //   console.log(originalColors)
          for (let i = 0; i < numPoints; i++) {
            if (originalColors[i * 4 + 0] > threshold) numVisible++;
          }
          console.log('numVisible', numVisible, numPoints);
        }
      };
      initPoints(discard);

      
      const uniforms = {
        uTime: { value: 0 },
        uRandom: { value: 0 },
        uDepth: { value: 2.0 },
        uSize: { value: 1 },
        uTextureSize: { value: new THREE.Vector2(width, height) },
        uTexture: { value: texture },
        uTouch: { value: null },
    };
    const material = new THREE.RawShaderMaterial({
        uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        depthTest: false,
        transparent: true,
        // blending: THREE.AdditiveBlending
    });

    const geometry = new THREE.InstancedBufferGeometry();

		// positions
		const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
		positions.setXYZ(0, -0.5,  0.5,  0.0);
		positions.setXYZ(1,  0.5,  0.5,  0.0);
		positions.setXYZ(2, -0.5, -0.5,  0.0);
		positions.setXYZ(3,  0.5, -0.5,  0.0);
		geometry.setAttribute('position', positions);

		// uvs
		const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
		uvs.setXYZ(0,  0.0,  0.0);
		uvs.setXYZ(1,  1.0,  0.0);
		uvs.setXYZ(2,  0.0,  1.0);
		uvs.setXYZ(3,  1.0,  1.0);
		geometry.setAttribute('uv', uvs);

		// index
		geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([ 0, 2, 1, 2, 3, 1 ]), 1));

		const indices = new Uint16Array(numVisible);
		const offsets = new Float32Array(numVisible * 3);
		const angles = new Float32Array(numVisible);

		for (let i = 0, j = 0; i < numPoints; i++) {
			if (discard && originalColors[i * 4 + 0] <= threshold) continue;

			offsets[j * 3 + 0] = (i % width);
			offsets[j * 3 + 1] = Math.floor(i / width);

			indices[j] = i;

			angles[j] = Math.random() * Math.PI;

			j++;
		}

		geometry.setAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false));
		geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false));
		geometry.setAttribute('angle', new THREE.InstancedBufferAttribute(angles, 1, false));
        
        const particles =  new THREE.Mesh(geometry, material);
        console.log(particles)
        scene.add(particles)
        // particles.scale.set(0.05,0.05,0.05)
    
    /**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  65,
  sizes.width / sizes.height,
  0.01,
  100000
);
camera.position.set(0, 0, 500);
// camera.lookAt(scene.children[1])

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
//  scene.background = new THREE.Color( 0xffffff );
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  material.uniforms.uTime.value = elapsedTime
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();    
  }
);








