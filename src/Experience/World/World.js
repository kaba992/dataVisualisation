import Experience from '../Experience.js'
import Environment from './Environment.js'
import Cine from './Cine.js'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Wait for resources
        this.resources.on('ready', () => {
            this.cine = new Cine(this.experience.composer)
            this.environment = new Environment()
        })
    }

    update() {
        if (this.cine) {
            this.cine.update()
        }
    }
}