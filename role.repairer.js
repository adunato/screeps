var statemachine = require('state-machine');
var cache = require('cache');
var MIN_REPAIR_LVL_PC = 90;
var repairrFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'energyEmpty', from: '*', to: 'withdraw'},
        {name: 'energyFull', from: ['withdraw','rest'], to: 'repair'},
        {name: 'containersEmpty', from: ['withdraw', 'rest'], to: 'rest'},
        {name: 'noStructuresFound', from: ['repair'], to: 'rest'},
        {
            name: 'goto', from: '*', to: function (s) {
            return s
        }
        }
    ],
    data: function (creepName, initState) {
        return {
            creepName: creepName,
            initState: initState
        }
    },
    methods: {
        onWithdraw: function () {
            var creep = Game.creeps[this.creepName];
            creep.withdrawEnergy();
        },
        onRepair: function () {
            var creep = Game.creeps[this.creepName];
            creep.repairConstruction(MIN_REPAIR_LVL_PC);
        },
        onRest: function () {
            var creep = Game.creeps[this.creepName];
            creep.goHome();
        },
        //invoked as event to avoid state being invoked when loaded by the state machine
        onNoStructuresFound: function () {
            var creep = Game.creeps[this.creepName];
            creep.setNextWaypoint();
        },
        onTransition(lifecycle) {
            // console.log(this.creepName + " transition name: " + lifecycle.transition);
            // console.log(this.creepName + " transition from: " + lifecycle.from);
            // console.log(this.creepName + " transition to: " + lifecycle.to);
        }
    }
});


var rolerepairr = {
    /** @param {Creep} creep **/
    run: function (creep) {
        var creepState = creep.memory.state;
        if (typeof creepState === "undefined") {
            creepState = "withdraw";
        }
        var stateMachine = new repairrFSM(creep.name, "withdraw");
        stateMachine.goto(creepState);
        if (creep.carry.energy === 0) {
            stateMachine.energyEmpty();
        }
        if (cache.findContainersWithEnergy(creep.room).length === 0 && stateMachine.can("containersEmpty")) {
            stateMachine.containersEmpty();
        }
        if (cache.findRepairStructures(creep.room,MIN_REPAIR_LVL_PC).length === 0 && stateMachine.can("noStructuresFound")) {
            console.log("repairer " + creep.name + " no structures found to repair")
            creep.memory.repairConstructionId = null;
            stateMachine.noStructuresFound();
        }
        else if (creep.carry.energy > 0 && stateMachine.can("energyFull")) {
            stateMachine.energyFull();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = rolerepairr;