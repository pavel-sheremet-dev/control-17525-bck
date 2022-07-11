const getFromQueryParams = params =>
  Object.keys(params).reduce((acc, key) => {
    if (params[key] === undefined) return acc;
    return { ...acc, [key]: params[key] };
  }, {});

exports.getFromQueryParams = { getFromQueryParams };
