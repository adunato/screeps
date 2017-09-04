require('creep_extension');
var cache = require('cache');
var defines = require('defines');
var Squad = require('Squad');
var SquadProfile = require('SquadProfile');
var screepsplus = require('screepsplus');
var squads = null;
var printStats = false;

function clearMemory() {
    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            console.log('clearMemory: ' + i);
            delete Memory.creeps[i];
        }
    }
}

function initSquads() {
    //create squads based on profile configuration
    if (!squads) {
        squads = {};
        for (var profileName in global.squadProfiles) {
            squads[profileName] = [];
        }
    }
}

function logSpawing() {
    var spawn = Game.spawns['Spawn1'];
    if (spawn && Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }
}

function spawn(roleName) {
    var spawn = Game.spawns['Spawn1'];
    if (spawn) {
        var newName = Game.spawns['Spawn1'].createCreep(bodyParts[roleName], undefined, {role: roleName});
        console.log('Spawning new ' + roleName + ' : ' + newName);
    }
}

function spawnCreeps() {

    for (var profileName in global.squadProfiles) {
        for (var i = 0; i < squads[profileName].length; i++) {
            var squad = squads[profileName][i];
            for (var roleName in global.creepRoles) {
                if (squad.needCreepRole(roleName)) {
                    spawn(roleName);
                    return;
                }
            }
        }
    }

}

function manageDefense() {
    var tower = Game.getObjectById('59ac621b09fb1f796231d101');
    var room = Game.rooms[tower.pos.roomName];
    if (tower) {
        // var closestHostile = cache.findRepairWalls(room);
        // if (closestHostile) {
        //     tower.attack(closestHostile);
        //     return;
        // }
        var closestDamagedStructure = cache.findRepairWalls(room);
        if (closestDamagedStructure.length > 0) {
            tower.repair(closestDamagedStructure[0]);

        }

    }

    var res = Game.rooms[tower.pos.roomName].controller.activateSafeMode();
    console.log(res);
}

function executeCreepBehaviour() {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        for (var role in creepRoles) {
            if (creep.memory.role == role) {
                creepRoles[role].run(creep);
            }
        }
    }
}

function assignCreepToSquad(creep) {
    //iterate squad roles
    for (var squadRole in squads) {
        //iterate squads
        for (var i = 0; i < squads[squadRole].length; i++) {
            var squad = squads[squadRole][i];
            if (squad.needCreep(creep)) {
                squad.addCreep(creep);
                creep.memory.squad = squad.getName();
                return squad;
            }
        }
    }
}

function assignCreepsToSquads() {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (!creep.memory.squad) {
            var squad = assignCreepToSquad(creep);
            if (squad) {
                console.log("Assigning " + creep.name + " to squad  " + squad.getName());
            }
        } else {
            for (var squadRole in squads) {
                var squadRoles = squads[squadRole];
                for (var n = 0; n < squadRoles.length; n++) {
                    if (squadRoles[n].getName() === creep.memory.squad && !squadRoles[n].hasCreep(creep)) {
                        squadRoles[n].addCreep(creep);
                    }
                }
            }
        }
    }
}

function checkSquadFromFlag(role, flagName) {
    if (flagName.startsWith(role)) {
        var squadExist = false;
        for(var i = 0; i < squads.length; i++){
            if(squads[i].getName() === flagName)
                squadExist = true;
        }
        return !squadExist;
    }
}

function createSquad(squadRole, squadName) {
    return new Squad(new SquadProfile(squadRole), squadName);
}

function createSquads() {
    for (var flagName in Game.flags) {
        for (var squadRole in global.squadProfiles) {
            if (checkSquadFromFlag(squadRole, flagName)) {
                var squad = createSquad(squadRole, flagName);
                squads[squadRole].push(squad);
            }
        }
    }
}


function trackTickChanges() {
    for(var creepName in Game.creeps) {
        var creep = Game.creeps[creepName];
        //harvesters
        if(creep.memory.role === 'harvester') {
            if (creep.memory.lastTick && creep.memory.lastTick.carried_energy) {
                //add to counter if diff is +
                creep.memory.harvested_energy = creep.carry.energy - creep.memory.lastTick.carried_energy > 0 ? creep.carry.energy - creep.memory.lastTick.carried_energy : 0;
            }
        }
        if(creep.memory.role === 'upgrader') {
            if (creep.memory.lastTick && creep.memory.lastTick.carried_energy) {
                //add to counter if diff is -
                creep.memory.upgraded_energy = creep.carry.energy - creep.memory.lastTick.carried_energy < 0 ? (creep.carry.energy - creep.memory.lastTick.carried_energy) * -1 : 0;
            }
        }
        if(creep.memory.role === 'builder') {
            if (creep.memory.lastTick && creep.memory.lastTick.carried_energy) {
                //add to counter if diff is -
                creep.memory.built_energy = creep.carry.energy - creep.memory.lastTick.carried_energy < 0 ? (creep.carry.energy - creep.memory.lastTick.carried_energy) * -1 : 0;
            }
        }
        //update lastTick
        creep.memory.lastTick = {};
        creep.memory.lastTick.carried_energy = creep.carry.energy;
    }
}

module.exports.loop = function () {
    //globals definition, every tick to refresh changes
    var startCpu = Game.getUsedCpu();
    clearMemory();
    console.log( 'clearMemory ' + Game.getUsedCpu() - startCpu ); // 0.2
    defines.initDefines();
    console.log( 'initDefines ' + Game.getUsedCpu() - startCpu ); // 0.2
    cache.resetCache();
    console.log( 'resetCache ' + Game.getUsedCpu() - startCpu ); // 0.2
    initSquads();
    console.log( 'initSquads ' + Game.getUsedCpu() - startCpu ); // 0.2
    createSquads();
    console.log( 'createSquads ' + Game.getUsedCpu() - startCpu ); // 0.2
    assignCreepsToSquads();
    console.log( 'assignCreepsToSquads ' + Game.getUsedCpu() - startCpu ); // 0.2
    spawnCreeps();
    console.log( 'spawnCreeps ' + Game.getUsedCpu() - startCpu ); // 0.2
    logSpawing();
    console.log( 'logSpawing ' + Game.getUsedCpu() - startCpu ); // 0.2
    manageDefense();
    console.log( 'manageDefense ' + Game.getUsedCpu() - startCpu ); // 0.2
    executeCreepBehaviour();
    console.log( 'executeCreepBehaviour ' + Game.getUsedCpu() - startCpu ); // 0.2
    trackTickChanges();
    console.log( 'trackTickChanges ' + Game.getUsedCpu() - startCpu ); // 0.2
    screepsplus.collect_stats();
    console.log( 'collect_stats ' + Game.getUsedCpu() - startCpu ); // 0.2
    // Memory.squads = squads;
    console.log("tick");
};