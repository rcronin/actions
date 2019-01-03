import * as chai from "chai"
import * as chaiAsPromised from "chai-as-promised"
import * as sinonChai from "sinon-chai"
import * as winston from "winston"

const chaiHttp = require("chai-http")

chai.use(chaiHttp)
chai.use(sinonChai)
chai.use(chaiAsPromised) // should be last
winston.remove(winston.transports.Console)

import "../src/actions/index"

import "./test_actions"
import "./test_server"
import "./test_smoke"

import "../src/actions/ftp/ftp"

import { DebugAction } from "../src/actions/debug/debug"
import * as Hub from "../src/hub"

// Ensure the special debug action is tested
Hub.addAction(new DebugAction())
