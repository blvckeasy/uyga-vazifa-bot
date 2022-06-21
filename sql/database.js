// is written to use functions instead of future queries 😄
class Queries {
  getUsers(returnedArr = [], conditionsObj = {}, tableName) {

    let query = `select \n`

    if (returnedArr.length) {
      for (let value of returnedArr) {
        let is_end = returnedArr[returnedArr.length - 1] == value ? true : false
        query += `\t${value}${!is_end ? ',\n': ''}`  
      }
    } else {
      query += `\t*`
    }

    query += `\nfrom ${tableName}\n${Object.keys(conditionsObj).length ? 'where\n': ''}`

    console.log(Object.keys(conditionsObj).length)

    // if (Object.keys(conditionsObj).length){
    //   for (let value in conditionsObj) {
    //     let andCondition = value == Object.keys(conditionsObj)[0] ? false : true
    //     query += `${(andCondition ? ' and\n' : '')}\t${value} = ${conditionsObj[value]}`
    //   }
    // }

    console.log(query)
    

  }
}

export default Queries