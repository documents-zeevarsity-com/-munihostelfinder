const Joi = require('joi');

/**
 * Generic validation middleware
 * @param {Object} schema - Joi schema object
 * @param {string} property - req property to validate (body, query, params)
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false, // Include all errors, not just the first one
      allowUnknown: true, // Allow fields not defined in schema
      stripUnknown: true  // Remove fields not defined in schema
    });

    if (!error) {
      next();
    } else {
      const { details } = error;
      const message = details.map(i => i.message).join(',');
      
      res.status(422).json({ 
        status: 'error',
        message: 'Validation failed',
        details: message 
      });
    }
  };
};

// Schema Definitions
const schemas = {
  auth: {
    register: Joi.object({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().max(255).required(),
      password: Joi.string().min(6).max(128).required(),
      phone: Joi.string().trim().max(64).allow('', null).optional(),
      role: Joi.string().valid('user', 'hostel_admin', 'super_admin').default('user')
    }),
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
    changePassword: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).max(128).required(),
    }),
  },
  hostel: {
    create: Joi.object({
      name: Joi.string().trim().min(1).max(255).required(),
      price: Joi.string().trim().max(64).required(),
      location: Joi.string().trim().min(1).max(255).required(),
      address: Joi.string().trim().min(1).max(255).required(),
      phone: Joi.string().trim().max(64).allow('', null).optional(),
      email: Joi.string().email().max(255).allow('', null).optional(),
      capacity: Joi.number().integer().min(1).required(),
      description: Joi.string().trim().max(5000).allow('', null).optional(),
      features: Joi.object().optional().default({}),
      image: Joi.string().uri().max(1024).allow('', null).optional(),
      photos: Joi.array().items(
        Joi.object({
          type: Joi.string().valid('url', 'base64').required(),
          src: Joi.string().required(),
        })
      ).max(5).optional().default([]),
      status: Joi.string().valid('active', 'pending', 'inactive').optional().default('active'),
    }),
    update: Joi.object({
      name: Joi.string().trim().min(1).max(255).optional(),
      price: Joi.string().trim().max(64).optional(),
      location: Joi.string().trim().min(1).max(255).optional(),
      address: Joi.string().trim().min(1).max(255).optional(),
      phone: Joi.string().trim().max(64).allow('', null).optional(),
      email: Joi.string().email().max(255).allow('', null).optional(),
      capacity: Joi.number().integer().min(1).optional(),
      description: Joi.string().trim().max(5000).allow('', null).optional(),
      features: Joi.object().optional(),
      image: Joi.string().uri().max(1024).allow('', null).optional(),
      photos: Joi.array().items(Joi.object({ type: Joi.string().required(), src: Joi.string().required() })).max(5).optional(),
      status: Joi.string().valid('active', 'pending', 'inactive').optional(),
    }).min(1),
    search: Joi.object({
      location: Joi.string().allow('', null).optional(),
      minPrice: Joi.number().min(0).optional(),
      maxPrice: Joi.number().min(0).optional(),
      wifi: Joi.boolean().optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(10)
    }),
  },
  booking: {
    create: Joi.object({
      hostelId: Joi.number().integer().min(1).required(),
      checkIn: Joi.date().iso().required(),
      checkOut: Joi.date().iso().greater(Joi.ref('checkIn')).required(),
      amount: Joi.string().trim().max(128).required(),
    }),
    updateStatus: Joi.object({
      status: Joi.string().valid('pending', 'confirmed', 'cancelled').required(),
    }),
  },
};

module.exports = { validate, schemas };