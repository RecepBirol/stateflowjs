const { EventEmitter } = require('events');

class StateFlowEmitter extends EventEmitter {
    constructor() {
        super();
    }
}


class StateFlow extends StateFlowEmitter {
    constructor() {
        super();
    }

    start(msg) {
        this.emit("start", msg);
    }
};



module.exports = StateFlow;