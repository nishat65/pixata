exports.filtered = (...fields) => {
    return fields.join(',').split(',').join(' ');
};
