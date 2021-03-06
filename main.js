require('creep_extension');
require('structure_extension');
const profiler = require('screeps-profiler');
var cache = require('cache');
var defines = require('defines');
var Squad = require('Squad');
var squadprofile = require('SquadProfile');
var screepsplus = require('screepsplus');
var squadsStructureTree = null;
global.squadsIndex = {};
var printStats = false;
var printCPU = false;
var rooms = [];
var spawnSlots = {};
var disabledSpawns = [];
const MAX_SPAWN_DISTANCE = 1;

function clearMemory() {
    for (var i in Memory.creeps) {
        if (!Game.creeps[i]) {
            console.log('clearMemory: ' + i);
            //reset squads index upon clearing memory
            global.squadsIndex = {};
            delete Memory.creeps[i];
        }
    }
    for (var i in Memory.flags) {
        if (!Game.flags[i]) {
            console.log('clearMemory: ' + i);
            global.squadsIndex = {};
            delete Memory.flags[i];
        }
    }
}

function logSpawing() {
    for (var spawnName in Game.spawns) {
        var spawn = Game.spawns[spawnName];
        if (spawn && spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            console.log(spawn.name + " spawning " + spawningCreep.memory.role + " for " + spawningCreep.memory.squad);
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8});
        }
    }
}

function spawn(roleName, squad) {
    var selectedSpawn = null;
    var minDistance = 1000;
    for (var spawnName in Game.spawns) {
        if (_.contains(disabledSpawns, spawnName)) {
            continue;
        }
        if (squad.getSpawn()) {
            selectedSpawn = Game.spawns[squad.getSpawn()];
            break;
        }
        var spawn = Game.spawns[spawnName];
        var squadFlag = Game.flags[squad.getFlagName()]
        if (squadFlag) {
            var distance = Game.map.getRoomLinearDistance(spawn.room.name, squadFlag.pos.roomName);
            if (distance < minDistance && distance <= MAX_SPAWN_DISTANCE) {
                if(spawn.spawning !== null ) {
                    var spawningCreep = Game.creeps[spawn.spawning.name];
                    if(spawningCreep.memory.squad === squad.getName() && spawningCreep.memory.role === roleName){
                        selectedSpawn = spawn;
                        break;
                    } else
                        continue;
                } else {
                    selectedSpawn = spawn;
                    minDistance = distance;
                }
            }
        }
    }
    if (selectedSpawn) {
        spawnCreep(selectedSpawn,roleName,squad);
    }
}

function spawnCreep(selectedSpawn, roleName, squad){
    for (var i = 0; i < bodyParts[roleName].length; i++) {
        var bodyPart = bodyParts[roleName][i];
        var canCreateCreep = selectedSpawn.canCreateCreep(bodyPart);
        // console.log(roleName + " res: " + canCreateCreep);
        if (canCreateCreep === OK) {
            var result = selectedSpawn.createCreep(bodyPart, undefined, {
                role: roleName,
                spawnRoom: selectedSpawn.room.name,
                squad: squad.getName()
            });
            console.log(selectedSpawn.name + ': Spawning new ' + roleName + ' with body: ' + bodyPart + ' - ' + result);
            var spawningCreep = Game.creeps[result];
            console.log("spawningCreep.memory " + spawningCreep.memory.role);
            if(spawningCreep) {
                squad.addCreep(spawningCreep);
            }
            return;
        }
    }
}

function findInjuredCreeps(tower) {
    var creepsInRoom = cache.findCreeps(tower.room);
    var injuredCreeps = [];
    // console.log("tower id:" + tower.id)
    for (var x = 0; x < creepsInRoom.length; x++) {
        var creep = creepsInRoom[x];
        if (creep.hits < creep.hitsMax) {
            injuredCreeps.push(creep)
        }
    }
    return injuredCreeps;
}

function manageDefense() {
    for (var i = 0; i < rooms.length; i++) {
        var room = rooms[i];
        var towers = cache.findTowers(room);
        for (var n = 0; n < towers.length; n++) {
            var tower = towers[n];
            if (cache.findHostileCreeps(room).length > 0) {
                tower.attack(tower.pos.findClosestByRange(cache.findHostileCreeps(room)));
            } else if (tower.energy > tower.energyCapacity / 2) {
                var injuredCreeps = findInjuredCreeps(tower);
                if (injuredCreeps.length > 0) {
                    tower.heal(injuredCreeps[0]);
                }
                else if (cache.findRepairRamparts(room).length > 0) {
                    var closestDamagedRampart = cache.findRepairRamparts(room);
                    tower.repair(closestDamagedRampart[0]);
                } else if (cache.findRepairWalls(room).length > 0) {
                    var closestDamagedWall = cache.findRepairWalls(room);
                    if (closestDamagedWall.length > 0) {
                        tower.repair(closestDamagedWall[0]);
                    }
                } else {
                    var repairStructures = cache.findRepairStructures(room, 100);
                    if (repairStructures.length > 0) {
                        tower.repair(repairStructures[0]);
                    }
                }
            }
        }
    }

    for (var y = 0; y < rooms.length; y++) {
        var room = rooms[y];
        if (cache.findHostileCreeps(room).length > 0) {
            // room.controller.activateSafeMode();
            console.log("room " + room.name + " found enemies");
        }
    }
}

function executeCreepBehaviour() {
    var CPUdata = {};
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creepRoles[creep.memory.role])
            creepRoles[creep.memory.role].run(creep);
        else {
            console.log("no data for role: " + creepRoles[creep.memory.role] + " for creep " + creep.name)
        }
        if(printCPU) {
            if (!CPUdata[creep.memory.role]) {
                CPUdata[creep.memory.role] = [];
            }
            CPUdata[creep.memory.role].push(getCPUDelta()[1]);
        }
    }
    if(printCPU) {
        for (var key in CPUdata) {
            var total = 0;
            for (var i = 0; i < CPUdata[key].length; i++) {
                total += CPUdata[key][i];
            }
            var avg = total / CPUdata[key].length;
            console.log("executeCreepBehaviour - " + key + " " + avg);
        }
    }
}

function assignCreepToSquad(creep) {
    for (var squadName in global.squadsIndex) {
        var squad = global.squadsIndex[squadName];
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
            if (global.squadsIndex[creep.memory.squad] && !global.squadsIndex[creep.memory.squad].hasCreep(creep))
                global.squadsIndex[creep.memory.squad].addCreep(creep);
        }
    }

    //reset spawnsSlots before every tick
    spawnSlots = {};
    for (var roleName in global.creepRoles) {
        for (var squadName in global.squadsIndex) {
            var squad = global.squadsIndex[squadName];
            if (squad.needCreepRole(roleName)) {
                console.log(squad.getSquadRoomName() + ": " + squadName + ' needs ' + roleName);
                spawn(roleName, squad);
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

function createSquad(squadName, flagName) {
    var firstDigit = squadName.match(/\d/);
    var firstDigitIndex = squadName.indexOf(firstDigit);
    return new Squad(new squadprofile.SquadProfile(squadName.substr(0, firstDigitIndex)), squadName, flagName);
}

function createSquads() {
    for (var flagName in Game.flags) {
        if (isFlagSquad(flagName)) {
            var squadName = flagToSquadName(flagName);
            if (!global.squadsIndex[squadName]) {
                global.squadsIndex[squadName] = createSquad(squadName, flagName);
            }
        }
    }
}


function trackTickChanges() {

    if (!Memory.custom_stats) {
        Memory.custom_stats = {};
    }

    if (!Memory.custom_stats.rooms) {
        Memory.custom_stats.rooms = {};
    }

    if (!Memory.lastTick) {
        Memory.lastTick = {};
    }

    if (!Memory.lastTick.rooms) {
        Memory.lastTick.rooms = {};
    }

    for (var roomName in Game.rooms) {
        if (!Memory.custom_stats.rooms[roomName]) {
            Memory.custom_stats.rooms[roomName] = {};
        }
        if (!Memory.lastTick.rooms[roomName]) {
            Memory.lastTick.rooms[roomName] = {};
        }
        if (!Memory.lastTick.rooms[roomName].towers) {
            Memory.lastTick.rooms[roomName].towers = {};
        }
    }

    for (var creepName in Game.creeps) {
        var creep = Game.creeps[creepName];
        if (!creep.memory.lastTick)
            creep.memory.lastTick = {};
        //harvesters
        if (creep.memory.role === 'harvester') {
            if (creep.memory.lastTick && creep.memory.lastTick.carried_energy) {
                //add to counter if diff is +
                var creep_harvested_energy = creep.carry.energy - creep.memory.lastTick.carried_energy > 0 ? creep.carry.energy - creep.memory.lastTick.carried_energy : 0;
                Memory.custom_stats.rooms[creep.room.name].harvested_energy += creep_harvested_energy;
            }
        }
        if (creep.memory.role === 'upgrader') {
            if (creep.memory.lastTick && creep.memory.lastTick.carried_energy) {
                //add to counter if diff is -
                var creep_upgraded_energy = creep.carry.energy - creep.memory.lastTick.carried_energy < 0 ? (creep.carry.energy - creep.memory.lastTick.carried_energy) * -1 : 0;
                Memory.custom_stats.rooms[creep.room.name].upgraded_energy += creep_upgraded_energy;
            }
        }
        if (creep.memory.role === 'repairer') {
            if (creep.memory.lastTick && creep.memory.lastTick.carried_energy) {
                //add to counter if diff is -
                var creep_repaired_energy = creep.carry.energy - creep.memory.lastTick.carried_energy < 0 ? (creep.carry.energy - creep.memory.lastTick.carried_energy) * -1 : 0;
                Memory.custom_stats.rooms[creep.room.name].repaired_energy += creep_repaired_energy;
            }
        }
        if (creep.memory.role === 'builder') {
            if (creep.memory.lastTick && creep.memory.lastTick.carried_energy) {
                //add to counter if diff is -
                var creep_built_energy = creep.carry.energy - creep.memory.lastTick.carried_energy < 0 ? (creep.carry.energy - creep.memory.lastTick.carried_energy) * -1 : 0;
                Memory.custom_stats.rooms[creep.room.name].built_energy += creep_built_energy;
            }
        }
        creep.memory.lastTick.carried_energy = creep.carry.energy;

        if (creep.memory.state === "rest") {
            if (creep.memory.restTime) {
                creep.memory.restTime += 1;
            } else {
                creep.memory.restTime = 1;
            }
        }
    }

    //non-creep update

    for (var i = 0; i < rooms.length; i++) {
        var room = rooms[i];
        var towers = cache.findTowers(room);
        for (var n = 0; n < towers.length; n++) {
            var tower = towers[n];
            let delta = 0
            if (Memory.lastTick.rooms[room.name].towers[tower.id]) {
                delta = Memory.lastTick.rooms[room.name].towers[tower.id].energy - tower.energy;
                delta = delta > 0 ? delta : 0;
            }
            if (!Memory.lastTick.rooms[room.name].towers[tower.id]) {
                Memory.lastTick.rooms[room.name].towers[tower.id] = {};
            }
            Memory.lastTick.rooms[room.name].towers[tower.id].energy = tower.energy;
            Memory.custom_stats.rooms[room.name].towers_consumed_energy += delta;
        }
        //spawn energy
        room.energyAvailable;
        if (Memory.lastTick.rooms[room.name].energy_available) {
            var delta = (Memory.lastTick.rooms[room.name].energy_available - room.energyAvailable);
            delta = delta > 0 ? delta : 0;
            Memory.custom_stats.rooms[room.name].spawn_consumed_energy += delta;
        }
        Memory.lastTick.rooms[room.name].energy_available = room.energyAvailable;

    }


}

function resetCPULog() {
    if (printCPU) {
        global.CPUcounter = Game.cpu.getUsed();
        console.log("CPU reset: " + global.CPUcounter);
    }
}

function getCPUDelta(){
    var currentCPU = Game.cpu.getUsed();
    var delta = currentCPU - global.CPUcounter;
    global.CPUcounter = currentCPU;
    return [global.CPUcounter,delta];
}

function logCPU(message) {
    var data = getCPUDelta();
    if (printCPU) {
        console.log(message + ": " + data[1] + " - total: " + data[0]);
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

function initFlags() {
    for (var flagName in Game.flags) {
        var flag = Game.flags[flagName];
        if (!flag.memory.pinnedToFlag) {
            flag.memory.pinnedToFlag = false;
        }
        if (!flag.memory.spawn) {
            flag.memory.spawn = null;
        }
    }
}

function buildAutoConstructions() {
    // var room = Game.rooms['E59N3']
    // room.createConstructionSite(31,30,STRUCTURE_EXTENSION);
    // room.createConstructionSite(31,32,STRUCTURE_EXTENSION);
    // room.createConstructionSite(29,32,STRUCTURE_EXTENSION);
    // room.createConstructionSite(25,32,STRUCTURE_EXTENSION);
    // room.createConstructionSite(32,27,STRUCTURE_EXTENSION);
    // room.createConstructionSite(31,26,STRUCTURE_EXTENSION);
    // room.createConstructionSite(29,26,STRUCTURE_EXTENSION);
    // room.createConstructionSite(25,27,STRUCTURE_EXTENSION);
    // room.createConstructionSite(24,28,STRUCTURE_EXTENSION);
    // room.createConstructionSite(24,30,STRUCTURE_EXTENSION);
    // var room2 = Game.rooms['E58N3']
    // room2.createConstructionSite(12,26,STRUCTURE_EXTENSION);
    // room2.createConstructionSite(14,26,STRUCTURE_EXTENSION);
    // room2.createConstructionSite(16,26,STRUCTURE_EXTENSION);
    // room2.createConstructionSite(16,24,STRUCTURE_EXTENSION);
    // room2.createConstructionSite(16,22,STRUCTURE_EXTENSION);
    // room2.createConstructionSite(16,20,STRUCTURE_EXTENSION);
    // room2.createConstructionSite(14,20,STRUCTURE_EXTENSION);
    // room2.createConstructionSite(12,20,STRUCTURE_EXTENSION);
    // room2.createConstructionSite(11,21,STRUCTURE_EXTENSION);
    // room2.createConstructionSite(10,23,STRUCTURE_EXTENSION);
}

function transferLinks() {
    for (var roomName in global.linkTransfers) {
        var source = Game.getObjectById(global.linkTransfers[roomName][0]);
        var destination = Game.getObjectById(global.linkTransfers[roomName][1]);

        if (source.energy === source.energyCapacity) {
            source.transferEnergy(destination);
        }
    }
}
profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function() {
    //globals definition, every tick to refresh changes
    resetCPULog();
    clearMemory();
    logCPU('clearMemory ');
    defines.initDefines();
    logCPU('initDefines ');
    cache.resetCache();
    initRooms();
    logCPU('initRooms ');
    initFlags();
    logCPU('initFlags ');
    createSquads();
    logCPU('createSquads ');
    assignCreepsToSquads();
    // Memory.squads = global.squadsIndex;
    logCPU('assignCreepsToSquads ');
    logSpawing();
    logCPU('logSpawing ');
    manageDefense();
    logCPU('manageDefense ');
    executeCreepBehaviour();
    logCPU('executeCreepBehaviour ');
    transferLinks();
    logCPU('transferLinks ');
    trackTickChanges();
    logCPU('trackTickChanges ');
    buildAutoConstructions();
    logCPU('buildAutoConstructions ');
    screepsplus.collect_stats();
    logCPU('collect_stats ');
    logTotalCPU();
    console.log("tick");
    });
}