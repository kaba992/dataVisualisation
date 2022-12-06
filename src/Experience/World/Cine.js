import * as THREE from 'three'
import Experience from '../Experience.js'
import { fragmentShader } from '../Utils/shader.js'
import { vertexShader } from '../Utils/shader.js'


export default class Cine {
  constructor() {
    this.Experience = new Experience()
    this.scene = this.Experience.scene
    this.resources = this.Experience.resources
    this.camera = this.Experience.camera.instance
    this.currentIntersect = null
    this.intersectPoint = null
    this.scene.background = new THREE.Color(0x000000)
    this.time = 0

    this.setModel()
    this.setWall()
    this.setVideo()
    this.setRaycaster()
    this.setSpotLight()
    // this.setParticles()
    this.setTimeline()
  }
  setModel() {
    this.projector = this.resources.items.camera.scene
    this.projector.scale.set(1.5, 1.5, 1.5)
    // const worldPos = new THREE.Vector3(0,0,0)
    // this.projector.worldToLocal(worldPos)
    // this.projector.rotation.x = Math.PI * 0.5
    this.projector.position.set(0,-15,-10)
    this.projector.rotation.y = Math.PI * 0.5
    this.scene.add(this.projector)
    console.log(this.projector);
  };
  setWall() {
    this.wall = new THREE.Mesh(new THREE.PlaneGeometry(15, 10),
      new THREE.MeshPhongMaterial({ color: 0xffffff }))
    this.wall.name = 'wall'
    this.wall.position.set(0, 5, -40)
    this.wall.scale.set(2, 1.5, 0.5)
    this.wall.receiveShadow = true
    this.scene.add(this.wall)
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(80, 50),
      new THREE.MeshPhongMaterial({ color: 0xffffff }))
    plane.position.set(0, 0, -41)
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
      // depthTest: false,

    })
    this.videoPlane = new THREE.Mesh(videoPlaneGeometry, videoPlaneMaterial)
    this.scene.add(this.videoPlane)
    console.log(this.videoPlane.material.uniforms.video.value);
  }
  setSpotLight() {
    this.spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI * 0.2, 0.25, 1);
    this.spotLight.rotateX(Math.PI * 0.5);
    this.spotLight.penumbra = 1;
    this.spotLight.position.set(0, -1, 0);
    this.spotLight.power = 5;
    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;
    this.spotLight.shadowMapVisible = true;

    console.log(this.spotLight);

    const coneLightHelper = new THREE.SpotLightHelper(this.spotLight);

    this.scene.add(this.spotLight, this.spotLight.target);
    const spotLightCameraHelper = new THREE.CameraHelper(this.spotLight.shadow.camera)

  }
  setRaycaster() {
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    // this.pointB = new THREE.Vector3(0, 0, -5);
    // this.pointA = new THREE.Vector3(0, 0, 0);
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


  update() {
    this.time += 0.02
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.intersect = this.raycaster.intersectObject(this.wall);
    if (this.intersect.length) {
      if (this.currentIntersect) {
        this.intersectPoint = this.intersect[0].point;
        this.videoPlane.position.set(this.intersectPoint.x, this.intersectPoint.y, this.intersectPoint.z + 0.01);
        this.spotLight.target.position.set(this.intersectPoint.x, this.intersectPoint.y, this.intersectPoint.z);
        // this.projector.lookAt(this.intersectPoint)
        this.spotLight.lookAt(this.intersectPoint)

      }
      this.currentIntersect = this.intersect[0]
    }
    else {
      this.currentIntersect = null
    }
    this.videoPlane.material.uniforms.uTime.value = this.time

  }
}
