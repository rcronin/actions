import * as Hub from "../../hub"

import * as Path from "path"
import * as Client from "promise-ftp"
import * as URL from "url"
import * as uuid from "uuid/v1"

export class FTPAction extends Hub.Action {

  name = "ftp"
  label = "FTP"
  iconName = "ftp/ftp.png"
  description = "Send data files to an FTP server."
  supportedActionTypes = [Hub.ActionType.Query]
  params = []

  async execute(request: Hub.ActionRequest) {
    const parsedUrl = URL.parse(request.formParams.address!)

    if (!parsedUrl.pathname) {
      throw new Error("Needs a valid FTP file path.")
    }

    if (!request.attachment || !request.attachment.dataBuffer) {
      throw new Error("Couldn't get attachment from data.")
    }

    console.log(JSON.stringify(request))
    console.log(request.attachment)
    const fileName = `${request.formParams.filename || uuid() as string}${request.attachment ? '.' + request.attachment.fileExtension :  ''}`
    const remotePath = Path.join(parsedUrl.pathname, fileName)

    let response
    try {
      //let chunks = new Array()
      //await request.stream(async (readable) => {
      //  readable.on("data", (chunk) => {
      //    chunks.push(chunk)
      //  })
      //})

      //let data = Buffer.concat(chunks)
      let data = request.attachment.dataBuffer;

      const client = await this.ftpClientFromRequest(request)

      await client.put(data, remotePath)

      await client.end()

      response = { success: true }
    } catch (err) {
      throw err
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
      throw new Error("Needs a valid FTP address.")
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
