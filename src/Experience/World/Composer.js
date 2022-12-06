import * as THREE from "three";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";

export default class Composer {
    ENTIRE_SCENE = 0;
    BLOOM_SCENE = 1;

    bloomLayer = new THREE.Layers();

    params = {
        exposure: 1,
        bloomStrength: 3.5,
        bloomThreshold: 0,
        bloomRadius: 0,
        scene: 'Scene with Glow'
    };

    darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
    materials = {};

  constructor(scene,camera,renderer) {
      this.scene = scene;
      this.camera = camera;

      this.bloomLayer.set( this.BLOOM_SCENE );

      this.renderScene = new RenderPass( scene, camera );

      this.bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
      this.bloomPass.threshold = this.params.bloomThreshold;
      this.bloomPass.strength = this.params.bloomStrength;
      this.bloomPass.radius = this.params.bloomRadius;




      this.bloomComposer = new EffectComposer( renderer );
      this.bloomComposer.renderToScreen = false;
      this.bloomComposer.addPass( this.renderScene );
      this.bloomComposer.addPass( this.bloomPass );



      this.finalPass = new ShaderPass(
          new THREE.ShaderMaterial( {
              uniforms: {
                  baseTexture: { value: null },
                  bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
              },
              vertexShader: document.getElementById( 'vertexshader' ).textContent,
              fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
              defines: {}
          } ), 'baseTexture'
      );
      this.finalPass.needsSwap = true;

      this.finalComposer = new EffectComposer( renderer );
      this.finalComposer.addPass( this.renderScene );
      this.finalComposer.addPass( this.finalPass );

  }


  renderBloom( mask ) {

        if ( mask === true ) {

            this.scene.traverse( this.darkenNonBloomed.bind(this) );
            this.bloomComposer.render();
            this.scene.traverse( this.restoreMaterial.bind(this) );

        } else {

            this.camera.layers.set( this.BLOOM_SCENE );
            this.bloomComposer.render();
            this.camera.layers.set( this.ENTIRE_SCENE );

        }

    }

    darkenNonBloomed( obj ) {

        if ( obj.isMesh && this.bloomLayer.test( obj.layers ) === false ) {

            this.materials[ obj.uuid ] = obj.material;
            obj.material = this.darkMaterial;

        }

    }

    restoreMaterial( obj ) {

        if ( this.materials[ obj.uuid ] ) {

            obj.material = this.materials[ obj.uuid ];
            delete this.materials[ obj.uuid ];

        }

    }

    render() {
        // render scene with bloom
        this.renderBloom( true );

        // render the entire scene, then render bloom scene on top
        this.finalComposer.render();
    }

}1