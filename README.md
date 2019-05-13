# stateflowjs
simple state machine to create work flow in vanilla js

# Usage
```js
const StateFlow = require('StateFlow')

const mainFsm = new StateFlow(options)

// to start start machine
mainFsm.start();
```
## Options
options is an object
### options.name
the state machine name. name is a string, default value "unknown".
### options.initialstate
initial state of the state machine. when start method involved, state machine start from initial state.
### options.states
states is an object, included state machine's states.
## Methods
### isRunning
return true if state machine is running, else return false.
### start[parent, ...payloads]

#### parent
parent state machine of the state machine, default null, if state machine start in an other state machine, parent state machine will set.
```js
const childFsm = new StateFlow({
  name: "child",
  initialstate: "uninitialized",
  states:{
    "uninitialized": {
      onEnter: () => {
        
      }
    }
  }
})

const parentFsm = new StateFlow({
  name: "parent",
  initialstate: "uninitialized",
  states:{
    "uninitialized": {
      onEnter: () => {
        childFsm.start(this)
      }
    }
  }
})

parentFsm.start()
```
#### payloads
payloads for the initial state.

### stop[parentAction, ...payload]
stop the state machine. if parent action is exist, handle the parent action with payloads.

### transition[to, ...payload]
transition to state with payloads.

### getCurrentState
return the current state.

### handle[action, ...payloads]
hendle the action of the state with payloads, if the state has the given action.

## Events
### action_handled
when action handled.
### started
when state machine started.
### already_running

### error

### transition

## Event publishing
```js
const fsm = new StateFlow({
  states: {
    "state": function() {
      this.emit("event_name")
    }
  }
})
```
## Example
### Atm
```js
const StateFlow = require('../../src/StateFlow')

const Atm = new StateFlow({
  name: 'Atm',
  intialstate: 'uninitialized',
  states: {
    'uninitialized': {
      onEnter: function () {
        this.handle('initialize')
      },
      'initialize': function (pl) {
        // TODO: any other init work here...
        this.acct = null
        this.balance = 15
        this.emit('initialized')
        this.transition('unauthorized')
      }
    },

    'unauthorized': {
      onEnter: function () {
        this.emit('unauthorized', { msg: 'please enter your account and PIN' })
      },
      authorize: function (credentials) {
        if (credentials.acct === 'x' && credentials.pin === 'x') {
          this.acct = 'x'
          this.transition('authorized')
        } else {
          this.emit('unauthorized', { msg: 'invalid credentials' })
        }
      }
    },

    'authorized': {
      onEnter: function () {
        this.emit('authorized', { acct: this.acct })
      },
      deposit: function (amount) {
        this.balance += amount
        this.emit('deposit', { result: 'success', balance: this.balance })
      },
      withdrawal: function (amount) {
        if (this.balance - amount > -1) {
          this.balance -= amount
          this.emit('withdrawal', { result: 'success', balance: this.balance })
        } else {
          this.emit('withdrawal', { result: 'insufficient balance', balance: this.balance })
        }
      },
      deauthorize: function () {
        this.acct = null
        this.transition('unauthorized')
      }
    }
  }
})

Atm.on('initialized', () => {
  console.log('Atm initialized')
})

Atm.on('unauthorized', (o) => {
  console.log('ATM unauthorized! ' + o.msg)
  Atm.handle('authorize', { acct: 'x', pin: 'x' })
})

Atm.on('authorized', (o) => {
  console.log('Authorized acct: ' + o.acct)
  Atm.handle('deposit', 5)
})

Atm.on('deposit', (result) => {
  console.log(result)
  Atm.handle('withdrawal', 15)
})

Atm.on('withdrawal', (result) => {
  console.log(result)
})

Atm.start()

module.exports = Atm
```

