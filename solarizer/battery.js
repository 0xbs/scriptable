// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: sun;

const baseURL = 'https://solarizer.0xbs.de'
const widgetURL = 'https://www.solarweb.com'
const battPowerTreshold = 10 // minimum Watts to be recognized as (dis)charging

function createWidget(powerData) {
    const widget = new ListWidget()
    widget.url = widgetURL

    const title = widget.addText('Batterie')
    title.font = Font.boldSystemFont(18)

    const timestampText = widget.addDate(powerData.timestamp)
    timestampText.font = Font.regularSystemFont(10)
    timestampText.textColor = Color.gray()
    timestampText.applyTimeStyle()

    widget.addSpacer(10)

    if (powerData.error) {
        const errorTitle = widget.addText("Fehler beim Abruf der Daten")
        errorTitle.font = Font.regularSystemFont(15)
        errorTitle.textColor = Color.gray()
    } else {
        const batteryCharge = Math.round(powerData.SOC)
        const batteryPower = Math.round(powerData.P_Batt)

        let chargeTitle
        let chargeColor
        if (batteryPower <= battPowerTreshold) {
            // Charging
            chargeTitle = 'LÄDT ►'
            chargeColor = Color.green()
        } else if (batteryPower >= battPowerTreshold) {
            // Discharging
            chargeTitle = `◀ ENTLÄDT`
        } else {
            // Idle
            chargeTitle = 'LEERLAUF'
            chargeColor = Color.gray()
        }


        const chargeText = widget.addText(chargeTitle)
        chargeText.font = Font.boldSystemFont(12)
        if (chargeColor) {
            chargeText.textColor = chargeColor
        }

        widget.addSpacer(5)

        widget.addImage(drawBatteryImage(batteryCharge))

        widget.addSpacer(5)

        const powerText = widget.addText(`Leistung: ${batteryPower} W`)
        powerText.font = Font.regularSystemFont(12)
    }

    return widget
}

function drawBatteryImage(percent) {
    const fillSize = 68 * percent / 100
    let color = Color.green()
    if (percent <= 10) {
        color = Color.red()
    } else if (percent <= 20) {
        color = Color.orange()
    } else if (percent <= 40) {
        color = Color.yellow()
    }

    const c = new DrawContext()
    c.opaque = false
    c.respectScreenScale = true
    c.size = new Size(75, 32)

    const battFillBg = new Path()
    battFillBg.addRoundedRect(new Rect(2, 2, 68, 28), 4, 4)
    c.addPath(battFillBg)
    c.setFillColor(Color.darkGray())
    c.fillPath()

    const battFill = new Path()
    battFill.addRoundedRect(new Rect(2, 2, fillSize, 28), 4, 4)
    c.addPath(battFill)
    c.setFillColor(color)
    c.fillPath()

    c.setFont(Font.boldSystemFont(18))
    c.setTextColor(Color.white())
    c.setTextAlignedCenter()
    c.drawTextInRect(`${percent}%`, new Rect(2, 5, 68, 20))

    const battOutline = new Path()
    battOutline.addRoundedRect(new Rect(1, 1, 70, 30), 5, 5)
    c.addPath(battOutline)
    c.setStrokeColor(Color.gray())
    c.setLineWidth(1)
    c.strokePath()

    const battNodge = new Path()
    battNodge.addRoundedRect(new Rect(71, 11, 3, 10), 2, 2)
    c.addPath(battNodge)
    c.setFillColor(Color.gray())
    c.fillPath()

    return c.getImage()
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
