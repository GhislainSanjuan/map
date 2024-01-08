/**
 * Update the database by scrapping the Google Workspace help centers
 *
 * @param {} 
 * @return {} 
**/
function updateProductSkills() {
  let webScrapData=webScrapping()
  let manualData=PRODUCTS_SKILLS.getDataRange().getValues().filter(x=>x[5]=="Manual")
  let driveScrapData=getDriveScrapData()
  let allData1=manualData.concat(driveScrapData)
  let allData2=allData1.concat(webScrapData)
  PRODUCTS_SKILLS.getRange("A2:I").clearContent()
  PRODUCTS_SKILLS.getRange(2, 1, allData2.length, allData2[0].length).setValues(allData2)
}

