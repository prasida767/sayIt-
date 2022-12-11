const joi = require('joi')

const createValidation = (data) => {
    const modelValidation = joi.object({
        full_name: joi.string().required(),
        user_name: joi.string().required().min(3).max(256),
        email_address: joi.string().required().min(6).max(256).email(),
        password: joi.string().required().min(6).max(1024),
        date_of_birth: joi.string().required()
    })
    return modelValidation.validate(data)
}

const createValidationForUpdate = (data) => {
    const modelValidation = joi.object({
        old_full_name: joi.string().required(),
        old_user_name: joi.string().required().min(3).max(256),
        old_password: joi.string().required().min(6).max(1024),
        new_full_name: joi.string().required(),
        new_user_name: joi.string().required().min(3).max(256),
        new_password: joi.string().required().min(6).max(1024)
    })
    return modelValidation.validate(data)
}

const loginValidation = (data) => {
    const modelValidation = joi.object({
        user_name: joi.string().required().min(3).max(256),
        password: joi.string().required().min(6).max(1024)
    })
    return modelValidation.validate(data)
}

module.exports.createValidation = createValidation
module.exports.loginValidation = loginValidation
module.exports.createValidationForUpdate = createValidationForUpdate