StructureContainer.prototype.transfer = function (target, resourceType) {
    if(typeof(target) === 'Creep'){
        target.withdraw(this,resourceType);
    }
};
