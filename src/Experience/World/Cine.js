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
    }
    setModel() {
        this.projector = this.resources.items.camera.scene.children[0]
        this.projector.scale.set(0.05, 0.05, 0.05)
        this.projector.position.set(0, -1, 0)
        this.projector.rotation.x = Math.PI * 0.5
        this.scene.add(this.projector)
        console.log(this.projector);
    };
    setWall() {
        this.wall = new THREE.Mesh(new THREE.PlaneGeometry(15, 15), new THREE.MeshPhongMaterial({ color: 0x000000 }))
        this.wall.name = 'wall'
        this.wall.position.set(0, 0, -40)
        this.wall.scale.set(2, 1.5, 0.5)
        this.wall.receiveShadow = true
        this.scene.add(this.wall)

    }
    setVideo() {
        const video = document.getElementById('video');
        const videoTexture = new THREE.VideoTexture(video);
  
        const videoPlaneGeometry = new THREE.PlaneGeometry(15, 10,128,128);
        const videoPlaneMaterial =  new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms:
            {
                uTime: { value: 0 },
                video: { value: videoTexture },
                uBigWavesElevation: { value: 0.3 },
                uBigWavesFrequency: { value: new THREE.Vector2(0.5, 1.5) },

            },
            // transparent: true,
            // depthTest: false,

        })
        this.videoPlane = new THREE.Mesh(videoPlaneGeometry, videoPlaneMaterial)
        this.scene.add(this.videoPlane)
    }
    setSpotLight() {
        this.spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI * 0.1, 0.25, 1);
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
    setParticles() {
        const particlesGeometry = new THREE.BufferGeometry()
        const count = 50000

        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)

        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 10
            // white color
            colors[i] = 1
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        // Material
        const particlesMaterial = new THREE.PointsMaterial()

        particlesMaterial.size = 0.001
        particlesMaterial.sizeAttenuation = true

        particlesMaterial.color = new THREE.Color('#ffffff')

        particlesMaterial.transparent = true
        // particlesMaterial.alphaMap = particleTexture
        // particlesMaterial.alphaTest = 0.01
        // particlesMaterial.depthTest = false
        particlesMaterial.depthWrite = false
        particlesMaterial.blending = THREE.AdditiveBlending

        particlesMaterial.vertexColors = true

        // Points
        const particles = new THREE.Points(particlesGeometry, particlesMaterial)
        this.scene.add(particles)

    }

    update() {
        this.time += 0.02
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.intersect = this.raycaster.intersectObject(this.wall);
        if (this.intersect.length) {
            if (this.currentIntersect) {
                this.intersectPoint = this.intersect[0].point;
                this.videoPlane.position.set(this.intersectPoint.x, this.intersectPoint.y, this.intersectPoint.z);
                this.spotLight.target.position.set(this.intersectPoint.x, this.intersectPoint.y, this.intersectPoint.z);
                this.projector.lookAt(this.intersectPoint)
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
