function createWidget(location, occupancy, queue, timestamp) {
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
    title.font = Font.boldSystemFont(16)
    title.minimumScaleFactor = 0.8
    title.lineLimit = 2

    widget.addSpacer()

    let occupancyTitle = widget.addText("Hallenbelegung")
    occupancyTitle.font = Font.regularSystemFont(12)
    occupancyTitle.textColor = Color.gray()
    occupancyTitle.minimumScaleFactor = 0.5

    let occupancyText = widget.addText(occupancy + "%")
    occupancyText.font = Font.regularSystemFont(36)
    occupancyText.minimumScaleFactor = 0.8
    if (occupancy >= 90) {
        occupancyText.textColor = Color.red()
    } else if (occupancy >= 80) {
        occupancyText.textColor = Color.orange()
    } else if (occupancy >= 70) {
        occupancyText.textColor = Color.yellow()
    } else {
        occupancyText.textColor = Color.green()
    }

    widget.addSpacer()

    let queueTitle = widget.addText("Warteschlange")
    queueTitle.font = Font.regularSystemFont(12)
    queueTitle.textColor = Color.gray()
    queueTitle.minimumScaleFactor = 0.5

    let queueText = widget.addText(queue + " Personen")
    queueText.font = Font.regularSystemFont(18)
    queueText.minimumScaleFactor = 1
    if (queue > 20) {
        queueText.textColor = Color.red()
    } else if (queue > 10) {
        queueText.textColor = Color.orange()
    }

    //widget.addSpacer()

    let timestampText = widget.addDate(timestamp)
    timestampText.font = Font.regularSystemFont(10)
    timestampText.textColor = Color.gray()
    timestampText.minimumScaleFactor = 0.5
    timestampText.applyTimeStyle()

    return widget
}

async function getData(location) {
    let req = new Request(`https://www.boulderwelt-${location}.de/wp-admin/admin-ajax.php`)
    req.method = "POST"
    req.body = "action=cxo_get_crowd_indicator"
    req.headers = { "Content-Type": "application/x-www-form-urlencoded" }
    let response = await req.loadJSON()
    response.timestamp = new Date()
    return response
}

if (config.runsInApp) {
    // Demo for in-app testing
    let location = "muenchen-west"
    let data = await getData(location)
    let widget = createWidget(location, data.percent, data.queue, data.timestamp)
    widget.presentSmall()
} else {
    // The real deal
    let location = args.widgetParameter
    let data = await getData(location)
    let widget = createWidget(location, data.percent, data.queue, data.timestamp)
    Script.setWidget(widget)
}
Script.complete()
