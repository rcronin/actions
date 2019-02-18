import * as Hub from "../../hub"

import * as Path from "path"
import * as Client from "promise-ftp"
import * as URL from "url"

export class FTPAction extends Hub.Action {

  name = "ftp"
  label = "FTP"
  iconName = "ftp/ftp.png"
  description = "Send data files to an FTP server."
  usesStreaming = true
  supportedActionTypes = [Hub.ActionType.Query]
  params = []

  async execute(request: Hub.ActionRequest) {
    const parsedUrl = URL.parse(request.formParams.address!)

    if (!parsedUrl.pathname) {
      throw "Needs a valid FTP file path."
    }

    console.log("line 25")
    console.log(JSON.stringify(request.formParams))
    const fileName = request.formParams.filename || request.suggestedFilename() as string
    const remotePath = Path.join(parsedUrl.pathname, fileName)

    let response
    try {
      let chunks = new Array()
      await request.stream(async (readable) => {
        readable.on("data", (chunk) => {
          chunks.push(chunk)
        })
      })

      let data = Buffer.concat(chunks)

      const client = await this.ftpClientFromRequest(request)

      await client.put(data, remotePath)

      await client.end()

      response = { success: true }
    } catch (err) {
      response = { success: false, message: err.message }
    } 

    return new Hub.ActionResponse(response)
  }

  async form() {
    const form = new Hub.ActionForm()
    form.fields = [{
      name: "address",
      label: "Address",
      description: "e.g. ftp://host/path/",
      type: "string",
      required: true,
    }, {
      name: "username",
      label: "Username",
      type: "string",
      required: true,
    }, {
      name: "password",
      label: "Password",
      type: "string",
      required: true,
      sensitive: true,      
    }, {
      label: "Filename",
      name: "filename",
      type: "string",
    }]
    return form
  }

  private async ftpClientFromRequest(request: Hub.ActionRequest) {
    const client = new Client()
    const parsedUrl = URL.parse(request.formParams.address!)

    if (!parsedUrl.hostname) {
      throw "Needs a valid FTP address."
    }

    try {
      await client.connect({
        host: parsedUrl.hostname,
        user: request.formParams.username,
        password: request.formParams.password,
        port: +(parsedUrl.port ? parsedUrl.port : 21),
      })
    } catch (e) {
      throw e
    }

    return client
  }

}

Hub.addAction(new FTPAction())
