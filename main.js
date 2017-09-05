require('creep_extension');
require('screeps-perf')({
    speedUpArrayFunctions: true,
    cleanUpCreepMemory: true,
    optimizePathFinding: false
});
var cache = require('cache');
var defines = require('defines');
var Squad = require('Squad');
var SquadProfile = require('SquadProfile');
var screepsplus = require('screepsplus');
var squads = null;
var printStats = false;
var printCPU = false;

function clearMemory() {
    for (var i in Memory.creeps) {
        if (!Game.creeps[i]) {
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

        for(var i = 0; i < bodyParts[roleName].length; i ++){
            var bodyPart = bodyParts[roleName][i];
            // console.log('spawn - trying config: ' + bodyPart);
            if(Game.spawns['Spawn1'].canCreateCreep(bodyPart) === OK) {
                var result = Game.spawns['Spawn1'].createCreep(bodyPart, undefined, {role: roleName});
                console.log('Spawning new ' + roleName + ' with body: ' + bodyPart + ' - ' + result);
                return;
            }
        }

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
    var tower = Game.getObjectById('59ae431f754f653601b3b5b7');
    if (tower) {
        var room = Game.rooms[tower.pos.roomName];
        if (room.find(FIND_HOSTILE_CREEPS).length > 0) {
            tower.attack(tower.pos.findClosestByRange(room.find(FIND_HOSTILE_CREEPS)));
        } else if (tower.energy > tower.energyCapacity / 2) {
            var closestDamagedRampart = cache.findRepairRamparts(room);
            if (closestDamagedRampart.length > 0) {
                tower.repair(closestDamagedRampart[0]);
            } else {
                var closestDamagedWall = cache.findRepairWalls(room);
                if (closestDamagedWall.length > 0) {
                    tower.repair(closestDamagedWall[0]);
                }
            }
        }
    }

    // var res = Game.rooms[tower.pos.roomName].controller.activateSafeMode();
    // console.log(res);
}

function executeCreepBehaviour() {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        for (var role in creepRoles) {
            if (creep.memory.role == role) {
                creepRoles[role].run(creep);
                // logCPU("executeCreepBehaviour - " + role)
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
        for (var i = 0; i < squads.length; i++) {
            if (squads[i].getName() === flagName)
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
    for (var creepName in Game.creeps) {
        var creep = Game.creeps[creepName];
        //harvesters
        if (creep.memory.role === 'harvester') {
            if (creep.memory.lastTick && creep.memory.lastTick.carried_energy) {
                //add to counter if diff is +
                creep.memory.harvested_energy = creep.carry.energy - creep.memory.lastTick.carried_energy > 0 ? creep.carry.energy - creep.memory.lastTick.carried_energy : 0;
            }
        }
        if (creep.memory.role === 'upgrader') {
            if (creep.memory.lastTick && creep.memory.lastTick.carried_energy) {
                //add to counter if diff is -
                creep.memory.upgraded_energy = creep.carry.energy - creep.memory.lastTick.carried_energy < 0 ? (creep.carry.energy - creep.memory.lastTick.carried_energy) * -1 : 0;
            }
        }
        if (creep.memory.role === 'builder') {
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

function resetCPULog() {
    if (printCPU) {
        global.CPUcounter = Game.cpu.getUsed();
        console.log("CPU reset: " + global.CPUcounter);
    }
}

function logCPU(message) {
    if (printCPU) {
        var currentCPU = Game.cpu.getUsed();
        var delta = currentCPU - global.CPUcounter;
        global.CPUcounter = currentCPU;
        console.log(message + ": " + delta + " - total: " + currentCPU);
    }
}

function logTotalCPU() {
    if (printCPU) {
        console.log('total CPU: ' + Game.cpu.getUsed());
    }
}

module.exports.loop = function () {
    //globals definition, every tick to refresh changes
    resetCPULog();
    // clearMemory();
    logCPU('clearMemory ');
     defines.initDefines();
    logCPU('initDefines ');
    cache.resetCache();
    // logCPU( 'resetCache ');
    initSquads();
    logCPU('initSquads ');
    createSquads();
    logCPU('createSquads ');
    assignCreepsToSquads();
    logCPU('assignCreepsToSquads ');
    spawnCreeps();
    logCPU('spawnCreeps ');
    logSpawing();
    logCPU('logSpawing ');
    manageDefense();
    // logCPU( 'manageDefense ');
    executeCreepBehaviour();
    logCPU('executeCreepBehaviour ');
    trackTickChanges();
    logCPU('trackTickChanges ');
     screepsplus.collect_stats();
    logCPU('collect_stats ');
    logTotalCPU();
    // Memory.squads = squads;
    console.log("tick");
};