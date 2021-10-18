function createWidget(location, data) {
    const locationNames = {
        "muenchen-ost": "München Ost",
        "muenchen-west": "München West",
        "muenchen-sued": "München Süd",
        "dortmund": "Dortmund",
        "frankfurt": "Frankfurt",
        "regensburg": "Regensburg",
    }
    let widget = new ListWidget()
    widget.url = `https://www.boulderwelt-${location}.de/`

    let title = widget.addText("🧗 " + locationNames[location])
    title.font = Font.boldSystemFont(14)
    title.minimumScaleFactor = 0.7
    title.lineLimit = 1

    widget.addSpacer()

    if (data.success) {
        let levelTitle = widget.addText("Hallenbelegung")
        levelTitle.font = Font.regularSystemFont(12)
        levelTitle.textColor = Color.gray()
        levelTitle.minimumScaleFactor = 0.5

        let levelText = widget.addText(data.level + "%")
        levelText.font = Font.regularSystemFont(36)
        levelText.minimumScaleFactor = 0.8
        if (data.level >= 90) {
            levelText.textColor = Color.red()
        } else if (data.level >= 80) {
            levelText.textColor = Color.orange()
        } else if (data.level >= 70) {
            levelText.textColor = Color.yellow()
        } else {
            levelText.textColor = Color.green()
        }
    } else {
        let errorTitle = widget.addText("Fehler beim Abruf der Daten")
        errorTitle.font = Font.regularSystemFont(15)
        errorTitle.textColor = Color.gray()
    }

    widget.addSpacer()

    let timestampText = widget.addDate(data.timestamp)
    timestampText.font = Font.regularSystemFont(10)
    timestampText.textColor = Color.gray()
    timestampText.minimumScaleFactor = 0.5
    timestampText.applyTimeStyle()

    return widget
}

async function getDataDirectly(location) {
    let req = new Request(`https://www.boulderwelt-${location}.de/wp-admin/admin-ajax.php`)
    req.method = "POST"
    req.body = "action=cxo_get_crowd_indicator"
    req.headers = { "Content-Type": "application/x-www-form-urlencoded" }
    let response = {}
    try {
        response = await req.loadJSON()
    } catch (e) {
        response.success = false
    }
    response.timestamp = new Date()
    return response
}

async function getDataFromIndicator(location) {
    let webview = new WebView()
    await webview.loadURL(`https://www.boulderwelt-${location}.de/`)
    let getLevel = `(function(){
        const img = document.querySelector('.crowd-level-pointer img')
        const style = img?.getAttribute('style')
        const regex = /margin-left\\s*:\\s*([\\d.]+)%/
        const found = style?.match(regex)
        if (!found) return -1
        const level = parseFloat(found[1])
        return Math.round(level)
    })()`
    let level = await webview.evaluateJavaScript(getLevel, false)
    let response = {}
    response.success = level >= 0
    response.level = level
    response.timestamp = new Date()
    return response
}

async function getData(location) {
    if (location === "muenchen-ost") {
        return getDataFromIndicator(location)
    } else {
        return getDataDirectly(location)
    }
}

if (config.runsInApp) {
    // Demo for in-app testing
    let location = "muenchen-west"
    let data = await getData(location)
    let widget = createWidget(location, data)
    widget.presentSmall()
} else {
    // The real deal
    let location = args.widgetParameter
    let data = await getData(location)
    let widget = createWidget(location, data)
    Script.setWidget(widget)
}
Script.complete()
