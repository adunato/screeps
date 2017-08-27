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

function logSpawing(){
    if(Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }
}

function spawn(roleName){
    var newName = Game.spawns['Spawn1'].createCreep(bodyParts[roleName], undefined, {role: roleName});
    console.log('Spawning new ' + roleName + ' : ' + newName);
}

function spawnCreeps() {
    console.log("spawnCreeps");
    console.log(defines.minSpawn);
    for (var roleName in defines.minSpawn) {
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
            if (creep.memory.role == role)
                modules[role].run(creep);
        }
    }
}

module.exports.loop = function () {
    //globals definition, every tick to refresh changes
    defines.initDefines();
    console.log("defines:" + defines);
    clearMemory();
    spawnCreeps();
    logSpawing();
    manageDefense();
    executeCreepBehaviour();
}