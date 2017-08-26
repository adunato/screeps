var defines = {

    initDefines: function () {
        minSpawn = {
            "harvester": 7,
            "builder": 2,
            "nomad_harvester": 5,
            "upgrader": 2
        };
        bodyParts = {
            "harvester": [WORK,CARRY,MOVE],
            "builder": [WORK,CARRY,MOVE],
            "nomad_harvester": [WORK,CARRY,MOVE],
            "upgrader": [WORK,CARRY,MOVE]
        }
        MIN_UPGRADERS = 2;
        MIN_BUILDERS = 3;
        MIN_HARVESTERS = 7;
        MIN_NOMAD_HARVESTERS = 5;
    }

}

module.exports = defines;