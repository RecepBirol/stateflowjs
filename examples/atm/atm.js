const StateFlow = require('../../src/StateFlow');

const Atm = new StateFlow({
    name: "Atm",
    intialstate: "uninitialized",
    states: {
        "uninitialized": {
            onEnter: function () {
                this.handle("initialize");
            },
            "initialize": function (pl) {
                // TODO: any other init work here...
                this.acct = null;
                this.balance = 15;
                this.emit("initialized");
                this.transition("unauthorized");
            }
        },

        "unauthorized": {
            onEnter: function () {
                this.emit("unauthorized", { msg: "please enter your account and PIN" });
            },
            authorize: function (credentials) {
                if (credentials.acct === "x" && credentials.pin === "x") {
                    this.acct = "x";
                    this.transition("authorized");
                } else {
                    this.emit("unauthorized", { msg: "invalid credentials" });
                }
            }
        },

        "authorized": {
            onEnter: function () {
                this.emit("authorized", { acct: this.acct });
            },
            deposit: function (amount) {
                this.balance += amount;
                this.emit("result", { result: "success", balance: this.balance });
            },
            withdrawal: function (amount) {
                if (this.balance - amount > -1) {
                    this.balance -= amount;
                    this.emit("result", { result: "success", balance: this.balance });
                } else {
                    this.emit("result", { result: "insufficient balance", balance: this.balance });
                }
            },
            deauthorize: function () {
                this.acct = null;
                this.transition("unauthorized");
            }
        }
    }
});

Atm.on("initialized", () => {
    console.log("Atm initialized");
});

Atm.on("unauthorized", (o) => {
    console.log("ATM unauthorized! " + o.msg);
    Atm.handle("authorize", { acct: 'x', pin: 'x' });
});

Atm.on("authorized", (o) => {
    console.log("Authorized acct: " + o.acct);
});

Atm.on("started", function() {
    console.log("started");
});


Atm.start();

module.exports = Atm;