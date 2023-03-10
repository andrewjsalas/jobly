// Model for 'job'
"use strict";
const db = require("../db");
const { notFoundError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
    // Create a job, update db, and return job data
    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle
             AS "companyHandle`,
            [
                data.title, 
                data.salary,
                data.equity,
                data.equityHandle,
            ]
        );
        let job = result.rows[0];
        return job;
    }

    // Find all jobs with filter functionality (minSalary, hasEquity, title)
    static async findAll({ minSalary, hasEquity, title } = {}) {
        let query = `SELECT j.id,
                            j.title,
                            j.salary,
                            j.equity,
                            j.company_handle AS "companyHandle",
                            c.name AS "companyName"
                     FROM jobs j
                     LEFT JOIN companies AS c ON c.handle = j.company_handle`;
        let whereExpressions = [];
        let queryValues = [];

        // For each possible search term, add to whereExpressions and queryValues so we can generate the right SQL

        if(minSalary !== undefined) {
            queryValues.push(minSalary);
            whereExpressions.push(`salary >=$${queryValues.length}`);
        }

        if (hasEquity === true) {
            whereExpressions.push(`equity > 0`);
        }

        if (title !== undefined) {
            whereExpressions.push(`equity > 0`);
        }

        if (title !== undefined) {
            queryValues.push(`%${title}%`);
            whereExpressions.push(`title LIKE $${queryValues.length}`);
        }

        if (whereExpressions.length > 0) {
            query += " WHERE " + whereExpressions.join(" AND ");
        }

        // Finalize query and return results
        query += " ORDER BY title ";
        const jobRes = await db.query(query, queryValues);
        return jobsRes.rows;
    }

    // Return data on a specific job by id
    static async get(id) {
        const jobRes = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "company_handle"
             FROM jobs
             WHERE id = $1`,
            [id]
        );
        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job found with id of ${id}`);

        const companiesRes = await db.query (
            `SELECT 
                handle, 
                name, 
                description AS "numEmployees",
                logo_url AS "logo_url"
             FROM companies
             WHERE handle = $1,
            [job.companyHnadle]`
        );
        delete job.companyHandle;
        job.company = companiesRes.rows[0];
    }

    // Update job data with 'data' with partial update
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data, {}
        );
        const idVarIdx = "$" + (values.length + 1);
        const querySql = `UPDATE jobs
                          SET ${setCols}
                          WHERE ID = ${idVarIdx}
                          RETURNING 
                            id, 
                            title,
                            salary,
                            equity,
                            company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        return job;
    }

    // Delete job from database
    static async remove(id) {
        const result = await db.query(
            `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`,
            [id]
        );
        const job = result.rows[0];
        if (!job) throw new NotFoundError(`No job found with id of ${id}`);
    }
}

module.exports = Job;