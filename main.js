require('creep_extension');
var cache = require('cache');
var defines = require('defines');
var Squad = require('Squad');
var SquadProfile = require('SquadProfile');
var screepsplus = require('screepsplus');
var squads = null;
var printStats = false;

function clearMemory() {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            console.log('about to clearMemory');
            if(Memory.creeps[name]) {
                console.log('clearing: ' + name);
                delete Memory.creeps[name]
            }
        }
    }
}

function initSquads() {
    //create squads based on profile configuration
    if (!squads) {
        squads = {};
        for (var profileName in global.squadProfiles) {
            squads[profileName] = new Array();
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
                if (squad.needCreepRole(roleName))
                    spawn(roleName);
            }
        }
    }

}

function manageDefense() {
    var tower = Game.getObjectById('TOWER_ID');
    if (tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            tower.attack(closestHostile);
        }
    }
}

function executeCreepBehaviour() {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        Memory.test = creep;
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
                console.log("Assigning " + creep.name + " to squad " + squad.getName());
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
    Memory.squads = squads;
}

function checkSquadFromFlag(role, flagName) {
    if (flagName.startsWith(role)) {
        var flagID = flagName;
        flagID = flagID.replace(role, "");
        if (squads[role].length < flagID) {
            return true;
        } else {
            return false
        }
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


module.exports.loop = function () {
    //globals definition, every tick to refresh changes
    defines.initDefines();
    cache.resetCache();
    initSquads();
    // clearMemory();
    createSquads();
    assignCreepsToSquads();
    spawnCreeps();
    logSpawing();
    // manageDefense();
    executeCreepBehaviour();
    Memory.stats = null;
    screepsplus.collect_stats();
}