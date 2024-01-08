/*******************************************************************************************************
* This function give the files list data to update in the database
* ******************************************************************************************************
* @param {} 
* @return {} 
*/
function getDriveScrapData(){
  getFilesAndFolders(RESSOURCES_FOLDER_ID)
  let driveScrapData=[]
  // If a label id is already in the database --> Update the title and the link 
  // If a label is in th database but not in the files labels list --> remove it from the database
  let databaseDriveScrap=PRODUCTS_SKILLS.getDataRange().getValues().filter(x=>x[5]=="DriveScrapping")
  let databaseDriveScrapIds=databaseDriveScrap.map(x=>x[0])
  let fileAlreadyInDatabase=listFoldersAndFiles.filter(x=>databaseDriveScrapIds.indexOf(x[0])>-1)
  fileAlreadyInDatabase.forEach(function(t){
    //ID	PRODUCT	CHAPTER	SKILL	CATEGORIE	TYPE	LEVEL	LINK
    let dataForId=databaseDriveScrap.filter(x=>x[0]==t[0])[0]
    driveScrapData.push([t[0],dataForId[1],t[2],t[3],dataForId[4],t[5],dataForId[6],t[7]])
  })
  return driveScrapData
}



/*******************************************************************************************************
* This function gets all the files/folders main informations in the array 
* ******************************************************************************************************
* @param {string} folderId - the folder id to search
* @return {} 
*/
function getFilesAndFolders(folderId) {

   try { 
    let baseFolders = DriveApp.getFolderById(folderId).getFolders()
    listAllFoldersRecursive(baseFolders)
    let baseFiles = DriveApp.getFolderById(folderId).getFiles()
    listAllFiles(baseFiles)
   }
  catch (e) {
    Logger.log(e)
  } 

}


/*******************************************************************************************************
* This function add the file informations in a array from a list of files
* ******************************************************************************************************
* @param {string} files - the list of files to go through 
* @return {} 
*/
function listAllFiles(files) {
  while (files.hasNext()) {
    let file = files.next()
    let idMAP=getLabelField(file.getId(),LABEL.labelId ,LABEL.ID_MAP.id)
    //ID	PRODUCT	CHAPTER	SKILL	CATEGORIE	TYPE	LEVEL	LINK
    listFoldersAndFiles.push([idMAP,"",file.getParents().next().getName(), file.getName(),"","DriveScrapping","", file.getUrl()])
  }
}

/*******************************************************************************************************
* This function add the file/folders informations in a array from a list of files/folders and do it in a recursive way
* ******************************************************************************************************
* @param {string} folder - the list of folders to go through 
* @return {} 
*/
function listAllFoldersRecursive(folders) {
  while (folders.hasNext()) {
    let f = folders.next();
    let files = f.getFiles();
    listAllFiles(files);
    let subFolders = f.getFolders();
    listAllFoldersRecursive(subFolders);
  }
}
