



/*******************************************************************************************************
* This function initialize the script property to manage label IDS for document management
* ******************************************************************************************************
* @param {} 
* @return {} 
*/
function initMAPId(){
  PropertiesService.getScriptProperties().setProperty('idMAP',2000)
}



/*******************************************************************************************************
* This function gives the json format from a label created for Google Drive
* ******************************************************************************************************
* @param {} 
* @return {} 
*/
function listLabels() {
  //Place label id created from the admin console
  let label_json = DriveLabels.Labels.get("labels/WzUFxg8JE4dfrGNtdtBWPeCKqqXqUkz06foSNNEbbFcb", {
    "view": "LABEL_VIEW_FULL"
  })
  let text=""
  //Loop over the json to get informations
  label_json.fields.forEach(function (t) {
    try {
      text = `"id": "` + t.id + `",
      "options": [`
      t.selectionOptions.choices.forEach(function (c) {
        text += `{
          "name": "`+ c.properties.displayName + `",
          "id": "`+ c.id + `"
        },`
      })
    }
    catch (e) {
      Logger.log(e)
      text = t.properties.displayName + ":" + t.id
    }
  })
  //This result can be copied and placed in the constants.gs file inside the LABEL variable 
  console.log(text)

}




/*******************************************************************************************************
* This function gets the label value (i.e the id for the document ). If the document does not have a value, 
* one is applied ot it
* ******************************************************************************************************
* @param {string} fileId - the file id 
* @param {string} labelId - the label id 
* @param {string} fieldId - the field id of the label 
* @return {string} the id applied to the document in order to manage it more easily
*/
function getLabelField(fileId, labelId, fieldId){
  try{
    return Drive.Files.listLabels(fileId).items.filter(x=>x.id==labelId)[0].fields[fieldId].text[0]
  }
  catch(e)
  {
    //Logger.log(e)
    let idMAP=Number(PropertiesService.getScriptProperties().getProperty('idMAP'))+1
    PropertiesService.getScriptProperties().setProperty('idMAP',idMAP)
    setLabelText(fileId,labelId,fieldId,"PSK"+idMAP)
    return "PSK"+idMAP
  }
}



/*******************************************************************************************************
* This function apply a value to a text type label 
* ******************************************************************************************************
* @param {string} fileId - the file id 
* @param {string} labelId - the label id 
* @param {string} fieldId - the field id of the label 
* @param {string} fieldValue - the value to apply
* @return {} 
*/
function setLabelText(fileId, labelId, fieldId, fieldValue) {

  // Add Label To The File (Fields will be empty)
  let AddLabel = Drive.newModifyLabelsRequest()
  AddLabel.setLabelModifications(Drive.newLabelModification().setLabelId(labelId));
  // Commit
  let output = Drive.Files.modifyLabels(AddLabel, fileId);
  // Set field of file
  let fieldModification = Drive.newLabelFieldModification();
  fieldModification.fieldId = fieldId;
  fieldModification.setTextValues = fieldValue
  let modifyLabelsRequest = Drive.newModifyLabelsRequest();
  modifyLabelsRequest.labelModifications = Drive.newLabelModification()
  modifyLabelsRequest.labelModifications.labelId = labelId;
  modifyLabelsRequest.labelModifications.setFieldModifications([fieldModification]);
  // Commit
  output = Drive.Files.modifyLabels(modifyLabelsRequest, fileId);
}


