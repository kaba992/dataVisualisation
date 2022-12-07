import * as THREE from 'three'
import { PointLight, Vector3 } from 'three'
import Experience from '../Experience.js'
import { fragmentShader } from '../Utils/shader.js'
import { vertexShader } from '../Utils/shader.js'
import Composer from './Composer.js'
import gsap from 'gsap'


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
    this.cameraInit = false
    this.timelineBar = document.querySelector('.timeline__bar')
    this.loader = document.querySelector('.loader')

    // loader
    // const number = document.querySelector(".number");
    // const countdown = 4;
    // let counter = countdown;
    // number.innerHTML = counter;

    // setInterval(() => {
    //   counter--;
    //   number.innerHTML = counter;
    //   if (counter === 0) {
    //     this.loader.style.display = 'none'
    //   }
    // }, 1000);
  


    const animationLoad = lottie.loadAnimation({
      container: this.loader, // the dom loading that will contain the animation
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: "https://assets4.lottiefiles.com/datafiles/397tkqLfSbPbfm9/data.json", // the path to the animation json
      // preserveAspectRatio: 'xMidYMid meet',
    });

    animationLoad.play();
    setTimeout(() => {
        this.loader.style.display = 'none'
      
    }, 4000);


    this.setModel()
    this.setWall()
    this.setVideo()
    this.setRaycaster()
    this.setSpotLight()
    this.setTimeline()
    this.setPointLight()

  }
  initCamera() {
    let camAnim = gsap.timeline({
      onComplete: () => {
        this.videoPlane.visible = true
        this.cameraInit = true
        this.timelineBar.style.display = 'block'
        this.loaderPlane.visible = false

      }
    })
    camAnim.to(this.projector.rotation, { z: 0, duration: 3 })
  }
  setModel() {
    this.model = this.resources.items.camera.scene
    this.chairs = this.resources.items.chaises.scene
    this.chairs.rotation.y = Math.PI
    this.chairs.position.set(0, -14, -6)
    this.chairs.scale.set(2.5, 2.5, 2.5)
    this.projector = this.model.getObjectByName('camera')
    this.model.scale.set(3, 3, 3)
    this.model.position.set(0, -14, 0)
    this.model.rotation.y = Math.PI * 0.5
    this.scene.add(this.model)
    this.scene.add(this.chairs)
    this.cameraButton = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xff0000 }))
    this.model.add(this.cameraButton)
    this.cameraButton.position.set(-0.8, 3.5, 0.5)
    gsap.set(this.cameraButton.scale, { x: 1, y: 1, z: 1 })
    //gsap flash anim camera button
    gsap.to(this.cameraButton.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.6, repeat: -1, yoyo: true })
    gsap.set(this.projector.rotation, { z: -Math.PI * 0.2 })

    this.cameraButton.name = 'cameraButton'
  };
  setWall() {
    this.wall = new THREE.Mesh(new THREE.PlaneGeometry(35, 30),
      new THREE.MeshPhongMaterial({ color: 0xff0000 }))
    this.wall.name = 'wall'
    this.wall.position.set(0, 3, -90)
    this.wall.scale.set(2, 1.5, 0.5)
    this.wall.receiveShadow = true
    this.scene.add(this.wall)
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(250, 60),
      new THREE.MeshPhongMaterial({ color: 0xff0000 }))
    plane.position.set(0, 0, -91)
    this.scene.add(plane)
  }
  setVideo() {
    const welcome = new THREE.TextureLoader().load('textures/datas/welcome.jpg');
    this.video = document.getElementById('video');
    const videoTexture = new THREE.VideoTexture(this.video);
 
  
    const loaderGeo = new THREE.PlaneGeometry(55, 35, 128, 128);
    const loaderMat = new THREE.MeshBasicMaterial({ map: videoTexture });
    this.loaderPlane = new THREE.Mesh(loaderGeo, loaderMat);
    this.loaderPlane.position.set(0, -12, -89.99);
    this.scene.add(this.loaderPlane);
    this.loaderPlane.visible = false


    // videoTexture.flipY = false;
    const videoPlaneGeometry = new THREE.PlaneGeometry(55, 35, 128, 128);
    const videoPlaneMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms:
      {
        uTime: { value: 0 },
        uTexture: { type: 't', value: welcome },
        uBigWavesElevation: { value: 0.3 },
        uBigWavesFrequency: { value: new THREE.Vector2(0.3, 1.2) },

      },
      transparent: true,


    })
    this.videoPlane = new THREE.Mesh(videoPlaneGeometry, videoPlaneMaterial)
    this.videoPlane.position.set(0, -12, -89.99)
    this.scene.add(this.videoPlane)
    this.videoPlane.visible = false


  }
  setSpotLight() {
    this.spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI * 0.3, 0.25, 1);
    this.spotLight.rotateX(Math.PI * 0.5);
    this.spotLight.penumbra = 0.8;
    this.spotLight.position.set(0, -1, 0);
    this.spotLight.power = 30;
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
    // const chairsIntersect = this.raycaster.intersectObject(this.chairs, true)


    function update() {
      console.log("test");
      requestAnimationFrame(update);
    }
    update();
  }
  setTimeline() {
    const data1 = new THREE.TextureLoader().load('textures/datas/data1.jpg');
    const data2 = new THREE.TextureLoader().load('textures/datas/data2.jpg');
    const data3 = new THREE.TextureLoader().load('textures/datas/data3.jpg');
    const data4 = new THREE.TextureLoader().load('textures/datas/data4.jpg');
    const data5 = new THREE.TextureLoader().load('textures/datas/data5.jpeg');

    const timelineDots = document.querySelectorAll('.timeline__dot');
    timelineDots.forEach((dot) => {

      // change video plane uTexture on click on timeline dot
      dot.addEventListener('click', () => {
        this.videoPlane.visible = false;
        setTimeout(() => {
          this.videoPlane.visible = true;

        }, 500);
        const data = dot.getAttribute('data-image');
        if (data === 'data1') {
          this.videoPlane.material.uniforms.uTexture.value = data1;

        } else if (data === 'data2') {
          this.videoPlane.material.uniforms.uTexture.value = data2;
        } else if (data === 'data3') {
          this.videoPlane.material.uniforms.uTexture.value = data3;
        } else if (data === 'data4') {
          this.videoPlane.material.uniforms.uTexture.value = data4;
        } else if (data === 'data5') {
          this.videoPlane.material.uniforms.uTexture.value = data5;
        }
      });
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
    // this.scene.add(pointLightHelper);
    pointLight.position.set(0, -3, -6);
    // this.scene.add(pointLight);
    const sphereRightCount = 16;
    const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < sphereRightCount; i++) {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      const right = i % 2 === 0 ? 1 : -1
      sphere.position.set((25 + 0.8 * (i - i % 2)) * right, -12 - 1.5 * (i - i % 2), -5 * (i - i % 2));

      this.scene.add(sphere);
      sphere.layers.toggle(this.composer.BLOOM_SCENE);
    }

  }

  update() {
    this.time += 0.02
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.intersect = this.raycaster.intersectObject(this.wall);
    this.intersectButtun = this.raycaster.intersectObject(this.cameraButton);

    if (this.intersectButtun.length) {
      window.addEventListener('click', () => {
        // console.log(this.intersectButtun[0].object.name);

        if (this.intersectButtun[0] && this.intersectButtun[0].object.name === 'cameraButton') {
          this.initCamera()
          console.log('camera');
          this.cameraButton.visible = false;
          this.loaderPlane.visible = true
          this.video.play();
          this.video.loop = false;

        }
      })
    }

    if (this.intersect.length) {
      if (this.currentIntersect) {
        this.intersectPoint = this.intersect[0].point;
        this.videoPlane.position.set(this.intersectPoint.x, -10, this.intersectPoint.z + 0.1);
        this.spotLight.target.position.set(this.intersectPoint.x, this.intersectPoint.y, this.intersectPoint.z);
        const normalized = this.intersectPoint.clone().normalize();
        // this.projector.rotation.y = Math.PI * 0.5


        if (this.cameraInit) {
          this.projector.rotation.y = normalized.x * -1

        }
        // this.projector.rotation.z = normalized.y * 1

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
