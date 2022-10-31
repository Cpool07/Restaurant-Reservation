function hasProps(...properties) {
    return function (req, response, next) {
      const { data = {} } = req.body;
  
      try {
        properties.forEach((property) => {
          if (!data[property]) {
            const error = new Error(`A '${property}' property is required.`);
            error.status = 400;
            throw error;
          }
        });
        response.locals.reservation = data;
        next();
      } catch (error) {
        next(error);
      }
    };
  }
  
  module.exports = hasProps;