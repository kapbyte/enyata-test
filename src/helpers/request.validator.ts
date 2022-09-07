import Joi from "joi";

const permissionRequestValidator = Joi.object({ 
  subscription: Joi.string().required() 
});

export { permissionRequestValidator };