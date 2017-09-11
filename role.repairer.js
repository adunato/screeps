var statemachine = require('state-machine');
var cache = require('cache');
var MIN_REPAIR_LVL_PC = 80;
var repairrFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'energyEmpty', from: '*', to: 'withdraw'},
        {name: 'energyFull', from: ['withdraw','repair','waypoint', 'rest'], to: 'move'},
        {name: 'containersEmpty', from: ['withdraw', 'rest'], to: 'rest'},
        {name: 'noStructuresFound', from: ['repair', 'waypoint'], to: 'waypoint'},
        {name: 'atWaypoint', from: ['move', 'repair'], to: 'repair'},
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
        onMove: function () {
            var creep = Game.creeps[this.creepName];
            creep.goToWaypoint();
        },
        onRepair: function () {
            var creep = Game.creeps[this.creepName];
            creep.repairConstruction(MIN_REPAIR_LVL_PC);
        },
        onRest: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
        },
        //invoked as event to avoid state being invoked when loaded by the state machine
        onNoStructuresFound: function () {
            var creep = Game.creeps[this.creepName];
            creep.setNextWaypoint();
        },
        onTransition(lifecycle) {
            // console.log("transition name: " + lifecycle.transition);
            // console.log("transition from: " + lifecycle.from);
            // console.log("transition to: " + lifecycle.to);
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
        if(!creep.getCurrentWaypoint()){
            creep.setNextWaypoint();
        }
        var stateMachine = new repairrFSM(creep.name, "withdraw");
        stateMachine.goto(creepState);
        if (creep.carry.energy === 0) {
            stateMachine.energyEmpty();
        }
        if (cache.findContainersWithEnergy(creep.room).length === 0 && stateMachine.can("containersEmpty")) {
            stateMachine.containersEmpty();
        }
        if (creep.isInCurrentWaypointRange() && stateMachine.can("atWaypoint")) {
            stateMachine.atWaypoint();
        }
        else if (cache.findRepairStructures(creep.room,MIN_REPAIR_LVL_PC).length === 0 && stateMachine.can("noStructuresFound")) {
            stateMachine.noStructuresFound();
        }
        else if (creep.carry.energy > 0 && stateMachine.can("energyFull")) {
            stateMachine.energyFull();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = rolerepairr;