'use strict'
const { ServiceProvider } = use('@adonisjs/fold')
const fs = require('fs-extra')

class AdonisBullProvider extends ServiceProvider {
    register () {
        this.app.bind('Queue/BaseQueue', () => {
            return require('../src/BaseQueue')
        })
        this.app.bind('Queue/Helpers', () => {
            return require('../src/Helpers')
        })
        this.app.bind('Queue', () => {
            return require('../src/Service')
        })
        this.app.bind('Queue/Instances', () => {
            return require('../src/QueueInstances')
        })
    }

    async boot () {
        const Config = use('Config')
        const {getQueueDir, getQueueHandler} = use('Queue/Helpers')
        
        let redisConfig = Config.get('redis')
        if(!redisConfig) {
            throw {
                status: 500,
                message: 'Bull uses redis in background. Make config/redis.js file https://adonisjs.com/docs/4.1/redis'
            }
        }
        
        try {
            var queues = await fs.readdir(getQueueDir())
        } catch (e) {
            return //directory does not exist
        }
        
        
        const BaseQueue = use('Queue/BaseQueue')
        for(let queue of queues) {
            if(!queue.endsWith('.js')) continue
            let Handler = getQueueHandler(queue)
            let debugInstance = new Handler()
            if(!(debugInstance instanceof BaseQueue)) throw {
                status: 500,
                message: `${Handler.name} does not extend BaseQueue class. use it with Queue/BaseQueue and extend it`
            }
            
            Handler.fileName = queue
            await Handler.createQueue() //this will probably not be async function
        }
    }
}

module.exports = AdonisBullProvider
