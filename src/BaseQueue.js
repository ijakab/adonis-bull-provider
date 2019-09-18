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
    
        queue.process('*', (payload) => {
            if(payload.name && instance[payload.name]) return instance[payload.name](payload)
            if(instance.defaultHandle) return instance.defaultHandle(payload)
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
