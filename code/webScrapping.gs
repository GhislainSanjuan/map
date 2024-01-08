/**
 * Extract the content as text rom a webpage
 *
 * @param {string} url - url webpage
 * @return {string} A webpage html text
**/
function extractHTML(url) {
  return UrlFetchApp.fetch(url).getContentText()
}

/**
 * Loop over the product help centers and extract the skills (chapter/article and their url )
 * This function runs in a trigger to update the product skill at a specific frequency
 * 
 * @param {} 
 * @return {} 
**/
/**
 * Loop over the product help centers and extract the skills (chapter/article and their url )
 * This function runs in a trigger to update the product skill at a specific frequency
 * 
 * @param {} 
 * @return {} 
**/
function webScrapping() {
  let productSkillsData = []

  // List all the products from wich we need to extract the data
  let linksToScrap = PRODUCTS.getDataRange().getValues().slice(1).filter(x => x[0] != "")
  linksToScrap.forEach(function (t) {
    Logger.log(t)
    // Depending on the help center, the scrapping is donne differently
    // For the type 1 : All the links are article link in collapsible elements
    // For the type 2 : All the links are direct link in <a> html elements
    // For the type 0 : Specific help center that cannot be scrapped easily so we put the link to the webpage only
    switch (t[5]) {
      case 1:
        productSkillsData = productSkillsData.concat(scrapType1(t[0], t[4], t[6]))
        break
      case 2:
        productSkillsData = productSkillsData.concat(scrapType2(t[0], t[4], t[6]))
        break
      case 0:
      //ID	PRODUCT	CHAPTER	SKILL	CATEGORIE	TYPE	LEVEL	LINK
        productSkillsData.push([t[0], t[1], t[1], "", "WebScrapping", "", t[4]])
        break
      default:
        Logger.log("scrap type not defined")
    }

  })


  //Search for exitings links in the database 
  // If the link already exists ==> Update the line by keeping the id but changing all the other fields 
  // If link does not exists ==> add the line
  let currentDatabase = PRODUCTS_SKILLS.getDataRange().getValues().filter(x=>x[5]=="WebScrapping")
  let currentDatabaseUrls = currentDatabase.map(x => x[7])
  productSkillsData.forEach(function (t) {
    Utilities.sleep(10)
     //place a new id based on datetime
    t.unshift(new Date().getTime())
    //Check if the link is in the database 
    if (currentDatabaseUrls.indexOf(t[7]) > -1) {
      //Filter on the link (same url on several skills)
      let lines = currentDatabase.filter(x => x[7] == t[7])
      lines.forEach(function(line){
        let id=line[0]
        let difficultyLevel=line[6]
        let categorie=line[4]
        t[0]=id
        t[6]=difficultyLevel
        t[4]=categorie
        //the link is in the database ==> We place the database id, category and the difficulty in the array
        // Therefore we don't have to update line by line in the sheet but we can update in once with the productSkillData array
      })
      
    }
    
  })

  // Update existings links 
  // Check the links if not redirected => If it's the case , add the line in the array we will paste 
  let productSkillsDataIds = productSkillsData.map(x => x[0])
  let currentDatabaseRemaining = currentDatabase.filter(x => productSkillsDataIds.indexOf(x[0]) < 0).slice(1)
  currentDatabaseRemaining.forEach(function (t) {
    if (fetchPage(t[7])) {
      productSkillsData.push(t)
    }
  })

  
    return productSkillsData
}



/**
 * Function to scrap type 1 HelpCenter
 *
 * @param {string} idProduct
 * * @param {string} url - the help center url
 * * @param {string} lang - language chosen by the user to select the help center language
 * @return {array} the skills in an array  
**/
function scrapType1(idProduct, url, lang) {
  let tableScrap = []
  //HTML extraction in text
  let text = extractHTML(url)
  // Each chapter  is in a H3 element . So we split the text as an array with the <H3> tag
  let data = text.split('<h3 role="button"').slice(1)
  // Loop over the H3 element array 
  data.forEach(function (t) {
    //get the chapter (collapsible text element)
    let chapter = t.substring(14, getPosition(t, '<svg', 1)).replace('amp', "").replace(";", "")
    //in a H3 element , we have the skills and their link. So we split the text as an array with the <a> tag
    let items = t.split('<a class="')
    // Remove the first element 
    items = items.slice(1)
    if (items.length == 0) {
      // Split with another <a> tag for specific help center
      items = t.split('<a class="topic-link" href="').slice(1)
    }
    // The scrap is sometimes to fast to get a good scrapp so we slow down the code run a bit
    Utilities.sleep(10)
    // Loop over the a element array 
    items.forEach(function (u) {
      // Get the link id 
      let prefix = u.substring(getPosition(u, "=", 1) + 2, getPosition(u, "=", 1) + 6)
      // Get the url link
      let itemUrl = prefix == "http" ? u.substring(getPosition(u, "=", 1) + 2, getPosition(u, ">", 1) - 1).replace('amp', "").replace(";", "") + "?hl=" + lang : "https://support.google.com" + u.substring(getPosition(u, "/", 1), getPosition(u, ">", 1) - 1).replace('amp', "").replace(";", "")
      //H=get the skill/article name
      let itemName = u.substring(getPosition(u, ">", 1) + 1, getPosition(u, "<", 1)).replace('amp', "").replace(";", "").replace("&nbsp", " ")
      //Push informations into the table
      //ID,	PRODUCT,	CHAPTER,	SKILL,	CATEGORIE,	TYPE,	LEVEL,	LINK
      tableScrap.push([idProduct, chapter, itemName, "", "WebScrapping", "", itemUrl])
    })
  })
  return tableScrap.filter(x => x[2] != " ")
}


/**
 * Function to scrap type 2 HelpCenter
 *
 * @param {string} idProduct
 * * @param {string} url - the help center url
 * * @param {string} lang - language chosen by the user to select the help center language
 * @return {array} the skills in an array  
**/
function scrapType2(idProduct, url, lang) {
  let tableScrap = []
  let text = extractHTML(url)
  let data = text.split('<h2>').slice(1)
  data.forEach(function (t) {
    let chapter = t.substring(0, getPosition(t, '</h2>', 1)).replace('amp', "").replace(";", "").replace('&nbsp', " ")
    let items = t.split('<li class="topic-content-child">').slice(1)
    items.forEach(function (u) {
      let itemUrl = "https://support.google.com" + u.substring('<a href="'.length, getPosition(u, ">", 1) - 1).replace('amp', "").replace(";", "").replace('&nbsp', " ")
      let itemName = u.substring(getPosition(u, ">", 1) + 1, getPosition(u, "</a", 1)).replace('amp', "").replace(";", "").replace('&nbsp', " ")
      //ID,	PRODUCT,	CHAPTER,	SKILL,	CATEGORIE,	TYPE,	LEVEL,	LINK
      tableScrap.push([idProduct, chapter, itemName, "", "WebScrapping", "", itemUrl])
    })
  })
  return tableScrap
}
/**
 * Function to get the position of  the nth element in a text
 *
 * @param {string} text - the text where we will search the element
 * * @param {string} element - the text to search
 * * @param {string} index - the nth occurence from which we want the position
 * @return {number} the nth element position
**/
function getPosition(text, element, index) {
  let position = text.split(element, index).join(element).length;
  return position
}

/**
 * Function to extract a text between 2 positions
 *
 * @param {string} text 
 * * @param {string} start
 * * @param {string} end 
 * @return {string } the subtext 
**/
function extractTextBetweenPos(text, start, number) {
  return text.substring(start, number)
}

/**
 * Function to test error 404 on url i.e. to check if an url is valid or not
 *
 * @param {string} url 

 * @return {bool } true is url valid, if not false
**/
function fetchPage(url) {
  try {
    //Logger.log(url)
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true, 'followRedirects': false });

    if (response.getResponseCode() == 404) {
      return false
    }
    return true
  }
  catch (e) {
    Logger.log(e)
    return false
  }
}

