const { isValidObjectId } = require('mongoose');

exports.checkObjectId = (value, helpers) => {
  if (!isValidObjectId(value)) {
    return helpers.message('Contact not Found. Invalid ID');
  }
  return value;
};
