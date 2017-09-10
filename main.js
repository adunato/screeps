require('creep_extension');
require('structure_extension');
var cache = require('cache');
var defines = require('defines');
var Squad = require('Squad');
var SquadProfile = require('SquadProfile');
var screepsplus = require('screepsplus');
var squadsStructureTree = null;
var squadsIndex = {};
var printStats = false;
var printCPU = false;
var rooms = [];

function clearMemory() {
    for (var i in Memory.creeps) {
        if (!Game.creeps[i]) {
            console.log('clearMemory: ' + i);
            //reset squads index upon clearing memory
            squadsIndex = {};
            delete Memory.creeps[i];
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
        for (var i = 0; i < bodyParts[roleName].length; i++) {
            var bodyPart = bodyParts[roleName][i];
            // console.log('spawn - trying config: ' + bodyPart);
            if (Game.spawns['Spawn1'].canCreateCreep(bodyPart) === OK) {
                var result = Game.spawns['Spawn1'].createCreep(bodyPart, undefined, {role: roleName});
                console.log('Spawning new ' + roleName + ' with body: ' + bodyPart + ' - ' + result);
                return;
            }
        }

    }
}

function manageDefense() {
    for (var i = 0; i < rooms.length; i++) {
        var room = rooms[i];
        for (var i = 0; i < cache.findTowers(room).length; i++) {
            var tower = cache.findTowers(room)[i];
            var currenTowerEnergy = tower.energy;
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
            if(tower.energy < currenTowerEnergy){
                console.log('tower energy delta: ' + tower.energy - currenTowerEnergy);
            } else {
                console.log('tower energy: ' + tower.energy);
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
    for (var squadName in squadsIndex) {
        var squad = squadsIndex[squadName];
        if (squad.needCreep(creep)) {
            squad.addCreep(creep);
            creep.memory.squad = squad.getName();
            return squad;
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
        }
        else {
            if (squadsIndex[creep.memory.squad] && !squadsIndex[creep.memory.squad].hasCreep(creep))
                squadsIndex[creep.memory.squad].addCreep(creep);
        }
    }

    var spawnSet = false;
    for (var roleName in global.creepRoles) {
        for (var squadName in squadsIndex) {
            var squad = squadsIndex[squadName];
            // console.log(squadName + ' ' + squad.creeps.length);
            if (squad.needCreepRole(roleName)) {
                console.log(squadName + ' needs ' + roleName);
                if (!spawnSet) {
                    spawn(roleName);
                    spawnSet = true
                }
            }
        }
    }

}

function flagToSquadName(flagName) {
    return flagName.split('_')[0];
}

function isFlagSquad(flagName) {
    var squadName = flagToSquadName(flagName);
    for (var squadProfile in global.squadProfiles) {
        if (squadName.startsWith(squadProfile)) {
            return true;
        }
    }
    return false;
}

function createSquad(squadName) {
    return new Squad(new SquadProfile(squadName.substr(0, squadName.length - 1)), squadName);
}

function createSquads() {
    for (var flagName in Game.flags) {
        if (isFlagSquad(flagName)) {
            var squadName = flagToSquadName(flagName);
            if (!squadsIndex[squadName]) {
                squadsIndex[squadName] = createSquad(squadName);
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
        if (creep.memory.role === 'repairer') {
            if (creep.memory.lastTick && creep.memory.lastTick.carried_energy) {
                //add to counter if diff is -
                creep.memory.repaired_energy = creep.carry.energy - creep.memory.lastTick.carried_energy < 0 ? (creep.carry.energy - creep.memory.lastTick.carried_energy) * -1 : 0;
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

    //non-creep update

    if(!Memory.lastTick){
        console.log("init Memory.lastTick")
        Memory.lastTick = {};
    }

    //towers
    if(!Memory.lastTick.towers_energy){
        console.log("init Memory.lastTick.towers_energy")
        Memory.lastTick.towers_energy = {};
    }
    if(!Memory.lastTick.towers_energy_delta){
        console.log("init Memory.lastTick.towers_energy_delta")
        Memory.lastTick.towers_energy_delta = {};
    }
    for (var i = 0; i < rooms.length; i++) {
        var room = rooms[i];
        var towers = cache.findTowers(room);
        for (var i = 0; i < towers.length; i++) {
            var tower = towers[i];
            if(Memory.lastTick.towers_energy[tower.id]){
                Memory.lastTick.towers_energy_delta[tower.id] = Memory.lastTick.towers_energy[tower.id] - tower.energy > 0 ? Memory.lastTick.towers_energy[tower.id] - tower.energy : 0;
            } else{
                Memory.lastTick.towers_energy_delta[tower.id] = 0;
            }
            Memory.lastTick.towers_energy[tower.id] = tower.energy;
        }
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

function initRooms() {
    if (rooms.length === Game.spawns.length)
        return;
    rooms = [];
    for (var spawn in Game.spawns) {
        rooms.push(Game.spawns[spawn].room);
    }
}

module.exports.loop = function () {
    //globals definition, every tick to refresh changes
    resetCPULog();
    clearMemory();
    logCPU('clearMemory ');
    defines.initDefines();
    logCPU('initDefines ');
    cache.resetCache();
    initRooms();
    logCPU('initRooms ');
    createSquads();
    logCPU('createSquads ');
    assignCreepsToSquads();
    // Memory.squads = squadsIndex;
    logCPU('assignCreepsToSquads ');
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
    console.log("tick");
};