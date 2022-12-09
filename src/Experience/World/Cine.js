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
    this.filters = document.querySelectorAll('.filter')
    this.filterWrapper = document.querySelector('.filters')
    this.filterText = document.querySelector('.text-content')
    this.debug = this.Experience.debug
    this.zoom = document.querySelector('.zoom')
    this.unZoom = document.querySelector('.unzoom')
    this.start = document.querySelector('.loaderImg')
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('cone')
    }
    gsap.set(this.timelineBar, { width: 0 })
   this.zoomClicked = false
   this.unZoomClicked = false
  this.zoom.addEventListener('click', () => {
    this.zoomClicked = true
    this.unZoomClicked = false
    this.timelineBar.style.display = 'none'
  })
  this.unZoom.addEventListener('click', () => {
    this.unZoomClicked = true
    this.zoomClicked = false
    this.timelineBar.style.display = 'block'
  })
  this.start.addEventListener('click', () => {
    gsap.to(this.loader, { opacity: 0, duration: 1 })
    setTimeout(() => {
    this.loader.style.display = 'none'
    }, 2000);
  })



    // const animationLoad = lottie.loadAnimation({
    //   container: this.loader, // the dom loading that will contain the animation
    //   renderer: 'svg',
    //   loop: true,
    //   autoplay: true,
    //   path: "https://assets4.lottiefiles.com/datafiles/397tkqLfSbPbfm9/data.json", // the path to the animation json
    //   // preserveAspectRatio: 'xMidYMid meet',
    // });

    // animationLoad.play();

    // this.loader.style.display = 'none'



    this.setModel()
    this.setWall()
    this.setVideo()
    this.setRaycaster()
    // this.setSpotLight()
    this.setTimeline()
    this.setPointLight()
    this.setLoaderAnim()

  }
  setLoaderAnim() {
    const loaderAnim = document.querySelectorAll('.textAnim')
    const loadArray = Array.from(loaderAnim).reverse()
    // gsap.to(loadArray, 1, { top: 50, opacity: 1, stagger: 0.2 })
  }
  initCamera() {
    let camAnim = gsap.timeline({
      onComplete: () => {
        this.cameraInit = true

        this.loaderPlane.visible = false
        gsap.to(this.timelineBar, { width: '50%', duration: 1, ease: 'none' })
             this.cone.visible = true
            this.loaderPlane.visible = true
            this.video.play();
            this.video.loop = false;
            setTimeout(() => {
              this.loaderPlane.visible = false
              this.videoPlane.visible = true
              this.timelineBar.style.display = 'block'
              this.zoom.style.display = 'block'
              this.unZoom.style.display = 'block'
            }, 3000)


        // coneAnim.to(this.cone.scale, { x: 3.74, y: 3, z: 2.7, duration: 1 })
      }
    })
    camAnim.to(this.projector.rotation, { z: 0, duration: 1.5, ease: 'power2.out' })
  }
  setModel() {
    this.model = this.resources.items.camera.scene
    this.chairs = this.resources.items.chaises.scene
    this.coneGeo = new THREE.ConeGeometry(10, 40, 32)
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
    })
    this.cone = new THREE.Mesh(this.coneGeo, coneMat)
    this.chairs.rotation.y = Math.PI
    this.chairs.position.set(0, -14, -6)
    this.chairs.scale.set(2.5, 2.5, 2.5)
    this.projector = this.model.getObjectByName('camera')
    this.model.scale.set(3, 3, 3)
    this.model.position.set(0, -14, 0)
    this.model.rotation.y = Math.PI * 0.5
    this.scene.add(this.model, this.chairs, this.cone)
    this.cone.position.set(-0.25, -11.05, -62)
    this.cone.scale.set(3.74, 3, 2.7)
    this.cone.rotation.x = 1.484
   this.cone.visible = false
    //set the cone geometry height to 0 with gsap




    if (this.debug.active) {
      this.debugFolder.add(this.cone.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.0001).name('RotationconeX')
      this.debugFolder.add(this.cone.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.0001).name('RotationconeY')
      this.debugFolder.add(this.cone.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.0001).name('RotationconeZ')
      this.debugFolder.add(this.cone.position, 'x').min(-90).max(15).step(0.01).name('PositionconeX')
      this.debugFolder.add(this.cone.position, 'y').min(-90).max(15).step(0.01).name('PositionconeY')
      this.debugFolder.add(this.cone.position, 'z').min(-90).max(15).step(0.01).name('PositionconeZ')
      this.debugFolder.add(this.cone.scale, 'x').min(0).max(10).step(0.01).name('coneScaleX')
      this.debugFolder.add(this.cone.scale, 'y').min(0).max(10).step(0.01).name('coneScaleY')
      this.debugFolder.add(this.cone.scale, 'z').min(0).max(10).step(0.01).name('coneScaleZ')
    }
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
    const welcome = new THREE.TextureLoader().load('textures/datas/welcome.png');
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
    this.videoPlane.position.set(0, -12, -89)
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
  }
  setTimeline() {
    const datas = {
      data1: new THREE.TextureLoader().load('textures/datas/data1.jpg'),
      data2: new THREE.TextureLoader().load('textures/datas/data2.jpg'),
      data3: new THREE.TextureLoader().load('textures/datas/data3.jpg'),
      data4: new THREE.TextureLoader().load('textures/datas/data4.jpg'),
      data5: new THREE.TextureLoader().load('textures/datas/data5.jpeg'),
    }
    const data1 = {
      data1: new THREE.TextureLoader().load('textures/datas/data1/data1.png'),
      data2: new THREE.TextureLoader().load('textures/datas/data1/data2.png'),
      data3: new THREE.TextureLoader().load('textures/datas/data1/data3.png'),

    }
    const data2 = {
      data1: new THREE.TextureLoader().load('textures/datas/data2/data1.png'),
      data2: new THREE.TextureLoader().load('textures/datas/data2/data2.png'),
      data3: new THREE.TextureLoader().load('textures/datas/data2/data3.png'),
    }
    const data3 = {
      data1: new THREE.TextureLoader().load('textures/datas/data3/data1.png'),
      data2: new THREE.TextureLoader().load('textures/datas/data3/data2.png'),
      data3: new THREE.TextureLoader().load('textures/datas/data3/data3.png'),

    }
    const data4 = {
      data1: new THREE.TextureLoader().load('textures/datas/data4/data1.png'),
      data2: new THREE.TextureLoader().load('textures/datas/data4/data2.png'),
      data3: new THREE.TextureLoader().load('textures/datas/data4/data3.png'),
    }
    const data5 = {
      data1: new THREE.TextureLoader().load('textures/datas/data5/data1.png'),
      data2: new THREE.TextureLoader().load('textures/datas/data5/data2.png'),
      data3: new THREE.TextureLoader().load('textures/datas/data5/data3.png'),
    }
    function resetRadial() {
      const radialDots = document.querySelectorAll('.radial')
      radialDots.forEach((radial) => {
        radial.classList.remove('radial')
      })

    }
    function resetSelectedItem(){
      const selectedItem = document.querySelectorAll('.selectedItem')
      selectedItem.forEach((item) => {
        item.classList.remove('selectedItem')
      })
    }

    const timelineDots = document.querySelectorAll('.timeline__dot');
    function setFilter(data, target,target2, firstData, secondData, thirdData) {
      data.forEach((filter) => {
        filter.addEventListener('click', (e) => {
          console.log(e.target.classList);
          if (e.target.classList.contains("filter1")) {
            resetRadial()
            e.target.classList.add('radial')
            target.visible = false;
            target2.visible = false;
            setTimeout(() => {
              target.visible = true;
              target2.visible = true;
            }, 500);
            target.material.uniforms.uTexture.value = firstData;
          }
          else {
            resetRadial()
          }
          if (e.target.classList.contains("filter2")) {
            resetRadial(filter)
            e.target.classList.add('radial')
            target.visible = false;
            target2.visible = false;
            setTimeout(() => {
              target.visible = true;
              target2.visible = true;
            }, 500);
            target.material.uniforms.uTexture.value = secondData;
            console.log('filter2');
          }
          if (e.target.classList.contains("filter3")) {
            resetRadial()
            e.target.classList.add('radial')
            target.visible = false;
            target2.visible = false;
            setTimeout(() => {
              target.visible = true;
              target2.visible = true;
            }, 500);
            target.material.uniforms.uTexture.value = thirdData;
            console.log('filter3');
          }
        })
      })

    }
    timelineDots.forEach((dot) => {

      // change video plane uTexture on click on timeline dot
      dot.addEventListener('click', () => {
        this.videoPlane.visible = false;
        setTimeout(() => {
          this.videoPlane.visible = true;

        }, 500);
        gsap.fromTo(this.filterWrapper, { opacity: 0 }, { opacity: 1, duration: 0.5 })


        const data = dot.getAttribute('data-image');
        if (data === 'data1') {
          this.videoPlane.material.uniforms.uTexture.value = data1.data1;
          setFilter(this.filters, this.videoPlane,this.cone, data1.data1, data1.data2, data1.data3);
          resetSelectedItem()
          dot.classList.add('selectedItem')

        } else if (data === 'data2') {
          this.videoPlane.material.uniforms.uTexture.value = data2.data1;
          setFilter(this.filters, this.videoPlane,this.cone, data2.data1, data2.data2, data2.data3);
          resetSelectedItem()
          dot.classList.add('selectedItem')
        } else if (data === 'data3') {
          this.videoPlane.material.uniforms.uTexture.value = data3.data1;
          setFilter(this.filters, this.videoPlane,this.cone, data3.data1, data3.data2, data3.data3);
          resetSelectedItem()
          dot.classList.add('selectedItem')
        } else if (data === 'data4') {
          this.videoPlane.material.uniforms.uTexture.value = data4.data1;
          setFilter(this.filters, this.videoPlane,this.cone, data4.data1, data4.data2, data4.data3);
          resetSelectedItem()
          dot.classList.add('selectedItem')
        } else if (data === 'data5') {
          this.videoPlane.material.uniforms.uTexture.value = data5.data1;
          setFilter(this.filters, this.videoPlane,this.cone, data5.data1, data5.data2, data5.data3);
          resetSelectedItem()
          dot.classList.add('selectedItem')
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

  zoomCamera() {
    // gest distance between camera and videoplane
    const distance = this.camera.position.distanceTo(this.videoPlane.position);
    // lerping camera position to videoplane position and look at videoplane
    gsap.to(this.camera.position, { x: this.videoPlane.position.x, y: this.videoPlane.position.y, z: -35, duration: 3, ease: "power4.out" });
    this.camera.lookAt(this.videoPlane.position);
    // reduce camera focus

  }
  unZoomCamera() {
    gsap.to(this.camera.position, { x: 0, y: 10, z: 30, duration: 3, ease: "power4.out" });
    this.camera.lookAt(0,-22,-89);
    // this.camera.lookAt(0, 0, 0);
  }

  update() {
    this.time += 0.02
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.intersect = this.raycaster.intersectObject(this.wall);
    this.intersectButtun = this.raycaster.intersectObject(this.cameraButton);

    if(this.zoomClicked){
      this.zoomCamera()
    }
    if(this.unZoomClicked){
      this.unZoomCamera()
    }

    if (this.intersectButtun.length) {
      window.addEventListener('click', () => {
        // console.log(this.intersectButtun[0].object.name);
        if (this.intersectButtun[0] && this.intersectButtun[0].object.name === 'cameraButton') {
          this.initCamera()
          console.log('camera');
          this.cameraButton.visible = false;

        }
      })
    }

    if (this.intersect.length) {
      if (this.currentIntersect) {
        this.intersectPoint = this.intersect[0].point;
        // this.videoPlane.position.set(this.intersectPoint.x, -10, this.intersectPoint.z + 0.1);
        // this.spotLight.target.position.set(this.intersectPoint.x, this.intersectPoint.y, this.intersectPoint.z);
        const normalized = this.intersectPoint.clone().normalize();
        // this.projector.rotation.y = Math.PI * 0.5

        // if (this.cameraInit) {
        //   this.projector.rotation.y = normalized.x * -1

        // }
        // this.projector.rotation.z = normalized.y * 1

        // this.spotLight.lookAt(this.intersect[0].point)

      }
      this.currentIntersect = this.intersect[0]
    }
    else {
      this.currentIntersect = null
    }
    this.videoPlane.material.uniforms.uTime.value = this.time

  }
}
