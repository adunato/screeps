var statemachine = require('state-machine');
var cache = require('cache');
var carrierFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {
            name: 'sourceFull',
            from: ['rest', 'withdraw_source', 'drop_destination', 'drop_storage'],
            to: 'withdraw_source'
        },
        {name: 'goToRoom', from: ['*'], to: 'rest'},
        {name: 'creepFull', from: ['go_home', 'rest', 'withdraw_source', 'drop_destination'], to: 'drop_destination'},
        {name: 'containersFull', from: ['go_home', 'drop_destination', 'rest', 'drop_storage'], to: 'drop_storage'},
        {name: 'timeToDie', from: ['go_home', 'rest', 'withdraw_source'], to: 'timeToDie'},
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
        onWithdrawSource: function () {
            var creep = Game.creeps[this.creepName];
            if(!creep.withdrawEnergyFromSourceContainer())
                creep.rest();
        },
        onRest: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
        },
        onDropDestination: function () {
            var creep = Game.creeps[this.creepName];
            if(!creep.dropToDestinationContainer())
                creep.rest();
        },
        onDropStorage: function () {
            var creep = Game.creeps[this.creepName];
            creep.dropToStorage();
        },
        onRest: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
        },
        onTimeToDie: function () {
            var creep = Game.creeps[this.creepName];
            creep.suicide_();
        },
        onTransition(lifecycle) {
            // console.log("transition name: " + lifecycle.transition);
            // console.log("transition from: " + lifecycle.from);
            // console.log("transition to: " + lifecycle.to);
        }
    }
});


var roleCarrier = {
    /** @param {Creep} creep **/
    run: function (creep) {
        if(!creep.getSquad())
            return;
        var creepState = creep.memory.state;
        var sourceContainers = cache.findSourceContainersWithEnergy(creep.getSquad().getSquadRoomName(), MIN_SOURCE_CONTAINER_QUANTITY_PC).length;
        sourceContainers += cache.findSourceLinksWithEnergy(creep.getSquad().getSquadRoomName(), MIN_SOURCE_CONTAINER_QUANTITY_PC).length;
        var destinationContainers = cache.findEmptyDestinationContainers(creep.getSquad().getSquadRoomName(), MAX_DESTINATION_CONTAINER_QUANTITY_PC).length;
        destinationContainers += cache.findEmptyDestinationLinks(creep.getSquad().getSquadRoomName(), MAX_DESTINATION_CONTAINER_QUANTITY_PC).length;
        // var storage = cache.findEmptyStorage(creep.room).length;
        var creepCarryEnergy = _.sum(creep.carry);
        // var creepCarryCapacity = creep.carryCapacity;

        if (typeof creepState === "undefined")
            creepState = "rest";
        var stateMachine = new carrierFSM(creep.name, "rest");
        stateMachine.goto(creepState);
        if (creep.timeToDie() && creepCarryEnergy === 0 && stateMachine.can("timeToDie")) {
            stateMachine.timeToDie();
        }
        if (!creep.isInSquadRoom() && creepCarryEnergy === 0 && stateMachine.can("goToRoom")) {
            stateMachine.goToRoom();
            return;
        }
        if (sourceContainers > 0 && stateMachine.can("sourceFull")) {
            stateMachine.sourceFull();
        }
        if (creepCarryEnergy > 0 && stateMachine.can("creepFull")) {
            stateMachine.creepFull();
        }
        if (destinationContainers === 0 && stateMachine.can("containersFull")) {
            stateMachine.containersFull();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleCarrier;