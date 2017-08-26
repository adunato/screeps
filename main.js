var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleNomadHarvester = require('role.nomad_harvester');
var defines = require('defines');

function clearMemory(){
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}

function checkSpawn(roleName){
    var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log(roleName + "s :" + creeps.length + "/" + minSpawn[roleName])
    return creeps.length <  minSpawn[roleName];
}

function spawn(roleName){
    var newName = Game.spawns['Spawn1'].createCreep(bodyParts[roleName], undefined, {role: roleName});
    console.log('Spawning new ' + roleName + ' : ' + newName);
}

module.exports.loop = function () {
    //globals definition, every tick to refresh changes
    defines.initDefines();

    clearMemory();

    for(var roleName in minSpawn) {
        if(checkSpawn(roleName))
            spawn(roleName);
    }

    // var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    // console.log('Harvesters: ' + harvesters.length + "/" + minSpawn["harvester"]);
    //
    // var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    // console.log('Upgraders: ' + upgraders.length+ "/" + minSpawn["upgrader"]);
    //
    // var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    // console.log('Builders: ' + builders.length+ "/" + minSpawn["builder"]);
    //
    // var nomad_harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'nomad_harvester');
    // console.log('Nomad harvesters: ' + nomad_harvesters.length+ "/" + minSpawn["nomad_harvester"]);
    //
    // if(harvesters.length < MIN_HARVESTERS) {
    //     var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'harvester'});
    //     console.log('Spawning new harvester: ' + newName);
    // } else if (upgraders.length < MIN_UPGRADERS) {
    //     var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'upgrader'});
    //     console.log('Spawning new upgrader: ' + newName);
    // } else if (builders.length < MIN_BUILDERS) {
    //     var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'builder'});
    //     console.log('Spawning new builder: ' + newName);
    // } else if (nomad_harvesters.length < MIN_NOMAD_HARVESTERS) {
    //     var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'nomad_harvester'});
    //     console.log('Spawning new nomad harvester: ' + newName);
    // }

    if(Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }

    var tower = Game.getObjectById('TOWER_ID');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
    });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'nomad_harvester') {
            roleNomadHarvester.run(creep);
        }
    }
}