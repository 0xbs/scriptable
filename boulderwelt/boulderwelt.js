function createWidget(location, data) {
    const locationNames = {
        "muenchen-ost": "München Ost",
        "muenchen-west": "München West",
        "muenchen-sued": "München Süd",
        "dortmund": "Dortmund",
        "frankfurt": "Frankfurt",
        "regensburg": "Regensburg",
        "karlsruhe": "Karlsruhe",
    }
    let widget = new ListWidget()
    widget.url = `https://www.boulderwelt-${location}.de/`

    let title = widget.addText("🧗 " + locationNames[location])
    title.font = Font.boldSystemFont(14)
    title.minimumScaleFactor = 0.7
    title.lineLimit = 1

    widget.addSpacer()

    if (data.error) {
        let errorTitle = widget.addText("Fehler beim Abruf der Daten")
        errorTitle.font = Font.regularSystemFont(15)
        errorTitle.textColor = Color.gray()
    } else {
        let levelTitle = widget.addText("Hallenbelegung")
        levelTitle.font = Font.regularSystemFont(12)
        levelTitle.textColor = Color.gray()
        levelTitle.minimumScaleFactor = 0.5

        let level = -1
        let queue = -1
        if (data.success) {
            level = data.level || -1
            queue = data.queue || -1
        }

        let levelText = widget.addText((level >= 0 ? level : "--") + "%")
        levelText.font = Font.regularSystemFont(36)
        levelText.minimumScaleFactor = 0.8
        levelText.textColor = Color.gray()
        if (level >= 90) {
            levelText.textColor = Color.red()
        } else if (level >= 80) {
            levelText.textColor = Color.orange()
        } else if (level >= 70) {
            levelText.textColor = Color.yellow()
        } else if (level >= 0) {
            levelText.textColor = Color.green()
        }

        if (queue >= 0) {
            let queueTitle = widget.addText("Warteschlange")
            queueTitle.font = Font.regularSystemFont(12)
            queueTitle.textColor = Color.gray()
            queueTitle.minimumScaleFactor = 0.5

            let queueText = widget.addText((queue >= 0 ? queue : "--") + " Personen")
            queueText.font = Font.regularSystemFont(18)
            queueText.minimumScaleFactor = 1
            if (queue > 20) {
                queueText.textColor = Color.red()
            } else if (queue > 10) {
                queueText.textColor = Color.orange()
            } else if (queue < 0) {
                queueText.textColor = Color.gray()
            }
        }
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
    req.headers = {"Content-Type": "application/x-www-form-urlencoded"}
    let response = {}
    try {
        response = await req.loadJSON()
        response.error = false
    } catch (e) {
        response.success = false
        response.error = true
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
    response.error = false
    response.level = level
    response.timestamp = new Date()
    return response
}

async function getData(location) {
    return getDataDirectly(location)
}

if (config.runsInApp) {
    // Demo for in-app testing
    let location = "muenchen-ost"
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
