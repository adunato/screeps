//var cache = require('cache');
Structure.prototype.transfer = function (target, resourceType) {
    console.log("I have been here");
    if(typeof(target) === 'Creep'){
        target.withdraw(this,resourceType);
    }
};
