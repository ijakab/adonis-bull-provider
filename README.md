# Adonis bull provider

Gives nice [adonis](https://github.com/adonisjs/adonis-framework)-like interface with [bull](https://github.com/OptimalBits/bull) library. 

## Installation

1. `npm i adonis-bull-provider --save`
2. register provider inside `start/app.js`

```javascript
const providers = [
    //...
    'adonis-bull-provider/Providers/AdonisBullProvider'
]
```

3. make `config/redis.js` as per instructions [here](https://adonisjs.com/docs/4.1/redis)

```javascript
module.exports = {
    connection: 'local',
    
    local: {
        host: GET_THIS,
        port: GET_THIS,
        password: GET_THIS,
        db: GET_THIS
    },
}
```
4. add bull configuration *(optional)*

```javascript
module.exports = {
    // prefix: 'prefix' // prefix all queues if multiple projects use same database
    // defaultRedis: 'local' //as defined in config/redis.js. Can be overridden for each queue. Defaults to local
    // queueDirectory: 'app/Queues,, //where are your queue files, defaults to this value
}
```
Done!

## Use

Inside queue directory (defaults to `app/Queues` make handlers. handlers look like this

`queueDir/SampleQueue`
```javascript

const BaseQueue = use('Queue/BaseQueue')

class SampleQueue extends BaseQueue {
    
    static async handle(payload) {
        console.log('testing handle', payload.data)
        return 'test'
    }
    
    static async completed(payload ) {
        console.log('completed ', payload.data, payload.returnvalue)
    }
}

module.exports = SampleQueue

```

Besides these, you can also add:
```javascript
    static get redis() {return 'local'} //optional, if you want to use different redis conection
    
    static get config() {return {}} //optional, custom config for queue creation. See this in bull documentation
    
    static createQueue() {
        //NOT RECOMMENDED!!! Override way of creating queue.
        return super.createQueue()
    }
```

When adding job:

```javascript
    const SampleQueue = use('Queue')('SampleQueue') //this returns native bull queue objects
    await SampleQueue.add({data: 'payload'}, {delay: 2000})
    return {}
```

Queues are registered automatically on server start, so if you restart server jobs will be completed

## Thanks

Special thanks to creators of adonis.js and bull