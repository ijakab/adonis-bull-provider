const Config = use('Config')
const bull = require('bull')
const {getQueueName, getQueueConfig} = use('Queue/Helpers')
const instances = use('Queue/Instances')

class BaseQueue {
    static get redis() {
        return Config.get('bull.defaultRedis', 'local')
    }
    
    static createQueue() {
        let config = getQueueConfig(this.fileName)
        let name = getQueueName(this.fileName)
        
        if(!instances[name]) instances[name] = new bull(name, config)
        let queue = instances[name]
        
        let instance = new this()
    
        queue.process('*', (payload) => {
            if(payload.name && instance[payload.name]) return instance[payload.name](payload)
            if(instance.defaultHandle) return instance.defaultHandle(payload)
        })
        
        instances.push(queue)
        return queue
    }
}

module.exports = BaseQueue
