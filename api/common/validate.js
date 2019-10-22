const { check } = require('express-validator')

exports.validate = (method) => {
  switch (method) {

    case 'insertRORDetails': {
      return [
       check('ROR_DETAILS_FIELDS.IBM_COUNTRY').isString(),
       check('ROR_DETAILS_FIELDS.IBM_GROWTH_PLATFORM').isString() ,
       check('ROR_DETAILS_FIELDS.BP_BUSINESS_SEGMENT').isString() ,
       check('ROR_DETAILS_FIELDS.PROGRAM_WORK').isString() ,
       check('ROR_DETAILS_FIELDS.PROJECT_NAME').isString() , 
       check('ROR_DETAILS_FIELDS.NEXTGEN_SERVICE_TYPE').isString() , 
       check('ROR_DETAILS_FIELDS.NEXTGEN_COMMERCIAL_MODEL').isString() ,       
       check('ROR_DETAILS_FIELDS.NEXTGEN_PRICE_TYPE').isString() , 
       check('ROR_DETAILS_FIELDS.RATE_CARD_TYPE').isString() , 
       check('ROR_DETAILS_FIELDS.MILESTONE_REQUIRED').isString() ,  
       check('ROR_DETAILS_FIELDS.EXPECTED_SIGNING_QUARTER').isString() ,         
     ] 
     }

    case 'CreateUser': {
     return [
      check('NAME').isString(),
      check('ROLE').isString(),
      check('EMAIL','Invalid email format').isEmail()
    ] 
    }
    case 'updateUser': {
      return [
       check('ID','ID should be numeric').isNumeric(),
       check('NAME').isString(),
       check('ROLE').isString(),
       check('EMAIL','Invalid email format').isEmail()
     ] 
     }
     case 'deleteUser': {
      return [
       check('ID','ID should be numeric').isNumeric()
            ] 
     }
  }
}