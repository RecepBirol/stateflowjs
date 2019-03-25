const { EventEmitter } = require('events');

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

            this.emit("action_handled", {
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
            this.emit("started", {
                name: this._name,
                parent: this._parent ? this._parent.name : null
            });
        } else {
            // state already running, do nothing!
            this.emit("already_running", {
                name: this._name,
                parent: this._parent ? this._parent.name : null
            });
        }
    }

    // stop state machine
    stop() {

    }

    // transition to another state
    transition(toState, ...payload) {
        // check is state exist 
        if (this.states[toState] === undefined) {
            this.emit("error", {
                code: "undefined_state",
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
        this.emit("transition", {
            prevState: this._prevState,
            nextState: this._currentState,
            name: this._name,
            parent: this._parent ? this._parent.name : null
        });

        return true;
    }
}


module.exports = StateFlow;