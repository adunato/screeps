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
        };
        modules = {
            "harvester": roleHarvester,
            "builder": roleBuilder,
            "nomad_harvester": roleNomadHarvester,
            "upgrader": roleUpgrader
        }
    }

}

module.exports = defines;