// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: sun;

const baseURL = 'https://solarizer.0xbs.de'
const widgetURL = 'https://www.solarweb.com'

function createWidget(powerData) {
    const widget = new ListWidget()
    widget.url = widgetURL

    const titleRow = widget.addStack()
    titleRow.layoutHorizontally()

    const titleCol1 = titleRow.addStack()
    titleCol1.layoutVertically()
    titleCol1.addSpacer(3)

    const title = titleCol1.addText('Leistung')
    title.font = Font.boldSystemFont(18)

    const unitDateRow = titleCol1.addStack()
    const unitText = unitDateRow.addText("in Watt um")
    unitText.font = Font.regularSystemFont(10)
    unitText.textColor = Color.gray()
    unitDateRow.addSpacer(2)
    const timestampText = unitDateRow.addDate(powerData.timestamp)
    timestampText.font = Font.regularSystemFont(10)
    timestampText.textColor = Color.gray()
    timestampText.applyTimeStyle()

    titleRow.addSpacer(10)

    const titleCol2 = titleRow.addStack()
    const icon = titleCol2.addText('☀️')
    icon.font = Font.boldSystemFont(28)

    widget.addSpacer(10)

    if (powerData.error) {
        const errorTitle = widget.addText("Fehler beim Abruf der Daten")
        errorTitle.font = Font.regularSystemFont(15)
        errorTitle.textColor = Color.gray()
    } else {
        const loadPower = powerData.P_Load
        const pvPower = powerData.P_PV
        const gridPower = powerData.P_Grid
        const battPower = powerData.P_Batt

        const table = widget.addStack()
        const col1 = table.addStack()
        col1.layoutVertically()
        table.addSpacer(10)
        const col2 = table.addStack()
        col2.layoutVertically()

        const leftTop = col1.addStack()
        leftTop.layoutVertically()
        col1.addSpacer(5)
        const rightTop = col2.addStack()
        rightTop.layoutVertically()
        const leftBottom = col1.addStack()
        leftBottom.layoutVertically()
        col2.addSpacer(5)
        const rightBottom = col2.addStack()
        rightBottom.layoutVertically()

        const pvPowerTitle = leftTop.addText(formatPowerSign(pvPower) + ' PV')
        pvPowerTitle.font = Font.regularSystemFont(12)
        const pvPowerText = leftTop.addText(formatPower(pvPower))
        pvPowerText.textColor = Color.orange()
        pvPowerText.font = Font.boldSystemFont(18)

        const gridPowerTitle = rightTop.addText(formatPowerSign(gridPower) + ' NETZ')
        gridPowerTitle.font = Font.regularSystemFont(12)
        const gridPowerText = rightTop.addText(formatPower(gridPower))
        gridPowerText.textColor = Color.blue()
        gridPowerText.font = Font.boldSystemFont(18)

        const loadPowerTitle = leftBottom.addText(formatPowerSign(loadPower) + ' LAST')
        loadPowerTitle.font = Font.regularSystemFont(12)
        const loadPowerText = leftBottom.addText(formatPower(loadPower))
        loadPowerText.textColor = Color.red()
        loadPowerText.font = Font.boldSystemFont(18)

        const battPowerTitle = rightBottom.addText(formatPowerSign(battPower) + ' BATT')
        battPowerTitle.font = Font.regularSystemFont(12)
        const battPowerText = rightBottom.addText(formatPower(battPower))
        battPowerText.textColor = Color.green()
        battPowerText.font = Font.boldSystemFont(18)
    }

    return widget
}

function formatPowerSign(p) {
    return p >= 0 ? '▼' : '▲'
}

function formatPower(p) {
    return Math.abs(Math.round(p)).toLocaleString()
}

async function getData(endpoint, apiToken) {
    const req = new Request(baseURL + endpoint)
    req.method = 'GET'
    req.headers = {'Authorization': 'Bearer ' + apiToken}
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

const apiToken = args.widgetParameter
const powerData = await getData('/api/pv/power', apiToken)
//let earningsData = await getData('/api/pv/earnings', apiToken)
//let balanceData = await getData('/api/pv/balance', apiToken)


let widget = createWidget(powerData)
if (config.runsInApp) {
    widget.presentSmall()
}
Script.setWidget(widget)
Script.complete()
