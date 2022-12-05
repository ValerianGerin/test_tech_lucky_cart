const { EType, ECondition } = require("./enums/enums");
const { conditionCallback } = require("./utils/functions");

class EligibilityService {
  type(entity) {
    return Object.prototype.toString.call(entity);
  }

  isPrimitiveType(entity) {
    return (
      this.type(entity) === EType.STRING ||
      this.type(entity) === EType.NUMBER ||
      this.type(entity) === EType.BOOLEAN
    );
  }

  isObjectType(entity) {
    return this.type(entity) === EType.OBJECT;
  }

  isArrayType(entity) {
    return this.type(entity) === EType.ARRAY;
  }

  objectKeysToArray(obj) {
    return Object.keys(obj);
  }

  objectValuesToArray(obj) {
    return Object.values(obj);
  }

  objectKeysAndValToArray(obj) {
    return Object.entries(obj);
  }

  flatObj(obj) {
    return this.objectKeysAndValToArray(obj).reduce(
      (flatted, [key, value]) =>
        typeof value == "object"
          ? { ...flatted, ...this.flatObj(value) }
          : { ...flatted, [key]: value },
      {}
    );
  }

  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */
  isEligible(cart, criteria) {
    // TODO: compute cart eligibility here.

    const criteriaKeysToArray = this.objectKeysToArray(criteria);
    const CartKeysToArray = this.objectKeysToArray(cart);

    let result = false;

    if (criteriaKeysToArray.length !== 0) {
      criteriaKeysToArray.forEach((key) => {
        //clé composite sur criteria
        if (key.includes(".")) {
          const [firstKeyLvl, subKeyLvl] = key.split(".");

          //La clé de premier niveau contient un objet
          if (this.isObjectType(cart[firstKeyLvl])) {
            const cartKeysToArray = this.objectKeysToArray(cart[firstKeyLvl]);
            //On test pour voir si la sous prorpiété de cart exite bien sur la deuxieme clé composite de criteria
            const isSubKeyExistInCart = cartKeysToArray.find(
              (cartKey) => cartKey === subKeyLvl
            );

            //La sous propréiét existe bien dans cart
            if (isSubKeyExistInCart) {
              //Si on trouve la clé in on a affaire a un array dans criteria
              if (criteria[key][ECondition.IN]) {
                const isSubValueInCartIsContainedInCriteria =
                  cartKeysToArray.some((cartKey) =>
                    criteria[key][ECondition.IN].includes(
                      cart[firstKeyLvl][cartKey]
                    )
                  );

                result = isSubValueInCartIsContainedInCriteria;

                //Sinon on a affaire a une valeur simple
              } else {
                const isSubValueInCartIsContainedInCriteria =
                  cartKeysToArray.some(
                    (cartKey) => criteria[key] === cart[firstKeyLvl][cartKey]
                  );
                result = isSubValueInCartIsContainedInCriteria;
              }
            } else {
              result = false;
            }

            //la clé de premier niveau contient un array
          } else if (this.isArrayType(cart[firstKeyLvl])) {
            //ON test pour voir si un element de l'array de cart contient une propriété similaire a la clé
            //composite de criteria
            const isSubKeyExistInCart = cart[firstKeyLvl].find(
              (cart) => cart[subKeyLvl]
            );

            //La sous propriété existe bien dans cart
            if (isSubKeyExistInCart) {
              //Si on trouve la clé in on a affaire a un array dans criteria
              if (criteria[key][ECondition.IN]) {
                const isSubValueInCartIsContainedInCriteria = cart[
                  firstKeyLvl
                ].some((cartItem) =>
                  criteria[key][ECondition.IN].includes(cartItem[subKeyLvl])
                );

                result = isSubValueInCartIsContainedInCriteria;

                //Sinon on a affaire a une valeur simple
              } else {
                const isSubValueInCartIsContainedInCriteria = cart[
                  firstKeyLvl
                ].some((cartItem) => cartItem[subKeyLvl] == criteria[key]);

                result = isSubValueInCartIsContainedInCriteria;
              }
            } else {
              result = false;
            }
            //la clé composite de criteria ne contient aucune information
          } else {
            result = false;
          }
          //clé simple sur criteria
        } else {
          //Si la clé existe sur criteria elle doit exister sur cart
          if (CartKeysToArray.includes(key)) {
            //la valeur contenue a cette clé est ne contient aucune condition
            if (this.isPrimitiveType(criteria[key])) {
              result = criteria[key] == cart[key];

              //la valeur contenue a cette clé a des conditions
            } else {
              //On crée un array avec les sous clé de condition et valeur applaties
              const flatternedObjToArray = this.objectKeysAndValToArray(
                this.flatObj(criteria[key])
              );

              //Si on trouve une clé and
              if (criteria[key][ECondition.AND]) {
                //On defini un tableau de boolean
                let andResults = [];
                flatternedObjToArray.forEach(([keycond, valcond]) => {
                  const andResult = conditionCallback[keycond](
                    valcond,
                    cart[key]
                  );
                  andResults.push(andResult);
                });
                //Pour un and notre array doit contenir au uniquement des valeurs true
                result = andResults.every((val) => val);
                //si on trouve une clé OR
              } else if (criteria[key][ECondition.OR]) {
                //On defini un tableau de boolean
                let orResults = [];
                flatternedObjToArray.forEach(([keycond, valcond]) => {
                  const orResult = conditionCallback[keycond](
                    valcond,
                    cart[key]
                  );

                  orResults.push(orResult);
                });
                //Pour un or notre array doit contenir au moins une valeur true
                result = orResults.includes(true);

                //Si on trouve une clé IN
              } else if (criteria[key][ECondition.IN]) {
                const inResults = criteria[key][ECondition.IN];
                result = conditionCallback[ECondition.IN](inResults, cart[key]);
              } else {
                const singleCondKey = this.objectKeysToArray(criteria[key])[0];
                const singleCondVal = this.objectValuesToArray(
                  criteria[key]
                )[0];

                result = conditionCallback[singleCondKey](
                  singleCondVal,
                  cart[key]
                );
              }
            }
          } else {
            result = false;
          }
        }
      });
    } else {
      result = true;
    }

    return result;
  }
}

module.exports = {
  EligibilityService,
};
