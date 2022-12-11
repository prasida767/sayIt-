const userDatabase = require('mongoose')

const UserSchema = userDatabase.Schema({
    full_name:{
        type: String,
        require:true
    },
    user_name:{
        type: String,
        require:true,
        min: 6,
        max: 15
    },
    date_of_creation:{
        type: Date,
        default: Date.now
    },
    date_of_birth:{
        type: Date,
        require: true
    },
    email_address:{
        type: String,
        require: true,
        min: 6,
        max: 256
    },
    password:{
        type: String,
        require: true,
        min: 6,
        max: 2046
    }
})


module.exports = userDatabase.model('users', UserSchema)