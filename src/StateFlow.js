const { EventEmitter } = require('events');
// enums
const EVENTS = require('./EVENTS');
const ERR_CODES = require('./ERR_CODES');

class StateFlowEmitter extends EventEmitter {
    constructor() {
        super();
    }
}


class StateFlow extends StateFlowEmitter {
    constructor(options) {
        super();
        // maybe thrown an error! if name is null
        this._name = options.name || "unknown";

        this._states = {
            ...options.states
        };

        // default initial state
        this._intialstate = options.intialstate || "uninitialized";


        this._isRunning = false;

        this._currentState = "idle";
        this._prevState = null;

        // parens state machine intialy null
        this._parent = null;
    }

    isRunning() {
        return _isRunning;
    }

    getCurrentState() {
        return this._currentState;
    }

    // handle action with payload
    handle(action, ...payload) {
        const _actions = {
            ...this._states[this._currentState]
        };

        // not accept onEnter or onExit, they call only once !
        const _action = (action === "onEnter" || action === "onExit") ?
            null : _actions[action];

        if (_action !== undefined) {
            _action.apply(this, payload);

            this.emit(EVENTS.ACTION_HANDLED, {
                name: this._name,
                state: this._currentState,
                action: action
            });

            return true;
        } else {

            return false;
        }

    }

    // start state machine
    start(parent = null) {
        if (!this._isRunning && this._currentState === 'idle') {
            // set parent
            this._parent = parent;
            // transition to initial state
            this.transition(this._intialstate);
            // set machine status
            this._isRunning = true;

            // fire start event 
            this.emit(EVENTS.STARTED, {
                name: this._name,
                parent: this._parent ? this._parent.name : null
            });
            
            return true;
        } else {
            // state already running, do nothing!
            this.emit(EVENTS.ALREADY_RUNNING, {
                name: this._name,
                parent: this._parent ? this._parent.name : null
            });

            return false;
        }
    }

    // stop state machine
    stop(parentAction, ...payload) {
        this.transition("idle");
        this._isRunning = false;
        
        if(parentAction && this._parent) {
            _parent.handle(payload);
        }

        return true;
    }

    // transition to another state
    transition(toState, ...payload) {
        // check is state exist 
        if (this.states[toState] === undefined) {
            this.emit(EVENTS.ERROR, {
                code: ERR_CODES.UNDEFINED_STATE,
                prevState: this._currentState,
                nextState: this.toState,
                name: this._name,
                parent: this._parent ? this._parent.name : null
            });
            return false;
        }

        // set states internal
        this._prevState = this._currentState;
        this._currentState = toState;

        const _onEnter = this._states[this._currentState].onEnter;
        const _onExit = this._states[this._prevState].onExit;

        if (_onExit && typeof _onExit === 'function') {
            _onExit();
        }

        if (_onEnter && typeof _onEnter === 'function') {
            // call enter with payload
            _onEnter.apply(this, payload);
        }

        // fire transition event
        this.emit(EVENTS.TRANSITION, {
            prevState: this._prevState,
            nextState: this._currentState,
            name: this._name,
            parent: this._parent ? this._parent.name : null
        });

        return true;
    }
}


module.exports = StateFlow;