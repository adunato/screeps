//var cache = require('cache');
Structure.prototype.transfer = function (target, resourceType) {
    if(typeof(target) === 'Creep'){
        target.withdraw(this,resourceType);
    }
};
