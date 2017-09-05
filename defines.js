var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWall_repairer = require('role.wall_repairer');
var roleCarrier = require('role.carrier');
var roleCollector = require('role.collector');
var roleFeeder = require('role.feeder');
var roleTowerFeeder = require('role.tower_feeder');
var roleDefender = require('role.defender');
var roleTransporter = require('role.transporter');
var roleNomadHarvester = require('role.nomad_harvester');


Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Array.prototype.contains = function (value) {
    for (var i in this) {
        if (this[i] == value) return true;
    }
    return false;
};

var defines = {

    initDefines: function () {
        global.bodyParts = {
            "harvester":
                [
                    [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY],
                    [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                    [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY],
                    [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY],
                    [MOVE, MOVE, WORK, CARRY, CARRY]
                ],
            "builder": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY],
                [MOVE, MOVE, WORK, CARRY, CARRY]
            ],
            "nomad_harvester": [WORK, CARRY, MOVE],
            "upgrader": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, WORK, CARRY, CARRY],
            ],
            "repairer": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, WORK, WORK, CARRY],
            ],
            "wall_repairer": [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
            "carrier": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
            ],
            "collector": [
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                [MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY],
                [MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY],
                [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
            ],
            "transporter": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
            ],
            "feeder": [
                [MOVE, MOVE, MOVE, MOVE, MOVE,MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
            ],
            "tower_feeder": [
                [MOVE, MOVE, MOVE, MOVE, MOVE,MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
            ],
            "defender": [
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                [MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                [MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],
                [MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK],
            ],

            // "feeder": [MOVE, MOVE, MOVE, MOVE, MOVE,MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
        };
        global.creepRoles = {
            "feeder": roleFeeder,
            "tower_feeder": roleTowerFeeder,
            "harvester": roleHarvester,
            "collector": roleCollector,
            "upgrader": roleUpgrader,
            "carrier": roleCarrier,
            "wall_repairer": roleWall_repairer,
            "repairer": roleRepairer,
            "builder": roleBuilder,
            "defender": roleDefender,
            "transporter": roleTransporter,
        };
        global.squadProfiles = {
            "FE": [["feeder", 2]],
            "HA": [["harvester", 4]],
            "CO": [["collector", 1]],
            "BU": [["builder", 1]],
            "UP": [["upgrader", 1]],
            "RE": [["repairer", 2]],
            "WA": [["wall_repairer", 0]],
            "CA": [["carrier", 1]],
            "DE": [["defender", 1]],
            "TR": [["transporter", 1]],
            "TOFE": [["tower_feeder", 1]],
        };
        global.allowedToSpawnWithdraw = false;
        global.sourceContainers = [
            '59ac07c241f3ed2ac5324b0a',
            '59ae4aea33f29c3b855f02c0',
        ];
        global.destinationContainers = [
            '59ae529fbd28427f15402b36',//tower
            '59aab3b0b08c1b0fa81a4370',//central
            // '59ae5c75496afa193d2d8a40',//RC
        ];
    }

};

module.exports = defines;