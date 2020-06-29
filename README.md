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

const aceProviders = [
    //...
    'adonis-bull-provider/Providers/AdonisBullCommand' // if you want run queue with a command
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
4. add `config/bull.js` configuration *(optional)*

```javascript
module.exports = {
    prefix: 'prefix', // prefix all queues if multiple projects use same database
    defaultRedis: 'local', // as defined in config/redis.js. Can be overridden for each queue. Defaults to local
    queueDirectory: 'app/Queues', //where are your queue files, defaults to this value,
    onBoot: true, // to determine whether to automatically register queues or not
    arenaPrefix: '', // prefix for bull-arena if you include it
    arenaUser: 'admin', // used for auth on bull-arena server
    arenaPassword: '' // used for auth on bull-arena server
    arenaPort: 1212 // port used to serve bull-arena
}
```
Done!

## Use

Inside queue directory (defaults to `app/Queues` make handlers. handlers look like this

`queueDir/SampleQueue`
```javascript

const BaseQueue = use('Queue/BaseQueue')

class SampleQueue extends BaseQueue {
    
    static get key() {
        return 'queueName'
    }
    
    async eventName(payload) {
        //handle jobs with name 'eventName'
    }
    
    async anotherEventName() {
        //handle jobs with name 'anotherEventName'
    }
    
    async defaultHandle(payload ) { 
        //if method with job name is not fond this is executed
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

## Starting Queues

Queues are registered automatically on server start by default. But you can include `onBoot: false`  in  `config/bull.js` to disable automatic registration.

If you disable automatic registration, it means you want to use the command option instead.

### Using Adonis command to start queues

Use this command to start the queues:

```sh
adonis queue:listen
```

To also run [bull-arena](https://github.com/bee-queue/arena) alongside, add `--arena`

```sh
adonis queue:listen --arena
```

bull-arena will run on the port you specify with `arenaPort` (defaults to `1212`) in `config/bull.js`.

## Exceptions

To handle errors, define `onError(error, payload)` method on your queues. It'll be called if an error occurs while processing a job

## closeAll

When you register this provider, problem will arise: ace commands will not exit. That happens because redis connections are not closed. For that reason (or for any reason tou might need) you may call closeAll() method.

Inside `start/hooks.js`
```javascript
hooks.before.aceCommand(async () => {
    const {closeAll} = use('Queue/Helpers')
    await closeAll()
})
```

*Note* If you have overridden createQueue method on Queue handlers, this may not work properly

## Thanks

Special thanks to creators of AdonisJs and bull
