var statemachine = require('state-machine');
const CREEP_DAMAGE_LIMIT = 190;
var breacherFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'structure', from: ['attack', 'move', 'gohome'], to: 'attack'},
        {name: 'noStructure', from: ['move', 'attack', 'gohome'], to: 'move'},
        {name: 'damaged', from: ['attack', 'move', 'gohome'], to: 'gohome'},
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
        //invoked as events to avoid state being invoked when loaded by the state machine
        onAttack: function () {
            var creep = Game.creeps[this.creepName];
            creep.attackFlagPosition();
        },
        onMove: function () {
            var creep = Game.creeps[this.creepName];
            creep.travelToFlag();
            var i = 0;
        },
        onDamaged: function () {
            var creep = Game.creeps[this.creepName];
            creep.goHome();
        },
        onTransition(lifecycle) {
            // console.log("transition name: " + lifecycle.transition);
            // console.log("transition from: " + lifecycle.from);
            // console.log("transition to: " + lifecycle.to);
        }
    }
});


var rolebreacher = {
        /** @param {Creep} creep **/
        run: function (creep) {
            var creepState = creep.memory.state;
            if (!creepState) {
                creepState = 'move'
            }
            var stateMachine = new breacherFSM(creep.name, creepState);
            stateMachine.goto(creepState);

            if (creep.hits < CREEP_DAMAGE_LIMIT) {
                stateMachine.damaged();
                creep.memory.state = stateMachine.state;
                return;
            }

            if (creep.getSquad()) {
                var flag = creep.getSquad().getFlag();
                if (flag) {
                    const look = creep.room.lookAt(flag);
                    look.forEach(function (lookObject) {
                        if (lookObject.type == LOOK_STRUCTURES && stateMachine.can("structure")) {
                            stateMachine.structure();
                            creep.memory.state = stateMachine.state;
                        } else if (stateMachine.can("noStructure")) {
                            stateMachine.noStructure();
                            creep.memory.state = stateMachine.state;
                        }
                    });
                }
            }
        }
    }
;

module.exports = rolebreacher;