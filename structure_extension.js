StructureContainer.prototype.transfer = function (target, resourceType) {
    console.log('StructureContainer.prototype.transfer');
    if(typeof(target) === 'Creep'){
        var res = target.withdraw(this,resourceType);
        console.log('StructureContainer.prototype.transfer: ' + res);
        return res;
    }
};
