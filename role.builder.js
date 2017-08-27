var StateMachine = require('state-machine')
var builderFSM = new StateMachine.factory({
    init: 'withdraw',
    transitions: [
        { name: 'energyEmpty', from: 'build',  to: 'withdraw' },
        { name: 'energyFull', from: 'withdraw', to: 'build'  },
        { name: 'containersEmpty', from: 'withdraw', to: 'rest'  },
        { name: 'goto', from: '*', to: function(s) { return s } }
    ],
    data: function(creepName, initState) {
        return {
            creepName: creepName,
            initState: initState
        }
    },
    methods: {
        onWithdraw:     function() {
            var creep = Game.creeps[this.creepName];
            creep.withdrawEnergy();
        },
        onBuild:     function() {
            // var creep = Game.creeps[this.creepName];
            // creep.build();
        },
        onTransition: function(lifecycle) {
            console.log(lifecycle.transition); // 'step'
            console.log(lifecycle.from);       // 'A'
            console.log(lifecycle.to);         // 'B'
        }
    }
});

Creep.prototype.withdrawEnergy = function() {
    var containers = this.room.find(FIND_STRUCTURES, {
        filter: (container) => {
            // return (structure.structureType == STRUCTURE_CONTAINER) && structure.store < structure.storeCapacity;
            return (container.structureType == STRUCTURE_CONTAINER) && container.store.energy > 0;
        }

    });

    if(containers.length > 0) {
        if (this.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    } else {
        this.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
        this.say("Rest");
    }
};

Creep.prototype.build = function() {
    var targets = this.room.find(FIND_CONSTRUCTION_SITES);
    if(targets.length) {
        if(this.build(targets[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
    } else {
        this.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
        this.say("Rest");
    }
};


var roleBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var creepState = creep.memory.state;
            if(typeof creepState === "undefined")
                creepState = "withdraw";
        var stateMachine = new builderFSM(creep.name,"withdraw");
        console.log("before");
        stateMachine.goto(creepState);
        console.log("after");
        // console.log(creep.name);
        // builderFSM.setState(creep.memory.state);
        if(creep.carry.energy == 0 && stateMachine.is("build")){
            try {
                console.log("energyEmpty");
                stateMachine.energyEmpty();
            }
            catch(err){
                console.log("error: " + err);
            }
        }
        if(creep.carry.energy == creep.carryCapacity && stateMachine.is("withdraw")){
            try {
                console.log("energyFull");
                stateMachine.energyFull();
            }
            catch(err){
                console.log("error: " + err);
            }
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleBuilder;