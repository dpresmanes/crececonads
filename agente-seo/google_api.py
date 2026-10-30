"""Acceso a Search Console y Google Sheets con una cuenta de servicio."""
import json
import os
from urllib.parse import quote

import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/spreadsheets",
]


def _token():
    raw = os.environ.get("GOOGLE_SA_JSON")
    if not raw:
        return None
    creds = service_account.Credentials.from_service_account_info(json.loads(raw), scopes=SCOPES)
    creds.refresh(Request())
    return creds.token


class Google:
    def __init__(self):
        self.token = _token()

    @property
    def ok(self):
        return self.token is not None

    def _h(self):
        return {"Authorization": f"Bearer {self.token}"}

    # Search Console
    def gsc_query(self, site, start, end, dimension, limit=250):
        url = f"https://searchconsole.googleapis.com/webmasters/v3/sites/{quote(site, safe='')}/searchAnalytics/query"
        body = {"startDate": start, "endDate": end, "dimensions": [dimension], "rowLimit": limit}
        r = requests.post(url, headers=self._h(), json=body, timeout=60)
        r.raise_for_status()
        return r.json().get("rows", [])

    # Google Sheets
    def sheet_write(self, sheet_id, tab, rows):
        """Reemplaza el contenido de una pestaña."""
        base = f"https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values"
        todo = quote("'%s'!A1:Z5000" % tab, safe="")
        inicio = quote("'%s'!A1" % tab, safe="")
        requests.post(f"{base}/{todo}:clear", headers=self._h(), timeout=60).raise_for_status()
        r = requests.put(f"{base}/{inicio}", headers=self._h(),
                         params={"valueInputOption": "USER_ENTERED"}, json={"values": rows}, timeout=60)
        r.raise_for_status()

    def sheet_append(self, sheet_id, tab, rows):
        """Agrega filas al final de una pestaña."""
        base = f"https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values"
        inicio = quote("'%s'!A1" % tab, safe="")
        r = requests.post(f"{base}/{inicio}:append", headers=self._h(),
                          params={"valueInputOption": "USER_ENTERED", "insertDataOption": "INSERT_ROWS"},
                          json={"values": rows}, timeout=60)
        r.raise_for_status()
