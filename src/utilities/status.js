
module.exports = {
    code: function (keyword) {
        if (keyword == 'success') return 200
        else if (keyword === 'created') return 201
        else if (keyword === 'bad-request') return 400
        else if (keyword === 'unauthorized') return 401
        else if (keyword === 'forbidden') return 403
        else if (keyword === 'not-found') return 404
        else if (keyword === 'conflict') return 409
        else if (keyword === 'internal-server-error') return 500

    }
}
