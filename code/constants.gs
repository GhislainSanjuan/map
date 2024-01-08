/** 
Constants 
*/
const SP = SpreadsheetApp.openById("your_spreadsheet_id")
const JOBS_PRODUCT_SKILLS = SP.getSheetByName("JOBS_PRODUCT_SKILLS")
const JOBS = SP.getSheetByName("JOBS")
const PRODUCTS = SP.getSheetByName("PRODUCTS")
const PRODUCTS_SKILLS = SP.getSheetByName("PRODUCTS_SKILLS")
const JOBS_SKILLS = SP.getSheetByName("JOBS_SKILLS")
const USERS = SP.getSheetByName("USERS")
const USERS_SKILLS = SP.getSheetByName("USERS_SKILLS")
const LANG = SP.getSheetByName("LANGUAGES")
const LEVELS = SP.getSheetByName("LEVELS")
const COMM_FOLDER = DriveApp.getFolderById("your_folder_id")
const COMMUNICATION = SP.getSheetByName("COMMUNICATION")
const scrJobImg = "https://cdn-icons-png.flaticon.com/512/3306/3306451.png"
const listFoldersAndFiles=[]
//Folder to checkfor new manual content  
const RESSOURCES_FOLDER_ID="1NT1t7oo1Yx0vZ1es4ZwUzcDQZo2zFvxq"


const LABEL = {
  "labelId": "WzUFxg8JE4dfrGNtdtBWPeCKqqXqUkz06foSNNEbbFcb",
  "ID_IRMA": {
    "id": "7C67F7B8C7"
  }
}
