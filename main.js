require('creep_extension');
// require('role.nomad_harvester');
var cache = require('cache');
var defines = require('defines');


function NomadHarvester(creep) {
    this.base = Creep;
    this.base.memory = creep.memory;
}

NomadHarvester.prototype = Object.create(Creep.prototype);
NomadHarvester.prototype.constructor = NomadHarvester;

NomadHarvester.prototype.harvestEnergy = function () {
    this.say("I'm nomad!")
    var source = Game.getObjectById(this.memory.selectedSource);
    if (this.harvest(source) == ERR_NOT_IN_RANGE) {
        this.moveTo(source, {visualizePathStyle: {stroke: '#0027ff'}});
    }
};



function clearMemory(){
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}

function checkSpawn(roleName){
    var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
    console.log(roleName + "s :" + creeps.length + "/" + minSpawn[roleName])
    return creeps.length <  minSpawn[roleName];
}

function instanceCreep(creep){
    if(creep.memory.role === "nomad_harvester" && !(creep instanceof NomadHarvester)){
        var nomadHarvester = new NomadHarvester(creep);
        console.log("cloning" + creep.memory.role);
        delete Game.creeps[creep.name];
        Game.creeps[creep.name] = nomadHarvester;
        console.log("spawining nomad");
        console.log(nomadHarvester.memory);
        return nomadHarvester;
    } else
        return creep;
}

function logSpawing(){
    if(Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        spawningCreep = instanceCreep(spawningCreep);
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

module.exports.loop = function () {
    //globals definition, every tick to refresh changes
    defines.initDefines();
    cache.resetCache();
    clearMemory();
    spawnCreeps();
    logSpawing();
    // manageDefense();
    executeCreepBehaviour();
}