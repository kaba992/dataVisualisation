import * as THREE from 'three'
import { PointLight, Vector3 } from 'three'
import Experience from '../Experience.js'
import { fragmentShader } from '../Utils/shader.js'
import { vertexShader } from '../Utils/shader.js'
import Composer from './Composer.js'


export default class Cine {
  constructor(Composer) {
    this.Experience = new Experience()
    this.scene = this.Experience.scene
    this.resources = this.Experience.resources
    this.camera = this.Experience.camera.instance
    this.currentIntersect = null
    this.intersectPoint = null
    this.scene.background = new THREE.Color(0x000000)
    this.time = 0
    this.composer = Composer

    this.setModel()
    this.setWall()
    this.setVideo()
    this.setRaycaster()
    this.setSpotLight()
    // this.setParticles()
    this.setTimeline()
    this.setPointLight()
  }
  setModel() {
    this.model = this.resources.items.camera.scene
    this.chairs = this.resources.items.chaises.scene
    this.chairs.rotation.y = Math.PI
    this.chairs.position.set(0, -8, -6)
    this.chairs.scale.set(1.5, 1.5, 1.5)
    this.projector = this.model.getObjectByName('camera')
    this.model.scale.set(2, 2, 2)
    this.model.position.set(0, -8, 0)
    this.model.rotation.y = Math.PI * 0.5
    this.scene.add(this.model)
    this.scene.add(this.chairs)
  };
  setWall() {
    this.wall = new THREE.Mesh(new THREE.PlaneGeometry(35, 30),
      new THREE.MeshPhongMaterial({ color: 0xffffff }))
    this.wall.name = 'wall'
    this.wall.position.set(0, 3, -90)
    this.wall.scale.set(2, 1.5, 0.5)
    this.wall.receiveShadow = true
    this.scene.add(this.wall)
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(150, 60),
      new THREE.MeshPhongMaterial({ color: 0xffffff }))
    plane.position.set(0, 0, -91)
    this.scene.add(plane)
  }
  setVideo() {
    const video = document.getElementById('video');
    const videoTexture = new THREE.VideoTexture(video);
    video.play();
    video.loop = true;
    // videoTexture.flipY = false;
    const videoPlaneGeometry = new THREE.PlaneGeometry(25, 20, 128, 128);
    const videoPlaneMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms:
      {
        uTime: { value: 0 },
        video: { value: videoTexture },
        uBigWavesElevation: { value: 0.3 },
        uBigWavesFrequency: { value: new THREE.Vector2(0.3, 1.5) },

      },
      transparent: true,

    })
    this.videoPlane = new THREE.Mesh(videoPlaneGeometry, videoPlaneMaterial)
    this.videoPlane.position.set(0, 3, -89.99)
    this.scene.add(this.videoPlane)
    console.log(this.videoPlane.material.uniforms.video.value);
  }
  setSpotLight() {
    this.spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI * 0.1, 0.25, 1);
    this.spotLight.rotateX(Math.PI * 0.5);
    this.spotLight.penumbra = 0.5;
    this.spotLight.position.set(0, -1, 0);
    this.spotLight.power = 20;
    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;
    this.spotLight.shadowMapVisible = true;
    const coneLightHelper = new THREE.SpotLightHelper(this.spotLight);
    this.scene.add(this.spotLight, this.spotLight.target);
    const spotLightCameraHelper = new THREE.CameraHelper(this.spotLight.shadow.camera)

  }
  setRaycaster() {
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    })
  }
  setTimeline() {
    const timelineDots = document.querySelectorAll('.timeline__dot');
    timelineDots.forEach((dot) => {
      // dot.addEventListener('mouseenter', () => {
      //   this.resetTimeline(timelineDots);
      //   dot.querySelector('.dot').classList.add('active')
      // })
      // dot.addEventListener('mouseleave', () => {

      //   setTimeout(() => {
      //     this.resetTimeline(timelineDots);
      //     dot.querySelector('.dot').classList.remove('active')
      //   }, 500);
      // })
    });
  }

  resetTimeline(timelineDots) {
    timelineDots.forEach((dot) => {
      dot.querySelector('.dot').classList.remove('active')
    });
  }
  setPointLight() {
    const pointLight = new THREE.PointLight(0xffffff, 20, 0, 2);
    const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5);
    this.scene.add(pointLightHelper);
    pointLight.position.set(0, -3, -6);
    this.scene.add(pointLight);
    const sphereRightCount = 16;
    const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < sphereRightCount; i++) {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      const right = i % 2 === 0 ? 1 : -1
      sphere.position.set(25 * right, -12 - 1.25 * (i - i % 2), -5 * (i - i % 2));

      this.scene.add(sphere);
      sphere.layers.toggle(this.composer.BLOOM_SCENE);
    }

  }

  update() {
    this.time += 0.02
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.intersect = this.raycaster.intersectObject(this.wall);
    if (this.intersect.length) {
      if (this.currentIntersect) {
        this.intersectPoint = this.intersect[0].point;
        this.videoPlane.position.set(this.intersectPoint.x, this.intersectPoint.y, this.intersectPoint.z + 0.01);
        this.spotLight.target.position.set(this.intersectPoint.x, this.intersectPoint.y, this.intersectPoint.z);
        const normalized = this.intersectPoint.clone().normalize();
        // this.projector.rotation.y = Math.PI * 0.5
        this.projector.rotation.y = normalized.x * -1
        this.projector.rotation.z = normalized.y * 1

        this.spotLight.lookAt(this.intersect[0].point)

      }
      this.currentIntersect = this.intersect[0]
    }
    else {
      this.currentIntersect = null
    }
    this.videoPlane.material.uniforms.uTime.value = this.time

  }
}
