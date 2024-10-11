

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UtilsService } from './utils.service'


const mockResponse: any = {
  '/unixfile/contents/?responseType=raw': {
    "entries": [
      {
        "name": ".sh_history",
        "path": "/proj/nwtqa/.sh_history",
        "directory": false,
        "size": 105467,
        "ccsid": 0,
        "createdAt": "2024-10-11T01:50:06",
        "mode": 600,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d206",
        "path": "/proj/nwtqa/d206",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-07T17:11:35",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d200",
        "path": "/proj/nwtqa/d200",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-07T04:36:48",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".bash_history",
        "path": "/proj/nwtqa/.bash_history",
        "directory": false,
        "size": 5595,
        "ccsid": 819,
        "createdAt": "2024-10-10T15:31:54",
        "mode": 600,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d304",
        "path": "/proj/nwtqa/d304",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-09-30T06:16:22",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d285",
        "path": "/proj/nwtqa/d285",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-08-06T21:10:22",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "csmvdqe",
        "path": "/proj/nwtqa/csmvdqe",
        "directory": false,
        "size": 1766,
        "ccsid": 0,
        "createdAt": "2020-09-30T14:23:53",
        "mode": 711,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "priyaranjan",
        "path": "/proj/nwtqa/priyaranjan",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2022-07-18T07:50:44",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d307",
        "path": "/proj/nwtqa/d307",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-09-30T12:52:57",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d207",
        "path": "/proj/nwtqa/d207",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-09T06:37:18",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d204",
        "path": "/proj/nwtqa/d204",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-09T10:43:07",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ":",
        "path": "/proj/nwtqa/:",
        "directory": false,
        "size": 0,
        "ccsid": 0,
        "createdAt": "2023-12-21T05:42:25",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "qa_doeserver21",
        "path": "/proj/nwtqa/qa_doeserver21",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-11-19T10:34:53",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "d314",
        "path": "/proj/nwtqa/d314",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-02-01T10:05:30",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d407",
        "path": "/proj/nwtqa/d407",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-11T04:05:37",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d310",
        "path": "/proj/nwtqa/d310",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-09-26T08:17:38",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "doeserver",
        "path": "/proj/nwtqa/doeserver",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-11-28T06:42:04",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "d313",
        "path": "/proj/nwtqa/d313",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-09T05:56:31",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d203",
        "path": "/proj/nwtqa/d203",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-07-25T08:43:43",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d178",
        "path": "/proj/nwtqa/d178",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-10T06:20:27",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d305",
        "path": "/proj/nwtqa/d305",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-07T06:48:23",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d100",
        "path": "/proj/nwtqa/d100",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-08T01:00:55",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d213",
        "path": "/proj/nwtqa/d213",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-07T16:35:51",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".bash_profile",
        "path": "/proj/nwtqa/.bash_profile",
        "directory": false,
        "size": 1192,
        "ccsid": 819,
        "createdAt": "2019-09-06T18:12:21",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "d411",
        "path": "/proj/nwtqa/d411",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-09-18T04:56:45",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".Xauthority",
        "path": "/proj/nwtqa/.Xauthority",
        "directory": false,
        "size": 1500,
        "ccsid": 0,
        "createdAt": "2024-10-09T10:16:15",
        "mode": 600,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d283",
        "path": "/proj/nwtqa/d283",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-06-25T23:39:44",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d201",
        "path": "/proj/nwtqa/d201",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-10T05:34:54",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".zowe_profile",
        "path": "/proj/nwtqa/.zowe_profile",
        "directory": false,
        "size": 334,
        "ccsid": 1047,
        "createdAt": "2019-10-01T12:19:39",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "zowe",
        "path": "/proj/nwtqa/zowe",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-03-25T17:14:56",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": ".ssh",
        "path": "/proj/nwtqa/.ssh",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-03-18T09:05:35",
        "mode": 700,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": ".bashrc",
        "path": "/proj/nwtqa/.bashrc",
        "directory": false,
        "size": 366,
        "ccsid": 819,
        "createdAt": "2019-09-12T11:55:01",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "d378",
        "path": "/proj/nwtqa/d378",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-04T08:16:50",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d284",
        "path": "/proj/nwtqa/d284",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-04-09T19:20:14",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d311",
        "path": "/proj/nwtqa/d311",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-03T06:12:41",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "ZOWE_PAX_STORAGE",
        "path": "/proj/nwtqa/ZOWE_PAX_STORAGE",
        "directory": false,
        "size": 21,
        "ccsid": 0,
        "createdAt": "2023-02-02T09:45:17",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".npm",
        "path": "/proj/nwtqa/.npm",
        "directory": true,
        "size": 32768,
        "ccsid": 0,
        "createdAt": "2019-05-09T16:19:45",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "d209",
        "path": "/proj/nwtqa/d209",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-09T05:26:42",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d303",
        "path": "/proj/nwtqa/d303",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-09-26T07:45:18",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d208",
        "path": "/proj/nwtqa/d208",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-09-24T05:30:00",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "naxqa",
        "path": "/proj/nwtqa/naxqa",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-05-02T08:38:02",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "d878",
        "path": "/proj/nwtqa/d878",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-02-01T10:56:24",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "qa_scripts",
        "path": "/proj/nwtqa/qa_scripts",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-04-15T21:06:55",
        "mode": 775,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "fresh_readonly",
        "path": "/proj/nwtqa/fresh_readonly",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-08-21T11:51:43",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "d312",
        "path": "/proj/nwtqa/d312",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-09-18T16:41:38",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d220",
        "path": "/proj/nwtqa/d220",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-09-24T11:42:33",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d308",
        "path": "/proj/nwtqa/d308",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-06-10T10:51:18",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d309",
        "path": "/proj/nwtqa/d309",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-09T07:31:24",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "nax-pax-creation",
        "path": "/proj/nwtqa/nax-pax-creation",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-10-31T05:27:33",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "tmp",
        "path": "/proj/nwtqa/tmp",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2022-11-07T03:11:41",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d205",
        "path": "/proj/nwtqa/d205",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-06T10:33:08",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d306",
        "path": "/proj/nwtqa/d306",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-08T10:34:26",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d210",
        "path": "/proj/nwtqa/d210",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-09-23T15:08:42",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d202",
        "path": "/proj/nwtqa/d202",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-01T10:23:57",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d401",
        "path": "/proj/nwtqa/d401",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2023-11-09T13:03:00",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d478",
        "path": "/proj/nwtqa/d478",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-04T07:57:56",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "DELETE_ME",
        "path": "/proj/nwtqa/DELETE_ME",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-12-09T10:29:19",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "certs",
        "path": "/proj/nwtqa/certs",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-10-01T16:05:43",
        "mode": 775,
        "owner": "CSIZPA",
        "group": "IZPUSS"
      },
      {
        "name": "qa_doeserver25",
        "path": "/proj/nwtqa/qa_doeserver25",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-12-02T09:16:54",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "qa_doeui25",
        "path": "/proj/nwtqa/qa_doeui25",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-12-02T09:16:55",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "d408",
        "path": "/proj/nwtqa/d408",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-04T01:24:28",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "csmvdqe.pub",
        "path": "/proj/nwtqa/csmvdqe.pub",
        "directory": false,
        "size": 394,
        "ccsid": 0,
        "createdAt": "2020-09-30T14:23:53",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "kkamada",
        "path": "/proj/nwtqa/kkamada",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2022-03-25T08:14:56",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".viminfo",
        "path": "/proj/nwtqa/.viminfo",
        "directory": false,
        "size": 29983,
        "ccsid": 819,
        "createdAt": "2023-12-07T07:50:32",
        "mode": 600,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": ".saves-67305800-RS23~",
        "path": "/proj/nwtqa/.saves-67305800-RS23~",
        "directory": false,
        "size": 398,
        "ccsid": 0,
        "createdAt": "2024-04-16T18:26:25",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d278",
        "path": "/proj/nwtqa/d278",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-10T13:46:14",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "install_script",
        "path": "/proj/nwtqa/install_script",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-06-18T06:54:00",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "amruta_imp",
        "path": "/proj/nwtqa/amruta_imp",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-08-15T09:17:55",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "muthu",
        "path": "/proj/nwtqa/muthu",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2022-05-11T09:06:32",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "test.txt",
        "path": "/proj/nwtqa/test.txt",
        "directory": false,
        "size": 0,
        "ccsid": 0,
        "createdAt": "2022-11-16T11:11:03",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".lesshst",
        "path": "/proj/nwtqa/.lesshst",
        "directory": false,
        "size": 41,
        "ccsid": 819,
        "createdAt": "2024-09-10T07:22:32",
        "mode": 600,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "d299",
        "path": "/proj/nwtqa/d299",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-07-09T12:53:08",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "yduj",
        "path": "/proj/nwtqa/yduj",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-07-08T16:17:10",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "doe_perf_test_data",
        "path": "/proj/nwtqa/doe_perf_test_data",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-04-27T00:44:13",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "symlink",
        "path": "/proj/nwtqa/symlink",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2022-11-25T09:20:10",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "tmp1.crT",
        "path": "/proj/nwtqa/tmp1.crT",
        "directory": false,
        "size": 2354,
        "ccsid": 819,
        "createdAt": "2022-07-21T14:04:39",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "tmp1.crt",
        "path": "/proj/nwtqa/tmp1.crt",
        "directory": false,
        "size": 2354,
        "ccsid": 819,
        "createdAt": "2022-07-21T14:05:14",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "ts4898                    x",
        "path": "/proj/nwtqa/ts4898                    x",
        "directory": true,
        "size": 0,
        "ccsid": 0,
        "createdAt": "2023-05-03T12:02:04",
        "mode": 600,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".ffi",
        "path": "/proj/nwtqa/.ffi",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-11-23T10:40:12",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "zowe_smpe",
        "path": "/proj/nwtqa/zowe_smpe",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-06-04T16:06:03",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "psmvdqe                   x",
        "path": "/proj/nwtqa/psmvdqe                   x",
        "directory": true,
        "size": 0,
        "ccsid": 0,
        "createdAt": "2023-05-03T12:02:10",
        "mode": 600,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "preeti",
        "path": "/proj/nwtqa/preeti",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2023-05-03T14:35:00",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".tmp",
        "path": "/proj/nwtqa/.tmp",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-08-03T17:41:55",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "Query_tuning_Apr2024",
        "path": "/proj/nwtqa/Query_tuning_Apr2024",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-04-16T05:17:30",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "nims",
        "path": "/proj/nwtqa/nims",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-01-08T01:53:09",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "d212",
        "path": "/proj/nwtqa/d212",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-07-16T12:38:39",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "dead.letter",
        "path": "/proj/nwtqa/dead.letter",
        "directory": false,
        "size": 294,
        "ccsid": 1047,
        "createdAt": "2022-07-18T10:42:43",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "zTEAM-please-delete-me",
        "path": "/proj/nwtqa/zTEAM-please-delete-me",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-04-09T17:03:14",
        "mode": 777,
        "owner": "NWTN01",
        "group": "PDUSER"
      },
      {
        "name": "preti",
        "path": "/proj/nwtqa/preti",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2023-05-03T14:53:14",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".saves-67503996-RS27~",
        "path": "/proj/nwtqa/.saves-67503996-RS27~",
        "directory": false,
        "size": 184,
        "ccsid": 0,
        "createdAt": "2023-05-05T14:29:25",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "prit",
        "path": "/proj/nwtqa/prit",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2023-08-08T10:26:15",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "scripts",
        "path": "/proj/nwtqa/scripts",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-10-29T16:27:45",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "jch",
        "path": "/proj/nwtqa/jch",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-09-09T03:07:38",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": ".emacs",
        "path": "/proj/nwtqa/.emacs",
        "directory": false,
        "size": 1030,
        "ccsid": 0,
        "createdAt": "2020-07-05T23:50:21",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "srv_merge",
        "path": "/proj/nwtqa/srv_merge",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-03-01T06:02:40",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "pdpenn",
        "path": "/proj/nwtqa/pdpenn",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-06-04T14:44:13",
        "mode": 755,
        "owner": "CSIZPA",
        "group": "IZPUSS"
      },
      {
        "name": ".bin",
        "path": "/proj/nwtqa/.bin",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-08-03T17:42:09",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "nax_admin_qa",
        "path": "/proj/nwtqa/nax_admin_qa",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-09-09T06:54:27",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": ".zowe",
        "path": "/proj/nwtqa/.zowe",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-08-03T17:43:45",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "zowe_certificates_keyring",
        "path": "/proj/nwtqa/zowe_certificates_keyring",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2022-03-01T21:46:44",
        "mode": 550,
        "owner": "CSIZPA",
        "group": "IZPUSS"
      },
      {
        "name": "leanid",
        "path": "/proj/nwtqa/leanid",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-08-03T18:12:23",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "nax_admin_qa1",
        "path": "/proj/nwtqa/nax_admin_qa1",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-09-11T14:15:13",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "tmp.crt",
        "path": "/proj/nwtqa/tmp.crt",
        "directory": false,
        "size": 2354,
        "ccsid": 819,
        "createdAt": "2022-05-08T20:25:25",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "nax-pax",
        "path": "/proj/nwtqa/nax-pax",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-09-11T14:22:22",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "Atharva",
        "path": "/proj/nwtqa/Atharva",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2023-05-12T09:49:02",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "ums-1.1",
        "path": "/proj/nwtqa/ums-1.1",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2022-10-19T08:28:21",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".condarc",
        "path": "/proj/nwtqa/.condarc",
        "directory": false,
        "size": 106,
        "ccsid": 1047,
        "createdAt": "2020-11-23T10:37:05",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "test.yaml",
        "path": "/proj/nwtqa/test.yaml",
        "directory": false,
        "size": 5987,
        "ccsid": 819,
        "createdAt": "2023-08-08T10:28:23",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "testn",
        "path": "/proj/nwtqa/testn",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-03-01T16:45:12",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "divya22",
        "path": "/proj/nwtqa/divya22",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2023-08-25T10:19:36",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".conda",
        "path": "/proj/nwtqa/.conda",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-11-23T10:38:37",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".python_history",
        "path": "/proj/nwtqa/.python_history",
        "directory": false,
        "size": 267,
        "ccsid": 0,
        "createdAt": "2021-01-21T09:48:57",
        "mode": 600,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "jitesh_zowe",
        "path": "/proj/nwtqa/jitesh_zowe",
        "directory": true,
        "size": 0,
        "ccsid": 0,
        "createdAt": "2024-05-16T05:28:23",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "senthillog_1649750035667.txt",
        "path": "/proj/nwtqa/senthillog_1649750035667.txt",
        "directory": false,
        "size": 310,
        "ccsid": 0,
        "createdAt": "2022-04-12T07:53:56",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "policy-backup-ga",
        "path": "/proj/nwtqa/policy-backup-ga",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-11-24T18:21:39",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".saves-84084373-RS23~",
        "path": "/proj/nwtqa/.saves-84084373-RS23~",
        "directory": false,
        "size": 1420,
        "ccsid": 0,
        "createdAt": "2023-08-09T18:42:05",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "tmp.ptktdata",
        "path": "/proj/nwtqa/tmp.ptktdata",
        "directory": false,
        "size": 25,
        "ccsid": 0,
        "createdAt": "2022-05-23T15:38:09",
        "mode": 666,
        "owner": "NWTSTC",
        "group": "IZPUSS"
      },
      {
        "name": "santosh",
        "path": "/proj/nwtqa/santosh",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-11-20T12:03:18",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "ivp_test",
        "path": "/proj/nwtqa/ivp_test",
        "directory": true,
        "size": 0,
        "ccsid": 0,
        "createdAt": "2020-12-01T06:58:31",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "qa_doeserver27",
        "path": "/proj/nwtqa/qa_doeserver27",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-12-05T13:00:47",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "qa_doeui27",
        "path": "/proj/nwtqa/qa_doeui27",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-12-05T13:00:48",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "configmgr-rexx",
        "path": "/proj/nwtqa/configmgr-rexx",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2022-08-04T17:38:39",
        "mode": 755,
        "owner": "CSIZPA",
        "group": "IZPUSS"
      },
      {
        "name": ".gitconfig",
        "path": "/proj/nwtqa/.gitconfig",
        "directory": false,
        "size": 1170,
        "ccsid": 819,
        "createdAt": "2024-04-01T09:47:47",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "products_testing",
        "path": "/proj/nwtqa/products_testing",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2022-08-09T13:52:20",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "archive.zip",
        "path": "/proj/nwtqa/archive.zip",
        "directory": false,
        "size": 1663314740,
        "ccsid": -1,
        "createdAt": "2022-09-16T10:33:51",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".saves-84018230-RS22~",
        "path": "/proj/nwtqa/.saves-84018230-RS22~",
        "directory": false,
        "size": 194,
        "ccsid": 0,
        "createdAt": "2024-06-24T18:54:20",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "prateek_cust",
        "path": "/proj/nwtqa/prateek_cust",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-12-06T09:48:10",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "smpetest",
        "path": "/proj/nwtqa/smpetest",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2019-12-07T05:37:51",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "users",
        "path": "/proj/nwtqa/users",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-05-18T22:22:40",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "ndoe_pune",
        "path": "/proj/nwtqa/ndoe_pune",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-03-21T18:08:23",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".saves-50725802-RS27~",
        "path": "/proj/nwtqa/.saves-50725802-RS27~",
        "directory": false,
        "size": 430,
        "ccsid": 0,
        "createdAt": "2023-09-11T17:56:02",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".ansible",
        "path": "/proj/nwtqa/.ansible",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-12-03T03:30:02",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "idaa_server_new",
        "path": "/proj/nwtqa/idaa_server_new",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2022-05-24T13:51:53",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "ZOWE_YAML_STORAGE",
        "path": "/proj/nwtqa/ZOWE_YAML_STORAGE",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2022-09-10T12:33:56",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "UsageCPU",
        "path": "/proj/nwtqa/UsageCPU",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-12-05T11:19:14",
        "mode": 751,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".profile",
        "path": "/proj/nwtqa/.profile",
        "directory": false,
        "size": 15164,
        "ccsid": 1047,
        "createdAt": "2019-05-22T07:15:40",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "PDUSER"
      },
      {
        "name": "policy_bk_senthil",
        "path": "/proj/nwtqa/policy_bk_senthil",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2023-07-20T12:44:18",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".saves-16975168-RS23~",
        "path": "/proj/nwtqa/.saves-16975168-RS23~",
        "directory": false,
        "size": 400,
        "ccsid": 0,
        "createdAt": "2023-09-12T13:36:13",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".mc",
        "path": "/proj/nwtqa/.mc",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-02-24T10:55:51",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "rinky",
        "path": "/proj/nwtqa/rinky",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2023-12-04T11:44:41",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "unified-ui",
        "path": "/proj/nwtqa/unified-ui",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-12-08T11:44:33",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".saves-83952737-RS22~",
        "path": "/proj/nwtqa/.saves-83952737-RS22~",
        "directory": false,
        "size": 452,
        "ccsid": 0,
        "createdAt": "2023-09-13T15:11:37",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "pax_extract",
        "path": "/proj/nwtqa/pax_extract",
        "directory": true,
        "size": 0,
        "ccsid": 0,
        "createdAt": "2021-05-06T14:39:41",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "pax_ext",
        "path": "/proj/nwtqa/pax_ext",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-05-06T14:40:27",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".vim",
        "path": "/proj/nwtqa/.vim",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-03-26T18:24:16",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "inpax",
        "path": "/proj/nwtqa/inpax",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-05-12T17:29:33",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "db2devops",
        "path": "/proj/nwtqa/db2devops",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-04-04T19:32:02",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "zowe-user-dir",
        "path": "/proj/nwtqa/zowe-user-dir",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-04-06T11:06:48",
        "mode": 771,
        "owner": "IZUSVR",
        "group": "IZPUSS"
      },
      {
        "name": ".saves-33752091-RS23~",
        "path": "/proj/nwtqa/.saves-33752091-RS23~",
        "directory": false,
        "size": 194,
        "ccsid": 0,
        "createdAt": "2023-09-13T17:43:01",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "{directory}",
        "path": "/proj/nwtqa/{directory}",
        "directory": true,
        "size": 0,
        "ccsid": 0,
        "createdAt": "2023-09-21T11:10:55",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "zosmf-auth",
        "path": "/proj/nwtqa/zosmf-auth",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-04-09T20:23:35",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "zss-auth",
        "path": "/proj/nwtqa/zss-auth",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2020-04-09T20:23:35",
        "mode": 771,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".cache",
        "path": "/proj/nwtqa/.cache",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2023-10-10T07:07:04",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".node_repl_history",
        "path": "/proj/nwtqa/.node_repl_history",
        "directory": false,
        "size": 17,
        "ccsid": 0,
        "createdAt": "2020-04-15T15:44:33",
        "mode": 600,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "test_sh",
        "path": "/proj/nwtqa/test_sh",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-05-13T10:26:24",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "idaa_server",
        "path": "/proj/nwtqa/idaa_server",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2022-01-27T09:26:38",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "zowe.yaml",
        "path": "/proj/nwtqa/zowe.yaml",
        "directory": false,
        "size": 2619,
        "ccsid": 1047,
        "createdAt": "2022-01-27T21:27:25",
        "mode": 644,
        "owner": "CSIZPA",
        "group": "IZPUSS"
      },
      {
        "name": ".keystore",
        "path": "/proj/nwtqa/.keystore",
        "directory": false,
        "size": 3488,
        "ccsid": 0,
        "createdAt": "2020-04-17T20:29:35",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "ManagedPromotions.ddl",
        "path": "/proj/nwtqa/ManagedPromotions.ddl",
        "directory": false,
        "size": 57073,
        "ccsid": 819,
        "createdAt": "2022-12-20T06:37:38",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".saves-50529488-RS23~",
        "path": "/proj/nwtqa/.saves-50529488-RS23~",
        "directory": false,
        "size": 140,
        "ccsid": 0,
        "createdAt": "2023-09-22T18:24:24",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".local",
        "path": "/proj/nwtqa/.local",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2023-10-10T07:27:21",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "idaa_copy",
        "path": "/proj/nwtqa/idaa_copy",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2022-02-07T10:09:32",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "CEEDUMP.20231011.200431.394841",
        "path": "/proj/nwtqa/CEEDUMP.20231011.200431.394841",
        "directory": false,
        "size": 179152,
        "ccsid": 0,
        "createdAt": "2023-10-12T00:04:31",
        "mode": 640,
        "owner": "OMVSKERN",
        "group": "IZPUSS"
      },
      {
        "name": ".saves-84148858-RS25~",
        "path": "/proj/nwtqa/.saves-84148858-RS25~",
        "directory": false,
        "size": 302,
        "ccsid": 0,
        "createdAt": "2023-11-22T17:06:24",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "AdityaR",
        "path": "/proj/nwtqa/AdityaR",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-05-18T11:03:48",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "RS22DC1A.der",
        "path": "/proj/nwtqa/RS22DC1A.der",
        "directory": false,
        "size": 0,
        "ccsid": 819,
        "createdAt": "2021-09-29T04:27:47",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "Satish",
        "path": "/proj/nwtqa/Satish",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-06-28T14:11:30",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "JES Explorer",
        "path": "/proj/nwtqa/JES Explorer",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-04-08T03:17:03",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "test_af",
        "path": "/proj/nwtqa/test_af",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-05-28T10:55:26",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "AFDSMP",
        "path": "/proj/nwtqa/AFDSMP",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-04-21T08:56:35",
        "mode": 751,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "java.security",
        "path": "/proj/nwtqa/java.security",
        "directory": false,
        "size": 57290,
        "ccsid": 0,
        "createdAt": "2021-04-15T10:18:09",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "tuningServer",
        "path": "/proj/nwtqa/tuningServer",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-08-13T12:40:27",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "amruta",
        "path": "/proj/nwtqa/amruta",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-08-18T12:48:31",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "Query_Tuning",
        "path": "/proj/nwtqa/Query_Tuning",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-08-19T07:46:10",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "RS27QB1X.der",
        "path": "/proj/nwtqa/RS27QB1X.der",
        "directory": false,
        "size": 870,
        "ccsid": 819,
        "createdAt": "2021-09-29T04:43:49",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "demo",
        "path": "/proj/nwtqa/demo",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-09-10T17:08:29",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "ivp-asaraf_feature-latest.pax",
        "path": "/proj/nwtqa/ivp-asaraf_feature-latest.pax",
        "directory": false,
        "size": 483840,
        "ccsid": 819,
        "createdAt": "2021-09-17T18:27:27",
        "mode": 644,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "senthil",
        "path": "/proj/nwtqa/senthil",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-09-20T11:50:37",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "Query_Tuning_Server",
        "path": "/proj/nwtqa/Query_Tuning_Server",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-09-24T10:50:34",
        "mode": 775,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "mvscmd",
        "path": "/proj/nwtqa/mvscmd",
        "directory": false,
        "size": 271,
        "ccsid": 1047,
        "createdAt": "2021-10-04T02:52:20",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "Senthil",
        "path": "/proj/nwtqa/Senthil",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-10-27T17:43:24",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "proj",
        "path": "/proj/nwtqa/proj",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-11-01T08:23:37",
        "mode": 750,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "amaan",
        "path": "/proj/nwtqa/amaan",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-11-25T05:23:35",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "idaa",
        "path": "/proj/nwtqa/idaa",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2021-11-25T10:52:51",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": ".rnd",
        "path": "/proj/nwtqa/.rnd",
        "directory": false,
        "size": 1024,
        "ccsid": 0,
        "createdAt": "2021-11-25T11:04:47",
        "mode": 600,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      }
    ]
  },
  '/unixfile/metadata/proj/nwtqa/d305?responseType=raw': {
    "path": "/proj/nwtqa/d305",
    "directory": true,
    "size": 8192,
    "ccsid": 0,
    "createdAt": "2024-10-07T06:48:23",
    "mode": 777,
    "owner": "CSMVDQA",
    "group": "IZPUSS"
  },
  '/unixfile/contents/proj/nwtqa/d305?responseType=raw': {
    "entries": [
      {
        "name": "zowe_runtime",
        "path": "/proj/nwtqa/d305/zowe_runtime",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-07T06:48:23",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "zowe-2.17.0.yaml",
        "path": "/proj/nwtqa/d305/zowe-2.17.0.yaml",
        "directory": false,
        "size": 3767,
        "ccsid": 0,
        "createdAt": "2024-10-07T06:48:54",
        "mode": 664,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "zowe_certificates",
        "path": "/proj/nwtqa/d305/zowe_certificates",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-07T06:49:19",
        "mode": 775,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "zowe_logs",
        "path": "/proj/nwtqa/d305/zowe_logs",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-07T06:49:41",
        "mode": 775,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "zowe_workspace",
        "path": "/proj/nwtqa/d305/zowe_workspace",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-07T06:49:49",
        "mode": 770,
        "owner": "NWTSTC",
        "group": "IZPUSS"
      },
      {
        "name": "izp",
        "path": "/proj/nwtqa/d305/izp",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-07T06:50:00",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "izp-admin-fdn-db2",
        "path": "/proj/nwtqa/d305/izp-admin-fdn-db2",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-07T06:50:40",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "izp-devops-db2",
        "path": "/proj/nwtqa/d305/izp-devops-db2",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-07T06:50:41",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "izp.yaml",
        "path": "/proj/nwtqa/d305/izp.yaml",
        "directory": false,
        "size": 2239,
        "ccsid": 1047,
        "createdAt": "2024-10-07T06:52:14",
        "mode": 640,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "zowe_extensions",
        "path": "/proj/nwtqa/d305/zowe_extensions",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-07T06:53:19",
        "mode": 755,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
      },
      {
        "name": "vdata2",
        "path": "/proj/nwtqa/d305/vdata2",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-07T06:54:03",
        "mode": 775,
        "owner": "NWTSTC",
        "group": "IZPUSS"
      }
    ]
  },
  '/unixfile/contents/proj/nwtqa/d305/izp.yaml?responseType=b64': 'Y29tcG9uZW50czoKICBpenA6CiAgICBlbmFibGVkOiB0cnVlCiAgICBkZWJ1Z1NoZWxsU2NyaXB0czogZmFsc2UKICAgIGV4cGVyaWVuY2VzOgogICAgLSAvcHJvai9ud3RxYS9kMzA1L2l6cC1hZG1pbi1mZG4tZGIyCiAgICAtIC9wcm9qL253dHFhL2QzMDUvaXpwLWRldm9wcy1kYjIKICAgIGpvYkNhcmQ6IFtdCiAgICBydW50aW1lRGlyZWN0b3J5OiAvcHJvai9ud3RxYS9kMzA1L2l6cAogICAgd29ya3NwYWNlRGlyZWN0b3J5OiAvcHJvai9ud3RxYS9kMzA1L3ZkYXRhMgogICAgbWlncmF0aW9uRGlyZWN0b3J5OiAnJwogICAgc2VjdXJpdHk6CiAgICAgIHVzZVNBRk9ubHk6IHRydWUKICAgICAgZGJhOgogICAgICAgIGRlZmF1bHRBdXRoZW50aWNhdGlvbk1lY2hhbmlzbTogUEFTU1dPUkQKICAgICAgICBkZWZhdWx0RGJhVXNlckNlcnRpZmljYXRlTGFiZWw6IFJTUExFWDAxX0NTSVpQS19DUwogICAgICAgIGRlZmF1bHREYmFVc2VyQ2VydGlmaWNhdGVMb2NhdGlvbjogc2Fma2V5cmluZzovL0NTSVpQSy9DU0laUEtSaW5nCiAgICAgICAgZGVmYXVsdERiYVVzZXJDZXJ0aWZpY2F0ZUtleXN0b3JlVHlwZTogSkNFUkFDRktTCiAgICAgIHByb2ZpbGVRdWFsaWZpZXI6ICcnCiAgICAgIHBrY3MxMToKICAgICAgICBkYmFVc2VyOiBDU01WRFFPCiAgICAgICAgdG9rZW46IE5XVE5PSwogICAgICAgIGxpYnJhcnk6IC91c3IvbHBwL3BrY3MxMS9saWIvY3NucGNhNjQuc28KICAgICAgY2VydGlmaWNhdGU6CiAgICAgICAgYWxsb3dTZWxmU2lnbmVkOiBmYWxzZQogICAgICAgIHRydXN0c3RvcmU6CiAgICAgICAgICBsb2NhdGlvbjogL3Byb2ovbnd0cWEvZDMwNS92ZGF0YTIvY29uZi9jYWNlcnRzCiAgICAgICAgICB0eXBlOiBKS1MKICAgICAgICBrZXlzdG9yZToKICAgICAgICAgIGxvY2F0aW9uOiAnJwogICAgICAgICAgdHlwZTogJycKICAgICAgICAgIGFsaWFzOiAnJwogICAgICBwcm9maWxlUHJlZml4OgogICAgICAgIHN1cGVyOiBJWlAuU1VQRVIKICAgICAgICBhZG1pbjogSVpQLkFETUlOCiAgICAgIHN1cnJvZ2F0ZVVzZXI6CiAgICAgICAgc3VwZXI6IElaUFNSR1NQCiAgICAgICAgYWRtaW46IElaUFNSR0FECiAgICAgIHN1cnJvZ2F0ZUdyb3VwOiBJWlBTUkdSUAogICAgc2VydmVyOgogICAgICB0bHNWZXJzaW9uTGlzdDogVExTdjEuMixUTFN2MS4zCiAgICAgIGF1dGhUeXBlOiBTVEFOREFSRF9KV1QKICAgICAgcG9ydDoKICAgICAgICBodHRwOiA1OTMwNQogICAgICAgIGFnZW50OiAzNDQ0CiAgICAgICAgZ3JlbWxpbjogODE4MgogICAgICBob3N0OiAnJwogICAgICBsb2c6CiAgICAgICAgZGVzdGluYXRpb246IEJPVEgKICAgICAgICBwcm9wZXJ0aWVzOiBbXQogICAgICBhcGlSYXRlQ2FwYWNpdHlCeVVzZXI6IDYwMDAKICAgICAgbWVtb3J5U2l6ZTogNDA5NgogICAgICBqb2JQcmVmaXg6IE5XVAogICAgICBmYWlsc2FmZVRpbWVvdXQ6IDEwMAogICAgICBncmFwaFFMVGltZW91dDogMzAwCiAgICAgIHN1YnN5c3RlbURpc2NvdmVyeToKICAgICAgICBpbnRlcnZhbDogMzAKICAgICAgb2JqZWN0RGlzY292ZXJ5SW50ZXJ2YWw6IDI0CiAgICAgIGFsbFN5c25hbWVzOiBSUzIyIFJTMjgKICAgICAgamF2YUFyZ3M6IFtdCiAgICBzeXNwbGV4OgogICAgICBsb2NhbDoKICAgICAgICBhY3R1YWxOYW1lOgogICAgICAgIHVuaXF1ZU5hbWU6CiAgICBkYXRhc2V0OgogICAgICBydW50aW1lSGxxOiBSU1FBLklaUC5EMzA1CiAgICAgIGhscTogUlNRQS5JWlAuRDMwNQogICAgICBwYXJtbGliOiBSU1FBLklaUC5EMzA1LlBBUk1MSUIKICAgICAgamNsbGliOiBSU1FBLklaUC5EMzA1LkpDTExJQgogICAgICBsb2FkTGlicmFyeToKICAgICAgICBkYjI6IERTTi5WQzEwLlNEU05MT0FECiAgICAgICAgaXpwOiAnJwogICAgICBkYmFFbmNyeXB0aW9uOiBSU1FBLklaUC5EMzA1LkNSWVBUCiAgICAgIHVzZXJMaXN0OiBSU1FBLklaUC5VU0VSTElTVC5EMzA1CiAgICAgIHRlYW1MaXN0OiBSU1FBLklaUC5URUFNTElTVC5EMzA1CiAgICB0b29sc0Rpc2NvdmVyeToKICAgICAgZW5hYmxlZDogdHJ1ZQogICAgICBkaXNjb3ZlcnlTZWFyY2hQYXRoczogW10KICAgIHpvd2U6CiAgICAgIGpvYjoKICAgICAgICBzdWZmaXg6IElaUAogICAgamF2YToKICAgICAgaG9tZTogJycKem93ZToKICBzZXR1cDoKICAgIHppczoKICAgICAgcGFybWxpYjoKICAgICAgICBrZXlzOgogICAgICAgICAgSVpQLlpTU1AuUkVHOiBsaXN0CiAgdXNlQ29uZmlnbWdyOiB0cnVlCg==',
}

@Injectable()
export class UssCrudService {

  private handleErrorObservable(error: Response | any) {
    console.error(error.message || error);
    return throwError(error.message || error);
  }
  constructor(private http: HttpClient, private utils: UtilsService) { }
  makeDirectory(path: string, forceOverwrite?: boolean): Observable<any> {
    let url: string = ZoweZLUX.uriBroker.unixFileUri('mkdir', path, undefined, undefined, undefined, forceOverwrite);
    return this.http.post(url, null).pipe(
      catchError(this.handleErrorObservable)
    )
  }

  makeFile(path: string): Observable<any> {
    let url: string = ZoweZLUX.uriBroker.unixFileUri('touch', path);
    return this.http.post(url, null).pipe(
      catchError(this.handleErrorObservable)
    )
  }

  getFileContents(path: string): Observable<any> {
    let filePath: string = this.utils.filePathCheck(path);
    let url: string = ZoweZLUX.uriBroker.unixFileUri('contents', filePath);
    if (mockResponse[url]) {
      return of(mockResponse[url]);
    } else {
      return this.http.get(url).pipe(
        catchError(this.handleErrorObservable)
      )
    }
  }

  getFileMetadata(path: string): Observable<any> {
    let filePath: string = this.utils.filePathCheck(path);
    let url: string = ZoweZLUX.uriBroker.unixFileUri('metadata', filePath);

    //TODO: Fix ZSS bug where "%2F" is not properly processed as a "/" character
    url = url.split("%2F").join("/");
    if (mockResponse[url]) {
      return of(mockResponse[url]);
    } else {
      return this.http.get(url).pipe(
        catchError(this.handleErrorObservable)
      )
    }
  }

  copyFile(oldPath: string, newPath: string, forceOverwrite?: boolean): Observable<any> {
    let url: string = ZoweZLUX.uriBroker.unixFileUri('copy', oldPath, undefined, undefined, newPath, forceOverwrite, undefined, true);
    return this.http.post(url, null).pipe(
      catchError(this.handleErrorObservable)
    )
  }

  deleteFileOrFolder(path: string): Observable<any> {
    let filePath: string = this.utils.filePathCheck(path);
    let url: string = ZoweZLUX.uriBroker.unixFileUri('contents', filePath);
    return this.http.delete(url).pipe(
      catchError(this.handleErrorObservable)
    )
  }

  renameFile(oldPath: string, newPath: string, forceOverwrite?: boolean): Observable<any> {
    let url: string = ZoweZLUX.uriBroker.unixFileUri('rename', oldPath, undefined, undefined, newPath, forceOverwrite);
    return this.http.post(url, null).pipe(
      catchError(this.handleErrorObservable)
    )
  }

  saveFile(path: string, fileContents: string, targetEncoding?: string, forceOverwrite?: boolean): Observable<any> {
    let url: string = ZoweZLUX.uriBroker.unixFileUri('contents', path, "UTF-8", targetEncoding, undefined, forceOverwrite, undefined, true);
    return this.http.put(url, fileContents).pipe(
      catchError(this.handleErrorObservable)
    )
  }

  getUserHomeFolder(): Observable<{ home: string }> {
    let url: string = ZoweZLUX.uriBroker.userInfoUri();
    return this.http.get(url).pipe(
      map((res: any) => res),
      catchError(this.handleErrorObservable)
    )
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

