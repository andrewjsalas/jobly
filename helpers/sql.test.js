// Tests for sql.js

const { BadRequestError } = require("../expressError");

// Test to check if BadRequestError is thrown when no data is provided.
it('throws a BadRequestError when no data is provided', function() {
    const dataToUpdate = {};
    const jsToSql = {};
    expect(() => {
        sqlPartialUpdate(dataToUpdate, jsToSql);
    }).toThrowError(BadRequestError);
});