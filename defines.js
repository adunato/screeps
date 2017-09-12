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
var rolePatroller = require('role.patroller');
var roleClaimer = require('role.claimer');
var roleReserver = require('role.reserver');
var squadprofile = require('SquadProfile');


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
                    // [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                    // [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY],
                    // [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY],
                    // [MOVE, MOVE, WORK, CARRY, CARRY]
                ],
            "reserver":
                [
                    [MOVE,MOVE,CLAIM,CLAIM],
                ],
            "claimer":
                [
                    [MOVE,CLAIM],
                ],
            "builder": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, WORK, CARRY, CARRY]
            ],
            "nomad_harvester": [WORK, CARRY, MOVE],
            "upgrader": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, WORK, CARRY, CARRY],
            ],
            "repairer": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, WORK, WORK, CARRY],
            ],
            "wall_repairer": [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
            "carrier": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
            ],
            "collector": [
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY],
                // [MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY],
                // [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
            ],
            "transporter": [
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
            ],
            "feeder": [
                [MOVE, MOVE, MOVE, MOVE, MOVE,MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
                [MOVE, CARRY]
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
            "patroller": [
                // [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],
                // [MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK],
                // [MOVE,ATTACK],
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
            "patroller": rolePatroller,
            "claimer": roleClaimer,
            "reserver": roleReserver,
        };
        // global.squadProfiles = {
        //     "FE": [["feeder", 1]],
        //     "HA": [["harvester", 1]],
        //     "CO": [["collector", 1]],
        //     "BU": [["builder", 1]],
        //     "UP": [["upgrader", 1]],
        //     "RE": [["repairer", 4]],
        //     "WA": [["wall_repairer", 0]],
        //     "CA": [["carrier", 1]],
        //     "DE": [["defender", 1]],
        //     "TR": [["transporter", 1]],
        //     "PA": [["patroller", 2]],
        //     "TOFE": [["tower_feeder", 1]],
        // };
        global.squadProfiles = {
            "FE": new squadprofile.SquadAttributes([["feeder", 1]],false),
            "HA": new squadprofile.SquadAttributes([["harvester", 1]],false),
            "CO": new squadprofile.SquadAttributes([["collector", 1]],false),
            "BU": new squadprofile.SquadAttributes([["builder", 1]],false),
            "UP": new squadprofile.SquadAttributes([["upgrader", 1]],false),
            "RE": new squadprofile.SquadAttributes([["repairer", 2]],true),
            "WA": new squadprofile.SquadAttributes([["wall_repairer", 0]],false),
            "CA": new squadprofile.SquadAttributes([["carrier", 1]],false),
            "DE": new squadprofile.SquadAttributes([["defender", 1]],false),
            "TR": new squadprofile.SquadAttributes([["transporter", 1]],false),
            "PA": new squadprofile.SquadAttributes([["patroller", 2]],true),
            "CL": new squadprofile.SquadAttributes([["claimer", 1]],false),
            "RES": new squadprofile.SquadAttributes([["reserver", 1]],false),
            "TOFE": new squadprofile.SquadAttributes([["tower_feeder", 1]],false)
        };
        global.allowedToSpawnWithdraw = false;
        global.sourceContainers = [
            '59ae9c954c5f1d59562175e5',
            '59ae4aea33f29c3b855f02c0',
        ];
        global.destinationContainers = [
            // '59aab3b0b08c1b0fa81a4370',//central
            // '59b78fe638afd04af132806b',//tower
            // '59ae5c75496afa193d2d8a40',//RC
        ];
    }

};

module.exports = defines;