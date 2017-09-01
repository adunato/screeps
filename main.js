require('creep_extension');
var cache = require('cache');
var defines = require('defines');
var Squad = require('Squad');
var SquadProfile = require('SquadProfile');

function clearMemory() {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}

function checkSpawn(roleName) {
    var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
    console.log(roleName + "s :" + creeps.length + "/" + minSpawn[roleName])
    return creeps.length < minSpawn[roleName];
}

function logSpawing() {
    if (Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }
}

function spawn(roleName) {
    var newName = Game.spawns['Spawn1'].createCreep(bodyParts[roleName], undefined, {role: roleName});
    console.log('Spawning new ' + roleName + ' : ' + newName);
}

function spawnCreeps() {
    for (var roleName in global.minSpawn) {
        if (checkSpawn(roleName)) {
            spawn(roleName);
            return;
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
        for (var role in modules) {
            if (creep.memory.role == role) {
                modules[role].run(creep);
            }
        }
    }
}

function assignCreepToSquad(creep) {
    //iterate squad roles
    for (var squadRole in global.squads) {
        //iterate squads
        for (var i = 0; i < global.squads[squadRole].length; i++) {
            var squad = global.squads[squadRole][i];
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
        }
    }
}

function checkSquadFromFlag(role, flagName) {
    if (flagName.startsWith(role)) {
        var flagID = flagName;
        flagID.replace(role, "");
        if (!global.squads) {
            global.squads = {};
        }
        if (!global.squads[role]) {
            global.squads[role] = new Array();
            return true;
        }
        else if (global.squads[role].length < flagID) {
            return true;
        } else {
            return false
        }
    }
}

function createSquad(squadRole, squadName) {
    console.log("creating squad: " + squadRole + " " + squadName);
    return new Squad(new SquadProfile(squadRole), squadName);
}

function createSquads() {
    for (var flagName in Game.flags) {
        for (var squadRole in global.squadProfiles) {
            if (checkSquadFromFlag(squadRole, flagName)) {
                var squad = createSquad(squadRole, flagName);
                console.log("creating squad: " + squad.getName());
                console.log(global.squads[squadRole]);
                global.squads[squadRole].push(squad);
            }
        }
    }
    Memory.squads = global.squads;
}

module.exports.loop = function () {
    //globals definition, every tick to refresh changes
    defines.initDefines();
    cache.resetCache();
    clearMemory();
    spawnCreeps();
    createSquads();
    assignCreepsToSquads();
    logSpawing();
    // manageDefense();
    executeCreepBehaviour();
}