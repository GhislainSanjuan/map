/*******************************************************************************************************
* This function sends the communications through different channel
* ******************************************************************************************************
* @param {string} docUrl - the template Google Docs url used for the communication
* @param {string} object - the communication subject
* @param {string} users - emails 
* @param {string} chatWebhooks - webhooks from Google Chat 
* @param {string} textChat - the title associated to the message send in Google Chat via webhooks
* @param {string} description - the subtitle associated to the message send in Google Chat via webhooks
* @param {string} description - the subtitle associated to the message send in Google Chat via webhooks
* @param {boolean} sendByMail - decides if the communication is sent by email or not
* @param {boolean} sendToChat - decides if the communication is sent to Google Chat or not
* @return {} 
*/
function sendComms(docUrl, objet, users, chatWebhooks, textChat, description, sendByMail, sendToChat) {
  if (sendToChat == true) {
    console.log("sendtoChat")
    try {
      //Transform the document into a PDF
      let commDoc = COMM_FOLDER.createFile(DocumentApp.openByUrl(docUrl).getAs('application/pdf')).setName("Bulletin - " + objet)
      sendNotifToChat(textChat, commDoc, chatWebhooks, objet, description)
    }
    catch (e) {
      Logger.log(e)
    }
  }
  if (sendByMail == true) {
    console.log("sendByEmail")
    try {
      //mail sending
      GmailApp.sendEmail(users, objet, description, { htmlBody: doc_to_html(docUrl) })
    }
    catch (e) {
      Logger.log(e)
    }
  }

}

/*******************************************************************************************************
* This function sends a chat message via a webhook
* ******************************************************************************************************
* @param {string} textMsg - the text added to the message (in addition to the title and subtitle)
* @param {string} commDoc - the document  used for the communication
* @param {string} webhooks - webhooks from Google Chat 
* @param {boolean} title - the title associated to the message send in Google Chat via webhooks
* @param {boolean} desc - the subtitle associated to the message send in Google Chat via webhooks
* @return {} 
*/
function sendNotifToChat(textMsg, commDoc, webhooks, title, desc) {
  webhooks.split(",").forEach(function (w) {
    let card = {
      "cards_v2": [{
        "card_id": "news",
        "card": {
          "header": {
            "title": title,
            "subtitle": desc
          },
          "sections": [
            {
              "widgets": [
                {
                  "buttonList": {
                    "buttons": {
                      "text": "Find out more",
                      "onClick": {
                        "openLink": {
                          "url": commDoc.getUrl()
                        }
                      }
                    }
                  },
                  "horizontalAlignment": "CENTER"
                }
              ]
            }
          ]
        }
      }], "text": textMsg
    }
    payload = JSON.stringify(card);
    let options = {
      method: 'POST',
      contentType: 'application/json',
      payload: payload
    };
    UrlFetchApp.fetch(w, options)
  })
}

// 
/*******************************************************************************************************
* You can use this function everytime you will need to get the HTML content of a Google Docs fil
* ******************************************************************************************************
* @param {string} url - the template Google Docs url
* @return {file} an HTML format to use in Gmail 
*/
function doc_to_html(url) {
  let id = url.split('/')[5]
  var url = "https://docs.google.com/feeds/download/documents/export/Export?id=" + id + "&exportFormat=html";
  var file_to_upload = UrlFetchApp.fetch(url, {
    method: "GET",
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true,
  }).getContentText();
  return file_to_upload
}










