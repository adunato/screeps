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
var roleBreacher = require('role.breacher');
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
                    // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY],
                    // [MOVE, MOVE,WORK, WORK, WORK, WORK, WORK, CARRY, CARRY],
                    // [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY],
                    // [MOVE, MOVE, MOVE,MOVE, WORK, WORK, CARRY, CARRY],
                    // [MOVE, MOVE,MOVE, WORK, CARRY, CARRY],
                    // [MOVE, MOVE, WORK, CARRY]
                    [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,CARRY]
                ],
            "reserver":
                [
                    [MOVE, MOVE, CLAIM, CLAIM],
                ],
            "claimer":
                [
                    [MOVE, CLAIM],
                ],
            "builder": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY],
                [MOVE, MOVE, WORK, CARRY, CARRY],
                [MOVE, WORK, CARRY]
            ],
            "nomad_harvester": [WORK, CARRY, MOVE],
            "upgrader": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY],
                [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY],
                // [MOVE, MOVE, MOVE, WORK, CARRY, CARRY],
                // [MOVE, MOVE, WORK, CARRY],
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
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
                // [MOVE, CARRY]
            ],
            "transporter": [
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                [MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
            ],
            "feeder": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                // [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
                // [MOVE, CARRY]
            ],
            "tower_feeder": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
            ],
            "defender": [
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                [MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                [MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK],
                [MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK],
            ],
            "patroller": [
                // [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                // [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                // [MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],
                // [MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK],
                // [MOVE,ATTACK],
            ],
            "breacher": [
                [MOVE,ATTACK],
            ],

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
            "breacher": roleBreacher,
        };
        global.squadProfiles = {
            "FE": new squadprofile.SquadAttributes([["feeder", 1]], false, function () {
                return true;
            }),
            "HA": new squadprofile.SquadAttributes([["harvester", 1]], false, function (roomName) {
                return true
            }),
            "CO": new squadprofile.SquadAttributes([["collector", 1]], false, function (roomName) {
                return true
            }),
            "BU": new squadprofile.SquadAttributes([["builder", 1]], false, function (flagName) {
                var room = Game.flags[flagName].room;
                return room.find(FIND_CONSTRUCTION_SITES).length > 0;
            }),
            "UP": new squadprofile.SquadAttributes([["upgrader", 1]], false, function (roomName) {
                return true
            }),
            "RE": new squadprofile.SquadAttributes([["repairer", 1]], true, function (roomName) {
                return true
            }),
            "REXS": new squadprofile.SquadAttributes([["repairer", 1]], true, function (roomName) {
                return true
            }),
            "WA": new squadprofile.SquadAttributes([["wall_repairer", 0]], false, function (roomName) {
                return true
            }),
            "CA": new squadprofile.SquadAttributes([["carrier", 1]], false, function (roomName) {
                return true
            }),
            "DE": new squadprofile.SquadAttributes([["defender", 1]], false, function (roomName) {
                return true
            }),
            "TR": new squadprofile.SquadAttributes([["transporter", 1]], false, function (roomName) {
                return true
            }),
            "PA": new squadprofile.SquadAttributes([["patroller", 1]], true, function (roomName) {
                return true
            }),
            "CL": new squadprofile.SquadAttributes([["claimer", 1]], false, function (roomName) {
                return true
            }),
            "RES": new squadprofile.SquadAttributes([["reserver", 1]], false, function (flagName) {
                var roomName = Game.flags[flagName].room;
                return !Game.rooms[roomName.name].controller.reservation || Game.rooms[roomName.name].controller.reservation.ticksToEnd < 500;
            }),
            "TOFE": new squadprofile.SquadAttributes([["tower_feeder", 1]], false, function () {
                return true
            }),
            "BR": new squadprofile.SquadAttributes([["breacher", 1]], false, function () {
                return true
            }),
        };
        global.allowedToSpawnWithdraw = false;
        global.sourceContainers = {
            "E59N3": [
                '59bcf1e54bf950778a52e344',//top source
                '59bcf2e30c847c1a83980262',//bottom source
            ],
            "E58N3": [
                '59bd01066a51a26ee9cd9364',//bottom source
                '59bcfdd9093ab25ba5b27adc',//top source
            ],
            "E59N4": [
                '59bd6ac690034410267ae878',//top source
                '59bd173800f18070a06f4942',//bottom source
            ],
        };
        global.destinationContainers = {
            "E59N3": [
                '59bd0490359d4b354e549af3',//central
                '59bd193628481431e871a376', //RC
            ],
            "E58N3": [
                '59bd135153c8315a8c9d9acd',//central
                '59bd0f8e0b35295a9a690686',//RC
            ],
            "E59N4": [
                '59bcf1e54bf950778a52e344',//top source in E59N3
            ],
        };
    }

};

module.exports = defines;
