const Config = use('Config')
const bull = require('bull')
const {getQueueName, getQueueConfig} = use('Queue/Helpers')
const instances = use('Queue/Instances')

class BaseQueue {
    static get redis() {
        return Config.get('bull.defaultRedis', 'local')
    }
    
    static createQueue() {
        let queue = this.getQueueInstance()
        let instance = new this()
    
        queue.process('*', async (payload) => {
            try {
                if(payload.name && instance[payload.name]) return await instance[payload.name](payload)
                if(instance.defaultHandle) return await instance.defaultHandle(payload)
            } catch (e) {
                try {
                    if(instance.onError) return await instance.onError(e, payload)
                } catch (err) {
                    console.error('Unhandled error on handling bool error')
                    console.error('%o', err)
                }
                console.error('Unhandled error on bool event')
                console.error('%o', e)
            }
        })
        
        return queue
    }
    
    static getQueueInstance() {
        let name = getQueueName(this.fileName)
    
        if(!instances[name]) {
            let config = getQueueConfig(this.fileName)
            instances[name] = new bull(name, config)
        }
        return instances[name]
    }
}

module.exports = BaseQueue
