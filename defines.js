var defines = {

    initDefines: function () {
        minSpawn = {
            "harvester": 1,
            "builder": 1,
            "nomad_harvester": 0,
            "upgrader": 0
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