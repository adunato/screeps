StructureSpawn.prototype.createCreep = register.wrapFn(function(body, name, creepMemory) {
    console.log("I am an extension");
    if(_.isObject(name) && _.isUndefined(creepMemory)) {
        creepMemory = name;
        name = undefined;
    }

    var canResult = this.canCreateCreep(body, name);
    if(canResult != C.OK) {
        return canResult;
    }

    if(!name) {
        name = require('./names').getUniqueName((i) => {
            return _.any(runtimeData.roomObjects, {type: 'creep', user: data(this.id).user, name: i}) ||
                createdCreepNames.indexOf(i) != -1;
        });
    }

    createdCreepNames.push(name);

    if(_.isUndefined(globals.Memory.creeps)) {
        globals.Memory.creeps = {};
    }
    if(_.isObject(globals.Memory.creeps)) {
        if(!_.isUndefined(creepMemory)) {
            globals.Memory.creeps[name] = creepMemory;
        }
        else {
            globals.Memory.creeps[name] = globals.Memory.creeps[name] || {};
        }
    }

    globals.Game.creeps[name] = new globals.Creep();
    globals.RoomObject.call(globals.Game.creeps[name], this.pos.x, this.pos.y, this.pos.roomName);
    Object.defineProperties(globals.Game.creeps[name], {
        name: {
            enumerable: true,
            get() {
                return name;
            }
        },
        spawning: {
            enumerable: true,
            get() {
                return true;
            }
        },
        my: {
            enumerable: true,
            get() {
                return true;
            }
        },
        body: {
            enumerable: true,
            get() {
                return _.map(body, type => ({type, hits: 100}))
            }
        },
        owner: {
            enumerable: true,
            get() {
                return new Object({username: runtimeData.user.username});
            }
        },
        ticksToLive: {
            enumerable: true,
            get() {
                return C.CREEP_LIFE_TIME;
            }
        },
        carryCapacity: {
            enumerable: true,
            get() {
                return _.reduce(body, (result, type) => result += type == C.CARRY ? C.CARRY_CAPACITY : 0, 0);
            }
        },
        carry: {
            enumerable: true,
            get() {
                return {energy: 0};
            }
        },
        fatigue: {
            enumerable: true,
            get() {
                return 0;
            }
        },
        hits: {
            enumerable: true,
            get() {
                return body.length * 100;
            }
        },
        hitsMax: {
            enumerable: true,
            get() {
                return body.length * 100;
            }
        },
        saying: {
            enumerable: true,
            get() {
                return undefined;
            }
        }
    });

    intents.set(this.id, 'createCreep', {name, body});
    return name;
});